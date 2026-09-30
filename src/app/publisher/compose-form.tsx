'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveAlert } from '@/app/actions/alerts';
import { AlertArticle } from '@/components/alert-article';
import { AlertEditor } from '@/components/alert-editor';
import { SubmitButton } from '@/components/submit-button';
import { btn, card, input, Notice } from '@/components/ui';
import type { Severity } from '@/generated/prisma/enums';
import { fromEasternInput, SEVERITY_HINT, SEVERITY_LABEL, toEasternInput } from '@/lib/format';

const TITLE_MAX = 120;

export type ComposeInitial = {
  id?: string;
  title: string;
  bodyHtml: string;
  categoryId: string;
  severity: Severity;
  expiresAt: string | null;
  reviewNote: string | null;
};

export function ComposeForm({
  initial,
  categories,
  authorName,
}: {
  initial: ComposeInitial;
  categories: { id: string; name: string }[];
  authorName: string;
}) {
  const [state, action] = useActionState(saveAlert, {});
  const [title, setTitle] = useState(initial.title);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [severity, setSeverity] = useState<Severity>(initial.severity);
  // Expiry is entered in Eastern time regardless of the browser's zone; the server converts it.
  const [expiresLocal, setExpiresLocal] = useState(toEasternInput(initial.expiresAt));
  const [previewing, setPreviewing] = useState(false);

  return (
    <form action={action} className={`${card} grid gap-4 p-5`}>
      <input type="hidden" name="id" value={initial.id ?? ''} />
      <input type="hidden" name="bodyHtml" value={bodyHtml} />

      {initial.reviewNote && (
        <Notice kind="error">Reviewer requested changes: {initial.reviewNote}</Notice>
      )}

      <label className="grid gap-1 text-sm font-semibold">
        <span className="flex justify-between">
          Title
          <span className="font-normal text-muted">
            {title.length}/{TITLE_MAX}
          </span>
        </span>
        <input
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX}
          required
          placeholder="Short, clear headline"
          className={input}
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">
          Category
          <select
            name="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={input}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Severity
          <select
            name="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value as Severity)}
            className={input}
          >
            {(['INFO', 'ADVISORY', 'EMERGENCY'] as const).map((s) => (
              <option key={s} value={s}>
                {SEVERITY_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Expires, Eastern time (optional)
          <input
            type="datetime-local"
            name="expiresAt"
            value={expiresLocal}
            onChange={(e) => setExpiresLocal(e.target.value)}
            className={input}
          />
        </label>
      </div>
      <p
        className={
          severity === 'EMERGENCY' ? 'text-sm font-semibold text-emergency' : 'text-sm text-muted'
        }
      >
        {SEVERITY_LABEL[severity]}: {SEVERITY_HINT[severity]}
      </p>

      <div className="grid gap-1 text-sm font-semibold">
        Message
        <AlertEditor initialHtml={initial.bodyHtml} onChange={setBodyHtml} />
      </div>

      {previewing && (
        <div className="rounded-xl border-2 border-dashed border-border p-3">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted">
            Preview: what residents will see
          </p>
          <AlertArticle
            mode="full"
            alert={{
              id: 'preview',
              title: title || '(No title yet)',
              bodyHtml,
              bodyText: '',
              severity,
              categoryName: categories.find((c) => c.id === categoryId)?.name ?? '',
              authorName,
              publishedAt: new Date().toISOString(),
              expiresAt: fromEasternInput(expiresLocal)?.toISOString() ?? null,
            }}
          />
        </div>
      )}

      {state.error && <Notice kind="error">{state.error}</Notice>}

      <div className="flex flex-wrap items-center gap-2">
        <Link href="/publisher" className={btn('ghost')}>
          Cancel
        </Link>
        <span className="flex-1" />
        <button type="button" className={btn()} onClick={() => setPreviewing((p) => !p)}>
          {previewing ? 'Hide preview' : 'Preview'}
        </button>
        <SubmitButton name="intent" value="draft" variant="secondary" pendingText="Saving…">
          Save draft
        </SubmitButton>
        <SubmitButton name="intent" value="submit" pendingText="Submitting…">
          Submit for approval
        </SubmitButton>
      </div>
    </form>
  );
}
