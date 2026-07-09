import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Big One — Scenario Loss Estimator',
  description:
    'Scenario-based economic loss estimation for a West Valley Fault earthquake, per Metro Manila LGU, with quantified uncertainty.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
