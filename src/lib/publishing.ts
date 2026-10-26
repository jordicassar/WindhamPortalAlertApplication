import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import { logAudit } from './audit';
import { db } from './db';

/** Who should be notified about an alert. Emergencies go to everyone. */
function recipientsWhere(alert: {
  severity: string;
  categoryId: string;
}): Prisma.SubscriberWhereInput {
  if (alert.severity === 'EMERGENCY') return {};
  return { emergencyOnly: false, categories: { some: { id: alert.categoryId } } };
}

/**
 * Make an alert live and queue its notifications, inside the caller's transaction.
 * Guarded update: returns null if the alert has left the `from` status in the
 * meantime (e.g. two admins clicked at once, or it was cancelled).
 */
export async function publishAlert(
  tx: Prisma.TransactionClient,
  id: string,
  from: 'PENDING' | 'SCHEDULED',
  data: { publishedAt: Date; reviewedById?: string },
) {
  const updated = await tx.alert.updateMany({
    where: { id, status: from },
    data: { status: 'PUBLISHED', ...data },
  });
  if (updated.count === 0) return null;
  const alert = await tx.alert.findUniqueOrThrow({ where: { id } });
  const recipientCount = await tx.subscriber.count({ where: recipientsWhere(alert) });
  // Queue the notification fan-out instead of sending inline (see Dispatch in schema.prisma).
  await tx.dispatch.create({ data: { alertId: id, recipientCount } });
  return { alert, recipientCount };
}

/**
 * Publish every approved alert whose publish time has come. Called by the
 * scheduled job (src/app/api/cron/publish-scheduled). Returns how many went live.
 */
export async function publishDueAlerts(now = new Date()): Promise<number> {
  const due = await db.alert.findMany({
    where: { status: 'SCHEDULED', publishAt: { lte: now } },
    orderBy: { publishAt: 'asc' },
    select: { id: true, publishAt: true },
  });

  let published = 0;
  for (const { id, publishAt } of due) {
    const result = await db.$transaction(async (tx) => {
      // Stamp the time the publisher asked for, so the feed order doesn't depend on when the job ran.
      const done = await publishAlert(tx, id, 'SCHEDULED', { publishedAt: publishAt ?? now });
      if (done) await logAudit('system', 'Published as scheduled', done.alert.title, tx);
      return done;
    });
    if (result) published++;
  }
  return published;
}
