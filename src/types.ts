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
  /** When true, the group has to type what they want to do before moving on. */
  freeText?: boolean;
  freeTextPlaceholder?: string;
}

export interface Decision {
  /** Shown as the question above the options, e.g. "Breakfast plan?" */
  prompt: string;
  options: Choice[];
}

export interface Link {
  label: string;
  url: string;
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
  /** Label for the leg, e.g. "2h 20m · 12935 Intercity" */
  legLabel?: string;
  /** Target zoom when the camera settles on this step. */
  zoom?: number;
  /** Primary action button text that advances to the next step. */
  actionLabel: string;
  /** Optional decision the group must make before moving on. */
  choices?: Decision;
  /** Short practical notes shown as chips. */
  tips?: string[];
  /** A highlighted warning shown above the description. */
  warning?: string;
  /** External links, e.g. live train status. */
  links?: Link[];
  /**
   * Branching: this step changes depending on the option chosen at `variantsFor`
   * (a step id). The matching entry in `variants` is merged over the base step.
   * `{note}` inside a variant description is replaced with what the group typed.
   */
  variantsFor?: string;
  variants?: Record<string, Partial<Omit<Step, "id" | "variants" | "variantsFor">>>;
}
