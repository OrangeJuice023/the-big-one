#!/usr/bin/env python3
"""Check the project's stated claims against the data that is actually in the repo.

WHY THIS EXISTS: the documentation drifted from the code at least six times —
the magnitude range was stated three different ways, the LGU count was stale,
the README described real model output as synthetic placeholders, and the TODO
checklist still asked for work that had been done. None of that was caught by
`pytest` or `next build`, because none of it is a code error. It is a claim
error, and nothing was checking claims.

This script checks them. It reads the scenario JSONs, the exposure table and
the policy scorecard, recomputes the figures the prose depends on, and compares
them against what the documents say.

Run:  python scripts/verify_claims.py        (from the model/ directory)

Exit code 0 = every claim matches. 1 = at least one does not.

A failure is not necessarily a bug in the code. Usually it means a number moved
and a sentence did not. Fix whichever is wrong — sometimes it is the sentence,
sometimes the data, and deciding which is the point of running this.
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parents[1]
ROOT = HERE.parent
WEB = ROOT / "web"
SCENARIOS = WEB / "public" / "data" / "scenarios"
EXPOSURE = HERE / "data" / "external" / "exposure_ncr.csv"
SCORECARD = WEB / "src" / "lib" / "scorecard.json"

PILOT_LGUS = ["Makati", "Marikina", "Pasig", "Quezon City", "Pateros", "Taguig"]

results: list[tuple[bool, str, str]] = []


def check(ok: bool, name: str, detail: str = "") -> None:
    results.append((ok, name, detail))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8") if path.exists() else ""


# ---------------------------------------------------------------- scenarios

def load_scenarios() -> dict[float, dict]:
    out = {}
    for p in sorted(SCENARIOS.glob("m*.json")):
        d = json.loads(p.read_text())
        out[float(d["magnitude"])] = d
    return out


def check_scenarios(scen: dict[float, dict]) -> None:
    mags = sorted(scen)
    check(bool(mags), "scenario files present", f"{len(mags)} files")
    if not mags:
        return

    # Every published scenario must be real model output, not a placeholder.
    synthetic = [m for m, d in scen.items() if d.get("synthetic") is not False]
    check(
        not synthetic,
        "no synthetic scenarios published",
        "all real" if not synthetic else f"SYNTHETIC: {synthetic}",
    )

    # The magnitude range stated in the docs must match the files on disk.
    expected = [round(6.0 + 0.1 * i, 1) for i in range(13)] + [7.5]
    check(
        mags == sorted(expected),
        "magnitude set matches src/scenarios.py",
        f"{mags[0]}-{mags[-2]} + {mags[-1]}",
    )

    readme = read_text(ROOT / "README.md")
    arch = read_text(ROOT / "ARCHITECTURE.md")
    stale_range = re.compile(r"M?6\.5\s*[-–—]\s*M?7\.6")
    check(
        not stale_range.search(readme) and not stale_range.search(arch),
        "no stale M6.5-M7.6 range in README/ARCHITECTURE",
        "clean" if not stale_range.search(readme + arch) else "FOUND stale range",
    )

    # File names referenced in the docs must exist.
    named = set(re.findall(r"\bm(\d{2})\.json\b", readme + arch))
    actual = {p.stem[1:] for p in SCENARIOS.glob("m*.json")}
    missing = sorted(named - actual)
    check(
        not missing,
        "scenario filenames cited in docs exist",
        "ok" if not missing else f"cited but absent: {missing}",
    )


def check_lgu_count(scen: dict[float, dict]) -> None:
    import csv

    rows = list(csv.DictReader(EXPOSURE.open()))
    n = len(rows)
    ncr = sum(1 for r in rows if r["region"] == "NCR")

    any_scen = next(iter(scen.values())) if scen else {}
    check(
        len(any_scen.get("lgus", [])) == n,
        "scenario JSON LGU count matches exposure table",
        f"{n} LGUs ({ncr} NCR, {n - ncr} corridor)",
    )

    # Documents must not claim a smaller, older count.
    prose = read_text(ROOT / "README.md") + read_text(ROOT / "docs" / "PROJECT_DESCRIPTION.md")
    check(
        "17 LGUs" not in prose,
        "no stale '17 LGUs' claim",
        "clean" if "17 LGUs" not in prose else "FOUND",
    )

    # The corridor provinces named in prose must cover every corridor LGU.
    # Laguna was omitted in an earlier draft while holding five of the 18.
    corridor = [r for r in rows if r["region"] != "NCR"]
    check(
        len(corridor) == 18,
        "corridor LGU count",
        f"{len(corridor)} corridor LGUs",
    )


def check_exposure_provenance() -> None:
    import csv

    rows = list(csv.DictReader(EXPOSURE.open()))
    filled = [r for r in rows if r["grdp_php_billions"].strip()]
    frac = len(filled) / len(rows)

    check(True, "GRDP coverage", f"{len(filled)}/{len(rows)} LGUs on published PSA GDP")

    # If coverage is partial the scenarios MUST say so, or readers will assume
    # every LGU is on published figures.
    scen = load_scenarios()
    weighting = next(iter(scen.values()))["weighting"] if scen else ""
    expected = "grdp" if frac == 1 else ("population_fallback" if frac == 0 else "mixed_grdp_population")
    check(
        weighting == expected,
        "scenario 'weighting' flag matches GRDP coverage",
        f"{weighting}",
    )

    readme = read_text(ROOT / "README.md")
    if frac < 1:
        check(
            "8 of 35" in readme or "mixed_grdp_population" in readme,
            "README discloses partial GRDP coverage",
            "disclosed" if "mixed_grdp_population" in readme else "NOT disclosed",
        )

    # POPULATION CROSS-CHECK. The 27 LGUs without published city GDP are
    # weighted by population x regional per-capita output, so population_2020
    # determines roughly 39% of the exposure base. The PSA published a regional
    # total for NCR; if the 17 NCR rows sum to it exactly, every one of them is
    # right, because a compensating pair of errors summing to zero is not a
    # realistic failure mode. This is a stronger check than eyeballing 17 rows.
    PSA_NCR_TOTAL_2020 = 13_484_462  # PSA 2020 CPH, ref. date 01 May 2020
    ncr_sum = sum(
        int(r["population_2020"]) for r in rows if r["region"] == "NCR"
    )
    check(
        ncr_sum == PSA_NCR_TOTAL_2020,
        "NCR populations sum to the PSA 2020 CPH regional total",
        f"{ncr_sum:,} vs {PSA_NCR_TOTAL_2020:,}"
        + ("" if ncr_sum == PSA_NCR_TOTAL_2020 else "  <-- MISMATCH"),
    )

    # The corridor LGUs have no equivalent published subtotal (they are spread
    # across four provinces), so those 18 were verified individually against
    # PSA releases. Record that the provenance file exists rather than
    # re-deriving it here.
    prov = HERE / "data" / "external" / "POPULATION_SOURCES.md"
    check(
        prov.exists(),
        "population provenance documented",
        "data/external/POPULATION_SOURCES.md" if prov.exists() else "MISSING",
    )


# ---------------------------------------------------------------- pilot LGUs

def check_pilot_selection(scen: dict[float, dict]) -> None:
    """The six-LGU pilot is a PURPOSIVE sample, not the six nearest.

    This is checked because the informal description of the project has drifted
    toward "the six closest to the fault", which the distances do not support.
    The written justification (fault exposure as a threshold, plus capacity
    spread) is the defensible one and should be the only one used.
    """
    if not scen:
        return
    lgus = next(iter(scen.values()))["lgus"]
    ranked = sorted(lgus, key=lambda r: r["rrup_km"])
    ranks = {r["lgu"]: i + 1 for i, r in enumerate(ranked)}
    pilot_ranks = sorted(ranks[n] for n in PILOT_LGUS if n in ranks)

    is_nearest_six = pilot_ranks == [1, 2, 3, 4, 5, 6]
    nearer_excluded = [
        r["lgu"] for r in ranked[: max(pilot_ranks)] if r["lgu"] not in PILOT_LGUS
    ]
    check(
        not is_nearest_six,
        "pilot is purposive, not distance-ranked (documented as such)",
        f"pilot ranks {pilot_ranks} of {len(ranked)}; "
        f"{len(nearer_excluded)} nearer LGUs excluded",
    )

    # Any claim that the six are simply the closest is a factual error.
    prose = (
        read_text(ROOT / "docs" / "PROJECT_DESCRIPTION.md")
        + read_text(WEB / "src" / "app" / "policy" / "page.tsx")
        + read_text(ROOT / "README.md")
    )
    # An explicit denial of that framing ("not simply the six nearest") is the
    # correction, not the error, so only affirmative uses are flagged.
    bad = None
    for m in re.finditer(r"(six|6)\s+(closest|nearest)", prose, re.I):
        preceding = prose[max(0, m.start() - 60) : m.start()]
        if re.search(r"\bnot\b[^.]*$", preceding, re.I):
            continue
        bad = m
        break
    check(
        bad is None,
        "no 'six closest/nearest' claim in prose",
        "clean" if bad is None else f"FOUND: {bad.group(0)!r}",
    )


def check_cross_layer(scen: dict[float, dict]) -> None:
    """The six pilot LGUs' share of national loss — the number that joins the
    two layers. If it moves, the abstract and the policy page must move too."""
    d = scen.get(7.2)
    if not d:
        return
    by_name = {r["lgu"]: r for r in d["lgus"]}
    six = sum(by_name[n]["loss_usd"]["q50"] for n in PILOT_LGUS if n in by_name)
    national = d["national_loss_usd"]["q50"]
    share = six / national

    # NOTE ON WHAT THIS NUMBER IS: quantiles do not add, so summing six
    # marginal medians does NOT give the median of their joint total. The
    # joint figure (percentile of the summed draws) is higher — about $21.2B,
    # or 47% — and requires re-running the Monte Carlo, which this script
    # deliberately does not do. Cite the joint figure in prose; treat the
    # number below as a conservative floor.
    check(
        True,
        "six-LGU share, sum of marginal medians (M7.2)",
        f"${six / 1e9:.1f}B of ${national / 1e9:.1f}B = {share:.0%} "
        f"(floor; joint median is higher — quantiles do not add)",
    )

    # Per-LGU P50s sum to more or less than the national P50 because quantiles
    # do not add. Flag it if anyone starts treating the sum as the total.
    all_sum = sum(r["loss_usd"]["q50"] for r in d["lgus"])
    drift = abs(all_sum - national) / national
    check(
        drift < 0.35,
        "per-LGU P50 sum is within a sane distance of national P50",
        f"sum ${all_sum / 1e9:.1f}B vs national ${national / 1e9:.1f}B "
        f"({drift:+.0%}); quantiles do not add, so these differ by design",
    )


# ---------------------------------------------------------------- scorecard

def check_model_configuration() -> None:
    """The estimator's own settings, checked against what the documents claim.

    N_EPISTEMIC was 60 through v0.3, where the M7.2 P50 varied by $2.7B across
    seeds. A paper about uncertainty quantification cannot publish a headline
    whose Monte Carlo error exceeds the differences it is reporting, so the
    setting is pinned and checked here rather than left to drift quietly.
    """
    src = read_text(HERE / "src" / "scenarios.py")

    m = re.search(r"^N_EPISTEMIC\s*=\s*(\d+)", src, re.M)
    n_epi = int(m.group(1)) if m else 0
    check(
        n_epi >= 500,
        "N_EPISTEMIC large enough for stable tail quantiles",
        f"{n_epi} (60 gave sd $2.7B on the M7.2 P50; 500 gives $1.0B)",
    )

    check(
        "rupture_segment" in src,
        "rupture extent scales with magnitude",
        "magnitude-dependent" if "rupture_segment" in src
        else "FULL TRACE AT ALL MAGNITUDES — flattens the loss-magnitude curve",
    )

    # The changelog is the only place the v0.3/v0.4 difference is reconciled
    # against the submitted abstract. If the headline moves again without it
    # being updated, the site and the abstract silently disagree.
    changelog = read_text(ROOT / "CHANGELOG.md")
    scen = load_scenarios()
    d = scen.get(7.2)
    if d and changelog:
        p50_b = d["national_loss_usd"]["q50"] / 1e9
        stated = f"{p50_b:.1f}"
        check(
            stated in changelog,
            "CHANGELOG states the current M7.2 headline",
            f"${stated}B" + ("" if stated in changelog else "  <-- NOT in CHANGELOG"),
        )
        check(
            "45.4" in changelog and "NCDSPP" in changelog,
            "CHANGELOG preserves the figure the submitted abstract used",
            "v0.3 recorded" if "45.4" in changelog else "MISSING",
        )


def check_scorecard() -> None:
    if not SCORECARD.exists():
        return
    d = json.loads(SCORECARD.read_text())
    obs = [o["id"] for o in d["obligations"]]
    cells = [(l["name"], o, l["cells"][o]["status"]) for l in d["lgus"] for o in obs]

    to_collect = [(n, o) for n, o, s in cells if s == "to-collect"]
    check(
        True,
        "scorecard completeness",
        f"{len(cells) - len(to_collect)}/{len(cells)} cells assessed, "
        f"{len(to_collect)} to-collect",
    )

    # An LGU with most of its row unassessed cannot carry a compliance finding.
    by_lgu: dict[str, int] = {}
    for n, _ in to_collect:
        by_lgu[n] = by_lgu.get(n, 0) + 1
    worst = sorted(by_lgu.items(), key=lambda kv: -kv[1])
    for name, count in worst:
        check(
            count <= len(obs) // 2,
            f"{name} has enough assessed obligations to characterise",
            f"{count}/{len(obs)} unassessed"
            + ("" if count <= len(obs) // 2 else "  <-- report as 'n of m assessed', never as a score"),
        )

    # A correlational claim needs an n this study does not have.
    policy = read_text(WEB / "src" / "app" / "policy" / "page.tsx")
    claim = re.search(r"disclosure\s+tracks?\s+resources", policy, re.I)
    if claim:
        n = len(d["lgus"])
        check(
            "does not" not in policy[max(0, claim.start() - 200) : claim.end() + 200],
            f"no unqualified correlational claim at n={n}",
            f"n={n} cannot support a rank-correlation claim "
            "(needs |rho| >= 0.83 for p<0.05)",
        )


# ---------------------------------------------------------------- reporting

def main() -> None:
    scen = load_scenarios()
    check_scenarios(scen)
    check_lgu_count(scen)
    check_exposure_provenance()
    check_pilot_selection(scen)
    check_cross_layer(scen)
    check_model_configuration()
    check_scorecard()

    width = max(len(n) for _, n, _ in results) + 2
    failed = 0
    print()
    for ok, name, detail in results:
        mark = "pass" if ok else "FAIL"
        if not ok:
            failed += 1
        print(f"  [{mark}] {name:<{width}} {detail}")
    print(f"\n  {len(results) - failed}/{len(results)} claims verified.")

    if failed:
        print(
            "\n  A failure usually means a number moved and a sentence did not.\n"
            "  Decide which one is wrong before changing either."
        )
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
