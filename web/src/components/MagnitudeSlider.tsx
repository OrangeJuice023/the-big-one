'use client';

import { MAGNITUDES, PHIVOLCS_MAX_CREDIBLE, STRESS_TEST_MAGNITUDE } from '@/lib/scenarios';

type Props = { magnitude: number; onChange: (m: number) => void };

export default function MagnitudeSlider({ magnitude, onChange }: Props) {
  const idx = MAGNITUDES.indexOf(magnitude);
  return (
    <div className="slider-box">
      <label htmlFor="mag">
        Scenario magnitude: <strong>M{magnitude.toFixed(1)}</strong>
        {magnitude === PHIVOLCS_MAX_CREDIBLE && (
          <span className="mag-badge anchor">PHIVOLCS max credible — “The Big One”</span>
        )}
        {magnitude === STRESS_TEST_MAGNITUDE && (
          <span className="mag-badge stress">stress test — paleoseismic upper bound</span>
        )}
      </label>
      <input
        id="mag"
        type="range"
        min={0}
        max={MAGNITUDES.length - 1}
        step={1}
        value={idx}
        onChange={(e) => onChange(MAGNITUDES[Number(e.target.value)])}
      />
      <div className="slider-ticks">
        <span>M6.0</span>
        <span>M7.2 anchor</span>
        <span>M7.5 stress</span>
      </div>
    </div>
  );
}
