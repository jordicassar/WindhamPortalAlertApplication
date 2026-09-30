import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageTitle } from '@/components/ui';
import { requirePageUser } from '@/lib/dal';
import { getCategories } from '@/lib/public-data';
import { ComposeForm } from '../compose-form';

export const metadata: Metadata = { title: 'New alert', robots: { index: false } };

export default function NewAlertPage() {
  return (
    <>
      <PageTitle>New alert</PageTitle>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <NewAlert />
      </Suspense>
    </>
  );
}

async function NewAlert() {
  const user = await requirePageUser();
  const categories = await getCategories();
  return (
    <ComposeForm
      authorName={user.name}
      categories={categories}
      initial={{
        title: '',
        bodyHtml: '',
        categoryId: categories[0]?.id ?? '',
        severity: 'INFO',
        expiresAt: null,
        reviewNote: null,
      }}
    />
  );
}
