'use client';

import { useEffect, useRef, useState } from 'react';
import type { Scenario } from '@/lib/scenarios';
import { formatMoney } from '@/lib/scenarios';
import { COPY, type CopyMode } from '@/lib/copy';

// PSA 2024 nominal GDP, ~PHP 26.5T — update alongside exposure data and
// document the vintage in docs/methodology.md.
const PH_GDP_PHP = 26.5e12;
const MMEIRS_BENCH_USD = 48e9;

export default function SummaryStats({
  scenario,
  simToken = 0,
  mode = 'sci',
}: {
  scenario: Scenario;
  simToken?: number;
  mode?: CopyMode;
}) {
  const c = COPY[mode];
  const { q10, q50, q90 } = scenario.national_loss_php;
  // Count-up of the headline number during the rupture simulation.
  const [displayP50, setDisplayP50] = useState(q50);
  const rafRef = useRef(0);
  useEffect(() => setDisplayP50(q50), [q50]);
  useEffect(() => {
    if (!simToken) return;
    cancelAnimationFrame(rafRef.current);
    const DELAY = 900, DURATION = 3200;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.max(0, now - start - DELAY);
      const p = Math.min(1, t / DURATION);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayP50(q50 * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simToken]);
  const usd = scenario.national_loss_usd;
  const gdpShare = ((displayP50 / PH_GDP_PHP) * 100).toFixed(1);
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-label">{c.nationalLoss}</div>
        <div className="stat-value">{formatMoney(displayP50, 'PHP')}</div>
        <div className="stat-sub">
          {c.nationalSub(formatMoney(usd.q50, 'USD'), formatMoney(q10, 'PHP'), formatMoney(q90, 'PHP'))}
        </div>
      </div>
      {scenario.uq && (
        <div className="stat">
          <div className="stat-label">{c.uqLabel}</div>
          <div className="stat-value" style={{ fontSize: 20 }}>
            {c.uqValue(
              Math.round(scenario.uq.aleatoric_share * 100),
              Math.round(scenario.uq.epistemic_share * 100)
            )}
          </div>
          <div className="stat-sub">{c.uqSub}</div>
        </div>
      )}
      <div className="stat">
        <div className="stat-label">{c.gdpLabel}</div>
        <div className="stat-value">{gdpShare}%</div>
        <div className="stat-sub">vs PHP 26.5T (2024 nominal)</div>
      </div>
      <div className="stat">
        <div className="stat-label">Published M7.2 benchmarks</div>
        <div className="stat-value">{formatMoney(MMEIRS_BENCH_USD, 'USD')}</div>
        <div className="stat-sub">
          World Bank total-loss estimate; PHIVOLCS 2013 study: ₱2.4T building
          damage. Benchmarks, not our output.
        </div>
      </div>
    </div>
  );
}
