'use server';

import { refresh, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Prisma } from '@/generated/prisma/client';
import { logAudit } from '@/lib/audit';
import { AuthError, requireUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { PUBLIC_ALERTS_TAG } from '@/lib/public-data';
import { alertHtmlToText, sanitizeAlertHtml } from '@/lib/sanitize';
import { alertSchema, firstError, type ActionState } from '@/lib/validation';

// ---------- Publisher ----------

export async function saveAlert(_prev: ActionState, formData: FormData): Promise<ActionState> {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    return { error: (e as AuthError).message };
  }

  const parsed = alertSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { id, intent, ...fields } = parsed.data;
  const bodyHtml = sanitizeAlertHtml(fields.bodyHtml);
  const submit = intent === 'submit';

  if (submit) {
    if (!alertHtmlToText(bodyHtml) && !bodyHtml.includes('<img'))
      return { error: 'Write a message before submitting.' };
    if (fields.expiresAt && fields.expiresAt.getTime() <= Date.now())
      return { error: 'The expiry time must be in the future.' };
  }
  const category = await db.category.findUnique({ where: { id: fields.categoryId } });
  if (!category) return { error: 'Choose a category.' };

  const data = {
    title: fields.title,
    bodyHtml,
    categoryId: fields.categoryId,
    severity: fields.severity,
    expiresAt: fields.expiresAt,
    status: submit ? ('PENDING' as const) : ('DRAFT' as const),
    reviewNote: null,
  };

  if (id) {
    // Only the author can edit, and only while it is a draft or was sent back.
    const result = await db.alert.updateMany({
      where: { id, authorId: user.id, status: { in: ['DRAFT', 'REJECTED'] } },
      data,
    });
    if (result.count === 0) return { error: 'This alert can no longer be edited.' };
  } else {
    await db.alert.create({ data: { ...data, authorId: user.id } });
  }
  await logAudit(user, submit ? 'Submitted for approval' : 'Saved draft', fields.title);
  redirect(`/publisher?saved=${submit ? 'submitted' : 'draft'}`);
}

export async function deleteDraft(formData: FormData): Promise<void> {
  const user = await requireUser();
  const id = String(formData.get('id'));
  const alert = await db.alert.findFirst({ where: { id, authorId: user.id, status: 'DRAFT' } });
  if (!alert) return;
  await db.alert.delete({ where: { id } });
  await logAudit(user, 'Deleted draft', alert.title);
  refresh();
}

// ---------- Admin ----------

/** Who should be notified about an alert. Emergencies go to everyone. */
function recipientsWhere(alert: {
  severity: string;
  categoryId: string;
}): Prisma.SubscriberWhereInput {
  if (alert.severity === 'EMERGENCY') return {};
  return { emergencyOnly: false, categories: { some: { id: alert.categoryId } } };
}

export async function approveAlert(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(['ADMIN']);
  const id = String(formData.get('id'));

  const outcome = await db.$transaction(async (tx) => {
    // Guarded update: if two admins click at once, only one approval goes through.
    const updated = await tx.alert.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'PUBLISHED', publishedAt: new Date(), reviewedById: admin.id },
    });
    if (updated.count === 0) return null;
    const alert = await tx.alert.findUniqueOrThrow({ where: { id } });
    const recipientCount = await tx.subscriber.count({ where: recipientsWhere(alert) });
    // Queue the notification fan-out instead of sending inline (see Dispatch in schema.prisma).
    await tx.dispatch.create({ data: { alertId: id, recipientCount } });
    await logAudit(admin, 'Approved and published', alert.title, tx);
    return { recipientCount };
  });

  if (!outcome) return { error: 'This alert was already reviewed.' };
  updateTag(PUBLIC_ALERTS_TAG);
  refresh();
  return {
    message: `Published. Notification queued for ${outcome.recipientCount} subscriber${outcome.recipientCount === 1 ? '' : 's'}.`,
  };
}

export async function rejectAlert(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(['ADMIN']);
  const id = String(formData.get('id'));
  const note = String(formData.get('note') ?? '')
    .trim()
    .slice(0, 1000);
  if (!note) return { error: 'Explain what the publisher should change.' };

  const alert = await db.alert.findFirst({ where: { id, status: 'PENDING' } });
  if (!alert) return { error: 'This alert was already reviewed.' };
  await db.alert.update({
    where: { id },
    data: { status: 'REJECTED', reviewNote: note, reviewedById: admin.id },
  });
  await logAudit(admin, 'Requested changes', `${alert.title}: ${note}`);
  refresh();
  return { message: 'Sent back to the publisher.' };
}

export async function archiveAlert(formData: FormData): Promise<void> {
  const admin = await requireUser(['ADMIN']);
  const id = String(formData.get('id'));
  const alert = await db.alert.findFirst({ where: { id, status: 'PUBLISHED' } });
  if (!alert) return;
  await db.alert.update({ where: { id }, data: { status: 'ARCHIVED' } });
  await logAudit(admin, 'Archived', alert.title);
  updateTag(PUBLIC_ALERTS_TAG);
  refresh();
}
