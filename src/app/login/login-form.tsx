'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { HoneypotField } from '@/components/honeypot-field';
import { PasswordInput } from '@/components/password-input';
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
      <div className={label}>
        <label htmlFor="password">Password</label>
        <PasswordInput id="password" name="password" autoComplete="current-password" required />
      </div>
      <HoneypotField />
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <SubmitButton pendingText="Signing in…" className="w-full py-3 text-lg">
        Sign in
      </SubmitButton>
    </form>
  );
}
