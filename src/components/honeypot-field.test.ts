import { describe, expect, it } from 'vitest';
import { HONEYPOT_FIELD, isHoneypotFilled } from './honeypot-field';

const form = (value?: string) => {
  const data = new FormData();
  data.set('email', 'resident@example.com');
  if (value !== undefined) data.set(HONEYPOT_FIELD, value);
  return data;
};

describe('isHoneypotFilled', () => {
  it('lets real submissions through (field missing or empty)', () => {
    expect(isHoneypotFilled(form())).toBe(false);
    expect(isHoneypotFilled(form(''))).toBe(false);
    expect(isHoneypotFilled(form('   '))).toBe(false);
  });

  it('flags submissions where a bot filled the hidden field', () => {
    expect(isHoneypotFilled(form('http://spam.example'))).toBe(true);
  });
});
