import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds api_key and api_key_index columns to the users table to support
 * Payload's built-in API key authentication (useAPIKey: true on the Users
 * collection). The api_key column stores the raw key (shown once in the
 * admin panel); api_key_index stores an HMAC-SHA256 hash for fast lookups
 * during authentication.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "enable_a_p_i_key" boolean DEFAULT false;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key" varchar;
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "api_key_index" varchar;
    EXCEPTION WHEN duplicate_column THEN
      NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "users_api_key_index_idx" ON "users"("api_key_index");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP INDEX IF EXISTS "users_api_key_index_idx";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "api_key";
    ALTER TABLE "users" DROP COLUMN IF EXISTS "api_key_index";
  `)
}