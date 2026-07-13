'use client';

import type { Scenario } from '@/lib/scenarios';
import { formatMoney } from '@/lib/scenarios';

type Props = { scenario: Scenario; selected: string | null };

export default function CityDetailPanel({ scenario, selected }: Props) {
  const rows = [...scenario.lgus].sort((a, b) => b.loss_usd.q50 - a.loss_usd.q50);
  return (
    <div className="city-panel">
      <div className="stat-label">Per-city estimates</div>
      <table>
        <thead>
          <tr>
            <th>LGU</th>
            <th className="num">MMI</th>
            <th className="num">Rrup km</th>
            <th className="num">Loss P50</th>
            <th className="num">P10–P90</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((l) => (
            <tr key={l.lgu} className={l.lgu === selected ? 'selected' : ''}>
              <td>{l.lgu}</td>
              <td className="num">{l.mmi.toFixed(1)}</td>
              <td className="num">{l.rrup_km.toFixed(1)}</td>
              <td className="num">{formatMoney(l.loss_php.q50, 'PHP')}</td>
              <td className="num range-cell">
                {formatMoney(l.loss_php.q10, 'PHP')}–{formatMoney(l.loss_php.q90, 'PHP')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
