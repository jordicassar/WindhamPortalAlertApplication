import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertArticle } from '@/components/alert-article';
import { AlertPageShell } from '@/components/resident-pages';
import { truncate } from '@/lib/format';
import { getPublicAlert } from '@/lib/public-data';

/** Shareable page for one alert. This is the link that goes out in emails and texts. */

export async function generateMetadata({ params }: PageProps<'/alerts/[id]'>): Promise<Metadata> {
  const alert = await getPublicAlert((await params).id);
  if (!alert) return { title: 'Alert not found' };
  return { title: alert.title, description: truncate(alert.bodyText, 160) };
}

export default async function AlertPage({ params }: PageProps<'/alerts/[id]'>) {
  // getPublicAlert is cached, so repeat visits from a shared link don't hit the database.
  const alert = await getPublicAlert((await params).id);
  if (!alert) notFound();
  return (
    <AlertPageShell>
      <AlertArticle alert={alert} mode="full" titleAs="h1" />
    </AlertPageShell>
  );
}
