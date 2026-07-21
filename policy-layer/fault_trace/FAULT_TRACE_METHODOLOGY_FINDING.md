# Methodology finding — authoritative West Valley Fault trace (resolves limitation #5)

_Pushed from a full read of the repo. The loss model's committed fault trace
(`web/public/data/fault-trace.geojson`) is a 12-point hand-drawn **placeholder**
marked "REPLACE before publishing" (methodology.md limitation #5). This
replaces it with an authoritative trace and quantifies the impact honestly._

## What was done
- Pulled the **West Valley Fault** from the **GEM Global Active Faults Database**
  (harmonized), `GEMScienceTools/gem-global-active-faults@master` — the repo's
  own stated option (b) for the trace fix. Feature: `West Valley Fault`,
  **108 vertices, Dextral-Normal**, machine-readable and properly georeferenced.
- **Cross-checked** against the two independent sources now in hand: the
  PHIVOLCS Valley Fault System Atlas sheets (Taguig→Cavite/Laguna corridor) and
  Marikina Ord. 020 s.2023, which cites the PHIVOLCS 129.47 km extent through
  QC/Marikina/Pasig/Makati/Taguig/Muntinlupa. The GEM trace sits in the same
  corridor.
- Wrote `fault-trace_AUTHORITATIVE.geojson` (drop-in replacement).

## Length caveat (a real finding, not a rounding issue)
GEM's harmonized WVF measures **99.0 km**; PHIVOLCS/Ord. 020 cite **129.47 km**.
The GEM segment is shorter at the **Bulacan (north) and Laguna (south) ends**; it
fully covers the **NCR reach** that drives the modeled losses. So GEM is safe for
the current 35-LGU distances, but if the fault-corridor LGUs at the extremes
(San Jose del Monte, Biñan/San Pedro) ever need tighter distances, stitch the
Atlas-digitized ends onto the GEM core. (The **East Valley Fault**, 103 vertices,
is also in GEM if the model ever adds it.)

## Impact — placeholder vs. authoritative (repo centroids, repo AWW12 IPE, M7.2)

Distance recomputed with the repo's own flat-earth point-to-segment method; the
placeholder column reproduces the **live published `rrup_km`** exactly (Makati
5.62, Marikina 0.44, Pasay 7.34…), so this is apples-to-apples.

| LGU | rrup placeholder | rrup authoritative | Δrrup km | ΔMMI @M7.2 |
|---|---:|---:|---:|---:|
| Makati | 5.62 | 3.95 | **−1.67** | +0.10 |
| Pasig | 0.03 | 1.66 | **+1.63** | −0.02 |
| Pasay | 7.34 | 6.09 | −1.25 | +0.08 |
| Taguig | 1.57 | 0.41 | −1.16 | +0.02 |
| Marikina | 0.44 | 1.44 | +1.00 | −0.01 |
| Quezon City | 5.90 | 5.52 | −0.38 | +0.02 |
| Muntinlupa | 1.05 | 0.69 | −0.35 | ~0 |
| Parañaque | 3.21 | 3.46 | +0.25 | −0.01 |
| Pateros | 0.78 | 0.89 | +0.11 | ~0 |

## Honest conclusion (the finding)
1. The placeholder had **real geometric errors** — up to ~1.7 km, and it placed
   Pasig essentially *on* the fault (0.03 km) when the authoritative trace is
   1.66 km away. Adopting GEM fixes the geometry and removes an indefensible
   "REPLACE before publishing" flag from a live model.
2. **But** at M7.2 the AWW12 intensity is **saturated near the fault**, so those
   distance corrections move MMI by only **±0.1** — headline near-fault losses
   barely change. The correction matters *more* for (a) **lower-magnitude
   scenarios** (M6.0–6.5, where the IPE is steeper) and (b) any **per-LGU
   distance claim** (Pasig's "0 km from the fault" was an artifact).
3. Net: swap the trace (correctness + credibility), regenerate scenarios, and
   **downgrade limitation #5 from open to resolved-with-bounded-sensitivity** —
   the sensitivity itself is now a documented, quantified result rather than an
   unquantified caveat.

## Repo change to make
1. Replace `web/public/data/fault-trace.geojson` with
   `fault-trace_AUTHORITATIVE.geojson` (rename on copy).
2. Re-run the scenario generator so every `m{60..76}.json` `rrup_km`/`mmi`
   refreshes (the web map reads these directly).
3. Edit methodology.md + methodology/page.tsx limitation #5 → replace "approximate
   until replaced with PHIVOLCS data" with the GEM source line + this sensitivity
   note. Keep the 99 vs 129 km caveat visible.
4. Attribution: GEM GAF DB is CC-BY-4.0 — credit "GEM Global Active Faults
   Database" in the methodology/attributions.

_Files: `fault-trace_AUTHORITATIVE.geojson` (drop-in). Source: GEM harmonized
GAF DB @ master._
