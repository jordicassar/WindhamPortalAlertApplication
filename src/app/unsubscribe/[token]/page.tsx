import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unsubscribe } from '@/app/actions/subscribe';
import { SubmitButton } from '@/components/submit-button';
import { card } from '@/components/ui';

export const metadata: Metadata = { title: 'Unsubscribe', robots: { index: false } };

export default function UnsubscribePage({ params }: PageProps<'/unsubscribe/[token]'>) {
  return (
    <div className={`${card} mx-auto max-w-md p-6`}>
      <h1 className="text-xl font-bold">Stop Windham alerts?</h1>
      <p className="mt-2 text-sm text-muted">
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
    <form action={unsubscribe} className="mt-4">
      <input type="hidden" name="token" value={token} />
      <SubmitButton variant="danger" pendingText="Unsubscribing…">
        Unsubscribe
      </SubmitButton>
    </form>
  );
}
