import Link from 'next/link';
import type { Severity } from '@/generated/prisma/enums';
import { formatDateTime, truncate } from '@/lib/format';
import { cx, SEVERITY_BORDER, SeverityBadge } from './ui';

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
}: {
  alert: AlertView;
  mode: 'collapsible' | 'full';
  dimmed?: boolean;
}) {
  const meta = (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
      <SeverityBadge severity={alert.severity} />
      <span>{alert.categoryName}</span>
      <time dateTime={alert.publishedAt}>{formatDateTime(alert.publishedAt)}</time>
      {dimmed && <span className="font-semibold">Past alert</span>}
    </div>
  );
  const body = (
    <>
      <div className="prose-alert mt-3" dangerouslySetInnerHTML={{ __html: alert.bodyHtml }} />
      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-xs text-muted">
        <span>
          Posted by {alert.authorName}
          {alert.expiresAt && ` · Expires ${formatDateTime(alert.expiresAt)}`}
        </span>
        {mode === 'collapsible' && (
          <Link href={`/alerts/${alert.id}`} className="font-semibold text-brand underline">
            Share link
          </Link>
        )}
      </footer>
    </>
  );

  const shell = cx(
    'rounded-xl border border-l-[5px] border-border bg-surface px-5 py-4 shadow-sm',
    SEVERITY_BORDER[alert.severity],
    dimmed && 'opacity-70',
  );

  if (mode === 'full') {
    return (
      <article className={shell}>
        {meta}
        <h2 className="mt-1.5 text-xl font-bold">{alert.title}</h2>
        {body}
      </article>
    );
  }

  return (
    <article className={shell}>
      <details className="group">
        <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
          {meta}
          <h3 className="mt-1.5 text-lg font-bold group-hover:underline">{alert.title}</h3>
          <p className="mt-1 text-sm text-muted group-open:hidden">
            {truncate(alert.bodyText, 170)}{' '}
            <span className="font-semibold text-brand">Read more</span>
          </p>
        </summary>
        {body}
      </details>
    </article>
  );
}
