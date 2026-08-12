import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_customers_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_customers_address_state" AS ENUM('NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'ACT', 'NT');
  CREATE TYPE "public"."enum_bookings_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_bookings_adjustments_type" AS ENUM('additional', 'discount');
  CREATE TYPE "public"."enum_bookings_status" AS ENUM('new', 'quoted', 'deposit-invoiced', 'overdue-deposit', 'deposit-paid', 'in-progress', 'completed', 'final-invoiced', 'overdue-final', 'final-paid', 'closed', 'declined', 'cancelled');
  CREATE TYPE "public"."enum_bookings_previous_status" AS ENUM('new', 'quoted', 'deposit-invoiced', 'overdue-deposit', 'deposit-paid', 'in-progress', 'completed', 'final-invoiced', 'overdue-final', 'final-paid', 'closed', 'declined', 'cancelled');
  CREATE TYPE "public"."enum_bookings_next_action" AS ENUM('send_quote', 'send_deposit_invoice', 'check_deposit_paid', 'send_deposit_reminder', 'schedule_work', 'send_final_invoice', 'check_final_paid', 'send_final_reminder', 'create_portfolio_entry', 'manual_review');
  CREATE TYPE "public"."enum_invoices_type" AS ENUM('deposit', 'adjustment', 'final');
  CREATE TYPE "public"."enum_invoices_status" AS ENUM('draft', 'sent', 'paid', 'overdue', 'void');
  CREATE TYPE "public"."enum_invoices_payment_method" AS ENUM('bank_transfer', 'card', 'cash', 'cheque', 'other');
  CREATE TYPE "public"."enum_events_event_type" AS ENUM('booking_created', 'status_changed', 'quote_issued', 'quote_declined', 'deposit_invoice_sent', 'deposit_paid', 'deposit_reminder_sent', 'work_scheduled', 'work_completed', 'final_invoice_sent', 'final_paid', 'final_reminder_sent', 'booking_closed', 'booking_cancelled', 'invoice_created', 'invoice_status_synced', 'agent_action_executed', 'agent_error', 'manual_review_required');
  CREATE TYPE "public"."enum_events_actor" AS ENUM('staff', 'customer', 'agent', 'system', 'xero_webhook');
  CREATE TABLE IF NOT EXISTS "customers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"phone" varchar,
  	"company" varchar,
  	"pillar" "enum_customers_pillar",
  	"address_street" varchar,
  	"address_suburb" varchar,
  	"address_state" "enum_customers_address_state",
  	"address_postcode" varchar,
  	"suburb_ref_id" integer,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"enable_a_p_i_key" boolean,
  	"api_key" varchar,
  	"api_key_index" varchar,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE IF NOT EXISTS "bookings_subject_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "bookings_adjustments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"description" varchar NOT NULL,
  	"amount" numeric NOT NULL,
  	"type" "enum_bookings_adjustments_type" DEFAULT 'additional'
  );
  
  CREATE TABLE IF NOT EXISTS "bookings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"customer_id" integer NOT NULL,
  	"pillar" "enum_bookings_pillar" NOT NULL,
  	"subject" varchar NOT NULL,
  	"subject_type_id" integer,
  	"subject_details" varchar,
  	"description" varchar NOT NULL,
  	"location" varchar,
  	"preferred_dates" varchar,
  	"quoted_amount" numeric,
  	"deposit_amount" numeric,
  	"status" "enum_bookings_status" DEFAULT 'new' NOT NULL,
  	"previous_status" "enum_bookings_previous_status",
  	"next_action" "enum_bookings_next_action",
  	"next_action_due" timestamp(3) with time zone,
  	"last_agent_run" timestamp(3) with time zone,
  	"agent_error" varchar,
  	"project_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "bookings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"service_types_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "invoices" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"booking_id" integer NOT NULL,
  	"type" "enum_invoices_type" NOT NULL,
  	"amount" numeric NOT NULL,
  	"due_date" timestamp(3) with time zone,
  	"status" "enum_invoices_status" DEFAULT 'draft' NOT NULL,
  	"paid_at" timestamp(3) with time zone,
  	"payment_method" "enum_invoices_payment_method",
  	"xero_invoice_id" varchar,
  	"xero_invoice_number" varchar,
  	"xero_url" varchar,
  	"adjustment_description" varchar,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "events" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"event_type" "enum_events_event_type" NOT NULL,
  	"booking_id" integer,
  	"invoice_id" integer,
  	"actor" "enum_events_actor" DEFAULT 'system' NOT NULL,
  	"actor_id" varchar,
  	"description" varchar,
  	"metadata" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "customers_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "bookings_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "invoices_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "events_id" integer;
  ALTER TABLE "payload_preferences_rels" ADD COLUMN "customers_id" integer;
  DO $$ BEGIN
   ALTER TABLE "customers" ADD CONSTRAINT "customers_suburb_ref_id_suburbs_id_fk" FOREIGN KEY ("suburb_ref_id") REFERENCES "public"."suburbs"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings_subject_photos" ADD CONSTRAINT "bookings_subject_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings_subject_photos" ADD CONSTRAINT "bookings_subject_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings_adjustments" ADD CONSTRAINT "bookings_adjustments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings" ADD CONSTRAINT "bookings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings" ADD CONSTRAINT "bookings_subject_type_id_asset_types_id_fk" FOREIGN KEY ("subject_type_id") REFERENCES "public"."asset_types"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings" ADD CONSTRAINT "bookings_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "bookings_rels" ADD CONSTRAINT "bookings_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "events" ADD CONSTRAINT "events_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "customers_suburb_ref_idx" ON "customers" USING btree ("suburb_ref_id");
  CREATE INDEX IF NOT EXISTS "customers_updated_at_idx" ON "customers" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "customers_created_at_idx" ON "customers" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "customers_email_idx" ON "customers" USING btree ("email");
  CREATE INDEX IF NOT EXISTS "bookings_subject_photos_order_idx" ON "bookings_subject_photos" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "bookings_subject_photos_parent_id_idx" ON "bookings_subject_photos" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "bookings_subject_photos_image_idx" ON "bookings_subject_photos" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "bookings_adjustments_order_idx" ON "bookings_adjustments" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "bookings_adjustments_parent_id_idx" ON "bookings_adjustments" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "bookings_customer_idx" ON "bookings" USING btree ("customer_id");
  CREATE INDEX IF NOT EXISTS "bookings_subject_type_idx" ON "bookings" USING btree ("subject_type_id");
  CREATE INDEX IF NOT EXISTS "bookings_project_idx" ON "bookings" USING btree ("project_id");
  CREATE INDEX IF NOT EXISTS "bookings_updated_at_idx" ON "bookings" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "bookings_created_at_idx" ON "bookings" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "bookings_rels_order_idx" ON "bookings_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "bookings_rels_parent_idx" ON "bookings_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "bookings_rels_path_idx" ON "bookings_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "bookings_rels_service_types_id_idx" ON "bookings_rels" USING btree ("service_types_id");
  CREATE INDEX IF NOT EXISTS "invoices_booking_idx" ON "invoices" USING btree ("booking_id");
  CREATE INDEX IF NOT EXISTS "invoices_xero_invoice_id_idx" ON "invoices" USING btree ("xero_invoice_id");
  CREATE INDEX IF NOT EXISTS "invoices_updated_at_idx" ON "invoices" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "invoices_created_at_idx" ON "invoices" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "events_booking_idx" ON "events" USING btree ("booking_id");
  CREATE INDEX IF NOT EXISTS "events_invoice_idx" ON "events" USING btree ("invoice_id");
  CREATE INDEX IF NOT EXISTS "events_updated_at_idx" ON "events" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "events_created_at_idx" ON "events" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bookings_fk" FOREIGN KEY ("bookings_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_invoices_fk" FOREIGN KEY ("invoices_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_events_fk" FOREIGN KEY ("events_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_customers_fk" FOREIGN KEY ("customers_id") REFERENCES "public"."customers"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_customers_id_idx" ON "payload_locked_documents_rels" USING btree ("customers_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_bookings_id_idx" ON "payload_locked_documents_rels" USING btree ("bookings_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_invoices_id_idx" ON "payload_locked_documents_rels" USING btree ("invoices_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_events_id_idx" ON "payload_locked_documents_rels" USING btree ("events_id");
  CREATE INDEX IF NOT EXISTS "payload_preferences_rels_customers_id_idx" ON "payload_preferences_rels" USING btree ("customers_id");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "customers" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookings_subject_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookings_adjustments" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookings" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "bookings_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "invoices" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "events" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "customers" CASCADE;
  DROP TABLE "bookings_subject_photos" CASCADE;
  DROP TABLE "bookings_adjustments" CASCADE;
  DROP TABLE "bookings" CASCADE;
  DROP TABLE "bookings_rels" CASCADE;
  DROP TABLE "invoices" CASCADE;
  DROP TABLE "events" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_customers_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_bookings_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_invoices_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_events_fk";
  
  ALTER TABLE "payload_preferences_rels" DROP CONSTRAINT "payload_preferences_rels_customers_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_customers_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_bookings_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_invoices_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_events_id_idx";
  DROP INDEX IF EXISTS "payload_preferences_rels_customers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "customers_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "bookings_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "invoices_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "events_id";
  ALTER TABLE "payload_preferences_rels" DROP COLUMN IF EXISTS "customers_id";
  DROP TYPE "public"."enum_customers_pillar";
  DROP TYPE "public"."enum_customers_address_state";
  DROP TYPE "public"."enum_bookings_pillar";
  DROP TYPE "public"."enum_bookings_adjustments_type";
  DROP TYPE "public"."enum_bookings_status";
  DROP TYPE "public"."enum_bookings_previous_status";
  DROP TYPE "public"."enum_bookings_next_action";
  DROP TYPE "public"."enum_invoices_type";
  DROP TYPE "public"."enum_invoices_status";
  DROP TYPE "public"."enum_invoices_payment_method";
  DROP TYPE "public"."enum_events_event_type";
  DROP TYPE "public"."enum_events_actor";`)
}
