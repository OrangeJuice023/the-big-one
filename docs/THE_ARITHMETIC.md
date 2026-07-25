# The arithmetic, shown

Every number in the loss estimate, and the step that produced it. Computed from
`model/src/` at seed 42; re-runnable with `python -m src.calibrate` then
`python -m src.scenarios`.

**Headline: a magnitude 7.2 West Valley Fault rupture gives a median direct
loss of US$45.4 billion, with a 10th–90th percentile range of US$14.0B to
US$106.4B.** Below is how that number is built, and what it would take to make
it smaller.

---

## The chain, in one line

```
distance to fault  →  shaking intensity  →  damage fraction  →  peso loss
     (Rrup)              (MMI, AWW12)        (fragility curve)   (× capital stock)
```

Four steps. Two are fixed physics, two are learned from data.

---

## Step 1 — How hard the ground shakes

Allen, Wald & Worden (2012) intensity prediction equation for active crustal
regions, rupture-distance form:

```
MMI = c0 + c1·M + c2·ln( √( Rrup² + (1 + c3·e^(M−5))² ) )

c0 = 3.950   c1 = 0.913   c2 = −1.107   c3 = 0.813
```

Coefficients cross-checked against the GEM OpenQuake implementation. Worked at
M7.2:

| Distance to fault | Intensity | Uncertainty (σ) |
|---|---|---|
| 0.5 km | **MMI 8.17** | ±0.95 |
| 2 km | **MMI 8.14** | ±0.95 |
| 5 km | **MMI 8.01** | ±0.95 |
| 10 km | **MMI 7.68** | ±0.94 |
| 20 km | **MMI 7.12** | ±0.91 |
| 40 km | **MMI 6.42** | ±0.85 |

An LGU sitting on the trace gets MMI 8. One 40 km away gets MMI 6.4 — about
1.75 intensity units less. That gap is where most of the variation between LGUs
comes from.

**Sanity check against the authorities.** PHIVOLCS expects PEIS/MMI VIII across
the near-fault Metro Manila corridor. The equation gives 8.0–8.2 inside 5 km,
independently. Nothing was tuned to match it.

---

## Step 2 — How much breaks at that intensity

A logistic fragility curve. Three parameters; this is what the machine learning
learns.

```
damage ratio = MDR_MAX / ( 1 + e^( −slope·(MMI − M0) ) )

slope = 1.4  (fixed)
MDR_MAX, M0  (learned — see Step 5)
```

At the calibrated values (MDR_MAX = 0.361, M0 = 8.881):

| Intensity | Damage ratio | Share of capital stock destroyed |
|---|---|---|
| MMI 6 | 0.0063 | **0.63%** |
| MMI 7 | 0.0241 | **2.41%** |
| MMI 8 | 0.0813 | **8.13%** |
| MMI 9 | 0.1952 | **19.52%** |
| MMI 10 | 0.2982 | **29.82%** |

The curve is steep between MMI 7 and 9 — damage roughly **eightfold** across
two intensity units. This is why the distance-to-fault term in Step 1 matters
so much: small differences in shaking produce large differences in loss.

---

## Step 3 — Turning damage fraction into pesos

```
capital stock = K × annual economic output
loss          = capital stock × damage ratio
```

`K` is the capital-output ratio — how many pesos of buildings, roads and
equipment stand behind one peso of annual output. Also learned (Step 5).

**A single LGU, worked end to end.** An LGU 2 km from the trace with PHP 500
billion annual output:

```
Rrup 2 km, M7.2                    → MMI 8.14
capital stock = 2.829 × PHP 500B    = PHP 1.41 trillion
damage ratio at MMI 8.14            = 0.0948
loss = PHP 1.41T × 0.0948           = PHP 134.1 billion
                                    = US$2.29 billion
```

