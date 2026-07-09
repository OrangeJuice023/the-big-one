# The Big One: Scenario-Based Economic Loss Estimator

ML-driven earthquake loss estimation for a West Valley Fault rupture, with per-city
economic impact estimates across Metro Manila and adjacent provinces. Zero-cost stack:
all data sources, map tiles, model training, and hosting are free.

---

## 1. Design Principles

1. **Precompute, don't serve a model.** The only runtime input is magnitude (M6.5–M7.6,
   0.1 steps = 12 scenarios). All 12 are computed offline in Python and shipped as static
   JSON. Vercel serves a static Next.js app — no serverless ML, no cold starts, no cost.
2. **Uncertainty is a feature.** Every loss figure ships as a P10 / P50 / P90 range
   (quantile regression), never a single number. This is what makes the research page
   defensible.
3. **Two decoupled halves.** `/model` (Python, offline) and `/web` (Next.js, deployed)
   only communicate through `web/public/data/scenarios/*.json`. You can rebuild either
   side independently.

## 2. Repo Structure

```
big-one-loss-model/
├── README.md
├── ARCHITECTURE.md                  # this file
├── .gitignore                       # excludes data/raw (EM-DAT license forbids redistribution)
│
├── model/                           # Python side — runs offline, never deployed
│   ├── pyproject.toml               # deps: pandas, geopandas, scikit-learn, lightgbm, shapely
│   ├── data/
│   │   ├── raw/                     # NOT committed: EM-DAT export, NOAA download
│   │   ├── external/                # committed: fault trace GeoJSON, city boundaries,
│   │   │                            #   exposure table (GRDP, population per LGU)
│   │   └── processed/               # committed: cleaned training set (NOAA-derived only)
│   ├── src/
│   │   ├── ingest/
│   │   │   ├── noaa.py              # pull + clean NOAA NCEI significant earthquakes
│   │   │   └── emdat.py             # parse EM-DAT export, merge losses
│   │   ├── features.py              # feature engineering: log-loss target, exposure joins,
│   │   │                            #   inflation adjustment (CPI to 2026 PHP/USD)
│   │   ├── gmpe.py                  # ground motion: BSSA14-style attenuation,
│   │   │                            #   Joyner-Boore distance from fault trace per LGU centroid
│   │   ├── train.py                 # LightGBM quantile models (α = 0.1, 0.5, 0.9)
│   │   ├── validate.py              # holdout metrics + MMEIRS/World Bank sanity check
│   │   └── scenarios.py             # loop M6.5→7.6, run GMPE → model → per-LGU losses,
│   │                                #   emit JSON to ../web/public/data/scenarios/
│   ├── notebooks/                   # EDA only — nothing in web depends on these
│   │   ├── 01_training_data_eda.ipynb
│   │   ├── 02_gmpe_calibration.ipynb
│   │   └── 03_validation.ipynb
│   └── tests/
│       ├── test_gmpe.py             # known-answer tests vs published attenuation curves
│       └── test_features.py
│
├── web/                             # Next.js side — deployed to Vercel free tier
│   ├── package.json                 # next, react, maplibre-gl, recharts
│   ├── next.config.js               # output: 'export' → fully static, no server functions
│   ├── public/
│   │   ├── data/
│   │   │   ├── scenarios/           # m65.json … m76.json (per-LGU losses + quantiles)
│   │   │   ├── lgu-boundaries.geojson   # simplified (mapshaper) to keep payload small
│   │   │   └── fault-trace.geojson
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx             # map + magnitude slider + national summary panel
│   │   │   ├── methodology/page.tsx # the mini-research writeup (MDX)
│   │   │   └── about/page.tsx       # data sources, licenses, limitations
│   │   ├── components/
│   │   │   ├── LossMap.tsx          # MapLibre choropleth, colored by P50 loss
│   │   │   ├── MagnitudeSlider.tsx
│   │   │   ├── CityDetailPanel.tsx  # click LGU → loss range, GRDP share, intensity
│   │   │   └── SummaryStats.tsx     # national total, % of GDP, vs MMEIRS benchmark
│   │   └── lib/
│   │       └── scenarios.ts         # typed loaders for scenario JSON
│   └── .env.example                 # empty on purpose — no API keys anywhere
│
└── docs/
    ├── methodology.md               # source of truth for the research page (mirrored to MDX)
    └── data-dictionary.md           # every field in the exposure table + scenario JSON
```

## 3. Data Flow

```
NOAA NCEI + EM-DAT                    PHIVOLCS fault trace + PSA GRDP/census
        │                                          │
        ▼                                          ▼
  ingest/ → features.py                    external/ exposure table
        │                                          │
        ▼                                          │
   train.py ── LightGBM quantile models ──┐        │
                                          ▼        ▼
                              scenarios.py: for each magnitude →
                              GMPE (intensity per LGU) → model → loss quantiles
                                          │
                                          ▼
                        web/public/data/scenarios/m*.json
                                          │
                                          ▼
                      Next.js static export → Vercel (free)
```

