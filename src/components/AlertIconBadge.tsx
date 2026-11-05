import type { ReactNode } from 'react';
import { ALERT_ICON_IDS, type AlertIconId } from '@/lib/alert-icons';
import { cx } from './ui';

type IconTone = 'brand' | 'info' | 'advisory' | 'emergency';

export { ALERT_ICON_IDS, type AlertIconId };

export const ALERT_ICONS: Record<AlertIconId, { label: string; tone: IconTone }> = {
  general: { label: 'General', tone: 'brand' },
  emergency: { label: 'Emergency', tone: 'emergency' },
  snowplow: { label: 'Snowplow', tone: 'info' },
  weather: { label: 'Weather', tone: 'info' },
  road_closure: { label: 'Road closure', tone: 'advisory' },
  traffic: { label: 'Traffic', tone: 'advisory' },
  construction: { label: 'Construction', tone: 'advisory' },
  water: { label: 'Water', tone: 'info' },
  power: { label: 'Power', tone: 'advisory' },
  fire: { label: 'Fire', tone: 'emergency' },
  health: { label: 'Health', tone: 'info' },
  school: { label: 'School', tone: 'brand' },
  trash: { label: 'Trash & recycling', tone: 'brand' },
  parks: { label: 'Parks', tone: 'brand' },
  meeting: { label: 'Meeting', tone: 'brand' },
  event: { label: 'Event', tone: 'brand' },
};

export const ALERT_ICON_TONE_CLASSES: Record<IconTone, string> = {
  brand: 'bg-brand-soft text-brand',
  info: 'bg-info-soft text-info',
  advisory: 'bg-advisory-soft text-advisory',
  emergency: 'bg-emergency-soft text-emergency',
};

const SIZES = {
  sm: { box: 'size-9 rounded-lg', glyph: 'size-5' },
  md: { box: 'size-12 rounded-xl', glyph: 'size-6' },
  lg: { box: 'size-16 rounded-2xl', glyph: 'size-8' },
} as const;

const GLYPHS: Record<AlertIconId, ReactNode> = {
  general: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h3l8 4V6L7 10H4a1 1 0 0 0-1 1z" />
      <path d="M18.5 9a4 4 0 0 1 0 6" />
    </>
  ),
  emergency: (
    <>
      <path d="M12 3.5 21.5 20h-19z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </>
  ),
  snowplow: (
    <>
      <path d="M2.5 8.5 7 10.5v6l-4.5 2z" />
      <path d="M7 11h7l2.5 3H21v3H7" />
      <circle cx="11" cy="18.5" r="1.5" />
      <circle cx="18" cy="18.5" r="1.5" />
      <path d="M13 5v2M16 6l-1 1.5M10 6l1 1.5" />
    </>
  ),
  weather: (
    <>
      <path d="M7 15.5a4 4 0 0 1 .4-7.9A5.5 5.5 0 0 1 18 8.8a3.4 3.4 0 0 1-.5 6.7z" />
      <path d="M9 18.5 8 21M13 18.5 12 21M17 18.5 16 21" />
    </>
  ),
  road_closure: (
    <>
      <path d="M3 7h18v5H3z" />
      <path d="M8 7 6 12M13 7l-2 5M18 7l-2 5" />
      <path d="M6 12v8M18 12v8" />
    </>
  ),
  traffic: (
    <>
      <rect x="8" y="2.5" width="8" height="19" rx="3" />
      <circle cx="12" cy="7.5" r="1.2" />
      <circle cx="12" cy="12" r="1.2" />
      <circle cx="12" cy="16.5" r="1.2" />
    </>
  ),
  construction: (
    <>
      <path d="M5 16a7 7 0 0 1 14 0" />
      <path d="M3 16h18v3H3z" />
      <path d="M12 9v4" />
      <path d="M9.5 10.5 9 13M14.5 10.5l.5 2.5" />
    </>
  ),
  water: (
    <>
      <path d="M12 3s6 6.4 6 11a6 6 0 0 1-12 0c0-4.6 6-11 6-11z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </>
  ),
  power: <path d="M13 2.5 4.5 14H11l-1 7.5L19.5 10H13z" />,
  fire: <path d="M12 3c.8 3 5 5 5 10a5 5 0 0 1-10 0c0-2 .9-3.2 2-4 0 2 .8 3 2 3-.5-3-.5-6 1-9z" />,
  health: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </>
  ),
  school: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V10l7-5 7 5v11" />
      <path d="M10 21v-5h4v5" />
      <circle cx="12" cy="10.5" r="1.4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16" />
      <path d="M10 7V4.5h4V7" />
      <path d="M6 7l1 13h10l1-13" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  parks: (
    <>
      <path d="M12 21v-6" />
      <path d="M12 15c-4 0-6.5-2.4-6.5-5.4C5.5 6.8 8 4 12 3c4 1 6.5 3.8 6.5 6.6C18.5 12.6 16 15 12 15z" />
    </>
  ),
  meeting: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M17.5 14c2.5 0 4 2 4 4.5" />
    </>
  ),
  event: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14h2M14 14h2M8 17.5h2" />
    </>
  ),
};

type Props = {
  icon: AlertIconId;
  size?: keyof typeof SIZES;
  /** Use when the icon itself conveys information; otherwise it is decorative. */
  labelled?: boolean;
  className?: string;
};

export function AlertIconGlyph({ icon, className }: { icon: AlertIconId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {GLYPHS[icon]}
    </svg>
  );
}

export function AlertIconBadge({ icon, size = 'md', labelled = false, className }: Props) {
  const { label, tone } = ALERT_ICONS[icon];
  const sizeClasses = SIZES[size];

  return (
    <span
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? label : undefined}
      aria-hidden={labelled ? undefined : true}
      className={cx(
        'inline-flex shrink-0 items-center justify-center ring-1 ring-inset ring-border',
        sizeClasses.box,
        ALERT_ICON_TONE_CLASSES[tone],
        className,
      )}
    >
      <AlertIconGlyph icon={icon} className={sizeClasses.glyph} />
    </span>
  );
}
