import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';

import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Project documentation', template: '%s · Project docs' },
  description: 'Integration guides, API contracts, and repository documentation.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
      </body>
    </html>
  );
}
