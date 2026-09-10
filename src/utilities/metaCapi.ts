import crypto from 'crypto'

/**
 * Meta Conversions API (CAPI) — server-side event sender.
 *
 * Sends conversion events straight to the Meta pixel from the server so they
 * are not lost to ad-blockers, cookie limits or iOS privacy. Runs alongside the
 * browser pixel; both must use the SAME event_id so Meta de-duplicates.
 *
 * Env:
 *   NEXT_PUBLIC_META_PIXEL_ID  – pixel/dataset id (already used by the browser pixel)
 *   META_CAPI_TOKEN            – dataset access token (Events Manager → Settings → Generate access token)
 *   META_CAPI_TEST_CODE        – optional; routes events to the Test Events tab only
 *
 * Disabled (no-op) unless pixel id + token are set, so it is safe to deploy early.
 */

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || ''
const TOKEN = process.env.META_CAPI_TOKEN || ''
const TEST_CODE = process.env.META_CAPI_TEST_CODE || ''
/** Standard event name. The dataset's Events Manager setup requires `LeadSubmitted`;
 *  override with META_CAPI_EVENT_NAME (must match the browser pixel event name). */
const EVENT_NAME = process.env.META_CAPI_EVENT_NAME || 'LeadSubmitted'
const GRAPH_VERSION = 'v21.0'

function sha256(value?: string | null): string | undefined {
  if (!value) return undefined
  const v = value.trim().toLowerCase()
  if (!v) return undefined
  return crypto.createHash('sha256').update(v).digest('hex')
}

/** Phone numbers must be hashed as digits only (no spaces, dashes or leading +). */
function sha256Phone(value?: string | null): string | undefined {
  if (!value) return undefined
  const digits = value.replace(/[^0-9]/g, '')
  if (!digits) return undefined
  return crypto.createHash('sha256').update(digits).digest('hex')
}

function parseCookies(header?: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  if (!header) return out
  for (const part of header.split(';')) {
    const i = part.indexOf('=')
    if (i === -1) continue
    out[part.slice(0, i).trim()] = part.slice(i + 1).trim()
  }
  return out
}

export type MetaLeadInput = {
  eventId?: string
  eventSourceUrl?: string
  email?: string | null
  phone?: string | null
  firstName?: string | null
  lastName?: string | null
  clientIp?: string | null
  userAgent?: string | null
  cookieHeader?: string | null
  fbclid?: string | null
  customData?: Record<string, unknown>
}

export async function sendMetaLead(input: MetaLeadInput): Promise<void> {
  if (!PIXEL_ID || !TOKEN) return

  try {
    const cookies = parseCookies(input.cookieHeader)

    let fbc = cookies['_fbc']
    if (!fbc && input.fbclid) {
      // Reconstruct the click id cookie Meta expects when only fbclid is known.
      fbc = `fb.1.${Date.now()}.${input.fbclid}`
    }

    const emailHash = sha256(input.email)
    const phoneHash = sha256Phone(input.phone)
    const firstHash = sha256(input.firstName)
    const lastHash = sha256(input.lastName)

    const user_data: Record<string, unknown> = {}
    if (emailHash) user_data.em = [emailHash]
    if (phoneHash) user_data.ph = [phoneHash]
    if (firstHash) user_data.fn = [firstHash]
    if (lastHash) user_data.ln = [lastHash]
    if (cookies['_fbp']) user_data.fbp = cookies['_fbp']
    if (fbc) user_data.fbc = fbc
    if (input.clientIp) user_data.client_ip_address = input.clientIp
    if (input.userAgent) user_data.client_user_agent = input.userAgent

    const body: Record<string, unknown> = {
      data: [
        {
          event_name: EVENT_NAME,
          event_time: Math.floor(Date.now() / 1000),
          event_id: input.eventId,
          action_source: 'website',
          event_source_url: input.eventSourceUrl,
          user_data,
          custom_data: input.customData,
        },
      ],
    }
    if (TEST_CODE) body.test_event_code = TEST_CODE

    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      },
    )

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.error('[meta-capi] event rejected:', res.status, text.slice(0, 300))
    }
  } catch (e: any) {
    // Never let tracking failures affect the quote submission itself.
    console.error('[meta-capi] send failed:', e?.message || String(e))
  }
}
