'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { saveAlert } from '@/app/actions/alerts';
import { AlertArticle, type AlertView } from '@/components/alert-article';
import { AlertEditor } from '@/components/alert-editor';
import { IconPicker } from '@/components/IconPicker';
import { PhonePreview } from '@/components/phone-preview';
import { SubmitButton } from '@/components/submit-button';
import { btn, card, input, Notice } from '@/components/ui';
import type { Severity } from '@/generated/prisma/enums';
import { fromEasternInput, SEVERITY_HINT, SEVERITY_LABEL, toEasternInput } from '@/lib/format';
import { getDefaultAlertIcon, type AlertIconId } from '@/lib/alert-icons';
import { alertLink, smsText } from '@/lib/sms';

const TITLE_MAX = 120;
// New alerts have no ID (and so no link) until saved; this stands in with the same length.
const NEW_ALERT_ID = 'your-alert-link-goes-here';

export type ComposeInitial = {
  id?: string;
  title: string;
  bodyHtml: string;
  iconId: AlertIconId | null;
  categoryId: string;
  severity: Severity;
  publishAt: string | null;
  expiresAt: string | null;
  reviewNote: string | null;
};

export function ComposeForm({
  initial,
  categories,
  authorName,
  now,
}: {
  initial: ComposeInitial;
  categories: { id: string; name: string }[];
  authorName: string;
  /** When the page was loaded (ISO), shown as the publish time until one is chosen. Passed
   * from the server so the server-rendered preview and the browser's agree. */
  now: string;
}) {
  const [state, action] = useActionState(saveAlert, {});
  const [title, setTitle] = useState(initial.title);
  const [bodyHtml, setBodyHtml] = useState(initial.bodyHtml);
  const [iconId, setIconId] = useState<AlertIconId | null>(initial.iconId);
  const [bodyText, setBodyText] = useState('');
  const [categoryId, setCategoryId] = useState(initial.categoryId);
  const [severity, setSeverity] = useState<Severity>(initial.severity);
  // Times are entered in Eastern time regardless of the browser's zone; the server converts them.
  const [publishLocal, setPublishLocal] = useState(toEasternInput(initial.publishAt));
  const [expiresLocal, setExpiresLocal] = useState(toEasternInput(initial.expiresAt));
  const [previewing, setPreviewing] = useState(false);

  const categoryName = categories.find((c) => c.id === categoryId)?.name ?? '';
  const categoryDefault = getDefaultAlertIcon(categoryName);
  const preview: AlertView = {
    id: 'preview',
    title: title || '(No title yet)',
    bodyHtml,
    bodyText,
    severity,
    iconId,
    categoryName,
    authorName,
    publishedAt: fromEasternInput(publishLocal)?.toISOString() ?? now,
    expiresAt: fromEasternInput(expiresLocal)?.toISOString() ?? null,
  };
  const sms = smsText({
    severity,
    title: preview.title,
    bodyText,
    link: alertLink(initial.id ?? NEW_ALERT_ID),
  });

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
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

        <div className="grid gap-3 sm:grid-cols-2">
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
            Publish at, Eastern time (optional)
            <input
              type="datetime-local"
              name="publishAt"
              value={publishLocal}
              onChange={(e) => setPublishLocal(e.target.value)}
              aria-describedby="publish-at-hint"
              className={input}
            />
            <span id="publish-at-hint" className="font-normal text-muted">
              Leave empty to publish as soon as it is approved.
            </span>
          </label>
          <label className="grid gap-1 text-sm font-semibold content-start">
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

        <IconPicker
          value={iconId}
          onChange={setIconId}
          categoryDefault={categoryDefault}
          name="iconId"
        />

        <div className="grid gap-1 text-sm font-semibold">
          Message
          <AlertEditor
            initialHtml={initial.bodyHtml}
            onChange={setBodyHtml}
            onTextChange={setBodyText}
          />
        </div>

        {previewing && (
          <div className="rounded-xl border-2 border-dashed border-border p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-muted">
              Preview: what residents will see
            </p>
            <AlertArticle mode="full" alert={preview} />
          </div>
        )}

        {state.error && <Notice kind="error">{state.error}</Notice>}

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/publisher" className={btn('ghost')}>
            Cancel
          </Link>
          <span className="flex-1" />
          <button type="button" className={btn()} onClick={() => setPreviewing((p) => !p)}>
            {previewing ? 'Hide full-width preview' : 'Full-width preview'}
          </button>
          <SubmitButton name="intent" value="draft" variant="secondary" pendingText="Saving…">
            Save draft
          </SubmitButton>
          <SubmitButton name="intent" value="submit" pendingText="Submitting…">
            Submit for approval
          </SubmitButton>
        </div>
      </form>
      <div className="lg:sticky lg:top-4">
        <PhonePreview alert={preview} sms={sms} />
      </div>
    </div>
  );
}
