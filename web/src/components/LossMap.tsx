'use client';

import { useEffect, useRef } from 'react';
import type { Scenario } from '@/lib/scenarios';
import { mmiColor } from '@/lib/scenarios';

type Props = {
  scenario: Scenario | null;
  onSelectLgu: (lgu: string) => void;
  /** Increment to trigger the rupture simulation animation. */
  simToken?: number;
};

// Animation timing: rupture propagates along the fault, then shaking arrives
// at each LGU after (rrup / WAVE_SPEED). Speeds are visually compressed —
// real S-waves travel ~3.5 km/s; we render faster so the cascade is legible.
const RUPTURE_MS = 2200;
const WAVE_SPEED_KM_S = 9;
const WAVE_LEAD_MS = 400;

/**
 * MapLibre GL map on a zero-cost basemap (OpenFreeMap — no API key).
 *
 * If public/data/lgu-boundaries.geojson is present (it ships with the repo),
 * LGU polygons are rendered as a choropleth colored by scenario MMI, with
 * labels at LGU centroids. Without it, the map falls back to circle markers
 * sized by P50 loss. The fault trace renders in both modes.
 */
export default function LossMap({ scenario, onSelectLgu, simToken = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const boundariesRef = useRef<any>(null); // raw FeatureCollection or null
  const readyRef = useRef(false);
  const traceRef = useRef<[number, number][]>([]); // fault [lon,lat] vertices
  const scenarioRef = useRef<Scenario | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css' as any).catch(() => {});
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: 'https://tiles.openfreemap.org/styles/positron',
        center: [121.02, 14.58],
        zoom: 10.4,
        attributionControl: { compact: true } as any,
      });
      map.addControl(new maplibregl.NavigationControl(), 'top-right');
      mapRef.current = map;

      map.on('load', async () => {
        // Optional choropleth boundaries (shipped with the repo).
        try {
          const res = await fetch('data/lgu-boundaries.geojson');
          if (res.ok) boundariesRef.current = await res.json();
        } catch { /* fall back to circles */ }

        if (boundariesRef.current) {
          map.addSource('lgus', { type: 'geojson', data: boundariesRef.current });
          map.addLayer({
            id: 'lgu-fill',
            type: 'fill',
            source: 'lgus',
            paint: {
              'fill-color': ['coalesce', ['get', 'color'], '#dddddd'],
              'fill-opacity': 0.62,
            },
          });
          map.addLayer({
            id: 'lgu-outline',
            type: 'line',
            source: 'lgus',
            paint: { 'line-color': '#5b5b5b', 'line-width': 0.8 },
          });
          map.on('click', 'lgu-fill', (e: any) => {
            const f = e.features?.[0];
            if (f) onSelectLgu(f.properties.lgu);
          });
          map.on('mouseenter', 'lgu-fill', () => (map.getCanvas().style.cursor = 'pointer'));
          map.on('mouseleave', 'lgu-fill', () => (map.getCanvas().style.cursor = ''));
        }

        // Fault trace above the fills.
        try {
          const ft = await (await fetch('data/fault-trace.geojson')).json();
          traceRef.current = ft.features[0].geometry.coordinates;
          map.addSource('fault', { type: 'geojson', data: ft });
          map.addLayer({
            id: 'fault-line',
            type: 'line',
            source: 'fault',
            paint: { 'line-color': '#7a0000', 'line-width': 2.5, 'line-dasharray': [2, 1.5] },
          });
          // Bright overlay line that "grows" during the rupture simulation.
          map.addSource('rupture', {
            type: 'geojson',
            data: { type: 'FeatureCollection', features: [] },
          });
          map.addLayer({
            id: 'rupture-line',
            type: 'line',
            source: 'rupture',
            paint: {
              'line-color': '#ff2d00',
              'line-width': 5,
              'line-blur': 0.5,
            },
          });
        } catch { /* trace optional */ }

        // Centroid markers: labels always; circles only in fallback mode.
        map.addSource('markers', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        if (!boundariesRef.current) {
          map.addLayer({
            id: 'lgu-circles',
            type: 'circle',
            source: 'markers',
            paint: {
              'circle-radius': ['get', 'radius'],
              'circle-color': ['get', 'color'],
              'circle-opacity': 0.85,
              'circle-stroke-color': '#333',
              'circle-stroke-width': 1,
            },
          });
          map.on('click', 'lgu-circles', (e: any) => {
            const f = e.features?.[0];
            if (f) onSelectLgu(f.properties.lgu);
          });
        }
        map.addLayer({
          id: 'lgu-labels',
          type: 'symbol',
          source: 'markers',
          layout: {
            'text-field': ['get', 'lgu'],
            'text-size': 10.5,
            'text-font': ['Noto Sans Regular'],
          },
          paint: { 'text-color': '#2b2b2b', 'text-halo-color': '#ffffff', 'text-halo-width': 1.2 },
        });

        readyRef.current = true;
        map.fire('scenario-ready' as any);
      });
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      readyRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push scenario data into the map whenever it changes.
  useEffect(() => {
    const map = mapRef.current;
    scenarioRef.current = scenario;
    if (!map || !scenario) return;

    const apply = () => {
      const byLgu = new Map(scenario.lgus.map((l) => [l.lgu, l]));

      // Choropleth: recolor polygons by MMI.
      if (boundariesRef.current && map.getSource('lgus')) {
        const colored = {
          ...boundariesRef.current,
          features: boundariesRef.current.features.map((f: any) => {
            const d = byLgu.get(f.properties.lgu);
            return {
              ...f,
              properties: {
                ...f.properties,
                color: d ? mmiColor(d.mmi) : '#dddddd',
                mmi: d?.mmi ?? null,
              },
            };
          }),
        };
        (map.getSource('lgus') as any).setData(colored);
      }

      // Centroids: labels (and circles in fallback mode).
      const maxLoss = Math.max(...scenario.lgus.map((l) => l.loss_usd.q50));
      (map.getSource('markers') as any)?.setData({
        type: 'FeatureCollection',
        features: scenario.lgus.map((l) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [l.lon, l.lat] },
          properties: {
            lgu: l.lgu,
            radius: 6 + 22 * Math.sqrt(l.loss_usd.q50 / maxLoss),
            color: mmiColor(l.mmi),
          },
        })),
      });
    };

    if (readyRef.current) apply();
    else map.once('scenario-ready', apply);
  }, [scenario]);

  // Rupture simulation: progressive fault rupture, then per-LGU shaking
  // arrival ordered by distance to the fault (uses each LGU's rrup_km).
  useEffect(() => {
    if (!simToken) return;
    const map = mapRef.current;
    const s = scenarioRef.current;
    const trace = traceRef.current;
    if (!map || !s || trace.length < 2 || !readyRef.current) return;

    cancelAnimationFrame(animRef.current);

    // Cumulative planar lengths along the trace (visual interpolation only).
    const cum: number[] = [0];
    for (let i = 1; i < trace.length; i++) {
      const dx = trace[i][0] - trace[i - 1][0];
      const dy = trace[i][1] - trace[i - 1][1];
      cum.push(cum[i - 1] + Math.hypot(dx, dy));
    }
    const total = cum[cum.length - 1];

    const partialTrace = (frac: number): [number, number][] => {
      const target = frac * total;
      const pts: [number, number][] = [trace[0]];
      for (let i = 1; i < trace.length; i++) {
        if (cum[i] <= target) {
          pts.push(trace[i]);
        } else {
          const seg = cum[i] - cum[i - 1];
          const t = seg > 0 ? (target - cum[i - 1]) / seg : 0;
          pts.push([
            trace[i - 1][0] + t * (trace[i][0] - trace[i - 1][0]),
            trace[i - 1][1] + t * (trace[i][1] - trace[i - 1][1]),
          ]);
          break;
        }
      }
      return pts;
    };

    const byLgu = new Map(s.lgus.map((l) => [l.lgu, l]));
    const arrivalMs = (rrup: number) =>
      WAVE_LEAD_MS + (rrup / WAVE_SPEED_KM_S) * 1000;
    const maxArrival =
      Math.max(...s.lgus.map((l) => arrivalMs(l.rrup_km))) + 600;
    const start = performance.now();

    const frame = (now: number) => {
      const t = now - start;

      // Phase A: rupture grows along the fault.
      const rupSrc: any = map.getSource('rupture');
      if (rupSrc) {
        const frac = Math.min(1, t / RUPTURE_MS);
        rupSrc.setData({
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: partialTrace(frac) },
          }],
        });
      }

      // Phase B: LGUs flip from neutral to MMI color as shaking arrives.
      if (boundariesRef.current && map.getSource('lgus')) {
        (map.getSource('lgus') as any).setData({
          ...boundariesRef.current,
          features: boundariesRef.current.features.map((f: any) => {
            const d = byLgu.get(f.properties.lgu);
            const arrived = d && t >= arrivalMs(d.rrup_km);
            return {
              ...f,
              properties: {
                ...f.properties,
                color: arrived ? mmiColor(d!.mmi) : '#e8e6e1',
                mmi: d?.mmi ?? null,
              },
            };
          }),
        });
      }

      if (t < Math.max(RUPTURE_MS, maxArrival)) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // End state: fade the rupture overlay, restore steady colors.
        rupSrc?.setData({ type: 'FeatureCollection', features: [] });
      }
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simToken]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}
