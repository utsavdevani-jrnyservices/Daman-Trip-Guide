import { useCallback, useEffect, useMemo, useReducer } from "react";
import { steps } from "../data/itinerary";
import type { LatLng, Step } from "../types";

export type Phase = "idle" | "traveling";

export interface ItineraryState {
  stepIndex: number;
  /** stepId -> choiceId */
  choices: Record<string, string>;
  phase: Phase;
  /** Monotonic counter so the route layer can re-run an animation for the same leg. */
  journeyKey: number;
}

type Action =
  | { type: "NEXT" }
  | { type: "BACK" }
  | { type: "JUMP"; index: number }
  | { type: "CHOOSE"; stepId: string; choiceId: string }
  | { type: "ARRIVED" }
  | { type: "RESET" };

const STORAGE_KEY = "daman-trip-guide:v1";

function load(): Pick<ItineraryState, "stepIndex" | "choices"> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      typeof parsed?.stepIndex !== "number" ||
      parsed.stepIndex < 0 ||
      parsed.stepIndex >= steps.length
    )
      return null;
    return { stepIndex: parsed.stepIndex, choices: parsed.choices ?? {} };
  } catch {
    return null;
  }
}

const initialState: ItineraryState = {
  stepIndex: 0,
  choices: {},
  phase: "idle",
  journeyKey: 0,
  ...load(),
};

function reducer(state: ItineraryState, action: Action): ItineraryState {
  switch (action.type) {
    case "NEXT": {
      if (state.phase === "traveling") return state;
      const current = steps[state.stepIndex];
      if (current.choices && !state.choices[current.id]) return state;
      if (state.stepIndex >= steps.length - 1) return state;
      return {
        ...state,
        stepIndex: state.stepIndex + 1,
        phase: "traveling",
        journeyKey: state.journeyKey + 1,
      };
    }
    case "BACK": {
      if (state.phase === "traveling" || state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1, phase: "idle" };
    }
    case "JUMP": {
      if (state.phase === "traveling") return state;
      const index = Math.max(0, Math.min(steps.length - 1, action.index));
      return { ...state, stepIndex: index, phase: "idle" };
    }
    case "CHOOSE":
      return { ...state, choices: { ...state.choices, [action.stepId]: action.choiceId } };
    case "ARRIVED":
      return { ...state, phase: "idle" };
    case "RESET":
      return { stepIndex: 0, choices: {}, phase: "idle", journeyKey: state.journeyKey + 1 };
    default:
      return state;
  }
}

/** Where a step "ends" on the map: the chosen option's pin if a decision was made, else the step itself. */
export function resolvedPosition(step: Step, choices: Record<string, string>): LatLng {
  const chosen = step.choices?.options.find((o) => o.id === choices[step.id]);
  return chosen?.coordinates ?? step.coordinates;
}

export function useItinerary() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stepIndex: state.stepIndex, choices: state.choices }),
      );
    } catch {
      /* storage unavailable (private mode etc.) — fine */
    }
  }, [state.stepIndex, state.choices]);

  const step = steps[state.stepIndex];
  const prevStep = state.stepIndex > 0 ? steps[state.stepIndex - 1] : null;

  const choiceMade = !step.choices || Boolean(state.choices[step.id]);
  const isLast = state.stepIndex === steps.length - 1;

  const next = useCallback(() => dispatch({ type: "NEXT" }), []);
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const jump = useCallback((index: number) => dispatch({ type: "JUMP", index }), []);
  const choose = useCallback(
    (stepId: string, choiceId: string) => dispatch({ type: "CHOOSE", stepId, choiceId }),
    [],
  );
  const arrived = useCallback(() => dispatch({ type: "ARRIVED" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  /** Full polyline for the leg that arrives at `step`. */
  const activeLeg = useMemo<LatLng[] | null>(() => {
    if (!prevStep) return null;
    const from = resolvedPosition(prevStep, state.choices);
    return [from, ...(step.route ?? []), step.coordinates];
  }, [prevStep, step, state.choices]);

  return {
    state,
    step,
    prevStep,
    steps,
    choiceMade,
    isLast,
    activeLeg,
    next,
    back,
    jump,
    choose,
    arrived,
    reset,
  };
}
