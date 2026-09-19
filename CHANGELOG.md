# Changelog

Version numbers here track the **loss model**, not the site.

---

## v0.4 — 19 September 2026

Three changes. The first two move every published figure; the third does not
move anything but explains a property of the results that was previously
undocumented.

### The headline moved: US$45.4B → US$48.2B at M7.2 (0.95× → 1.00× the anchor)

**The abstract submitted to NCDSPP 2026 reports about US$45 billion and a ratio
of 0.95.** That figure is the correct output of the v0.3 configuration and is
not withdrawn. It was, however, a single 60-draw realization on seed 42, and
the estimator was not stable at that size.

Measured across seeds at the old setting, the M7.2 P50 had a standard deviation
of **$2.7B** and ranged from **$42.9B to $58.5B** over 100 seeds. Seed 42 sat
about 1.6 standard deviations below the ensemble mean of $49.7B. The published
"0.95×" was therefore as much a property of the seed as of the model.

`N_EPISTEMIC` is now **500** (was 60). The spread falls to **$1.0B**, and the
ensemble ratio is **1.02× ± 0.02**. Seed 42 now returns $48.2B, or 1.00×.

The honest reading: the submitted number understated the model's agreement with
the benchmark, and did so in a way that could not have been defended if a
reviewer had asked for the Monte Carlo error. Reporting both figures, with the
seed sensitivity, is stronger than either alone — and this is a paper about
uncertainty quantification, so the estimator's own numerical error belongs in
it.

**For the paper:** report 1.02× ± 0.02 on the stabilized ensemble, and note
that the abstract used a single 60-draw realization. That is a normal
refinement between abstract and full paper.

### Rupture extent now scales with magnitude

Rupture distance was previously measured to the **whole** 99 km mapped trace at
every magnitude. That is right for a maximum-magnitude scenario and wrong for
anything smaller: an M6.0 breaks about 14 km of fault, so a site 40 km along
strike is not 1 km from the source.

Rupture length now follows Wells & Coppersmith (1994), subsurface rupture
length for strike-slip:

    log10(RLD) = -2.57 + 0.62 * M

giving 14 km at M6.0, 59 km at M7.0 and 78 km at M7.2 against a 99 km trace.
The rupture is centred at the trace midpoint (`RUPTURE_CENTRE_FRACTION = 0.5`),
a neutral placement that does not position the break to maximise or minimise
Metro Manila loss; the population-weighted exposure centroid projects to 0.562,
so the two are close.

Effect on the curve, as a share of the M7.2 loss:

| | v0.3 | v0.4 |
|---|---|---|
| M6.0 | 62% | 51% |
| M6.5 | 80% | 75% |
| M7.0 | 95% | 95% |
| M7.2 | 100% | 100% |
| M7.5 | 106% | 105% |

M7.2 and above are unchanged, because at those magnitudes the rupture already
covers the Metro Manila frontage.

### Why the loss-magnitude curve is flat, and why that is not a defect

The change above was expected to steepen the curve substantially. It barely
did, and the reason is worth stating because it will otherwise be read as an
error.

**AWW12 intensity saturates at the source.** At Rrup = 0 the equation gives MMI
8.14 at M6.0 and MMI 8.18 at M7.2 — a difference of **0.04 intensity units
across 1.2 magnitude units**. Magnitude only separates with distance:

| Rrup | MMI(M7.2) − MMI(M6.0) |
|---|---|
| 0 km | +0.04 |
| 5 km | +0.55 |
| 20 km | +1.02 |
| 40 km | +1.08 |

The six pilot LGUs sit between 0.41 and 5.52 km of the trace, and most of NCR's
exposure is inside 10 km. That exposure is in the saturated regime, so its
shaking is nearly magnitude-independent, and so is its loss.

This is a documented property of intensity prediction equations, not a coding
error. It also happens to be an instance of the project's own central claim:
**exposure and proximity dominate magnitude.** A site on the fault is in
serious trouble at M6.5; going to M7.2 changes how far the damage extends more
than it changes what happens on top of the rupture.

The right response is to state this, not to engineer around it. A reviewer with
a seismology background will notice the flat curve within a minute, and it is
better to have explained it first.

### Other

- `model/scripts/verify_claims.py` extended to check N_EPISTEMIC and the
  rupture-scaling configuration against what the documents claim.
- Six new tests in `model/tests/test_gmpe.py` covering rupture length and
  segment placement (17 tests total, all passing).
- Validation re-run: M7.2 ratio 1.00× (PASS, 0.5×–2× band). Bohol 2013
  out-of-sample backtest still PASSES on both the hazard and chain checks;
  predicted P10–P90 $45M–$603M against the $52M monetized floor.

### Dependencies

Production vulnerabilities: **9 → 0**.

- `@xenova/transformers` moved to `devDependencies`. It is used only by
  `web/scripts/rag/embed.mjs`, a local experimentation script; production
  retrieval is BM25. This alone cleared 5 of the 9.
- `next` 14.2.35 → 16.3.5. The advisory range covered everything below 16.3.0,
  so no 15.x was available. Two criticals in that set do not apply to this
  deployment (Windows-hosted RCE; Image Optimization RCE, and images are
  `unoptimized`), but several Server Component and SSRF advisories do now that
  `/api/ask` exists.
- `react` / `react-dom` 18 → 19, required by Next 16.
- `maplibre-gl` 4.7.1 → 6.10.0 for an XSS sanitizer bypass in `DOM.sanitize()`.
  v6 dropped the default export, so `LossMap.tsx` now imports the module
  namespace.

`next build` passes: all 9 routes generate, `/api/ask` correctly dynamic.
5 vulnerabilities remain in `devDependencies` only, all under
`@xenova/transformers`, none of which reach the deployed application.

---

## v0.3 — as submitted to NCDSPP 2026

ABC-calibrated fragility on the 1990 Luzon earthquake, Bohol 2013 held out.
GEM Global Active Faults trace. 60 × 60 nested Monte Carlo.
**M7.2 national P50: US$45.4B, 0.95× the MMEIRS/World Bank anchor.**

Preserved here because it is the configuration the submitted abstract
describes. The submitted text stands; the paper reports v0.4 with this
changelog as the account of the difference.
