import { motion } from "framer-motion";
import { Compass, ListTree } from "lucide-react";
import { DAY_META } from "../data/itinerary";
import type { Step } from "../types";

interface Props {
  steps: Step[];
  stepIndex: number;
  step: Step;
  accent: string;
  onOpenTimeline: () => void;
}

export default function TopBar({ steps, stepIndex, step, accent, onOpenTimeline }: Props) {
  const meta = DAY_META[step.day];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] px-4 pt-[max(12px,env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <div className="glass pointer-events-auto flex items-center gap-2 rounded-full py-1.5 pl-2 pr-3.5">
          <span
            className="grid h-7 w-7 place-items-center rounded-full"
            style={{ background: `${accent}22`, color: accent }}
          >
            <Compass size={15} strokeWidth={2.2} />
          </span>
          <div className="leading-none">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Tour Guide</div>
            <div className="mt-0.5 font-display text-[15px] italic text-white/95">Mumbai → Daman</div>
          </div>
        </div>

        <button
          onClick={onOpenTimeline}
          className="glass pointer-events-auto flex items-center gap-2 rounded-full py-1.5 pl-3.5 pr-2 active:scale-95"
          aria-label="Open itinerary timeline"
        >
          <div className="text-right leading-none">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
              {meta.label}
            </div>
            <div className="mt-0.5 text-[13px] font-semibold text-white/90">{meta.name}</div>
          </div>
          <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-white/80">
            <ListTree size={15} />
          </span>
        </button>
      </div>

      {/* Segmented progress */}
      <div className="mt-3 flex gap-[3px]">
        {steps.map((s, i) => {
          const done = i < stepIndex;
          const current = i === stepIndex;
          const segAccent = s.day === 1 ? "#f5b547" : "#2dd4bf";
          return (
            <div key={s.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full"
                initial={false}
                animate={{ width: done || current ? "100%" : "0%", opacity: current ? 1 : done ? 0.7 : 0 }}
                transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                style={{ background: segAccent, boxShadow: current ? `0 0 10px ${segAccent}` : "none" }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
