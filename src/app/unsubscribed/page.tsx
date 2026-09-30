import type { Metadata } from 'next';
import Link from 'next/link';
import { card } from '@/components/ui';

export const metadata: Metadata = { title: 'Unsubscribed', robots: { index: false } };

export default function UnsubscribedPage() {
  return (
    <div className={`${card} mx-auto max-w-md p-6`}>
      <h1 className="text-xl font-bold">You have been unsubscribed</h1>
      <p className="mt-2 text-sm text-muted">
        You will no longer receive Windham alerts. Current alerts are always posted on this site.
      </p>
      <Link href="/" className="mt-4 inline-block text-sm font-semibold text-brand underline">
        View current alerts
      </Link>
    </div>
  );
}
