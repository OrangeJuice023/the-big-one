"""Counterfactual: how much of the West Valley Fault loss is attributable to
economic concentration in NCR?

MOTIVATION
The headline estimate is large partly because a very large share of national
economic activity sits inside a narrow corridor around an active fault. That
raises an obvious policy question: if activity were less concentrated in Metro
Manila, how much smaller would this scenario be?

WHAT THIS MEASURES, AND WHAT IT DOES NOT
This removes a share of NCR annual output from the exposure base and re-runs the
identical engine at the identical seed. Everything else is held fixed: the fault
geometry, the intensity prediction equation, the posterior parameters, the
random draws.

It therefore measures ONE thing: **the share of this scenario's loss that is
attributable to output located in NCR.**

It is NOT an estimate of the benefit of decentralisation. Relocated activity
does not vanish; it lands somewhere else, and that somewhere has its own
hazards -- typhoon, flood, volcanic, or a different fault. A complete answer
would require modelling the destination's exposure, which this project does not
do. Read the result as an attribution, not a recommendation.

The relocation is also treated as frictionless and instantaneous, which no real
policy is. The number is an upper bound on what redistribution could remove
from *this* hazard, not a forecast of what any policy would achieve.

Usage:
    python -m src.counterfactual_concentration

Requires the ABC posterior; run `python -m src.calibrate` first.
"""
from __future__ import annotations

import math

import numpy as np
import pandas as pd

from .scenarios import (
    EXPOSURE, MODELS, PHP_PER_USD, SEED,
    N_EPISTEMIC, N_ALEATORIC, SPATIAL_RHO,
    K_RATIO_MEAN, K_RATIO_SD, MDR_MAX_MEAN, MDR_MAX_SD, M0_MEAN, M0_SD,
    load_exposure, load_posterior, clamp_mmi, mdr, variance_split,
)
from .gmpe import mmi, mmi_sigma

MAGNITUDE = 7.2
SHARES = [0.0, 0.10, 0.20, 0.30, 0.50]


def run(exposure: pd.DataFrame, posterior: pd.DataFrame | None, seed: int):
    """Identical to scenarios.simulate, re-implemented here so the
    counterfactual cannot silently drift from the engine it is compared to."""
    rng = np.random.default_rng(seed)
    n_lgu = len(exposure)
    med_mmi = np.array([clamp_mmi(mmi(MAGNITUDE, r)) for r in exposure["rrup_km"]])
    sigma = np.array([mmi_sigma(r) for r in exposure["rrup_km"]])
    capital_base = exposure["grdp_php"].to_numpy()

    national = np.empty((N_EPISTEMIC, N_ALEATORIC))

    for j in range(N_EPISTEMIC):
        if posterior is not None:
            row = posterior.iloc[rng.integers(len(posterior))]
            k_ratio, mdr_max, m0 = float(row.k_ratio), float(row.mdr_max), float(row.m0)
        else:
            k_ratio = max(1.5, rng.normal(K_RATIO_MEAN, K_RATIO_SD))
            mdr_max = float(np.clip(rng.normal(MDR_MAX_MEAN, MDR_MAX_SD), 0.10, 0.60))
            m0 = rng.normal(M0_MEAN, M0_SD)
        capital = capital_base * k_ratio

        eta_common = rng.standard_normal(N_ALEATORIC)
        eta_site = rng.standard_normal((N_ALEATORIC, n_lgu))
        eps = sigma * (
            math.sqrt(SPATIAL_RHO) * eta_common[:, None]
            + math.sqrt(1.0 - SPATIAL_RHO) * eta_site
        )
        mmi_draws = np.clip(med_mmi[None, :] + eps, 1.0, 12.0)
        losses = capital[None, :] * mdr(mmi_draws, mdr_max, m0)
        national[j, :] = losses.sum(axis=1)

    return national


