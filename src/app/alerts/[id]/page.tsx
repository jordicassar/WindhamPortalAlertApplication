import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AlertArticle } from '@/components/alert-article';
import { truncate } from '@/lib/format';
import { getPublicAlert } from '@/lib/public-data';

/** Shareable page for one alert. This is the link that goes out in emails and texts. */

export async function generateMetadata({ params }: PageProps<'/alerts/[id]'>): Promise<Metadata> {
  const alert = await getPublicAlert((await params).id);
  if (!alert) return { title: 'Alert not found' };
  return { title: alert.title, description: truncate(alert.bodyText, 160) };
}

export default function AlertPage({ params }: PageProps<'/alerts/[id]'>) {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/" className="mb-4 inline-block text-sm font-semibold text-brand underline">
        ← All alerts
      </Link>
      <Suspense fallback={<p className="text-muted">Loading alert…</p>}>
        <AlertContent params={params} />
      </Suspense>
    </div>
  );
}

async function AlertContent({ params }: Pick<PageProps<'/alerts/[id]'>, 'params'>) {
  // getPublicAlert is cached, so repeat visits from a shared link don't hit the database.
  const alert = await getPublicAlert((await params).id);
  if (!alert) notFound();
  return <AlertArticle alert={alert} mode="full" />;
}
