import type { Prisma } from '@/generated/prisma/client';
import { fromEasternInput, toEasternInput } from './format';

/** Search and filters for the admin audit log, read from the page's URL. */

export const AUDIT_PAGE_SIZE = 50;

export type AuditFilters = {
  /** Text to find in who, action or detail. */
  q: string;
  /** Exact actorLabel ("Resident", "Portal (automatic)" or a staff member's name). */
  who: string;
  action: string;
  /** Eastern dates as YYYY-MM-DD; both ends are inclusive. */
  from: string;
  to: string;
  page: number;
};

type SearchParams = Record<string, string | string[] | undefined>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function readAuditFilters(params: SearchParams): AuditFilters {
  const one = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value)?.trim() ?? '';
  };
  const date = (key: string) => {
    const value = one(key);
    // Round-trip to reject dates that don't exist, like 2026-02-31.
    const valid =
      DATE.test(value) && toEasternInput(fromEasternInput(`${value}T00:00`)) === `${value}T00:00`;
    return valid ? value : '';
  };
  const page = Number.parseInt(one('page'), 10);
  return {
    q: one('q').slice(0, 100),
    who: one('who').slice(0, 200),
    action: one('action').slice(0, 200),
    from: date('from'),
    to: date('to'),
    page: Number.isSafeInteger(page) && page > 1 ? page : 1,
  };
}

export function auditWhere(f: AuditFilters): Prisma.AuditEntryWhereInput {
  const and: Prisma.AuditEntryWhereInput[] = [];
  if (f.q) {
    const contains = { contains: f.q, mode: 'insensitive' } as const;
    and.push({ OR: [{ actorLabel: contains }, { action: contains }, { detail: contains }] });
  }
  if (f.who) and.push({ actorLabel: f.who });
  if (f.action) and.push({ action: f.action });
  if (f.from) and.push({ at: { gte: fromEasternInput(`${f.from}T00:00`)! } });
  // "To" includes the whole day: everything before midnight Eastern at the start of the next.
  if (f.to) and.push({ at: { lt: fromEasternInput(`${nextDay(f.to)}T00:00`)! } });
  return and.length ? { AND: and } : {};
}

function nextDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** The audit tab's URL with these filters, leaving out empty ones. */
export function auditHref(f: AuditFilters, page = f.page): string {
  const params = new URLSearchParams({ tab: 'audit' });
  for (const key of ['q', 'who', 'action', 'from', 'to'] as const) {
    if (f[key]) params.set(key, f[key]);
  }
  if (page > 1) params.set('page', String(page));
  return `/admin?${params}`;
}
