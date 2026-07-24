# policy-layer

Risk-to-policy layer for *The Big One*: joins the validated WVF loss model to
each LGU's actual DRRM documents and scores gaps against the 8 RA 10121
obligations. This folder is self-contained and push-ready.

## Layout
```
policy-layer/
├── README.md                     ← you are here
├── NEEDED.md                     ← what's still to collect/upload, per LGU
├── LEDGER.md                     ← generated status board (don't hand-edit)
├── ATTRIBUTION.md                ← source-type taxonomy + session audit
├── corpus_manifest.csv           ← ARTIFACTS: files on disk, OCR state
├── file_classification.csv       ← scanned-vs-text verification of uploads
├── ledger/
│   ├── status.csv                ← source of truth (LGU × obligation)  ← edit
│   ├── manifest.csv              ← PROVENANCE: source URLs, source_type,
│   │                                provenance_note (PENDING flags)    ← edit
│   ├── log.md                    ← session log + global to-dos         ← edit
│   └── render_ledger.py          ← rebuilds LEDGER.md from status.csv
├── corpus/<LGU>/                 ← cleaned per-LGU document text (RAG input)
│   └── _national/                ← shared RA 10121 / IRR / NDRP reference text
├── extracted_text/               ← raw text pulled from text-layer PDFs
├── fault_trace/                  ← authoritative GEM WVF trace (goes to model side)
├── findings/                     ← research write-ups (sessions 1–2)
└── atlas_fault_clips/            ← 43 PHIVOLCS fault-map clips (gitignored, 180MB)
```

## Two manifests — which is which

There are deliberately **two** manifest files. They track different things and
neither is redundant:

| File | Answers | Key columns |
|---|---|---|
| `corpus_manifest.csv` | *"What files do we physically have, and are they usable?"* | `local_path`, `is_scanned`, `needs_ocr` |
| `ledger/manifest.csv` | *"Where did this claim come from, and can we cite it?"* | `source_type`, `primary_url`, `provenance_note` |

Rule of thumb: **`corpus_manifest.csv` is about bytes on disk**; **`ledger/manifest.csv`
is about evidentiary standing**. A document can be in one and not the other —
e.g. Marikina Ord. 132 s.2011 is in `ledger/manifest.csv` (identified, cited,
flagged `PENDING`) but not in `corpus_manifest.csv` (we don't have the file).

When citing anything externally, `ledger/manifest.csv` is the one to check —
specifically its `provenance_note` column. See `ATTRIBUTION.md`.

## Update loop (keep the ledger live as you dump files)
1. Add cleaned doc text under `corpus/<LGU>/`; log the file in
   `corpus_manifest.csv` (path + OCR state) and its provenance in
   `ledger/manifest.csv` (source URL + source_type).
2. Edit `ledger/status.csv` (status + lapse) and `ledger/log.md` (narrative).
3. `python3 ledger/render_ledger.py` → regenerates `LEDGER.md`.

## Notes for pushing
- `atlas_fault_clips/*.png` is **gitignored** (180MB of reference rasters). If you
  want them versioned, use git-lfs; otherwise they stay local.
- `fault_trace/fault-trace_AUTHORITATIVE.geojson` is a **model-side** artifact —
  see `fault_trace/README.md` for where it goes (`web/public/data/`).
- Fill `primary_url` + `source_type` in `ledger/manifest.csv` at collection time —
  it's the citation link the scorecard needs.
```
```
