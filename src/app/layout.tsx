import type { Metadata } from 'next';
import { Atkinson_Hyperlegible_Next } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

// Designed by the Braille Institute for legibility: distinct letterforms (Il1, 0O) help older readers.
// next/font has no fallback metrics for it yet, so builds warn "Failed to find font override
// values"; harmless, it only skips the size-matched fallback font.
const atkinson = Atkinson_Hyperlegible_Next({ variable: '--font-atkinson', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Windham Community Notifications', template: '%s · Windham Notifications' },
  description: 'Emergency alerts, closures and community news for Windham residents.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${atkinson.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col overflow-x-clip font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-xl focus:bg-surface focus:px-4 focus:py-3 focus:font-semibold focus:shadow-raised"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
