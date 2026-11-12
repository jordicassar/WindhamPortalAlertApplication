'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { useLanguage } from './language-provider';

const navLink =
  'inline-flex min-h-11 items-center gap-2 rounded-xl px-4 text-base font-semibold text-white/90 transition-colors hover:bg-white/15 hover:text-white';

export function SiteHeaderContent({ children }: { children: ReactNode }) {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="border-b-4 border-maroon bg-header text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-xl">
          <Image
            src="/images/windham-logo.png"
            alt=""
            width={52}
            height={52}
            preload
            className="size-12 shrink-0 rounded-full shadow-md sm:size-13"
          />
          <span>
            <span className="block text-lg font-bold leading-tight sm:text-xl">Windham</span>
            <span className="block text-sm leading-tight text-white/80">
              {t('communityNotifications')}
            </span>
          </span>
        </Link>
        <nav aria-label={t('mainNavigation')} className="flex flex-wrap items-center gap-1">
          <Link href="/" className={navLink}>
            {t('alerts')}
          </Link>
          {children}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/85">{t('languagePreference')}</span>
            <div
              role="group"
              aria-label={t('languagePreference')}
              className="inline-flex min-h-11 items-center gap-0.5 rounded-xl border border-white/25 bg-white/10 p-0.5"
            >
              {(['en', 'es'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={language === option}
                  onClick={() => setLanguage(option)}
                  className={`min-h-10 cursor-pointer rounded-lg px-3 text-sm font-bold transition-colors focus-visible:outline-white ${
                    language === option
                      ? 'bg-white text-header shadow-sm'
                      : 'text-white/90 hover:bg-white/15 hover:text-white'
                  }`}
                >
                  {option === 'en' ? 'English' : 'Español'}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
