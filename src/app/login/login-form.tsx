'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { HoneypotField } from '@/components/honeypot-field';
import { SubmitButton } from '@/components/submit-button';
import { card, input, label, Notice } from '@/components/ui';

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className={`${card} mt-6 grid gap-5 p-6`}>
      <label className={label}>
        Email
        <input name="email" type="email" autoComplete="username" required className={input} />
      </label>
      <label className={label}>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </label>
      <HoneypotField />
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <SubmitButton pendingText="Signing in…" className="w-full py-3 text-lg">
        Sign in
      </SubmitButton>
    </form>
  );
}
