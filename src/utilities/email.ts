import type { Payload } from 'payload'

/**
 * Email notifications via Payload's native email adapter.
 * Configured in payload.config.ts with @payloadcms/email-nodemailer.
 *
 * Design matches the website:
 *   - White body, black footer (like the site footer)
 *   - Green #607A00 for CTA buttons
 *   - Teal #108DAF for links
 *   - Logo from the public URL
 *   - Minimal, clean layout — no cards or borders
 */

const FROM_ADDRESS = process.env.SMTP_FROM || process.env.SMTP_USER || 'service@winningtrimming.com.au'
const FROM_NAME = 'Winning Trimming'
const SITE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'https://winningtrimming.com.au'
const LOGO_URL = `${SITE_URL}/winning-trimming-logo.webp`

type QuoteData = {
  id: number
  title: string
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  pillar?: string | null
  subject?: string | null
  subjectType?: { title?: string } | string | null
  subjectDetails?: string | null
  description?: string | null
  location?: string | null
  preferredDates?: string | null
  source?: string | null
  campaign?: string | null
  serviceTypes?: Array<{ title?: string } | string> | null
  subjectPhotos?: Array<{
    image?: {
      url?: string | null
      alt?: string | null
      filename?: string | null
      thumbnailURL?: string | null
    } | string | null
    caption?: string | null
  }> | null
}

/**
 * Shared footer block — black background, white text, matches website footer.
 */
function emailFooter(): string {
  return `
    <table role="presentation" style="width:100%;background:#000000;" cellpadding="0" cellspacing="0">
      <tr>
        <td style="padding:32px 24px;">
          <table role="presentation" style="width:100%;max-width:512px;margin:0 auto;" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;">
                <p style="margin:0 0 8px;color:#ffffff;font-weight:500;">Visit</p>
                Shop 2, 25 Sara Street, Toronto NSW 2283<br/>
                <a href="tel:1300799882" style="color:rgba(255,255,255,0.9);text-decoration:none;">1300 799 882</a>
              </td>
              <td style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.7;text-align:right;vertical-align:top;">
                <p style="margin:0 0 8px;color:#ffffff;font-weight:500;">Hours</p>
                Mon – Fri: 7am – 3pm<br/>
                Sat: By appointment
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding-top:24px;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Winning Trimming is a trading name of Smith &amp; Gray Pty Ltd — ABN: 92 655 426 707<br/>
                <a href="${SITE_URL}" style="color:rgba(255,255,255,0.7);text-decoration:none;">winningtrimming.com.au</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`
}

/**
 * Notify staff when a new quote request comes in.
 * Includes all quote details + photo thumbnails + admin link.
 */
