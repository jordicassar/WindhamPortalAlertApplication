'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/error-message';
import './globals.css';

/**
 * Last-resort error page, used when the site frame itself (root layout, header)
 * fails. It replaces the whole document, so it brings its own <html> and styles.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen px-4 py-10 font-sans">
        <title>Temporarily unavailable · Windham Community Notifications</title>
        <p className="text-center text-lg font-bold">Windham Community Notifications</p>
        <ErrorMessage digest={error.digest} onRetry={retry} />
      </body>
    </html>
  );
}
