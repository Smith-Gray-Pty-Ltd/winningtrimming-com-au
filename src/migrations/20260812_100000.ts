import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Quotes collection + Bookings.quote relationship.
 * Quotes are customer-facing quote requests. When accepted, staff convert
 * them to Bookings (which enter the job pipeline).
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   -- ── Enums ──
   CREATE TYPE "public"."enum_quotes_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
   CREATE TYPE "public"."enum_quotes_status" AS ENUM('requested', 'reviewing', 'quoted', 'accepted', 'declined', 'expired');
   CREATE TYPE "public"."enum_quotes_next_action" AS ENUM('send_quote', 'send_quote_reminder', 'check_quote_accepted', 'expire_quote', 'convert_to_booking');

   -- ── Quotes table ──
   CREATE TABLE IF NOT EXISTS "quotes" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"title" varchar,
   	"customer_id" integer,
   	"pillar" "enum_quotes_pillar",
   	"subject" varchar,
   	"subject_type_id" integer,
   	"subject_details" varchar,
   	"description" varchar,
   	"location" varchar,
   	"preferred_dates" varchar,
   	"quoted_amount" numeric,
   	"deposit_amount" numeric,
   	"quote_notes" varchar,
   	"status" "enum_quotes_status" DEFAULT 'requested',
   	"booking_id" integer,
   	"next_action" "enum_quotes_next_action",
   	"next_action_due" timestamp(3) with time zone,
   	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
   	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE TABLE IF NOT EXISTS "quotes_subject_photos" (
   	"_order" integer NOT NULL,
   	"_parent_id" integer NOT NULL,
   	"id" varchar PRIMARY KEY NOT NULL,
   	"image_id" integer,
   	"caption" varchar
   );

   CREATE TABLE IF NOT EXISTS "quotes_rels" (
   	"id" serial PRIMARY KEY NOT NULL,
   	"order" integer,
   	"parent_id" integer NOT NULL,
   	"path" varchar NOT NULL,
   	"service_types_id" integer
   );

   -- ── Add quote_id to bookings ──
   ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "quote_id" integer;

   -- ── Payload internal tables ──
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "quotes_id" integer;
   ALTER TABLE "payload_preferences_rels" ADD COLUMN IF NOT EXISTS "quotes_id" integer;

   -- ── Indexes ──
   CREATE INDEX IF NOT EXISTS "quotes_status_idx" ON "quotes" USING btree ("status");
   CREATE INDEX IF NOT EXISTS "quotes_customer_id_idx" ON "quotes" USING btree ("customer_id");
   CREATE INDEX IF NOT EXISTS "quotes_next_action_due_idx" ON "quotes" USING btree ("next_action_due");
   CREATE INDEX IF NOT EXISTS "quotes_booking_id_idx" ON "quotes" USING btree ("booking_id");
   CREATE INDEX IF NOT EXISTS "quotes_subject_type_idx" ON "quotes" USING btree ("subject_type_id");
   CREATE INDEX IF NOT EXISTS "quotes_updated_at_idx" ON "quotes" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "quotes_created_at_idx" ON "quotes" USING btree ("created_at");
   CREATE INDEX IF NOT EXISTS "quotes_subject_photos_order_idx" ON "quotes_subject_photos" USING btree ("_order");
   CREATE INDEX IF NOT EXISTS "quotes_subject_photos_parent_id_idx" ON "quotes_subject_photos" USING btree ("_parent_id");
   CREATE INDEX IF NOT EXISTS "quotes_subject_photos_image_idx" ON "quotes_subject_photos" USING btree ("image_id");
   CREATE INDEX IF NOT EXISTS "quotes_rels_order_idx" ON "quotes_rels" USING btree ("order");
   CREATE INDEX IF NOT EXISTS "quotes_rels_parent_idx" ON "quotes_rels" USING btree ("parent_id");
   CREATE INDEX IF NOT EXISTS "quotes_rels_path_idx" ON "quotes_rels" USING btree ("path");
   CREATE INDEX IF NOT EXISTS "quotes_rels_service_types_id_idx" ON "quotes_rels" USING btree ("service_types_id");
   CREATE INDEX IF NOT EXISTS "bookings_quote_id_idx" ON "bookings" USING btree ("quote_id");
   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_quotes_id_idx" ON "payload_locked_documents_rels" USING btree ("quotes_id");
   CREATE INDEX IF NOT EXISTS "payload_preferences_rels_quotes_id_idx" ON "payload_preferences_rels" USING btree ("quotes_id");

   -- ── Foreign keys ──
   DO $$ BEGIN
    ALTER TABLE "quotes" ADD CONSTRAINT "quotes_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes" ADD CONSTRAINT "quotes_subject_type_id_asset_types_id_fk" FOREIGN KEY ("subject_type_id") REFERENCES "public"."asset_types"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes" ADD CONSTRAINT "quotes_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes_subject_photos" ADD CONSTRAINT "quotes_subject_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes_subject_photos" ADD CONSTRAINT "quotes_subject_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes_rels" ADD CONSTRAINT "quotes_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "quotes_rels" ADD CONSTRAINT "quotes_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quote_id_quotes_id_fk" FOREIGN KEY ("quote_id") REFERENCES "public"."quotes"("id") ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;

   DO $$ BEGIN
    ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_quotes_fk" FOREIGN KEY ("quotes_id") REFERENCES "public"."quotes"("id") ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null;
   END $$;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   DROP TABLE IF EXISTS "quotes_rels";
   DROP TABLE IF EXISTS "quotes_subject_photos";
   DROP TABLE IF EXISTS "quotes";
   ALTER TABLE "bookings" DROP COLUMN IF EXISTS "quote_id";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "quotes_id";
   ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "quotes_id";
   DROP TYPE IF EXISTS "public"."enum_quotes_pillar";
   DROP TYPE IF EXISTS "public"."enum_quotes_status";
   DROP TYPE IF EXISTS "public"."enum_quotes_next_action";
  `)
}