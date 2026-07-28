import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   CREATE TYPE "public"."enum_service_types_work_type" AS ENUM('custom', 'repair');
  ALTER TABLE "service_types" ADD COLUMN "work_type" "enum_service_types_work_type" DEFAULT 'custom';`)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
   ALTER TABLE "service_types" DROP COLUMN IF EXISTS "work_type";
  DROP TYPE "public"."enum_service_types_work_type";`)
}
