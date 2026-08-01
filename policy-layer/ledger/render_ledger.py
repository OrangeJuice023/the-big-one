#!/usr/bin/env python3
"""Render LEDGER.md from log.md (narrative) + status.csv (data).
Run after editing either file:  python3 render_ledger.py

Also emits web/src/lib/scorecard.json, which the /policy page imports at build
time. That page used to carry a hand-copied duplicate of this data, and it fell
out of sync twice — Pasig OB4 and Taguig OB3 were both stale on the live site
after the ledger changed. status.csv is the single source of truth; anything
displaying it should be generated, not transcribed.
"""
import csv, json, os
from collections import defaultdict, OrderedDict

HERE = os.path.dirname(os.path.abspath(__file__))
STATUS = os.path.join(HERE, "status.csv")
LOG = os.path.join(HERE, "log.md")
OUT = os.path.join(os.path.dirname(HERE), "LEDGER.md")
REPO = os.path.dirname(os.path.dirname(HERE))
JSON_OUT = os.path.join(REPO, "web", "src", "lib", "scorecard.json")

# 8 RA 10121 obligations (id -> short label, citation)
OBLIG = OrderedDict([
    ("OB1", ("LDRRMO established",                         "RA10121 §12(a)")),
    ("OB2", ("LDRRMP formulated, tested & updated",        "§11(b)(1); §12(c)(6)")),
    ("OB3", ("Ordinance creating DRRMO (staff+budget)",    "IRR Rule 6 §6")),
    ("OB4", ("Hazard maps & plans PUBLICLY displayed",     "IRR Rule 6 §7; §12(c)(10)")),
    ("OB5", ("Local risk assessment / hazard ID",          "§12(c)(2,3,9)")),
    ("OB6", ("Regular drills conducted",                   "IRR Rule 6 §7; §12(c)(4)")),
    ("OB7", ("LDRRM Fund incl. 30% QRF programmed",        "§21")),
    ("OB8", ("DRR mainstreamed into CDP/CLUP",             "§11(b)(2)")),
])
LGUS = ["Makati", "Marikina", "Pasig", "Quezon City", "Pateros", "Taguig"]
GLYPH = {"present": "✓", "partial": "◐", "to-collect": "·", "absent": "✗"}
# real compliance lapses (surfaced in matrix flags + register); 'unverified' is
# just a collection gap already conveyed by the to-collect status, so it's excluded
REAL_LAPSES = {"access", "access-broken", "access-foi", "access-none",
               "access-opaque", "not-adopted", "outdated", "scope"}

rows = list(csv.DictReader(open(STATUS)))
cell = defaultdict(dict)               # cell[lgu][obl] = row
for r in rows:
    cell[r["lgu"]][r["obl_id"]] = r

def matrix():
    out = ["## Compliance matrix\n",
           "Legend: ✓ present · ◐ partial · · to-collect · ✗ absent · "
           "`!lapse` = lapse flag (see register).\n",
           "| Obligation | " + " | ".join(LGUS) + " |",
           "|---|" + "|".join(["---"]*len(LGUS)) + "|"]
    for oid, (label, cite) in OBLIG.items():
        cells = []
        for lgu in LGUS:
            r = cell.get(lgu, {}).get(oid)
            if not r:
                cells.append("·"); continue
            g = GLYPH.get(r["status"], "?")
            if r["lapse_type"] in REAL_LAPSES:
                g += f" !{r['lapse_type']}"
            cells.append(g)
        out.append(f"| **{oid}** {label} <br><sub>{cite}</sub> | "
                   + " | ".join(cells) + " |")
    return "\n".join(out)

