import { describe, expect, it } from 'vitest';
import { formatDateTime, fromEasternInput, toEasternInput, truncate } from './format';

// Expiry times are entered and shown in Eastern time no matter where the server or browser is.
describe('fromEasternInput', () => {
  it('reads winter times as EST (UTC-5)', () => {
    expect(fromEasternInput('2026-12-04T18:30')?.toISOString()).toBe('2026-12-04T23:30:00.000Z');
  });

  it('reads summer times as EDT (UTC-4)', () => {
    expect(fromEasternInput('2026-07-04T12:00')?.toISOString()).toBe('2026-07-04T16:00:00.000Z');
  });

  it('handles the days daylight saving time starts and ends', () => {
    // Clocks spring forward at 2 AM on Mar 8, 2026 and fall back at 2 AM on Nov 1, 2026.
    expect(fromEasternInput('2026-03-08T12:00')?.toISOString()).toBe('2026-03-08T16:00:00.000Z');
    expect(fromEasternInput('2026-11-01T12:00')?.toISOString()).toBe('2026-11-01T17:00:00.000Z');
  });

  it('rejects malformed input', () => {
    expect(fromEasternInput('')).toBeNull();
    expect(fromEasternInput('tomorrow at noon')).toBeNull();
    expect(fromEasternInput('2026-12-04')).toBeNull();
  });
});

describe('toEasternInput', () => {
  it('shows an instant as Eastern wall-clock time', () => {
    expect(toEasternInput('2026-12-04T23:30:00Z')).toBe('2026-12-04T18:30');
    expect(toEasternInput('2026-07-04T16:00:00Z')).toBe('2026-07-04T12:00');
  });

  it('round-trips with fromEasternInput', () => {
    for (const local of ['2026-01-15T08:05', '2026-06-30T23:59', '2026-11-01T12:00']) {
      expect(toEasternInput(fromEasternInput(local))).toBe(local);
    }
  });

  it('returns an empty string for no value', () => {
    expect(toEasternInput(null)).toBe('');
    expect(toEasternInput(undefined)).toBe('');
  });
});

describe('formatDateTime', () => {
  it('formats in Eastern time', () => {
    const text = formatDateTime('2026-12-04T23:30:00Z');
    expect(text).toContain('Dec 4, 2026');
    expect(text).toContain('6:30');
    expect(text).toContain('PM');
  });

  it('returns an empty string for no value', () => {
    expect(formatDateTime(null)).toBe('');
  });
});

describe('truncate', () => {
  it('leaves short text alone and shortens long text with an ellipsis', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('a long sentence here', 10)).toBe('a long se…');
    expect(truncate('a long sentence here', 10)).toHaveLength(10);
  });
});
