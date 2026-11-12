'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { unsubscribe } from '@/app/actions/subscribe';
import { SubmitButton } from './submit-button';
import { ArrowLeftIcon, BellIcon, BellOffIcon, CheckCircleIcon } from './icons';
import { useLanguage } from './language-provider';
import { btn, card } from './ui';

export function AlertPageShell({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className={`${btn('ghost')} -ml-3 mb-4`}>
        <ArrowLeftIcon className="size-5" />
        {t('allAlerts')}
      </Link>
      {children}
      <div
        className={`${card} mt-6 flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6`}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <BellIcon className="size-6" />
          </span>
          <p className="text-lg font-semibold">{t('wantAlerts')}</p>
        </div>
        <Link href="/#subscribe" className={btn('primary')}>
          {t('signUpForAlerts')}
        </Link>
      </div>
    </div>
  );
}

export function UnsubscribedContent() {
  const { t } = useLanguage();
  return (
    <div className={`${card} mx-auto mt-4 max-w-lg p-6 sm:p-8`}>
      <span className="grid size-12 place-items-center rounded-xl bg-ok-soft text-ok">
        <CheckCircleIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{t('unsubscribedTitle')}</h1>
      <p className="mt-2 text-lg text-muted">{t('unsubscribedDescription')}</p>
      <Link href="/" className={`${btn('primary')} mt-6`}>
        {t('viewCurrentAlerts')}
      </Link>
    </div>
  );
}

export function UnsubscribeContent({ token }: { token: string }) {
  const { t } = useLanguage();
  return (
    <div className={`${card} mx-auto mt-4 max-w-lg p-6 sm:p-8`}>
      <span className="grid size-12 place-items-center rounded-xl bg-emergency-soft text-emergency">
        <BellOffIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{t('stopAlerts')}</h1>
      <p className="mt-2 text-lg text-muted">{t('stopAlertsDescription')}</p>
      <form action={unsubscribe} className="mt-6 flex flex-wrap gap-3">
        <input type="hidden" name="token" value={token} />
        <SubmitButton variant="danger" pendingText={t('unsubscribing')}>
          {t('unsubscribe')}
        </SubmitButton>
        <Link href="/" className={btn('ghost')}>
          {t('keepMyAlerts')}
        </Link>
      </form>
    </div>
  );
}
