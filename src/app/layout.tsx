import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import './globals.css';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: { default: 'Windham Community Notifications', template: '%s · Windham Notifications' },
  description: 'Emergency alerts, closures and community news for Windham residents.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
          {children}
        </main>
        <footer className="px-4 py-6 text-center text-xs text-muted">
          Windham Community Notification Portal · Prototype build for the sandbox environment
        </footer>
      </body>
    </html>
  );
}
