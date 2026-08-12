# Workshop Software → Payload Migration — Data Assessment

**Date:** 2026-08-12
**Source:** Workshop Software exports (Winning Trimming)

## Files Received

| File | Rows | Notes |
|------|------|-------|
| `customer-Winning Trimming-2026-08-12.csv` | 95 | Client list, contacts, balances |
| `invoice-Winning Trimming-2026-08-12.csv` | 176 | Jobs/invoices/quotes, totals, dates, status |
| `invoiceItem-Winning Trimming-2026-08-12.csv` | 287 | Line items (materials, labour, deposits) |
| `product-0-100000-Winning Trimming-2026-08-12.csv` | 15 | Generic line items used (LAB, CON-GEN, etc.) |
| `vendor-Winning Trimming-2026-08-12.csv` | 1 | Nolan Group only |
| `vehicle-Winning Trimming-2026-08-12.csv` | 25 | Not relevant (system forced) |

## Invoice Data — What's In There

### Volume & Money
- **176 rows total**: 137 real invoices (type `I`), 39 quotes (type `Q`)
- **Invoice value: $315,306** | **Quote value: $215,024** (quotes = potential work)
- Date range: **2024-06-06 → 2026-08-12** (~2 years)
- Invoice statuses: **C = Closed/Paid** (36, all $0 balance), **P = Processed/Invoiced** (91 — actually paid in reality, balance fields unreliable), **O = Open** (10 — mostly $0 placeholders, 2 real unpaid)

### Job Card Numbers — the Deposit Workaround
- Every row has a unique `job_card_number` (50013 → 50220+)
- **127 of 176** have `invoice_number` matching the job card = clean single invoices
- **49 have empty `invoice_number`** — these are the workaround rows:
  - Mostly **quotes** (job card created for quoting, never invoiced through the same number)
  - Several **$0.00 invoices** (drafts or void placeholders)
- **Job cards do NOT line up between quotes and invoices.** Confirmed:
  - Only 3 quotes have a matching invoice with same number/customer/total
  - But the *descriptions* contain the links: e.g. `Deposit 1 for Job ID 50018`, `50% Deposit for Quote 50104`, `Remainder for quote 50104`

### Deposit Payment Pattern (system limitation workaround)
The system didn't support deposit payments properly, so they used **separate invoices + free-text descriptions**:
- **40 DEPOSIT items** across the data, e.g.:
  - `Deposit 1 for Job ID 50018` — $5,000
  - `50% Deposit for Quote 50104` — $8,250
  - `Less Deposit (Inv 50203 Paid)` — -$3,943.50 (negative line to net off)
- Typical flow: Quote (job card A) → Deposit invoice (job card B, 50%) → Remainder invoice (job card C, 50%)
- Found at least one exact split: Quote 50187 ($5,819) = Inv 50188 ($2,909.50) + Inv 50191 ($2,909.50)

**Migration implication:** Job relationships must be reconstructed from free-text description references ("for Job X", "for Quote X"), not from numeric IDs.

### Description Quality
- **66 of 176 invoices** have a real description — these are **portfolio gold**, e.g.:
  - `Remove solar panels, remove and dispose old Bimini, check frame and fasteners, pattern new Bimini`
  - `Boom Bag, measure, make install inclusive of canvas`
  - `VW Carpet fitted`, `Covers for aeroplane seats`, `Bike seat recover`
  - `Chap Style Covers For Rib as Discussed`
- **110 have empty descriptions** — the actual detail lives in:
  - `job_card_note` (74 rows) — rich text with scope, e.g. "Outside lounge. New covers in vinal"
  - `note` (25 rows) — customer comms context, e.g. "Hi Corey, I know I said I would quote front and sides separate..."
  - **Line item descriptions** (287 items, almost all populated) — these carry the real work detail

### Line Items
- **287 items**, average ~2.2 per invoice; 85 invoices have a single line (just labour or just a deposit)
- Product types: **120 Labour (J), 108 Consumables (W), 58 Stock (S), 1 Discount (X)**
- Most common codes: `LAB` (118), `CON-GEN` (108), `DEPOSIT` (33), `SUN-HT-150` (10)
- **The descriptive ones are in custom text**: e.g. `Deck Mounted Rib Cover, Measure, Make and Fit`, `Cushion Recover (material supplied)`, `Remove solar panels, install new Bimini`

### Customer Linkage — Clean ✅
- **All 88 customer names on invoices exist in the customer list** (case-insensitive match: 100%)
- 7 customers have no invoices (never done work yet)
- Invoice CSVs denormalize customer state/suburb/postcode — handy for geo data

### Outstanding Balances — ⚠️ NOT RELIABLE (confirmed with James)
- System shows 54 customers owing **$197,498 total** — **this is wrong**
- **Confirmed: almost everyone has paid** except the last few jobs (mid-2026 onwards)
- The system's `balance_due` and customer `balance` fields were never properly maintained — payments were made via bank transfer/cash outside the system's tracking
- Status codes decoded: **P = Processed/Invoiced** (NOT paid), **C = Closed/paid** ($0 balance), **O = Open**
- The 91 `P`-status invoices all show balance_due > 0 but are actually paid
- **Real unpaid work** = only 2 open invoices with amounts (50163 $12,826, 50179 $4,235) + the recent July/Aug 2026 jobs (50202, 50209-50220 range)
- **Migration implication:** Do NOT import `balance` or `balance_due` as truth. Treat all jobs as paid unless they're in the last few months of data. Ask James to confirm the genuinely unpaid list before importing.

## Data Quality Verdict

| Aspect | Rating | Notes |
|--------|--------|-------|
| Customer data | ✅ Good | Structured, contacts, balances |
| Invoice totals/dates/status | ✅ Good | Reliable numbers |
| Job descriptions | ⚠️ Mixed | 37% filled; detail often in notes/line items |
| Line items | ✅ Good | 99.6% have descriptions |
| Quote→Invoice linkage | ❌ Messy | Must reconstruct from free-text |
| Products/Suppliers | ❌ Sparse | Generic line items only |
| Vehicles | ❌ Skip | Not relevant to trimming work |

## Recommended Migration Approach

1. **Customers** → Payload `customers` collection directly (95 records, clean)
2. **Invoices/quotes** → Payload `jobs` collection; treat each `job_card_number` as a job; include type (quote/invoice), status, dates, totals
3. **Line items** → Payload `jobItems` (or array field); map `LAB→labour`, `S→material`, `W→consumable`, `DEPOSIT→deposit`
4. **Reconstruct relationships** by parsing descriptions for `Job \d+` / `Quote \d+` / `Inv \d+` references → link quote→deposit→remainder chains
5. **Portfolio candidates** = invoices with rich descriptions + line items (66 identified) — these get matched with Google Photos
6. **Quoting agent training data** = quotes (39) + their notes + line items = what was quoted vs what was charged (comparable when chains link up)

## Files to Keep
- Customer CSV → direct import
- Invoice CSV → jobs collection (source of truth for money)
- Invoice Item CSV → job line items
- Products CSV → reference lookup for item codes (LAB, CON-GEN, DEPOSIT pricing)
- Vehicle CSV → skip (or keep for completeness, not used)
