#!/usr/bin/env python3
"""
Build job photo folders from reconstructed logical jobs (v3).

One folder per LOGICAL JOB (chain), not per invoice row.
Chains come from data-migration/job-chains.json (see reconstruct_chains.py).

Creates:
  data-migration/job-photos/
    README.md
    {clean client name}/
      {root_job_card}_{date}_{slug}/
        info.json      <- merged job metadata (all chain members)
        photos/        <- DROP JOB IMAGES HERE
"""

import csv
import json
import os
import re
import shutil
import unicodedata

BASE = os.path.dirname(os.path.abspath(__file__))
EXPORTS = os.path.join(BASE, "workshop-software-exports")
CHAINS = os.path.join(BASE, "job-chains.json")
OUT = os.path.join(BASE, "job-photos")

JUNK_COMPANY = {"", "N/A", "n/a", "NA", "-", "c", "a", "none", "nil"}
JUNK_LAST = {"N/A", "n/a", "NA", "-", "none", "nil", "unknown"}


def slugify(text, maxlen=60):
    text = unicodedata.normalize("NFKD", text or "")
    text = text.encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text).strip("-").lower()
    return text[:maxlen].rstrip("-") or "untitled"


def norm(text):
    return re.sub(r"\s+", " ", (text or "")).strip().lower()


def clean_name(customer):
    first = re.sub(r"\s+", " ", (customer["first_name"] or "").strip())
    last = re.sub(r"\s+", " ", (customer["last_name"] or "").strip())
    company = re.sub(r"\s+", " ", (customer["company_name"] or "").strip())
    if company and company not in JUNK_COMPANY:
        return company
    if last in JUNK_LAST:
        last = ""
    if first and first.lower() == last.lower() and first:
        last = ""
    name = " ".join(p for p in (first, last) if p).strip()
    return name or company or customer["display_name"].strip()


