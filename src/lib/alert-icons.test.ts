import { describe, expect, it } from 'vitest';
import { ALERT_ICON_IDS, getDefaultAlertIcon } from './alert-icons';

describe('alert icon defaults', () => {
  it('provides a default icon for common alert categories', () => {
    expect(getDefaultAlertIcon('Roads & Traffic')).toBe('road_closure');
    expect(getDefaultAlertIcon('Weather')).toBe('weather');
    expect(getDefaultAlertIcon('Schools (BOE)')).toBe('school');
    expect(getDefaultAlertIcon('Public Safety')).toBe('emergency');
    expect(getDefaultAlertIcon('Water & Utilities')).toBe('water');
    expect(getDefaultAlertIcon('Community Events')).toBe('event');
    expect(getDefaultAlertIcon('Town Government')).toBe('meeting');
    expect(getDefaultAlertIcon('Something new')).toBe('general');
  });

  it('keeps the fixed icon set unique', () => {
    expect(new Set(ALERT_ICON_IDS).size).toBe(ALERT_ICON_IDS.length);
  });
});
