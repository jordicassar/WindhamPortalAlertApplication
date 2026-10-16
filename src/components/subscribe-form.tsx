'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { subscribe, type SubscribeState } from '@/app/actions/subscribe';
import { HoneypotField } from './honeypot-field';
import { BellIcon, MailIcon, PhoneIcon } from './icons';
import { TurnstileWidget } from './turnstile-widget';
import { SubmitButton } from './submit-button';
import { card, checkbox, cx, input, label, Notice } from './ui';

export function SubscribeForm({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, action] = useActionState<SubscribeState, FormData>(subscribe, {});
  const [viaEmail, setViaEmail] = useState(true);
  const [viaSms, setViaSms] = useState(false);
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  const tile = (on: boolean) =>
    cx(
      'flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-base font-semibold transition-colors',
      on ? 'border-brand bg-brand-soft' : 'border-border bg-surface hover:border-muted',
    );

  return (
    <aside
      id="subscribe"
      aria-labelledby="sub-heading"
      className={`${card} scroll-mt-6 overflow-hidden lg:sticky lg:top-6`}
    >
      <div className="border-b border-border bg-brand-soft px-5 py-5 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand text-brand-contrast">
            <BellIcon className="size-6" />
          </span>
          <h2 id="sub-heading" className="text-2xl font-bold tracking-tight">
            Get notified
          </h2>
        </div>
        <p className="mt-2 text-muted">
          Hear about alerts in Windham the moment they&rsquo;re posted. Free, and you can stop at
          any time.
        </p>
      </div>

      <form action={action} className="grid gap-4 px-5 py-5 sm:px-6">
        <fieldset className="grid gap-2">
          <legend className="mb-2 text-base font-bold">How should we reach you?</legend>
          <label className={tile(viaEmail)}>
            <input
              type="checkbox"
              name="viaEmail"
              checked={viaEmail}
              onChange={(e) => setViaEmail(e.target.checked)}
              className={checkbox}
            />
            <MailIcon className="size-5 text-brand" />
            Email
          </label>
          {viaEmail && (
            <label className={label}>
              Email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                className={input}
              />
            </label>
          )}
          <label className={tile(viaSms)}>
            <input
              type="checkbox"
              name="viaSms"
              checked={viaSms}
              onChange={(e) => setViaSms(e.target.checked)}
              className={checkbox}
            />
            <PhoneIcon className="size-5 text-brand" />
            Text message
          </label>
          {viaSms && (
            <label className={label}>
              Mobile number
              <input
                type="tel"
                name="phone"
                autoComplete="tel"
                placeholder="(860) 555-0123"
                required
                className={input}
              />
            </label>
          )}
        </fieldset>

        <fieldset className="rounded-xl border border-border px-4 pb-4 pt-2">
          <legend className="px-1 text-base font-bold">Topics</legend>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-base font-semibold">
            <input
              type="checkbox"
              name="emergencyOnly"
              checked={emergencyOnly}
              onChange={(e) => setEmergencyOnly(e.target.checked)}
              className={checkbox}
            />
            Emergency alerts only
          </label>
          <div
            className={cx(
              'mt-1 grid gap-0.5 border-t border-border pt-2',
              emergencyOnly && 'opacity-50',
            )}
          >
            {categories.map((c) => (
              <label
                key={c.id}
                className="flex min-h-10 cursor-pointer items-center gap-3 text-base"
              >
                <input
                  type="checkbox"
                  name="categoryIds"
                  value={c.id}
                  defaultChecked
                  disabled={emergencyOnly}
                  className={checkbox}
                />
                {c.name}
              </label>
            ))}
          </div>
        </fieldset>

        <HoneypotField />
        <TurnstileWidget action="subscribe" resetSignal={state} />

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

        <SubmitButton pendingText="Saving…" className="w-full py-3 text-lg">
          Subscribe
        </SubmitButton>
        <p className="text-sm text-muted">
          Emergency alerts always go to every subscriber. Prototype: no messages are sent yet.
        </p>
      </form>
    </aside>
  );
}
