import { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { LatLng, Step, Transport } from "../types";
import { resolvedPosition } from "../hooks/useItinerary";
import { easeInOutCubic, partialPath, pointAlong, totalLength } from "../lib/geo";
import { applyInkTheme, firstSymbolLayer, STYLE_URL } from "../lib/mapTheme";
import { choiceElement, stopElement, vehicleElement } from "./mapIcons";

const TOP_INSET = 96; // px of UI chrome at the top of the viewport
const ARRIVAL_PITCH = 48; // cinematic tilt when the camera settles on a stop
const DEFAULT_SHEET = { idle: 340, traveling: 170 };

export interface MapViewProps {
  steps: Step[];
  stepIndex: number;
  step: Step;
  phase: "idle" | "traveling";
  journeyKey: number;
  choices: Record<string, string>;
  activeLeg: LatLng[] | null;
  accent: string;
  /** Current measured height of the bottom sheet (px). */
  sheetHeight: number;
  overviewKey: number;
  onArrived: () => void;
  onProgress: (t: number) => void;
}

const DAY_ACCENT = { 1: "#f5b547", 2: "#2dd4bf" } as const;

/** Travel animation length by mode (ms). */
function legDuration(transport: Transport | undefined, metres: number) {
  switch (transport) {
    case "train":
      return 4200;
    case "car":
      return Math.min(3200, 1800 + metres / 12);
    case "scooter":
      return Math.min(3000, 1700 + metres / 10);
    default:
      return 1900;
  }
}

const toLngLat = (p: LatLng): [number, number] => [p[1], p[0]];

function lineFeature(points: LatLng[], color: string): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: { color },
    geometry: { type: "LineString", coordinates: points.map(toLngLat) },
  };
}

function legFor(steps: Step[], i: number, choices: Record<string, string>): LatLng[] {
  const from = resolvedPosition(steps[i - 1], choices);
  return [from, ...(steps[i].route ?? []), steps[i].coordinates];
}

function paddingFor(sheetHeight: number): maplibregl.PaddingOptions {
  return { top: TOP_INSET + 16, bottom: sheetHeight + 24, left: 36, right: 36 };
}

function paddingEqual(a: maplibregl.PaddingOptions, b: maplibregl.PaddingOptions) {
  return a.top === b.top && a.bottom === b.bottom && a.left === b.left && a.right === b.right;
}

/**
 * Camera (center + zoom) that fits `points` inside the viewport minus `pad`,
 * for a north-up, top-down view. Computed by hand because MapLibre's
 * `fitBounds` adds its padding option on top of the map's existing padding.
 */
