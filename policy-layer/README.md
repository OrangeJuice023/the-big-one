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
├── manifest.csv                  ← provenance for every collected doc
├── file_classification.csv       ← scanned-vs-text verification of uploads
├── ledger/
│   ├── status.csv                ← source of truth (LGU × obligation)  ← edit
│   ├── log.md                    ← session log + global to-dos         ← edit
│   └── render_ledger.py          ← rebuilds LEDGER.md from the two above
├── corpus/<LGU>/                 ← cleaned per-LGU document text (RAG input)
│   └── _national/                ← shared RA 10121 / IRR / NDRP reference text
├── extracted_text/               ← raw text pulled from text-layer PDFs
├── fault_trace/                  ← authoritative GEM WVF trace (goes to model side)
├── findings/                     ← research write-ups (sessions 1–2)
└── atlas_fault_clips/            ← 43 PHIVOLCS fault-map clips (gitignored, 180MB)
```

## Update loop (keep the ledger live as you dump files)
1. Add cleaned doc text under `corpus/<LGU>/`, log provenance in `manifest.csv`.
2. Edit `ledger/status.csv` (status + lapse) and `ledger/log.md` (narrative).
3. `python3 ledger/render_ledger.py` → regenerates `LEDGER.md`.

## Notes for pushing
- `atlas_fault_clips/*.png` is **gitignored** (180MB of reference rasters). If you
  want them versioned, use git-lfs; otherwise they stay local.
- `fault_trace/fault-trace_AUTHORITATIVE.geojson` is a **model-side** artifact —
  see `fault_trace/README.md` for where it goes (`web/public/data/`).
- Fill `source_url` in `manifest.csv` at collection time — it's the citation link
  the scorecard needs.
```
```
