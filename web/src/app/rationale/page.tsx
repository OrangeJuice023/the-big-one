import Link from 'next/link';

export const metadata = { title: 'Rationale — The Big One Loss Estimator' };

export default function Rationale() {
  return (
    <main className="page-main">
      <article className="prose">
        <Link href="/" className="back-link">
          ← back to the map
        </Link>
        <h1>Why this exists</h1>
        <p>
          Every few years, Metro Manila is reminded that the West Valley Fault
          is due: a roughly 100-kilometer fault running through the eastern
          corridor of the capital, capable of a magnitude 7.2 earthquake, with
          PHIVOLCS placing its recurrence interval at 400 to 600 years and the
          last major rupture in 1658. The question that matters for policy is
          not whether to take it seriously, but <em>how much</em> to prepare —
          and preparation decisions need numbers.
        </p>
        <p>
          The numbers usually offered are single points: 2.4 trillion pesos in
          building damage, 48 billion US dollars in total losses, tens of
          thousands of casualties. These figures are useful anchors, but a
          single number hides the most decision-relevant fact about earthquake
          losses: they are extraordinarily uncertain.
        </p>

        <h2>The five-orders-of-magnitude problem</h2>
        <p>
          Three real earthquakes of nearly identical magnitude illustrate it.
          The 2013 Bohol earthquake (M7.2) caused about 52 million US dollars
          in monetized infrastructure damage. The 2010 Haiti earthquake (M7.0)
          caused 7.8 billion — more than Haiti&apos;s entire annual GDP. The 1995
          Kobe earthquake (M6.9) caused on the order of 130 billion. Same
          energy release, losses spanning five orders of magnitude, because
          what an earthquake costs is dominated by what it hits and how well
          that was built — exposure and vulnerability — not by magnitude
          alone.
        </p>
        <p>
          Any tool that gives Metro Manila one number is therefore making a
          claim it cannot support. This project takes the opposite approach:
          every estimate is an interval (P10/P50/P90), the maximum magnitude
          itself is treated as an uncertain parameter, and the model is tested
          against an earthquake that actually happened before being pointed at
          one that hasn&apos;t.
        </p>

        <h2>Why intervals matter for policy</h2>
        <p>
          Interval estimates change the decision calculus. Tail losses (P90)
          are what contingent-credit facilities and fiscal buffers should be
          sized against, not medians. Spatially resolved intervals support
          pre-positioning of response assets and prioritization of retrofitting
          across LGUs. And explicit uncertainty protects against both failure
          modes of single-number risk communication: complacency when the
          number feels abstract, and overreaction when it feels precise.
        </p>

        <h2>What this is not</h2>
        <p>
          This is not a prediction of when the Big One will occur, and it is
          not an official hazard product — PHIVOLCS and NDRRMC remain the
          authorities. It is a transparent, open-source research instrument for
          reasoning about the <em>range</em> of plausible economic consequences
          under explicit, documented assumptions. Its remaining methodological
          gaps are documented as open research questions in the{' '}
          <a
            href="https://github.com/OrangeJuice023/the-big-one"
            target="_blank"
            rel="noopener noreferrer"
          >
            repository
          </a>
          , and the full modeling chain is described on the{' '}
          <Link href="/methodology/">methodology page</Link>.
        </p>
        
        <h2>Scope</h2>
        <p>
          Two layers. The loss model covers 35 LGUs — 17 NCR cities plus 18
          fault-corridor LGUs. The policy compliance scorecard covers six LGUs
          on or directly adjacent to the WVF trace: Quezon City, Makati, Pasig,
          Marikina, Taguig, Pateros. This narrower policy set was chosen because
          ground rupture is a qualitatively different hazard from shaking, and
          because the six span the full capacity spectrum from the country's
          smallest municipality (Pateros, ~1.66 km²) to the most resource-rich
          commercial hubs (Makati, Taguig, QC). Manila is in the loss layer but
          not the policy layer — the fault does not run through Manila, so the
          RA 10121 "publicly displayed hazard maps" comparison would be uneven.
          The taxonomy of disclosure lapses proposed in this project is intended
          to generalize, but the specific distribution across LGUs is a finding
          restricted to the six pilots.
        </p>
      </article>
    </main>
  );
}
