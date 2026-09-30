import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { AlertArticle } from '@/components/alert-article';
import { ArrowLeftIcon, BellIcon } from '@/components/icons';
import { btn, card } from '@/components/ui';
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
      <Link href="/" className={`${btn('ghost')} -ml-3 mb-4`}>
        <ArrowLeftIcon className="size-5" />
        All alerts
      </Link>
      <Suspense fallback={<p className="text-lg text-muted">Loading alert…</p>}>
        <AlertContent params={params} />
      </Suspense>
      <div
        className={`${card} mt-6 flex flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-6`}
      >
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
            <BellIcon className="size-6" />
          </span>
          <p className="text-lg font-semibold">Want alerts like this sent to you?</p>
        </div>
        <Link href="/#subscribe" className={btn('primary')}>
          Sign up for alerts
        </Link>
      </div>
    </div>
  );
}

async function AlertContent({ params }: Pick<PageProps<'/alerts/[id]'>, 'params'>) {
  // getPublicAlert is cached, so repeat visits from a shared link don't hit the database.
  const alert = await getPublicAlert((await params).id);
  if (!alert) notFound();
  return <AlertArticle alert={alert} mode="full" titleAs="h1" />;
}
