import { createHash, timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { PUBLIC_ALERTS_TAG } from '@/lib/public-data';
import { publishDueAlerts } from '@/lib/publishing';

/**
 * Publishes approved alerts whose publish time has come. Called every few minutes
 * by .github/workflows/publish-scheduled.yml with `Authorization: Bearer <CRON_SECRET>`
 * (the same header Vercel Cron sends, so it can be switched to Vercel Cron later).
 */
export async function GET(request: Request) {
  if (!isAuthorized(request.headers.get('authorization'))) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const published = await publishDueAlerts();
  // Drop the cached feed now so residents see the alert on their next visit.
  if (published > 0) revalidateTag(PUBLIC_ALERTS_TAG, { expire: 0 });
  return Response.json({ published });
}

function isAuthorized(header: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || !header) return false;
  // Compare hashes so the check takes the same time whatever the header's length.
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}