def main() -> None:
    exposure, weighting = load_exposure()
    posterior = load_posterior()
    if posterior is None:
        print("WARNING: no ABC posterior found; using priors. "
              "Run `python -m src.calibrate` for the calibrated result.")

    ncr_mask = exposure["region"] == "NCR"
    ncr_total = exposure.loc[ncr_mask, "grdp_php"].sum()
    all_total = exposure["grdp_php"].sum()

    print()
    print("=" * 74)
    print("COUNTERFACTUAL: economic concentration in NCR, M7.2 West Valley Fault")
    print("=" * 74)
    print(f"NCR LGUs in the model:      {int(ncr_mask.sum())} of {len(exposure)}")
    print(f"NCR share of exposure base: PHP {ncr_total/1e12:.2f}T of "
          f"PHP {all_total/1e12:.2f}T  ({100*ncr_total/all_total:.1f}%)")
    print()
    print("Each row removes that share of NCR output from the exposure base and")
    print("re-runs the identical engine at seed 42. Removed output is assumed to")
    print("relocate outside the fault corridor entirely.")
    print()
    print(f"{'NCR output':>10}  {'exposure':>10}  {'P50 loss':>11}  {'reduction':>10}  "
          f"{'P10-P90 (USD)':>22}")
    print(f"{'removed':>10}  {'base':>10}  {'(USD)':>11}  {'vs base':>10}")
    print("-" * 74)

    baseline_p50 = None
    rows = []
    for share in SHARES:
        exp = exposure.copy()
        exp.loc[ncr_mask, "grdp_php"] = exp.loc[ncr_mask, "grdp_php"] * (1.0 - share)
        national = run(exp, posterior, SEED)
        flat = national.ravel()
        p10, p50, p90 = (np.percentile(flat, p) / PHP_PER_USD for p in (10, 50, 90))
        if baseline_p50 is None:
            baseline_p50 = p50
        red = 100.0 * (1.0 - p50 / baseline_p50)
        base_t = exp["grdp_php"].sum() / 1e12
        print(f"{share*100:>9.0f}%  {base_t:>8.2f}T  ${p50/1e9:>9.1f}B  "
              f"{red:>9.1f}%  ${p10/1e9:>8.1f}B - ${p90/1e9:.1f}B")
        rows.append({
            "ncr_share_removed": share,
            "exposure_base_php": float(exp["grdp_php"].sum()),
            "p10_usd": float(p10), "p50_usd": float(p50), "p90_usd": float(p90),
            "reduction_pct_vs_baseline": float(red),
        })

    # elasticity: how much loss falls per point of NCR output removed
    r30 = next(r for r in rows if r["ncr_share_removed"] == 0.30)
    elasticity = r30["reduction_pct_vs_baseline"] / 30.0

    print("-" * 74)
    print()
    print("READING THIS")
    print(f"  Removing 30% of NCR output cuts the median loss by "
          f"{r30['reduction_pct_vs_baseline']:.1f}%,")
    print(f"  an elasticity of about {elasticity:.2f} — i.e. each percentage point of")
    print("  NCR output moved out of the corridor removes roughly "
          f"{elasticity:.2f}% of the loss.")
    print()
    print("  The relationship is close to linear because loss is linear in capital")
    print("  once intensity is fixed. Concentration matters through HOW MUCH sits")
    print("  in the corridor, not through any nonlinearity in the damage curve.")
    print()
    print("CAVEATS — these belong with any citation of these numbers")
    print("  1. Relocated output is assumed to leave the hazard entirely. In reality")
    print("     it lands somewhere with its own hazards. This is an attribution of")
    print("     THIS scenario's loss, not a net national benefit of decentralisation.")
    print("  2. Relocation is treated as frictionless and complete. No real policy is.")
    print("     Read the figures as an upper bound on what redistribution could remove")
    print("     from this specific hazard.")
    print("  3. Population is held fixed. Only output is moved, so casualties and")
    print("     displacement are unaffected in this experiment. The model does not")
    print("     estimate those anyway.")
    print("  4. Non-NCR LGUs in the corridor (Rizal, Bulacan, Cavite, Laguna) are")
    print("     untouched, so the residual loss at 100% removal would not be zero.")
    print()

    MODELS.mkdir(parents=True, exist_ok=True)
    out = MODELS / "counterfactual_concentration.csv"
    pd.DataFrame(rows).to_csv(out, index=False)
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
