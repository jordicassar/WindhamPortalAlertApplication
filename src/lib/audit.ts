import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import { db } from './db';

type Actor = { id: string; name: string } | 'resident';

/** Record who did what. Pass a transaction client to log atomically with the change. */
export async function logAudit(
  actor: Actor,
  action: string,
  detail: string,
  client: Prisma.TransactionClient = db,
): Promise<void> {
  await client.auditEntry.create({
    data: {
      actorId: actor === 'resident' ? null : actor.id,
      actorLabel: actor === 'resident' ? 'Resident' : actor.name,
      action,
      detail: detail.slice(0, 500),
    },
  });
}
