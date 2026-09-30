import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Staff sign in', robots: { index: false } };

export default function LoginPage() {
  return (
    <div className="mx-auto mt-6 max-w-sm">
      <h1 className="text-2xl font-bold">Staff sign in</h1>
      <p className="mt-1 text-sm text-muted">For town staff who publish or approve alerts.</p>
      <LoginForm />
    </div>
  );
}
