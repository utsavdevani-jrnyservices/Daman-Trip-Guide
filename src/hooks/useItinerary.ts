import { useCallback, useEffect, useMemo, useReducer } from "react";
import { DAY_META, steps as baseSteps } from "../data/itinerary";
import { routeBetween } from "../lib/routes";
import { computeSchedule, fmtDur, fmtTime, type Slot } from "../lib/schedule";
import type { Choice, LatLng, Step } from "../types";

export type Phase = "idle" | "traveling";

export interface ItineraryState {
  stepIndex: number;
  /** stepId -> choiceId */
  choices: Record<string, string>;
  /** stepId -> free text typed for a free-text option */
  notes: Record<string, string>;
  phase: Phase;
  /** Monotonic counter so the map re-runs the camera/animation for a step. */
  journeyKey: number;
}

type Action =
  | { type: "NEXT"; travel: boolean }
  | { type: "BACK" }
  | { type: "JUMP"; index: number }
  | { type: "CHOOSE"; stepId: string; choiceId: string }
  | { type: "NOTE"; stepId: string; text: string }
  | { type: "ARRIVED" }
  | { type: "RESET" };

const STORAGE_KEY = "daman-trip-guide:v3";

function load(): Partial<Pick<ItineraryState, "stepIndex" | "choices" | "notes">> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed?.stepIndex !== "number" || parsed.stepIndex < 0 || parsed.stepIndex >= baseSteps.length) return {};
    return { stepIndex: parsed.stepIndex, choices: parsed.choices ?? {}, notes: parsed.notes ?? {} };
  } catch {
    return {};
  }
}

const initialState: ItineraryState = { stepIndex: 0, choices: {}, notes: {}, phase: "idle", journeyKey: 0, ...load() };

export function chosenOption(step: Step, choices: Record<string, string>): Choice | undefined {
  return step.choices?.options.find((o) => o.id === choices[step.id]);
}

export function decisionComplete(step: Step, choices: Record<string, string>, notes: Record<string, string>): boolean {
  if (!step.choices) return true;
  const opt = chosenOption(step, choices);
  if (!opt) return false;
  if (opt.freeText) return (notes[step.id] ?? "").trim().length > 0;
  return true;
}

/** Merge the variant matching an earlier decision over the base step. */
export function resolveStep(step: Step, choices: Record<string, string>, notes: Record<string, string>): Step {
  if (!step.variantsFor || !step.variants) return step;
  const choiceId = choices[step.variantsFor];
  const variant = choiceId ? step.variants[choiceId] : undefined;
  if (!variant) return step;
  const note = (notes[step.variantsFor] ?? "").trim();
  const merged: Step = { ...step, ...variant };
  merged.description = merged.description.replace("{note}", note || "…");
  return merged;
}

/** Where a step "ends" on the map: the chosen option's pin if it has one, else the step itself. */
export function resolvedPosition(step: Step, choices: Record<string, string>): LatLng {
  const opt = chosenOption(step, choices);
  return opt && !opt.noPin ? opt.coordinates : step.coordinates;
}

/** The polyline that arrives at steps[i]. */
export function legFor(steps: Step[], i: number, choices: Record<string, string>) {
  const prev = steps[i - 1];
  // When the previous decision selects *this* step (a variant), the chosen pin is the
  // destination, so the leg starts from the previous stop itself.
  const from = steps[i].variantsFor === prev.id ? prev.coordinates : resolvedPosition(prev, choices);
  return routeBetween(from, steps[i].coordinates);
}

function reducer(state: ItineraryState, action: Action): ItineraryState {
  switch (action.type) {
    case "NEXT": {
      if (state.phase === "traveling") return state;
      const current = baseSteps[state.stepIndex];
      if (!decisionComplete(current, state.choices, state.notes)) return state;
      if (state.stepIndex >= baseSteps.length - 1) return state;
      return { ...state, stepIndex: state.stepIndex + 1, phase: action.travel ? "traveling" : "idle", journeyKey: state.journeyKey + 1 };
    }
    case "BACK": {
      if (state.phase === "traveling" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, phase: "idle" };
    }
    case "JUMP": {
      if (state.phase === "traveling") return state;
      return { ...state, stepIndex: Math.max(0, Math.min(baseSteps.length - 1, action.index)), phase: "idle" };
    }
    case "CHOOSE":
      return { ...state, choices: { ...state.choices, [action.stepId]: action.choiceId } };
    case "NOTE":
      return { ...state, notes: { ...state.notes, [action.stepId]: action.text } };
    case "ARRIVED":
      return { ...state, phase: "idle" };
    case "RESET":
      return { stepIndex: 0, choices: {}, notes: {}, phase: "idle", journeyKey: state.journeyKey + 1 };
    default:
      return state;
  }
}

