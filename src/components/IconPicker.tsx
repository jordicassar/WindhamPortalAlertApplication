'use client';

import { useId, useRef, type KeyboardEvent } from 'react';
import {
  ALERT_ICONS,
  ALERT_ICON_IDS,
  ALERT_ICON_TONE_CLASSES,
  AlertIconBadge,
  AlertIconGlyph,
  type AlertIconId,
} from './AlertIconBadge';
import { card, cx } from './ui';

type Props = {
  /** The publisher's explicit choice, or null to follow the category default. */
  value: AlertIconId | null;
  onChange: (next: AlertIconId | null) => void;
  /** Icon that the selected category maps to. Shown as "Category default" in the grid. */
  categoryDefault: AlertIconId;
  /** Form field name. Submits the icon id, or an empty string when following the default. */
  name?: string;
};

/**
 * Radio-group icon picker. Arrow keys move and select, Home/End jump, Tab leaves the group.
 * Selection is shown by an outline and a check, not by colour alone.
 */
export function IconPicker({ value, onChange, categoryDefault, name = 'iconId' }: Props) {
  const groupId = useId();
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const selected = value ?? categoryDefault;
  const usingDefault = value === null;

  function select(id: AlertIconId) {
    onChange(id === categoryDefault ? null : id);
    refs.current[id]?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = ALERT_ICON_IDS.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = index === last ? 0 : index + 1;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    select(ALERT_ICON_IDS[next]);
  }

  return (
    <fieldset className={cx(card, 'grid gap-3 p-4 sm:p-5')}>
      <legend id={`${groupId}-label`} className="px-1 text-base font-semibold">
        Alert icon
      </legend>

      <div className="mb-4 flex items-center gap-3">
        <AlertIconBadge icon={selected} size="md" labelled />
        <div className="min-w-0">
          <p className="font-medium">{ALERT_ICONS[selected].label}</p>
          <p className="text-sm text-muted">
            {usingDefault ? 'Chosen automatically from the category.' : 'Chosen by you.'}
          </p>
        </div>
        {!usingDefault && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-auto rounded-md px-2 py-1 text-sm font-medium text-brand underline underline-offset-2 hover:text-brand-hover"
          >
            Use category default
          </button>
        )}
      </div>

      <p id={`${groupId}-hint`} className="sr-only">
        Choose an icon for this alert. The selected category default is marked. Use the arrow keys
        to move between icons.
      </p>
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label ${groupId}-hint`}
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {ALERT_ICON_IDS.map((id, index) => {
          const { label, tone } = ALERT_ICONS[id];
          const isSelected = id === selected;
          const isDefault = id === categoryDefault;
          return (
            <button
              key={id}
              ref={(el) => {
                refs.current[id] = el;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={isDefault ? `${label}, category default` : label}
              title={isDefault ? `${label} (category default)` : label}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => select(id)}
              onKeyDown={(e) => onKeyDown(e, index)}
              className={cx(
                'group relative flex flex-col items-center gap-1.5 rounded-xl border p-2 text-center transition-colors',
                isSelected
                  ? 'border-brand bg-brand-soft ring-1 ring-brand'
                  : 'border-transparent hover:border-border hover:bg-surface-2',
              )}
            >
              <span
                className={cx(
                  'flex size-11 items-center justify-center rounded-lg ring-1 ring-inset ring-border',
                  ALERT_ICON_TONE_CLASSES[tone],
                )}
              >
                <AlertIconGlyph icon={id} className="size-6" />
              </span>
              <span className="text-xs leading-tight text-text">{label}</span>
              {isDefault && (
                <span className="text-[0.65rem] font-semibold leading-tight text-muted">
                  Category default
                </span>
              )}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-brand text-brand-contrast"
                >
                  <svg
                    viewBox="0 0 12 12"
                    className="size-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      d="m2.5 6.2 2.2 2.2 4.8-4.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>

      <input type="hidden" name={name} value={value ?? ''} />
    </fieldset>
  );
}
