"""Ground motion / intensity prediction for West Valley Fault scenarios.

Implements the Allen, Wald & Worden (2012) Intensity Prediction Equation (IPE)
for active crustal regions, rupture-distance (Rrup) version, neglecting site
amplification.

    Allen, T.I., Wald, D.J. and Worden, C.B. (2012)
    "Intensity attenuation for active crustal regions",
    Journal of Seismology 16: 409-433.

Coefficients cross-checked against the GEM OpenQuake engine implementation
(openquake/hazardlib/gsim/allen_2012_ipe.py, AGPL) on 2026-07-07:

    MMI   = c0 + c1*M + c2*ln( sqrt( Rrup^2 + (1 + c3*exp(M-5))^2 ) )
    sigma = s1 + s2 / (1 + (Rrup/s3)^2)

Valid range per the paper: Mw 5.0-7.9, Rrup < 300 km. Our scenario range
(M6.0-7.5, Metro Manila distances < ~60 km) sits comfortably inside it.

Known simplification (documented in docs/methodology.md): we approximate Rrup
with the 2-D distance from each LGU centroid to the surface fault trace
(a Joyner-Boore-style distance). For a shallow crustal fault like the WVF
this understates Rrup slightly for near-fault sites; the bias is small
relative to the IPE's own sigma and is stated as a limitation.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

# --- AWW12 Rrup coefficients (verified against OpenQuake) -------------------
C0 = 3.950
C1 = 0.913
C2 = -1.107
C3 = 0.813
S1 = 0.72
S2 = 0.23
S3 = 44.7

EARTH_RADIUS_KM = 6371.0088


def mmi(magnitude: float, rrup_km: float) -> float:
    """Median Modified Mercalli Intensity for a given magnitude and Rrup (km)."""
    if rrup_km < 0:
        raise ValueError("rrup_km must be non-negative")
    exponent_term = (1.0 + C3 * math.exp(magnitude - 5.0)) ** 2
    return C0 + C1 * magnitude + C2 * math.log(math.sqrt(rrup_km**2 + exponent_term))


def mmi_sigma(rrup_km: float) -> float:
    """Total standard deviation of the IPE (distance-dependent)."""
    return S1 + S2 / (1.0 + (rrup_km / S3) ** 2)


def clamp_mmi(value: float) -> float:
    """Clamp to the physically meaningful MMI range used downstream."""
    return max(1.0, min(value, 12.0))


# --- Distance to fault trace -------------------------------------------------

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dp = math.radians(lat2 - lat1)
    dl = math.radians(lon2 - lon1)
    a = math.sin(dp / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def _point_segment_distance_km(
    lat: float, lon: float, lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """Distance from a point to a great-circle segment, via a local flat-earth
    projection around the segment. Adequate for segment lengths < ~50 km."""
    mean_lat = math.radians((lat1 + lat2) / 2.0)
    kx = EARTH_RADIUS_KM * math.cos(mean_lat) * math.pi / 180.0  # km per deg lon
    ky = EARTH_RADIUS_KM * math.pi / 180.0                        # km per deg lat

    px, py = (lon - lon1) * kx, (lat - lat1) * ky
    sx, sy = (lon2 - lon1) * kx, (lat2 - lat1) * ky

    seg_len_sq = sx * sx + sy * sy
    if seg_len_sq == 0.0:
        return _haversine_km(lat, lon, lat1, lon1)
    t = max(0.0, min(1.0, (px * sx + py * sy) / seg_len_sq))
    cx, cy = sx * t, sy * t
    return math.hypot(px - cx, py - cy)


def distance_to_fault_km(lat: float, lon: float, trace: list[tuple[float, float]]) -> float:
    """Minimum distance (km) from a point to a fault trace.

    trace: list of (lat, lon) vertices, ordered along the fault.
    """
    if len(trace) < 2:
        raise ValueError("fault trace needs at least 2 vertices")
    return min(
        _point_segment_distance_km(lat, lon, *trace[i], *trace[i + 1])
        for i in range(len(trace) - 1)
    )


def load_fault_trace(geojson_path: str | Path) -> list[tuple[float, float]]:
    """Load a LineString fault trace from GeoJSON, returned as (lat, lon) pairs."""
    with open(geojson_path) as f:
        gj = json.load(f)
    feature = gj["features"][0]
    coords = feature["geometry"]["coordinates"]  # GeoJSON is [lon, lat]
    return [(lat, lon) for lon, lat in coords]

# --- Magnitude-dependent rupture extent ---------------------------------------
#
# WHY THIS EXISTS: distance_to_fault_km() above measures to the WHOLE mapped
# trace. For a maximum-magnitude scenario that is right — the entire fault
# ruptures. For a smaller event it is not: an M6.0 ruptures roughly 14 km of
# fault, not 99 km, so a site 40 km along strike from the nucleation point
# should see a far larger Rrup than the full-trace distance implies.
#
# Using the full trace at every magnitude flattens the loss-magnitude curve:
# with the WVF's 99 km trace, an M6.0 came out at 62% of the M7.2 loss, which
# is not a credible scaling. The physics was being held constant while only
# the magnitude term moved.
#
# Rupture length from Wells & Coppersmith (1994), subsurface rupture length
# for strike-slip faulting (the WVF is strike-slip):
#
#     log10(RLD) = -2.57 + 0.62 * M
#
#     Wells, D.L. and Coppersmith, K.J. (1994) "New empirical relationships
#     among magnitude, rupture length, rupture width, rupture area, and
#     surface displacement", BSSA 84(4): 974-1002.
#
# RUPTURE PLACEMENT is a scenario choice, not a physical fact: the same
# magnitude on the same fault produces very different losses depending on
# which segment breaks. The placement is therefore an explicit parameter.
# See src/scenarios.py for which one the published scenarios use and why.

WC94_STRIKE_SLIP_A = -2.57
WC94_STRIKE_SLIP_B = 0.62


def rupture_length_km(magnitude: float) -> float:
    """Subsurface rupture length for a strike-slip event (Wells & Coppersmith 1994)."""
    return 10.0 ** (WC94_STRIKE_SLIP_A + WC94_STRIKE_SLIP_B * magnitude)


def _cumulative_length(trace: list[tuple[float, float]]) -> list[float]:
    """Arc length from the first vertex to each vertex, in km."""
    out = [0.0]
    for i in range(len(trace) - 1):
        out.append(out[-1] + _haversine_km(*trace[i], *trace[i + 1]))
    return out


def _interpolate(trace, cum, s: float) -> tuple[float, float]:
    """The (lat, lon) at arc length s along the trace."""
    if s <= 0:
        return trace[0]
    if s >= cum[-1]:
        return trace[-1]
    for i in range(len(cum) - 1):
        if cum[i] <= s <= cum[i + 1]:
            seg = cum[i + 1] - cum[i]
            f = 0.0 if seg == 0 else (s - cum[i]) / seg
            return (
                trace[i][0] + f * (trace[i + 1][0] - trace[i][0]),
                trace[i][1] + f * (trace[i + 1][1] - trace[i][1]),
            )
    return trace[-1]


def rupture_segment(
    trace: list[tuple[float, float]], magnitude: float, centre_fraction: float = 0.5
) -> list[tuple[float, float]]:
    """The portion of the trace that ruptures at this magnitude.

    centre_fraction places the rupture centre along the trace (0 = first
    vertex, 1 = last). If the rupture would run off one end it is shifted back
    rather than truncated, which is the standard treatment: a fault does not
    produce a shorter rupture merely because the nucleation point was near a
    tip. A rupture longer than the mapped trace returns the whole trace.
    """
    cum = _cumulative_length(trace)
    total = cum[-1]
    length = min(rupture_length_km(magnitude), total)
    if length >= total:
        return list(trace)

    centre = centre_fraction * total
    start = centre - length / 2.0
    start = max(0.0, min(start, total - length))
    end = start + length

    pts = [_interpolate(trace, cum, start)]
    pts += [v for v, c in zip(trace, cum) if start < c < end]
    pts.append(_interpolate(trace, cum, end))
    return pts
