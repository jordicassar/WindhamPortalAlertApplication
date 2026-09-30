import Link from 'next/link';
import { AlertFeed } from '@/components/alert-feed';
import { ArrowRightIcon, BellIcon, CheckCircleIcon, SirenIcon } from '@/components/icons';
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
      <section className="hero full-bleed -mt-8 mb-8 text-white">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-9 sm:px-6 sm:pb-12 sm:pt-11">
          <p className="text-base font-semibold uppercase tracking-wider text-white/75">
            Town of Windham
          </p>
          <h1 className="mt-2 max-w-3xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Stay informed about what&rsquo;s happening in Windham
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/85 sm:text-xl">
            Emergency notices, road and school closures, and community news from town staff.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <StatusPill emergencies={emergencies.length} active={live.length} />
            <a
              href="#subscribe"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-base font-semibold text-[#0e2b4b] shadow-md transition-colors hover:bg-[#e5eef9]"
            >
              <BellIcon className="size-5" />
              Get alerts by email or text
            </a>
          </div>
        </div>
      </section>

      {emergencies.length > 0 && (
        <div className="mb-8 grid gap-3">
          {emergencies.map((a) => (
            <div
              key={a.id}
              role="alert"
              className="flex flex-wrap items-center gap-4 rounded-2xl bg-emergency-strong px-5 py-4 text-white shadow-raised sm:flex-nowrap"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/15">
                <SirenIcon className="size-7" />
              </span>
              <div className="min-w-0 flex-1 basis-52">
                <p className="text-sm font-bold uppercase tracking-wider text-white/85">
                  Emergency alert
                </p>
                <p className="text-lg font-bold leading-snug sm:text-xl">{a.title}</p>
              </div>
              <Link
                href={`/alerts/${a.id}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 py-2 text-base font-bold text-emergency-strong hover:bg-white/90"
              >
                Read the alert
                <ArrowRightIcon className="size-5" />
              </Link>
            </div>
          ))}
        </div>
      )}

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AlertFeed live={live} past={past} categories={categories} />
        <SubscribeForm categories={categories} />
      </div>
    </>
  );
}

function StatusPill({ emergencies, active }: { emergencies: number; active: number }) {
  if (emergencies > 0) {
    return (
      <span className="inline-flex min-h-11 items-center gap-2.5 rounded-xl bg-emergency-strong px-4 py-2 text-base font-bold ring-1 ring-white/25">
        <span className="pulse-dot size-2.5 rounded-full bg-white" />
        {emergencies === 1 ? '1 emergency alert' : `${emergencies} emergency alerts`} in effect
      </span>
    );
  }
  return (
    <span className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/12 px-4 py-2 text-base font-semibold ring-1 ring-white/25">
      <CheckCircleIcon className="size-5" />
      {active === 0
        ? 'All clear: no active alerts'
        : `${active} active ${active === 1 ? 'alert' : 'alerts'}, no emergencies`}
    </span>
  );
}