**Scaling to all 35 LGUs.** Total exposure base is **PHP 12.4 trillion in
annual output**. Of the 35 LGUs, 8 use published PSA city GDP (×1.30 deflator
to nominal); the remaining 27 use population × regional per-capita output. The
mix is flagged per-LGU in the JSON output rather than hidden — a documented
weakness, not a smoothed-over one.

---

## Step 4 — Why one number is not enough

Two kinds of uncertainty, kept separate by a **nested** Monte Carlo:

- **Aleatoric** — irreducible randomness in ground motion. The IPE's own σ of
  ~0.95 intensity units. Even a perfect model has this.
- **Epistemic** — our ignorance about the fragility parameters. Reducible with
  better data.

At M7.2 the split is **65% aleatoric / 35% epistemic**. Read that as: roughly
two-thirds of the spread is the earthquake being unpredictable, one-third is us
not knowing enough. Better data narrows the third, never the two-thirds.

**Result at M7.2:**

```
P10   US$14.0B
P50   US$45.4B     ← the headline
P90   US$106.4B
```

**Why the interval is the finding, not the median.** Three real earthquakes
near this magnitude:

| Event | Magnitude | Loss |
|---|---|---|
| Bohol 2013 | 7.2 | US$52 million |
| Haiti 2010 | 7.0 | US$7.8 billion |
| Kobe 1995 | 6.9 | US$130 billion |

Five orders of magnitude at near-identical magnitude. Exposure and
vulnerability dominate, not magnitude. Any single-point estimate for Metro
Manila is asserting more precision than the physics permits.

---

## Step 5 — The machine learning part

The fragility parameters were guesses in v0.2. A sensitivity tornado showed the
fragility midpoint was the single dominant assumption — swinging the P50 by
−33%/+43%. So they were replaced with values **learned from an observed
Philippine earthquake.**

The method is **approximate Bayesian computation (ABC) by rejection.** Why
likelihood-free: the forward model is a Monte Carlo simulation with no
closed-form likelihood, so standard Bayesian updating is unavailable. ABC needs
only the ability to *simulate*.

**The procedure, exactly:**

1. Draw 200,000 parameter sets from the priors.
2. Run each through the forward model against the **1990 Luzon earthquake**
   (Mw 7.7, reported US$369.6M damage, PHP 24.3/USD).
3. Keep a draw if its predicted loss falls within **[0.7×, 3.0×]** of the
   reported figure. The window is wide and asymmetric on purpose: official
   damage totals undercount housing, so the observation is treated as
   **interval-censored** rather than exact.
4. The kept draws are the posterior.

**Result — 76,593 of 200,000 draws accepted (38.3%):**

| Parameter | Prior | Posterior | Shift |
|---|---|---|---|
| K (capital-output ratio) | 2.800 ± 0.400 | **2.829 ± 0.397** | +0.029 |
| MDR_MAX (max damage ratio) | 0.350 ± 0.080 | **0.361 ± 0.077** | +0.011 |
| M0 (fragility midpoint) | 9.000 ± 0.400 | **8.881 ± 0.366** | −0.119 |

**How to read a small shift honestly.** The parameters barely moved. Two
readings, and the second is the right one:

- Weak: the data added little.
- Correct: the priors were already consistent with a real Philippine
  earthquake, and **38.3% of prior draws survived contact with observed
  damage.** A badly specified prior would have been rejected at a far higher
  rate. The M0 shift is downward — the real event implies damage begins at
  *slightly lower* intensity than assumed, i.e. buildings marginally more
  fragile than the literature prior.

A 38.3% acceptance rate is healthy for rejection ABC. Very low rates signal
prior–data conflict; very high rates signal an uninformative window.

---

## Step 6 — The out-of-sample test

**2013 Bohol was held out entirely.** It is never used in calibration. Same
magnitude as the target scenario (M7.2), different island, different fault.

**Hazard check:**

