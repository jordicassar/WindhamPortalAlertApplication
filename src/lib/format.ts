import type { AlertStatus, Severity } from '@/generated/prisma/enums';

/** Display helpers shared by server and client components. */

// Servers run in UTC; the town runs on Eastern time, so every time shown or entered is Eastern.
export const TIME_ZONE = 'America/New_York';

/** Milliseconds that Eastern time is ahead of UTC at the given instant (negative; DST-aware). */
function easternOffset(instant: Date): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(instant);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  );
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** An instant as the value of <input type="datetime-local">, in Eastern time. */
export function toEasternInput(value: Date | string | null | undefined): string {
  if (!value) return '';
  const instant = new Date(value);
  return new Date(instant.getTime() + easternOffset(instant)).toISOString().slice(0, 16);
}

/** Read a datetime-local value ("2026-12-01T18:30") as Eastern time. */
export function fromEasternInput(local: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [, y, mo, d, h, mi] = match.map(Number);
  const wallAsUtc = Date.UTC(y, mo - 1, d, h, mi);
  // Apply the offset, then re-check it at the result in case the guess crossed a DST change.
  let instant = new Date(wallAsUtc - easternOffset(new Date(wallAsUtc)));
  instant = new Date(wallAsUtc - easternOffset(instant));
  return instant;
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    timeZone: TIME_ZONE,
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  INFO: 'Information',
  ADVISORY: 'Advisory',
  EMERGENCY: 'Emergency',
};

export const SEVERITY_HINT: Record<Severity, string> = {
  INFO: 'General news. Sent only to residents subscribed to this category.',
  ADVISORY: 'Residents should take note or act: closures, delays, boil-water notices.',
  EMERGENCY:
    'Immediate risk to safety. Shown as a banner on the site and sent to every subscriber, whatever topics they chose.',
};

export const STATUS_LABEL: Record<AlertStatus, string> = {
  DRAFT: 'Draft',
  PENDING: 'Awaiting approval',
  PUBLISHED: 'Published',
  REJECTED: 'Changes requested',
  ARCHIVED: 'Archived',
};

export function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}
