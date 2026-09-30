import type { Metadata } from 'next';
import { LockIcon } from '@/components/icons';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Staff sign in', robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto mt-4 max-w-md">
      <span className="grid size-12 place-items-center rounded-xl bg-brand-soft text-brand">
        <LockIcon className="size-6" />
      </span>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Staff sign in</h1>
      <p className="mt-1 text-lg text-muted">For town staff who publish or approve alerts.</p>
      <LoginForm />
    </div>
  );
}
