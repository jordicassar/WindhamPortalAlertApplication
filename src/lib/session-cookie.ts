import { jwtVerify } from 'jose';
import type { Role } from '@/generated/prisma/enums';

/**
 * Session cookie name and token verification. Kept free of server-only imports
 * so the proxy can use it too.
 */

export const SESSION_COOKIE = 'wcn_session';

export interface SessionPayload {
  userId: string;
  role: Role;
}

export function sessionKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('SESSION_SECRET must be set to at least 32 characters.');
  }
  return new TextEncoder().encode(secret);
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, sessionKey(), { algorithms: ['HS256'] });
    if (typeof payload.userId !== 'string') return null;
    return { userId: payload.userId, role: payload.role as Role };
  } catch {
    return null;
  }
}
