"""v0.2 scenario engine: exposure-based losses with Monte Carlo UQ.

WHY v0.2 (the v0.1 lesson, kept honest): the event-level ML model has no
exposure features, so it predicts what a *typical global* M7.2 costs. It
passed the Bohol backtest (an in-distribution event) and underestimated the
Metro Manila scenario ~100x (an exposure outlier). Division of labor now:

  LEVEL    <- exposure: LGU capital stock (GRDP x capital-output ratio)
              x an intensity-dependent mean damage ratio (MDR) curve
  HAZARD UQ (aleatoric) <- AWW12 sigma, sampled per LGU with partial
              spatial correlation (a common intra-event term)
  MODEL UQ (epistemic)  <- priors over fragility parameters and the
              capital-output ratio
  CROSS-CHECK <- the trained event-level quantile models (reported in the
              JSON as ml_event_check; NOT used for the headline numbers)

Uncertainty split via the law of total variance with nested sampling:
  Var_total = E_epistemic[Var_aleatoric] + Var_epistemic[E_aleatoric]

Run:  python -m src.scenarios       (from the model/ directory)
Writes: ../web/public/data/scenarios/m{60..72,75}.json
"""

from __future__ import annotations

import json
import math
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd

from src.gmpe import clamp_mmi, distance_to_fault_km, load_fault_trace, mmi, mmi_sigma

HERE = Path(__file__).resolve().parents[1]
EXPOSURE = HERE / "data" / "external" / "exposure_ncr.csv"
FAULT = HERE / "data" / "external" / "wvf_trace_approx.geojson"
MODELS = HERE / "models"
WEB_DATA = HERE.parent / "web" / "public" / "data"

MAGNITUDES = [round(6.0 + 0.1 * i, 1) for i in range(13)] + [7.5]

# ---- economic constants (update + document vintage in methodology) ----------
PHP_PER_USD = 58.0
# Per-capita regional output (PHP, nominal, ~2024) for the population
# fallback when exposure_ncr.csv GRDP is blank. Rough figures consistent
# with PSA regional accounts orders of magnitude — TODO: replace with exact
# PSA numbers and cite the release. NCR ~PHP 8.4T / 13.48M ≈ 623k.
REGION_PC_GRDP_PHP = {
    "NCR": 623e3,
    "CALABARZON": 240e3,
    "CENTRAL_LUZON": 230e3,
}
NCR_GRDP_PHP = 8.4e12  # retained for sensitivity.py scaling only

# ---- epistemic priors (documented modeling choices, sampled in MC) ----------
# Capital-output ratio: exposed capital stock ~ K x annual GRDP.
K_RATIO_MEAN, K_RATIO_SD = 2.8, 0.4          # macro literature range ~2.5-3.2
# Mean damage ratio curve: MDR(mmi) = MDR_MAX / (1 + exp(-k*(mmi - M0)))
# Shaped to HAZUS-like aggregates: ~1-3% at VII, ~5-10% at VIII, ~15-20% at IX.
MDR_MAX_MEAN, MDR_MAX_SD = 0.35, 0.08
M0_MEAN, M0_SD = 9.0, 0.4
MDR_SLOPE = 1.4

# ---- aleatoric structure ----------------------------------------------------
# Intra-event spatial correlation of ground-motion residuals: one common
# (event-wide) term plus site terms. rho = share of variance that is common.
SPATIAL_RHO = 0.5

# ---- Monte Carlo size (nested: epistemic x aleatoric) ------------------------
N_EPISTEMIC = 60
N_ALEATORIC = 60
SEED = 42


def mdr(mmi_val: np.ndarray, mdr_max: float, m0: float) -> np.ndarray:
    return mdr_max / (1.0 + np.exp(-MDR_SLOPE * (mmi_val - m0)))


def load_exposure() -> tuple[pd.DataFrame, str]:
    exposure = pd.read_csv(EXPOSURE)
    trace = load_fault_trace(FAULT)
    exposure["rrup_km"] = [
        distance_to_fault_km(r.centroid_lat, r.centroid_lon, trace)
        for r in exposure.itertuples()
    ]
    if exposure["grdp_php_billions"].notna().all():
        exposure["grdp_php"] = exposure["grdp_php_billions"] * 1e9
        weighting = "grdp"
    else:
        pc = exposure["region"].map(REGION_PC_GRDP_PHP)
        if pc.isna().any():
            missing = exposure.loc[pc.isna(), "region"].unique()
            raise SystemExit(f"no per-capita GRDP for regions: {missing}")
        exposure["grdp_php"] = exposure["population_2020"] * pc
        weighting = "population_fallback"
        total = exposure["grdp_php"].sum()
        print("note: GRDP incomplete in exposure_ncr.csv — using population x "
              f"regional per-capita output (total PHP {total/1e12:.1f}T; "
              "flagged in JSON output)")
    return exposure, weighting


