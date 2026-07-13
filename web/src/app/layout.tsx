import type { Metadata } from 'next';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/archivo/400.css';
import '@fontsource/archivo/500.css';
import '@fontsource/archivo/600.css';
import '@fontsource/ibm-plex-mono/500.css';
import '@fontsource/ibm-plex-mono/600.css';
import Header from '@/components/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Big One — Scenario Loss Estimator',
  description:
    'Scenario-based economic loss estimation for a West Valley Fault earthquake, per Metro Manila LGU, with quantified uncertainty.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
