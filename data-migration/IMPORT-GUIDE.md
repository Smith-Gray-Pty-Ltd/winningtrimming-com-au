# Historical Job Import Guide — Workshop Software → Payload

**For:** Helper agent / migration script
**Date:** 2026-08-12
**Source:** Workshop Software CSV exports in `data-migration/workshop-software-exports/`
**Target:** Payload CMS at `http://localhost:3010`

---

## CSV Files

| File | Rows | Purpose |
|------|------|---------|
| `customer-Winning Trimming-2026-08-12.csv` | 95 | Customer list with contact details |
| `invoice-Winning Trimming-2026-08-12.csv` | 176 | Jobs, quotes, invoices with totals + dates |
| `invoiceItem-Winning Trimming-2026-08-12.csv` | 287 | Line items per invoice (materials, labour, deposits) |
| `product-0-100000-Winning Trimming-2026-08-12.csv` | 15 | Generic product codes (LAB, CON-GEN, DEPOSIT) |
| `vehicle-Winning Trimming-2026-08-12.csv` | 25 | Skip — not relevant |
| `vendor-Winning Trimming-2026-08-12.csv` | 1 | Skip — not relevant |

## CSV Field Reference

### customer CSV key fields
- `first_name`, `last_name`, `company_name` → Customer.name (combine first + last, or use company_name if no first name)
- `email` → Customer.email (required, unique — use for dedup)
- `phone`, `mobile`, `contact_phone` → Customer.phone (prefer mobile, then phone, then contact_phone)
- `suburb`, `state`, `postcode` → Customer.address group
- `address1`, `address2` → Customer.address.street
- `customer_type` → Customer.pillar (map — see below)
- `note` → Customer.notes
- `balance` → IGNORE (unreliable per assessment)

### invoice CSV key fields
- `display_name` → customer name (match to customers by this field)
- `invoice_number` → job reference (may be empty for quote-only job cards)
- `job_card_number` → unique ID for each job/quote (always present, use as primary key)
- `invoice_type` → `Q` = quote, `I` = invoice
- `invoice_status` → `C` = closed/paid, `P` = processed/invoiced (actually paid per James), `O` = open
- `post_date` → job date (YYYY-MM-DD HH:MM:SS format)
- `description` → job description (66 of 176 have real content)
- `job_card_note` → rich scope notes (74 rows have content)
- `note` → customer comms context (25 rows)
- `total`, `subtotal`, `balance_due` → pricing
- `deposits_total` → amount already paid as deposit
- `payment_method` → how they paid
- `state`, `suburb`, `postcode` → job location (denormalized)

### invoiceItem CSV key fields
- `job_card_number` → links to invoice
- `description` → line item description (almost all populated — the real work detail)
- `quantity`, `unit_price`, `amount` → pricing
- `item_code` → product code (LAB, CON-GEN, DEPOSIT, SUN-HT-150, etc.)
- `product_type` → `J` = labour, `W` = consumable, `S` = stock, `X` = discount
- `product_description` → longer product name

---

## System Access

- **API base URL:** `http://localhost:3010`
- **Admin login:** `admin@winningtrimming.com.au` / `Winning!Trimming2026`
- **Auth:** `POST /api/users/login` with `{"email":"...","password":"..."}` — returns token in `payload-token` cookie. Include this cookie in all subsequent requests.
- All API endpoints follow Payload REST: `GET /api/{collection}`, `POST /api/{collection}`, `PATCH /api/{collection}/{id}`
- Add `?overrideAccess=true` to bypass permission checks during import.

---

## Pillar Mapping

Map the old `customer_type` / `display_name` context to the new pillar system:

| Old signal | New pillar |
|------------|-----------|
| Boat/marine/vessel/yacht/bimini/cover/canvas | `marine` |
| Car/ute/vehicle/seat/tonneau/headlining | `automotive` |
| Caravan/RV/camper/annexe | `caravan-and-rv` |
| Excavator/machinery/industrial/cover | `trade-and-industrial` |
| Café/booth/office/chair/commercial | `commercial` |
| Unknown or ambiguous | `marine` (default — most common) |

