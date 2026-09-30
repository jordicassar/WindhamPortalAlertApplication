import type { AlertStatus, Severity } from '@/generated/prisma/enums';
import { SEVERITY_LABEL, STATUS_LABEL } from '@/lib/format';
import { CheckCircleIcon, InfoIcon, SirenIcon, WarningIcon } from './icons';

/** Small shared building blocks. Kept as class strings so server and client components can use them. */

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const button = {
  base: 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 py-2.5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  primary:
    'border-brand bg-brand text-brand-contrast shadow-card hover:border-brand-hover hover:bg-brand-hover',
  secondary: 'border-border bg-surface shadow-card hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent hover:bg-surface-2',
  danger: 'border-border bg-surface text-emergency hover:bg-emergency-soft',
  small: 'min-h-9 rounded-lg px-3 py-1.5 text-sm',
};

export function btn(
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary',
  small = false,
) {
  return cx(button.base, button[variant], small && button.small);
}

export const input =
  'min-h-12 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-base shadow-[inset_0_1px_2px_rgb(16_24_40/0.05)] transition-colors placeholder:text-muted hover:border-muted focus:border-brand';

/** Visible form label; placeholders alone are hard to read and vanish once typing starts. */
export const label = 'grid gap-1.5 text-base font-semibold';

export const checkbox = 'size-5 shrink-0 cursor-pointer rounded accent-brand';

export const card = 'rounded-2xl border border-border bg-surface shadow-card';

export const SEVERITY_STYLE: Record<Severity, string> = {
  INFO: 'bg-info-soft text-info',
  ADVISORY: 'bg-advisory-soft text-advisory',
  EMERGENCY: 'bg-emergency-soft text-emergency',
};

export function SeverityIcon({ severity, className }: { severity: Severity; className?: string }) {
  const Icon = { INFO: InfoIcon, ADVISORY: WarningIcon, EMERGENCY: SirenIcon }[severity];
  return <Icon className={className} />;
}

const STATUS_STYLE: Record<AlertStatus, string> = {
  DRAFT: 'bg-surface-2 text-muted',
  PENDING: 'bg-advisory-soft text-advisory',
  PUBLISHED: 'bg-ok-soft text-ok',
  REJECTED: 'bg-emergency-soft text-emergency',
  ARCHIVED: 'bg-surface-2 text-muted',
};

const pill =
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-sm font-bold';

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={cx(pill, SEVERITY_STYLE[severity])}>
      <SeverityIcon severity={severity} className="size-3.5" />
      {SEVERITY_LABEL[severity]}
    </span>
  );
}

export function StatusBadge({ status }: { status: AlertStatus }) {
  return <span className={cx(pill, STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex gap-2.5 rounded-xl px-4 py-3 text-base font-medium',
        kind === 'error' ? 'bg-emergency-soft text-emergency' : 'bg-ok-soft text-ok',
      )}
    >
      {kind === 'error' ? (
        <WarningIcon className="mt-0.5 size-5 shrink-0" />
      ) : (
        <CheckCircleIcon className="mt-0.5 size-5 shrink-0" />
      )}
      <p>{children}</p>
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-border bg-surface px-6 py-10 text-center text-lg text-muted">
      {children}
    </div>
  );
}

export function PageTitle({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-3xl font-bold tracking-tight">{children}</h1>
      {aside}
    </div>
  );
}
