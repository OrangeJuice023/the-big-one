"""Ingest NOAA NCEI Significant Earthquake Database.

Source (US public domain):
    https://www.ngdc.noaa.gov/hazel/view/hazards/earthquake/search
API:
    https://www.ngdc.noaa.gov/hazel/hazard-service/api/data/earthquakes

Run:  python -m src.ingest.noaa      (from the model/ directory)
Writes: data/raw/noaa_earthquakes.csv
"""

from __future__ import annotations

import time
from pathlib import Path

import pandas as pd
import requests

API_URL = "https://www.ngdc.noaa.gov/hazel/hazard-service/api/data/earthquakes"
RAW_OUT = Path(__file__).resolve().parents[2] / "data" / "raw" / "noaa_earthquakes.csv"

# Columns we actually use downstream. The API returns many more.
KEEP = [
    "id", "year", "month", "day", "country", "locationName",
    "latitude", "longitude", "eqDepth", "eqMagnitude", "intensity",
    "deaths", "deathsTotal", "damageMillionsDollars", "damageMillionsDollarsTotal",
    "housesDestroyed", "housesDestroyedTotal",
]


def fetch_all(min_year: int = 1900, page_size: int = 200, sleep_s: float = 0.5) -> pd.DataFrame:
    """Page through the NCEI API. ~6k events since 1900; a few minutes."""
    rows: list[dict] = []
    page = 1
    while True:
        resp = requests.get(
            API_URL,
            params={"minYear": min_year, "page": page, "itemsPerPage": page_size},
            timeout=60,
        )
        resp.raise_for_status()
        payload = resp.json()
        items = payload.get("items", [])
        if not items:
            break
        rows.extend(items)
        total_pages = payload.get("totalPages", page)
        if page >= total_pages:
            break
        page += 1
        time.sleep(sleep_s)  # be polite
    df = pd.DataFrame(rows)
    present = [c for c in KEEP if c in df.columns]
    return df[present]


def main() -> None:
    RAW_OUT.parent.mkdir(parents=True, exist_ok=True)
    df = fetch_all()
    df.to_csv(RAW_OUT, index=False)
    n_loss = df["damageMillionsDollarsTotal"].notna().sum() if "damageMillionsDollarsTotal" in df else 0
    print(f"wrote {len(df)} events to {RAW_OUT} ({n_loss} with economic loss values)")


if __name__ == "__main__":
    main()
