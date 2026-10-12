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

export interface Rating {
  stars: number;
  /** e.g. "1,000+ reviews" */
  reviews: string;
}

export interface Choice {
  id: string;
  label: string;
  /** One line under the label: what, how far, how long. */
  hint?: string;
  /** Short reason this is the recommended pick (shown only on the recommended option). */
  why?: string;
  coordinates: LatLng;
  emoji: string;
  recommended?: boolean;
  rating?: Rating;
  mapsUrl?: string;
  /** The group must type something before moving on. */
  freeText?: boolean;
  freeTextPlaceholder?: string;
  /** Hide the choice pin on the map (e.g. a typed suggestion with no coordinates). */
  noPin?: boolean;
}

export interface Decision {
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
  /** Best time to be here, e.g. "6:30 AM". */
  time: string;
  /** How long we spend here, e.g. "45 min". */
  duration?: string;
  title: string;
  subtitle: string;
  description: string;
  /** Why the app recommends this stop (research, best time, what to do). */
  why?: string;
  rating?: Rating;
  mapsUrl?: string;
  /** Set when the step cannot be changed; the text says why (e.g. "Reserved tickets"). */
  fixed?: string;
  coordinates: LatLng;
  iconType: IconType;
  /** How the group gets *to* this step from the previous one. */
  transport?: Transport;
  /** Label for the leg, e.g. "2h 20m · 12935 Intercity". Distance is added automatically. */
  legLabel?: string;
  zoom?: number;
  actionLabel: string;
  choices?: Decision;
  tips?: string[];
  warning?: string;
  links?: Link[];
  /** Branching: this step changes depending on the option chosen at `variantsFor` (a step id). */
  variantsFor?: string;
  variants?: Record<string, Partial<Omit<Step, "id" | "variants" | "variantsFor">>>;
}
