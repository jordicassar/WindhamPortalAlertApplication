'use client';

import Link from 'next/link';
import { useLanguage } from './language-provider';
import { ArrowRightIcon, BellIcon, CheckCircleIcon, SirenIcon } from './icons';

export function HomeHero({
  emergencies,
  active,
}: {
  emergencies: { id: string; title: string }[];
  active: number;
}) {
  const { t } = useLanguage();

  return (
    <>
      <section className="hero full-bleed -mt-8 mb-8 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-6 sm:pb-12 sm:pt-11">
          <p className="text-base font-semibold uppercase tracking-wider text-white/75">
            {t('townOfWindham')}
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {t('homeTitle')}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85 sm:text-xl">{t('homeDescription')}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusPill emergencies={emergencies.length} active={active} />
            <a
              href="#subscribe"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-[#1c3664] shadow-md transition-colors hover:bg-[#e8ecf3]"
            >
              <BellIcon className="size-5" />
              {t('getAlertsByEmailOrText')}
            </a>
          </div>
        </div>
      </section>

      {emergencies.map((alert) => (
        <div
          key={alert.id}
          role="alert"
          className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl bg-emergency-strong px-5 py-4 text-white shadow-raised sm:flex-nowrap"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
            <SirenIcon className="size-7" />
          </span>
          <div className="min-w-0 flex-1 basis-52">
            <p className="text-sm font-bold uppercase tracking-wider text-white/85">
              {t('emergencyAlert')}
            </p>
            <p lang="en" className="text-lg font-bold leading-snug sm:text-xl">
              {alert.title}
            </p>
          </div>
          <Link
            href={`/alerts/${alert.id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-base font-bold text-emergency-strong hover:bg-white/90"
          >
            {t('readAlert')}
            <ArrowRightIcon className="size-5" />
          </Link>
        </div>
      ))}
    </>
  );
}

function StatusPill({ emergencies, active }: { emergencies: number; active: number }) {
  const { t } = useLanguage();
  if (emergencies > 0) {
    const text =
      emergencies === 1
        ? t('oneEmergencyInEffect')
        : t('manyEmergenciesInEffect').replace('{count}', String(emergencies));
    return (
      <span className="inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-emergency-strong px-4 py-2 text-base font-bold ring-1 ring-white/25">
        <span className="pulse-dot size-2.5 rounded-full bg-white" />
        {text}
      </span>
    );
  }
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/12 px-4 py-2 text-base font-semibold ring-1 ring-white/25">
      <CheckCircleIcon className="size-5" />
      {active === 0
        ? t('allClear')
        : t(active === 1 ? 'oneActiveNoEmergencies' : 'manyActiveNoEmergencies').replace(
            '{count}',
            String(active),
          )}
    </span>
  );
}
