import type { AlertStatus, Severity } from '@/generated/prisma/enums';
import { SEVERITY_LABEL, STATUS_LABEL } from '@/lib/format';

/** Small shared building blocks. Kept as class strings so server and client components can use them. */

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export const button = {
  base: 'inline-flex items-center justify-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60',
  primary: 'border-brand bg-brand text-brand-contrast hover:bg-brand-hover',
  secondary: 'border-border bg-surface hover:bg-surface-2',
  ghost: 'border-transparent bg-transparent hover:bg-surface-2',
  danger: 'border-border bg-surface text-emergency hover:bg-emergency-soft',
  small: 'px-2.5 py-1 text-xs',
};

export function btn(
  variant: 'primary' | 'secondary' | 'ghost' | 'danger' = 'secondary',
  small = false,
) {
  return cx(button.base, button[variant], small && button.small);
}

export const input =
  'w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted';

export const card = 'rounded-xl border border-border bg-surface shadow-sm';

const SEVERITY_STYLE: Record<Severity, string> = {
  INFO: 'bg-info-soft text-info',
  ADVISORY: 'bg-advisory-soft text-advisory',
  EMERGENCY: 'bg-emergency-soft text-emergency',
};

export const SEVERITY_BORDER: Record<Severity, string> = {
  INFO: 'border-l-info',
  ADVISORY: 'border-l-advisory',
  EMERGENCY: 'border-l-emergency',
};

const STATUS_STYLE: Record<AlertStatus, string> = {
  DRAFT: 'bg-surface-2 text-muted',
  PENDING: 'bg-advisory-soft text-advisory',
  PUBLISHED: 'bg-ok-soft text-ok',
  REJECTED: 'bg-emergency-soft text-emergency',
  ARCHIVED: 'bg-surface-2 text-muted',
};

const pill = 'inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold';

export function SeverityBadge({ severity }: { severity: Severity }) {
  return <span className={cx(pill, SEVERITY_STYLE[severity])}>{SEVERITY_LABEL[severity]}</span>;
}

export function StatusBadge({ status }: { status: AlertStatus }) {
  return <span className={cx(pill, STATUS_STYLE[status])}>{STATUS_LABEL[status]}</span>;
}

export function Notice({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  return (
    <p
      role={kind === 'error' ? 'alert' : 'status'}
      className={cx(
        'rounded-lg px-3 py-2 text-sm font-medium',
        kind === 'error' ? 'bg-emergency-soft text-emergency' : 'bg-ok-soft text-ok',
      )}
    >
      {children}
    </p>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">
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
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{children}</h1>
      {aside}
    </div>
  );
}
