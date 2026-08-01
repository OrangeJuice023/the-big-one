import Link from 'next/link';
import Plain from '@/components/Plain';
import scorecard from '@/lib/scorecard.json';

export const metadata = { title: 'Policy readiness | The Big One' };

/**
 * The matrix is GENERATED, not transcribed.
 *
 * scorecard.json is emitted by policy-layer/ledger/render_ledger.py from
 * status.csv, the single source of truth. An earlier version of this page kept
 * a hand-copied duplicate and it went stale twice. Pasig OB4 and Taguig OB3
 * were both wrong on the live site after the ledger changed, including the one
 * cell carrying the project's sharpest finding. Regenerate with:
 *
 *     cd policy-layer/ledger && python3 render_ledger.py
 *
 * Only the prose notes below are authored here. Every status, lapse flag and
 * total comes from the ledger.
 */

type Status = 'present' | 'partial' | 'to-collect' | 'absent';
type Lapse = 'access-broken' | 'access-foi' | 'access-none' | 'access-opaque' | null;
type Cell = { status: Status; lapse: Lapse };

const OBLIGATIONS = scorecard.obligations as { id: string; label: string; cite: string }[];

const NOTES: Record<string, string> = {
  'Quezon City':
    'Proactive digital disclosure. All eight obligations satisfied with primary documents publicly hosted on quezoncity.gov.ph.',
  'Pasig':
    'Published-but-discoverability-lapse. Statutory documents are on pasigcity.gov.ph but hosted at opaque-hash URLs; some are scanned-only. Ord. No. 02 s.2015 creates the PCDRRMO with a full plantilla; LDRRMP 2023–2028 targets zero casualties at M7.2. Pasig is one of three NCR LGUs (with QC and Makati) that installed physical WVF ground markers, the strongest hazard-display evidence in the corpus. But the plans limb of the same obligation fails: the council’s own Committee on Disaster Resilience directed on 7 June 2023 that the LDRRMP be “down loadable thru Pasig City website/platform”, and it is not. It is obtainable only in person, on a formal letter, a government ID and a USB drive.',
  'Makati':
    'Attempted digital disclosure, links broken. The Enhanced Makati DRRM Plan 2019–2030 is described on the Resilient Makati portal but the plan PDF returns file-not-found; the city hazard-map portal shows "not currently available" for several layers. CDP 2019–2025 and Zoning Ord. 2012-102 (with 5m WVF easement) are publicly hosted.',
  'Taguig':
    'Portal publishes operational activity (drills, Center for Disaster Management, MOCCOV, Aerial Platform Fire Truck), but statutory documents are eFOI-gated. CLUP 2000–2020 available only on 3rd-party academic mirrors. Updated CLUP eFOI request Sept 2025 routed through DENR-LMB. Ord. No. 91 s.2023 creates CDRRMO positions and appropriates funds, but the city’s ordinance index is titles-only, on a free third-party platform, covering 2022–2024 only, so the original office-creating ordinance is not reachable from it.',
  'Marikina':
    'Deliberate eFOI-only channel. DRRMO-creating Ord. No. 132 s.2011 identified but not publicly downloadable; LDRRMP shared via foi.gov.ph on request; CLUP 2018–2027 only on 3rd-party academic repos or by request from CPDO/eFOI. Documents exist and are active. They are simply not proactively disclosed.',
  'Pateros':
    'Portal exists but never attempted digital disclosure of DRRM documents. LDRRMO regulator-attested via DILG-NCR Local DRRMO Forum (14 July 2026) and PIA/OCD-NCR Magna Carta forum (July 2025). Response activity documented via non-LGU channels (PIA, BFP-NCR Facebook, SubayBAYAN LFP). Calamity fund tapped by council resolution (Aug 2013).',
};

const LGUS = (scorecard.lgus as {
  name: string;
  slug: string;
  cells: Record<string, { status: string; lapse: string | null }>;
  totals: { present: number; partial: number; toCollect: number; lapses: number };
}[]).map((l) => ({
  ...l,
  cells: l.cells as unknown as Record<string, Cell>,
  note: NOTES[l.name] ?? '',
}));

const LAPSE_LABEL: Record<string, string> = {
  'access-broken': 'attempted publish, link fails',
  'access-foi': 'eFOI-request only',
  'access-none': 'no digital-disclosure attempt',
  'access-opaque': 'online but unindexable/unsearchable',
};

