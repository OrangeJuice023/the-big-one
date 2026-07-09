'use client';

import type { Scenario } from '@/lib/scenarios';
import { formatMoney } from '@/lib/scenarios';

// PSA 2024 nominal GDP, ~PHP 26.5T — update alongside exposure data and
// document the vintage in docs/methodology.md.
const PH_GDP_PHP = 26.5e12;
const MMEIRS_BENCH_USD = 48e9;

export default function SummaryStats({ scenario }: { scenario: Scenario }) {
  const { q10, q50, q90 } = scenario.national_loss_php;
  const usd = scenario.national_loss_usd;
  const gdpShare = ((q50 / PH_GDP_PHP) * 100).toFixed(1);
  return (
    <div className="stats">
      <div className="stat">
        <div className="stat-label">National loss (P50)</div>
        <div className="stat-value">{formatMoney(q50, 'PHP')}</div>
        <div className="stat-sub">
          {formatMoney(usd.q50, 'USD')} · range {formatMoney(q10, 'PHP')}–{formatMoney(q90, 'PHP')}
        </div>
      </div>
      <div className="stat">
        <div className="stat-label">Share of GDP</div>
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
