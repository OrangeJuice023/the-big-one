"""One-at-a-time (tornado) sensitivity analysis at the M7.2 anchor scenario.

For each epistemic modeling choice, rerun the full nested Monte Carlo with
that parameter's prior mean shifted by +/-1 SD (or to stated low/high values)
while everything else stays at defaults, and report how the national P50 and
the P10-P90 interval width move. This answers the reviewer question "which
assumption is doing the work?" and directly supports the paper's
limitations/robustness section.

Run:  python -m src.sensitivity      (from the model/ directory)
Writes: models/sensitivity_m72.json (+ prints a table)
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from src import scenarios as sc

M_ANCHOR = 7.2
OUT = Path(__file__).resolve().parents[1] / "models" / "sensitivity_m72.json"

# (label, module attribute, low value, high value)
PARAMS = [
    ("capital-output ratio K",  "K_RATIO_MEAN", sc.K_RATIO_MEAN - sc.K_RATIO_SD, sc.K_RATIO_MEAN + sc.K_RATIO_SD),
    ("max damage ratio MDR_MAX","MDR_MAX_MEAN", sc.MDR_MAX_MEAN - sc.MDR_MAX_SD, sc.MDR_MAX_MEAN + sc.MDR_MAX_SD),
    ("fragility midpoint M0",   "M0_MEAN",      sc.M0_MEAN + sc.M0_SD,           sc.M0_MEAN - sc.M0_SD),  # lower M0 = more fragile = higher loss
    ("spatial correlation rho", "SPATIAL_RHO",  0.25,                            0.75),
]


def run_once_scaled(exposure_scale: float = 1.0) -> dict:
    import copy
    original = copy.deepcopy(sc.REGION_PC_GRDP_PHP)
    for k in sc.REGION_PC_GRDP_PHP:
        sc.REGION_PC_GRDP_PHP[k] = original[k] * exposure_scale
    try:
        return run_once()
    finally:
        sc.REGION_PC_GRDP_PHP.update(original)


def run_once() -> dict:
    exposure, _ = sc.load_exposure()
    rng = np.random.default_rng(sc.SEED)
    national, _ = sc.run_mc(exposure, M_ANCHOR, rng)
    flat = national.ravel()
    return {
        "p10": float(np.percentile(flat, 10)),
        "p50": float(np.percentile(flat, 50)),
        "p90": float(np.percentile(flat, 90)),
    }


def main() -> None:
    base = run_once()
    base_width = base["p90"] - base["p10"]
    usd = lambda php: php / sc.PHP_PER_USD / 1e9

    rows = []
    for label, attr, low, high in PARAMS:
        original = getattr(sc, attr)
        res = {}
        for tag, val in (("low", low), ("high", high)):
            setattr(sc, attr, val)
            res[tag] = run_once()
        setattr(sc, attr, original)

        d_p50_low = res["low"]["p50"] / base["p50"] - 1
        d_p50_high = res["high"]["p50"] / base["p50"] - 1
        d_w_low = (res["low"]["p90"] - res["low"]["p10"]) / base_width - 1
        d_w_high = (res["high"]["p90"] - res["high"]["p10"]) / base_width - 1
        rows.append({
            "parameter": label, "attr": attr,
            "low_value": low, "high_value": high,
            "p50_change_low": round(d_p50_low, 3),
            "p50_change_high": round(d_p50_high, 3),
            "interval_width_change_low": round(d_w_low, 3),
            "interval_width_change_high": round(d_w_high, 3),
            "p50_usd_b_low": round(usd(res["low"]["p50"]), 1),
            "p50_usd_b_high": round(usd(res["high"]["p50"]), 1),
        })

    # Exposure scale (per-capita GRDP dict) handled separately from module scalars.
    res_lo, res_hi = run_once_scaled(0.9), run_once_scaled(1.1)
    rows.append({
        "parameter": "regional per-capita GRDP", "attr": "REGION_PC_GRDP_PHP",
        "low_value": "x0.9", "high_value": "x1.1",
        "p50_change_low": round(res_lo["p50"] / base["p50"] - 1, 3),
        "p50_change_high": round(res_hi["p50"] / base["p50"] - 1, 3),
        "interval_width_change_low": round((res_lo["p90"] - res_lo["p10"]) / base_width - 1, 3),
        "interval_width_change_high": round((res_hi["p90"] - res_hi["p10"]) / base_width - 1, 3),
        "p50_usd_b_low": round(usd(res_lo["p50"]), 1),
        "p50_usd_b_high": round(usd(res_hi["p50"]), 1),
    })

    rows.sort(key=lambda r: -max(abs(r["p50_change_low"]), abs(r["p50_change_high"])))

    print(f"baseline M{M_ANCHOR}: P50 ${usd(base['p50']):.1f}B "
          f"[P10 ${usd(base['p10']):.1f}B - P90 ${usd(base['p90']):.1f}B]\n")
    print(f"{'parameter':26} {'P50 @low':>10} {'P50 @high':>10} {'dP50 range':>16} {'dWidth range':>16}")
    for r in rows:
        print(f"{r['parameter']:26} "
              f"${r['p50_usd_b_low']:>7.1f}B ${r['p50_usd_b_high']:>7.1f}B "
              f"{r['p50_change_low']:+7.1%} / {r['p50_change_high']:+6.1%} "
              f"{r['interval_width_change_low']:+7.1%} / {r['interval_width_change_high']:+6.1%}")

    OUT.parent.mkdir(exist_ok=True)
    json.dump({"magnitude": M_ANCHOR, "baseline": base, "tornado": rows},
              open(OUT, "w"), indent=2)
    print(f"\nwrote {OUT}")


if __name__ == "__main__":
    main()