function glyph(cell: Cell) {
  if (cell.status === 'present') return '✓';
  if (cell.status === 'partial') return '◐';
  return '·';
}

function countRow(lgu: (typeof LGUS)[number]) {
  const t = lgu.totals;
  return { present: t.present, partial: t.partial, tocollect: t.toCollect, lapses: t.lapses };
}

export default function PolicyReadiness() {
  return (
    <main className="page-main">
      <article className="prose">
        <Link href="/" className="back-link">← back to the map</Link>
        <h1>Policy readiness</h1>
        <p>
          For each of six pilot LGUs on the West Valley Fault trace, we score
          eight RA 10121 obligations by the state of the LGU&rsquo;s <em>public disclosure</em> of
          the relevant statutory document, not by whether the underlying
          activity is happening. The finding: every LGU on this list does DRRM.
          They diverge on <em>whether they let the public see the documents</em>, and
          they fail RA 10121&rsquo;s &ldquo;publicly displayed&rdquo; requirement in four
          distinct ways.
        </p>
        <Plain>
          <p style={{ marginTop: 0 }}>
            RA 10121 is the 2010 law that requires every city and municipality to
            set up a disaster office, write a disaster plan, and put its hazard
            maps and plans where the public can see them.
          </p>
          <p style={{ marginBottom: 0 }}>
            We checked six cities near the West Valley Fault against eight things
            that law requires. All six are doing disaster work. What differs is
            whether an ordinary resident can actually read the documents proving
            it. Mostly they cannot, and the reasons differ from city to city, which is what the four categories below describe.
          </p>
        </Plain>

        <h2>Why these six</h2>
        <p>
          Two filters, applied together. <strong>Fault exposure:</strong> the six
          sit on or immediately beside the West Valley Fault trace, where ground rupture, not just shaking, is a live hazard. That is what
          triggers the public-display duty for hazard maps and the no-build
          easement rules that appear in Makati, Pasig and Taguig zoning
          ordinances. <strong>Capacity spread:</strong> the six span the full
          range of local government resourcing in Metro Manila, from Pateros (the
          country&rsquo;s smallest municipality, 1.66 km&sup2; and about 67,000
          people) up to Quezon City.
        </p>
        <p>
          The second filter is what makes the comparison mean anything. If every
          LGU in the sample were similarly resourced, a finding that they differ
          in disclosure would say little. Spanning the capacity range lets us ask
          whether disclosure tracks resources. It does not, and that is the result.
        </p>
        <p>
          <strong>Manila is deliberately excluded.</strong> It appears in the
          35-LGU loss model but not here: the fault does not run through it, so
          it faces shaking without rupture and the hazard-map obligation applies
          differently. Including it would make the comparison uneven. Muntinlupa
          and San Juan touch the corridor at its ends and would be defensible
          additions; they are held for later work rather than excluded on
          principle. See <Link href="/rationale">rationale</Link> for the full
          scope statement.
        </p>
        <Plain label="Shorter version">
          <p style={{ margin: 0 }}>
            These are the six places the fault actually runs through or beside,
            picked so that the biggest and the smallest local governments in
            Metro Manila are both in the set. That way, if they turn out to
            differ in how much they publish, we can tell whether it is about money and staffing. It is not. Manila is left out because
            the fault misses it.
          </p>
        </Plain>

        <h2>Compliance matrix</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>
          ✓ present · ◐ partial · · to-collect · lapse flag beneath the glyph
          when applicable (see register below).
        </p>
        <Plain label="How do I read this table?">
          <p style={{ marginTop: 0 }}>
            Each row is one legal duty. Each column is one city. A check mark
            means we found the document and it is public. A half-circle means it only partly holds: usually the thing exists but the public cannot get at it. A dot means we have not found it, which is not the
            same as saying it does not exist.
          </p>
          <p style={{ marginBottom: 0 }}>
            The small tag under some symbols names <em>why</em> the public cannot
            get the document. The bottom row counts each column up.
          </p>
        </Plain>

        <div style={{ overflowX: 'auto', margin: '1.5rem 0' }}>
          <table style={{ borderCollapse: 'collapse', fontSize: '0.875rem', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0.5rem', borderBottom: '2px solid currentColor' }}>Obligation</th>
                {LGUS.map(l => (
                  <th key={l.slug} style={{ padding: '0.5rem', borderBottom: '2px solid currentColor', textAlign: 'center' }}>{l.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OBLIGATIONS.map(ob => (
                <tr key={ob.id}>
                  <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(128,128,128,0.3)' }}>
                    <strong>{ob.id}</strong> {ob.label}
                    <br/>
                    <small style={{ opacity: 0.65 }}>{ob.cite}</small>
                  </td>
                  {LGUS.map(l => {
                    const c = l.cells[ob.id];
                    return (
                      <td key={l.slug} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(128,128,128,0.3)', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.25rem' }}>{glyph(c)}</div>
                        {c.lapse && (
                          <div style={{ fontSize: '0.65rem', opacity: 0.7, fontFamily: 'monospace' }}>!{c.lapse}</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <td style={{ padding: '0.5rem', fontWeight: 600 }}>Summary</td>
                {LGUS.map(l => {
                  const c = countRow(l);
                  return (
                    <td key={l.slug} style={{ padding: '0.5rem', textAlign: 'center', fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {c.present}/{c.partial}/{c.tocollect}
                      {c.lapses > 0 && <div style={{ opacity: 0.7 }}>{c.lapses} lapse{c.lapses > 1 ? 's' : ''}</div>}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <h2>Lapse taxonomy</h2>
        <p>
          Every lapse in the matrix caps the affected obligation at partial. We
          distinguish four modes of failing &ldquo;publicly displayed&rdquo; because they
          have distinct policy implications:
        </p>
        <ul>
          {(['access-broken', 'access-foi', 'access-none', 'access-opaque'] as const).map(k => (
            <li key={k}>
              <code>{k}</code>: {LAPSE_LABEL[k]}.
            </li>
          ))}
        </ul>
        <Plain label="In plain terms">
          <p style={{ marginTop: 0 }}>
            Four ways a document can be legally &ldquo;published&rdquo; and still be
            impossible to read:
          </p>
          <ul style={{ margin: '0.4rem 0', paddingLeft: '1.2rem' }}>
            <li>The city put it online, but the link is dead.</li>
            <li>You have to file a formal request to get a copy.</li>
            <li>The city never put it online at all.</li>
            <li>
              It is online, but you would never find it. The file is named something meaningless, or it is a photograph of paper you cannot
              search, or the page lists only a title with no document attached.
            </li>
          </ul>
          <p style={{ marginBottom: 0 }}>
            The last is the sneakiest, because the city can honestly say the
            document is on its website.
          </p>
        </Plain>
        <p>
          The compliance gap this project surfaces is a <em>national policy gap</em>, not
          a local resource gap. RA 10121 requires plans and hazard maps to be
          &ldquo;publicly displayed&rdquo; but does not specify online / permanently
          downloadable / proactively disclosed. EO 2 s.2016 (Freedom of
          Information) then makes on-request retrieval the default for anything
          not proactively disclosed. LGUs can technically satisfy the letter of
          the law by keeping hard copies at city hall and granting eFOI on request, without ever putting the PDF on their website.
        </p>
        <Plain label="Why is that the law's fault and not the city's?">
          <p style={{ margin: 0 }}>
            The 2010 disaster law says plans and hazard maps must be
            &ldquo;publicly displayed.&rdquo; It never says <em>how</em>: nothing about websites, downloads, or keeping a copy up permanently. A
            separate 2016 rule then says anything a government office has not
            already published, you can request. Put together, a city can satisfy
            the disaster law by keeping one printed copy at city hall and handing
            out copies to whoever asks. That is lawful. It is also not much use
            to someone in a barangay trying to find out where to go during an
            earthquake.
          </p>
        </Plain>

        <h2>Per-LGU notes</h2>
        {LGUS.map(l => (
          <div key={l.slug} style={{ marginTop: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.25rem' }}>{l.name}</h3>
            <p style={{ marginTop: 0 }}>{l.note}</p>
          </div>
        ))}

        <h2>How to use this</h2>
        <p>
          Every claim here is traceable through <code>policy-layer/ledger/status.csv</code> →
          the <code>evidence</code> field of each row → the corresponding corpus note in{' '}
          <code>policy-layer/corpus/</code> → the source URL in{' '}
          <code>policy-layer/ledger/manifest.csv</code>. Rows where{' '}
          <code>manifest.csv</code>&rsquo;s <code>provenance_note</code> column contains
          &ldquo;PENDING&rdquo; are not yet primary-source-verified and should be treated as
          preliminary. See <code>policy-layer/ATTRIBUTION.md</code> for the full source-type
          taxonomy and session audit.
        </p>
      </article>
    </main>
  );
}
