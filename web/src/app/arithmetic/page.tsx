import Link from 'next/link';
import type { CSSProperties } from 'react';
import TeX from '@/components/TeX';

export const metadata = {
  title: 'The arithmetic — The Big One',
  description:
    'Every number in the West Valley Fault loss estimate, and the step that produced it.',
};

/* ------------------------------------------------------------------ *
 * Data below is computed output from model/src at seed 42.
 * Regenerate with: python -m src.calibrate && python -m src.scenarios
 * ------------------------------------------------------------------ */

const ATTENUATION: [number, number][] = [
  [0.5, 8.17], [1, 8.17], [2, 8.14], [3, 8.11], [5, 8.01], [8, 7.81],
  [12, 7.55], [17, 7.27], [25, 6.9], [35, 6.56], [50, 6.18], [70, 5.81],
];

const FRAGILITY: [number, number][] = [
  [5.0, 0.0016], [5.6, 0.0036], [6.2, 0.0083], [6.8, 0.0186], [7.4, 0.0403],
  [8.0, 0.0813], [8.6, 0.1452], [9.2, 0.2198], [9.8, 0.2825], [10.4, 0.3221],
  [11.0, 0.3429],
];

const M0_HIST: { bin: number; prior: number; post: number }[] = [
  { bin: 7.6, prior: 0.006, post: 0.007 }, { bin: 7.8, prior: 0.024, post: 0.034 },
  { bin: 8.0, prior: 0.084, post: 0.116 }, { bin: 8.2, prior: 0.223, post: 0.316 },
  { bin: 8.4, prior: 0.460, post: 0.634 }, { bin: 8.6, prior: 0.748, post: 0.947 },
  { bin: 8.8, prior: 0.962, post: 1.080 }, { bin: 9.0, prior: 0.957, post: 0.898 },
  { bin: 9.2, prior: 0.744, post: 0.575 }, { bin: 9.4, prior: 0.457, post: 0.275 },
  { bin: 9.6, prior: 0.220, post: 0.089 }, { bin: 9.8, prior: 0.083, post: 0.024 },
  { bin: 10.0, prior: 0.027, post: 0.004 }, { bin: 10.2, prior: 0.006, post: 0.001 },
];


/** ABC on 1990 Luzon: 200,000 prior draws binned by predicted loss (log10 USD),
 *  with the subset that fell inside the acceptance window. Computed output. */
const ABC_BINS: { b: number; t: number; a: number }[] = [
  { b: 6.875, t: 596, a: 0 }, { b: 7.0, t: 1101, a: 0 }, { b: 7.125, t: 1751, a: 0 },
  { b: 7.25, t: 2740, a: 0 }, { b: 7.375, t: 4226, a: 0 }, { b: 7.5, t: 6027, a: 0 },
  { b: 7.625, t: 8312, a: 0 }, { b: 7.75, t: 10808, a: 0 }, { b: 7.875, t: 13598, a: 0 },
  { b: 8.0, t: 15916, a: 0 }, { b: 8.125, t: 17883, a: 0 }, { b: 8.25, t: 19417, a: 0 },
  { b: 8.375, t: 19094, a: 13332 }, { b: 8.5, t: 18448, a: 18448 },
  { b: 8.625, t: 16840, a: 16840 }, { b: 8.75, t: 13890, a: 13890 },
  { b: 8.875, t: 10949, a: 10949 }, { b: 9.0, t: 7703, a: 3134 },
  { b: 9.125, t: 5066, a: 0 }, { b: 9.25, t: 2802, a: 0 }, { b: 9.375, t: 1454, a: 0 },
  { b: 9.5, t: 522, a: 0 }, { b: 9.625, t: 145, a: 0 },
];
const ABC_OBS = 369.6e6;
const ABC_WIN: [number, number] = [258.7e6, 1108.8e6];

const ACCENT = 'var(--accent)';
const MUTED = 'rgba(128,128,128,0.45)';
const GRID = 'rgba(128,128,128,0.22)';

