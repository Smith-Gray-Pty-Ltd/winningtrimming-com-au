#!/usr/bin/env python3
"""
Build job photo folders from Workshop Software exports.

Creates:
  data-migration/job-photos/
    README.md
    {client name}/
      {job_card_number}_{date}_{slug}/
        info.json      <- job metadata (used by import script to link photos)
        photos/        <- DROP JOB IMAGES HERE
"""

import csv
import json
import os
import re
import unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
EXPORTS = os.path.join(BASE, "workshop-software-exports")
OUT = os.path.join(BASE, "job-photos")


def slugify(text, maxlen=60):
    text = unicodedata.normalize("NFKD", text or "")
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:maxlen].rstrip("-") or "untitled"


def clean_name(name):
    # Collapse spaces, strip trailing punctuation for folder names
    name = re.sub(r"\s+", " ", name or "").strip()
    return name.rstrip("., ") or "Unknown Customer"


def main():
    with open(os.path.join(EXPORTS, "invoice-Winning Trimming-2026-08-12.csv"), newline="") as f:
        invoices = list(csv.DictReader(f))
    with open(os.path.join(EXPORTS, "invoiceItem-Winning Trimming-2026-08-12.csv"), newline="") as f:
        items = list(csv.DictReader(f))

    # Group line items by job_card_number
    items_by_job = {}
    for it in items:
        items_by_job.setdefault(it["job_card_number"], []).append(it)

    os.makedirs(OUT, exist_ok=True)
    created = 0
    skipped = 0
    skipped_rows = []

    for inv in invoices:
        jc = inv["job_card_number"]
        total = float(inv["total"] or 0)
        desc = (inv["description"] or "").strip()

        # Skip $0 placeholder rows with no description (void/blank job cards)
        if total == 0 and not desc and inv["invoice_type"] == "I":
            skipped += 1
            skipped_rows.append(jc)
            continue

        client = clean_name(inv["display_name"])
        date = (inv["post_date"] or "no-date")[:10]
        slug = slugify(desc or inv["invoice_type"], maxlen=50)
        job_dir = os.path.join(OUT, client, f"{jc}_{date}_{slug}")
        photos_dir = os.path.join(job_dir, "photos")
        os.makedirs(photos_dir, exist_ok=True)

        info = {
            "job_card_number": jc,
            "invoice_number": inv["invoice_number"] or None,
            "invoice_type": inv["invoice_type"],          # Q = quote, I = invoice
            "invoice_status": inv["invoice_status"],      # C = closed/paid, P = processed(paid), O = open
            "customer": inv["display_name"],
            "post_date": inv["post_date"],
            "description": desc or None,
            "job_card_note": inv["job_card_note"] or None,
            "note": inv["note"] or None,
            "pillar_hint": inv["body_type"] or None,
            "location": {
                "suburb": inv["suburb"] or None,
                "state": inv["state"] or None,
                "postcode": inv["postcode"] or None,
            },
            "pricing": {
                "total": total,
                "subtotal": float(inv["subtotal"] or 0),
                "deposits_total": float(inv["deposits_total"] or 0),
                "balance_due": float(inv["balance_due"] or 0),  # UNRELIABLE per assessment
                "discount": float(inv["discount_total"] or 0),
                "gst": float(inv["gst"] or 0),
            },
            "payment_method": inv["payment_method"] or None,
            "line_items": [
                {
                    "description": it["description"],
                    "quantity": float(it["quantity"] or 0),
                    "unit_price": float(it["unit_price"] or 0),
                    "amount": float(it["amount"] or 0),
                    "item_code": it["item_code"] or None,
                    "product_type": it["product_type"] or None,  # J=labour W=consumable S=stock X=discount
                }
                for it in items_by_job.get(jc, [])
            ],
            "deposit_references": None,  # filled by chain-reconstruction script later
        }

        with open(os.path.join(job_dir, "info.json"), "w") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)

        created += 1

    # README for the photo workflow
    readme = f"""# Job Photo Folders

Drop any images you have for each job into its `photos/` folder.
The import script uses `info.json` to link photos to the right Payload booking.

## Structure

```
job-photos/
  {{customer name}}/
    {{job_card_number}}_{{date}}_{{description-slug}}/
      info.json     <- job metadata (auto-generated)
      photos/       <- PUT IMAGES HERE (any format, keep original names)
```

## Notes

- {created} job folders created (real jobs + quotes with value)
- {skipped} placeholder rows skipped (${'$'}0, no description)
- Jobs with `invoice_type` Q = quotes (may still have "before" photos worth keeping)
- Folder names won't change — they're keyed to `job_card_number` (stable ID)
- If a job has no photos, leave the folder empty or delete it; import will skip it

## After adding photos

1. Add images to `photos/`
2. Tell the assistant which folders are portfolio-worthy
3. The import script will: upload images to Payload media → create project →
   link project to booking
"""
    with open(os.path.join(OUT, "README.md"), "w") as f:
        f.write(readme)

    print(f"Created {created} job folders under {OUT}")
    print(f"Skipped {skipped} placeholder rows: {', '.join(skipped_rows[:10])}")


if __name__ == "__main__":
    main()
