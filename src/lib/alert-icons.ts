export const ALERT_ICON_IDS = [
  'general',
  'emergency',
  'snowplow',
  'weather',
  'road_closure',
  'traffic',
  'construction',
  'water',
  'power',
  'fire',
  'health',
  'school',
  'trash',
  'parks',
  'meeting',
  'event',
] as const;

export type AlertIconId = (typeof ALERT_ICON_IDS)[number];

/** Match common category names; categories without a specific match use the general icon. */
export function getDefaultAlertIcon(categoryName: string): AlertIconId {
  const category = categoryName.toLowerCase();
  if (/emergency|urgent|safety/.test(category)) return 'emergency';
  if (/snow|plow|winter/.test(category)) return 'snowplow';
  if (/school|education/.test(category)) return 'school';
  if (/water|sewer|hydrant/.test(category)) return 'water';
  if (/weather|storm|flood|hurricane/.test(category)) return 'weather';
  if (/road|street|closure|paving/.test(category)) return 'road_closure';
  if (/traffic|parking|transport/.test(category)) return 'traffic';
  if (/construction|building/.test(category)) return 'construction';
  if (/power|electric|utility/.test(category)) return 'power';
  if (/fire/.test(category)) return 'fire';
  if (/health|medical/.test(category)) return 'health';
  if (/trash|waste|recycling/.test(category)) return 'trash';
  if (/park|recreation|tree/.test(category)) return 'parks';
  if (/meeting|government|town hall/.test(category)) return 'meeting';
  if (/event|festival|community/.test(category)) return 'event';
  return 'general';
}
