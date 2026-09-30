'use server';

import bcrypt from 'bcryptjs';
import { refresh, updateTag } from 'next/cache';
import { logAudit } from '@/lib/audit';
import { requireUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { CATEGORIES_TAG } from '@/lib/public-data';
import { categorySchema, firstError, staffSchema, type ActionState } from '@/lib/validation';

export async function createStaff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(['ADMIN']);
  const parsed = staffSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { password, ...fields } = parsed.data;

  if (await db.user.findUnique({ where: { email: fields.email } }))
    return { error: 'An account with that email already exists.' };

  await db.user.create({ data: { ...fields, passwordHash: await bcrypt.hash(password, 12) } });
  await logAudit(admin, 'Added staff account', `${fields.name} (${fields.role.toLowerCase()})`);
  refresh();
  return { message: `${fields.name} can now sign in with the temporary password you set.` };
}

export async function setStaffActive(formData: FormData): Promise<void> {
  const admin = await requireUser(['ADMIN']);
  const id = String(formData.get('id'));
  const active = formData.get('active') === 'true';
  const user = await db.user.findUnique({ where: { id } });
  if (!user) return;

  if (!active && user.role === 'ADMIN') {
    const admins = await db.user.count({ where: { role: 'ADMIN', active: true } });
    if (admins <= 1) return; // Never lock everyone out.
  }
  await db.user.update({ where: { id }, data: { active } });
  await logAudit(
    admin,
    active ? 'Reactivated staff account' : 'Deactivated staff account',
    user.name,
  );
  refresh();
}

export async function createCategory(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(['ADMIN']);
  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };

  const exists = await db.category.findFirst({
    where: { name: { equals: parsed.data.name, mode: 'insensitive' } },
  });
  if (exists) return { error: 'That category already exists.' };

  await db.category.create({ data: parsed.data });
  await logAudit(admin, 'Added category', parsed.data.name);
  updateTag(CATEGORIES_TAG);
  refresh();
  return { message: 'Category added.' };
}