def main():
    with open(os.path.join(EXPORTS, "customer-Winning Trimming-2026-08-12.csv"), newline="") as f:
        customers = list(csv.DictReader(f))
    with open(os.path.join(EXPORTS, "invoice-Winning Trimming-2026-08-12.csv"), newline="") as f:
        invoices = list(csv.DictReader(f))
    with open(os.path.join(EXPORTS, "invoiceItem-Winning Trimming-2026-08-12.csv"), newline="") as f:
        items = list(csv.DictReader(f))
    with open(CHAINS) as f:
        chains = json.load(f)

    # display_name -> clean name
    name_map = {}
    for c in customers:
        name_map[norm(c["display_name"])] = clean_name(c)

    # Full record index
    inv_by_jc = {i["job_card_number"]: i for i in invoices}
    items_by_job = {}
    for it in items:
        items_by_job.setdefault(it["job_card_number"], []).append(it)

    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT, exist_ok=True)

    created = 0
    skipped = 0
    flagged = []
    for chain in chains:
        members = chain["members"]
        root = chain["root"]
        recs = chain["records"]

        # Skip pure placeholder chains: single $0 invoice, no description,
        # no note, no line items, no job_card_note (void/blank job cards)
        if len(recs) == 1 and recs[0]["invoice_type"] == "I" and recs[0]["total"] == 0:
            jc0 = recs[0]["job_card_number"]
            inv0 = inv_by_jc[jc0]
            has_content = any([
                (inv0["description"] or "").strip(),
                (inv0["note"] or "").strip(),
                (inv0["job_card_note"] or "").strip(),
                items_by_job.get(jc0, []),
            ])
            if not has_content:
                skipped += 1
                continue
            # $0 invoice WITH content: likely a duplicate of a quote — flag & skip
            flagged.append({"job_card": jc0, "customer": recs[0]["customer"], "note": inv0["job_card_note"][:100]})
            skipped += 1
            continue


        # Pick the "main" record for description/pricing:
        # Prefer the QUOTE (agreed scope + price) when one exists,
        # else the largest invoice. Deposits/remainders are just payment installments.
        quote_recs = [r for r in recs if r["invoice_type"] == "Q" and r["total"] > 0]
        if quote_recs:
            main = max(quote_recs, key=lambda r: r["total"])
        else:
            inv_recs = [r for r in recs if r["invoice_type"] == "I" and r["total"] > 0]
            main = max(inv_recs, key=lambda r: r["total"]) if inv_recs else recs[0]

        # Best description across members (prefer quote's line items first —
        # quotes carry the real scope; invoice descriptions are often payment labels)
        best_desc = None
        for r in sorted(recs, key=lambda r: 0 if r["invoice_type"] == "Q" else 1):
            if r.get("description") and not re.search(r"deposit|remainder|less|final payment", r["description"], re.I):
                best_desc = r["description"]
                break
        if not best_desc:
            # Quote line items = the actual work scope
            q_items = [it for jc in members if (inv_by_jc[jc]["invoice_type"] == "Q")
                       for it in items_by_job.get(jc, [])]
            src = q_items or items_by_job.get(main["job_card_number"], [])
            if src:
                best_desc = "; ".join(it["description"] for it in src)[:200]
            else:
                for r in sorted(recs, key=lambda r: 0 if r["invoice_type"] == "Q" else 1):
                    if r.get("description"):
                        best_desc = r["description"]
                        break

        raw_name = main["customer"]
        clean = name_map.get(norm(raw_name), re.sub(r"\s+", " ", raw_name).strip())

        date = (main["post_date"] or "no-date")[:10]
        slug = slugify(best_desc or main["job_card_number"], maxlen=50)
        job_dir = os.path.join(OUT, clean, f"{root}_{date}_{slug}")
        photos_dir = os.path.join(job_dir, "photos")
        os.makedirs(photos_dir, exist_ok=True)

        main_inv = inv_by_jc[main["job_card_number"]]

        # Merge line items from all members
        merged_items = []
        for jc in members:
            for it in items_by_job.get(jc, []):
                merged_items.append({
                    "job_card": jc,
                    "description": it["description"],
                    "quantity": float(it["quantity"] or 0),
                    "unit_price": float(it["unit_price"] or 0),
                    "amount": float(it["amount"] or 0),
                    "item_code": it["item_code"] or None,
                    "product_type": it["product_type"] or None,
                })

        # Classify members: quote / deposit / final
        def classify(jc):
            rec = inv_by_jc[jc]
            if rec["invoice_type"] == "Q":
                return "quote"
            its = items_by_job.get(jc, [])
            desc_text = " ".join(it["description"] for it in its)
            if re.search(r"deposit|less deposit|remainder", desc_text, re.I):
                return "deposit" if "deposit" in desc_text.lower() and "less" not in desc_text.lower() else "payment"
            return "final"

        member_info = []
        for jc in members:
            rec = inv_by_jc[jc]
            member_info.append({
                "job_card_number": jc,
                "invoice_number": rec["invoice_number"] or None,
                "role": classify(jc),
                "invoice_type": rec["invoice_type"],
                "invoice_status": rec["invoice_status"],
                "post_date": rec["post_date"],
                "total": float(rec["total"] or 0),
                "description": rec["description"].strip() or None,
            })

        info = {
            "job_id": root,
            "job_card_numbers": members,
            "customer": clean,
            "customer_display_name": raw_name,
            "primary_date": date,
            "description": best_desc,
            "pillar_hint": main.get("pillar_hint") or recs[0].get("pillar_hint") or None,
            "location": {
                "suburb": main_inv["suburb"] or None,
                "state": main_inv["state"] or None,
                "postcode": main_inv["postcode"] or None,
            },
            "pricing": {
                # Main invoice value = the real job price (deposits double-count in sum)
                "job_total": main["total"],
                "total_invoiced": round(sum(r["total"] for r in recs if r["invoice_type"] == "I"), 2),
                "deposits": round(sum(it["amount"] for it in merged_items if "deposit" in (it["description"] or "").lower() and it["amount"] > 0), 2),
                "gst": float(main_inv["gst"] or 0),
            },
            "members": member_info,
            "line_items": merged_items,
            "notes": {
                "job_card_note": main_inv.get("job_card_note") or None,
                "note": main_inv.get("note") or None,
            },
        }

        with open(os.path.join(job_dir, "info.json"), "w") as f:
            json.dump(info, f, indent=2, ensure_ascii=False)

        created += 1

    readme = f"""# Job Photo Folders

One folder per LOGICAL JOB (deposit + remainder + quote merged into one).
Drop any images you have for each job into its `photos/` folder.

## Structure

```
job-photos/
  {{customer name}}/
    {{job_id}}_{{date}}_{{description-slug}}/
      info.json     <- merged job metadata (all job card numbers listed)
      photos/       <- PUT IMAGES HERE
```

## Notes

- {created} logical job folders (chains from job-chains.json)
- `info.json` has `job_card_numbers` (all source records) and `members` (roles: quote/deposit/final)
- Folder name is keyed to the chain root job card number (stable ID)
- Quotes that never became jobs get their own folder (may have "before" photos)

## Flagged records (needs manual review)

{chr(10).join(f"- {f['customer']}: {f['job_card']} — {f['note']}" for f in flagged) if flagged else "- none"}

## After adding photos

1. Add images to `photos/`
2. Tell the assistant which folders are portfolio-worthy
3. Import script: uploads media -> creates booking/project -> links photos
"""
    with open(os.path.join(OUT, "README.md"), "w") as f:
        f.write(readme)

    print(f"Created {created} logical job folders under {OUT}")


if __name__ == "__main__":
    main()