If unsure, read the invoice descriptions and line items. The `description` + `job_card_note` + line item `description` fields usually make the pillar obvious.

---

## Import Workflow

### Step 0: Auth

```bash
curl -c cookies.txt -X POST http://localhost:3010/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@winningtrimming.com.au","password":"Winning!Trimming2026"}'
```

Use `cookies.txt` for all subsequent requests.

### Step 1: Import Customers

For each row in the customer CSV:

1. **Check if exists:** `GET /api/customers?where[email][equals]={email}&limit=1`
2. **If exists:** skip, use existing customer ID
3. **If new:** create:

```bash
POST /api/customers?overrideAccess=true
{
  "name": "{first_name} {last_name}" or "{company_name}",
  "email": "{email}",
  "password": "temp123456",
  "phone": "{mobile}" or "{phone}" or "{contact_phone}",
  "company": "{company_name}" if present,
  "pillar": "{mapped pillar}",
  "address": {
    "street": "{address1} {address2}",
    "suburb": "{suburb}",
    "state": "{state}",
    "postcode": "{postcode}"
  },
  "notes": "{note}"
}
```

- `email` is required and must be unique. If email is empty in the CSV, generate one: `{first_name}.{last_name}@import.winningtrimming.com.au`
- `password` is required (min 6 chars). Use a temp password — customers can reset later.
- Keep a mapping: `{display_name → customer_id}` for invoice import.

### Step 2: Get Service Type IDs

```bash
GET /api/service-types?limit=200&depth=0&sort=title
```

Store the full list. Match by title (case-insensitive). Common mappings:

| Old system signal | Service type |
|-------------------|-------------|
| Bimini | Bimini Tops |
| Cover / weather cover | Weather Covers |
| Towing cover | Towing Covers |
| Dodger | Dodgers |
| Enclosure / clear screen | Cockpit Enclosures or Flybridge Enclosures |
| Sail cover / stack pack | Sail Covers |
| Sun bed / sunbed | Sun Beds |
| Seat / upholstery / retrim | Seats |
| Cushion | Cushions |
| Mattress | Mattresses |
| Panel / headliner | Interior Panels |
| Carpet | Carpet |
| Hull lining | Hull Lining |
| Tonneau | Tonneau Covers |
| Annexe | Annexes |
| Booth | Booth Upholstery |
| Office chair | Office Chairs |

If no match, leave `serviceTypes` empty — staff can tag later.

### Step 3: Import Jobs as Quotes + Bookings

For each row in the invoice CSV:

#### Determine the record type

- `invoice_type === "Q"` → Quote only (may or may not have become a job)
- `invoice_type === "I"` → Invoice (actual job that was done)

#### Skip rules

- Skip if `total === 0` AND `description` is empty (placeholder/void rows)
- Skip if already imported (check: `GET /api/quotes?where[title][equals]={title}&limit=1`)

#### Create the Quote

For ALL rows (both Q and I types — even invoices originated from a quote):

```bash
POST /api/quotes?overrideAccess=true
{
  "title": "{display_name} — {description or job_card_number}",
  "customer": {customer_id},
  "pillar": "{mapped pillar}",
  "subject": "{description}" or "{job_card_number}" if description empty,
  "subjectDetails": "{job_card_note}",
  "description": "{description}" or "{job_card_note}" or combine line item descriptions,
  "location": "{suburb}, {state}",
  "preferredDates": "",
  "quotedAmount": {total} if > 0 else null,
  "depositAmount": {deposits_total} if > 0 else null,
  "status": "accepted" if invoice_type === "I", otherwise "quoted" if Q type,
  "serviceTypes": [{matched_ids}]
}
```

#### Create the Booking (only for invoice_type "I" — actual jobs)

