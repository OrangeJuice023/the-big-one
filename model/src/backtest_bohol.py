"""Backtest: 2013 Mw7.2 Bohol earthquake (the model's answer key).

The Big One has not happened, so the West Valley Fault scenario cannot be
validated directly. The 2013 Bohol earthquake can: same magnitude (Mw 7.2),
shallow (12 km), on Philippine territory, with published ground truth
(see data/external/benchmarks.json for figures and sources).

Two independent checks:

1. HAZARD CHECK (runs without trained models):
   Does the AWW12 IPE reproduce the observed intensity pattern?
   Observed: PEIS VIII near the epicenter, PEIS VII at Tagbilaran (~34 km)
   and Metro Cebu. PEIS and MMI are closely comparable at these levels.

2. LOSS CHECK (needs trained models from src.train):
   Feed the Bohol event's features into the quantile models and compare the
   predicted loss interval against the monetized ground truth.
   IMPORTANT: the NDRRMC PHP 2.257B figure is public infrastructure only —
   a LOWER BOUND on total direct loss (73,002 damaged houses were counted in
   units, not pesos). The pass criterion is therefore:
       predicted P90 >= observed floor, and the floor is not orders of
       magnitude above P90 (i.e. the interval is consistent with a total
       that exceeds the floor by a plausible factor).
   This asymmetry is itself a finding — write it up, don't hide it.

Caveats to report alongside any result (these are features of the backtest,
not bugs): different fault mechanism (reverse vs. strike-slip WVF), rural/
semi-urban exposure vs. hyper-urban NCR, and a single event proves transfer
is *possible*, not that it is *reliable*. See OPEN_QUESTIONS.md.

Run:  python -m src.backtest_bohol      (from the model/ directory)
"""

from __future__ import annotations

import json
import math
from pathlib import Path

from src.gmpe import mmi, mmi_sigma

HERE = Path(__file__).resolve().parents[1]
BENCH = HERE / "data" / "external" / "benchmarks.json"
MODELS = HERE / "models"

PHP_PER_USD_2013 = 43.0  # approximate 2013 average; document vintage


def hazard_check(b: dict) -> bool:
    """Check the IPE against the observed PEIS pattern."""
    m, depth = b["magnitude"], b["depth_km"]
    ok = True

    # Near-epicenter (use a small Rrup for the epicentral corridor; the rupture
    # reached the surface, so near-field distances are a few km).
    near = mmi(m, 5.0)
    print(f"near-epicenter (Rrup~5km):  predicted MMI {near:.1f} "
          f"(sigma {mmi_sigma(5.0):.2f}) | observed PEIS VIII")
    ok &= abs(near - 8.0) <= 1.0

    # Tagbilaran, ~34 km from the epicenter. Rrup to the rupture plane is
    # somewhat less than epicentral distance; test both ends.
    for r in (25.0, 34.0):
        pred = mmi(m, r)
        print(f"Tagbilaran band (Rrup~{r:.0f}km): predicted MMI {pred:.1f} "
              f"(sigma {mmi_sigma(r):.2f}) | observed PEIS VII")
        ok &= abs(pred - 7.0) <= 1.0

    print("HAZARD CHECK:", "PASS (within 1 intensity unit ~ published sigma)"
          if ok else "FAIL — investigate GMPE before trusting scenarios")
    return ok


