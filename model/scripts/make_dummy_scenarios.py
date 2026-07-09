"""Generate SYNTHETIC placeholder scenario JSONs so the frontend is fully
navigable before the real model is trained. Every file is marked
"synthetic": true and the UI shows a banner when loading them.

The shape (schema) is identical to src/scenarios.py output. The numbers are
a deterministic toy formula — do NOT present them as estimates.

Run:  python scripts/make_dummy_scenarios.py     (from the model/ directory)
"""

import json
import math
import sys
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pandas as pd

from src.gmpe import clamp_mmi, distance_to_fault_km, load_fault_trace, mmi, mmi_sigma

HERE = Path(__file__).resolve().parents[1]
WEB_DATA = HERE.parent / "web" / "public" / "data"
PHP_PER_USD = 58.0
MAGNITUDES = [round(6.0 + 0.1 * i, 1) for i in range(13)] + [7.5]


def damage_ratio(intensity: float) -> float:
    return 1.0 / (1.0 + math.exp(-1.6 * (intensity - 8.0)))


def main() -> None:
    exposure = pd.read_csv(HERE / "data" / "external" / "exposure_ncr.csv")
    trace = load_fault_trace(HERE / "data" / "external" / "wvf_trace_approx.geojson")
    exposure["rrup_km"] = [
        distance_to_fault_km(r.centroid_lat, r.centroid_lon, trace)
        for r in exposure.itertuples()
    ]
    (WEB_DATA / "scenarios").mkdir(parents=True, exist_ok=True)

    for m in MAGNITUDES:
        # Toy national loss: exponential in magnitude, anchored loosely so the
        # M7.2 placeholder sits near the public $48B figure. SYNTHETIC.
        national_p50 = 48e9 * 10 ** (0.8 * (m - 7.2))
        national = {"q10": national_p50 * 0.35, "q50": national_p50, "q90": national_p50 * 2.6}

        rows = []
        for r in exposure.itertuples():
            intensity = clamp_mmi(mmi(m, r.rrup_km))
            rows.append({
                "lgu": r.lgu, "psgc_prefix": str(r.psgc_prefix),
                "rrup_km": round(r.rrup_km, 2), "mmi": round(intensity, 2),
                "population": int(r.population_2020),
                "lat": r.centroid_lat, "lon": r.centroid_lon,
                "alloc": r.population_2020 * damage_ratio(intensity),
            })
        df = pd.DataFrame(rows)
        df["alloc"] /= df["alloc"].sum()

        lgus = []
        for row in df.itertuples():
            lgus.append({
                "lgu": row.lgu, "psgc_prefix": row.psgc_prefix,
                "rrup_km": row.rrup_km, "mmi": row.mmi,
                "population": row.population, "lat": row.lat, "lon": row.lon,
                "loss_usd": {t: round(national[t] * row.alloc) for t in national},
                "loss_php": {t: round(national[t] * row.alloc * PHP_PER_USD) for t in national},
            })

        payload = {
            "magnitude": m,
            "fault": "West Valley Fault (approximate trace)",
            "generated": date.today().isoformat(),
            "weighting": "population_fallback",
            "php_per_usd": PHP_PER_USD,
            "synthetic": True,
            "national_loss_usd": {t: round(v) for t, v in national.items()},
            "national_loss_php": {t: round(v * PHP_PER_USD) for t, v in national.items()},
            "lgus": lgus,
        }
        out = WEB_DATA / "scenarios" / f"m{str(m).replace('.', '')}.json"
        with open(out, "w") as f:
            json.dump(payload, f)
        print(f"synthetic M{m} -> {out.name}")

    (WEB_DATA / "fault-trace.geojson").write_text(
        (HERE / "data" / "external" / "wvf_trace_approx.geojson").read_text()
    )


if __name__ == "__main__":
    main()
