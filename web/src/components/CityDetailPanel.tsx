'use client';

import type { Scenario } from '@/lib/scenarios';
import { formatMoney } from '@/lib/scenarios';
import { COPY, type CopyMode } from '@/lib/copy';

type Props = { scenario: Scenario; selected: string | null; mode?: CopyMode };

export default function CityDetailPanel({ scenario, selected, mode = 'sci' }: Props) {
  const c = COPY[mode];
  const rows = [...scenario.lgus].sort((a, b) => b.loss_usd.q50 - a.loss_usd.q50);
  return (
    <div className="city-panel">
      <div className="stat-label">{c.tableLabel}</div>
      <table>
        <thead>
          <tr>
            <th>LGU</th>
            <th className="num">{c.thMmi}</th>
            <th className="num">{c.thRrup}</th>
            <th className="num">{c.thP50}</th>
            <th className="num">{c.thRange}</th>
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
