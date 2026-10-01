'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { isHoneypotFilled } from '@/components/honeypot-field';
import { logAudit } from '@/lib/audit';
import { db } from '@/lib/db';
import { clientIp, LIMITS, rateLimit, retryMessage } from '@/lib/rate-limit';
import { createSession, deleteSession } from '@/lib/session';
import { firstError, loginSchema, type ActionState } from '@/lib/validation';

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = '$2b$12$hc.IfZIY2e1pLo8TB8cKTej3Syr9pHv5uOIRKxzlZe5H7n7u9yKPC';

const INVALID_LOGIN = 'That email and password combination is not recognized.';

export async function login(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (isHoneypotFilled(formData)) return { error: INVALID_LOGIN };

  // Limit guessing both from one address and against one account. The account
  // limit means an attacker spread across many IPs still only gets a few tries.
  const ipLimit = await rateLimit('login-ip', await clientIp(), LIMITS.loginIp);
  if (!ipLimit.ok) return { error: retryMessage(ipLimit.retryAfterSeconds) };

  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const accountLimit = await rateLimit('login-account', parsed.data.email, LIMITS.loginAccount);
  if (!accountLimit.ok) return { error: retryMessage(accountLimit.retryAfterSeconds) };

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  const valid = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid || !user.active) {
    return { error: INVALID_LOGIN };
  }

  await createSession({ userId: user.id, role: user.role });
  await logAudit(user, 'Signed in', user.email);
  redirect(user.role === 'ADMIN' ? '/admin' : '/publisher');
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect('/');
}
