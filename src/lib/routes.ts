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

const ALL: { points: LatLng[]; km: number }[] = [
  { points: RAIL, km: 170 },
  ...Object.values(ROUTES),
];

const near = (a: LatLng, b: LatLng) => haversine(a, b) < 80;

/**
 * Real road / walking geometry between two points, looked up by endpoints
 * (either direction). Falls back to a straight line when no leg was fetched.
 */
export function routeBetween(from: LatLng, to: LatLng): { points: LatLng[]; km: number } {
  for (const r of ALL) {
    const first = r.points[0];
    const last = r.points[r.points.length - 1];
    if (near(first, from) && near(last, to)) return { points: [from, ...r.points.slice(1, -1), to], km: r.km };
    if (near(first, to) && near(last, from)) return { points: [from, ...r.points.slice(1, -1).reverse(), to], km: r.km };
  }
  return { points: [from, to], km: +(haversine(from, to) / 1000).toFixed(2) };
}
