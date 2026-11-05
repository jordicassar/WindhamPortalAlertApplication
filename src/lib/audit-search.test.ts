import { describe, expect, it } from 'vitest';
import { auditHref, auditWhere, readAuditFilters, type AuditFilters } from './audit-search';

const none: AuditFilters = { q: '', who: '', action: '', from: '', to: '', page: 1 };

describe('readAuditFilters', () => {
  it('reads and trims every filter', () => {
    expect(
      readAuditFilters({
        q: ' boil ',
        who: 'Admin User',
        action: 'Archived',
        from: '2026-11-01',
        to: '2026-11-05',
        page: '3',
      }),
    ).toEqual({
      q: 'boil',
      who: 'Admin User',
      action: 'Archived',
      from: '2026-11-01',
      to: '2026-11-05',
      page: 3,
    });
  });

  it('falls back to no filters and the first page for missing or bad values', () => {
    expect(readAuditFilters({})).toEqual(none);
    expect(readAuditFilters({ from: '11/01/2026', to: '2026-02-31', page: '-2' })).toEqual(none);
    expect(readAuditFilters({ page: 'abc' }).page).toBe(1);
    expect(readAuditFilters({ page: '1e400' }).page).toBe(1);
  });

  it('takes the first value when a parameter repeats', () => {
    expect(readAuditFilters({ q: ['first', 'second'] }).q).toBe('first');
  });

  it('caps the search text', () => {
    expect(readAuditFilters({ q: 'a'.repeat(500) }).q).toHaveLength(100);
  });
});

describe('auditWhere', () => {
  it('matches everything with no filters', () => {
    expect(auditWhere(none)).toEqual({});
  });

  it('searches who, action and detail, ignoring case', () => {
    const contains = { contains: 'boil', mode: 'insensitive' };
    expect(auditWhere({ ...none, q: 'boil' })).toEqual({
      AND: [{ OR: [{ actorLabel: contains }, { action: contains }, { detail: contains }] }],
    });
  });

  it('includes the whole of both Eastern days in a date range', () => {
    // Midnight EDT on Oct 31 is 04:00 UTC; midnight EST after Nov 5 is 05:00 UTC Nov 6.
    expect(auditWhere({ ...none, from: '2026-10-31', to: '2026-11-05' })).toEqual({
      AND: [
        { at: { gte: new Date('2026-10-31T04:00:00Z') } },
        { at: { lt: new Date('2026-11-06T05:00:00Z') } },
      ],
    });
  });

  it('rolls the end of a range over month ends', () => {
    expect(auditWhere({ ...none, to: '2026-12-31' })).toEqual({
      AND: [{ at: { lt: new Date('2027-01-01T05:00:00Z') } }],
    });
  });

  it('combines filters', () => {
    expect(auditWhere({ ...none, who: 'Resident', action: 'Subscribed' })).toEqual({
      AND: [{ actorLabel: 'Resident' }, { action: 'Subscribed' }],
    });
  });
});

describe('auditHref', () => {
  it('keeps the filters and leaves out empty ones and page 1', () => {
    expect(auditHref({ ...none, q: 'water main', who: 'Resident' })).toBe(
      '/admin?tab=audit&q=water+main&who=Resident',
    );
    expect(auditHref({ ...none, action: 'Archived' }, 2)).toBe(
      '/admin?tab=audit&action=Archived&page=2',
    );
  });
});