function cameraForPoints(map: maplibregl.Map, points: LatLng[], pad: maplibregl.PaddingOptions, maxZoom: number) {
  const canvas = map.getCanvas();
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const mercs = points.map((p) => maplibregl.MercatorCoordinate.fromLngLat(toLngLat(p)));
  const xs = mercs.map((m) => m.x);
  const ys = mercs.map((m) => m.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const availW = Math.max(40, width - pad.left - pad.right);
  const availH = Math.max(40, height - pad.top - pad.bottom);
  const dx = maxX - minX;
  const dy = maxY - minY;
  const worldSize = Math.min(dx > 0 ? availW / dx : Infinity, dy > 0 ? availH / dy : Infinity);
  const zoom = Number.isFinite(worldSize) ? Math.min(maxZoom, Math.log2(worldSize / 512)) : maxZoom;
  const center = new maplibregl.MercatorCoordinate((minX + maxX) / 2, (minY + maxY) / 2).toLngLat();
  return { center, zoom: Math.max(map.getMinZoom(), zoom) };
}

export default function MapView(props: MapViewProps) {
  const {
    steps,
    stepIndex,
    step,
    phase,
    journeyKey,
    choices,
    activeLeg,
    accent,
    sheetHeight,
    overviewKey,
    onArrived,
    onProgress,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [ready, setReady] = useState(false);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const vehicleRef = useRef<maplibregl.Marker | null>(null);

  // Last measured sheet height per phase, so a flight can target the padding
  // the *next* phase will need before that sheet has rendered.
  const sheetSizes = useRef({ ...DEFAULT_SHEET });
  if (sheetHeight > 0) sheetSizes.current[phase] = sheetHeight;

  // Latest values the animation effect reads without re-triggering.
  const latest = useRef({ phase, activeLeg, step, onArrived, onProgress, accent });
  latest.current = { phase, activeLeg, step, onArrived, onProgress, accent };

  /* ── Init ─────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: toLngLat(step.coordinates),
      zoom: step.zoom ?? 15,
      pitch: ARRIVAL_PITCH,
      minZoom: 4,
      maxZoom: 18,
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      touchPitch: false,
      fadeDuration: 250,
      cooperativeGestures: false,
    });
    map.touchZoomRotate.disableRotation();
    map.setPadding(paddingFor(sheetSizes.current.idle));
    // The basemap style references a couple of sprite icons we don't ship; provide a blank so MapLibre stays quiet.
    map.on("styleimagemissing", (e) => {
      if (!map.hasImage(e.id)) map.addImage(e.id, { width: 1, height: 1, data: new Uint8Array(4) });
    });

    map.on("style.load", () => {
      applyInkTheme(map);
      const beforeId = firstSymbolLayer(map);

      map.addSource("legs", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
      map.addSource("active", { type: "geojson", data: lineFeature([], "#fff") });

      map.addLayer(
        {
          id: "legs-line",
          type: "line",
          source: "legs",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 3, "line-opacity": 0.5 },
        },
        beforeId,
      );
      map.addLayer(
        {
          id: "active-glow",
          type: "line",
          source: "active",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 16, "line-opacity": 0.22, "line-blur": 6 },
        },
        beforeId,
      );
      map.addLayer(
        {
          id: "active-core",
          type: "line",
          source: "active",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": ["get", "color"], "line-width": 3.5, "line-opacity": 1 },
        },
        beforeId,
      );
      setReady(true);
    });

    mapRef.current = map;
    if (import.meta.env.DEV || (window as unknown as { __debugMap?: boolean }).__debugMap) {
      (window as unknown as { __map?: maplibregl.Map }).__map = map;
    }
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── Keep camera padding in sync with the sheet (only while idle) ──────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || sheetHeight <= 0) return;
    const desired = paddingFor(sheetHeight);
    const apply = () => {
      if (!mapRef.current || map.isMoving()) return;
      if (!paddingEqual(map.getPadding(), desired)) map.easeTo({ padding: desired, duration: 320, essential: true });
    };
    if (map.isMoving()) {
      map.once("moveend", apply);
      return () => {
        map.off("moveend", apply);
      };
    }
    apply();
  }, [ready, sheetHeight]);

  /* ── Completed legs ────────────────────────────────────────────────────── */
  const completed = useMemo(() => {
    const last = phase === "traveling" ? stepIndex - 1 : stepIndex;
    const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
    for (let i = 1; i <= last; i++) features.push(lineFeature(legFor(steps, i, choices), DAY_ACCENT[steps[i].day]));
    return { type: "FeatureCollection", features } as GeoJSON.FeatureCollection;
  }, [steps, stepIndex, phase, choices]);

  useEffect(() => {
    if (!ready) return;
    (mapRef.current?.getSource("legs") as maplibregl.GeoJSONSource | undefined)?.setData(completed);
  }, [ready, completed]);

  /* ── Stop + choice markers ─────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    steps.forEach((s, i) => {
      if (i > stepIndex) return;
      const isCurrent = i === stepIndex;
      if (isCurrent && phase === "traveling") return;
      const sameSpot = s.coordinates[0] === step.coordinates[0] && s.coordinates[1] === step.coordinates[1];
      if (!isCurrent && sameSpot && phase !== "traveling") return;
      const m = new maplibregl.Marker({
        element: stopElement({ index: i, iconType: s.iconType, state: isCurrent ? "current" : "visited", accent: DAY_ACCENT[s.day] }),
        anchor: "center",
      })
        .setLngLat(toLngLat(s.coordinates))
        .addTo(map);
      markersRef.current.push(m);
    });

    steps.forEach((s, i) => {
      if (i > stepIndex || !s.choices) return;
      const chosen = s.choices.options.find((o) => o.id === choices[s.id]);
      if (!chosen) return;
      const m = new maplibregl.Marker({ element: choiceElement(chosen.emoji, DAY_ACCENT[s.day]), anchor: "bottom" })
        .setLngLat(toLngLat(chosen.coordinates))
        .addTo(map);
      markersRef.current.push(m);
    });
  }, [ready, steps, stepIndex, step, phase, choices]);

  /* ── Camera + travel animation ─────────────────────────────────────────── */
  // Keyed on the step/journey, NOT on phase, so the ARRIVED dispatch doesn't re-trigger a flight.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const { phase, activeLeg, step, onArrived, onProgress, accent } = latest.current;
    let cancelled = false;
    let raf = 0;
    const timers: number[] = [];
    const later = (fn: () => void, ms: number) => {
      timers.push(window.setTimeout(() => !cancelled && fn(), ms));
    };
    const dest = toLngLat(step.coordinates);
    const zoom = step.zoom ?? 15;
    const active = map.getSource("active") as maplibregl.GeoJSONSource | undefined;

    const settle = (duration = 1400) =>
      map.flyTo({
        center: dest,
        zoom,
        pitch: ARRIVAL_PITCH,
        bearing: 0,
        padding: paddingFor(sheetSizes.current.idle),
        duration,
        essential: true,
        curve: 1.3,
      });

    if (phase === "traveling" && activeLeg && activeLeg.length >= 2) {
      const pad = paddingFor(sheetSizes.current.traveling);
      const cam = cameraForPoints(map, activeLeg, pad, 16);
      map.flyTo({ ...cam, pitch: 0, bearing: 0, padding: pad, duration: 1150, essential: true, curve: 1.2 });

      active?.setData(lineFeature([activeLeg[0]], accent));
      vehicleRef.current?.remove();
      const vehicle = new maplibregl.Marker({ element: vehicleElement(step.transport ?? "walk", accent), anchor: "center" })
        .setLngLat(toLngLat(activeLeg[0]))
        .addTo(map);
      vehicleRef.current = vehicle;
      const core = vehicle.getElement().querySelector<HTMLElement>(".vehicle-core");

      const metres = totalLength(activeLeg);
      const duration = legDuration(step.transport, metres);

      later(() => {
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / duration);
          const e = easeInOutCubic(t);
          active?.setData(lineFeature(partialPath(activeLeg, e), accent));
          const { point, heading } = pointAlong(activeLeg, e);
          vehicle.setLngLat(toLngLat(point));
          if (core) core.style.transform = heading < 0 ? "scaleX(-1)" : "scaleX(1)";
          onProgress(e);
          if (t < 1) {
            raf = requestAnimationFrame(tick);
          } else {
            later(() => {
              settle(1400);
              later(() => {
                vehicle.remove();
                if (vehicleRef.current === vehicle) vehicleRef.current = null;
                active?.setData(lineFeature([], accent));
                onArrived();
              }, 1450);
            }, 220);
          }
        };
        raf = requestAnimationFrame(tick);
      }, 1250);
    } else {
      active?.setData(lineFeature([], accent));
      vehicleRef.current?.remove();
      vehicleRef.current = null;
      settle(1200);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, stepIndex, journeyKey]);

  /* ── "Show the day so far" ─────────────────────────────────────────────── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || overviewKey === 0) return;
    const pts: LatLng[] = [];
    for (let i = 0; i <= stepIndex; i++) {
      if (steps[i].day !== step.day) continue;
      pts.push(steps[i].coordinates, resolvedPosition(steps[i], choices));
      if (i > 0) pts.push(...(steps[i].route ?? []));
    }
    if (pts.length === 0) return;
    const pad = paddingFor(sheetSizes.current[latest.current.phase]);
    const cam = cameraForPoints(map, pts, pad, 16);
    map.flyTo({ ...cam, pitch: 0, bearing: 0, padding: pad, duration: 1100, essential: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overviewKey]);

  return <div ref={containerRef} className="h-full w-full" />;
}
