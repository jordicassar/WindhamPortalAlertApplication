'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { logAudit } from '@/lib/audit';
import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';
import { firstError, loginSchema, type ActionState } from '@/lib/validation';

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = '$2b$12$hc.IfZIY2e1pLo8TB8cKTej3Syr9pHv5uOIRKxzlZe5H7n7u9yKPC';

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) {
    return { error: 'That email and password combination is not recognized.' };
  }

  await createSession({ userId: user.id, role: user.role });
  await logAudit(user, 'Signed in', user.email);
  redirect(user.role === 'ADMIN' ? '/admin' : '/publisher');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/');
}
