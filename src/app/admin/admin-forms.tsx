'use client';

import { useActionState, useState } from 'react';
import { createCategory, createStaff } from '@/app/actions/admin';
import { approveAlert, rejectAlert } from '@/app/actions/alerts';
import { SubmitButton } from '@/components/submit-button';
import { btn, card, input, Notice } from '@/components/ui';

export function ReviewActions({ alertId }: { alertId: string }) {
  const [approveState, approve] = useActionState(approveAlert, {});
  const [rejectState, reject] = useActionState(rejectAlert, {});
  const [rejecting, setRejecting] = useState(false);
  const result = approveState.error ?? rejectState.error;

  return (
    <div className="mt-3 grid gap-2">
      <div className="flex flex-wrap gap-2">
        <form action={approve}>
          <input type="hidden" name="id" value={alertId} />
          <SubmitButton pendingText="Publishing…">Approve &amp; publish</SubmitButton>
        </form>
        {!rejecting && (
          <button type="button" className={btn('danger')} onClick={() => setRejecting(true)}>
            Request changes
          </button>
        )}
      </div>
      {rejecting && (
        <form action={reject} className="grid gap-2">
          <input type="hidden" name="id" value={alertId} />
          <label className="grid gap-1 text-sm font-semibold">
            What should the publisher change?
            <textarea name="note" required rows={3} maxLength={1000} className={input} />
          </label>
          <div className="flex gap-2">
            <SubmitButton variant="danger" pendingText="Sending…">
              Send back to publisher
            </SubmitButton>
            <button type="button" className={btn('ghost')} onClick={() => setRejecting(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
      {result && <Notice kind="error">{result}</Notice>}
    </div>
  );
}

export function StaffForm() {
  const [state, action] = useActionState(createStaff, {});
  return (
    <form action={action} className={`${card} mt-4 grid gap-3 p-5 sm:grid-cols-2`}>
      <h3 className="font-bold sm:col-span-2">Add staff account</h3>
      <input
        name="name"
        placeholder="Name or office"
        aria-label="Name"
        required
        className={input}
      />
      <input
        name="email"
        type="email"
        placeholder="Work email"
        aria-label="Work email"
        required
        className={input}
      />
      <input
        name="department"
        placeholder="Department"
        aria-label="Department"
        required
        className={input}
      />
      <select name="role" aria-label="Role" className={input}>
        <option value="PUBLISHER">Publisher</option>
        <option value="ADMIN">Administrator</option>
      </select>
      <input
        name="password"
        type="password"
        placeholder="Temporary password (12+ characters)"
        aria-label="Temporary password"
        autoComplete="new-password"
        minLength={12}
        required
        className={`${input} sm:col-span-2`}
      />
      {state.error && (
        <div className="sm:col-span-2">
          <Notice kind="error">{state.error}</Notice>
        </div>
      )}
      {state.message && (
        <div className="sm:col-span-2">
          <Notice kind="ok">{state.message}</Notice>
        </div>
      )}
      <div>
        <SubmitButton pendingText="Adding…">Add account</SubmitButton>
      </div>
    </form>
  );
}

export function CategoryForm() {
  const [state, action] = useActionState(createCategory, {});
  return (
    <form action={action} className={`${card} mt-4 grid gap-3 p-5`}>
      <h3 className="font-bold">Add category</h3>
      <div className="flex flex-wrap gap-2">
        <input
          name="name"
          placeholder="Category name"
          aria-label="Category name"
          maxLength={40}
          required
          className={`${input} flex-1`}
        />
        <SubmitButton pendingText="Adding…">Add category</SubmitButton>
      </div>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      {state.message && <Notice kind="ok">{state.message}</Notice>}
    </form>
  );
}
