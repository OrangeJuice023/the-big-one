'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { href: '/rationale/', label: 'Rationale' },
  { href: '/methodology/', label: 'Methodology' },
  { href: '/policy/', label: 'Policy readiness' },
];

/** Seismogram brand mark (inline SVG, no icon fonts). */
function Mark() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="13" cy="13" r="12" fill="none" stroke="var(--accent)" strokeWidth="1.6" />
      <path
        d="M3.5 13h4l1.6-4.4 2.4 8.8 2.6-13 2.6 13 1.8-4.4h4"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  return (
    <header className="topbar">
      <Link href="/" className="brand" aria-label="The Big One — home">
        <Mark />
        <span className="brand-text">
          <span className="brand-name">The Big One</span>
          <span className="brand-sub">West Valley Fault · scenario loss estimator</span>
        </span>
      </Link>
      <nav aria-label="Primary">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className={pathname?.startsWith(n.href.slice(0, -1)) ? 'nav-link active' : 'nav-link'}
          >
            {n.label}
          </Link>
        ))}
        <a
          className="nav-link"
          href="https://github.com/OrangeJuice023/the-big-one"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
          <svg width="11" height="11" viewBox="0 0 12 12" aria-hidden="true" style={{ marginLeft: 3 }}>
            <path d="M3.5 1.5h7v7M10.5 1.5 1.5 10.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </a>
      </nav>
    </header>
  );
}
