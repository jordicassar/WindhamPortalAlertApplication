/**
 * A form field people never see or reach, but simple bots fill in because they
 * complete every input. Server actions treat any submission with a value here as
 * a bot. Hidden with off-screen positioning (not display:none, which many bots
 * skip), removed from the tab order, and hidden from screen readers.
 */

export const HONEYPOT_FIELD = 'website';

export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
      <label>
        Leave this field empty
        <input type="text" name={HONEYPOT_FIELD} tabIndex={-1} autoComplete="off" defaultValue="" />
      </label>
    </div>
  );
}

export function isHoneypotFilled(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  return typeof value === 'string' && value.trim() !== '';
}
