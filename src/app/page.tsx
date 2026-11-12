import { AlertFeed } from '@/components/alert-feed';
import { HomeHero } from '@/components/home-hero';
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
      <HomeHero emergencies={emergencies} active={live.length} />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AlertFeed live={live} past={past} categories={categories} />
        <SubscribeForm categories={categories} />
      </div>
    </>
  );
}
