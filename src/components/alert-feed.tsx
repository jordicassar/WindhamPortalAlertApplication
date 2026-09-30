'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Severity } from '@/generated/prisma/enums';
import type { PublicAlert } from '@/lib/public-data';
import { AlertArticle } from './alert-article';
import { cx, EmptyState, input } from './ui';

/**
 * Filtering happens in the browser on the cached list, so searching and
 * filtering never reach the server. That keeps the page cacheable for everyone.
 */
export function AlertFeed({
  live,
  past,
  categories,
}: {
  live: PublicAlert[];
  past: PublicAlert[];
  categories: { id: string; name: string }[];
}) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [showPast, setShowPast] = useState(false);
  const now = useNow();

  // The cached list can be up to a minute old; hide anything that expired since.
  const current = useMemo(
    () => live.filter((a) => !a.expiresAt || new Date(a.expiresAt).getTime() > now),
    [live, now],
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = showPast ? [...current, ...past] : current;
    return pool
      .filter((a) => categoryId === 'all' || a.categoryId === categoryId)
      .filter((a) => severity === 'all' || a.severity === severity)
      .filter((a) => !q || `${a.title} ${a.bodyText}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const liveDiff = Number(current.includes(b)) - Number(current.includes(a));
        if (liveDiff) return liveDiff;
        const emergencyDiff =
          Number(b.severity === 'EMERGENCY') - Number(a.severity === 'EMERGENCY');
        return emergencyDiff || b.publishedAt.localeCompare(a.publishedAt);
      });
  }, [current, past, showPast, query, categoryId, severity]);

  const chip = (active: boolean) =>
    cx(
      'rounded-full border px-3 py-1 text-sm',
      active
        ? 'border-brand bg-brand text-brand-contrast'
        : 'border-border bg-surface hover:bg-surface-2',
    );

  return (
    <section aria-labelledby="feed-heading">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="feed-heading" className="text-xl font-bold">
          Community alerts
        </h2>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="size-4 accent-brand"
          />
          Include past alerts
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-[1fr_190px]">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search alerts…"
          aria-label="Search alerts"
          className={input}
        />
        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value as Severity | 'all')}
          aria-label="Filter by severity"
          className={input}
        >
          <option value="all">All severities</option>
          <option value="EMERGENCY">Emergency</option>
          <option value="ADVISORY">Advisory</option>
          <option value="INFO">Information</option>
        </select>
      </div>

      <div role="group" aria-label="Filter by category" className="my-4 flex flex-wrap gap-1.5">
        <button
          type="button"
          aria-pressed={categoryId === 'all'}
          onClick={() => setCategoryId('all')}
          className={chip(categoryId === 'all')}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={categoryId === c.id}
            onClick={() => setCategoryId(c.id)}
            className={chip(categoryId === c.id)}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid gap-3" aria-live="polite">
        {visible.length ? (
          visible.map((a) => (
            <AlertArticle key={a.id} alert={a} mode="collapsible" dimmed={!current.includes(a)} />
          ))
        ) : (
          <EmptyState>No alerts match your filters.</EmptyState>
        )}
      </div>
    </section>
  );
}

/** Current time that ticks every minute on the client, and is stable during SSR/hydration. */
function useNow(): number {
  return useSyncExternalStore(
    (onChange) => {
      const timer = setInterval(onChange, 60_000);
      return () => clearInterval(timer);
    },
    () => Math.floor(Date.now() / 60_000) * 60_000,
    () => 0,
  );
}
