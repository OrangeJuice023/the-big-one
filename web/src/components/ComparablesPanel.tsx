'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/scenarios';

type Comparable = {
  name: string;
  year: number;
  magnitude: number;
  loss_usd: number;
  loss_note: string;
  deaths: number;
  context: string;
};

/**
 * Real earthquakes in the same magnitude band, with published losses.
 * The point of showing them: near-identical magnitudes produce losses five
 * orders of magnitude apart — exposure and vulnerability dominate. This is
 * the empirical justification for wide P10–P90 intervals.
 */
export default function ComparablesPanel() {
  const [events, setEvents] = useState<Comparable[]>([]);

  useEffect(() => {
    fetch('data/comparables.json')
      .then((r) => r.json())
      .then((d) => setEvents(d.events ?? []))
      .catch(() => {});
  }, []);

  if (!events.length) return null;
  return (
    <div className="comparables">
      <div className="stat-label">Real events, same magnitude class</div>
      {events.map((e) => (
        <div key={e.name} className="comparable-row" title={e.loss_note}>
          <div className="comparable-head">
            <span className="comparable-name">
              {e.name} ({e.year}) · M{e.magnitude.toFixed(1)}
            </span>
            <span className="comparable-loss">{formatMoney(e.loss_usd, 'USD')}</span>
          </div>
          <div className="comparable-context">{e.context}</div>
        </div>
      ))}
      <p className="footer-note" style={{ marginTop: 6 }}>
        Same magnitude class, losses five orders of magnitude apart — exposure
        and vulnerability dominate, not magnitude. This spread is why estimates
        here carry wide P10–P90 ranges. Hover a row for sources; full citations
        in the repo&apos;s benchmarks file.
      </p>
    </div>
  );
}
