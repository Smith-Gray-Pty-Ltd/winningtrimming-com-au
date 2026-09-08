/**
 * Run the seed from a standalone script (not via HTTP route).
 * This ensures media files are properly written to disk.
 *
 * Usage: npx tsx src/scripts/run-seed.ts
 */
import { getPayload } from 'payload'
import config from '@payload-config'
import { seed } from '../endpoints/seed/index'

async function main() {
  console.log('Initialising Payload...')
  const payload = await getPayload({ config })
  console.log('Running seed...')
  await seed({ payload, req: { user: { id: 1 } } as any })
  console.log('Seed complete.')
  await payload.destroy()
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})