export async function notifyStaffOfQuote(payload: Payload, quote: QuoteData): Promise<void> {
  const staffEmail = process.env.SMTP_USER || 'service@winningtrimming.com.au'
  const adminUrl = `${SITE_URL}/admin/collections/quotes/${quote.id}`

  // Build photo gallery HTML if photos exist
  const photos = (quote.subjectPhotos || []).filter(
    (p) => p.image && typeof p.image === 'object' && p.image.url,
  )
  const photoHtml = photos.length > 0
    ? `
      <p style="margin:28px 0 8px;font-size:13px;color:#888888;">Photos (${photos.length})</p>
      <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:8px;">
        <tr>
          ${photos.map((p, i) => {
            const img = p.image as { url: string; alt?: string; thumbnailURL?: string }
            const thumbUrl = img.thumbnailURL || img.url
            const cell = `<td style="width:33%;vertical-align:top;">
              <a href="${SITE_URL}${img.url}" style="text-decoration:none;">
                <img src="${SITE_URL}${thumbUrl}" alt="${img.alt || `Photo ${i + 1}`}" style="width:100%;max-width:160px;border-radius:8px;display:block;border:1px solid #eee;" />
              </a>
              ${p.caption ? `<p style="margin:4px 0 0;font-size:11px;color:#888;">${p.caption}</p>` : ''}
            </td>`
            if (i > 0 && i % 3 === 0) {
              return `</tr><tr>${cell}`
            }
            return cell
          }).join('')}
        </tr>
      </table>`
    : ''

  // Format service types (hasMany relationship — populated objects or IDs)
  const serviceTypeTitles = (quote.serviceTypes || [])
    .map((st) => typeof st === 'object' && st !== null ? st.title : null)
    .filter(Boolean)
  const serviceTypesStr = serviceTypeTitles.length > 0 ? serviceTypeTitles.join(', ') : '—'

  // Format subject type (asset type relationship)
  const subjectTypeStr = quote.subjectType && typeof quote.subjectType === 'object'
    ? quote.subjectType.title || '—'
    : '—'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222222;">

  <div style="max-width:560px;margin:0 auto;">

    <!-- Header: logo -->
    <div style="padding:24px 24px 16px;">
      <img src="${LOGO_URL}" alt="Winning Trimming" style="height:32px;width:auto;display:block;" />
    </div>

    <!-- Body -->
    <div style="padding:16px 24px 40px;">

      <p style="margin:0 0 24px;font-size:13px;font-weight:600;color:#607A00;letter-spacing:0.5px;">NEW QUOTE REQUEST</p>

      <h1 style="margin:0 0 4px;font-size:22px;font-weight:500;color:#222222;">${quote.title}</h1>
      <p style="margin:0 0 28px;font-size:13px;color:#888888;">${new Date().toLocaleString('en-AU', { dateStyle: 'long', timeStyle: 'short' })}</p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.8;">
        <tr><td style="color:#888888;width:110px;vertical-align:top;">Name</td><td style="color:#222222;font-weight:500;">${quote.contactName || '—'}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Email</td><td><a href="mailto:${quote.contactEmail}" style="color:#108DAF;text-decoration:none;">${quote.contactEmail || '—'}</a></td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Phone</td><td style="color:#222222;">${quote.contactPhone || '—'}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Category</td><td style="color:#222222;text-transform:capitalize;">${quote.pillar || '—'}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Subject</td><td style="color:#222222;">${quote.subject || '—'}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Asset type</td><td style="color:#222222;">${subjectTypeStr}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Service types</td><td style="color:#222222;">${serviceTypesStr}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Location</td><td style="color:#222222;">${quote.location || '—'}</td></tr>
        <tr><td style="color:#888888;vertical-align:top;">Preferred dates</td><td style="color:#222222;">${quote.preferredDates || '—'}</td></tr>
        ${quote.source || quote.campaign ? `<tr><td style="color:#888888;vertical-align:top;">Source</td><td style="color:#222222;">${[quote.source, quote.campaign].filter(Boolean).join(' / ') || '—'}</td></tr>` : ''}
      </table>

      ${quote.subjectDetails ? `
      <p style="margin:28px 0 8px;font-size:13px;color:#888888;">Subject details</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#222222;white-space:pre-wrap;">${quote.subjectDetails}</p>
      ` : ''}

      <p style="margin:28px 0 8px;font-size:13px;color:#888888;">Description</p>
      <p style="margin:0;font-size:14px;line-height:1.7;color:#222222;white-space:pre-wrap;">${quote.description || '—'}</p>

      ${photoHtml}

      <p style="margin:36px 0 0;">
        <a href="${adminUrl}" style="display:inline-block;background:#607A00;color:#ffffff;font-size:14px;font-weight:500;padding:12px 24px;border-radius:6px;text-decoration:none;">View in admin panel →</a>
      </p>

    </div>

  </div>
</body>
</html>`

  try {
    await payload.sendEmail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: staffEmail,
      subject: `New Quote Request #${quote.id} — ${quote.title}`,
      html,
      replyTo: quote.contactEmail || undefined,
    })
  } catch (err: any) {
    payload.logger.error('[quotes] Failed to send staff notification email: ' + (err?.message || err))
  }
}

/**
 * Send a confirmation email to the customer who submitted a quote request.
 */
export async function notifyCustomerOfQuote(payload: Payload, quote: QuoteData): Promise<void> {
  if (!quote.contactEmail) return

  const name = quote.contactName?.split(' ')[0] || 'there'

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#222222;">

  <div style="max-width:560px;margin:0 auto;">

    <!-- Header: logo -->
    <div style="padding:24px 24px 16px;">
      <img src="${LOGO_URL}" alt="Winning Trimming" style="height:32px;width:auto;display:block;" />
    </div>

    <!-- Body -->
    <div style="padding:16px 24px 40px;">

      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#222222;">Hi ${name},</p>

      <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#222222;">
        Thanks for your quote request. We&apos;ve received your enquiry, we usually get in
        contact the same day, if we need any more information or to organise a time to
        view your project we&apos;ll reach out.
      </p>

      <p style="margin:0 0 28px;font-size:14px;color:#888888;">
        Quote #${quote.id} — ${quote.subject || quote.title}
      </p>

      <p style="margin:0 0 32px;font-size:15px;line-height:1.7;color:#222222;">
        If you need to add any details or have questions, just reply to this email or
        call us on <a href="tel:1300799882" style="color:#108DAF;text-decoration:none;font-weight:500;">1300 799 882</a>.
      </p>

      <p style="margin:0;">
        <a href="tel:1300799882" style="display:inline-block;background:#607A00;color:#ffffff;font-size:14px;font-weight:500;padding:12px 24px;border-radius:6px;text-decoration:none;">Call 1300 799 882</a>
      </p>

    </div>

  </div>
</body>
</html>`

  try {
    await payload.sendEmail({
      from: `"${FROM_NAME}" <${FROM_ADDRESS}>`,
      to: quote.contactEmail,
      subject: `Quote request received — Winning Trimming #${quote.id}`,
      html,
    })
  } catch (err: any) {
    payload.logger.error('[quotes] Failed to send customer confirmation email: ' + (err?.message || err))
  }
}