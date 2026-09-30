import Link from 'next/link';
import { AlertFeed } from '@/components/alert-feed';
import { SubscribeForm } from '@/components/subscribe-form';
import { getCategories, getPublicFeed } from '@/lib/public-data';

/**
 * Residents' home page. Everything here comes from cached reads, so the page is
 * prerendered and served from the CDN. It is regenerated when staff publish or
 * archive an alert, and at least every minute.
 */
export default async function HomePage() {
  const [{ live, past }, categories] = await Promise.all([getPublicFeed(), getCategories()]);
  const emergencies = live.filter((a) => a.severity === 'EMERGENCY');

  return (
    <>
      {emergencies.map((a) => (
        <div
          key={a.id}
          role="alert"
          className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emergency px-4 py-3 text-white dark:bg-[#8f1d17]"
        >
          <span>
            <strong>EMERGENCY:</strong> {a.title}
          </span>
          <Link href={`/alerts/${a.id}`} className="font-semibold underline">
            Read more
          </Link>
        </div>
      ))}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
        <AlertFeed live={live} past={past} categories={categories} />
        <SubscribeForm categories={categories} />
      </div>
    </>
  );
}
