# The Big One — Scenario-Based Economic Loss Estimator

Machine-learning loss estimation for a West Valley Fault ("The Big One")
earthquake in Metro Manila and the surrounding fault corridor, per LGU, across
magnitudes M6.0–M7.2 in 0.1 steps plus an M7.5 stress test, with P10/P50/P90
uncertainty ranges.

The map, the scenarios and every page are statically rendered. One server
route, `/api/ask`, backs the grounded query tool over the policy corpus and
needs an LLM API key; see Environment below.

**Live:** https://the-big-one-one.vercel.app

![CI](https://github.com/OrangeJuice023/big-one-loss-model/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-teal.svg)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)

See [ARCHITECTURE.md](ARCHITECTURE.md) for design, data flow, and the build
order; `docs/methodology.md` for the modeling write-up; and
[OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) for the research frontier this v0.1
deliberately leaves open (uncertainty decomposition, validation under
covariate shift, Mmax as an uncertain parameter).

## Features

- Interactive choropleth over 35 LGUs (the 17 NCR LGUs plus 18 fault-corridor
  LGUs in Bulacan, Rizal, Laguna and Cavite; PSGC 2023 boundaries) with a
  **"Simulate rupture"** animation: the fault ruptures progressively, shaking
  reaches each LGU in distance order (using each LGU's actual rupture
  distance), and the national loss counter counts up to the scenario P50.
- Magnitude scenarios M6.0-M7.2 (PHIVOLCS maximum-credible anchor) plus an
  M7.5 paleoseismic stress test.
- P10/P50/P90 loss intervals per LGU and nationally.
- **Real-event comparables panel**: Kobe 1995, Haiti 2010, Bohol 2013 - same
  magnitude class, losses five orders of magnitude apart. The empirical case
  for wide uncertainty intervals (all figures cited in
  `model/data/external/benchmarks.json`).
- Bohol 2013 backtest (`src/backtest_bohol.py`) - the hazard check passes
  against observed PEIS intensities.

## Quick start (frontend)

Real model output ships in `web/public/data/scenarios/` (every file carries
`"synthetic": false`), so the UI runs immediately without training anything:

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
python -m src.calibrate          # 5. ABC-calibrate fragility on Luzon 1990
python -m src.scenarios          # 6. write real JSONs into web/public/data/
python -m src.validate           # 7. MMEIRS sanity check (M7.2 vs ~$48B)
python -m src.backtest_bohol     # 8. OUT-OF-SAMPLE validation vs Bohol 2013
```

## Deploy (free)

```bash
cd web && npm run build          # static export to web/out/
```
Push to GitHub → import repo on Vercel (Hobby) → set root directory to `web/`.

### Environment

Only `/api/ask` needs configuration. Everything else is static.

| Variable | Default | Purpose |
|---|---|---|
| `GROQ_API_KEY` or `LLM_API_KEY` | — | **required for `/api/ask`**; the rest of the site works without it |
| `LLM_MODEL` | `openai/gpt-oss-120b` | Groq retired `llama-3.3-70b-versatile` on 2026-08-16 |
| `LLM_BASE_URL` | `https://api.groq.com/openai/v1` | any OpenAI-compatible endpoint |
| `LLM_REASONING_EFFORT` | `low` | gpt-oss only; reasoning tokens draw on the output budget |
| `LLM_MAX_OUTPUT_TOKENS` | `1200` | raise if answers come back truncated |
| `LLM_TOP_K` | `4` | retrieved excerpts per query |
| `RATELIMIT_PER_IP` | `5` | requests per IP per window |
| `RATELIMIT_WINDOW_SECONDS` | `600` | |
| `RATELIMIT_DAILY_CAP` | `150` | protects the free-tier token budget |

Rate limiting needs a Redis store (Upstash, via the Vercel Marketplace). With
no store connected the limiter fails open and logs, so local development and
preview builds are unaffected.

## Before publishing real numbers — TODO checklist

- [x] Fault trace: `src/scenarios.py` now loads `wvf_trace_gem.geojson` (GEM
      Global Active Faults DB). The older `wvf_trace_approx.geojson` is
      retained for comparison but is no longer read by the pipeline.
- [ ] `grdp_php_billions` in `model/data/external/exposure_ncr.csv` is filled
      for **8 of 35 LGUs** (PSA city-level GDP, roughly 85% of NCR output).
      The remaining 27 fall back to population × regional per-capita output,
      so every scenario JSON reports `"weighting": "mixed_grdp_population"`.
      Fill the rest, and verify `population_2020` against the PSA 2020 Census
      (values were entered from memory and must be checked).
- [ ] `GDP_DEFLATOR_2018_TO_2024 = 1.30` in `src/scenarios.py` is a placeholder
      that multiplies the entire exposure base. Replace with the exact PSA
      implicit price deflator and cite the release.
- [ ] Replace the coarse decade CPI table in `src/features.py` with a proper
      CPI series (FRED CPIAUCSL).
- [ ] Update `PHP_PER_USD` in `src/scenarios.py` and the GDP constant in
      `web/src/components/SummaryStats.tsx`; note vintages in the methodology.
- [x] LGU boundary polygons ship in `web/public/data/lgu-boundaries.geojson`
      (35 features, PSGC 2023, via faeldon/philippines-json-maps) — the choropleth
      works out of the box.

## Data licenses

- NOAA NCEI Significant Earthquake Database — US public domain.
- EM-DAT — free for research; **raw exports must not be committed or
  redistributed** (`model/data/raw/` is gitignored for this reason).
- Basemap — OpenFreeMap (OpenStreetMap data © OpenStreetMap contributors).
- LGU boundaries — faeldon/philippines-json-maps (PSA/PSGC 2023-derived).
