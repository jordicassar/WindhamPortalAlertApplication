import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { unsubscribe } from '@/app/actions/subscribe';
import { SubmitButton } from '@/components/submit-button';
import { BellOffIcon } from '@/components/icons';
import { btn, card } from '@/components/ui';

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false } };

export default function UnsubscribePage({ params }: PageProps<'/unsubscribe/[token]'>) {
  return (
    <div className={`${card} mx-auto mt-4 max-w-lg p-6 sm:p-8`}>
      <span className="grid size-12 place-items-center rounded-xl bg-emergency-soft text-emergency">
        <BellOffIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Stop Windham alerts?</h1>
      <p className="mt-2 text-lg text-muted">
        You will no longer receive emails or texts, including emergency alerts. You can subscribe
        again at any time.
      </p>
      <Suspense fallback={null}>
        <UnsubscribeForm params={params} />
      </Suspense>
    </div>
  );
}

async function UnsubscribeForm({ params }: Pick<PageProps<'/unsubscribe/[token]'>, 'params'>) {
  const { token } = await params;
  return (
    <form action={unsubscribe} className="mt-6 flex flex-wrap gap-3">
      <input type="hidden" name="token" value={token} />
      <SubmitButton variant="danger" pendingText="Unsubscribing…">
        Yes, unsubscribe me
      </SubmitButton>
      <Link href="/" className={btn('ghost')}>
        Keep my alerts
      </Link>
    </form>
  );
}
