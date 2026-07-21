import Link from 'next/link';

export const metadata = { title: 'Policy readiness — The Big One' };

type Status = 'present' | 'partial' | 'to-collect';
type Lapse = 'access-broken' | 'access-foi' | 'access-none' | 'access-opaque' | null;

type Cell = { status: Status; lapse: Lapse };
type LGU = { name: string; slug: string; cells: Record<string, Cell>; note?: string };

const OBLIGATIONS: { id: string; label: string; cite: string }[] = [
  { id: 'OB1', label: 'LDRRMO established', cite: 'RA 10121 §12(a)' },
  { id: 'OB2', label: 'LDRRMP formulated, tested & updated', cite: '§11(b)(1); §12(c)(6)' },
  { id: 'OB3', label: 'Ordinance creating DRRMO (staff+budget)', cite: 'IRR Rule 6 §6' },
  { id: 'OB4', label: 'Hazard maps & plans PUBLICLY displayed', cite: 'IRR Rule 6 §7; §12(c)(10)' },
  { id: 'OB5', label: 'Local risk assessment / hazard ID', cite: '§12(c)(2,3,9)' },
  { id: 'OB6', label: 'Regular drills conducted', cite: 'IRR Rule 6 §7; §12(c)(4)' },
  { id: 'OB7', label: 'LDRRM Fund incl. 30% QRF programmed', cite: '§21' },
  { id: 'OB8', label: 'DRR mainstreamed into CDP/CLUP', cite: '§11(b)(2)' },
];

const LGUS: LGU[] = [
  {
    name: 'Quezon City',
    slug: 'qc',
    note: 'Proactive digital disclosure. All eight obligations satisfied with primary documents publicly hosted on quezoncity.gov.ph.',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'present', lapse: null },
      OB3: { status: 'present', lapse: null },
      OB4: { status: 'present', lapse: null },
      OB5: { status: 'present', lapse: null },
      OB6: { status: 'present', lapse: null },
      OB7: { status: 'present', lapse: null },
      OB8: { status: 'present', lapse: null },
    },
  },
  {
    name: 'Pasig',
    slug: 'pasig',
    note: 'Published-but-discoverability-lapse. Statutory documents are on pasigcity.gov.ph but hosted at opaque-hash URLs; some are scanned-only. Ord. No. 02 s.2015 creates the PCDRRMO with a full plantilla; LDRRMP 2023–2028 targets zero casualties at M7.2. Pasig is one of three NCR LGUs (with QC and Makati) that installed physical WVF ground markers.',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'present', lapse: null },
      OB3: { status: 'present', lapse: null },
      OB4: { status: 'present', lapse: null },
      OB5: { status: 'present', lapse: null },
      OB6: { status: 'present', lapse: null },
      OB7: { status: 'partial', lapse: null },
      OB8: { status: 'present', lapse: null },
    },
  },
  {
    name: 'Makati',
    slug: 'makati',
    note: 'Attempted digital disclosure, links broken. The Enhanced Makati DRRM Plan 2019–2030 is described on the Resilient Makati portal but the plan PDF returns file-not-found; the city hazard-map portal shows "not currently available" for several layers. CDP 2019–2025 and Zoning Ord. 2012-102 (with 5m WVF easement) are publicly hosted.',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'partial', lapse: 'access-broken' },
      OB3: { status: 'present', lapse: null },
      OB4: { status: 'partial', lapse: 'access-broken' },
      OB5: { status: 'present', lapse: null },
      OB6: { status: 'to-collect', lapse: null },
      OB7: { status: 'present', lapse: null },
      OB8: { status: 'present', lapse: null },
    },
  },
  {
    name: 'Taguig',
    slug: 'taguig',
    note: 'Portal publishes operational activity (drills, Center for Disaster Management, MOCCOV, Aerial Platform Fire Truck), but statutory documents are eFOI-gated. CLUP 2000–2020 available only on 3rd-party academic mirrors. Updated CLUP eFOI request Sept 2025 routed through DENR-LMB.',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'to-collect', lapse: null },
      OB3: { status: 'to-collect', lapse: null },
      OB4: { status: 'partial', lapse: 'access-foi' },
      OB5: { status: 'partial', lapse: null },
      OB6: { status: 'present', lapse: null },
      OB7: { status: 'partial', lapse: 'access-foi' },
      OB8: { status: 'partial', lapse: 'access-foi' },
    },
  },
  {
    name: 'Marikina',
    slug: 'marikina',
    note: 'Deliberate eFOI-only channel. DRRMO-creating Ord. No. 132 s.2011 identified but not publicly downloadable; LDRRMP shared via foi.gov.ph on request; CLUP 2018–2027 only on 3rd-party academic repos or by request from CPDO/eFOI. Documents exist and are active — they are not proactively disclosed.',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'partial', lapse: 'access-foi' },
      OB3: { status: 'partial', lapse: 'access-foi' },
      OB4: { status: 'partial', lapse: null },
      OB5: { status: 'partial', lapse: null },
      OB6: { status: 'present', lapse: null },
      OB7: { status: 'present', lapse: null },
      OB8: { status: 'partial', lapse: 'access-foi' },
    },
  },
  {
    name: 'Pateros',
    slug: 'pateros',
    note: 'Portal exists but never attempted digital disclosure of DRRM documents. LDRRMO regulator-attested via DILG-NCR Local DRRMO Forum (14 July 2026) and PIA/OCD-NCR Magna Carta forum (July 2025). Response activity documented via non-LGU channels (PIA, BFP-NCR Facebook, SubayBAYAN LFP). Calamity fund tapped by council resolution (Aug 2013).',
    cells: {
      OB1: { status: 'present', lapse: null },
      OB2: { status: 'to-collect', lapse: null },
      OB3: { status: 'to-collect', lapse: null },
      OB4: { status: 'to-collect', lapse: null },
      OB5: { status: 'to-collect', lapse: null },
      OB6: { status: 'partial', lapse: 'access-none' },
      OB7: { status: 'partial', lapse: 'access-none' },
      OB8: { status: 'to-collect', lapse: null },
    },
  },
];

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