def run_mc(exposure: pd.DataFrame, magnitude: float, rng: np.random.Generator):
    """Nested MC. Returns per-draw national losses (epi x alea) and per-LGU
    flattened draws, in PHP."""
    n_lgu = len(exposure)
    med_mmi = np.array([clamp_mmi(mmi(magnitude, r)) for r in exposure["rrup_km"]])
    sigma = np.array([mmi_sigma(r) for r in exposure["rrup_km"]])
    capital_base = exposure["grdp_php"].to_numpy()

    national = np.empty((N_EPISTEMIC, N_ALEATORIC))
    lgu_draws = np.empty((N_EPISTEMIC * N_ALEATORIC, n_lgu))

    for j in range(N_EPISTEMIC):
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
        losses = capital[None, :] * mdr(mmi_draws, mdr_max, m0)  # (alea, lgu)

        national[j, :] = losses.sum(axis=1)
        lgu_draws[j * N_ALEATORIC:(j + 1) * N_ALEATORIC, :] = losses

    return national, lgu_draws


def variance_split(national: np.ndarray) -> dict:
    within = national.var(axis=1).mean()        # E_e[Var_a]  -> aleatoric
    between = national.mean(axis=1).var()       # Var_e[E_a]  -> epistemic
    total = within + between
    return {
        "aleatoric_share": round(within / total, 3),
        "epistemic_share": round(between / total, 3),
        "note": "law of total variance on national loss; shaking randomness "
                "(AWW12 sigma, spatial rho=0.5) vs fragility/capital-ratio priors",
    }


def ml_event_check(magnitude: float, max_mmi: float) -> dict | None:
    """Event-level quantile models as a cross-check (not the headline)."""
    files = {t: MODELS / f"lgbm_{t}.txt" for t in ("q10", "q50", "q90")}
    if not all(p.exists() for p in files.values()):
        return None
    import lightgbm as lgb
    feats = pd.DataFrame([{
        "magnitude": magnitude, "depth_km": 10.0,
        "max_intensity": max_mmi, "year": date.today().year,
    }])
    return {
        t: round(float(10 ** lgb.Booster(model_file=str(p)).predict(feats)[0]))
        for t, p in files.items()
    }


def main() -> None:
    exposure, weighting = load_exposure()
    WEB_DATA.joinpath("scenarios").mkdir(parents=True, exist_ok=True)

    for m in MAGNITUDES:
        # Common random numbers: identical draws across magnitudes, so
        # scenario differences reflect physics, not Monte Carlo noise
        # (and the loss-vs-magnitude curve is monotone as it should be).
        rng = np.random.default_rng(SEED)
        national, lgu_draws = run_mc(exposure, m, rng)
        flat = national.ravel()
        q = lambda a, p: float(np.percentile(a, p))
        med_mmi = [clamp_mmi(mmi(m, r)) for r in exposure["rrup_km"]]

        lgus = []
        for i, r in enumerate(exposure.itertuples()):
            d = lgu_draws[:, i]
            php = {"q10": round(q(d, 10)), "q50": round(q(d, 50)), "q90": round(q(d, 90))}
            lgus.append({
                "lgu": r.lgu,
                "psgc_prefix": str(r.psgc_prefix),
                "rrup_km": round(r.rrup_km, 2),
                "mmi": round(med_mmi[i], 2),
                "population": int(r.population_2020),
                "lat": r.centroid_lat,
                "lon": r.centroid_lon,
                "loss_php": php,
                "loss_usd": {k: round(v / PHP_PER_USD) for k, v in php.items()},
            })

        nat_php = {"q10": round(q(flat, 10)), "q50": round(q(flat, 50)), "q90": round(q(flat, 90))}
        check = ml_event_check(m, max(med_mmi))
        payload = {
            "magnitude": m,
            "engine": "v0.2 exposure x fragility Monte Carlo "
                      f"({N_EPISTEMIC}x{N_ALEATORIC} nested draws)",
            "fault": "West Valley Fault (approximate trace)",
            "generated": date.today().isoformat(),
            "weighting": weighting,
            "php_per_usd": PHP_PER_USD,
            "synthetic": False,
            "national_loss_php": nat_php,
            "national_loss_usd": {k: round(v / PHP_PER_USD) for k, v in nat_php.items()},
            "uq": variance_split(national),
            "ml_event_check_usd": check,
            "ml_event_check_note": None if check is None else
                "event-level quantile model trained on global losses; has no "
                "exposure features, so it prices a *typical global* event of "
                "this magnitude — reported for transparency, not the headline",
            "lgus": lgus,
        }
        out = WEB_DATA / "scenarios" / f"m{str(m).replace('.', '')}.json"
        with open(out, "w") as f:
            json.dump(payload, f)
        usd = nat_php["q50"] / PHP_PER_USD
        print(f"M{m}: national P50 ≈ ${usd/1e9:.1f}B "
              f"[P10 ${nat_php['q10']/PHP_PER_USD/1e9:.1f}B – "
              f"P90 ${nat_php['q90']/PHP_PER_USD/1e9:.1f}B] "
              f"| UQ split a/e = {payload['uq']['aleatoric_share']:.0%}/"
              f"{payload['uq']['epistemic_share']:.0%} → {out.name}")

    WEB_DATA.joinpath("fault-trace.geojson").write_text(FAULT.read_text())
    print("done — run src.validate and src.backtest_bohol next")


if __name__ == "__main__":
    main()
