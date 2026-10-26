import { describe, expect, it } from 'vitest';
import { alertSchema, loginSchema, subscribeSchema } from './validation';

const CATEGORY = 'cmunk12kh000145c8f0vbp3ci'; // any cuid

const subscription = (overrides: Record<string, unknown> = {}) => ({
  email: 'resident@example.com',
  phone: undefined,
  viaEmail: true,
  viaSms: false,
  emergencyOnly: false,
  categoryIds: [CATEGORY],
  ...overrides,
});

describe('subscribeSchema', () => {
  it('accepts a normal email subscription', () => {
    expect(subscribeSchema.safeParse(subscription()).success).toBe(true);
  });

  it('requires at least one way to reach the resident', () => {
    const result = subscribeSchema.safeParse(subscription({ viaEmail: false }));
    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toMatch(/email, text message, or both/);
  });

  it('rejects an invalid email address', () => {
    expect(subscribeSchema.safeParse(subscription({ email: 'not-an-email' })).success).toBe(false);
  });

  it('normalizes US phone numbers to 10 digits', () => {
    const result = subscribeSchema.safeParse(
      subscription({ viaSms: true, phone: '+1 (860) 555-0123' }),
    );
    expect(result.success).toBe(true);
    expect(result.data?.phone).toBe('8605550123');
  });

  it('rejects phone numbers that are not 10 digits', () => {
    expect(
      subscribeSchema.safeParse(subscription({ viaSms: true, phone: '555-0123' })).success,
    ).toBe(false);
  });

  it('needs topics unless the resident only wants emergencies', () => {
    expect(subscribeSchema.safeParse(subscription({ categoryIds: [] })).success).toBe(false);
    expect(
      subscribeSchema.safeParse(subscription({ categoryIds: [], emergencyOnly: true })).success,
    ).toBe(true);
  });
});

describe('alertSchema', () => {
  const alert = (overrides: Record<string, unknown> = {}) => ({
    id: '',
    title: '  Parking ban tonight  ',
    bodyHtml: '<p>Move your car.</p>',
    categoryId: CATEGORY,
    severity: 'EMERGENCY',
    publishAt: '',
    expiresAt: '',
    intent: 'submit',
    ...overrides,
  });

  it('trims the title and treats an empty id as a new alert', () => {
    const result = alertSchema.safeParse(alert());
    expect(result.success).toBe(true);
    expect(result.data?.title).toBe('Parking ban tonight');
    expect(result.data?.id).toBeUndefined();
    expect(result.data?.publishAt).toBeNull();
    expect(result.data?.expiresAt).toBeNull();
  });

  it('treats a missing publish time as publish on approval', () => {
    const result = alertSchema.safeParse(alert({ publishAt: undefined }));
    expect(result.data?.publishAt).toBeNull();
  });

  it('reads the publish and expiry times as Eastern time', () => {
    const result = alertSchema.safeParse(
      alert({ publishAt: '2026-07-04T06:00', expiresAt: '2026-12-04T18:30' }),
    );
    expect(result.data?.publishAt?.toISOString()).toBe('2026-07-04T10:00:00.000Z'); // EDT
    expect(result.data?.expiresAt?.toISOString()).toBe('2026-12-04T23:30:00.000Z'); // EST
  });

  it('rejects an empty title, unknown severity and malformed times', () => {
    expect(alertSchema.safeParse(alert({ title: '   ' })).success).toBe(false);
    expect(alertSchema.safeParse(alert({ severity: 'URGENT' })).success).toBe(false);
    expect(alertSchema.safeParse(alert({ expiresAt: 'next friday' })).success).toBe(false);
    const badPublish = alertSchema.safeParse(alert({ publishAt: 'tomorrow 6am' }));
    expect(badPublish.error?.issues[0].message).toBe('Enter a valid publish time.');
  });

  it('rejects titles over 120 characters', () => {
    expect(alertSchema.safeParse(alert({ title: 'x'.repeat(121) })).success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('normalizes the email to lowercase', () => {
    const result = loginSchema.safeParse({ email: '  Admin@Windham.Example ', password: 'pw' });
    expect(result.data?.email).toBe('admin@windham.example');
  });

  it('requires a password', () => {
    expect(loginSchema.safeParse({ email: 'admin@windham.example', password: '' }).success).toBe(
      false,
    );
  });
});
