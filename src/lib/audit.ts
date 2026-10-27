import 'server-only';
import type { Prisma } from '@/generated/prisma/client';
import { db } from './db';

/** 'system' is the portal acting on its own, e.g. publishing a scheduled alert. */
type Actor = { id: string; name: string } | 'resident' | 'system';

const ACTOR_LABEL = { resident: 'Resident', system: 'Portal (automatic)' };

/** Record who did what. Pass a transaction client to log atomically with the change. */
export async function logAudit(
  actor: Actor,
  action: string,
  detail: string,
  client: Prisma.TransactionClient = db,
): Promise<void> {
  await client.auditEntry.create({
    data: {
      actorId: typeof actor === 'string' ? null : actor.id,
      actorLabel: typeof actor === 'string' ? ACTOR_LABEL[actor] : actor.name,
      action,
      detail: detail.slice(0, 500),
    },
  });
}
