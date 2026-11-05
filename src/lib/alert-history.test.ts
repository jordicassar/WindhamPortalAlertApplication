import { describe, expect, it } from 'vitest';
import {
  DEFAULT_QUERY,
  historyHref,
  historyOrderBy,
  historyWhere,
  parseHistoryQuery,
} from './alert-history';

const user = { id: 'user-1', department: ' Public Works ' };

describe('parseHistoryQuery', () => {
  it('defaults to the publisher’s own alerts, newest update first', () => {
    expect(parseHistoryQuery({})).toEqual(DEFAULT_QUERY);
  });

  it('reads valid values', () => {
    expect(
      parseHistoryQuery({
        scope: 'department',
        sort: 'severity',
        dir: 'asc',
        status: 'PENDING',
        severity: 'EMERGENCY',
      }),
    ).toEqual({
      scope: 'department',
      sort: 'severity',
      dir: 'asc',
      status: 'PENDING',
      severity: 'EMERGENCY',
    });
  });

  it('ignores unknown or malicious values', () => {
    expect(
      parseHistoryQuery({
        scope: 'everyone',
        sort: 'authorId; drop table',
        dir: 'sideways',
        status: 'draft',
        severity: ['nope'],
      }),
    ).toEqual(DEFAULT_QUERY);
  });

  it('uses the first value when a parameter is repeated', () => {
    expect(parseHistoryQuery({ status: ['DRAFT', 'PENDING'] }).status).toBe('DRAFT');
  });
});

describe('historyWhere', () => {
  it('limits "mine" to the publisher’s own alerts', () => {
    expect(historyWhere(user, DEFAULT_QUERY)).toEqual({ authorId: 'user-1' });
  });

  it('limits "department" to authors in the same department, ignoring case', () => {
    const where = historyWhere(user, { ...DEFAULT_QUERY, scope: 'department' });
    expect(where).toEqual({
      author: { department: { equals: 'Public Works', mode: 'insensitive' } },
    });
    // Never a filter that could match another department.
    expect(JSON.stringify(where)).not.toContain('authorId');
  });

  it('adds status and severity filters on top of the scope', () => {
    expect(historyWhere(user, { scope: 'mine', status: 'DRAFT', severity: 'INFO' })).toEqual({
      authorId: 'user-1',
      status: 'DRAFT',
      severity: 'INFO',
    });
  });
});

describe('historyOrderBy', () => {
  it('sorts by the chosen column with a stable tie-break', () => {
    expect(historyOrderBy({ sort: 'severity', dir: 'desc' })).toEqual([
      { severity: 'desc' },
      { updatedAt: 'desc' },
      { id: 'asc' },
    ]);
    expect(historyOrderBy({ sort: 'created', dir: 'asc' })[0]).toEqual({ createdAt: 'asc' });
    expect(historyOrderBy({ sort: 'status', dir: 'asc' })[0]).toEqual({ status: 'asc' });
    expect(historyOrderBy({ sort: 'updated', dir: 'desc' })[0]).toEqual({ updatedAt: 'desc' });
  });
});

describe('historyHref', () => {
  it('leaves out defaults', () => {
    expect(historyHref(DEFAULT_QUERY)).toBe('/publisher');
  });

  it('keeps the current view and applies changes', () => {
    const q = { ...DEFAULT_QUERY, scope: 'department' as const, status: 'PENDING' as const };
    expect(historyHref(q, { sort: 'severity', dir: 'asc' })).toBe(
      '/publisher?scope=department&sort=severity&dir=asc&status=PENDING',
    );
  });

  it('clears a filter when set to null', () => {
    expect(historyHref({ ...DEFAULT_QUERY, status: 'DRAFT' }, { status: null })).toBe('/publisher');
  });
});
