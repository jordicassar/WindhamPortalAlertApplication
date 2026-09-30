import Link from 'next/link';
import type { Severity } from '@/generated/prisma/enums';
import { formatDateTime, truncate } from '@/lib/format';
import { ChevronDownIcon, ClockIcon, LinkIcon, TagIcon } from './icons';
import { btn, cx, SEVERITY_STYLE, SeverityBadge, SeverityIcon } from './ui';

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
  categoryName: string;
  authorName: string;
  publishedAt: string;
  expiresAt: string | null;
};

/**
 * An alert as residents see it. Collapsed alerts use <details> so they expand
 * without any JavaScript. Also used as the staff preview.
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
  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted">
      <SeverityBadge severity={alert.severity} />
      <span className="inline-flex items-center gap-1.5">
        <TagIcon className="size-4" />
        {alert.categoryName}
      </span>
      <time dateTime={alert.publishedAt} className="inline-flex items-center gap-1.5">
        <ClockIcon className="size-4" />
        {formatDateTime(alert.publishedAt)}
      </time>
      {dimmed && (
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-semibold">Past alert</span>
      )}
    </div>
  );
  const body = (
    <>
      <div className="prose-alert mt-4" dangerouslySetInnerHTML={{ __html: alert.bodyHtml }} />
      <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-sm text-muted">
        <span>
          Posted by <span className="font-semibold text-text">{alert.authorName}</span>
          {alert.expiresAt && ` · Until ${formatDateTime(alert.expiresAt)}`}
        </span>
        {mode === 'collapsible' && (
          <Link href={`/alerts/${alert.id}`} className={btn('secondary', true)}>
            <LinkIcon className="size-4" />
            Open or share this alert
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
    <span
      className={cx(
        'hidden size-12 shrink-0 place-items-center rounded-xl sm:grid',
        SEVERITY_STYLE[alert.severity],
      )}
    >
      <SeverityIcon severity={alert.severity} className="size-6" />
    </span>
  );

  if (mode === 'full') {
    return (
      <article className={cx(shell, 'px-5 py-6 sm:px-8 sm:py-8')}>
        <div className="flex gap-4">
          {icon}
          <div className="min-w-0 flex-1">
            {meta}
            <Title className="mt-3 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
              {alert.title}
            </Title>
          </div>
        </div>
        {body}
      </article>
    );
  }

  return (
    <article className={cx(shell, 'transition-shadow hover:shadow-raised')}>
      <details className="group">
        <summary className="flex cursor-pointer list-none gap-4 px-5 py-5 sm:px-6 [&::-webkit-details-marker]:hidden">
          {icon}
          <div className="min-w-0 flex-1">
            {meta}
            <h3 className="mt-2 text-xl font-bold leading-snug">{alert.title}</h3>
            <p className="mt-1.5 text-base text-muted group-open:hidden">
              {truncate(alert.bodyText, 180)}
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 font-semibold text-brand">
              <span className="group-open:hidden">Read more</span>
              <span className="hidden group-open:inline">Show less</span>
              <ChevronDownIcon className="size-5 transition-transform group-open:rotate-180" />
            </span>
          </div>
        </summary>
        <div className="px-5 pb-5 sm:pl-[5.5rem] sm:pr-6">{body}</div>
      </details>
    </article>
  );
}
