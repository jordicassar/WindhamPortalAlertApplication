import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircleIcon } from '@/components/icons';
import { btn, card } from '@/components/ui';

export const metadata: Metadata = { title: 'Unsubscribed', robots: { index: false } };

export default function UnsubscribedPage() {
  return (
    <div className={`${card} mx-auto mt-4 max-w-lg p-6 sm:p-8`}>
      <span className="grid size-12 place-items-center rounded-xl bg-ok-soft text-ok">
        <CheckCircleIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">You have been unsubscribed</h1>
      <p className="mt-2 text-lg text-muted">
        You will no longer receive Windham alerts. Current alerts are always posted on this site.
      </p>
      <Link href="/" className={`${btn('primary')} mt-6`}>
        View current alerts
      </Link>
    </div>
  );
}
