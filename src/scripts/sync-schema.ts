/**
 * One-off script: initialise Payload so the Postgres schema sync runs
 * and creates/updates all tables. Run this BEFORE `next build` when
 * building against a fresh database.
 *
 * Usage: npx tsx src/scripts/sync-schema.ts
 */
import { getPayload } from 'payload'
import configPromise from '@payload-config'

async function main() {
  console.log('Initialising Payload (schema sync)...')
  const payload = await getPayload({ config: configPromise })
  console.log('Schema sync complete.')
  await payload.destroy()
  process.exit(0)
}

main().catch((err) => {
  console.error('Schema sync failed:', err)
  process.exit(1)
})