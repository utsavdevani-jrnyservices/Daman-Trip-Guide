import type { LatLng } from "../types";
import { ROUTES } from "../data/routes";
import { haversine } from "./geo";

// Western-line rail geometry between Andheri and Vapi (rough track alignment).
const RAIL: LatLng[] = [
  [19.1196, 72.8464], // Andheri
  [19.229, 72.857], // Borivali
  [19.4559, 72.8111], // Virar
  [19.6967, 72.7644], // Palghar
  [19.98, 72.74], // Dahanu Road
  [20.2, 72.83], // Umbergaon
  [20.3735, 72.9084], // Vapi
];

const ALL: { from: LatLng; to: LatLng; points: LatLng[]; km: number }[] = [
  { from: RAIL[0], to: RAIL[RAIL.length - 1], points: RAIL, km: 170 },
  ...Object.values(ROUTES),
];

const near = (a: LatLng, b: LatLng) => haversine(a, b) < 30;

/**
 * Real road / walking geometry between two points, looked up by endpoints
 * (either direction). Falls back to a straight line when no leg was fetched.
 */
export function routeBetween(from: LatLng, to: LatLng): { points: LatLng[]; km: number } {
  for (const r of ALL) {
    // Routes are matched on the endpoints they were requested for (OSRM snaps the
    // geometry to the nearest road, which can be well away from the pin).
    if (near(r.from, from) && near(r.to, to)) return { points: [from, ...r.points, to], km: r.km };
    if (near(r.from, to) && near(r.to, from)) return { points: [from, ...[...r.points].reverse(), to], km: r.km };
  }
  return { points: [from, to], km: +(haversine(from, to) / 1000).toFixed(2) };
}
