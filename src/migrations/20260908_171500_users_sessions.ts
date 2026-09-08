import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * users_sessions table — stores user login sessions.
 * This table was originally created by Payload's dev-mode auto-push
 * but was never captured in a production migration. When the DB was
 * recreated during the first GitHub Actions deploy, the table was
 * missing, causing admin login to fail.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    CREATE TABLE IF NOT EXISTS "users_sessions" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "id" varchar PRIMARY KEY NOT NULL,
      "created_at" timestamp(3) with time zone default now(),
      "expires_at" timestamp(3) with time zone
    );

    CREATE INDEX IF NOT EXISTS "users_sessions_order_idx" ON "users_sessions"("_order");
    CREATE INDEX IF NOT EXISTS "users_sessions_parent_id_idx" ON "users_sessions"("_parent_id");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "users_sessions";
  `)
}