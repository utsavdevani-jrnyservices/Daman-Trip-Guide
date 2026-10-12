import { useCallback, useEffect, useMemo, useReducer } from "react";
import { steps as baseSteps } from "../data/itinerary";
import type { Choice, LatLng, Step } from "../types";

export type Phase = "idle" | "traveling";

export interface ItineraryState {
  stepIndex: number;
  /** stepId -> choiceId */
  choices: Record<string, string>;
  /** stepId -> free text typed for a free-text option */
  notes: Record<string, string>;
  phase: Phase;
  /** Monotonic counter so the route layer can re-run an animation for the same leg. */
  journeyKey: number;
}

type Action =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "JUMP"; index: number }
  | { type: "CHOOSE"; stepId: string; choiceId: string }
  | { type: "NOTE"; stepId: string; text: string }
  | { type: "ARRIVED" }
  | { type: "RESET" };

const STORAGE_KEY = "daman-trip-guide:v2";

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

const initialState: ItineraryState = {
  stepIndex: 0,
  choices: {},
  notes: {},
  phase: "idle",
  journeyKey: 0,
  ...load(),
};

/** The option picked at a decision step, if any. */
export function chosenOption(step: Step, choices: Record<string, string>): Choice | undefined {
  return step.choices?.options.find((o) => o.id === choices[step.id]);
}

/** A decision counts as made when an option is picked and, for free-text options, text was typed. */
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

/** Where a step "ends" on the map: the chosen option's pin if a decision was made, else the step itself. */
export function resolvedPosition(step: Step, choices: Record<string, string>): LatLng {
  return chosenOption(step, choices)?.coordinates ?? step.coordinates;
}

function reducer(state: ItineraryState, action: Action): ItineraryState {
  switch (action.type) {
    case "NEXT": {
      if (state.phase === "traveling") return state;
      const current = baseSteps[state.stepIndex];
      if (!decisionComplete(current, state.choices, state.notes)) return state;
      if (state.stepIndex >= baseSteps.length - 1) return state;
      return { ...state, stepIndex: state.stepIndex + 1, phase: "traveling", journeyKey: state.journeyKey + 1 };
    }
    case "BACK": {
      if (state.phase === "traveling" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, phase: "idle" };
    }
    case "JUMP": {
      if (state.phase === "traveling") return state;
      const index = Math.max(0, Math.min(baseSteps.length - 1, action.index));
      return { ...state, stepIndex: index, phase: "idle" };
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

export function useItinerary() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIndex: state.stepIndex, choices: state.choices, notes: state.notes }),
      );
    } catch {
      /* storage unavailable (private mode etc.) — fine */
    }
  }, [state.stepIndex, state.choices, state.notes]);

  // Every step, resolved against the decisions made so far.
  const steps = useMemo(
    () => baseSteps.map((s) => resolveStep(s, state.choices, state.notes)),
    [state.choices, state.notes],
  );

  const step = steps[state.stepIndex];
  const prevStep = state.stepIndex > 0 ? steps[state.stepIndex - 1] : null;

  const choiceMade = decisionComplete(step, state.choices, state.notes);
  const isLast = state.stepIndex === steps.length - 1;

  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const jump = useCallback((index: number) => dispatch({ type: "JUMP", index }), []);
  const choose = useCallback((stepId: string, choiceId: string) => dispatch({ type: "CHOOSE", stepId, choiceId }), []);
  const setNote = useCallback((stepId: string, text: string) => dispatch({ type: "NOTE", stepId, text }), []);
  const arrived = useCallback(() => dispatch({ type: "ARRIVED" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  /** Full polyline for the leg that arrives at `step`. */
  const activeLeg = useMemo<LatLng[] | null>(() => {
    if (!prevStep) return null;
    const from = resolvedPosition(prevStep, state.choices);
    return [from, ...(step.route ?? []), step.coordinates];
  }, [prevStep, step, state.choices]);

  /** Every decision the group has made, in trip order — the final summary. */
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

  return { state, step, prevStep, steps, choiceMade, isLast, activeLeg, plan, next, back, jump, choose, setNote, arrived, reset };
}
