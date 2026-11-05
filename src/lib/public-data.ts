import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import { db } from './db';
import type { AlertIconId } from './alert-icons';
import { alertHtmlToText, sanitizeAlertHtml } from './sanitize';

/**
 * Cached reads for the public (resident) pages. These are the pages that take
 * the traffic spike during a storm or emergency, so they are served from cache
 * and the database is only queried when the cache is refreshed.
 *
 * Staff actions that change what residents see call updateTag(PUBLIC_ALERTS_TAG),
 * so an approved alert appears immediately. cacheLife('minutes') also refreshes
 * the list every minute so expired alerts drop off without anyone acting.
 */

export const PUBLIC_ALERTS_TAG = 'public-alerts';
export const CATEGORIES_TAG = 'categories';

const PAST_ALERT_LIMIT = 50;

export type PublicAlert = {
  id: string;
  title: string;
  bodyHtml: string;
  bodyText: string;
  severity: 'INFO' | 'ADVISORY' | 'EMERGENCY';
  iconId: AlertIconId | null;
  categoryId: string;
  categoryName: string;
  authorName: string;
  publishedAt: string;
  expiresAt: string | null;
  location: AlertLocation | null;
};

const publicSelect = {
  id: true,
  title: true,
  bodyHtml: true,
  severity: true,
  iconId: true,
  publishedAt: true,
  expiresAt: true,
  latitude: true,
  longitude: true,
  locationName: true,
  categoryId: true,
  category: { select: { name: true } },
  author: { select: { name: true } },
} as const;

type Row = {
  id: string;
  title: string;
  bodyHtml: string;
  severity: PublicAlert['severity'];
  iconId: AlertIconId | null;
  publishedAt: Date | null;
  expiresAt: Date | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  categoryId: string;
  category: { name: string };
  author: { name: string };
};

function toPublic(row: Row): PublicAlert {
  const bodyHtml = sanitizeAlertHtml(row.bodyHtml);
  return {
    id: row.id,
    title: row.title,
    bodyHtml,
    bodyText: alertHtmlToText(bodyHtml),
    severity: row.severity,
    iconId: row.iconId,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    authorName: row.author.name,
    publishedAt: (row.publishedAt ?? new Date(0)).toISOString(),
    expiresAt: row.expiresAt?.toISOString() ?? null,
    location: toLocation(row),
  };
}

/** Current alerts plus the most recent past ones, for the residents' feed. */
export async function getPublicFeed(): Promise<{ live: PublicAlert[]; past: PublicAlert[] }> {
  'use cache';
  cacheTag(PUBLIC_ALERTS_TAG);
  cacheLife('minutes');

  const now = new Date();
  const [live, past] = await Promise.all([
    db.alert.findMany({
      where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
      orderBy: { publishedAt: 'desc' },
      select: publicSelect,
    }),
    db.alert.findMany({
      where: {
        OR: [
          { status: 'ARCHIVED', publishedAt: { not: null } },
          { status: 'PUBLISHED', expiresAt: { lte: now } },
        ],
      },
      orderBy: { publishedAt: 'desc' },
      take: PAST_ALERT_LIMIT,
      select: publicSelect,
    }),
  ]);
  return { live: live.map(toPublic), past: past.map(toPublic) };
}

/** A single alert for its shareable page (linked from emails and texts). */
export async function getPublicAlert(id: string): Promise<PublicAlert | null> {
  'use cache';
  cacheTag(PUBLIC_ALERTS_TAG);
  cacheLife('minutes');

  const row = await db.alert.findFirst({
    where: { id, status: { in: ['PUBLISHED', 'ARCHIVED'] }, publishedAt: { not: null } },
    select: publicSelect,
  });
  return row ? toPublic(row) : null;
}

export async function getCategories(): Promise<{ id: string; name: string }[]> {
  'use cache';
  cacheTag(CATEGORIES_TAG);
  cacheLife('hours');

  return db.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } });
}
