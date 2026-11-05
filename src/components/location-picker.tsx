'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMap, Marker } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import {
  LOCATION_BOUNDS,
  MAP_STYLE_URL,
  TOWN_CENTER,
  TOWN_ZOOM,
  type AlertLocation,
} from '@/lib/map';
import { SearchIcon } from './icons';
import { loadMapLibre } from './maplibre';
import { btn, input } from './ui';

type Point = { latitude: number; longitude: number };
type Place = { label: string; detail: string } & Point;

/**
 * Address search uses OpenStreetMap's Nominatim. Its usage policy allows light use like
 * this (staff searching one place at a time, never search-as-you-type).
 * https://operations.osmfoundation.org/policies/nominatim/
 */
async function searchPlaces(query: string): Promise<Place[]> {
  const b = LOCATION_BOUNDS;
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: '5',
    countrycodes: 'us',
    viewbox: `${b.west},${b.north},${b.east},${b.south}`,
    bounded: '1',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const rows: { name?: string; display_name: string; lat: string; lon: string }[] =
    await res.json();
  return rows.map((r) => ({
    label: r.name || r.display_name.split(',')[0],
    detail: r.display_name,
    latitude: Number(r.lat),
    longitude: Number(r.lon),
  }));
}

/**
 * Optional map location for an alert. Writes `latitude`, `longitude` and
 * `locationName` fields into the surrounding form.
 */
export function LocationPicker({
  initial,
  onChange,
}: {
  initial: AlertLocation | null;
  onChange: (location: AlertLocation | null) => void;
}) {
  const [point, setPoint] = useState<Point | null>(
    initial && { latitude: initial.latitude, longitude: initial.longitude },
  );
  const [name, setName] = useState(initial?.name ?? '');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[] | null>(null);
  const [status, setStatus] = useState('');
  const [searching, setSearching] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onChange(point && name.trim() ? { ...point, name: name.trim() } : null);
  }, [point, name, onChange]);

  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((maplibre) => {
        if (cancelled || !container.current) return;
        const map = new maplibre.Map({
          container: container.current,
          style: MAP_STYLE_URL,
          center: initial ? [initial.longitude, initial.latitude] : TOWN_CENTER,
          zoom: initial ? 15 : TOWN_ZOOM,
          attributionControl: { compact: true },
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }));
        map.on('click', (e) => setPoint({ latitude: e.lngLat.lat, longitude: e.lngLat.lng }));

        const marker = new maplibre.Marker({ draggable: true, color: '#b42318' });
        marker.on('dragend', () => {
          const { lat, lng } = marker.getLngLat();
          setPoint({ latitude: lat, longitude: lng });
        });
        mapRef.current = map;
        markerRef.current = marker;
        setReady(true);
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // The map is created once; later changes move the marker instead.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!ready || !map || !marker) return;
    if (point) marker.setLngLat([point.longitude, point.latitude]).addTo(map);
    else marker.remove();
  }, [ready, point]);

  async function search() {
    const q = query.trim();
    if (!q || searching) return;
    setSearching(true);
    setStatus('Searching…');
    try {
      const places = await searchPlaces(q);
      setResults(places);
      setStatus(
        places.length
          ? `${places.length} ${places.length === 1 ? 'place' : 'places'} found.`
          : 'No places found near Windham. Try another spelling, or click the map.',
      );
    } catch {
      setResults(null);
      setStatus('Search isn’t available right now. Click the map to place the pin instead.');
    } finally {
      setSearching(false);
    }
  }

  function choose(place: Place) {
    setPoint({ latitude: place.latitude, longitude: place.longitude });
    setName(place.label);
    setResults(null);
    setStatus(`Location set to ${place.label}.`);
    mapRef.current?.jumpTo({ center: [place.longitude, place.latitude], zoom: 16 });
  }

  function clear() {
    setPoint(null);
    setName('');
    setStatus('Location removed.');
  }

  return (
    <fieldset className="grid gap-2">
      <legend className="text-sm font-semibold">Location on the map (optional)</legend>
      <p className="text-sm text-muted">
        Search for an address or place, or click the map. Drag the pin to adjust it.
      </p>

      <div className="flex gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            // Enter searches instead of submitting the alert.
            if (e.key === 'Enter') {
              e.preventDefault();
              void search();
            }
          }}
          placeholder="e.g. 979 Main St or Windham Center School"
          aria-label="Search for an address or place"
          className={input}
        />
        <button type="button" onClick={search} disabled={searching} className={btn()}>
          <SearchIcon className="size-5" />
          Search
        </button>
      </div>

      <p role="status" className="text-sm text-muted empty:hidden">
        {status}
      </p>
      {results && results.length > 0 && (
        <ul className="grid gap-1">
          {results.map((place) => (
            <li key={`${place.latitude},${place.longitude}`}>
              <button
                type="button"
                onClick={() => choose(place)}
                className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-surface-2"
              >
                <span className="font-semibold">{place.label}</span>
                <span className="block text-muted">{place.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div
        ref={container}
        role="region"
        aria-label="Map for placing the alert's location"
        className="relative h-72 overflow-hidden rounded-xl border border-border bg-surface-2"
      >
        {failed && (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-muted">
            The map couldn&rsquo;t load. You can still find the place with the search above.
          </p>
        )}
      </div>
      <p className="text-xs text-muted">
        Search by{' '}
        <a href="https://nominatim.openstreetmap.org/" className="underline">
          OpenStreetMap Nominatim
        </a>
        .
      </p>

      {point && (
        <div className="grid items-end gap-2 sm:grid-cols-[1fr_auto]">
          <label className="grid gap-1 text-sm font-semibold">
            Location in words (read out instead of the map)
            <input
              name="locationName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={120}
              required
              placeholder="e.g. Main St at Route 6"
              className={input}
            />
          </label>
          <button type="button" onClick={clear} className={btn('danger')}>
            Remove location
          </button>
        </div>
      )}
      <input type="hidden" name="latitude" value={point?.latitude.toFixed(6) ?? ''} />
      <input type="hidden" name="longitude" value={point?.longitude.toFixed(6) ?? ''} />
    </fieldset>
  );
}
