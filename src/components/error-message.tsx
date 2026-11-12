'use client';

import { btn, card } from './ui';
import { useLanguage } from './language-provider';

/**
 * Shown when something fails while loading a page. Deliberately plain: no
 * technical details, just what happened, what to do, and the emergency number,
 * because residents may land here during a storm or emergency.
 */
export function ErrorMessage({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  const { t } = useLanguage();
  return (
    <div role="alert" className={`${card} mx-auto mt-8 max-w-lg p-6 text-center sm:p-8`}>
      <div
        aria-hidden
        className="mx-auto mb-4 grid size-12 place-items-center rounded-full bg-advisory-soft text-2xl font-bold text-advisory"
      >
        !
      </div>
      <h1 className="text-xl font-bold">{t('unableToProcess')}</h1>
      <p className="mt-2 text-muted">{t('somethingWentWrong')}</p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={onRetry} className={btn('primary')}>
          {t('tryAgain')}
        </button>
        {/* A plain link (not next/link) so it loads a fresh page even if the app is in a bad state. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" className={btn('secondary')}>
          {t('goHome')}
        </a>
      </div>

      <p className="mt-6 rounded-lg bg-emergency-soft px-4 py-3 text-sm font-semibold text-emergency">
        {t('emergencyCall911')}
      </p>

      {digest && (
        <p className="mt-4 text-xs text-muted">
          {t('contactTownReference')} <code className="font-mono">{digest}</code>.
        </p>
      )}
    </div>
  );
}
