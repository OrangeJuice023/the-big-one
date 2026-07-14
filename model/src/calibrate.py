"""v0.3: Approximate Bayesian calibration of fragility parameters.

THE ML OF THIS PROJECT, stated plainly: the fragility curve and capital-output
ratio were elicited priors in v0.2 — and the sensitivity tornado showed the
fragility midpoint is the single dominant assumption (P50 swings -33%/+43%).
Here those parameters are LEARNED from data via likelihood-free (ABC
rejection) inference inside the same mechanistic forward model:

    physics fixed (GMPE, exposure accounting, fragility functional form)
    parameters learned (K, MDR_MAX, M0) from an observed Philippine event

Design choice that keeps the validation honest:
    CALIBRATE on the 1990 Luzon earthquake (Mw 7.7, US$369.6M reported).
    HOLD OUT the 2013 Bohol earthquake for out-of-sample validation
    (src.backtest_bohol automatically uses the posterior when it exists).

The observation is treated as interval-censored: official damage totals
undercount housing, so a draw is accepted if its predicted total falls in
[0.7x, 3.0x] of the reported figure — the window is an explicit, documented
assumption (see OPEN_QUESTIONS #3).

Run:  python -m src.calibrate       (from the model/ directory)
Writes: models/fragility_posterior.csv and prints prior -> posterior shifts.
"""

from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd

from src.scenarios import (
    K_RATIO_MEAN, K_RATIO_SD, MDR_MAX_MEAN, MDR_MAX_SD, M0_MEAN, M0_SD,
    MDR_SLOPE,
)

HERE = Path(__file__).resolve().parents[1]
BENCH = HERE / "data" / "external" / "benchmarks.json"
OUT = HERE / "models" / "fragility_posterior.csv"

N_PRIOR = 200_000
SEED = 42
ACCEPT_LO, ACCEPT_HI = 0.7, 3.0   # interval-censoring window around reported

# 1990 Luzon exposure bands (population at intensity), rough and documented:
# MMI 8: Baguio + Cabanatuan + Dagupan cores (~0.5M)
# MMI 7: surrounding provinces, Pangasinan/Nueva Ecija/La Union/Benguet (~3.5M)
# MMI 6: wider felt area incl. Metro Manila fringe (~8.0M)
LUZON_BANDS = [(8.0, 0.5e6), (7.0, 3.5e6), (6.0, 8.0e6)]
# Per-capita nominal output 1990: PH GDP/capita ~PHP 17.5k; Central/Northern
# Luzon below national average -> 0.8 factor. All rough, all visible.
PC_OUTPUT_PHP_1990 = 17.5e3
INCOME_FACTOR = 0.8


def banded_loss_php(bands, pc_out, income_f, k, mdr_max, m0, eps):
    """Vectorized forward model: exposure x fragility over intensity bands.
    k, mdr_max, m0, eps are arrays of shape (n,)."""
    total_pop = sum(p for _, p in bands)
    annual_output = total_pop * pc_out * income_f
    frac = np.zeros_like(k)
    for mmi_band, pop in bands:
        share = pop / total_pop
        mmi_eff = np.clip(mmi_band + eps, 1.0, 12.0)
        frac += share * (mdr_max / (1.0 + np.exp(-MDR_SLOPE * (mmi_eff - m0))))
    return k * annual_output * frac


def main() -> None:
    bench = json.load(open(BENCH))["luzon_1990_calibration"]
    observed_usd = bench["damage_usd_1990"]
    php_usd = bench["php_per_usd_1990"]

    rng = np.random.default_rng(SEED)
    k = np.maximum(1.5, rng.normal(K_RATIO_MEAN, K_RATIO_SD, N_PRIOR))
    mdr_max = np.clip(rng.normal(MDR_MAX_MEAN, MDR_MAX_SD, N_PRIOR), 0.10, 0.60)
    m0 = rng.normal(M0_MEAN, M0_SD, N_PRIOR)
    eps = rng.normal(0.0, 0.8, N_PRIOR)  # common intensity error, marginalized

    pred_usd = banded_loss_php(
        LUZON_BANDS, PC_OUTPUT_PHP_1990, INCOME_FACTOR, k, mdr_max, m0, eps
    ) / php_usd

    accept = (pred_usd >= ACCEPT_LO * observed_usd) & (pred_usd <= ACCEPT_HI * observed_usd)
    rate = accept.mean()
    post = pd.DataFrame({
        "k_ratio": k[accept], "mdr_max": mdr_max[accept], "m0": m0[accept],
    })
    OUT.parent.mkdir(exist_ok=True)
    post.to_csv(OUT, index=False)

    print(f"ABC rejection on Luzon 1990 (reported ${observed_usd/1e6:.0f}M, "
          f"window [{ACCEPT_LO}x, {ACCEPT_HI}x])")
    print(f"accepted {accept.sum():,}/{N_PRIOR:,} draws ({rate:.1%})\n")
    print(f"{'param':10} {'prior mean±sd':>18} {'posterior mean±sd':>20}")
    for name, arr, mu, sd in (
        ("K ratio", post["k_ratio"], K_RATIO_MEAN, K_RATIO_SD),
        ("MDR_MAX", post["mdr_max"], MDR_MAX_MEAN, MDR_MAX_SD),
        ("M0", post["m0"], M0_MEAN, M0_SD),
    ):
        print(f"{name:10} {mu:>10.3f}±{sd:.3f} {arr.mean():>13.3f}±{arr.std():.3f}")
    print(f"\nwrote {OUT} — src.scenarios and src.backtest_bohol will now use "
          "the posterior automatically (Bohol stays out-of-sample).")


if __name__ == "__main__":
    main()
