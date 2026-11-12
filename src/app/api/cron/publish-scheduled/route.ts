import { revalidateTag } from 'next/cache';
import { isAuthorized } from '@/lib/cron-auth';
import { PUBLIC_ALERTS_TAG } from '@/lib/public-data';
import { publishDueAlerts } from '@/lib/publishing';

/**
 * Publishes approved alerts whose publish time has come. Called every few minutes
 * by .github/workflows/publish-scheduled.yml with an Authorization header set to
 * the same shared secret as CRON_SECRET, so the endpoint can later be switched to
 * a hosted cron provider without changing the app logic.
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
