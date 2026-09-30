import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import type { Role } from '@/generated/prisma/enums';
import { db } from './db';
import { readSession } from './session';

/**
 * Data access layer for authentication. Every staff page and every server action
 * calls one of these; the proxy's redirect is only a convenience, not the check.
 */

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  department: string;
  role: Role;
};

/** The signed-in staff member, or null. Deactivated accounts are signed out immediately. */
export const getCurrentUser = cache(async (): Promise<StaffUser | null> => {
  const session = await readSession();
  if (!session) return null;
  return db.user.findFirst({
    where: { id: session.userId, active: true },
    select: { id: true, name: true, email: true, department: true, role: true },
  });
});

/** For pages: redirect to sign-in when there is no session or the role is not allowed. */
export async function requirePageUser(roles: Role[] = ['PUBLISHER', 'ADMIN']): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  if (!roles.includes(user.role)) redirect('/');
  return user;
}

export class AuthError extends Error {}

/** For server actions and route handlers: throw instead of redirecting. */
export async function requireUser(roles: Role[] = ['PUBLISHER', 'ADMIN']): Promise<StaffUser> {
  const user = await getCurrentUser();
  if (!user || !roles.includes(user.role))
    throw new AuthError('You do not have permission to do that.');
  return user;
}
