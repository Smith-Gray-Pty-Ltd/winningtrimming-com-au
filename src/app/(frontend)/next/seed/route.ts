import { getPayload } from 'payload'
import { seed } from '@/endpoints/seed'
import config from '@payload-config'
import { headers } from 'next/headers'

const payloadToken = 'payload-token'
export const maxDuration = 60 // This function can run for a maximum of 60 seconds

export async function POST(
  req: Request & {
    cookies: {
      get: (name: string) => {
        value: string
      }
    }
  },
): Promise<Response> {
  const payload = await getPayload({ config })
  const requestHeaders = await headers()

  // Authenticate by passing request headers
  const { user } = await payload.auth({ headers: requestHeaders })

  if (!user) {
    return new Response('Action forbidden.', { status: 403 })
  }

  try {
    // Pass a lightweight req with the user but no transaction — avoids
    // cascading transaction-abort errors when clearing collections.
    await seed({ payload, req: { user } as any })

    return Response.json({ success: true })
  } catch (err) {
    payload.logger.error(err)
    return new Response('Error seeding data.')
  }
}
