'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import MagnitudeSlider from '@/components/MagnitudeSlider';
import SummaryStats from '@/components/SummaryStats';
import CityDetailPanel from '@/components/CityDetailPanel';
import ComparablesPanel from '@/components/ComparablesPanel';
import { loadScenario, type Scenario } from '@/lib/scenarios';
import { COPY, type CopyMode } from '@/lib/copy';

const LossMap = dynamic(() => import('@/components/LossMap'), { ssr: false });

export default function Home() {
  const [magnitude, setMagnitude] = useState(7.2);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simToken, setSimToken] = useState(0);
  const [mode, setMode] = useState<CopyMode>('sci');

  useEffect(() => {
    let alive = true;
    loadScenario(magnitude)
      .then((s) => alive && (setScenario(s), setError(null)))
      .catch(() => alive && setError('Could not load scenario data.'));
    return () => {
      alive = false;
    };
  }, [magnitude]);

  return (
    <div className="main">
      <div className="map-wrap">
        <LossMap scenario={scenario} onSelectLgu={setSelected} simToken={simToken} />
      </div>
      <aside className="sidebar">
        {scenario?.synthetic && (
          <div className="banner" role="status">
            Showing <strong>synthetic placeholder data</strong> for development.
            These are not loss estimates. Run the model pipeline to replace them.
          </div>
        )}
        {error && <div className="banner">{error}</div>}
        <div className="seg mode-toggle" role="group" aria-label="Explanation level">
          <button aria-pressed={mode === 'sci'} onClick={() => setMode('sci')}>
            Scientific
          </button>
          <button aria-pressed={mode === 'basic'} onClick={() => setMode('basic')}>
            Simple
          </button>
        </div>
        <MagnitudeSlider magnitude={magnitude} onChange={setMagnitude} />
        <button
          className="simulate-btn"
          disabled={!scenario}
          onClick={() => setSimToken((t) => t + 1)}
        >
          <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M2.5 1.5v9l8-4.5z" fill="currentColor" />
          </svg>
          Simulate rupture
        </button>
        {scenario && <SummaryStats scenario={scenario} simToken={simToken} mode={mode} />}
        {scenario && <CityDetailPanel scenario={scenario} selected={selected} mode={mode} />}
        <ComparablesPanel />
        <p className="footer-note">{COPY[mode].footer}</p>
      </aside>
    </div>
  );
}
