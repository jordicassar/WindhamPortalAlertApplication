import 'server-only';

/**
 * Server-side check of a Cloudflare Turnstile token (the "are you human" widget).
 * https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 *
 * Turned off until TURNSTILE_SECRET_KEY is set, so local development and the
 * sandbox keep working before the town has a Cloudflare account.
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: FormDataEntryValue | null,
  ip: string,
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip !== 'unknown') body.set('remoteip', ip);
    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
      cache: 'no-store',
    });
    const result = (await res.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!result.success) console.warn('Turnstile rejected a submission', result['error-codes']);
    return result.success === true;
  } catch (err) {
    // If Cloudflare itself is unreachable, let residents through rather than block
    // sign-ups during an outage. Rate limiting still applies.
    console.error('Turnstile verification unavailable; allowing request', err);
    return true;
  }
}
