'use client';

type MapLibre = typeof import('maplibre-gl');

let loading: Promise<MapLibre> | null = null;

/**
 * Loads MapLibre the first time a map is shown, so pages without a map (or residents
 * who never open it) don't download it.
 */
export function loadMapLibre(): Promise<MapLibre> {
  loading ??= import('maplibre-gl')
    .then((maplibre) => {
      maplibre.setWorkerUrl(
        new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href,
      );
      return maplibre;
    })
    .catch((error) => {
      loading = null;
      throw error;
    });
  return loading;
}
