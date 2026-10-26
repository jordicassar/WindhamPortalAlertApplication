'use server';

import { refresh, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { logAudit } from '@/lib/audit';
import { AuthError, requireUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { PUBLIC_ALERTS_TAG } from '@/lib/public-data';
import { publishAlert } from '@/lib/publishing';
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
    if (fields.publishAt && fields.publishAt.getTime() <= Date.now())
      return { error: 'The publish time must be in the future, or left empty.' };
    if (fields.expiresAt && fields.expiresAt.getTime() <= Date.now())
      return { error: 'The expiry time must be in the future.' };
    if (fields.publishAt && fields.expiresAt && fields.expiresAt <= fields.publishAt)
      return { error: 'The expiry time must be after the publish time.' };
  }
  const category = await db.category.findUnique({ where: { id: fields.categoryId } });
  if (!category) return { error: 'Choose a category.' };

  const data = {
    title: fields.title,
    bodyHtml,
    categoryId: fields.categoryId,
    severity: fields.severity,
    publishAt: fields.publishAt,
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

export async function approveAlert(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const admin = await requireUser(['ADMIN']);
  const id = String(formData.get('id'));
  const now = new Date();

  const pending = await db.alert.findFirst({ where: { id, status: 'PENDING' } });
  if (!pending) return { error: 'This alert was already reviewed.' };

  // A future publish time: approve now, and the scheduled job publishes it then.
  // A publish time that passed while it waited for review publishes immediately.
  if (pending.publishAt && pending.publishAt > now) {
    // Guarded update: if two admins click at once, only one approval goes through.
    const updated = await db.alert.updateMany({
      where: { id, status: 'PENDING' },
      data: { status: 'SCHEDULED', reviewedById: admin.id },
    });
    if (updated.count === 0) return { error: 'This alert was already reviewed.' };
    const when = formatDateTime(pending.publishAt);
    await logAudit(admin, 'Approved and scheduled', `${pending.title}: publishes ${when}`);
    refresh();
    return { message: `Approved. It will be published ${when} (Eastern).` };
  }

  const outcome = await db.$transaction(async (tx) => {
    const published = await publishAlert(tx, id, 'PENDING', {
      publishedAt: now,
      reviewedById: admin.id,
    });
    if (published) await logAudit(admin, 'Approved and published', published.alert.title, tx);
    return published;
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
  // Archiving a scheduled alert cancels it; residents never see it because it has no publishedAt.
  const alert = await db.alert.findFirst({
    where: { id, status: { in: ['PUBLISHED', 'SCHEDULED'] } },
  });
  if (!alert) return;
  const updated = await db.alert.updateMany({
    where: { id, status: alert.status },
    data: { status: 'ARCHIVED' },
  });
  if (updated.count === 0) return;
  await logAudit(
    admin,
    alert.status === 'SCHEDULED' ? 'Cancelled scheduled alert' : 'Archived',
    alert.title,
  );
  updateTag(PUBLIC_ALERTS_TAG);
  refresh();
}
