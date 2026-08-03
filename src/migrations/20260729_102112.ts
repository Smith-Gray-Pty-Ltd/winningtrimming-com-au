import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "service_types" ADD COLUMN "hero_image_id" integer;
  DO $$ BEGIN
   ALTER TABLE "service_types" ADD CONSTRAINT "service_types_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION
   WHEN duplicate_object THEN null;
  END $$;
  
  CREATE INDEX IF NOT EXISTS "service_types_hero_image_idx" ON "service_types" USING btree ("hero_image_id");`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "service_types" DROP CONSTRAINT "service_types_hero_image_id_media_id_fk";
  
  DROP INDEX IF EXISTS "service_types_hero_image_idx";
  ALTER TABLE "service_types" DROP COLUMN IF EXISTS "hero_image_id";`)
}
