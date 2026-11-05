'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useMemo, useState, useSyncExternalStore } from 'react';
import type { Severity } from '@/generated/prisma/enums';
import type { PublicAlert } from '@/lib/public-data';
import { AlertArticle } from './alert-article';
import type { MapAlert } from './alert-map';
import { ListIcon, MapIcon, MapPinIcon, SearchIcon } from './icons';
import { card, cx, EmptyState, input } from './ui';

const AlertMap = dynamic(() => import('./alert-map').then((m) => m.AlertMap), {
  ssr: false,
  loading: () => <div className="h-[26rem] rounded-2xl border border-border bg-surface-2" />,
});

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
  const [view, setView] = useState<'list' | 'map'>('list');
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

  const located = useMemo(
    () => visible.flatMap((a): MapAlert[] => (a.location ? [{ ...a, location: a.location }] : [])),
    [visible],
  );

  const filtered = query.trim() !== '' || categoryId !== 'all' || severity !== 'all';
  function clearFilters() {
    setQuery('');
    setCategoryId('all');
    setSeverity('all');
  }

  const chip = (active: boolean) =>
    cx(
      'inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-base font-semibold transition-colors',
      active
        ? 'border-brand bg-brand text-brand-contrast shadow-card'
        : 'border-border bg-surface hover:border-muted hover:bg-surface-2',
    );

  const severities: { value: Severity | 'all'; label: string; dot?: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'EMERGENCY', label: 'Emergency', dot: 'bg-emergency' },
    { value: 'ADVISORY', label: 'Advisory', dot: 'bg-advisory' },
    { value: 'INFO', label: 'Information', dot: 'bg-info' },
  ];

  return (
    <section aria-labelledby="feed-heading">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="feed-heading"
            className="text-2xl font-bold tracking-tight text-accent sm:text-3xl"
          >
            Community alerts
          </h2>
          <p className="mt-1 text-muted">Tap an alert to read the full notice.</p>
        </div>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 text-base font-semibold">
          <input
            type="checkbox"
            role="switch"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
            className="peer sr-only"
          />
          <span
            aria-hidden
            className="relative h-7 w-12 rounded-full bg-border transition-colors after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-brand peer-checked:after:translate-x-5 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--ring)]"
          />
          Show past alerts
        </label>
      </div>

      <div className={cx(card, 'grid gap-4 p-4 sm:p-5')}>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts, e.g. parking or school"
            aria-label="Search alerts"
            className={cx(input, 'pl-12')}
          />
        </div>

        <div role="group" aria-label="Filter by severity" className="flex flex-wrap gap-2">
          {severities.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-pressed={severity === s.value}
              onClick={() => setSeverity(s.value)}
              className={chip(severity === s.value)}
            >
              {s.dot && (
                <span
                  aria-hidden
                  className={cx(
                    'size-2.5 rounded-full',
                    s.dot,
                    severity === s.value && 'ring-2 ring-white',
                  )}
                />
              )}
              {s.label}
            </button>
          ))}
        </div>

        <div className="border-t border-border pt-4">
          <p
            id="topic-filter"
            className="mb-2 text-sm font-bold uppercase tracking-wider text-muted"
          >
            Topic
          </p>
          <div role="group" aria-labelledby="topic-filter" className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={categoryId === 'all'}
              onClick={() => setCategoryId('all')}
              className={chip(categoryId === 'all')}
            >
              All topics
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
        </div>
      </div>

      <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-base font-semibold text-muted" aria-live="polite">
          {visible.length === 1 ? '1 alert' : `${visible.length} alerts`}
          {filtered && (
            <>
              {' '}
              match your filters ·{' '}
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-brand underline underline-offset-4"
              >
                Clear filters
              </button>
            </>
          )}
        </p>
        <div role="group" aria-label="Show alerts as" className="flex gap-1">
          <button
            type="button"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
            className={chip(view === 'list')}
          >
            <ListIcon className="size-5" />
            List
          </button>
          <button
            type="button"
            aria-pressed={view === 'map'}
            onClick={() => setView('map')}
            className={chip(view === 'map')}
          >
            <MapIcon className="size-5" />
            Map
          </button>
        </div>
      </div>

      {view === 'map' ? (
        <div className="grid gap-4">
          <AlertMap alerts={located} label="Map of alert locations" />
          {/* The same alerts in words, for anyone who can't see or use the map. */}
          <div className={cx(card, 'p-4 sm:p-5')}>
            <h3 className="font-bold">
              {located.length === 0
                ? 'None of these alerts has a location'
                : located.length === 1
                  ? '1 alert on the map'
                  : `${located.length} alerts on the map`}
            </h3>
            {located.length > 0 && (
              <ul className="mt-2 grid gap-2">
                {located.map((a) => (
                  <li key={a.id} className="flex gap-2">
                    <MapPinIcon className="mt-0.5 size-5 shrink-0 text-muted" />
                    <span>
                      <Link
                        href={`/alerts/${a.id}`}
                        className="font-semibold text-brand underline underline-offset-4"
                      >
                        {a.title}
                      </Link>
                      <span className="block text-sm text-muted">{a.location.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {visible.length > located.length && (
              <p className="mt-3 text-sm text-muted">
                {visible.length - located.length} more{' '}
                {visible.length - located.length === 1 ? 'alert has' : 'alerts have'} no location.{' '}
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="font-semibold text-brand underline underline-offset-4"
                >
                  Show the list
                </button>
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {visible.length ? (
            visible.map((a) => (
              <AlertArticle key={a.id} alert={a} mode="collapsible" dimmed={!current.includes(a)} />
            ))
          ) : (
            <EmptyState>No alerts match your filters.</EmptyState>
          )}
        </div>
      )}
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
