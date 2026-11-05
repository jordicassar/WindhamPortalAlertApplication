'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapLibreMap } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import type { Severity } from '@/generated/prisma/enums';
import { SEVERITY_LABEL } from '@/lib/format';
import { MAP_STYLE_URL, TOWN_CENTER, TOWN_ZOOM, type AlertLocation } from '@/lib/map';
import { loadMapLibre } from './maplibre';
import { cx } from './ui';

export type MapAlert = { id: string; title: string; severity: Severity; location: AlertLocation };

// The map is always light, even in dark mode, so pins use the light theme's strong
// severity colours rather than the theme tokens (which turn pale in dark mode).
const PIN_STYLE: Record<Severity, string> = {
  INFO: 'bg-[#1c3664]',
  ADVISORY: 'bg-[#8f4f06]',
  EMERGENCY: 'bg-[#b42318]',
};

const SEVERITY_ORDER: Record<Severity, number> = { INFO: 0, ADVISORY: 1, EMERGENCY: 2 };

export function AlertMap({
  alerts,
  label,
  linkPins = true,
  className = 'h-[26rem]',
}: {
  alerts: MapAlert[];
  label: string;
  linkPins?: boolean;
  className?: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const libRef = useRef<Awaited<ReturnType<typeof loadMapLibre>> | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMapLibre()
      .then((maplibre) => {
        if (cancelled || !container.current) return;
        libRef.current = maplibre;
        const map = new maplibre.Map({
          container: container.current,
          style: MAP_STYLE_URL,
          center: TOWN_CENTER,
          zoom: TOWN_ZOOM,
          // Scrolling the page shouldn't zoom the map; it takes Ctrl/⌘ + scroll or two fingers.
          cooperativeGestures: true,
          attributionControl: { compact: true },
        });
        map.addControl(new maplibre.NavigationControl({ showCompass: false }));
        mapRef.current = map;
        setReady(true);
      })
      // No WebGL, or the library didn't download: the text list still has everything.
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const maplibre = libRef.current;
    if (!ready || !map || !maplibre) return;

    const sorted = [...alerts].sort(
      (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity],
    );
    const pins = sorted.map((a) =>
      new maplibre.Marker({ element: pinElement(a, linkPins), anchor: 'center' })
        .setLngLat([a.location.longitude, a.location.latitude])
        .addTo(map),
    );

    if (sorted.length === 1) {
      map.jumpTo({ center: pins[0].getLngLat(), zoom: 15 });
    } else if (sorted.length > 1) {
      const bounds = new maplibre.LngLatBounds();
      for (const pin of pins) bounds.extend(pin.getLngLat());
      // Extra room at the bottom keeps pins clear of the map credits.
      map.fitBounds(bounds, {
        padding: { top: 56, right: 56, bottom: 80, left: 56 },
        maxZoom: 15,
        animate: false,
      });
    }
    return () => pins.forEach((pin) => pin.remove());
  }, [ready, alerts, linkPins]);

  return (
    <div
      ref={container}
      role="region"
      aria-label={label}
      className={cx(
        'relative overflow-hidden rounded-2xl border border-border bg-surface-2',
        className,
      )}
    >
      {failed && (
        <p className="absolute inset-0 grid place-items-center p-6 text-center text-muted">
          The map couldn&rsquo;t load. Every location is also listed in words.
        </p>
      )}
    </div>
  );
}

function pinElement(alert: MapAlert, link: boolean): HTMLElement {
  const el = document.createElement(link ? 'a' : 'span');
  if (el instanceof HTMLAnchorElement) el.href = `/alerts/${alert.id}`;
  el.className = cx(
    'block size-6 rounded-full border-[3px] border-white shadow-raised',
    link && 'cursor-pointer focus-visible:outline-3 focus-visible:outline-offset-2',
    PIN_STYLE[alert.severity],
  );
  const description = `${SEVERITY_LABEL[alert.severity]}: ${alert.title}, ${alert.location.name}`;
  el.title = description;
  if (link) el.setAttribute('aria-label', description);
  else el.setAttribute('aria-hidden', 'true');
  return el;
}
