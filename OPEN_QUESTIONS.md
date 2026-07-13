# Open Questions (v0.1 — research frontier)

This project is deliberately versioned as work-in-progress. The engineering
core runs end-to-end; the questions below are the methodological decisions I
have made *tentatively* and consider open. Each states what I did, why I'm
not satisfied, and what I think the candidate answers are.

## 1. Separating aleatoric and epistemic uncertainty in the loss chain

**Status: partially addressed in v0.2.** The scenario engine now runs a
nested Monte Carlo (60x60): AWW12 sigma sampled with partial spatial
correlation (aleatoric) and priors over fragility parameters and the
capital-output ratio (epistemic), split via the law of total variance
(result: roughly 2/3 aleatoric, 1/3 epistemic at M7.2). Still open: the
epistemic priors are elicited, not fitted; the ML model's own parameter
uncertainty is not yet in the decomposition.

**What I did originally (v0.1):** LightGBM quantile regression captured total
predictive uncertainty in one bundle, with GMPE sigma reported but not
propagated.

**Why I'm not satisfied:** The chain mixes fundamentally different
uncertainties — irreducible randomness in ground shaking (aleatoric) versus
my ignorance about the loss function's parameters, trained on sparse global
data (epistemic). Collapsing them into one interval hides which part more
data could actually shrink.

**Candidate directions:** Monte Carlo over the GMPE sigma for the aleatoric
part; deep/quantile ensembles or a Bayesian last layer for the epistemic
part; report the decomposition, not just the total.

## 2. Validating under covariate shift: is one backtest enough?

**What I did:** Trained on global historical earthquakes, applied to Metro
Manila (near-zero direct training examples — essentially out-of-distribution),
and backtested on the 2013 Bohol M7.2 event.

**Why I'm not satisfied:** One passing backtest demonstrates transfer is
*possible*, not *reliable*. Bohol also differs from the WVF scenario in fault
mechanism (reverse vs. strike-slip) and exposure character (semi-rural vs.
hyper-urban). Calibration metrics (P10–P90 coverage) computed on the global
holdout may not survive the shift to Philippine urban exposure.

**Candidate directions:** Backtest on additional PH events (1990 Luzon M7.7,
2019 Mindanao sequence, 2022 Abra M7.0); importance-weighted validation using
exposure covariates; conformal prediction for coverage guarantees under shift.

## 3. Ground truth itself is uncertain

**What I did:** Used NDRRMC's PHP 2.257B Bohol figure as the observed loss.

**Why I'm not satisfied:** That figure is public infrastructure only; the
73,002 damaged houses were counted in units, not pesos. My "answer key" is a
lower bound with unknown gap. Historical loss databases (NOAA, EM-DAT) carry
the same reporting bias — my training target is systematically noisy in a
non-random way.

**Candidate directions:** Model the target as interval-censored; sensitivity
analysis on loss-inflation assumptions; compare NDRRMC vs. EM-DAT vs.
academic reconstructions per event.

## 4. Where should this sit on the physics–data spectrum?

**What I did:** Empirical ML loss model + a logistic damage-ratio proxy for
spatial allocation. The "physics" is only in the GMPE.

**Why I'm not satisfied:** The damage-ratio proxy is shaped like a fragility
curve but fitted to nothing. The rigorous alternative — engineering fragility
functions per building class (HAZUS/OpenQuake style) — needs exposure data
(building inventory by structural type) that is scarce for NCR at fine grain.

**Candidate directions:** Hybrid: mechanistic fragility form with learned
parameters (SciML-style); or adopt OpenQuake's vulnerability module and let
ML handle only the residual. Related decision consciously made: I chose
empirical global-loss regression over full probabilistic seismic hazard
analysis (PSHA) for tractability — is that defensible at this fidelity, or
does credibility require the PSHA frame even for a scenario tool?

## 5. Maximum magnitude is itself an uncertain parameter

**What I did:** Scenarios span M6.0–M7.2, anchored on the PHIVOLCS
maximum-credible magnitude of 7.2 for the West Valley Fault, plus an M7.5
stress test reflecting paleoseismic upper-bound estimates that exceed the
official maximum-credible value.

**Why I'm not satisfied:** Treating Mmax as a slider dodges the real
question: the scientific community itself disagrees (official 7.2 vs.
geological ~7.5). A risk-relevant answer would put a probability distribution
over Mmax and integrate, rather than presenting discrete scenarios.

**Candidate directions:** Logic-tree weighting over Mmax (standard in PSHA);
elicit weights from published segment-rupture studies; show how sensitive the
national loss estimate is to that single epistemic choice.

## 6. Spatial resolution vs. honest precision

**What I did:** LGU-level (17 cities). Deliberately NOT barangay-level.

**Why:** Downscaling one uncertain national estimate across ~1,700 barangays
by population share adds apparent resolution without information — false
precision. Finer resolution is only honest once exposure (building inventory,
replacement values) and fragility are modeled at that grain.

**Open part:** What is the finest resolution at which the current data
actually supports distinct, defensible loss distributions? Is there a
principled information-theoretic way to choose it?
