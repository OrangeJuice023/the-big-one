# The Big One — Scenario-Based Economic Loss Estimator

Machine-learning loss estimation for a West Valley Fault ("The Big One")
earthquake in Metro Manila, per LGU, across magnitudes M6.5–M7.6, with
P10/P50/P90 uncertainty ranges. Fully static deployment — **zero runtime cost,
zero API keys.**

![CI](https://github.com/OrangeJuice023/big-one-loss-model/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)

See [ARCHITECTURE.md](ARCHITECTURE.md) for design, data flow, and the build
order; `docs/methodology.md` for the modeling write-up; and
[OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for the research frontier this v0.1
deliberately leaves open (uncertainty decomposition, validation under
covariate shift, Mmax as an uncertain parameter).

## Quick start (frontend, with placeholder data)

Synthetic placeholder scenarios ship in `web/public/data/scenarios/` so the UI
runs immediately (a banner marks them as non-estimates):

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

## Model pipeline (produces the real scenarios)

```bash
cd model
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt

pytest tests/ -v                 # 1. GMPE known-answer tests must pass
python -m src.ingest.noaa        # 2. pull NOAA NCEI significant earthquakes
# optional: download EM-DAT export to data/raw/emdat_earthquakes.xlsx, then:
python -m src.ingest.emdat
python -m src.features           # 3. build training table
python -m src.train              # 4. train quantile models + metrics.json
python -m src.scenarios          # 5. write real JSONs into web/public/data/
python -m src.validate           # 6. MMEIRS sanity check (M7.2 vs ~$48B)
python -m src.backtest_bohol     # 7. backtest vs the 2013 Bohol M7.2 event
```

## Deploy (free)

```bash
cd web && npm run build          # static export to web/out/
```
Push to GitHub → import repo on Vercel (Hobby) → set root directory to `web/`.
No environment variables needed — there are no keys.

## Before publishing real numbers — TODO checklist

- [ ] Replace `model/data/external/wvf_trace_approx.geojson` with the
      authoritative PHIVOLCS Valley Fault System trace (or the GEM Global
      Active Faults DB segment). The committed trace is an approximation.
- [ ] Fill `grdp_php_billions` in `model/data/external/exposure_ncr.csv` from
      PSA city-level GRDP releases, and verify `population_2020` against the
      PSA 2020 Census (values were entered from memory and must be checked).
- [ ] Replace the coarse decade CPI table in `src/features.py` with a proper
      CPI series (FRED CPIAUCSL).
- [ ] Update `PHP_PER_USD` in `src/scenarios.py` and the GDP constant in
      `web/src/components/SummaryStats.tsx`; note vintages in the methodology.
- [x] LGU boundary polygons ship in `web/public/data/lgu-boundaries.geojson`
      (PSGC 2023 lowres, via faeldon/philippines-json-maps) — the choropleth
      works out of the box.

## Data licenses

- NOAA NCEI Significant Earthquake Database — US public domain.
- EM-DAT — free for research; **raw exports must not be committed or
  redistributed** (`model/data/raw/` is gitignored for this reason).
- Basemap — OpenFreeMap (OpenStreetMap data © OpenStreetMap contributors).
- LGU boundaries — faeldon/philippines-json-maps (PSA/PSGC 2023-derived).
