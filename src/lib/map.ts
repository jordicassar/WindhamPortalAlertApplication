export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';

export const TOWN_CENTER: [number, number] = [-72.185, 41.71];
export const TOWN_ZOOM = 12;

export const LOCATION_BOUNDS = { west: -72.6, south: 41.4, east: -71.8, north: 42.0 };

export type AlertLocation = { name: string; latitude: number; longitude: number };

export function toLocation(row: {
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
}): AlertLocation | null {
  if (row.latitude === null || row.longitude === null || !row.locationName) return null;
  return { name: row.locationName, latitude: row.latitude, longitude: row.longitude };
}

export function inLocationBounds(latitude: number, longitude: number): boolean {
  const b = LOCATION_BOUNDS;
  return latitude >= b.south && latitude <= b.north && longitude >= b.west && longitude <= b.east;
}
