import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * customers_sessions table — stores customer login sessions.
 *
 * This is the customers-collection equivalent of the users_sessions migration
 * (20260908_171500). The customers collection has `auth: {}`, so Payload's
 * Postgres adapter always left-joins customers_sessions when reading customer
 * docs — even at depth=0. Without this table, every GET /api/customers fails
 * with `relation "customers_sessions" does not exist` (PostgreSQL 42P01),
 * which Payload's REST layer swallows as a generic 500 "Something went wrong."
 *
 * The table was created by dev-mode schema-push locally but was never captured
 * in a production migration, so prod (which runs migrations only) was missing it.
 */
export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  // Use a DO block with exception handling to be safe against concurrent
  // static-generation workers that may try to run this migration at the
  // same time during `next build`. `CREATE TABLE IF NOT EXISTS` alone is
  // not sufficient — the associated pg_type entry can race between two
  // transactions, producing "duplicate key value violates unique
  // constraint pg_type_typname_nsp_index" even when the table doesn't
  // exist yet. Wrapping in a DO block catches that race.
  await payload.db.drizzle.execute(sql`
    DO $$
    BEGIN
      CREATE TABLE IF NOT EXISTS "customers_sessions" (
        "_order" integer NOT NULL,
        "_parent_id" integer NOT NULL REFERENCES "customers"("id") ON DELETE CASCADE,
        "id" varchar PRIMARY KEY NOT NULL,
        "created_at" timestamp(3) with time zone default now(),
        "expires_at" timestamp(3) with time zone NOT NULL
      );
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END $$;

    CREATE INDEX IF NOT EXISTS "customers_sessions_order_idx" ON "customers_sessions"("_order");
    CREATE INDEX IF NOT EXISTS "customers_sessions_parent_id_idx" ON "customers_sessions"("_parent_id");
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    DROP TABLE IF EXISTS "customers_sessions";
  `)
}