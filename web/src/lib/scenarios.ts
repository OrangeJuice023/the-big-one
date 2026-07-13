export type Quantiles = { q10: number; q50: number; q90: number };

export type LguResult = {
  lgu: string;
  psgc_prefix: string;
  rrup_km: number;
  mmi: number;
  population: number;
  lat: number;
  lon: number;
  loss_usd: Quantiles;
  loss_php: Quantiles;
};

export type Scenario = {
  magnitude: number;
  fault: string;
  generated: string;
  weighting: 'grdp' | 'population_fallback';
  php_per_usd: number;
  synthetic: boolean;
  national_loss_usd: Quantiles;
  national_loss_php: Quantiles;
  lgus: LguResult[];
};

// M6.0-M7.2 anchored on the PHIVOLCS maximum-credible magnitude for the WVF,
// plus an M7.5 stress test (paleoseismic upper bound). Mmax is epistemically
// uncertain -- see OPEN_QUESTIONS.md #5.
export const MAGNITUDES = [
  ...Array.from({ length: 13 }, (_, i) => Math.round((6.0 + 0.1 * i) * 10) / 10),
  7.5,
];

export const STRESS_TEST_MAGNITUDE = 7.5;
export const PHIVOLCS_MAX_CREDIBLE = 7.2;

export function scenarioFile(m: number): string {
  return `data/scenarios/m${m.toFixed(1).replace('.', '')}.json`;
}

export async function loadScenario(m: number): Promise<Scenario> {
  const res = await fetch(scenarioFile(m));
  if (!res.ok) throw new Error(`failed to load scenario M${m}`);
  return res.json();
}

export function formatMoney(v: number, currency: 'USD' | 'PHP'): string {
  const sym = currency === 'USD' ? '$' : '₱';
  if (v >= 1e12) return `${sym}${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `${sym}${(v / 1e9).toFixed(1)}B`;
  if (v >= 1e6) return `${sym}${(v / 1e6).toFixed(0)}M`;
  return `${sym}${Math.round(v).toLocaleString()}`;
}

/** MMI color ramp roughly following USGS ShakeMap conventions. */
export function mmiColor(mmi: number): string {
  if (mmi >= 9) return '#b30000';
  if (mmi >= 8) return '#e34a33';
  if (mmi >= 7) return '#fc8d59';
  if (mmi >= 6) return '#fdbb84';
  if (mmi >= 5) return '#fee8c8';
  return '#f7f4ef';
}

/** Red ramp for loss spikes (fraction of the scenario's max LGU P50 loss). */
export function lossColor(fracOfMax: number): string {
  if (fracOfMax >= 0.6) return '#8f0d00';
  if (fracOfMax >= 0.3) return '#d7301f';
  if (fracOfMax >= 0.12) return '#ef6548';
  if (fracOfMax >= 0.04) return '#fc8d59';
  return '#fdbb84';
}
