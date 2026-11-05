import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { deleteDraft } from '@/app/actions/alerts';
import { SubmitButton } from '@/components/submit-button';
import {
  btn,
  EmptyState,
  PageTitle,
  PublishTime,
  SeverityBadge,
  StatusBadge,
} from '@/components/ui';
import {
  historyHref,
  historyOrderBy,
  historyWhere,
  parseHistoryQuery,
  type HistoryQuery,
  type SortKey,
} from '@/lib/alert-history';
import { requirePageUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { SavedNotice } from './saved-notice';

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
  const params = await searchParams;
  const { saved } = params;
  const query = parseHistoryQuery(params);
  const inDepartment = query.scope === 'department';
  const filtered = Boolean(query.status || query.severity);
  const alerts = await db.alert.findMany({
    where: historyWhere(user, query),
    orderBy: historyOrderBy(query),
    take: 100,
    include: {
      category: { select: { name: true } },
      author: { select: { name: true } },
    },
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
      {typeof saved === 'string' && (
        <div className="mb-4">
          <SavedNotice saved={saved} />
        </div>
      )}

      <ScopeTabs query={query} department={user.department} />
      <FilterBar query={query} />

      {alerts.length === 0 ? (
        <EmptyState>
          {filtered
            ? 'No alerts match these filters.'
            : inDepartment
              ? `Nobody in ${user.department} has written an alert yet.`
              : 'You have not written any alerts yet.'}
        </EmptyState>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-3 py-2.5">Title</th>
                {inDepartment && <th className="px-3 py-2.5">Author</th>}
                <th className="px-3 py-2.5">Category</th>
                <SortHeader query={query} column="severity" label="Severity" />
                <SortHeader query={query} column="status" label="Status" />
                <SortHeader query={query} column="created" label="Created" />
                <SortHeader query={query} column="updated" label="Last updated" />
                <th className="px-3 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => {
                // Colleagues' alerts are read-only: only the author can edit or delete.
                const mine = a.authorId === user.id;
                const editable = mine && (a.status === 'DRAFT' || a.status === 'REJECTED');
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
                    {inDepartment && (
                      <td className="px-3 py-2.5">{mine ? 'You' : a.author.name}</td>
                    )}
                    <td className="px-3 py-2.5">{a.category.name}</td>
                    <td className="px-3 py-2.5">
                      <SeverityBadge severity={a.severity} />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusBadge status={a.status} />
                      <PublishTime alert={a} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">{formatDateTime(a.createdAt)}</td>
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
                        {mine && a.status === 'DRAFT' && (
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

function ScopeTabs({ query, department }: { query: HistoryQuery; department: string }) {
  const tabs = [
    { scope: 'mine', label: 'My alerts' },
    { scope: 'department', label: `${department} history` },
  ] as const;
  return (
    <nav aria-label="Alert history" className="mb-4 flex flex-wrap gap-2">
      {tabs.map((t) => (
        <Link
          key={t.scope}
          href={historyHref(query, { scope: t.scope })}
          aria-current={query.scope === t.scope ? 'page' : undefined}
          className={btn(query.scope === t.scope ? 'primary' : 'secondary', true)}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}

/** A plain GET form, so filters work without JavaScript and show up in the URL. */
function FilterBar({ query }: { query: HistoryQuery }) {
  const field = 'grid gap-1 text-sm font-semibold';
  const select = 'rounded-lg border border-border bg-surface px-2 py-1.5 text-sm font-normal';
  return (
    <form action="/publisher" className="mb-4 flex flex-wrap items-end gap-3">
      {query.scope !== 'mine' && <input type="hidden" name="scope" value={query.scope} />}
      <input type="hidden" name="sort" value={query.sort} />
      <input type="hidden" name="dir" value={query.dir} />
      <label className={field}>
        Status
        <select name="status" defaultValue={query.status ?? ''} className={select}>
          <option value="">All statuses</option>
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className={field}>
        Severity
        <select name="severity" defaultValue={query.severity ?? ''} className={select}>
          <option value="">All severities</option>
          <option value="INFO">Info</option>
          <option value="ADVISORY">Advisory</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </label>
      <button type="submit" className={btn('secondary', true)}>
        Apply
      </button>
      {(query.status || query.severity) && (
        <Link
          href={historyHref(query, { status: null, severity: null })}
          className={btn('ghost', true)}
        >
          Clear filters
        </Link>
      )}
    </form>
  );
}

const STATUSES = [
  ['DRAFT', 'Draft'],
  ['PENDING', 'Pending approval'],
  ['SCHEDULED', 'Scheduled'],
  ['PUBLISHED', 'Published'],
  ['REJECTED', 'Sent back'],
  ['ARCHIVED', 'Archived'],
] as const;

/** Column header that sorts by its column; clicking again reverses the direction. */
function SortHeader({
  query,
  column,
  label,
}: {
  query: HistoryQuery;
  column: SortKey;
  label: string;
}) {
  const active = query.sort === column;
  const nextDir = active && query.dir === 'desc' ? 'asc' : 'desc';
  return (
    <th
      className="px-3 py-2.5"
      aria-sort={active ? (query.dir === 'asc' ? 'ascending' : 'descending') : undefined}
    >
      <Link
        href={historyHref(query, { sort: column, dir: nextDir })}
        className="inline-flex items-center gap-1 uppercase hover:text-text"
      >
        {label}
        <span aria-hidden="true">{active ? (query.dir === 'asc' ? '▲' : '▼') : ''}</span>
      </Link>
    </th>
  );
}
