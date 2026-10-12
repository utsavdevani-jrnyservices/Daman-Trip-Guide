export type LatLng = [number, number];

export type Transport = "train" | "car" | "walk" | "scooter";

export type IconType =
  | "train"
  | "car"
  | "hostel"
  | "food"
  | "checkin"
  | "fort"
  | "garden"
  | "beach"
  | "market"
  | "scooter"
  | "church"
  | "flag"
  | "home";

export interface Choice {
  id: string;
  label: string;
  hint?: string;
  coordinates: LatLng;
  emoji: string;
}

export interface Decision {
  /** Shown as the question above the options, e.g. "Where's lunch?" */
  prompt: string;
  options: Choice[];
}

export interface Step {
  id: string;
  day: 1 | 2;
  /** Display time, e.g. "6:30 AM" */
  time: string;
  title: string;
  /** Short line under the title, e.g. "Andheri Station" */
  subtitle: string;
  description: string;
  coordinates: LatLng;
  iconType: IconType;
  /** How the group gets *to* this step from the previous one. */
  transport?: Transport;
  /** Intermediate waypoints between the previous point and this one (optional). */
  route?: LatLng[];
  /** Label for the leg, e.g. "2h 20m · Western Line" */
  legLabel?: string;
  /** Target zoom when the camera settles on this step. */
  zoom?: number;
  /** Primary action button text that advances to the next step. */
  actionLabel: string;
  /** Optional decision the group must make before moving on. */
  choices?: Decision;
  /** Little highlights/tips shown as chips. */
  tips?: string[];
}
