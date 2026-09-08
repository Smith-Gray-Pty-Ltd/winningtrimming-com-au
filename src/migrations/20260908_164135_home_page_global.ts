import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Home Page global — admin-configurable pillar card images.
 * Stores one row per pillar with an optional media relationship.
 *
 * The table structure must match what Payload's drizzle adapter expects:
 *  - Global table: id (serial PK), pillars (jsonb for the array metadata),
 *    updated_at, created_at
 *  - Array table: _order (int), _parent_id (int FK to global), id (varchar PK),
 *    pillar (varchar), image_id (int)
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "home_page" (
      "id" serial PRIMARY KEY NOT NULL,
      "pillars" jsonb,
      "updated_at" timestamp(3) with time zone default now(),
      "created_at" timestamp(3) with time zone default now()
    );

    CREATE TABLE IF NOT EXISTS "home_page_pillars" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "home_page"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY NOT NULL,
      "pillar" varchar,
      "image_id" integer
    );

    CREATE INDEX IF NOT EXISTS "home_page_pillars_order_idx" ON "home_page_pillars"("_order");
    CREATE INDEX IF NOT EXISTS "home_page_pillars_parent_id_idx" ON "home_page_pillars"("_parent_id");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "home_page_pillars";
    DROP TABLE IF EXISTS "home_page";
  `)
}