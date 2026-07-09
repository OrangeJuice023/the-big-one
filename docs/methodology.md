# Methodology (source of truth — mirror to web/src/app/methodology/page.tsx)

## Framing
Scenario-based loss estimation with quantified uncertainty (PAGER-style), not
prediction. All outputs are P10/P50/P90 ranges.

## Hazard
- Fault: West Valley Fault; scenarios M6.0–M7.2 (0.1 steps) anchored on the
  PHIVOLCS maximum-credible magnitude of 7.2, plus an M7.5 stress test
  (paleoseismic upper bound). Mmax treated as epistemically uncertain.
- IPE: Allen, Wald & Worden (2012), active crustal, Rrup version, coefficients
  cross-checked against GEM OpenQuake (see src/gmpe.py docstring).
- Distance: LGU centroid to surface trace (Joyner-Boore-style approximation of
  Rrup; slight near-fault understatement, noted as a limitation).

## Vulnerability & loss
- Training data: NOAA NCEI + EM-DAT historical events with economic losses,
  inflation-adjusted to 2026 USD.
- Model: LightGBM quantile regression (α = 0.1/0.5/0.9); baseline = OLS on
  magnitude. Temporal holdout at 2010.
- Spatial allocation: event-level prediction distributed across LGUs by
  exposure weight × logistic damage ratio in MMI (ramp ~VI→X).

## Validation
- Pinball loss + MAE vs baseline on holdout; P10–P90 empirical coverage ≈ 0.8.
- Backtest: 2013 Mw7.2 Bohol earthquake (src/backtest_bohol.py) — intensity
  pattern (PEIS VIII/VII) and loss interval vs. the ₱2.257B NDRRMC monetized
  floor (infrastructure-only; housing counted in units — a lower bound).
- Sanity anchors: M7.2 national P50 vs. PHIVOLCS 2013 ₱2.4T building-damage
  estimate and World Bank ~USD 48B. Never tuned to match; discrepancies get
  explained here. All benchmark figures with sources:
  model/data/external/benchmarks.json.

## Limitations (keep this list honest and visible)
1. Loss databases are survivorship/reporting biased and unevenly deflated.
2. Direct losses only — no business interruption, supply chain, or fiscal
   second-order effects.
3. Centroid distances ignore intra-LGU variation; no site amplification
   (Marikina Valley sediments would amplify shaking — future work: Vs30).
4. No liquefaction, landslide, or fire-following modeling.
5. Committed fault trace is approximate until replaced with PHIVOLCS data.
6. GRDP weights proxy exposure imperfectly (output ≠ building stock value).
