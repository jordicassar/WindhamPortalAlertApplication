import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { setStaffActive } from '@/app/actions/admin';
import { archiveAlert } from '@/app/actions/alerts';
import { AlertArticle } from '@/components/alert-article';
import { SubmitButton } from '@/components/submit-button';
import { card, cx, EmptyState, PageTitle, SeverityBadge, StatusBadge } from '@/components/ui';
import { requirePageUser } from '@/lib/dal';
import { db } from '@/lib/db';
import { formatDateTime } from '@/lib/format';
import { alertHtmlToText, sanitizeAlertHtml } from '@/lib/sanitize';
import { CategoryForm, ReviewActions, StaffForm } from './admin-forms';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

const TABS = [
  { id: 'queue', label: 'Approval queue' },
  { id: 'alerts', label: 'All alerts' },
  { id: 'staff', label: 'Staff accounts' },
  { id: 'categories', label: 'Categories' },
  { id: 'audit', label: 'Audit log' },
] as const;
type Tab = (typeof TABS)[number]['id'];

export default function AdminPage({ searchParams }: PageProps<'/admin'>) {
  return (
    <Suspense fallback={<p className="text-muted">Loading…</p>}>
      <AdminContent searchParams={searchParams} />
    </Suspense>
  );
}

async function AdminContent({ searchParams }: Pick<PageProps<'/admin'>, 'searchParams'>) {
  const admin = await requirePageUser(['ADMIN']);
  const requested = (await searchParams).tab;
  const tab: Tab = TABS.some((t) => t.id === requested) ? (requested as Tab) : 'queue';

  const [pending, live, staff, subscribers, queued] = await Promise.all([
    db.alert.count({ where: { status: 'PENDING' } }),
    db.alert.count({
      where: { status: 'PUBLISHED', OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    }),
    db.user.count({ where: { active: true } }),
    db.subscriber.count(),
    db.dispatch.count({ where: { status: 'QUEUED' } }),
  ]);

  return (
    <>
      <PageTitle aside={<span className="text-sm text-muted">Signed in as {admin.name}</span>}>
        Administration
      </PageTitle>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Awaiting approval" value={pending} highlight={pending > 0} />
        <Stat label="Live alerts" value={live} />
        <Stat label="Subscribers" value={subscribers} />
        <Stat label="Notifications queued" value={queued} />
        <Stat label="Active staff" value={staff} />
      </div>

      <nav
        aria-label="Admin sections"
        className="mb-5 flex gap-1 overflow-x-auto border-b border-border"
      >
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            aria-current={tab === t.id ? 'page' : undefined}
            className={cx(
              'whitespace-nowrap border-b-[3px] px-3.5 py-2.5 text-sm font-semibold',
              tab === t.id
                ? 'border-brand text-brand'
                : 'border-transparent text-muted hover:text-text',
            )}
          >
            {t.label}
            {t.id === 'queue' && pending > 0 && (
              <span className="ml-1.5 rounded-full bg-emergency px-1.5 py-0.5 text-xs text-white">
                {pending}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {tab === 'queue' && <Queue />}
      {tab === 'alerts' && <AllAlerts />}
      {tab === 'staff' && <Staff currentUserId={admin.id} />}
      {tab === 'categories' && <Categories />}
      {tab === 'audit' && <Audit />}
    </>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={cx(card, 'px-4 py-3', highlight && 'border-advisory bg-advisory-soft')}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

const th = 'px-3 py-2.5';
const td = 'px-3 py-2.5';
function Table({ head, children }: { head: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-2 text-xs uppercase tracking-wide text-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} className={th}>
                {h || <span className="sr-only">Actions</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

async function Queue() {
  const alerts = await db.alert.findMany({
    where: { status: 'PENDING' },
    orderBy: { updatedAt: 'asc' },
    include: { author: { select: { name: true } }, category: { select: { name: true } } },
  });
  if (!alerts.length) return <EmptyState>Nothing is waiting for approval.</EmptyState>;

  return (
    <div className="grid gap-6">
      {alerts.map((a) => {
        const bodyHtml = sanitizeAlertHtml(a.bodyHtml);
        return (
          <div key={a.id}>
            <p className="mb-1.5 text-sm text-muted">
              Submitted by <strong>{a.author.name}</strong> · {formatDateTime(a.updatedAt)}
            </p>
            <AlertArticle
              mode="full"
              alert={{
                id: a.id,
                title: a.title,
                bodyHtml,
                bodyText: alertHtmlToText(bodyHtml),
                severity: a.severity,
                categoryName: a.category.name,
                authorName: a.author.name,
                publishedAt: a.updatedAt.toISOString(),
                expiresAt: a.expiresAt?.toISOString() ?? null,
              }}
            />
            <ReviewActions alertId={a.id} />
          </div>
        );
      })}
    </div>
  );
}

async function AllAlerts() {
  const alerts = await db.alert.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 200,
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      dispatches: {
        select: { recipientCount: true, status: true },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
  const expiredIds = await getExpiredIds();
  return (
    <Table head={['Title', 'Author', 'Category', 'Severity', 'Status', 'Notified', 'Updated', '']}>
      {alerts.map((a) => (
        <tr key={a.id} className="border-t border-border align-top">
          <td className={`${td} font-semibold`}>
            {a.title}
            {expiredIds.has(a.id) && <span className="ml-1 font-normal text-muted">(expired)</span>}
          </td>
          <td className={td}>{a.author.name}</td>
          <td className={td}>{a.category.name}</td>
          <td className={td}>
            <SeverityBadge severity={a.severity} />
          </td>
          <td className={td}>
            <StatusBadge status={a.status} />
          </td>
          <td className={`${td} whitespace-nowrap text-muted`}>
            {a.dispatches[0]
              ? `${a.dispatches[0].recipientCount} (${a.dispatches[0].status.toLowerCase()})`
              : '—'}
          </td>
          <td className={`${td} whitespace-nowrap`}>{formatDateTime(a.updatedAt)}</td>
          <td className={`${td} text-right`}>
            {a.status === 'PUBLISHED' && (
              <form action={archiveAlert}>
                <input type="hidden" name="id" value={a.id} />
                <SubmitButton variant="ghost" small pendingText="Archiving…">
                  Archive
                </SubmitButton>
              </form>
            )}
          </td>
        </tr>
      ))}
    </Table>
  );
}

async function getExpiredIds(): Promise<Set<string>> {
  const rows = await db.alert.findMany({
    where: { status: 'PUBLISHED', expiresAt: { lte: new Date() } },
    select: { id: true },
  });
  return new Set(rows.map((r) => r.id));
}

async function Staff({ currentUserId }: { currentUserId: string }) {
  const users = await db.user.findMany({ orderBy: [{ active: 'desc' }, { name: 'asc' }] });
  return (
    <>
      <Table head={['Name', 'Email', 'Department', 'Role', 'Status', '']}>
        {users.map((u) => (
          <tr key={u.id} className={cx('border-t border-border', !u.active && 'text-muted')}>
            <td className={td}>{u.name}</td>
            <td className={td}>{u.email}</td>
            <td className={td}>{u.department}</td>
            <td className={td}>{u.role === 'ADMIN' ? 'Administrator' : 'Publisher'}</td>
            <td className={td}>{u.active ? 'Active' : 'Deactivated'}</td>
            <td className={`${td} text-right`}>
              {u.id !== currentUserId && (
                <form action={setStaffActive}>
                  <input type="hidden" name="id" value={u.id} />
                  <input type="hidden" name="active" value={String(!u.active)} />
                  <SubmitButton variant={u.active ? 'danger' : 'secondary'} small>
                    {u.active ? 'Deactivate' : 'Reactivate'}
                  </SubmitButton>
                </form>
              )}
            </td>
          </tr>
        ))}
      </Table>
      <StaffForm />
    </>
  );
}

async function Categories() {
  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { alerts: true, subscribers: true } } },
  });
  return (
    <>
      <Table head={['Category', 'Alerts', 'Subscribers']}>
        {categories.map((c) => (
          <tr key={c.id} className="border-t border-border">
            <td className={`${td} font-semibold`}>{c.name}</td>
            <td className={td}>{c._count.alerts}</td>
            <td className={td}>{c._count.subscribers}</td>
          </tr>
        ))}
      </Table>
      <CategoryForm />
    </>
  );
}

async function Audit() {
  const entries = await db.auditEntry.findMany({ orderBy: { at: 'desc' }, take: 200 });
  return (
    <>
      <p className="mb-3 text-sm text-muted">
        Every change made in the portal is recorded here. Showing the latest 200 entries.
      </p>
      <Table head={['When', 'Who', 'Action', 'Detail']}>
        {entries.map((e) => (
          <tr key={e.id} className="border-t border-border align-top">
            <td className={`${td} whitespace-nowrap`}>{formatDateTime(e.at)}</td>
            <td className={td}>{e.actorLabel}</td>
            <td className={td}>{e.action}</td>
            <td className={td}>{e.detail}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
