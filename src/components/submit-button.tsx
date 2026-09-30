'use client';

import { useFormStatus } from 'react-dom';
import { btn } from './ui';

/** Submit button that disables itself and shows progress while its form's action runs. */
export function SubmitButton({
  children,
  pendingText,
  variant = 'primary',
  small,
  name,
  value,
  className,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  small?: boolean;
  name?: string;
  value?: string;
  className?: string;
}) {
  const { pending, data } = useFormStatus();
  // When a form has several submit buttons, only show progress on the one that was clicked.
  const isThis = pending && (!name || data?.get(name) === value);
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`${btn(variant, small)} ${className ?? ''}`}
    >
      {isThis && pendingText ? pendingText : children}
    </button>
  );
}
