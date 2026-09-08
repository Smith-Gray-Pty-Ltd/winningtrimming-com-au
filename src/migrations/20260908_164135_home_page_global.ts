import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Home Page global — admin-configurable pillar card images.
 * Stores one row per pillar with an optional media relationship.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "home_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "pillars" jsonb
    );

    CREATE TABLE IF NOT EXISTS "home_page_pillars" (
      "id" serial PRIMARY KEY NOT NULL,
      "pillar" varchar,
      "image_id" integer,
      "home_page_id" integer REFERENCES "home_page"("id") ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS "home_page_pillars_home_page_id_idx" ON "home_page_pillars"("home_page_id");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "home_page_pillars";
    DROP TABLE IF EXISTS "home_page";
  `)
}