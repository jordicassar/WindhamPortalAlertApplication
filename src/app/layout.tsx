import type { Metadata } from 'next';
import { Atkinson_Hyperlegible_Next } from 'next/font/google';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { LanguageProvider } from '@/components/language-provider';
import { SkipLink } from '@/components/skip-link';
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
        <LanguageProvider>
          <SkipLink />
          <SiteHeader />
          <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <SiteFooter />
        </LanguageProvider>
      </body>
    </html>
  );
}