def loss_check(b: dict) -> None:
    """Compare model-predicted loss interval to the monetized ground truth."""
    try:
        import lightgbm as lgb
        import pandas as pd
    except ImportError:
        print("LOSS CHECK: skipped (install requirements first)")
        return
    model_files = {t: MODELS / f"lgbm_{t}.txt" for t in ("q10", "q50", "q90")}
    if not all(p.exists() for p in model_files.values()):
        print("LOSS CHECK: skipped — no trained models yet. "
              "Run src.features and src.train first.")
        return

    feats = pd.DataFrame([{
        "magnitude": b["magnitude"],
        "depth_km": b["depth_km"],
        "max_intensity": 8.0,   # PEIS VIII observed
        "year": 2013,
    }])
    pred = {
        t: float(10 ** lgb.Booster(model_file=str(p)).predict(feats)[0])
        for t, p in model_files.items()
    }
    floor_usd = b["infrastructure_damage_usd"]
    print(f"predicted total direct loss: "
          f"P10 ${pred['q10']/1e6:.0f}M | P50 ${pred['q50']/1e6:.0f}M | "
          f"P90 ${pred['q90']/1e6:.0f}M")
    print(f"observed monetized FLOOR (infrastructure only): ${floor_usd/1e6:.0f}M "
          f"(PHP {b['infrastructure_damage_php']/1e9:.2f}B, NDRRMC SitRep 35)")

    log_gap = math.log10(pred["q50"] / floor_usd)
    print(f"log10(P50 / floor) = {log_gap:+.2f} "
          "(expect positive and modest: total > infra-only floor)")
    if pred["q90"] < floor_usd:
        print("LOSS CHECK: FAIL — even P90 sits below the infrastructure-only "
              "floor; the model underestimates. Investigate before shipping.")
    elif log_gap > 1.5:
        print("LOSS CHECK: WEAK — P50 is >30x the floor; either the model "
              "overestimates or housing losses dominate. Check EM-DAT total.")
    else:
        print("LOSS CHECK: PASS — interval is consistent with ground truth "
              "given the floor-only caveat. Report the gap, don't hide it.")


def chain_check(b: dict) -> None:
    """v0.2 chain check: the SAME exposure x fragility Monte Carlo used for
    the Metro Manila scenarios, applied to Bohol 2013 with documented rough
    exposure. Every assumption is a visible parameter — this is a
    plausibility check of the chain, not a fit.

    Rough Bohol 2013 exposure (all flagged, replace when better data lands):
      population ~1.3M (2010 census: 1,255,128)
      per-capita nominal output ~PHP 120k (PH 2013 avg) x 0.6 provincial
        income factor (Bohol below national average)
      capital stock = K_RATIO x annual output (same prior as scenarios)
      intensity exposure bands (PHIVOLCS isoseismal, coarse):
        20% of exposure at MMI 8, 55% at MMI 7, 25% at MMI 6
    """
    import numpy as np

    from src.scenarios import (
        K_RATIO_MEAN, K_RATIO_SD, MDR_MAX_MEAN, MDR_MAX_SD,
        M0_MEAN, M0_SD, mdr,
    )

    POP, PC_OUT, INCOME_F = 1.3e6, 120e3, 0.6
    BANDS = [(8.0, 0.20), (7.0, 0.55), (6.0, 0.25)]
    PHP_USD_2013 = 43.0
    annual_output = POP * PC_OUT * INCOME_F

    rng = np.random.default_rng(42)
    n = 4000
    k = np.maximum(1.5, rng.normal(K_RATIO_MEAN, K_RATIO_SD, n))
    mx = np.clip(rng.normal(MDR_MAX_MEAN, MDR_MAX_SD, n), 0.10, 0.60)
    m0 = rng.normal(M0_MEAN, M0_SD, n)
    eps = rng.normal(0.0, 0.8, n)  # common intensity uncertainty per draw

    loss = np.zeros(n)
    for mmi_band, share in BANDS:
        loss += share * (mx / (1.0 + np.exp(-1.4 * (np.clip(mmi_band + eps, 1, 12) - m0))))
    loss = loss * k * annual_output  # PHP

    q = lambda p: float(np.percentile(loss, p)) / PHP_USD_2013
    floor = b["infrastructure_damage_usd"]
    print(f"v0.2 chain check (exposure x fragility MC, rough Bohol exposure):")
    print(f"  predicted total direct loss: P10 ${q(10)/1e6:.0f}M | "
          f"P50 ${q(50)/1e6:.0f}M | P90 ${q(90)/1e6:.0f}M")
    print(f"  observed monetized FLOOR: ${floor/1e6:.0f}M (infrastructure only)")
    ok = q(90) >= floor and q(50) / floor < 30
    print("  CHAIN CHECK:", "PASS — same engine as the NCR scenarios is "
          "consistent with Bohol ground truth" if ok else
          "OUTSIDE plausible range — revisit fragility priors or exposure "
          "assumptions before trusting NCR numbers")


def main() -> None:
    b = json.load(open(BENCH))["bohol_2013_backtest"]
    print(f"=== Backtest: {b['event']} (Mw {b['magnitude']}, "
          f"depth {b['depth_km']} km) ===\n")
    hazard_check(b)
    print()
    loss_check(b)
    print()
    chain_check(b)


if __name__ == "__main__":
    main()
