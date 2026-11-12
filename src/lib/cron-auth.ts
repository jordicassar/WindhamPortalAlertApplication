import { createHash, timingSafeEqual } from 'node:crypto';

export function isAuthorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;

  const digest = (value: string) => createHash('sha256').update(value).digest();
  const expected = digest(secret);
  const actual = digest(header);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
