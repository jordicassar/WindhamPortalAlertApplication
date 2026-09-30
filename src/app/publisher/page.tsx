import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { deleteDraft } from '@/app/actions/alerts';
import { SubmitButton } from '@/components/submit-button';
import { btn, EmptyState, Notice, PageTitle, SeverityBadge, StatusBadge } from '@/components/ui';
import { requirePageUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';

export const metadata: Metadata = { title: 'Publisher', robots: { index: false } };

export default function PublisherPage({ searchParams }: PageProps<'/publisher'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <PublisherContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PublisherContent({ searchParams }: Pick<PageProps<'/publisher'>, 'searchParams'>) {
  const user = await requirePageUser();
  const { saved } = await searchParams;
  const alerts = await db.alert.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: { category: { select: { name: true } } },
  });

  return (
    <>
      <PageTitle
        aside={
          <Link href="/publisher/new" className={btn('primary')}>
            + New alert
          </Link>
        }
      >
        Publisher workspace
      </PageTitle>
      <p className="-mt-3 mb-4 text-sm text-muted">
        Signed in as {user.name} ({user.department}). Alerts you submit are reviewed by an
        administrator before residents see them.
      </p>
      {saved && (
        <div className="mb-4">
          <Notice kind="ok">
            {saved === 'submitted' ? 'Submitted for approval.' : 'Draft saved.'}
          </Notice>
        </div>
      )}

      {alerts.length === 0 ? (
        <EmptyState>You have not written any alerts yet.</EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Severity</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Last updated</th>
                <th className="px-3 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                const editable = a.status === 'DRAFT' || a.status === 'REJECTED';
                return (
                  <tr key={a.id} className="border-t border-border align-top">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold">{a.title}</div>
                      {a.status === 'REJECTED' && a.reviewNote && (
                        <div className="mt-1 rounded bg-emergency-soft px-2 py-1 text-xs text-emergency">
                          Reviewer: {a.reviewNote}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2.5">{a.category.name}</td>
                    <td className="px-3 py-2.5">
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{formatDateTime(a.updatedAt)}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        {editable && (
                          <Link href={`/publisher/${a.id}/edit`} className={btn('secondary', true)}>
                            Edit
                          </Link>
                        )}
                        {a.status === 'PUBLISHED' && (
                          <Link href={`/alerts/${a.id}`} className={btn('ghost', true)}>
                            View
                          </Link>
                        )}
                        {a.status === 'DRAFT' && (
                          <form action={deleteDraft}>
                            <input type="hidden" name="id" value={a.id} />
                            <SubmitButton variant="danger" small pendingText="Deleting…">
                              Delete
                            </SubmitButton>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
