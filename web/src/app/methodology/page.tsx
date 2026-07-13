import Link from 'next/link';

export const metadata = { title: 'Methodology — The Big One Loss Estimator' };

export default function Methodology() {
  return (
    <main className="page-main">
      <article className="prose">
        <Link href="/" className="back-link">
          ← back to the map
        </Link>
      <h1>Methodology</h1>
      <p>
        This page summarizes how the estimates are produced. The full write-up
        lives in <code>docs/methodology.md</code> in the repository and should be
        expanded there first, then mirrored here.
      </p>

      <h2>What this is (and is not)</h2>
      <p>
        This is scenario-based loss estimation with quantified uncertainty — the
        same framing used by USGS PAGER and GEM OpenQuake — not a prediction of
        when an earthquake will occur or a precise forecast of damages. Every
        figure is presented as a P10/P50/P90 range.
      </p>

      <h2>Scenario magnitude range</h2>
      <p>
        Scenarios span M6.0&ndash;M7.2, anchored on the PHIVOLCS maximum-credible
        magnitude of 7.2 for the ~100-km West Valley Fault. An M7.5 stress test
        is included to reflect paleoseismic upper-bound estimates that exceed
        the official maximum-credible value &mdash; treating the maximum
        magnitude itself as an epistemically uncertain parameter rather than a
        settled constant.
      </p>

      <h2>Ground shaking</h2>
      <p>
        For each scenario magnitude (M6.5–M7.6), shaking intensity per LGU is
        computed with the Allen, Wald &amp; Worden (2012) intensity prediction
        equation for active crustal regions (rupture-distance version,
        coefficients cross-checked against the GEM OpenQuake implementation),
        using the distance from each LGU centroid to the West Valley Fault
        surface trace.
      </p>

      <h2>Loss model</h2>
      <p>
        LightGBM quantile regressors (α = 0.1, 0.5, 0.9) are trained on
        historical earthquake losses from the NOAA NCEI Significant Earthquake
        Database and EM-DAT, with losses adjusted to constant 2026 US dollars.
        Event-level predictions are allocated across LGUs in proportion to
        exposure weight times an intensity-dependent damage ratio.
      </p>

      <h2>Validation and the Bohol 2013 backtest</h2>
      <p>
        Models are evaluated on a temporal holdout (events from 2010 onward) and
        must beat a magnitude-only baseline. Because the West Valley Fault
        scenario cannot be validated directly (it has not occurred), the
        pipeline is backtested against the 2013 Mw 7.2 Bohol earthquake — same
        magnitude, shallow, on Philippine territory, with published ground
        truth: 222 deaths, 73,002 damaged houses, and ₱2.257B in monetized
        infrastructure damage (NDRRMC). The intensity model must reproduce the
        observed PEIS VIII epicentral / PEIS VII regional pattern, and the loss
        interval must be consistent with the monetized floor. Separately, the
        M7.2 WVF national P50 is compared against the PHIVOLCS 2013 estimate of
        ₱2.4T in building damage and the World Bank's ~USD 48B total-loss
        figure as sanity anchors — the model is never tuned to match any
        benchmark.
      </p>

      <h2>Key limitations</h2>
      <p>
        Historical loss databases carry survivorship and reporting bias; only
        direct losses are modeled (no business interruption or supply-chain
        effects); LGU-centroid distances ignore intra-city variation; no
        liquefaction or fire-following modeling; the fault trace currently used
        is an approximation pending replacement with the authoritative PHIVOLCS
        trace; and GRDP as an exposure proxy overweights economic output
        relative to building stock value.
      </p>
      </article>
    </main>
  );
}
