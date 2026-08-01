/**
 * A collapsed plain-language explanation, for any dense passage.
 *
 * This is the same pattern as the `plain` prop on <TeX>, extracted so it works
 * on pages that have no equations — the methodology and policy pages are dense
 * with statutory citations, coined terms and modelling jargon rather than
 * notation, and those need translating just as much.
 *
 * Why <details> rather than a page-level "simple mode" toggle:
 *
 *   1. The technical text is the evidence. Swapping it out for a simplified
 *      version hides what a reader would need in order to check the claim.
 *      Keeping both, with the translation one click away, does not.
 *   2. It needs no client JavaScript, so these stay server components. A
 *      page-level toggle needs state, which would force 'use client' and ship
 *      more to the browser for no gain.
 *   3. Readers are not uniformly expert or non-expert. Someone may follow the
 *      RA 10121 citations comfortably and still want the fragility curve in
 *      plain terms. Per-passage disclosure lets them choose case by case;
 *      a global mode does not.
 *
 * Usage:
 *   <Plain>Two sentences saying the same thing without the jargon.</Plain>
 *   <Plain label="Why does this matter?">…</Plain>
 */
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Summary text. Defaults to "What is this saying?" */
  label?: string;
};

export default function Plain({ children, label = 'What is this saying?' }: Props) {
  return (
    <details
      style={{
        margin: '0.7rem 0 1.2rem',
        fontSize: '0.9rem',
        borderLeft: '2px solid rgba(128,128,128,0.3)',
        paddingLeft: '0.85rem',
      }}
    >
      <summary
        style={{
          cursor: 'pointer',
          opacity: 0.75,
          listStyle: 'revert',
          userSelect: 'none',
        }}
      >
        {label}
      </summary>
      <div style={{ margin: '0.55rem 0 0.2rem', lineHeight: 1.65, opacity: 0.92 }}>
        {children}
      </div>
    </details>
  );
}