export interface PlanItem {
  stepId: string;
  stepTitle: string;
  prompt: string;
  choice: string;
  note?: string;
}

/** WhatsApp-formatted itinerary built from every step, the computed times and the group's picks. */
export function buildWhatsAppMessage(steps: Step[], slots: Slot[], choices: Record<string, string>, notes: Record<string, string>): string {
  const lines: string[] = ["*Daman trip – our itinerary* 🗓️", "_3–4 Nov 2026 · times are a guide, give or take 15 min_", ""];
  let day: 1 | 2 | 0 = 0;
  steps.forEach((s, i) => {
    if (s.day !== day) {
      day = s.day;
      if (day === 2) lines.push("");
      lines.push(`*${DAY_META[day].label} · ${DAY_META[day].name}*`);
    }
    const slot = slots[i];
    const opt = chosenOption(s, choices);
    const note = opt?.freeText ? (notes[s.id] ?? "").trim() : "";
    const when = slot.fixed ? fmtTime(slot.arrive, 1) : `~${fmtTime(slot.arrive)}`;
    const stay = slot.stay >= 15 ? ` (${fmtDur(slot.stay)})` : "";
    lines.push(`• ${when} – ${s.title}${stay}`);
    if (opt && s.choices) {
      const label = s.choices.prompt.replace(/\s*plan\?$/i, "").replace(/\?$/, "");
      const pick = note ? `${opt.id === "suggest" ? "📍 " : ""}${note}` : opt.label;
      lines.push(`   ↳ ${label}: ${pick}`);
    }
  });
  lines.push("", "Train out: 12935, Andheri 6:42 AM. Train back: 12936, Vapi 5:40 PM.", "_Made with the Daman Trip Guide_");
  return lines.join("\n");
}

export function useItinerary() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stepIndex: state.stepIndex, choices: state.choices, notes: state.notes }));
    } catch {
      /* storage unavailable — fine */
    }
  }, [state.stepIndex, state.choices, state.notes]);

  const steps = useMemo(() => baseSteps.map((s) => resolveStep(s, state.choices, state.notes)), [state.choices, state.notes]);
  const step = steps[state.stepIndex];
  const prevStep = state.stepIndex > 0 ? steps[state.stepIndex - 1] : null;
  const choiceMade = decisionComplete(step, state.choices, state.notes);
  const isLast = state.stepIndex === steps.length - 1;

  /** Full polyline for the leg that arrives at `step`, with its distance. */
  const activeLeg = useMemo(() => (state.stepIndex > 0 ? legFor(steps, state.stepIndex, state.choices) : null), [steps, state.stepIndex, state.choices]);

  const next = useCallback(() => {
    // Skip the travel animation when the next stop is where we already are.
    const i = state.stepIndex + 1;
    const travel = i < steps.length && legFor(steps, i, state.choices).km > 0.05;
    dispatch({ type: "NEXT", travel });
  }, [state.stepIndex, state.choices, steps]);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const jump = useCallback((index: number) => dispatch({ type: "JUMP", index }), []);
  const choose = useCallback((stepId: string, choiceId: string) => dispatch({ type: "CHOOSE", stepId, choiceId }), []);
  const setNote = useCallback((stepId: string, text: string) => dispatch({ type: "NOTE", stepId, text }), []);
  const arrived = useCallback(() => dispatch({ type: "ARRIVED" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  const plan = useMemo<PlanItem[]>(
    () =>
      steps
        .filter((s) => s.choices && state.choices[s.id])
        .map((s) => {
          const opt = chosenOption(s, state.choices)!;
          const note = opt.freeText ? (state.notes[s.id] ?? "").trim() : undefined;
          return { stepId: s.id, stepTitle: s.title, prompt: s.choices!.prompt, choice: opt.label, note: note || undefined };
        }),
    [steps, state.choices, state.notes],
  );

  const schedule = useMemo(() => computeSchedule(steps, state.choices), [steps, state.choices]);
  const message = useMemo(() => buildWhatsAppMessage(steps, schedule, state.choices, state.notes), [steps, schedule, state.choices, state.notes]);

  return { state, step, prevStep, steps, schedule, choiceMade, isLast, activeLeg, plan, message, next, back, jump, choose, setNote, arrived, reset };
}
