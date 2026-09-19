# Provenance: `population_2020` in `exposure_ncr.csv`

All 35 values verified against Philippine Statistics Authority releases for the
**2020 Census of Population and Housing (2020 CPH)**, reference date
**01 May 2020**. Verified 19 September 2026. No value required correction.

This matters because the 27 LGUs without published city-level GDP are weighted
by `population_2020 x regional per-capita output`, which is about **39% of the
total exposure base**. Every loss figure the project publishes rests partly on
these numbers, and an earlier README noted they had been entered from memory
and were unchecked.

## Metro Manila — 17 LGUs

Source: PSA, *Highlights of the National Capital Region (NCR) Population,
2020 CPH*, Reference No. 2021-314, released 23 August 2021 — Table 3, "Total
Population by Highly Urbanized City/Municipality Based on Various Censuses".

https://psa.gov.ph/content/highlights-national-capital-region-ncr-population-2020-census-population-and-housing-2020

All 17 rows matched the table exactly.

**Independent cross-check:** the 17 values sum to **13,484,462**, which is the
regional total PSA publishes for NCR in the same release. This is checked
automatically by `model/scripts/verify_claims.py` on every run. A compensating
pair of transcription errors summing to zero is not a realistic failure mode,
so the sum matching is strong evidence that each row is correct.

## Fault corridor — 18 LGUs

No single PSA table covers these: they span four provinces (Bulacan, Rizal,
Laguna, Cavite), so there is no published subtotal to check against. Each was
verified individually.

**Bulacan (1)** — San Jose del Monte 651,813.
PSA, *Highlights of the Philippine Population, 2020 CPH* (largest component
cities).

**From PSA Region IV-A (CALABARZON) 2020 CPH, Table 5** — "Top Ten Most
Populous Cities/Municipalities", released 23 August 2021
(https://psa.gov.ph/content/highlights-region-iv-calabarzon-population-2020-census-population-and-housing-2020-cph):

| LGU | Province | 2020 |
|---|---|---|
| Antipolo | Rizal | 887,399 |
| Dasmariñas | Cavite | 703,141 |
| Bacoor | Cavite | 664,625 |
| Calamba | Laguna | 539,671 |
| Imus | Cavite | 496,794 |
| General Trias | Cavite | 450,583 |
| Rodriguez (Montalban) | Rizal | 443,954 |
| Santa Rosa | Laguna | 414,812 |
| Biñan | Laguna | 407,437 |
| Taytay | Rizal | 386,451 |

**Remaining 7**, below the regional top ten, verified against PSA-derived
per-LGU profiles (PhilAtlas, which states PSA as its source for population
counts) and corroborating references:

| LGU | Province | 2020 | Corroboration |
|---|---|---|---|
| Cainta | Rizal | 376,933 | |
| Cabuyao | Laguna | 355,330 | barangay figures sum consistently |
| San Pedro | Laguna | 326,001 | equals the published population of Laguna's 1st congressional district, which comprises San Pedro alone |
| Silang | Cavite | 295,644 | |
| San Mateo | Rizal | 273,306 | barangay figures sum consistently |
| General Mariano Alvarez | Cavite | 172,433 | |
| Carmona | Cavite | 106,256 | with GMA and Silang, sums to the published 574,333 for Cavite's 5th district |

These seven rest on a secondary source that cites PSA, not on a PSA table read
directly. That is a weaker chain than the other 28, though two of the seven are
independently corroborated by district totals. If a reviewer presses on
exposure provenance, this is the honest answer: **28 of 35 from PSA primary
tables, 7 from PSA-derived compilations.**

## Note on vintage

These are 2020 figures. The **2024 Census of Population (2024 POPCEN)** has
since been released and moves some of these materially — Taguig, for one, grew
from 886,722 to 1,308,085, largely through the transfer of Embo barangays from
Makati. The model deliberately stays on 2020 because the per-capita output
constants and the PSA city-level GDP series it pairs them with are aligned to
that period. Mixing 2024 population with 2018-based GDP would introduce a
larger error than it removes.

This is a documented choice, not an oversight. Revisit it when the exposure
base is rebuilt on a consistent later vintage.