```bash
POST /api/bookings?overrideAccess=true
{
  "title": "{display_name} — {description or job_card_number}",
  "customer": {customer_id},
  "quote": {quote_id},
  "pillar": "{mapped pillar}",
  "subject": "{description}" or "{job_card_number}",
  "subjectDetails": "{job_card_note}",
  "description": "{description}" or "{job_card_note}",
  "location": "{suburb}, {state}",
  "quotedAmount": {total},
  "depositAmount": {deposits_total},
  "status": "closed",
  "serviceTypes": [{matched_ids}]
}
```

**Important:** Set `status: "closed"` directly in the POST. Do NOT try to PATCH it through the state machine — historical jobs go straight to closed. Creating with a status directly works because the transition validator only runs on updates, not creates.

#### Link Quote back to Booking

```bash
PATCH /api/quotes/{quote_id}?overrideAccess=true
{
  "booking": {booking_id}
}
```

### Step 4: Import Invoices

For each booking, create invoice records from the invoice CSV data.

Most historical jobs have a deposit + final payment pattern. The old system used separate job card numbers for deposits and finals (see assessment). Try to reconstruct:

1. Look for line items with `item_code === "DEPOSIT"` or description containing "Deposit"
2. The deposit amount = the deposit line item amount or `deposits_total` field
3. The final amount = `total` - `deposits_total`

```bash
POST /api/invoices?overrideAccess=true
{
  "booking": {booking_id},
  "type": "deposit",
  "amount": {deposit_amount},
  "status": "paid",
  "dueDate": "{post_date}",
  "paidAt": "{post_date + 7 days}" or "{post_date}",
  "paymentMethod": "{payment_method mapped}"
}
```

```bash
POST /api/invoices?overrideAccess=true
{
  "booking": {booking_id},
  "type": "final",
  "amount": {total - deposits_total},
  "status": "paid",
  "dueDate": "{post_date + 30 days}",
  "paidAt": "{post_date + 30 days}",
  "paymentMethod": "{payment_method mapped}"
}
```

Payment method mapping:
- Old `payment_method` field → `"bank_transfer"` (most common), `"cash"`, `"cheque"`, `"card"`, `"other"`
- If unsure, use `"bank_transfer"` (confirmed as the most common method per James)

**Status rule:** All historical jobs are `"paid"` except:
- `invoice_status === "O"` (open) → use `"sent"` or `"overdue"`
- Recent jobs (July/Aug 2026) → check with James before marking paid
- `balance_due > 0` AND `invoice_status === "P"` → still mark as `"paid"` (per assessment, P status means actually paid)

### Step 5: Create Portfolio Projects (optional — best jobs only)

Only for jobs with:
- Rich descriptions (the 66 identified in assessment)
- Good line item detail
- Photos available (from Google Photos — ask James)

If photos exist, upload them first:

```bash
POST /api/media
# multipart form: file={image_file}, _payload={"alt":"Description"}
# Returns media document with id
```

Then create the project:

```bash
POST /api/projects?overrideAccess=true
{
  "title": "{job title}",
  "slug": "{slugified title}",
  "slugLock": false,
  "pillar": "{pillar}",
  "summary": "{1-2 sentence summary from description}",
  "location": "{suburb}, {state}",
  "materials": "{from line items — materials/consumables}",
  "completedAt": "{post_date}",
  "featured": false,
  "featuredImage": {media_id},
  "gallery": [{"image": {media_id}, "caption": "..."}],
  "serviceTypes": [{service_type_ids}],
  "content": {lexical_rich_text_json},
  "_status": "published"
}
```

Lexical content structure (simple heading + paragraphs):

