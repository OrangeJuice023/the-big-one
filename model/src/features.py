"""Build the model training table from NOAA (+ optional EM-DAT) raw data.

Target:   log10 economic loss in constant 2026 USD.
Features: magnitude, depth, max reported intensity, year, plus (optionally)
          country-level exposure covariates you join later (GDP per capita,
          population density) — see docs/methodology.md.

Run:  python -m src.features        (from the model/ directory)
Writes: data/processed/training_events.csv  (NOAA-derived rows only; see
        src/ingest/emdat.py for why EM-DAT rows should stay out of git)
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
import pandas as pd

DATA = Path(__file__).resolve().parents[1] / "data"
NOAA_RAW = DATA / "raw" / "noaa_earthquakes.csv"
EMDAT_RAW = DATA / "raw" / "emdat_earthquakes.csv"
OUT = DATA / "processed" / "training_events.csv"

# Rough US CPI multipliers to 2026 dollars by decade midpoint. These are
# deliberately coarse for the first pass — replace with a proper CPI series
# (FRED CPIAUCSL, free) before the final training run. Flagged in methodology.
CPI_TO_2026 = {
    1900: 37.0, 1910: 33.0, 1920: 16.0, 1930: 19.0, 1940: 22.0,
    1950: 13.0, 1960: 10.5, 1970: 8.0, 1980: 3.8, 1990: 2.4,
    2000: 1.83, 2010: 1.45, 2020: 1.22, 2026: 1.0,
}


def _cpi_factor(year: float) -> float:
    decades = sorted(CPI_TO_2026)
    nearest = min(decades, key=lambda d: abs(d - year))
    return CPI_TO_2026[nearest]


def build_noaa(df: pd.DataFrame) -> pd.DataFrame:
    out = pd.DataFrame()
    out["source"] = "noaa"
    out = out.reindex(range(len(df)))
    out["source"] = "noaa"
    out["event_id"] = "noaa_" + df["id"].astype(str)
    out["year"] = pd.to_numeric(df["year"], errors="coerce")
    out["country"] = df["country"]
    out["latitude"] = pd.to_numeric(df["latitude"], errors="coerce")
    out["longitude"] = pd.to_numeric(df["longitude"], errors="coerce")
    out["magnitude"] = pd.to_numeric(df["eqMagnitude"], errors="coerce")
    out["depth_km"] = pd.to_numeric(df.get("eqDepth"), errors="coerce")
    out["max_intensity"] = pd.to_numeric(df.get("intensity"), errors="coerce")

    dmg = pd.to_numeric(df.get("damageMillionsDollarsTotal"), errors="coerce")
    dmg = dmg.fillna(pd.to_numeric(df.get("damageMillionsDollars"), errors="coerce"))
    out["loss_usd_nominal"] = dmg * 1e6
    return out


def finalize(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["year", "magnitude", "loss_usd_nominal"])
    df = df[df["loss_usd_nominal"] > 0]
    df = df[df["magnitude"].between(4.0, 9.7)]

    df["cpi_factor"] = df["year"].map(_cpi_factor)
    df["loss_usd_2026"] = df["loss_usd_nominal"] * df["cpi_factor"]
    df["log10_loss"] = np.log10(df["loss_usd_2026"])

    # De-duplicate obvious NOAA/EM-DAT overlaps if both sources are present:
    # same year, same country, magnitude within 0.3 -> keep the larger loss.
    df = (
        df.sort_values("loss_usd_2026", ascending=False)
        .drop_duplicates(subset=["year", "country"], keep="first")
        .sort_values(["year"])
        .reset_index(drop=True)
    )
    return df


def main() -> None:
    if not NOAA_RAW.exists():
        raise SystemExit(f"Missing {NOAA_RAW}. Run: python -m src.ingest.noaa")
    frames = [build_noaa(pd.read_csv(NOAA_RAW))]

    if EMDAT_RAW.exists():
        em = pd.read_csv(EMDAT_RAW)
        em_out = pd.DataFrame()
        em_out["source"] = "emdat"
        em_out = em_out.reindex(range(len(em)))
        em_out["source"] = "emdat"
        em_out["event_id"] = "emdat_" + em["disaster_no"].astype(str)
        em_out["year"] = pd.to_numeric(em["year"], errors="coerce")
        em_out["country"] = em["country"]
        em_out["latitude"] = pd.to_numeric(em["latitude"], errors="coerce")
        em_out["longitude"] = pd.to_numeric(em["longitude"], errors="coerce")
        em_out["magnitude"] = pd.to_numeric(em["magnitude"], errors="coerce")
        em_out["depth_km"] = np.nan
        em_out["max_intensity"] = np.nan
        em_out["loss_usd_nominal"] = (
            pd.to_numeric(em["damage_thousands_usd"], errors="coerce") * 1e3
        )
        frames.append(em_out)
    else:
        print("note: no EM-DAT export found, building from NOAA only")

    df = finalize(pd.concat(frames, ignore_index=True))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT, index=False)
    print(f"wrote {len(df)} training events to {OUT}")
    print(df[["magnitude", "log10_loss"]].describe())


if __name__ == "__main__":
    main()
