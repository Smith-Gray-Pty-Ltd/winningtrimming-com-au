#!/usr/bin/env python3
"""
Reconstruct logical jobs from Workshop Software invoice exports.

Workshop Software didn't support deposits properly, so one logical job is
spread across multiple job cards:
  Quote (Q)  ->  Deposit invoice (I)  ->  Remainder invoice (I)

Chains are linked ONLY through free-text references:
  "50% Deposit for Quote 50087"          (deposit references the quote)
  "50% Remainder ... (Job 50097)"        (remainder references the deposit)

Output: data-migration/job-chains.json
  [ { "root": "50087", "members": ["50087", "50097", "50117"], ... } ]
"""

import csv
import json
import os
import re

BASE = os.path.dirname(os.path.abspath(__file__))
EXPORTS = os.path.join(BASE, "workshop-software-exports")
OUT = os.path.join(BASE, "job-chains.json")

# Match "Job 50018", "Quote 50087", "Estimate 50185", "Inv 50203", "#50148"
REF_RE = re.compile(r"(?:job|quote|estimate|est|inv|invoice|ref|#)\s*(?:id)?\s*(\d{4,6})", re.I)


def references(text):
    """Extract referenced job/invoice numbers from free text."""
    if not text:
        return []
    return [int(n) for n in REF_RE.findall(text)]


def main():
    with open(os.path.join(EXPORTS, "invoice-Winning Trimming-2026-08-12.csv"), newline="") as f:
        invoices = list(csv.DictReader(f))
    with open(os.path.join(EXPORTS, "invoiceItem-Winning Trimming-2026-08-12.csv"), newline="") as f:
        items = list(csv.DictReader(f))

    items_by_job = {}
    for it in items:
        items_by_job.setdefault(it["job_card_number"], []).append(it)

    # Build record index
    records = {}
    for inv in invoices:
        jc = inv["job_card_number"]
        # Collect all text that may contain references
        text_parts = [inv["description"], inv["note"], inv["job_card_note"]]
        text_parts += [it["description"] for it in items_by_job.get(jc, [])]
        text = " ".join(p for p in text_parts if p)
        records[jc] = {
            "job_card_number": jc,
            "invoice_number": inv["invoice_number"] or None,
            "invoice_type": inv["invoice_type"],
            "invoice_status": inv["invoice_status"],
            "customer": inv["display_name"].strip(),
            "post_date": inv["post_date"],
            "description": inv["description"].strip() or None,
            "total": float(inv["total"] or 0),
            "refs": references(text),
            "text_sample": text[:120],
        }

    # Build chains via BFS: follow refs both directions
    # If A refs B, A is a deposit/remainder, B is the root (quote or main job)
    # Actually: deposit refs quote; remainder refs deposit. Root = quoted record.
    # We need to link: any record that references another joins that other's chain.
    # Chains keyed by root (the record that is referenced but references nothing relevant).

    # union-find for simplicity
    parent = {jc: jc for jc in records}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(a, b):
        ra, rb = find(a), find(b)
        if ra != rb:
            parent[rb] = ra

    # Pass 1: link records via free-text references ("for Quote 50087", "Job 50018")
    for jc, rec in records.items():
        for ref in rec["refs"]:
            ref = str(ref)
            if ref in records and ref != jc:
                union(ref, jc)

    # Pass 2: amount-based matching for silent splits.
    # If a quote's total == sum of invoice totals for same customer, union them.
    # Handles cases like Q 50187 ($5,819) = I 50188 + I 50191 (both $2,909.50)
    # where one invoice has no text reference.
    quote_by_customer = {}
    for jc, rec in records.items():
        if rec["invoice_type"] == "Q" and rec["total"] > 0:
            quote_by_customer.setdefault(rec["customer"].lower(), []).append(jc)

    invs_by_customer = {}
    for jc, rec in records.items():
        if rec["invoice_type"] == "I" and rec["total"] > 0:
            invs_by_customer.setdefault(rec["customer"].lower(), []).append(jc)

    for cust, qcs in quote_by_customer.items():
        ics = invs_by_customer.get(cust, [])
        if not ics:
            continue
        # only consider quotes not yet in a multi chain
        for qc in qcs:
            if find(qc) != qc:
                continue  # already linked via text refs
            qtot = records[qc]["total"]
            # find combination of invoices that sums to quote total
            for i in range(len(ics)):
                for j in range(i, len(ics)):
                    a, b = ics[i], ics[j]
                    if a == b:
                        continue
                    at, bt = records[a]["total"], records[b]["total"]
                    if abs(at + bt - qtot) < 1.0:
                        union(qc, a)
                        union(qc, b)

    # Rebuild chains
    chains = {}
    for jc in records:
        root = find(jc)
        chains.setdefault(root, []).append(jc)

    # Sort chains by earliest date
    result = []
    for root, members in chains.items():
        chain_recs = [records[m] for m in members]
        chain_recs.sort(key=lambda r: r["post_date"])
        earliest = chain_recs[0]
        total = sum(r["total"] for r in chain_recs if r["invoice_type"] == "I")
        result.append({
            "root": root,
            "members": members,
            "customer": earliest["customer"],
            "first_date": earliest["post_date"],
            "types": sorted(set(r["invoice_type"] for r in chain_recs)),
            "invoice_total": round(total, 2),
            "records": chain_recs,
        })

    result.sort(key=lambda c: c["first_date"])

    with open(OUT, "w") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"Total job cards: {len(records)}")
    print(f"Chains: {len(result)}")
    multi = [c for c in result if len(c['members']) > 1]
    print(f"Multi-record chains: {len(multi)}")
    for c in multi:
        print(f"  {c['root']:>6} ({c['customer'][:20]:20}) {c['first_date']} members={c['members']} types={c['types']} total=${c['invoice_total']:,.2f}")
    print(f"\nSingle-record chains: {len(result) - len(multi)}")


if __name__ == "__main__":
    main()
