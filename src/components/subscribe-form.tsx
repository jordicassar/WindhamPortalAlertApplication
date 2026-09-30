'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { subscribe, type SubscribeState } from '@/app/actions/subscribe';
import { SubmitButton } from './submit-button';
import { card, input, Notice } from './ui';

export function SubscribeForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action] = useActionState<SubscribeState, FormData>(subscribe, {});
  const [viaEmail, setViaEmail] = useState(true);
  const [viaSms, setViaSms] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  return (
    <aside aria-labelledby="sub-heading" className={`${card} p-5 lg:sticky lg:top-4`}>
      <h2 id="sub-heading" className="text-xl font-bold">
        Get notified
      </h2>
      <p className="mt-1 text-sm text-muted">
        Choose how you want to hear about alerts in Windham.
      </p>

      <form action={action} className="mt-4 grid gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="viaEmail"
            checked={viaEmail}
            onChange={(e) => setViaEmail(e.target.checked)}
            className="size-4 accent-brand"
          />
          Email
        </label>
        {viaEmail && (
          <input
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-label="Email address"
            required
            className={input}
          />
        )}
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="viaSms"
            checked={viaSms}
            onChange={(e) => setViaSms(e.target.checked)}
            className="size-4 accent-brand"
          />
          Text message
        </label>
        {viaSms && (
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            placeholder="(860) 555-0123"
            aria-label="Mobile number"
            required
            className={input}
          />
        )}

        <fieldset className="rounded-lg border border-border px-3 pb-3 pt-1">
          <legend className="px-1 text-sm font-semibold">Topics</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="emergencyOnly"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className="size-4 accent-brand"
            />
            Emergency alerts only
          </label>
          <div
            className={`mt-2 grid gap-1.5 border-t border-border pt-2 ${emergencyOnly ? 'opacity-50' : ''}`}
          >
            {categories.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  defaultChecked
                  disabled={emergencyOnly}
                  className="size-4 accent-brand"
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>

        {state.error && <Notice kind="error">{state.error}</Notice>}
        {state.message && (
          <Notice kind="ok">
            {state.message}
            {state.unsubscribeToken && (
              <>
                {' '}
                Keep this{' '}
                <Link href={`/unsubscribe/${state.unsubscribeToken}`} className="underline">
                  unsubscribe link
                </Link>{' '}
                if you want to stop later.
              </>
            )}
          </Notice>
        )}

        <SubmitButton pendingText="Saving…" className="justify-self-start">
          Subscribe
        </SubmitButton>
        <p className="text-xs text-muted">
          Emergency alerts always go to every subscriber. Prototype: no messages are sent yet.
        </p>
      </form>
    </aside>
  );
}
