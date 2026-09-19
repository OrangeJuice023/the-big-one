"""Known-answer and sanity tests for the AWW12 IPE implementation.

The reference values below are computed directly from the published equation
with the OpenQuake-verified coefficients. If any coefficient is mistyped,
these fail loudly. Run: pytest model/tests/ -v
"""

import math

import pytest

from src.gmpe import (
    clamp_mmi,
    distance_to_fault_km,
    mmi,
    mmi_sigma,
    rupture_length_km,
    rupture_segment,
)


def reference_mmi(m: float, r: float) -> float:
    """Independent re-statement of the equation for known-answer testing."""
    return 3.950 + 0.913 * m - 1.107 * math.log(
        math.sqrt(r**2 + (1 + 0.813 * math.exp(m - 5.0)) ** 2)
    )


@pytest.mark.parametrize(
    "magnitude,rrup",
    [(5.0, 10.0), (6.5, 5.0), (7.2, 8.0), (7.2, 30.0), (7.6, 60.0)],
)
def test_mmi_matches_published_equation(magnitude, rrup):
    assert mmi(magnitude, rrup) == pytest.approx(reference_mmi(magnitude, rrup), abs=1e-9)


def test_mmi_decays_with_distance():
    intensities = [mmi(7.2, r) for r in (1, 5, 10, 20, 50, 100)]
    assert intensities == sorted(intensities, reverse=True)


def test_mmi_increases_with_magnitude():
    intensities = [mmi(m, 15.0) for m in (5.0, 5.5, 6.0, 6.5, 7.0, 7.5)]
    assert intensities == sorted(intensities)


def test_m72_near_fault_is_destructive():
    """The Big One benchmark: an M7.2 rupture should put near-fault Metro
    Manila LGUs (Rrup roughly 2-10 km, e.g. Marikina/Pasig) in the
    'destructive' MMI VIII+ band, consistent with PHIVOLCS Intensity VIII
    statements for the WVF scenario."""
    assert mmi(7.2, 3.0) >= 8.0
    assert mmi(7.2, 10.0) >= 7.0


def test_sigma_positive_and_distance_dependent():
    assert mmi_sigma(0.0) == pytest.approx(0.95)
    assert mmi_sigma(1000.0) == pytest.approx(0.72, abs=1e-3)
    assert mmi_sigma(10.0) > mmi_sigma(100.0)


def test_clamp():
    assert clamp_mmi(15.0) == 12.0
    assert clamp_mmi(-2.0) == 1.0
    assert clamp_mmi(7.3) == 7.3


def test_distance_to_fault_simple_geometry():
    # Vertical segment along lon=121.0 from lat 14.0 to 15.0.
    trace = [(14.0, 121.0), (15.0, 121.0)]
    # A point due east at the same latitude band: distance = dlon * cos(lat) * R
    d = distance_to_fault_km(14.5, 121.1, trace)
    expected = 0.1 * math.cos(math.radians(14.5)) * 6371.0088 * math.pi / 180.0
    assert d == pytest.approx(expected, rel=0.01)
    # A point on the trace itself.
    assert distance_to_fault_km(14.5, 121.0, trace) == pytest.approx(0.0, abs=0.05)
    # A point beyond the segment end clamps to the endpoint.
    d_end = distance_to_fault_km(15.5, 121.0, trace)
    assert d_end == pytest.approx(0.5 * 6371.0088 * math.pi / 180.0, rel=0.01)


# --- magnitude-dependent rupture extent ---------------------------------------

def test_rupture_length_matches_wells_coppersmith():
    """Known values from log10(RLD) = -2.57 + 0.62*M, strike-slip."""
    assert rupture_length_km(6.0) == pytest.approx(14.1, abs=0.2)
    assert rupture_length_km(7.0) == pytest.approx(58.9, abs=0.5)
    assert rupture_length_km(7.2) == pytest.approx(78.3, abs=0.5)


def test_rupture_length_increases_with_magnitude():
    lengths = [rupture_length_km(m) for m in (6.0, 6.5, 7.0, 7.5)]
    assert lengths == sorted(lengths)


def _straight_trace():
    """~111 km of trace along a meridian, 1 degree of latitude."""
    return [(14.0 + 0.01 * i, 121.0) for i in range(101)]


def test_rupture_segment_is_shorter_than_trace_for_small_events():
    trace = _straight_trace()
    seg = rupture_segment(trace, 6.0)
    # An M6.0 breaks ~14 km, so the segment must be a small part of the trace.
    span_km = (seg[-1][0] - seg[0][0]) * 111.0
    assert 10 < span_km < 20
    assert len(seg) < len(trace)


def test_rupture_segment_returns_whole_trace_when_rupture_exceeds_it():
    trace = _straight_trace()
    # M8.0 gives ~300 km, far longer than this ~111 km trace.
    assert rupture_segment(trace, 8.0) == trace


def test_rupture_segment_is_centred_by_fraction():
    trace = _straight_trace()
    mid = rupture_segment(trace, 6.5, 0.5)
    early = rupture_segment(trace, 6.5, 0.0)
    assert early[0][0] < mid[0][0]
    # Clipping at the start must shift the segment, not shorten it.
    assert (early[-1][0] - early[0][0]) == pytest.approx(
        mid[-1][0] - mid[0][0], rel=0.02
    )


def test_distance_grows_when_rupture_is_shorter():
    """A site far along strike is closer to the whole trace than to a small
    rupture centred elsewhere. This is the property the flat loss-magnitude
    curve was missing."""
    trace = _straight_trace()
    far_site = (14.98, 121.0)  # near the far end
    d_full = distance_to_fault_km(*far_site, trace)
    d_m60 = distance_to_fault_km(*far_site, rupture_segment(trace, 6.0, 0.5))
    assert d_m60 > d_full + 20
