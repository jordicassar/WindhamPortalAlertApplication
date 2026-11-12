import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AlertFeed } from '@/components/alert-feed';
import { HomeHero } from '@/components/home-hero';
import { SubscribeForm } from '@/components/subscribe-form';
import type { PublicAlert } from '@/lib/public-data';

export const metadata: Metadata = { title: 'Language preview' };

const categories = [
  { id: 'preview-roads', name: 'Roads & Traffic' },
  { id: 'preview-weather', name: 'Weather' },
  { id: 'preview-schools', name: 'Schools (BOE)' },
];

const live: PublicAlert[] = [
  {
    id: 'preview-emergency',
    title: 'Winter storm warning: parking ban in effect tonight',
    bodyHtml:
      '<p>A <strong>parking ban</strong> is in effect on all town roads from <strong>10 PM tonight until 6 AM</strong> so plow crews can clear the streets.</p>',
    bodyText:
      'A parking ban is in effect on all town roads from 10 PM tonight until 6 AM so plow crews can clear the streets.',
    severity: 'EMERGENCY',
    iconId: null,
    categoryId: 'preview-weather',
    categoryName: 'Weather',
    authorName: 'Town of Windham',
    publishedAt: '2026-11-11T18:00:00.000Z',
    expiresAt: null,
  },
  {
    id: 'preview-advisory',
    title: 'Schools open on a two-hour delay tomorrow',
    bodyHtml:
      '<p>All Windham public schools will open on a <strong>two-hour delay</strong>. Morning pre-K is cancelled.</p>',
    bodyText:
      'All Windham public schools will open on a two-hour delay. Morning pre-K is cancelled.',
    severity: 'ADVISORY',
    iconId: null,
    categoryId: 'preview-schools',
    categoryName: 'Schools (BOE)',
    authorName: 'Town of Windham',
    publishedAt: '2026-11-11T16:00:00.000Z',
    expiresAt: null,
  },
];

export default function LanguagePreviewPage() {
  if (process.env.NODE_ENV !== 'development') notFound();

  const emergencies = live
    .filter((alert) => alert.severity === 'EMERGENCY')
    .map(({ id, title }) => ({ id, title }));

  return (
    <>
      <HomeHero emergencies={emergencies} active={live.length} />
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <AlertFeed live={live} past={[]} categories={categories} />
        <SubscribeForm categories={categories} />
      </div>
    </>
  );
}
