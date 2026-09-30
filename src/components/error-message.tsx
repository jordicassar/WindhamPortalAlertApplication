'use client';

import { btn, card } from './ui';

/**
 * Shown when something fails while loading a page. Deliberately plain: no
 * technical details, just what happened, what to do, and the emergency number,
 * because residents may land here during a storm or emergency.
 */
export function ErrorMessage({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  return (
    <div role="alert" className={`${card} mx-auto mt-8 max-w-lg p-6 text-center sm:p-8`}>
      <div
        aria-hidden
        className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-advisory-soft text-2xl font-bold text-advisory"
      >
        !
      </div>
      <h1 className="text-xl font-bold">We can&apos;t process your request right now</h1>
      <p className="mt-2 text-muted">
        Something went wrong on our end. Please try again in a few minutes, or check back later.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onRetry} className={btn('primary')}>
          Try again
        </button>
        {/* A plain link (not next/link) so it loads a fresh page even if the app is in a bad state. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className={btn('secondary')}>
          Go to the home page
        </a>
      </div>

      <p className="mt-6 rounded-lg bg-emergency-soft px-4 py-3 text-sm font-semibold text-emergency">
        If this is an emergency, call 911.
      </p>

      {digest && (
        <p className="mt-4 text-xs text-muted">
          If you contact the town about this problem, mention reference code{' '}
          <code className="font-mono">{digest}</code>.
        </p>
      )}
    </div>
  );
}
