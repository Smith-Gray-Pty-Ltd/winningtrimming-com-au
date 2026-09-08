import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Home Page global — admin-configurable pillar card images.
 * Uses 5 named upload fields (media pickers) instead of an array,
 * so the admin sees 5 clearly-labelled image pickers in a tab.
 *
 * Fields stored as columns on home_page: marine_image_id, automotive_image_id,
 * caravan_rv_image_id, trade_industrial_image_id, commercial_image_id.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "home_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "updated_at" timestamp(3) with time zone default now(),
      "created_at" timestamp(3) with time zone default now()
    );

    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "marine_image_id" integer;
    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "automotive_image_id" integer;
    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "caravan_rv_image_id" integer;
    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "trade_industrial_image_id" integer;
    ALTER TABLE "home_page" ADD COLUMN IF NOT EXISTS "commercial_image_id" integer;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "marine_image_id";
    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "automotive_image_id";
    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "caravan_rv_image_id";
    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "trade_industrial_image_id";
    ALTER TABLE "home_page" DROP COLUMN IF EXISTS "commercial_image_id";
    DROP TABLE IF EXISTS "home_page";
  `)
}