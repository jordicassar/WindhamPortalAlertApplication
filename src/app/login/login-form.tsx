'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth';
import { SubmitButton } from '@/components/submit-button';
import { card, input, Notice } from '@/components/ui';

export function LoginForm() {
  const [state, action] = useActionState(login, {});
  return (
    <form action={action} className={`${card} mt-5 grid gap-4 p-5`}>
      <label className="grid gap-1 text-sm font-semibold">
        Email
        <input name="email" type="email" autoComplete="username" required className={input} />
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={input}
        />
      </label>
      {state.error && <Notice kind="error">{state.error}</Notice>}
      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>
    </form>
  );
}
