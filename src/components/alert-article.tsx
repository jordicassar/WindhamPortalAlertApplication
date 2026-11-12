'use client';

import Link from 'next/link';
import type { Severity } from '@/generated/prisma/enums';
import { formatDateTime, truncate } from '@/lib/format';
import { getDefaultAlertIcon, type AlertIconId } from '@/lib/alert-icons';
import { AlertIconBadge } from './AlertIconBadge';
import { ChevronDownIcon, ClockIcon, LinkIcon, TagIcon } from './icons';
import { btn, cx, SEVERITY_STYLE, SeverityIcon } from './ui';
import { translateCategory } from '@/lib/i18n';
import { useLanguage } from './language-provider';

const SEVERITY_BAR: Record<Severity, string> = {
  INFO: 'before:bg-info',
  ADVISORY: 'before:bg-advisory',
  EMERGENCY: 'before:bg-emergency',
};

export type AlertView = {
  id: string;
  title: string;
  /** Must already be sanitized (see src/lib/sanitize.ts). */
  bodyHtml: string;
  bodyText: string;
  severity: Severity;
  iconId: AlertIconId | null;
  categoryName: string;
  authorName: string;
  publishedAt: string;
  expiresAt: string | null;
};

/**
 * An alert as residents see it. Collapsed alerts use <details> so they expand
 * without any JavaScript. Also used as the staff preview.
 *
 * The layout responds to the width it is given (container queries), not the screen's,
 * so the publisher's phone-sized preview shows the phone layout on a desktop too.
 */
export function AlertArticle({
  alert,
  mode,
  dimmed,
  titleAs: Title = 'h2',
}: {
  alert: AlertView;
  mode: 'collapsible' | 'full';
  dimmed?: boolean;
  /** Heading level of the title in full mode: h1 on the alert's own page, h2 inside staff previews. */
  titleAs?: 'h1' | 'h2';
}) {
  const { language, t } = useLanguage();
  const severityLabel = {
    INFO: t('information'),
    ADVISORY: t('advisory'),
    EMERGENCY: t('emergency'),
  }[alert.severity];
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
      <span
        className={cx(
          'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-bold',
          SEVERITY_STYLE[alert.severity],
        )}
      >
        <SeverityIcon severity={alert.severity} className="size-3.5" />
        {severityLabel}
      </span>
      <span className="inline-flex items-center gap-1.5">
        <TagIcon className="size-4" />
        {translateCategory(alert.categoryName, language)}
      </span>
      <time dateTime={alert.publishedAt} className="inline-flex items-center gap-1.5">
        <ClockIcon className="size-4" />
        {formatDateTime(alert.publishedAt, language === 'es' ? 'es-US' : 'en-US')}
      </time>
      {dimmed && (
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-semibold">
          {t('pastAlert')}
        </span>
      )}
    </div>
  );
  const body = (
    <>
      <div
        lang="en"
        className="prose-alert mt-4"
        dangerouslySetInnerHTML={{ __html: alert.bodyHtml }}
      />
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted">
        <span>
          {t('postedBy')} <span className="font-semibold text-text">{alert.authorName}</span>
          {alert.expiresAt &&
            ` · ${t('until')} ${formatDateTime(alert.expiresAt, language === 'es' ? 'es-US' : 'en-US')}`}
        </span>
        {mode === 'collapsible' && (
          <Link href={`/alerts/${alert.id}`} className={btn('secondary', true)}>
            <LinkIcon className="size-4" />
            {t('openOrShare')}
          </Link>
        )}
      </footer>
    </>
  );

  const shell = cx(
    'relative overflow-hidden rounded-2xl border border-border bg-surface shadow-card',
    'before:absolute before:inset-y-0 before:left-0 before:w-1.5',
    SEVERITY_BAR[alert.severity],
    dimmed && 'opacity-75',
  );
  const icon = (
    <AlertIconBadge
      icon={alert.iconId ?? getDefaultAlertIcon(alert.categoryName)}
      size="md"
      className="size-10 @xl:size-12"
    />
  );

  if (mode === 'full') {
    return (
      <div className="@container">
        <article className={cx(shell, 'px-5 py-6 @xl:px-8 @xl:py-8')}>
          <div className="flex gap-4">
            {icon}
            <div className="min-w-0 flex-1">
              {meta}
              <Title
                lang="en"
                className="mt-3 text-2xl font-bold leading-tight tracking-tight @xl:text-3xl"
              >
                {alert.title}
              </Title>
            </div>
          </div>
          {body}
        </article>
      </div>
    );
  }

  return (
    <div className="@container">
      <article className={cx(shell, 'transition-shadow hover:shadow-raised')}>
        <details className="group">
          <summary className="flex cursor-pointer list-none gap-4 px-5 py-5 @xl:px-6 [&::-webkit-details-marker]:hidden">
            {icon}
            <div className="min-w-0 flex-1">
              {meta}
              <h3 lang="en" className="mt-2 text-xl font-bold leading-snug">
                {alert.title}
              </h3>
              <p lang="en" className="mt-1.5 text-base text-muted group-open:hidden">
                {truncate(alert.bodyText, 180)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand">
                <span className="group-open:hidden">{t('readMore')}</span>
                <span className="hidden group-open:inline">{t('showLess')}</span>
                <ChevronDownIcon className="size-5 transition-transform group-open:rotate-180" />
              </span>
            </div>
          </summary>
          <div className="px-5 pb-5 @xl:pl-[5.5rem] @xl:pr-6">{body}</div>
        </details>
      </article>
    </div>
  );
}
