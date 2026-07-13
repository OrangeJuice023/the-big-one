'use client';

import { useEffect, useRef, useState } from 'react';
import type { Scenario } from '@/lib/scenarios';
import { lossColor, mmiColor } from '@/lib/scenarios';

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
const SPIKE_GROW_MS = 900; // per-LGU spike growth after shaking arrives

// 3D spike geometry/scale (visual encoding, stated on the methodology page).
const SPIKE_RADIUS_M = 320;
const SPIKE_MAX_HEIGHT_M = 16000; // tallest spike (scenario max P50 loss)
const CAMERA = { pitch: 52, bearing: -17 };
const BASEMAPS = {
  minimal: 'https://tiles.openfreemap.org/styles/positron',
  streets: 'https://tiles.openfreemap.org/styles/liberty',
} as const;
type ViewMode = '3d' | '2d';
type Basemap = keyof typeof BASEMAPS;

/** Small n-gon around a centroid, used as the extrusion footprint. */
function spikeFootprint(lon: number, lat: number, n = 12): [number, number][] {
  const dLat = SPIKE_RADIUS_M / 111320;
  const dLon = dLat / Math.cos((lat * Math.PI) / 180);
  const ring: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const a = (2 * Math.PI * i) / n;
    ring.push([lon + dLon * Math.cos(a), lat + dLat * Math.sin(a)]);
  }
  return ring;
}

/**
 * MapLibre GL map on a zero-cost basemap (OpenFreeMap — no API key).
 *
 * Renders three data layers:
 *  1. Choropleth of LGU polygons colored by scenario MMI (ships with repo).
 *  2. Dashed fault trace + bright rupture overlay during simulation.
 *  3. 3D loss spikes (fill-extrusion): one column per LGU, height scaled by
 *     sqrt(P50 loss), color by loss share. During simulation the camera tilts
 *     and spikes grow from the ground as shaking reaches each LGU.
 */