```json
{
  "root": {
    "type": "root",
    "children": [
      {
        "type": "heading",
        "tag": "h2",
        "children": [{"type": "text", "text": "The brief", "detail": 0, "format": 0, "mode": "normal", "style": "", "version": 1}],
        "direction": "ltr", "format": "", "indent": 0, "version": 1
      },
      {
        "type": "paragraph",
        "children": [{"type": "text", "text": "...", "detail": 0, "format": 0, "mode": "normal", "style": "", "version": 1}],
        "direction": "ltr", "format": "", "indent": 0, "textFormat": 0, "version": 1
      },
      {
        "type": "heading",
        "tag": "h2",
        "children": [{"type": "text", "text": "What we did", "detail": 0, "format": 0, "mode": "normal", "style": "", "version": 1}],
        "direction": "ltr", "format": "", "indent": 0, "version": 1
      },
      {
        "type": "paragraph",
        "children": [{"type": "text", "text": "...", "detail": 0, "format": 0, "mode": "normal", "style": "", "version": 1}],
        "direction": "ltr", "format": "", "indent": 0, "textFormat": 0, "version": 1
      }
    ],
    "direction": "ltr", "format": "", "indent": 0, "version": 1
  }
}
```

Build the content from:
- "The brief" → `note` field (customer's original request) or `description`
- "What we did" → `job_card_note` + line item descriptions

After creating the project, link it to the booking:

```bash
PATCH /api/bookings/{booking_id}?overrideAccess=true
{
  "project": {project_id}
}
```

### Step 6: Log Events

For each imported record, create an event for audit trail:

```bash
POST /api/events?overrideAccess=true
{
  "eventType": "booking_created",
  "booking": {booking_id},
  "actor": "agent",
  "actorId": "historical-import",
  "description": "Imported from Workshop Software export (job_card_number: {job_card_number})",
  "metadata": {
    "source": "workshop-software",
    "originalJobCardNumber": "{job_card_number}",
    "originalInvoiceNumber": "{invoice_number}",
    "originalType": "{invoice_type}"
  }
}
```

---

## Processing Order

1. **Customers first** (95 rows) — needed for all job links
2. **Service types** (query existing — no creation needed)
3. **Quotes + Bookings** (176 rows — skip empties, ~150 real records)
4. **Invoices** (1-2 per booking, ~250 total)
5. **Projects** (only the ~20-30 best jobs with photos)
6. **Events** (one per booking + one per project)

## Idempotency

Before creating any record, check if it already exists:
- Customers: `GET /api/customers?where[email][equals]={email}`
- Quotes: `GET /api/quotes?where[title][equals]={title}&limit=1`
- Bookings: `GET /api/bookings?where[title][equals]={title}&limit=1`
- Projects: `GET /api/projects?where[slug][equals]={slug}&limit=1`

If found, skip. This makes the import safe to re-run.

## Important Rules

1. **Do NOT create duplicate customers.** Always check by email first.
2. **Do NOT create new service types.** Match existing ones by title.
3. **Do NOT import `balance` or `balance_due` as truth.** All historical jobs are paid (per James) except recent open ones.
4. **Booking status for historical jobs: `"closed"`** — set directly in POST, never via PATCH (state machine validator would block it).
5. **Quote status for historical jobs: `"accepted"`** for invoices, `"quoted"` for quote-only records.
6. **Use `?overrideAccess=true`** on all API calls during import.
7. **Log every import action to Events** with the original job_card_number in metadata.
8. **Empty descriptions:** use `job_card_note` or line item descriptions as fallback.
9. **Deposit reconstruction:** parse line item descriptions for "Deposit" / "Less Deposit" to figure out deposit vs final split. See ASSESSMENT.md for the deposit workaround pattern.
10. **Quote-to-invoice linkage:** reconstruct from free-text descriptions ("for Job 50018", "for Quote 50104"), NOT from job card numbers (they don't match — see assessment).

## Data Volume Summary

| What | Count | API calls |
|------|-------|-----------|
| Customers | ~88 (deduped) | ~176 (check + create) |
| Quotes | ~150 | ~300 (check + create) |
| Bookings | ~137 (invoices only) | ~274 (check + create) |
| Invoices | ~250 | ~250 |
| Projects | ~20-30 | ~60 (upload media + create) |
| Events | ~150 | ~150 |
| **Total** | | **~1,200 API calls** |