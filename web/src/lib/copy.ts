export type CopyMode = 'sci' | 'basic';

export const COPY = {
  sci: {
    nationalLoss: 'National loss (P50)',
    nationalSub: (usd: string, lo: string, hi: string) =>
      `${usd} · range ${lo}–${hi}`,
    uqLabel: 'Where the uncertainty comes from',
    uqValue: (a: number, e: number) => `${a}% shaking · ${e}% model`,
    uqSub:
      'aleatoric (ground-motion randomness) vs epistemic (fragility & capital-ratio priors), Monte Carlo variance split',
    gdpLabel: 'Share of GDP',
    thMmi: 'MMI',
    thRrup: 'Rrup km',
    thP50: 'Loss P50',
    thRange: 'P10–P90',
    tableLabel: 'Per-city estimates',
    footer:
      'Scenario-based estimates with P10–P90 uncertainty ranges, not predictions. Ground shaking via the Allen–Wald–Worden (2012) intensity prediction equation; losses from an exposure × fragility Monte Carlo validated against the 2013 Bohol earthquake. Spike height encodes the square root of median (P50) loss.',
  },
  basic: {
    nationalLoss: 'Estimated damage (most likely)',
    nationalSub: (usd: string, lo: string, hi: string) =>
      `about ${usd} — could be as low as ${lo} or as high as ${hi}`,
    uqLabel: "Why we can't be exact",
    uqValue: (a: number, e: number) => `${a}% nature · ${e}% our assumptions`,
    uqSub:
      'earthquake shaking is genuinely random (nature), and our damage assumptions are imperfect (assumptions) — we measure both honestly',
    gdpLabel: 'Chunk of the whole economy',
    thMmi: 'Shaking (1–12)',
    thRrup: 'Km to fault',
    thP50: 'Likely cost',
    thRange: 'Low–High',
    tableLabel: 'What each city might lose',
    footer:
      'These are "what-if" estimates with honest low-to-high ranges — nobody can predict when the Big One will strike or exactly what it will cost. We tested this tool against the real 2013 Bohol earthquake before pointing it at Metro Manila. Taller pillars = bigger likely losses.',
  },
} as const;