## 4. Zero-Cost Stack Decisions

| Layer | Choice | Why it's free |
|---|---|---|
| Hosting | Vercel Hobby, `output: 'export'` (pure static) | No functions = no usage limits to hit |
| Map renderer | MapLibre GL JS | Open-source fork of Mapbox GL; no token |
| Basemap tiles | OpenFreeMap (or Carto Positron raster as fallback) | Free, no API key, no request caps for reasonable traffic |
| LGU boundaries | faeldon/philippines-json-maps (GitHub) or GADM 4.1 | Public GeoJSON; simplify with mapshaper CLI |
| Fault trace | PHIVOLCS HazardHunterPH export / GEM Global Active Faults DB (GitHub) | Public |
| Historical losses | NOAA NCEI Significant Earthquake DB | US public domain |
| Historical losses (supplement) | EM-DAT | Free for research use (registration; don't commit raw export) |
| Exposure | PSA city-level GRDP + 2020 census population | Public statistics |
| GMPE | Implement equations directly (BSSA14 or similar) | It's math, not a service |
| ML | LightGBM / scikit-learn, trained locally | Open source, runs on your laptop |
| Charts | Recharts | MIT |

Hard rule enforced by the architecture: **no runtime API calls to any third-party service.**
Everything the browser loads comes from the repo itself plus free basemap tiles. There is
nothing to rate-limit you and no key to leak.

## 5. Modeling Backbone (summary — full detail goes in docs/methodology.md)

**Target.** `log10(economic_loss_usd_2026)` per event, from NOAA/EM-DAT merged records
(~1,500–2,500 usable events after cleaning; expect heavy cleaning — this is the real work).

**Features.** Magnitude, focal depth, max intensity (or GMPE-estimated PGA), population
exposed, GDP-per-capita of affected country (World Bank, free), urban/rural flag, year
(to absorb residual reporting drift after inflation adjustment).

**Model.** Three LightGBM regressors at quantiles 0.1 / 0.5 / 0.9. Gradient boosting
handles the nonlinearity and mixed feature types; quantile objective gives honest ranges.
Baseline to beat: plain log-linear regression on magnitude + exposure (report both).

**Scenario application.** For each magnitude: compute Joyner-Boore distance from the WVF
trace to each LGU centroid → GMPE → intensity per LGU → build a per-LGU pseudo-event
(intensity + that LGU's exposure) → predict loss quantiles → aggregate to national total.

**Validation.**
1. Holdout split by *event* (not random rows) — temporal split preferred (train pre-2010,
   test 2010+) to expose reporting drift.
2. Sanity anchor: M7.2 national P50 should land within roughly 0.5×–2× of the MMEIRS/World
   Bank ₱2.5T figure. If it doesn't, investigate before shipping — but do not tune to match it;
   report the discrepancy and explain it in the methodology page.

**Known limitations to state up front** (these belong on the methodology page, verbatim):
survivorship and reporting bias in loss databases; direct losses only (no business
interruption / supply chain); LGU-centroid distance ignores intra-city variation; no
liquefaction or fire-following modeling; GRDP as exposure proxy overweights output vs
building stock value.

## 6. Build Order (each step has a verifiable exit criterion)

1. **Skeleton + boundaries** → repo scaffolded; LGU GeoJSON renders as a MapLibre
   choropleth with dummy data on localhost. *Verify: map loads, no API keys anywhere.*
2. **Exposure table** → committed CSV of NCR + Bulacan/Rizal/Cavite/Laguna LGUs with
   GRDP, population, centroid lat/lon. *Verify: totals reconcile to PSA regional figures.*
3. **GMPE module** → `gmpe.py` passes known-answer tests against published curves.
   *Verify: pytest green; M7.2 at Makati distance produces plausible Intensity VIII.*
4. **Training set** → cleaned, inflation-adjusted event table. *Verify: row count, loss
   distribution EDA notebook committed.*
5. **Model + validation** → quantile models beat the log-linear baseline on holdout.
   *Verify: metrics table in validate.py output; MMEIRS sanity check documented.*
6. **Scenario export + frontend wiring** → slider switches between 12 real JSONs.
   *Verify: national P50 at M7.2 visible next to the World Bank benchmark.*
7. **Methodology page + deploy** → MDX research writeup live on Vercel.
   *Verify: production URL loads with zero console errors and zero third-party keys.*

## 7. Recommendations (cost-bearing upgrades, deliberately out of scope)

- Mapbox or MapTiler basemaps for nicer cartography (free tiers exist but require keys
  and have caps).
- On-demand inference (user-set epicenter, time-of-day casualty modeling) via a small
  FastAPI service on Render/Fly — only needed if inputs go beyond magnitude.
- OpenQuake full stochastic event sets instead of a single GMPE — heavier compute,
  research-grade hazard.
- Barangay-level exposure via WorldPop rasters + OSM building footprints — free data but
  meaningful processing cost in time.
