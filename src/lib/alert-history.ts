import type { Prisma } from '@/generated/prisma/client';
import { AlertStatus, Severity } from '@/generated/prisma/enums';

/**
 * The publisher workspace's alert history: a publisher's own alerts, or every alert written by
 * staff in the same department, sorted and filtered from the URL (so views can be bookmarked and
 * no client JavaScript is needed). Everything here is pure so it can be unit tested.
 */

export const SCOPES = ['mine', 'department'] as const;
export type Scope = (typeof SCOPES)[number];

export const SORT_KEYS = ['updated', 'created', 'severity', 'status'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export type SortDir = 'asc' | 'desc';

export type HistoryQuery = {
  scope: Scope;
  sort: SortKey;
  dir: SortDir;
  status: AlertStatus | null;
  severity: Severity | null;
};

export const DEFAULT_QUERY: HistoryQuery = {
  scope: 'mine',
  sort: 'updated',
  dir: 'desc',
  status: null,
  severity: null,
};

type Params = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pick<T extends string>(allowed: readonly T[], value: string | undefined): T | null {
  return allowed.find((a) => a === value) ?? null;
}

/** Reads the URL's query string. Anything unrecognised falls back to the default. */
export function parseHistoryQuery(params: Params): HistoryQuery {
  return {
    scope: pick(SCOPES, one(params.scope)) ?? DEFAULT_QUERY.scope,
    sort: pick(SORT_KEYS, one(params.sort)) ?? DEFAULT_QUERY.sort,
    dir: pick(['asc', 'desc'] as const, one(params.dir)) ?? DEFAULT_QUERY.dir,
    status: pick(Object.values(AlertStatus), one(params.status)),
    severity: pick(Object.values(Severity), one(params.severity)),
  };
}

/** The query string for a view, leaving out values that are just the default. */
export function historyHref(query: HistoryQuery, changes: Partial<HistoryQuery> = {}): string {
  const q = { ...query, ...changes };
  const sp = new URLSearchParams();
  if (q.scope !== DEFAULT_QUERY.scope) sp.set('scope', q.scope);
  if (q.sort !== DEFAULT_QUERY.sort) sp.set('sort', q.sort);
  if (q.dir !== DEFAULT_QUERY.dir) sp.set('dir', q.dir);
  if (q.status) sp.set('status', q.status);
  if (q.severity) sp.set('severity', q.severity);
  const s = sp.toString();
  return s ? `/publisher?${s}` : '/publisher';
}

/**
 * Which alerts the signed-in publisher may see.
 *  - "mine": their own alerts.
 *  - "department": alerts whose author is in the same department. The department comparison
 *    ignores case, because it is typed by hand when the account is created. Alerts from other
 *    departments are never matched, drafts included.
 */
export function historyWhere(
  user: { id: string; department: string },
  query: Pick<HistoryQuery, 'scope' | 'status' | 'severity'>,
): Prisma.AlertWhereInput {
  const scope: Prisma.AlertWhereInput =
    query.scope === 'department'
      ? { author: { department: { equals: user.department.trim(), mode: 'insensitive' } } }
      : { authorId: user.id };
  return {
    ...scope,
    ...(query.status && { status: query.status }),
    ...(query.severity && { severity: query.severity }),
  };
}

/** Severity and status sort in the order the enums are declared (INFO to EMERGENCY, DRAFT first). */
export function historyOrderBy(
  query: Pick<HistoryQuery, 'sort' | 'dir'>,
): Prisma.AlertOrderByWithRelationInput[] {
  const { dir } = query;
  const primary: Prisma.AlertOrderByWithRelationInput =
    query.sort === 'created'
      ? { createdAt: dir }
      : query.sort === 'severity'
        ? { severity: dir }
        : query.sort === 'status'
          ? { status: dir }
          : { updatedAt: dir };
  // A stable tie-break so alerts with the same severity or status keep a predictable order.
  return [primary, { updatedAt: 'desc' }, { id: 'asc' }];
}
