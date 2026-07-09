# Data Dictionary

## model/data/external/exposure_ncr.csv
| column | description |
|---|---|
| lgu | LGU display name (17 NCR cities/municipality) |
| psgc_prefix | PSGC code prefix for joining to boundary files |
| population_2020 | 2020 Census population — **verify against PSA before publishing** |
| centroid_lat/lon | approximate LGU centroid used for Rrup distance |
| grdp_php_billions | city-level GRDP (PSA) — blank until filled; pipeline falls back to population weights and flags it |

Extension: add Rizal/Cavite/Laguna/Bulacan LGUs as new rows — the pipeline
needs no code changes, only boundary/centroid/exposure values.

## web/public/data/scenarios/m{65..76}.json
| field | description |
|---|---|
| magnitude | scenario moment magnitude |
| synthetic | true = placeholder data, UI shows a warning banner |
| weighting | "grdp" or "population_fallback" |
| national_loss_usd/php | P10/P50/P90 national totals |
| lgus[] | per-LGU: rrup_km, mmi, population, lat/lon, loss_usd/php quantiles |

## web/public/data/lgu-boundaries.geojson (ships with repo)
City-level polygons for the choropleth — already included (17 NCR LGUs, PSGC 2023 lowres from faeldon/philippines-json-maps, ~8 KB, joined to scenarios by the `lgu` property). To regenerate or extend to nearby provinces, free sources:
1. github.com/faeldon/philippines-json-maps — NCR city/municipality GeoJSON
   (grab the lowest-resolution variant).
2. GADM 4.1 level-2 (gadm.org, free for non-commercial use).

Simplify before committing to keep the payload small:
```bash
npx mapshaper input.json -simplify 8% keep-shapes -o web/public/data/lgu-boundaries.geojson
```
The map auto-detects the file; without it, scaled circle markers are used.

## model/data/raw/ (gitignored)
NOAA API pull and the EM-DAT export. EM-DAT's license forbids redistribution —
never commit anything derived verbatim from it.
