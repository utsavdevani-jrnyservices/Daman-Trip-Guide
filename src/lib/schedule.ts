import type { Step, Transport } from "../types";
import { chosenOption, legFor } from "../hooks/useItinerary";

export interface Slot {
  /** Minutes from midnight, local. */
  arrive: number;
  leave: number;
  /** Minutes spent travelling to this stop. */
  travelMin: number;
  km: number;
  /** Minutes the group would arrive before a fixed anchor (free time). */
  slack: number;
  stay: number;
  /** Arrival is pinned by an anchor (train, check-in, scooter drop). */
  fixed: boolean;
}

export const parseHM = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};

/** "10:25 AM" style, rounded to 5 minutes. */
export function fmtTime(min: number, round = 5): string {
  const r = Math.round(min / round) * round;
  const h24 = Math.floor(r / 60) % 24;
  const m = r % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
}

export function fmtDur(min: number): string {
  if (min <= 0) return "0 min";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export function fmtKm(km: number): string {
  return km < 1 ? `${Math.round(km * 100) * 10} m` : `${km.toFixed(1)} km`;
}

/** Realistic door-to-door minutes for a leg. */
export function travelMinutes(km: number, transport: Transport | undefined): number {
  if (km < 0.05) return 0;
  switch (transport) {
    case "walk":
      return Math.round((km / 4.5) * 60) + 1;
    case "scooter":
      return Math.round((km / 20) * 60) + 3;
    case "car":
      return Math.round((km / 30) * 60) + 5;
    case "train":
      return 0; // timetable anchors handle trains
    default:
      return Math.round((km / 4.5) * 60) + 1;
  }
}

export const TRANSPORT_VERB: Record<Transport, string> = { walk: "on foot", scooter: "by scooter", car: "by cab", train: "by train" };

/**
 * Running schedule for the resolved steps. Anchored stops never start before
 * their anchor; everything else follows from travel time and time spent.
 */
export function computeSchedule(steps: Step[], choices: Record<string, string>): Slot[] {
  const out: Slot[] = [];
  let clock = parseHM(steps[0].anchor ?? "06:30");
  steps.forEach((step, i) => {
    let travelMin = 0;
    let km = 0;
    if (i > 0) {
      const leg = legFor(steps, i, choices);
      km = leg.km;
      travelMin = travelMinutes(km, step.transport);
    }
    const newDay = i > 0 && step.day !== steps[i - 1].day;
    const computed = newDay ? -1 : clock + travelMin;
    const anchor = step.anchor ? parseHM(step.anchor) : null;
    let arrive = computed;
    let slack = 0;
    let fixed = false;
    if (anchor != null) {
      if (computed <= anchor) {
        slack = computed < 0 ? 0 : anchor - computed;
        arrive = anchor;
        fixed = true;
      } else {
        arrive = computed; // running late: the anchor is missed, show the real time
      }
    }
    const opt = chosenOption(step, choices);
    const optDrivesNext = steps[i + 1]?.variantsFor === step.id;
    let stay = step.stayMin ?? 0;
    if (opt?.stayMin != null && !optDrivesNext) stay += opt.stayMin;
    const leave = arrive + stay;
    out.push({ arrive, leave, travelMin, km, slack, stay, fixed });
    clock = leave;
  });
  return out;
}