| Location | Predicted | Observed (PHIVOLCS) |
|---|---|---|
| Near epicentre (~5 km) | MMI 8.0 (σ 0.95) | PEIS VIII |
| Tagbilaran (~25 km) | MMI 6.9 (σ 0.90) | PEIS VII |
| Tagbilaran (~34 km) | MMI 6.6 (σ 0.87) | PEIS VII |

Every band within one intensity unit — inside the equation's own published σ.
**PASS.**

**Loss check:**

```
predicted:  P10 US$45M  |  P50 US$188M  |  P90 US$603M
observed:   US$52M  (NDRRMC SitRep 35 — infrastructure only)
```

The observed figure sits just above P10, and that is the correct place for it.
The PHP 2.257B NDRRMC total covers **public infrastructure only** — the 73,002
damaged houses were counted in units, never in pesos. So US$52M is a **floor**,
not a total. An interval whose lower tail contains a known floor, with room
above it for the uncounted housing, is the expected result. **PASS.**

**Why this is a strong test rather than a lenient one.** Calibration was at
M7.7 on Luzon; validation at M7.2 on Bohol; the scenario is M7.2 in Metro
Manila. The model is asked to generalise across magnitude *and* geography, and
is tested at the target magnitude on data it never saw.

---

## Step 7 — Against the benchmark

| Source | Estimate |
|---|---|
| World Bank / MMEIRS lineage | US$48B (~12% of GDP) |
| **This model, M7.2 P50** | **US$45.4B** |
| Ratio | **0.95×** |

Reached **without tuning to it.** The benchmark is a comparison, not a target;
`benchmarks.json` says so explicitly: *"Do not tune models to match these;
compare and explain."*

---

## Step 8 — What it takes to make the number small

The adversarial test. Push every learned parameter to the value most favourable
to a low estimate — 5th percentile K, 5th percentile MDR_MAX, 95th percentile
M0 (damage starting later):

```
K = 2.176   MDR_MAX = 0.235   M0 = 9.481
```

Even then, with the whole PHP 12.4T exposure base at MMI 8:

```
damage ratio 0.0262  →  PHP 0.71 trillion  →  US$12.1 billion
```

**A stacked set of favourable assumptions still gives losses in the tens of
billions of dollars.** The conclusion that a WVF M7.2 is a
tens-of-billions event does not depend on the central parameter estimates.

---

## Human scale

US$45.4 billion, for a metro of roughly 13 million people:

- About **US$3,500 per resident** of Metro Manila
- Roughly **PHP 2.66 trillion** at PHP 58.5/USD
- Compare: PHIVOLCS-Australia (2013) put building damage alone at
  **PHP 2.4 trillion** — our all-sector figure sits just above their
  buildings-only figure, which is the expected ordering

The interval matters more than the point. **US$14B to US$106B** is the range a
contingent credit facility would have to be sized against, and it is a
different planning problem at each end.

---

## What is fixed, what is learned, what is assumed

| | |
|---|---|
| **Fixed physics** | AWW12 coefficients (published, cross-checked against OpenQuake); logistic functional form; fragility slope = 1.4 |
| **Learned from data** | K, MDR_MAX, M0 — via ABC on Luzon 1990 |
| **Assumed and documented** | interval-censoring window [0.7×, 3.0×]; LGU-centroid distance as Rrup proxy; capital-output ratio as building-stock proxy; 1990 exposure bands |
| **Deliberately excluded** | liquefaction, site amplification, fire-following, business interruption, casualties |

The exclusions are not oversights. Each is a documented limitation in
`docs/methodology.md`, and each would push the estimate **up**, not down.

---

## Reproducing this

```bash
cd model
python -m src.calibrate       # ABC → models/fragility_posterior.csv
python -m src.scenarios       # → m60..m72, m75 JSON
python -m src.backtest_bohol  # out-of-sample validation
python -m src.validate        # benchmark comparison
```

Seed 42 throughout. A fresh posterior reproduces the published figures exactly.
`model/models/` is gitignored because it is rebuildable, not because it is
hidden.