export default function LossMap({ scenario, onSelectLgu, simToken = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const boundariesRef = useRef<any>(null); // raw FeatureCollection or null
  const readyRef = useRef(false);
  const traceRef = useRef<[number, number][]>([]); // fault [lon,lat] vertices
  const scenarioRef = useRef<Scenario | null>(null);
  const animRef = useRef<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('3d');
  const [basemap, setBasemap] = useState<Basemap>('minimal');
  const viewModeRef = useRef<ViewMode>('3d');
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  /** Build spike features; heightScale in [0,1] per LGU (keyed by name). */
  const spikeFeatures = (s: Scenario, heightScale?: (lgu: string) => number) => {
    const maxLoss = Math.max(...s.lgus.map((l) => l.loss_usd.q50));
    return {
      type: 'FeatureCollection',
      features: s.lgus.map((l) => {
        const frac = l.loss_usd.q50 / maxLoss;
        const h =
          SPIKE_MAX_HEIGHT_M * Math.sqrt(frac) * (heightScale ? heightScale(l.lgu) : 1);
        return {
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [spikeFootprint(l.lon, l.lat)] },
          properties: { lgu: l.lgu, height: h, color: lossColor(frac) },
        };
      }),
    };
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const maplibregl = (await import('maplibre-gl')).default;
      await import('maplibre-gl/dist/maplibre-gl.css' as any).catch(() => {});
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: BASEMAPS.minimal,
        center: [121.0, 14.55],
        zoom: 10.1,
        pitch: CAMERA.pitch,
        bearing: CAMERA.bearing,
        attributionControl: { compact: true } as any,
      });
      map.addControl(
        new maplibregl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );
      mapRef.current = map;

      const ensureLayers = async () => {
        if (map.getSource('spikes')) return; // already present on this style
        // Optional choropleth boundaries (shipped with the repo).
        if (!boundariesRef.current) {
          try {
            const res = await fetch('data/lgu-boundaries.geojson');
            if (res.ok) boundariesRef.current = await res.json();
          } catch { /* fall back to circles */ }
        }

        if (boundariesRef.current) {
          map.addSource('lgus', { type: 'geojson', data: boundariesRef.current });
          map.addLayer({
            id: 'lgu-fill',
            type: 'fill',
            source: 'lgus',
            paint: {
              'fill-color': ['coalesce', ['get', 'color'], '#dddddd'],
              'fill-opacity': 0.55,
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
          if (!traceRef.current.length) {
            const ft = await (await fetch('data/fault-trace.geojson')).json();
            traceRef.current = ft.features[0].geometry.coordinates;
          }
          map.addSource('fault', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: [{
                type: 'Feature',
                properties: {},
                geometry: { type: 'LineString', coordinates: traceRef.current },
              }],
            },
          });
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
            paint: { 'line-color': '#ff2d00', 'line-width': 5, 'line-blur': 0.5 },
          });
        } catch { /* trace optional */ }

        // 3D loss spikes.
        map.addSource('spikes', {
          type: 'geojson',
          data: { type: 'FeatureCollection', features: [] },
        });
        map.addLayer({
          id: 'loss-spikes',
          type: 'fill-extrusion',
          source: 'spikes',
          paint: {
            'fill-extrusion-color': ['get', 'color'],
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': 0,
            'fill-extrusion-opacity': 0.92,
          },
        });
        map.on('click', 'loss-spikes', (e: any) => {
          const f = e.features?.[0];
          if (f) onSelectLgu(f.properties.lgu);
        });

        // Centroid labels (and fallback circles when no boundary polygons).
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

        // Respect the current view mode after (re)adding layers.
        map.setLayoutProperty(
          'loss-spikes',
          'visibility',
          viewModeRef.current === '3d' ? 'visible' : 'none'
        );

        readyRef.current = true;
        map.fire('scenario-ready' as any);
      };

      map.on('load', ensureLayers);
      // After a basemap switch (setStyle), sources/layers are wiped — re-add.
      map.on('styledata', () => {
        if (map.isStyleLoaded() && !map.getSource('spikes')) ensureLayers();
      });
    })();
    return () => {
      cancelled = true;
      cancelAnimationFrame(animRef.current);
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
        (map.getSource('lgus') as any).setData({
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
        });
      }

      // Spikes at full height for the steady state.
      (map.getSource('spikes') as any)?.setData(spikeFeatures(scenario));

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

    if (readyRef.current && map.getSource('spikes')) apply();
    map.on('scenario-ready', apply);
    return () => map.off('scenario-ready', apply);
  }, [scenario]);

  // Rupture simulation: camera tilts, fault ruptures progressively, shaking
  // arrives per LGU in distance order, and loss spikes grow from the ground.
  useEffect(() => {
    if (!simToken) return;
    const map = mapRef.current;
    const s = scenarioRef.current;
    const trace = traceRef.current;
    if (!map || !s || trace.length < 2 || !readyRef.current) return;

    cancelAnimationFrame(animRef.current);

    // Cinematic tilt + slow drift while the rupture runs (3D mode only, and
    // only when the user hasn't asked for reduced motion).
    if (viewModeRef.current === '3d' && !reducedMotion) {
      map.easeTo({
        pitch: 60,
        bearing: CAMERA.bearing - 12,
        duration: RUPTURE_MS,
        essential: false,
      });
    }

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
    const arrivalMs = (rrup: number) => WAVE_LEAD_MS + (rrup / WAVE_SPEED_KM_S) * 1000;
    const maxArrival =
      Math.max(...s.lgus.map((l) => arrivalMs(l.rrup_km))) + SPIKE_GROW_MS + 400;
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

      // Phase B: LGUs flip to MMI color as shaking arrives.
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

      // Phase C: spikes grow from the ground after shaking arrives.
      const spikeSrc: any = map.getSource('spikes');
      if (spikeSrc) {
        spikeSrc.setData(
          spikeFeatures(s, (lgu) => {
            const d = byLgu.get(lgu);
            if (!d) return 0;
            const dt = t - arrivalMs(d.rrup_km);
            if (dt <= 0) return 0;
            const p = Math.min(1, dt / SPIKE_GROW_MS);
            return 1 - Math.pow(1 - p, 3); // ease-out growth
          })
        );
      }

      if (t < Math.max(RUPTURE_MS, maxArrival)) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        // End state: clear rupture overlay; spikes remain at full height.
        rupSrc?.setData({ type: 'FeatureCollection', features: [] });
      }
    };
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simToken]);

  // View mode: 3D perspective with spikes vs flat 2D analyst view.
  useEffect(() => {
    viewModeRef.current = viewMode;
    const map = mapRef.current;
    if (!map) return;
    const target =
      viewMode === '3d'
        ? { pitch: CAMERA.pitch, bearing: CAMERA.bearing }
        : { pitch: 0, bearing: 0 };
    if (reducedMotion) map.jumpTo(target);
    else map.easeTo({ ...target, duration: 700 });
    if (map.getLayer('loss-spikes')) {
      map.setLayoutProperty(
        'loss-spikes',
        'visibility',
        viewMode === '3d' ? 'visible' : 'none'
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // Basemap switch: setStyle wipes sources/layers; ensureLayers re-adds them
  // via the 'styledata' listener, then 'scenario-ready' re-applies data.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    readyRef.current = false;
    map.setStyle(BASEMAPS[basemap]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basemap]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <div className="map-controls">
        <div className="seg" role="group" aria-label="View mode">
          <button aria-pressed={viewMode === '3d'} onClick={() => setViewMode('3d')}>
            3D
          </button>
          <button aria-pressed={viewMode === '2d'} onClick={() => setViewMode('2d')}>
            2D
          </button>
        </div>
        <div className="seg" role="group" aria-label="Basemap">
          <button aria-pressed={basemap === 'minimal'} onClick={() => setBasemap('minimal')}>
            Minimal
          </button>
          <button aria-pressed={basemap === 'streets'} onClick={() => setBasemap('streets')}>
            Streets
          </button>
        </div>
      </div>
    </div>
  );
}
