import type { LatLng } from "../types";

const R = 6371000;
const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in metres. */
export function haversine(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const la1 = toRad(a[0]);
  const la2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function totalLength(points: LatLng[]): number {
  let d = 0;
  for (let i = 1; i < points.length; i++) d += haversine(points[i - 1], points[i]);
  return d;
}

/** Returns the point at fraction t (0..1) along a polyline, plus the heading in degrees. */
export function pointAlong(points: LatLng[], t: number): { point: LatLng; heading: number } {
  if (points.length === 0) return { point: [0, 0], heading: 0 };
  if (points.length === 1 || t <= 0) return { point: points[0], heading: 0 };
  const total = totalLength(points);
  if (t >= 1 || total === 0) {
    const last = points[points.length - 1];
    const prev = points[points.length - 2] ?? last;
    return { point: last, heading: bearing(prev, last) };
  }
  let target = t * total;
  for (let i = 1; i < points.length; i++) {
    const seg = haversine(points[i - 1], points[i]);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      const a = points[i - 1];
      const b = points[i];
      return {
        point: [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f],
        heading: bearing(a, b),
      };
    }
    target -= seg;
  }
  return { point: points[points.length - 1], heading: 0 };
}

/** The portion of a polyline from its start up to fraction t. */
export function partialPath(points: LatLng[], t: number): LatLng[] {
  if (points.length < 2) return points;
  if (t >= 1) return points;
  if (t <= 0) return [points[0]];
  const total = totalLength(points);
  let target = t * total;
  const out: LatLng[] = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const seg = haversine(points[i - 1], points[i]);
    if (target <= seg) {
      const f = seg === 0 ? 0 : target / seg;
      const a = points[i - 1];
      const b = points[i];
      out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
      return out;
    }
    out.push(points[i]);
    target -= seg;
  }
  return out;
}

/** Initial bearing from a to b in degrees (0 = north, 90 = east). */
export function bearing(a: LatLng, b: LatLng): number {
  const la1 = toRad(a[0]);
  const la2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(la2);
  const x = Math.cos(la1) * Math.sin(la2) - Math.sin(la1) * Math.cos(la2) * Math.cos(dLng);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Smooth ease-in-out used for the vehicle + line animation. */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  return `${(m / 1000).toFixed(m < 10000 ? 1 : 0)} km`;
}