function countRow(lgu: LGU) {
  let present = 0, partial = 0, tocollect = 0, lapses = 0;
  for (const oid of OBLIGATIONS.map(o => o.id)) {
    const c = lgu.cells[oid];
    if (c.status === 'present') present++;
    else if (c.status === 'partial') partial++;
    else tocollect++;
    if (c.lapse) lapses++;
  }
  return { present, partial, tocollect, lapses };
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
          the relevant statutory document — not by whether the underlying
          activity is happening. The finding: every LGU on this list does DRRM.
          They diverge on <em>whether they let the public see the documents</em>, and
          they fail RA 10121&rsquo;s &ldquo;publicly displayed&rdquo; requirement in four
          distinct ways.
        </p>

        <h2>Compliance matrix</h2>
        <p style={{ fontSize: '0.875rem', opacity: 0.75 }}>
          ✓ present · ◐ partial · · to-collect · lapse flag beneath the glyph
          when applicable (see register below).
        </p>

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
              <code>{k}</code> &mdash; {LAPSE_LABEL[k]}.
            </li>
          ))}
        </ul>
        <p>
          The compliance gap this project surfaces is a <em>national policy gap</em>, not
          a local resource gap. RA 10121 requires plans and hazard maps to be
          &ldquo;publicly displayed&rdquo; but does not specify online / permanently
          downloadable / proactively disclosed. EO 2 s.2016 (Freedom of
          Information) then makes on-request retrieval the default for anything
          not proactively disclosed. LGUs can technically satisfy the letter of
          the law by keeping hard copies at city hall and granting eFOI on
          request — without ever putting the PDF on their website.
        </p>

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