/* ---------- chart 1: attenuation ---------- */
function AttenuationChart() {
  const W = 620, H = 260, P = { t: 18, r: 18, b: 44, l: 46 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const xs = (r: number) => P.l + (Math.log10(r + 1) / Math.log10(71)) * iw;
  const ys = (m: number) => P.t + ih - ((m - 5) / 4) * ih;
  const path = ATTENUATION.map(([r, m], i) => `${i ? 'L' : 'M'}${xs(r).toFixed(1)},${ys(m).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="Shaking intensity falls with distance from the fault">
      {[5, 6, 7, 8, 9].map((m) => (
        <g key={m}>
          <line x1={P.l} y1={ys(m)} x2={W - P.r} y2={ys(m)} stroke={GRID} strokeWidth="1" />
          <text x={P.l - 8} y={ys(m) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.65">{m}</text>
        </g>
      ))}
      {[1, 5, 10, 25, 50, 70].map((r) => (
        <text key={r} x={xs(r)} y={H - P.b + 18} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.65">{r}</text>
      ))}
      <line x1={P.l} y1={ys(8)} x2={W - P.r} y2={ys(8)} stroke={ACCENT} strokeWidth="1" strokeDasharray="4 3" opacity="0.55" />
      <text x={W - P.r - 4} y={ys(8) - 6} textAnchor="end" fontSize="10.5" fill={ACCENT}>PHIVOLCS expects MMI VIII near the fault</text>
      <path d={path} fill="none" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
      {ATTENUATION.filter(([r]) => [2, 10, 25, 50].includes(r)).map(([r, m]) => (
        <g key={r}>
          <circle cx={xs(r)} cy={ys(m)} r="3.4" fill={ACCENT} />
          <text x={xs(r) + 7} y={ys(m) - 7} fontSize="10.5" fill="currentColor" opacity="0.8">{m.toFixed(2)}</text>
        </g>
      ))}
      <text x={P.l + iw / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fill="currentColor" opacity="0.75">
        distance to fault rupture, km (log scale)
      </text>
      <text x={14} y={P.t + ih / 2} fontSize="11.5" fill="currentColor" opacity="0.75"
        transform={`rotate(-90 14 ${P.t + ih / 2})`} textAnchor="middle">intensity (MMI)</text>
    </svg>
  );
}

/* ---------- chart 2: fragility ---------- */
function FragilityChart() {
  const W = 620, H = 260, P = { t: 18, r: 18, b: 44, l: 52 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const xs = (m: number) => P.l + ((m - 5) / 6) * iw;
  const ys = (d: number) => P.t + ih - (d / 0.36) * ih;
  const path = FRAGILITY.map(([m, d], i) => `${i ? 'L' : 'M'}${xs(m).toFixed(1)},${ys(d).toFixed(1)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="Damage ratio rises steeply between intensity 7 and 9">
      {[0, 0.1, 0.2, 0.3].map((d) => (
        <g key={d}>
          <line x1={P.l} y1={ys(d)} x2={W - P.r} y2={ys(d)} stroke={GRID} strokeWidth="1" />
          <text x={P.l - 8} y={ys(d) + 4} textAnchor="end" fontSize="11" fill="currentColor" opacity="0.65">{(d * 100).toFixed(0)}%</text>
        </g>
      ))}
      {[5, 6, 7, 8, 9, 10, 11].map((m) => (
        <text key={m} x={xs(m)} y={H - P.b + 18} textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.65">{m}</text>
      ))}
      <rect x={xs(7)} y={P.t} width={xs(9) - xs(7)} height={ih} fill={ACCENT} opacity="0.07" />
      <text x={(xs(7) + xs(9)) / 2} y={P.t + 14} textAnchor="middle" fontSize="10.5" fill={ACCENT}>
        8× damage across two intensity units
      </text>
      <path d={path} fill="none" stroke={ACCENT} strokeWidth="2.4" strokeLinecap="round" />
      {([[7, 0.0241], [8, 0.0813], [9, 0.1952]] as [number, number][]).map(([m, d]) => (
        <g key={m}>
          <circle cx={xs(m)} cy={ys(d)} r="3.6" fill={ACCENT} />
          <text x={xs(m) + 8} y={ys(d) + 4} fontSize="11" fill="currentColor" opacity="0.85">{(d * 100).toFixed(2)}%</text>
        </g>
      ))}
      <text x={P.l + iw / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fill="currentColor" opacity="0.75">
        intensity (MMI)
      </text>
      <text x={14} y={P.t + ih / 2} fontSize="11.5" fill="currentColor" opacity="0.75"
        transform={`rotate(-90 14 ${P.t + ih / 2})`} textAnchor="middle">share of capital stock lost</text>
    </svg>
  );
}


/* ---------- chart: ABC accept / reject ---------- */
function AbcChart() {
  const W = 620, H = 270, P = { t: 30, r: 18, b: 50, l: 46 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const lo = 6.875, hi = 9.75;
  const xs = (b: number) => P.l + ((b - lo) / (hi - lo)) * iw;
  const bw = iw / ABC_BINS.length;
  const maxT = 19417;
  const ys = (n: number) => P.t + ih - (n / maxT) * ih;
  const xv = (usd: number) => xs(Math.log10(usd));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="Of 200,000 prior draws, the 76,593 predicting losses inside the acceptance window became the posterior">
      <rect x={xv(ABC_WIN[0])} y={P.t} width={xv(ABC_WIN[1]) - xv(ABC_WIN[0])} height={ih}
        fill={ACCENT} opacity="0.07" />
      {ABC_BINS.map((d) => (
        <g key={d.b}>
          <rect x={xs(d.b) + 0.6} y={ys(d.t)} width={bw - 1.2} height={P.t + ih - ys(d.t)} fill={MUTED} />
          {d.a > 0 && (
            <rect x={xs(d.b) + 0.6} y={ys(d.a)} width={bw - 1.2} height={P.t + ih - ys(d.a)}
              fill={ACCENT} opacity="0.85" />
          )}
        </g>
      ))}
      <line x1={xv(ABC_OBS)} y1={P.t - 6} x2={xv(ABC_OBS)} y2={P.t + ih} stroke="currentColor" strokeWidth="1.6" />
      <text x={xv(ABC_OBS)} y={P.t - 11} textAnchor="middle" fontSize="10.5" fill="currentColor">
        observed $370M
      </text>
      {[[1e7, '$10M'], [1e8, '$100M'], [1e9, '$1B']].map(([v, l]) => (
        <text key={l as string} x={xv(v as number)} y={H - P.b + 18} textAnchor="middle" fontSize="10.5"
          fill="currentColor" opacity="0.65">{l as string}</text>
      ))}
      <text x={(xv(ABC_WIN[0]) + xv(ABC_WIN[1])) / 2} y={P.t + ih + 16} textAnchor="middle"
        fontSize="10.5" fill={ACCENT}>acceptance window [0.7&times;, 3.0&times;]</text>
      <g transform={`translate(${P.l + 4},${P.t + 12})`}>
        <rect width="11" height="11" y="-9" fill={MUTED} />
        <text x="16" y="0" fontSize="11" fill="currentColor" opacity="0.75">200,000 prior draws</text>
        <rect width="11" height="11" x="150" y="-9" fill={ACCENT} opacity="0.85" />
        <text x="166" y="0" fontSize="11" fill="currentColor" opacity="0.75">76,593 kept → posterior</text>
      </g>
      <text x={P.l + iw / 2} y={H - 8} textAnchor="middle" fontSize="11.5" fill="currentColor" opacity="0.75">
        loss each parameter set predicts for the 1990 Luzon earthquake (log scale)
      </text>
    </svg>
  );
}

/* ---------- chart 3: prior vs posterior ---------- */
function PosteriorChart() {
  const W = 620, H = 240, P = { t: 26, r: 18, b: 44, l: 40 };
  const iw = W - P.l - P.r, ih = H - P.t - P.b;
  const bw = iw / M0_HIST.length;
  const maxD = 1.15;
  const ys = (d: number) => P.t + ih - (d / maxD) * ih;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="The observed earthquake removed the upper tail of the fragility midpoint">
      <line x1={P.l} y1={P.t + ih} x2={W - P.r} y2={P.t + ih} stroke={GRID} />
      {M0_HIST.map((d, i) => (
        <g key={d.bin}>
          <rect x={P.l + i * bw + 1} y={ys(d.prior)} width={bw - 2} height={P.t + ih - ys(d.prior)}
            fill={MUTED} />
          <rect x={P.l + i * bw + bw * 0.22} y={ys(d.post)} width={bw * 0.56} height={P.t + ih - ys(d.post)}
            fill={ACCENT} opacity="0.85" />
          {[7.6, 8.4, 9.0, 9.6, 10.2].includes(d.bin) && (
            <text x={P.l + i * bw + bw / 2} y={H - P.b + 18} textAnchor="middle" fontSize="10.5"
              fill="currentColor" opacity="0.65">{d.bin.toFixed(1)}</text>
          )}
        </g>
      ))}
      <g transform={`translate(${P.l + 6},${P.t - 10})`}>
        <rect width="11" height="11" y="-9" fill={MUTED} />
        <text x="16" y="0" fontSize="11" fill="currentColor" opacity="0.75">prior belief</text>
        <rect width="11" height="11" x="92" y="-9" fill={ACCENT} opacity="0.85" />
        <text x="108" y="0" fontSize="11" fill="currentColor" opacity="0.75">after the 1990 earthquake</text>
      </g>
      <text x={P.l + iw * 0.78} y={P.t + 40} fontSize="10.5" fill={ACCENT} textAnchor="middle">
        this tail is gone
      </text>
      <path d={`M${P.l + iw * 0.78},${P.t + 46} L${P.l + iw * 0.84},${P.t + ih - 26}`}
        stroke={ACCENT} strokeWidth="1" opacity="0.6" />
      <text x={P.l + iw / 2} y={H - 6} textAnchor="middle" fontSize="11.5" fill="currentColor" opacity="0.75">
        fragility midpoint M0 — the intensity at which half of maximum damage occurs
      </text>
    </svg>
  );
}

/* ---------- chart 4: the interval, against real events ---------- */
function IntervalChart() {
  const W = 620, H = 200, P = { t: 30, r: 24, b: 46, l: 24 };
  const iw = W - P.l - P.r;
  // log scale, US$10M .. US$200B
  const lo = Math.log10(1e7), hi = Math.log10(2e11);
  const xs = (v: number) => P.l + ((Math.log10(v) - lo) / (hi - lo)) * iw;
  const bar = P.t + 34;

  const events: [string, number][] = [
    ['Bohol 2013 · M7.2', 5.206e7],
    ['Haiti 2010 · M7.0', 7.8e9],
    ['Kobe 1995 · M6.9', 1.3e11],
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="Our interval against three real earthquakes of similar magnitude">
      {[1e7, 1e8, 1e9, 1e10, 1e11].map((v) => (
        <g key={v}>
          <line x1={xs(v)} y1={P.t} x2={xs(v)} y2={H - P.b + 4} stroke={GRID} />
          <text x={xs(v)} y={H - P.b + 20} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.65">
            {v >= 1e9 ? `$${v / 1e9}B` : `$${v / 1e6}M`}
          </text>
        </g>
      ))}
      <rect x={xs(14e9)} y={bar - 11} width={xs(106.4e9) - xs(14e9)} height="22" fill={ACCENT} opacity="0.2" rx="3" />
      <line x1={xs(45.4e9)} y1={bar - 15} x2={xs(45.4e9)} y2={bar + 15} stroke={ACCENT} strokeWidth="2.6" />
      <text x={xs(45.4e9)} y={bar - 21} textAnchor="middle" fontSize="12" fill={ACCENT} fontWeight="600">$45.4B</text>
      <text x={xs(14e9)} y={bar + 27} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">P10 $14B</text>
      <text x={xs(106.4e9)} y={bar + 27} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.7">P90 $106B</text>
      <text x={P.l} y={P.t - 12} fontSize="11" fill="currentColor" opacity="0.75">
        this model, M7.2 West Valley Fault
      </text>
      {events.map(([label, v], i) => {
        const y = bar + 54 + i * 21;
        return (
          <g key={label}>
            <circle cx={xs(v)} cy={y} r="3.4" fill="currentColor" opacity="0.75" />
            <text x={xs(v) + 8} y={y + 4} fontSize="10.5" fill="currentColor" opacity="0.8">{label}</text>
          </g>
        );
      })}
    </svg>
  );
}


/* ---------- chart: exposure-blind baseline vs the hybrid ---------- */
function BaselineChart() {
  const W = 620, H = 210, P = { t: 34, r: 24, b: 46, l: 24 };
  const iw = W - P.l - P.r;
  const lo = Math.log10(1e7), hi = Math.log10(2e11);
  const xs = (v: number) => P.l + ((Math.log10(v) - lo) / (hi - lo)) * iw;

  const rows: { label: string; p10: number; p50: number; p90: number; accent: boolean }[] = [
    { label: 'exposure-blind gradient boosting', p10: 28e6, p50: 401e6, p90: 8429e6, accent: false },
    { label: 'this hybrid model', p10: 14e9, p50: 45.4e9, p90: 106.4e9, accent: true },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto' }} role="img"
      aria-label="The exposure-blind baseline predicts a loss roughly one hundred times smaller">
      {[1e7, 1e8, 1e9, 1e10, 1e11].map((v) => (
        <g key={v}>
          <line x1={xs(v)} y1={P.t - 8} x2={xs(v)} y2={H - P.b + 4} stroke={GRID} />
          <text x={xs(v)} y={H - P.b + 20} textAnchor="middle" fontSize="10.5" fill="currentColor" opacity="0.65">
            {v >= 1e9 ? `$${v / 1e9}B` : `$${v / 1e6}M`}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = P.t + 22 + i * 56;
        const col = r.accent ? ACCENT : 'currentColor';
        return (
          <g key={r.label}>
            <text x={P.l} y={y - 14} fontSize="11" fill="currentColor" opacity={r.accent ? 0.9 : 0.7}>
              {r.label}
            </text>
            <rect x={xs(r.p10)} y={y - 9} width={xs(r.p90) - xs(r.p10)} height="18"
              fill={col} opacity={r.accent ? 0.2 : 0.12} rx="3" />
            <line x1={xs(r.p50)} y1={y - 13} x2={xs(r.p50)} y2={y + 13} stroke={col}
              strokeWidth="2.6" opacity={r.accent ? 1 : 0.65} />
            <text x={xs(r.p50)} y={y + 27} textAnchor="middle" fontSize="11"
              fill={col} fontWeight={r.accent ? 600 : 400} opacity={r.accent ? 1 : 0.8}>
              {r.p50 >= 1e9 ? `$${(r.p50 / 1e9).toFixed(1)}B` : `$${(r.p50 / 1e6).toFixed(0)}M`}
            </text>
          </g>
        );
      })}
      <line x1={xs(401e6)} y1={P.t + 30} x2={xs(45.4e9)} y2={P.t + 30}
        stroke={ACCENT} strokeWidth="1" strokeDasharray="3 3" opacity="0.75" />
      <text x={(xs(401e6) + xs(45.4e9)) / 2} y={P.t + 24} textAnchor="middle"
        fontSize="11" fill={ACCENT} fontWeight="600">113× apart</text>
    </svg>
  );
}

/* ---------- page ---------- */

const box: CSSProperties = {
  border: '1px solid rgba(128,128,128,0.28)',
  borderRadius: 8,
  padding: '1rem 1.1rem',
  margin: '1.4rem 0',
};

const pre: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.84rem', lineHeight: 1.7, overflowX: 'auto',
  border: '1px solid rgba(128,128,128,0.28)', borderRadius: 8,
  padding: '0.85rem 1rem', margin: '1.2rem 0',
};
const tbl: CSSProperties = {
  borderCollapse: 'collapse',
  width: '100%',
  fontSize: '0.9rem',
  margin: '1.1rem 0',
};

const th: CSSProperties = {
  textAlign: 'left',
  padding: '0.4rem 0.5rem',
  borderBottom: '2px solid currentColor',
  fontWeight: 600,
};

const td: CSSProperties = {
  padding: '0.4rem 0.5rem',
  borderBottom: '1px solid rgba(128,128,128,0.25)',
  verticalAlign: 'top',
};

export default function ArithmeticPage() {
  return (
    <main className="page-main">
      <article className="prose">
        <Link href="/" className="back-link">← back to the map</Link>

        <h1>The arithmetic, shown</h1>
        <p>
          A magnitude 7.2 West Valley Fault rupture gives a median direct loss of{' '}
          <strong>US$45.4 billion</strong>, with a 10th&ndash;90th percentile
          range of <strong>US$14.0B to US$106.4B</strong>. This page is every step
          that produces those numbers, with the values a reader can check.
        </p>
        <p style={{ fontSize: '0.92rem', opacity: 0.8 }}>
          Nothing here is fitted to the World Bank benchmark. Everything is
          re-runnable at seed 42 from the repository.
        </p>
        <p style={{ fontSize: '0.92rem', opacity: 0.8 }}>
          Every equation on this page has a{' '}
          <strong>&ldquo;What is this saying?&rdquo;</strong> link beneath it. The
          maths is the evidence, so it stays visible; open the link and you get
          the same thing in ordinary sentences. You should not need to read
          notation to check whether the reasoning holds.
        </p>

        <div style={box}>
          <strong>The chain</strong>
          <div style={{ marginTop: '0.7rem' }}>
            <TeX
              tex={String.raw`R_{rup} \;\xrightarrow{\;\text{AWW12}\;} \; \mathrm{MMI} \;\xrightarrow{\;\text{fragility}\;} \; d \;\xrightarrow{\;\times\,K\cdot Y\;} \; \text{loss}`}
          plain="Read it left to right as a pipeline. Start with how far a place is from the fault, convert that into how hard the ground shakes there, convert the shaking into what fraction of the built environment breaks, then multiply by how much that built environment is worth. Each arrow is one of the four steps below."
              note="distance to fault → shaking → damage fraction → peso loss"
            />
          </div>
          <p style={{ fontSize: '0.88rem', opacity: 0.8, margin: '0.6rem 0 0' }}>
            The first two arrows are fixed physics. The last two carry parameters
            learned from an observed Philippine earthquake.
          </p>
        </div>

        <h2>1 — How hard the ground shakes</h2>
        <p>
          The Allen, Wald &amp; Worden (2012) intensity prediction equation for
          active crustal regions. Coefficients published, and cross-checked
          against the GEM OpenQuake implementation:
        </p>
        <TeX
          tex={String.raw`\mathrm{MMI} \;=\; c_0 + c_1 M + c_2 \ln\!\left( \sqrt{ R_{rup}^{2} + \bigl(1 + c_3 e^{\,M-5}\bigr)^{2} } \right)`}
          plain="Shaking gets stronger with magnitude and weaker with distance. The first two terms add intensity for a bigger earthquake; the logarithm term subtracts it as you move away. The bracketed distance is not a straight line but a curve, because a rupture is a surface rather than a point, and the e^(M−5) part widens that surface as the earthquake gets larger."
        />
        <TeX
          tex={String.raw`c_0 = 3.950 \qquad c_1 = 0.913 \qquad c_2 = -1.107 \qquad c_3 = 0.813`}
          plain="These four numbers are not ours. They were fitted by Allen, Wald and Worden across a global set of earthquakes and published in 2012, and we cross-checked our implementation against GEM's OpenQuake. Nothing here was adjusted to make Metro Manila look worse or better."
          note="M is moment magnitude; Rrup is distance to the rupture, in kilometres"
        />
        <AttenuationChart />
        <p>
          An LGU on the trace gets <strong>MMI 8.17</strong>. One 50 km away gets{' '}
          <strong>MMI 6.18</strong>. That two-unit gap is where most of the
          variation between LGUs comes from.
        </p>
        <p>
          <strong>An independent check.</strong> PHIVOLCS expects PEIS/MMI VIII
          across the near-fault Metro Manila corridor. The equation produces
          8.0&ndash;8.2 inside 5 km on its own. Nothing was adjusted to land there.
        </p>

        <h2>2 — How much breaks at that intensity</h2>
        <p>
          A logistic fragility curve. Its slope is fixed at 1.4; the other two
          parameters are learned.
        </p>
        <TeX
          tex={String.raw`d(\mathrm{MMI}) \;=\; \frac{\mathrm{MDR_{max}}}{1 + e^{-s\,(\mathrm{MMI} - M_0)}}`}
          plain="An S-curve. Below about intensity 7 almost nothing breaks, above about intensity 10 you approach the worst case, and in between damage climbs steeply. MDR_max sets the ceiling — the most that is ever lost. M₀ sets where the curve is centred, meaning the intensity at which you reach half of that ceiling. The s controls how sharp the turn is."
        />
        <TeX
          tex={String.raw`s = 1.4 \;(\text{fixed}) \qquad \mathrm{MDR_{max}} = 0.361 \qquad M_0 = 8.881`}
          plain="The steepness is held fixed because the data cannot pin down all three at once. The ceiling and the centre point are what the calibration learns, and those are the two that matter most for the final number."
          note="MDR_max and M₀ are learned from data — see step 5"
        />
        <FragilityChart />
        <p>
          Damage rises roughly <strong>eightfold between MMI 7 and MMI 9</strong>
          &nbsp;— from 2.41% of capital stock to 19.52%. The steepness is why the
          distance term above matters so much: a small difference in shaking
          becomes a large difference in loss.
        </p>

        <h2>3 — Turning a fraction into pesos</h2>
        <TeX
          tex={String.raw`\text{loss}_i \;=\; \underbrace{K \cdot Y_i}_{\text{capital stock}} \;\times\; d(\mathrm{MMI}_i)`}
          plain="The fragility curve gives a fraction, not pesos. To get pesos you need to know how much there is to lose. We do not have a building-by-building inventory, so we approximate the value of everything standing in an LGU as a multiple K of what that LGU produces in a year. A place producing more each year has, on average, more built up behind it."
          note="Yᵢ is LGU i's annual economic output; K = 2.829, the capital-output ratio, also learned"
        />
        <p>
          <strong>One LGU, worked end to end.</strong> An LGU 2 km from the trace
          with PHP 500 billion annual output:
        </p>
        <TeX
          tex={String.raw`\begin{aligned}
\mathrm{MMI}(M{=}7.2,\; R_{rup}{=}2\,\mathrm{km}) \;&=\; 8.14 \\[3pt]
K \cdot Y \;=\; 2.829 \times \text{PHP }500\text{B} \;&=\; \text{PHP }1.41\text{T} \\[3pt]
d(8.14) \;=\; \frac{0.361}{1 + e^{-1.4\,(8.14 - 8.881)}} \;&=\; 0.0948 \\[3pt]
\text{loss} \;=\; \text{PHP }1.41\text{T} \times 0.0948 \;&=\; \text{PHP }134.1\text{B} \;=\; \$2.29\text{B}
\end{aligned}`}
          plain="One LGU, all four steps, actual numbers. Two kilometres from the fault gives intensity 8.14. Its yearly output of PHP 500 billion implies about PHP 1.41 trillion of buildings and infrastructure. At that intensity roughly 9.5 percent of it is lost. Multiply and you get PHP 134 billion, about 2.3 billion dollars — for one LGU."
        />
        <p>
          Across all 35 LGUs the exposure base is{' '}
          <strong>PHP 12.4 trillion in annual output</strong>. Eight of the 35 use
          published PSA city GDP; the other 27 use population &times; regional
          per-capita output. That mix is a weakness, and it is flagged per-LGU in
          the output rather than smoothed over.
        </p>

        <h2>4 — Why a single number would be dishonest</h2>
        <p>
          Two kinds of uncertainty, kept apart by a nested Monte Carlo.{' '}
          <em>Aleatoric</em> is the earthquake&rsquo;s own randomness &mdash; the
          equation&rsquo;s &sigma; of about 0.95 intensity units, which no amount of
          research removes. <em>Epistemic</em> is our ignorance about the
          parameters, which better data does reduce.
        </p>
        <TeX
          tex={String.raw`L^{(j,k)} \;=\; \sum_{i=1}^{35} K^{(j)} \cdot Y_i \cdot d\!\left(\mathrm{MMI}_i + \varepsilon_i^{(k)} \;;\; \mathrm{MDR_{max}}^{(j)},\, M_0^{(j)}\right)`}
          plain="Two nested loops, run many times. The outer loop picks one plausible set of fragility parameters — that is the j, and it represents what we do not know. The inner loop adds random shaking noise to each LGU — that is the k, and it represents what nobody can know. Add up all 35 LGUs for each combination, and the spread of the results tells you both how uncertain the world is and how uncertain we are, separately."
          note="outer draw j = parameters (epistemic) · inner draw k = ground-motion noise (aleatoric) · εᵢ ~ N(0, σ²) with σ from the IPE"
        />
        <p>
          The outer loop draws a parameter set from the posterior; the inner loop
          draws ground-motion noise. Nesting them this way is what lets the two
          sources be reported separately instead of collapsed into one number.
        </p>
        <p>
          At M7.2 the split is <strong>65% aleatoric, 35% epistemic</strong>.
          Two-thirds of the spread is the world being unpredictable; one-third is
          us not knowing enough yet.
        </p>
        <IntervalChart />
        <p>
          The three dots are real earthquakes within 0.3 magnitude units of each
          other. Their losses span <strong>five orders of magnitude</strong>,
          because exposure and vulnerability dominate outcomes, not magnitude.
          That spread is the case for reporting an interval rather than a point.
        </p>

        <h2>5 — The part that is machine learning</h2>
        <p>
          The fragility parameters were expert guesses in an earlier version, and
          a sensitivity analysis showed the fragility midpoint was the single
          dominant assumption &mdash; swinging the median by &minus;33%/+43%. So
          they were replaced with values <strong>learned from a real Philippine
          earthquake</strong>.
        </p>
        <p>
          The method is <strong>approximate Bayesian computation</strong> by
          rejection. It is used because the forward model is a simulation with no
          closed-form likelihood, so ordinary Bayesian updating is unavailable.
          ABC needs only the ability to simulate.
        </p>
        <ol style={{ lineHeight: 1.7, paddingLeft: '1.3rem' }}>
          <li>Draw 200,000 parameter sets from the priors.</li>
          <li>
            Run each through the forward model against the{' '}
            <strong>1990 Luzon earthquake</strong> &mdash; Mw 7.7, reported
            US$369.6M damage, PHP 24.3/USD.
          </li>
          <li>
            Keep a draw if its predicted loss lands within{' '}
            <strong>[0.7&times;, 3.0&times;]</strong> of the reported figure.
          </li>
          <li>The kept draws are the posterior.</li>
        </ol>
        <p>
          <strong>76,593 of 200,000 draws survived &mdash; 38.3%.</strong>
        </p>
        <AbcChart />
        <p>
          This is the inference itself. Grey is what the priors predicted before
          seeing any data &mdash; a spread from about US$10M to nearly US$3B, which
          is how little the literature alone pins down. The vertical line is what
          actually happened. Coloured bars are the draws that landed close enough
          to be kept.
        </p>
        <p>
          The acceptance window is wide and asymmetric on purpose. Official damage
          totals undercount housing, so the observation is treated as{' '}
          <strong>interval-censored</strong> rather than exact &mdash; a stated
          assumption, not a hidden one.
        </p>

        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem', margin: '1.2rem 0' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.4rem 0.5rem', borderBottom: '2px solid currentColor' }}>Parameter</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', borderBottom: '2px solid currentColor' }}>Prior</th>
              <th style={{ textAlign: 'right', padding: '0.4rem 0.5rem', borderBottom: '2px solid currentColor' }}>Learned</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['K — capital-output ratio', '2.800 ± 0.400', '2.829 ± 0.397'],
              ['MDR_MAX — max damage ratio', '0.350 ± 0.080', '0.361 ± 0.077'],
              ['M0 — fragility midpoint', '9.000 ± 0.400', '8.881 ± 0.366'],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(128,128,128,0.25)' }}>{a}</td>
                <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(128,128,128,0.25)', textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{b}</td>
                <td style={{ padding: '0.4rem 0.5rem', borderBottom: '1px solid rgba(128,128,128,0.25)', textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>{c}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p>
          <strong>The means barely moved &mdash; and the means are the wrong thing
          to look at.</strong>
        </p>
        <PosteriorChart />
        <p>
          The distribution tells the real story. The observed earthquake{' '}
          <strong>removed the upper tail</strong>: values of M0 above about 9.4,
          which the prior considered plausible, are almost entirely rejected. A
          real event is inconsistent with buildings that tough. The shift is
          downward, meaning damage begins at slightly{' '}
          <em>lower</em> intensity than the literature prior assumed.
        </p>
        <p>
          A 38.3% acceptance rate is healthy for rejection ABC. A very low rate
          would signal that prior and data disagree; a very high one would signal
          an uninformative window.
        </p>

        <h2>5b &mdash; Why the physics is needed at all</h2>
        <p>
          A fair question: if 514 historical earthquakes are available, why not
          just train a model on them and skip the physics? That was tested.
        </p>
        <p>
          A gradient-boosted quantile model was trained on the full catalogue
          &mdash; 375 events before 2010 for training, 139 after for testing
          &mdash; using the features such a model can actually observe:{' '}
          <strong>magnitude, depth, maximum reported intensity, and year</strong>.
          No exposure, because global catalogues do not carry it.
        </p>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={th}>Model</th>
              <th style={{ ...th, textAlign: 'right' }}>MAE (log₁₀ loss)</th>
              <th style={{ ...th, textAlign: 'right' }}>Typical error</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>Magnitude only, ordinary least squares</td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>0.882</td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>≈ 7.6&times;</td>
            </tr>
            <tr>
              <td style={td}>Gradient boosting, four features</td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>0.845</td>
              <td style={{ ...td, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>≈ 7.0&times;</td>
            </tr>
          </tbody>
        </table>
        <p>
          <strong>Gradient boosting barely beats using magnitude alone</strong>
          &nbsp;&mdash; 0.845 against 0.882. Both are wrong by about a factor of
          seven on a typical event. Its stated 80% interval covers{' '}
          <strong>77.7%</strong> of held-out events, so it is also slightly
          overconfident.
        </p>
        <p>
          Applied to the Metro Manila scenario, the gap becomes the whole argument:
        </p>
        <BaselineChart />
        <p>
          The exposure-blind model predicts <strong>US$401 million</strong> where
          the hybrid predicts <strong>US$45.4 billion</strong> &mdash;{' '}
          <strong>113 times smaller, 2.05 orders of magnitude.</strong> Even its
          90th percentile, US$8.4B, sits well below the hybrid&rsquo;s 10th.
        </p>
        <p>
          The reason is visible in the training data: the median event in the
          catalogue caused about <strong>US$137 million</strong> in damage. A
          model that has learned the historical distribution of earthquakes
          learns that most earthquakes are not very expensive &mdash; which is
          true, and useless here. Metro Manila is not a typical earthquake
          location. What makes it costly is thirteen million people and PHP 12.4
          trillion of annual output sitting on a fault, and{' '}
          <strong>magnitude, depth, intensity and year cannot express that.</strong>
        </p>
        <p>
          This is the case for physics-informed structure rather than pure
          learning. The mechanistic chain carries exposure explicitly; the
          learned parameters fill in what the mechanism cannot pin down. Neither
          half works alone.
        </p>

        <h2>6 — The out-of-sample test</h2>
        <p>
          The <strong>2013 Bohol earthquake was held out entirely</strong> and
          never used in calibration. Same magnitude as the scenario (M7.2),
          different island, different fault. So the model is asked to generalise
          across both magnitude and geography, then tested at the target
          magnitude on data it never saw.
        </p>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={th} colSpan={3}>Hazard</th>
            </tr>
            <tr>
              <th style={th}>Location</th>
              <th style={th}>Predicted</th>
              <th style={th}>Observed (PHIVOLCS)</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['near epicentre, ~5 km', 'MMI 8.0', 'PEIS VIII'],
              ['Tagbilaran, ~25 km', 'MMI 6.9', 'PEIS VII'],
              ['Tagbilaran, ~34 km', 'MMI 6.6', 'PEIS VII'],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td style={td}>{a}</td>
                <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{b}</td>
                <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>{c}</td>
              </tr>
            ))}
            <tr>
              <td style={{ ...td, fontWeight: 600 }} colSpan={3}>
                Every band within one intensity unit &mdash; inside the equation&rsquo;s
                published &sigma;. <span style={{ color: ACCENT }}>PASS</span>
              </td>
            </tr>
          </tbody>
        </table>

        <table style={tbl}>
          <thead>
            <tr><th style={th} colSpan={2}>Loss</th></tr>
          </thead>
          <tbody>
            <tr>
              <td style={td}>predicted</td>
              <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>
                P10 US$45M &nbsp;·&nbsp; P50 US$188M &nbsp;·&nbsp; P90 US$603M
              </td>
            </tr>
            <tr>
              <td style={td}>observed</td>
              <td style={{ ...td, fontFamily: 'ui-monospace, monospace' }}>
                US$52M &nbsp;<span style={{ opacity: 0.7 }}>(NDRRMC SitRep 35 &mdash; infrastructure only)</span>
              </td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600 }} colSpan={2}>
                <span style={{ color: ACCENT }}>PASS</span>
              </td>
            </tr>
          </tbody>
        </table>
        <p>
          The observed figure sits just above P10, which is where it belongs. The
          NDRRMC total covers <strong>public infrastructure only</strong> &mdash;
          the 73,002 damaged houses were counted in units, never in pesos. So
          US$52M is a <em>floor</em>, not a total, and an interval whose lower
          tail contains that floor with room above it for the uncounted housing is
          the expected result.
        </p>

        <h2>7 — Against the benchmark</h2>
        <table style={tbl}>
          <tbody>
            <tr>
              <td style={td}>World Bank / MMEIRS lineage</td>
              <td style={{ ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace' }}>US$48B</td>
              <td style={{ ...td, opacity: 0.7 }}>~12% of GDP</td>
            </tr>
            <tr>
              <td style={{ ...td, fontWeight: 600 }}>this model, M7.2 median</td>
              <td style={{ ...td, textAlign: 'right', fontFamily: 'ui-monospace, monospace', fontWeight: 600 }}>US$45.4B</td>
              <td style={{ ...td, color: ACCENT, fontWeight: 600 }}>ratio 0.95&times;</td>
            </tr>
          </tbody>
        </table>
        <p>
          Reached without tuning. The project&rsquo;s benchmark file states the rule
          explicitly: <em>do not tune models to match these; compare and
          explain.</em>
        </p>

        <h2>8 — What it would take for the number to be small</h2>
        <p>
          The adversarial test. Push every learned parameter to the value most
          favourable to a low estimate &mdash; 5th percentile capital ratio, 5th
          percentile maximum damage, 95th percentile midpoint so damage starts
          later:
        </p>
        <TeX
          tex={String.raw`K_{(5)} = 2.176 \qquad \mathrm{MDR_{max}}^{(5)} = 0.235 \qquad M_0^{(95)} = 9.481`}
          plain="The stress test. Instead of using our best estimates, take the values that make the disaster look as cheap as possible: a low capital ratio, a low damage ceiling, and a fragility curve shifted so damage begins later. All three stacked in the same favourable direction at once."
          note="5th and 95th percentiles of the posterior, chosen to minimise the estimate"
        />
        <TeX
          tex={String.raw`d(8) = 0.0262 \;\Longrightarrow\; L \;=\; 2.176 \times \text{PHP }12.4\text{T} \times 0.0262 \;=\; \text{PHP }0.71\text{T} \;=\; \$12.1\text{B}`}
          plain="Even with every assumption pushed toward a small answer, the loss is still about twelve billion dollars. That is the point of the exercise: the conclusion that this is a tens-of-billions event does not rest on our specific parameter estimates. You have to reject the whole approach, not just tune the numbers."
        />
        <p>
          <strong>A stacked set of favourable assumptions still gives losses in
          the tens of billions of dollars.</strong> The conclusion that a
          magnitude 7.2 West Valley Fault rupture is a tens-of-billions event does
          not depend on the central parameter estimates.
        </p>

        <h2>Human scale</h2>
        <p>
          US$45.4 billion, for a metro of roughly 13 million people, is about{' '}
          <strong>US$3,500 per resident</strong> &mdash; around PHP 2.66 trillion.
          For comparison, a 2013 PHIVOLCS&ndash;Australia study put{' '}
          <em>building damage alone</em> at PHP 2.4 trillion, so an all-sector
          figure sitting just above their buildings-only figure is the expected
          ordering.
        </p>
        <p>
          The interval matters more than the point. Sizing a contingent credit
          facility against <strong>US$14B</strong> is a different problem from
          sizing it against <strong>US$106B</strong>, and that is the decision the
          uncertainty actually bears on.
        </p>

        <h2>What is fixed, learned, assumed, and left out</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: '0.9rem', margin: '1.2rem 0' }}>
          <tbody>
            {[
              ['Fixed physics', 'AWW12 coefficients (published, cross-checked against OpenQuake); logistic functional form; fragility slope 1.4'],
              ['Learned from data', 'K, MDR_MAX, M0 — by ABC on the 1990 Luzon earthquake'],
              ['Assumed, documented', 'the [0.7×, 3.0×] censoring window; LGU-centroid distance as a proxy for rupture distance; capital-output ratio as a proxy for building stock'],
              ['Deliberately excluded', 'liquefaction, site amplification, fire-following, business interruption, casualties'],
            ].map(([a, b]) => (
              <tr key={a}>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(128,128,128,0.25)', fontWeight: 600, whiteSpace: 'nowrap', verticalAlign: 'top' }}>{a}</td>
                <td style={{ padding: '0.5rem', borderBottom: '1px solid rgba(128,128,128,0.25)' }}>{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          The exclusions are not oversights. Each is recorded as a limitation, and
          each would push the estimate <strong>up</strong>, not down.
        </p>

        <h2>Reproducing this</h2>
        <pre style={pre}>{`cd model
python -m src.calibrate       # ABC → fragility_posterior.csv
python -m src.scenarios       # → m60..m72, m75
python -m src.backtest_bohol  # out-of-sample validation
python -m src.validate        # benchmark comparison`}</pre>
        <p>
          Seed 42 throughout. A freshly rebuilt posterior reproduces the figures
          on this page exactly. See the{' '}
          <Link href="/methodology">methodology</Link> for the modelling
          assumptions and limitations in full, and{' '}
          <Link href="/policy">policy readiness</Link> for the second layer of
          the project.
        </p>
      </article>
    </main>
  );
}
