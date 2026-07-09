"""Sanity checks against published benchmarks.

Anchor: the MMEIRS (2004, JICA-MMDA-PHIVOLCS) M7.2 WVF scenario and later
World Bank updates put direct+indirect losses around USD 48B / PHP ~2.5T.
Our M7.2 national P50 should land within roughly 0.5x-2x of that figure.
Do NOT tune the model to match it — if it disagrees, understand why and
report the discrepancy on the methodology page.

Run:  python -m src.validate       (from the model/ directory, after scenarios)
"""

import json
from pathlib import Path

BENCH_USD = 48e9
SCEN = Path(__file__).resolve().parents[2] / "web" / "public" / "data" / "scenarios" / "m72.json"


def main() -> None:
    with open(SCEN) as f:
        s = json.load(f)
    if s.get("synthetic"):
        raise SystemExit("m72.json is a synthetic placeholder — run src.scenarios first.")
    p50 = s["national_loss_usd"]["q50"]
    ratio = p50 / BENCH_USD
    print(f"M7.2 national P50: ${p50/1e9:.1f}B | MMEIRS/World Bank anchor: $48B | ratio {ratio:.2f}x")
    if 0.5 <= ratio <= 2.0:
        print("PASS: within the 0.5x-2x sanity band.")
    else:
        print("OUTSIDE sanity band. Investigate (do not tune-to-match): "
              "CPI factors, exposure weights, training data cleaning, GMPE distances.")


if __name__ == "__main__":
    main()
