'use client';

import { useId, useState } from 'react';
import { EyeIcon, EyeOffIcon } from './icons';
import { cx, input } from './ui';

/**
 * Password field with an eye button to show what was typed. Label it with
 * `id` + <label htmlFor>, or `aria-label`; the button can't sit inside a <label>.
 * `className` styles the wrapper, e.g. for grid placement.
 */
export function PasswordInput({
  className,
  id,
  ...props
}: Omit<React.ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={cx('relative', className)}>
      <input
        {...props}
        id={inputId}
        type={visible ? 'text' : 'password'}
        // Edge draws its own reveal button; ours replaces it.
        className={cx(input, 'pr-14 [&::-ms-reveal]:hidden')}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label="Show password"
        aria-pressed={visible}
        aria-controls={inputId}
        className="absolute inset-y-0 right-1 my-auto grid size-11 place-items-center rounded-lg text-muted hover:bg-surface-2 hover:text-text"
      >
        {visible ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
      </button>
    </div>
  );
}
