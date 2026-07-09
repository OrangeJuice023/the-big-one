"""Precompute West Valley Fault scenarios and emit frontend JSON.

For each magnitude M6.5-M7.6 (0.1 steps):
  1. Rrup per LGU  = distance from LGU centroid to the fault trace (gmpe.py)
  2. Intensity     = AWW12 IPE median MMI (+ sigma)
  3. Loss quantiles per LGU from the trained LightGBM models, using a
     pseudo-event feature vector (scenario magnitude, WVF depth assumption,
     LGU intensity, current year), scaled by the LGU's share of exposure.

Exposure scaling (first-pass, documented in docs/methodology.md):
  The trained model predicts *national-scale event* losses. We allocate the
  event-level prediction across LGUs proportional to
      exposure_weight = grdp_share * damage_ratio(MMI)
  where damage_ratio is a standard-shaped fragility proxy that ramps from
  ~0 at MMI VI to ~1 at MMI X. This keeps the ML model responsible for the
  magnitude→loss level and the GMPE responsible for the spatial pattern.
  If grdp_php_billions is missing in the exposure table, population share is
  used as a fallback (and flagged in the output JSON).

Run:  python -m src.scenarios       (from the model/ directory)
Writes: ../web/public/data/scenarios/m{65..76}.json and scenario fault/meta files.
"""

from __future__ import annotations

import json
import math
from datetime import date
from pathlib import Path

import lightgbm as lgb
import pandas as pd

from src.gmpe import clamp_mmi, distance_to_fault_km, load_fault_trace, mmi, mmi_sigma

HERE = Path(__file__).resolve().parents[1]
EXPOSURE = HERE / "data" / "external" / "exposure_ncr.csv"
FAULT = HERE / "data" / "external" / "wvf_trace_approx.geojson"
MODELS = HERE / "models"
WEB_DATA = HERE.parent / "web" / "public" / "data"

# M6.0-M7.2 (0.1 steps), anchored on the PHIVOLCS maximum-credible magnitude
# of 7.2 for the WVF, plus an M7.5 stress test reflecting paleoseismic upper-
# bound estimates (see data/external/benchmarks.json). Mmax itself is treated
# as an epistemically uncertain parameter.
MAGNITUDES = [round(6.0 + 0.1 * i, 1) for i in range(13)] + [7.5]
WVF_DEPTH_KM = 10.0  # shallow crustal assumption; state in methodology
PHP_PER_USD = 58.0   # update at build time; document the date used


def damage_ratio(intensity: float) -> float:
    """Smooth fragility proxy: ~0 below MMI 6, ~1 by MMI 10."""
    return 1.0 / (1.0 + math.exp(-1.6 * (intensity - 8.0)))


def main() -> None:
    exposure = pd.read_csv(EXPOSURE)
    trace = load_fault_trace(FAULT)

    have_grdp = exposure["grdp_php_billions"].notna().all()
    weight_col = "grdp_php_billions" if have_grdp else "population_2020"
    if not have_grdp:
        print("note: GRDP incomplete in exposure_ncr.csv — falling back to "
              "population weights (flagged in JSON output)")

    boosters = {
        tag: lgb.Booster(model_file=str(MODELS / f"lgbm_{tag}.txt"))
        for tag in ("q10", "q50", "q90")
    }

    exposure["rrup_km"] = [
        distance_to_fault_km(r.centroid_lat, r.centroid_lon, trace)
        for r in exposure.itertuples()
    ]

    WEB_DATA.joinpath("scenarios").mkdir(parents=True, exist_ok=True)

    for m in MAGNITUDES:
        rows = []
        for r in exposure.itertuples():
            intensity = clamp_mmi(mmi(m, r.rrup_km))
            rows.append({
                "lgu": r.lgu,
                "psgc_prefix": str(r.psgc_prefix),
                "rrup_km": round(r.rrup_km, 2),
                "mmi": round(intensity, 2),
                "mmi_sigma": round(mmi_sigma(r.rrup_km), 3),
                "damage_ratio": damage_ratio(intensity),
                "weight_raw": getattr(r, weight_col),
                "lat": r.centroid_lat,
                "lon": r.centroid_lon,
                "population": int(r.population_2020),
            })
        df = pd.DataFrame(rows)
        df["alloc"] = df["weight_raw"] * df["damage_ratio"]
        df["alloc"] /= df["alloc"].sum()

        # Event-level pseudo-features: use max intensity across LGUs.
        feats = pd.DataFrame([{
            "magnitude": m,
            "depth_km": WVF_DEPTH_KM,
            "max_intensity": float(df["mmi"].max()),
            "year": date.today().year,
        }])
        national = {
            tag: float(10 ** boosters[tag].predict(feats)[0])
            for tag in ("q10", "q50", "q90")
        }

        lgus = []
        for row in df.itertuples():
            lgus.append({
                "lgu": row.lgu,
                "psgc_prefix": row.psgc_prefix,
                "rrup_km": row.rrup_km,
                "mmi": row.mmi,
                "population": row.population,
                "lat": row.lat,
                "lon": row.lon,
                "loss_usd": {
                    tag: round(national[tag] * row.alloc)
                    for tag in ("q10", "q50", "q90")
                },
                "loss_php": {
                    tag: round(national[tag] * row.alloc * PHP_PER_USD)
                    for tag in ("q10", "q50", "q90")
                },
            })

        payload = {
            "magnitude": m,
            "fault": "West Valley Fault (approximate trace)",
            "generated": date.today().isoformat(),
            "weighting": "grdp" if have_grdp else "population_fallback",
            "php_per_usd": PHP_PER_USD,
            "synthetic": False,
            "national_loss_usd": {t: round(v) for t, v in national.items()},
            "national_loss_php": {t: round(v * PHP_PER_USD) for t, v in national.items()},
            "lgus": lgus,
        }
        out = WEB_DATA / "scenarios" / f"m{str(m).replace('.', '')}.json"
        with open(out, "w") as f:
            json.dump(payload, f)
        print(f"M{m}: national P50 ≈ ${national['q50']/1e9:.1f}B → {out.name}")

    # Copy the fault trace for the map.
    WEB_DATA.joinpath("fault-trace.geojson").write_text(FAULT.read_text())
    print("done — remember the MMEIRS sanity check in src/validate.py")


if __name__ == "__main__":
    main()
