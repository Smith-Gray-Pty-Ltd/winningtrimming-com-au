import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_content_background" AS ENUM('default', 'teal');
  CREATE TYPE "public"."enum__pages_v_blocks_content_background" AS ENUM('default', 'teal');
  CREATE TYPE "public"."enum_projects_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_projects_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__projects_v_version_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum__projects_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_service_types_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_asset_types_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_businesses_pillar" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TYPE "public"."enum_businesses_type" AS ENUM('marina', 'shipwright', 'boatyard', 'yacht-club', 'sailing-club', 'chandlery', 'boat-ramp', 'slipway', 'mechanic', 'dealership', 'panel-beater', 'auto-electrician', 'hardware-supplier', 'steel-fabricator', 'machinery-dealer', 'hospitality-venue', 'property-manager', 'office-corporate', 'dealer', 'other');
  CREATE TYPE "public"."enum_businesses_relationship" AS ENUM('partner', 'customer', 'supplier', 'referrer', 'informational');
  CREATE TYPE "public"."enum_regions_pillars" AS ENUM('marine', 'automotive', 'caravan-and-rv', 'trade-and-industrial', 'commercial');
  CREATE TABLE IF NOT EXISTS "projects_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "projects_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "projects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"pillar" "enum_projects_pillar",
  	"summary" varchar,
  	"featured_image_id" integer,
  	"content" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"location" varchar,
  	"materials" varchar,
  	"completed_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_projects_status" DEFAULT 'draft'
  );
  
  CREATE TABLE IF NOT EXISTS "projects_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"service_types_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "_projects_v_version_gallery" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_projects_v_version_before_after" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"before_id" integer,
  	"after_id" integer,
  	"caption" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE IF NOT EXISTS "_projects_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_pillar" "enum__projects_v_version_pillar",
  	"version_summary" varchar,
  	"version_featured_image_id" integer,
  	"version_content" jsonb,
  	"version_meta_title" varchar,
  	"version_meta_image_id" integer,
  	"version_meta_description" varchar,
  	"version_location" varchar,
  	"version_materials" varchar,
  	"version_completed_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_slug" varchar,
  	"version_slug_lock" boolean DEFAULT true,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__projects_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE IF NOT EXISTS "_projects_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"service_types_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "service_types_content_key_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"feature" varchar NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "service_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"pillar" "enum_service_types_pillar" NOT NULL,
  	"intro" varchar,
  	"content_body" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "asset_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"pillar" "enum_asset_types_pillar" NOT NULL,
  	"singular" varchar,
  	"intro" varchar,
  	"hero_image_id" integer,
  	"content_body" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "asset_types_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"service_types_id" integer
  );
  
  CREATE TABLE IF NOT EXISTS "businesses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"pillar" "enum_businesses_pillar" NOT NULL,
  	"type" "enum_businesses_type",
  	"relationship" "enum_businesses_relationship" DEFAULT 'informational',
  	"region_id" integer NOT NULL,
  	"suburb" varchar,
  	"description" varchar,
  	"website" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "regions_pillars" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_regions_pillars",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "regions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"content_body" jsonb,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS "suburbs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"region_id" integer NOT NULL,
  	"postcode" numeric,
  	"intro" varchar,
  	"meta_title" varchar,
  	"meta_image_id" integer,
  	"meta_description" varchar,
  	"slug" varchar,
  	"slug_lock" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_content_columns" ADD COLUMN "image_id" integer;
  ALTER TABLE "pages_blocks_content" ADD COLUMN "background" "enum_pages_blocks_content_background" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_content_columns" ADD COLUMN "image_id" integer;
  ALTER TABLE "_pages_v_blocks_content" ADD COLUMN "background" "enum__pages_v_blocks_content_background" DEFAULT 'default';
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "projects_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "service_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "asset_types_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "businesses_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "regions_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "suburbs_id" integer;
  DO $$ BEGIN
   ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_gallery" ADD CONSTRAINT "projects_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_before_after" ADD CONSTRAINT "projects_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects" ADD CONSTRAINT "projects_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects" ADD CONSTRAINT "projects_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "projects_rels" ADD CONSTRAINT "projects_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_version_gallery" ADD CONSTRAINT "_projects_v_version_gallery_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_before_id_media_id_fk" FOREIGN KEY ("before_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_after_id_media_id_fk" FOREIGN KEY ("after_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_version_before_after" ADD CONSTRAINT "_projects_v_version_before_after_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_parent_id_projects_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_featured_image_id_media_id_fk" FOREIGN KEY ("version_featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v" ADD CONSTRAINT "_projects_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_projects_v_rels" ADD CONSTRAINT "_projects_v_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "service_types_content_key_features" ADD CONSTRAINT "service_types_content_key_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "service_types" ADD CONSTRAINT "service_types_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "asset_types" ADD CONSTRAINT "asset_types_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "asset_types" ADD CONSTRAINT "asset_types_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "asset_types_rels" ADD CONSTRAINT "asset_types_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."asset_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "asset_types_rels" ADD CONSTRAINT "asset_types_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "businesses" ADD CONSTRAINT "businesses_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "businesses" ADD CONSTRAINT "businesses_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "regions_pillars" ADD CONSTRAINT "regions_pillars_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "regions" ADD CONSTRAINT "regions_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "suburbs" ADD CONSTRAINT "suburbs_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "suburbs" ADD CONSTRAINT "suburbs_meta_image_id_media_id_fk" FOREIGN KEY ("meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "projects_gallery_order_idx" ON "projects_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "projects_gallery_parent_id_idx" ON "projects_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "projects_gallery_image_idx" ON "projects_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "projects_before_after_order_idx" ON "projects_before_after" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "projects_before_after_parent_id_idx" ON "projects_before_after" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "projects_before_after_before_idx" ON "projects_before_after" USING btree ("before_id");
  CREATE INDEX IF NOT EXISTS "projects_before_after_after_idx" ON "projects_before_after" USING btree ("after_id");
  CREATE INDEX IF NOT EXISTS "projects_featured_image_idx" ON "projects" USING btree ("featured_image_id");
  CREATE INDEX IF NOT EXISTS "projects_meta_meta_image_idx" ON "projects" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "projects_slug_idx" ON "projects" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "projects_updated_at_idx" ON "projects" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "projects_created_at_idx" ON "projects" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "projects__status_idx" ON "projects" USING btree ("_status");
  CREATE INDEX IF NOT EXISTS "projects_rels_order_idx" ON "projects_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "projects_rels_parent_idx" ON "projects_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "projects_rels_path_idx" ON "projects_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "projects_rels_service_types_id_idx" ON "projects_rels" USING btree ("service_types_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_gallery_order_idx" ON "_projects_v_version_gallery" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_gallery_parent_id_idx" ON "_projects_v_version_gallery" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_gallery_image_idx" ON "_projects_v_version_gallery" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_before_after_order_idx" ON "_projects_v_version_before_after" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_before_after_parent_id_idx" ON "_projects_v_version_before_after" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_before_after_before_idx" ON "_projects_v_version_before_after" USING btree ("before_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_before_after_after_idx" ON "_projects_v_version_before_after" USING btree ("after_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_parent_idx" ON "_projects_v" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_featured_image_idx" ON "_projects_v" USING btree ("version_featured_image_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_meta_version_meta_image_idx" ON "_projects_v" USING btree ("version_meta_image_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_slug_idx" ON "_projects_v" USING btree ("version_slug");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_updated_at_idx" ON "_projects_v" USING btree ("version_updated_at");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version_created_at_idx" ON "_projects_v" USING btree ("version_created_at");
  CREATE INDEX IF NOT EXISTS "_projects_v_version_version__status_idx" ON "_projects_v" USING btree ("version__status");
  CREATE INDEX IF NOT EXISTS "_projects_v_created_at_idx" ON "_projects_v" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "_projects_v_updated_at_idx" ON "_projects_v" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "_projects_v_latest_idx" ON "_projects_v" USING btree ("latest");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_order_idx" ON "_projects_v_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_parent_idx" ON "_projects_v_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_path_idx" ON "_projects_v_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "_projects_v_rels_service_types_id_idx" ON "_projects_v_rels" USING btree ("service_types_id");
  CREATE INDEX IF NOT EXISTS "service_types_content_key_features_order_idx" ON "service_types_content_key_features" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "service_types_content_key_features_parent_id_idx" ON "service_types_content_key_features" USING btree ("_parent_id");
  CREATE INDEX IF NOT EXISTS "service_types_meta_meta_image_idx" ON "service_types" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "service_types_slug_idx" ON "service_types" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "service_types_updated_at_idx" ON "service_types" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "service_types_created_at_idx" ON "service_types" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "asset_types_hero_image_idx" ON "asset_types" USING btree ("hero_image_id");
  CREATE INDEX IF NOT EXISTS "asset_types_meta_meta_image_idx" ON "asset_types" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "asset_types_slug_idx" ON "asset_types" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "asset_types_updated_at_idx" ON "asset_types" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "asset_types_created_at_idx" ON "asset_types" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "asset_types_rels_order_idx" ON "asset_types_rels" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "asset_types_rels_parent_idx" ON "asset_types_rels" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "asset_types_rels_path_idx" ON "asset_types_rels" USING btree ("path");
  CREATE INDEX IF NOT EXISTS "asset_types_rels_service_types_id_idx" ON "asset_types_rels" USING btree ("service_types_id");
  CREATE INDEX IF NOT EXISTS "businesses_region_idx" ON "businesses" USING btree ("region_id");
  CREATE INDEX IF NOT EXISTS "businesses_meta_meta_image_idx" ON "businesses" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "businesses_slug_idx" ON "businesses" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "businesses_updated_at_idx" ON "businesses" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "businesses_created_at_idx" ON "businesses" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "regions_pillars_order_idx" ON "regions_pillars" USING btree ("order");
  CREATE INDEX IF NOT EXISTS "regions_pillars_parent_idx" ON "regions_pillars" USING btree ("parent_id");
  CREATE INDEX IF NOT EXISTS "regions_meta_meta_image_idx" ON "regions" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "regions_slug_idx" ON "regions" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "regions_updated_at_idx" ON "regions" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "regions_created_at_idx" ON "regions" USING btree ("created_at");
  CREATE INDEX IF NOT EXISTS "suburbs_region_idx" ON "suburbs" USING btree ("region_id");
  CREATE INDEX IF NOT EXISTS "suburbs_meta_meta_image_idx" ON "suburbs" USING btree ("meta_image_id");
  CREATE INDEX IF NOT EXISTS "suburbs_slug_idx" ON "suburbs" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "suburbs_updated_at_idx" ON "suburbs" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "suburbs_created_at_idx" ON "suburbs" USING btree ("created_at");
  DO $$ BEGIN
   ALTER TABLE "pages_blocks_content_columns" ADD CONSTRAINT "pages_blocks_content_columns_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "_pages_v_blocks_content_columns" ADD CONSTRAINT "_pages_v_blocks_content_columns_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_projects_fk" FOREIGN KEY ("projects_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_asset_types_fk" FOREIGN KEY ("asset_types_id") REFERENCES "public"."asset_types"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_businesses_fk" FOREIGN KEY ("businesses_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_regions_fk" FOREIGN KEY ("regions_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  DO $$ BEGIN
   ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_suburbs_fk" FOREIGN KEY ("suburbs_id") REFERENCES "public"."suburbs"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "pages_blocks_content_columns_image_idx" ON "pages_blocks_content_columns" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "_pages_v_blocks_content_columns_image_idx" ON "_pages_v_blocks_content_columns" USING btree ("image_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_projects_id_idx" ON "payload_locked_documents_rels" USING btree ("projects_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_service_types_id_idx" ON "payload_locked_documents_rels" USING btree ("service_types_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_asset_types_id_idx" ON "payload_locked_documents_rels" USING btree ("asset_types_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_businesses_id_idx" ON "payload_locked_documents_rels" USING btree ("businesses_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_regions_id_idx" ON "payload_locked_documents_rels" USING btree ("regions_id");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_suburbs_id_idx" ON "payload_locked_documents_rels" USING btree ("suburbs_id");
  ALTER TABLE "media" DROP COLUMN IF EXISTS "prefix";`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "projects_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "projects_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_gallery" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_version_before_after" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_projects_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "service_types_content_key_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "service_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "asset_types" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "asset_types_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "businesses" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "regions" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "suburbs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "projects_gallery" CASCADE;
  DROP TABLE "projects_before_after" CASCADE;
  DROP TABLE "projects" CASCADE;
  DROP TABLE "projects_rels" CASCADE;
  DROP TABLE "_projects_v_version_gallery" CASCADE;
  DROP TABLE "_projects_v_version_before_after" CASCADE;
  DROP TABLE "_projects_v" CASCADE;
  DROP TABLE "_projects_v_rels" CASCADE;
  DROP TABLE "service_types_content_key_features" CASCADE;
  DROP TABLE "service_types" CASCADE;
  DROP TABLE "asset_types" CASCADE;
  DROP TABLE "asset_types_rels" CASCADE;
  DROP TABLE "businesses" CASCADE;
  DROP TABLE "regions_pillars" CASCADE;
  DROP TABLE "regions" CASCADE;
  DROP TABLE "suburbs" CASCADE;
  ALTER TABLE "pages_blocks_content_columns" DROP CONSTRAINT "pages_blocks_content_columns_image_id_media_id_fk";
  
  ALTER TABLE "_pages_v_blocks_content_columns" DROP CONSTRAINT "_pages_v_blocks_content_columns_image_id_media_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_projects_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_asset_types_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_businesses_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_regions_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_suburbs_fk";
  
  DROP INDEX IF EXISTS "pages_blocks_content_columns_image_idx";
  DROP INDEX IF EXISTS "_pages_v_blocks_content_columns_image_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_projects_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_service_types_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_asset_types_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_businesses_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_regions_id_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_suburbs_id_idx";
  ALTER TABLE "media" ADD COLUMN "prefix" varchar DEFAULT 'media';
  ALTER TABLE "pages_blocks_content_columns" DROP COLUMN IF EXISTS "image_id";
  ALTER TABLE "pages_blocks_content" DROP COLUMN IF EXISTS "background";
  ALTER TABLE "_pages_v_blocks_content_columns" DROP COLUMN IF EXISTS "image_id";
  ALTER TABLE "_pages_v_blocks_content" DROP COLUMN IF EXISTS "background";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "projects_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "service_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "asset_types_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "businesses_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "regions_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "suburbs_id";
  DROP TYPE "public"."enum_pages_blocks_content_background";
  DROP TYPE "public"."enum__pages_v_blocks_content_background";
  DROP TYPE "public"."enum_projects_pillar";
  DROP TYPE "public"."enum_projects_status";
  DROP TYPE "public"."enum__projects_v_version_pillar";
  DROP TYPE "public"."enum__projects_v_version_status";
  DROP TYPE "public"."enum_service_types_pillar";
  DROP TYPE "public"."enum_asset_types_pillar";
  DROP TYPE "public"."enum_businesses_pillar";
  DROP TYPE "public"."enum_businesses_type";
  DROP TYPE "public"."enum_businesses_relationship";
  DROP TYPE "public"."enum_regions_pillars";`)
}
