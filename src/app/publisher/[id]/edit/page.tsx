import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PageTitle } from '@/components/ui';
import { requirePageUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { getCategories } from '@/lib/public-data';
import { ComposeForm } from '../../compose-form';

export const metadata: Metadata = { title: 'Edit alert', robots: { index: false } };

export default function EditAlertPage({ params }: PageProps<'/publisher/[id]/edit'>) {
  return (
    <>
      <PageTitle>Edit alert</PageTitle>
      <Suspense fallback={<p className="text-muted">Loading…</p>}>
        <EditAlert params={params} />
      </Suspense>
    </>
  );
}

async function EditAlert({ params }: Pick<PageProps<'/publisher/[id]/edit'>, 'params'>) {
  const user = await requirePageUser();
  const { id } = await params;
  const [alert, categories] = await Promise.all([
    db.alert.findFirst({
      where: { id, authorId: user.id, status: { in: ['DRAFT', 'REJECTED'] } },
    }),
    getCategories(),
  ]);
  if (!alert) notFound();

  return (
    <ComposeForm
      authorName={user.name}
      categories={categories}
      initial={{
        id: alert.id,
        title: alert.title,
        bodyHtml: alert.bodyHtml,
        categoryId: alert.categoryId,
        severity: alert.severity,
        expiresAt: alert.expiresAt?.toISOString() ?? null,
        reviewNote: alert.status === 'REJECTED' ? alert.reviewNote : null,
      }}
    />
  );
}