def lapse_register():
    out = ["## Lapse register\n",
           "_Every logged lapse. Caps public-display obligations at partial. "
           "**Access sub-types:** `access-broken` = LGU attempted publish, "
           "link/portal fails (dead link, 404, \"not currently available\"). "
           "`access-foi` = deliberate on-request-only channel (eFOI, formal "
           "letter). `access-none` = LGU never attempted digital disclosure "
           "of the item. `access-opaque` = file is online but unindexable, "
           "unfindable, and/or unsearchable due to naming, format, or missing "
           "metadata (opaque filenames, scan-only PDFs w/o text layer). "
           "Bare `access` = unspecified or pre-split entry._\n",
           "| LGU | Obl | Lapse | Note | Verified |",
           "|---|---|---|---|---|"]
    n = 0
    for r in rows:
        if r["lapse_type"] in REAL_LAPSES:
            note = (r["evidence"] or "").replace("|", "/")
            out.append(f"| {r['lgu']} | {r['obl_id']} | **{r['lapse_type']}** | "
                       f"{note} | {r['verified']} |")
            n += 1
    out.append(f"\n_{n} lapses logged._")
    return "\n".join(out)

def per_lgu():
    out = ["## Per-LGU detail\n"]
    for lgu in LGUS:
        out.append(f"### {lgu}\n")
        out.append("| Obl | Status | Lapse | Evidence | Source | Updated |")
        out.append("|---|---|---|---|---|---|")
        for oid, (label, _) in OBLIG.items():
            r = cell.get(lgu, {}).get(oid, {})
            st = GLYPH.get(r.get("status",""), "·") + " " + r.get("status","to-collect")
            out.append(f"| {oid} | {st} | {r.get('lapse_type','') or '—'} | "
                       f"{(r.get('evidence','') or '—').replace('|','/')} | "
                       f"{r.get('source_url','') or '—'} | {r.get('updated','')} |")
        out.append("")
    return "\n".join(out)

def progress():
    out = ["## Progress summary\n",
           "| LGU | present | partial | to-collect | absent | lapses |",
           "|---|---|---|---|---|---|"]
    for lgu in LGUS:
        c = defaultdict(int); laps = 0
        for oid in OBLIG:
            r = cell.get(lgu, {}).get(oid)
            if r:
                c[r["status"]] += 1
                if r["lapse_type"] in REAL_LAPSES:
                    laps += 1
        out.append(f"| {lgu} | {c['present']} | {c['partial']} | "
                   f"{c['to-collect']} | {c['absent']} | {laps} |")
    return "\n".join(out)

log = open(LOG).read().rstrip()
doc = "\n\n".join([
    "<!-- GENERATED by render_ledger.py — edit log.md / status.csv, not this file. -->",
    log, matrix(), progress(), lapse_register(), per_lgu(),
])
open(OUT, "w").write(doc + "\n")
print(f"Wrote {OUT}")


# ---- machine-readable copy for the web app ----------------------------------
def scorecard_json():
    """Everything /policy needs, derived from the same rows as LEDGER.md."""
    obligations = [
        {"id": oid, "label": label, "cite": cite}
        for oid, (label, cite) in OBLIG.items()
    ]
    lgus = []
    for lgu in LGUS:
        cells = {}
        present = partial = tocollect = lapses = 0
        for oid in OBLIG:
            r = cell.get(lgu, {}).get(oid)
            status = r["status"] if r else "to-collect"
            lapse = r["lapse_type"] if r else ""
            lapse = lapse if lapse in REAL_LAPSES else None
            cells[oid] = {"status": status, "lapse": lapse}
            if status == "present":
                present += 1
            elif status == "partial":
                partial += 1
            else:
                tocollect += 1
            if lapse:
                lapses += 1
        lgus.append({
            "name": lgu,
            "slug": lgu.lower().replace(" ", "-"),
            "cells": cells,
            "totals": {
                "present": present,
                "partial": partial,
                "toCollect": tocollect,
                "lapses": lapses,
            },
        })
    return {
        "_generated": "by policy-layer/ledger/render_ledger.py — do not edit by hand",
        "obligations": obligations,
        "lgus": lgus,
    }


if os.path.isdir(os.path.dirname(JSON_OUT)):
    with open(JSON_OUT, "w", encoding="utf-8") as fh:
        json.dump(scorecard_json(), fh, indent=1, ensure_ascii=False)
        fh.write("\n")
    print(f"Wrote {JSON_OUT}")
else:
    print(f"(skipped {JSON_OUT} — web/src/lib not found)")

print()
print(matrix()); print(); print(progress())
