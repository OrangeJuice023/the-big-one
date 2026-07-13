'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import MagnitudeSlider from '@/components/MagnitudeSlider';
import SummaryStats from '@/components/SummaryStats';
import CityDetailPanel from '@/components/CityDetailPanel';
import ComparablesPanel from '@/components/ComparablesPanel';
import { loadScenario, type Scenario } from '@/lib/scenarios';

const LossMap = dynamic(() => import('@/components/LossMap'), { ssr: false });

export default function Home() {
  const [magnitude, setMagnitude] = useState(7.2);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simToken, setSimToken] = useState(0);

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
    <div className="layout">
      <header className="topbar">
        <h1>The Big One · West Valley Fault Scenario Loss Estimator</h1>
        <nav>
          <Link href="/methodology/">Methodology</Link>
        </nav>
      </header>
      <div className="main">
        <div className="map-wrap">
          <LossMap scenario={scenario} onSelectLgu={setSelected} simToken={simToken} />
        </div>
        <aside className="sidebar">
          {scenario?.synthetic && (
            <div className="banner">
              ⚠ Showing <strong>synthetic placeholder data</strong> for development.
              These are not loss estimates. Run the model pipeline to replace them.
            </div>
          )}
          {error && <div className="banner">{error}</div>}
          <MagnitudeSlider magnitude={magnitude} onChange={setMagnitude} />
          <button
            className="simulate-btn"
            disabled={!scenario}
            onClick={() => setSimToken((t) => t + 1)}
          >
            ▶ Simulate rupture
          </button>
          {scenario && <SummaryStats scenario={scenario} simToken={simToken} />}
          {scenario && <CityDetailPanel scenario={scenario} selected={selected} />}
          <ComparablesPanel />
          <p className="footer-note">
            Scenario-based estimates with P10–P90 uncertainty ranges, not predictions.
            Ground shaking via the Allen–Wald–Worden (2012) intensity prediction
            equation; losses from quantile models trained on historical global
            earthquake data (NOAA NCEI, EM-DAT). See the methodology page for data
            sources, assumptions, and limitations.
          </p>
        </aside>
      </div>
    </div>
  );
}
