'use client';

import { useEffect } from 'react';
import { ErrorMessage } from '@/components/error-message';

/** Error page for any crash inside a page. The site header stays visible above it. */
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Shows up in the host's logs; the digest matches the server-side log entry.
    console.error(error);
  }, [error]);

  return <ErrorMessage digest={error.digest} onRetry={retry} />;
}
