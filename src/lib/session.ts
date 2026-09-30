import 'server-only';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  sessionKey,
  verifySessionToken,
  type SessionPayload,
} from './session-cookie';

/** Stateless staff session: a signed, HTTP-only cookie. No session store to scale. */

const SESSION_HOURS = 8;

export async function createSession(payload: SessionPayload): Promise<void> {
  const expires = new Date(Date.now() + SESSION_HOURS * 3600_000);
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expires)
    .sign(sessionKey());
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires,
  });
}

export async function readSession(): Promise<SessionPayload | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
