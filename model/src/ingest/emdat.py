"""Parse a local EM-DAT export (earthquakes only).

EM-DAT is free for non-commercial research but its license FORBIDS
redistributing the raw data. Therefore:

  1. Register (free) at https://public.emdat.be and download an .xlsx export
     filtered to Disaster Type = Earthquake.
  2. Save it as  data/raw/emdat_earthquakes.xlsx  (this path is gitignored).
  3. Run:  python -m src.ingest.emdat   (from the model/ directory)

Writes: data/raw/emdat_earthquakes.csv (also gitignored).
Only the merged, transformed training features in data/processed/ are ever
committed — and even those should exclude verbatim EM-DAT records if you make
the repo public. When in doubt, keep processed EM-DAT-derived rows out of git
and document the rebuild steps in the README instead.
"""

from __future__ import annotations

from pathlib import Path

import pandas as pd

RAW_DIR = Path(__file__).resolve().parents[2] / "data" / "raw"
XLSX_IN = RAW_DIR / "emdat_earthquakes.xlsx"
CSV_OUT = RAW_DIR / "emdat_earthquakes.csv"

# EM-DAT column names as of the 2024+ public table schema.
KEEP = {
    "DisNo.": "disaster_no",
    "Country": "country",
    "ISO": "iso3",
    "Start Year": "year",
    "Magnitude": "magnitude",
    "Latitude": "latitude",
    "Longitude": "longitude",
    "Total Deaths": "deaths",
    "Total Affected": "affected",
    "Total Damage ('000 US$)": "damage_thousands_usd",
    "Total Damage, Adjusted ('000 US$)": "damage_thousands_usd_adjusted",
}


def main() -> None:
    if not XLSX_IN.exists():
        raise SystemExit(
            f"Missing {XLSX_IN}.\n"
            "Download an earthquake export from https://public.emdat.be "
            "(free registration) and save it to that path first."
        )
    df = pd.read_excel(XLSX_IN)
    missing = [c for c in KEEP if c not in df.columns]
    if missing:
        raise SystemExit(
            f"EM-DAT schema changed; missing columns: {missing}. "
            "Update the KEEP mapping in src/ingest/emdat.py."
        )
    out = df[list(KEEP)].rename(columns=KEEP)
    out.to_csv(CSV_OUT, index=False)
    print(f"wrote {len(out)} events to {CSV_OUT} "
          f"({out['damage_thousands_usd'].notna().sum()} with loss values)")


if __name__ == "__main__":
    main()
