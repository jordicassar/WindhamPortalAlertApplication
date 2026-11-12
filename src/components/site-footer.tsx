'use client';

import Image from 'next/image';
import { PhoneIcon } from './icons';
import { useLanguage } from './language-provider';

export function SiteFooter() {
  const { t } = useLanguage();
  return (
    <footer className="mt-12 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-start gap-3">
          <Image
            src="/images/windham-logo.png"
            alt=""
            width={48}
            height={48}
            className="size-12 shrink-0 rounded-full"
          />
          <div>
            <p className="font-bold">{t('portalName')}</p>
            <p className="mt-0.5 text-muted">{t('officialAlerts')}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emergency-soft px-4 py-3 text-emergency">
          <PhoneIcon className="size-5 shrink-0" />
          <p className="font-semibold">
            {t('emergencyCall')} <span className="font-extrabold">911</span>.
          </p>
        </div>
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-6xl px-4 py-4 text-sm text-muted sm:px-6">
          {t('allTimesEastern')}
        </p>
      </div>
    </footer>
  );
}
