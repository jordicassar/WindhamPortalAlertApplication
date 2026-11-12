import { afterEach, describe, expect, it } from 'vitest';
import { isAuthorized } from '@/lib/cron-auth';

describe('cron secret authorization', () => {
  const original = process.env.CRON_SECRET;

  afterEach(() => {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  });

  it('accepts the configured secret and rejects mismatches', () => {
    process.env.CRON_SECRET = 'a-very-long-and-random-cron-secret';
    expect(isAuthorized('a-very-long-and-random-cron-secret')).toBe(true);
    expect(isAuthorized('wrong-secret')).toBe(false);
  });

  it('requires both a secret and a header', () => {
    delete process.env.CRON_SECRET;
    expect(isAuthorized('anything')).toBe(false);
    expect(isAuthorized(null)).toBe(false);
  });
});
