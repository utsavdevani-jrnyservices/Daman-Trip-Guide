import { AnimatePresence, motion } from "framer-motion";
import { Lock, RotateCcw, X } from "lucide-react";
import { DAY_META } from "../data/itinerary";
import type { Step } from "../types";

interface Props {
  open: boolean;
  steps: Step[];
  stepIndex: number;
  choices: Record<string, string>;
  notes: Record<string, string>;
  onClose: () => void;
  onJump: (index: number) => void;
  onReset: () => void;
}

export default function Timeline({ open, steps, stepIndex, choices, notes, onClose, onJump, onReset }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="timeline"
          className="absolute inset-0 z-[700] flex flex-col bg-ink-950/70 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
        >
          <motion.div
            className="flex h-full flex-col"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <div className="flex items-center justify-between px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Itinerary</div>
                <div className="font-display text-[26px] italic text-white">Mumbai → Daman · 2 days</div>
              </div>
              <button
                onClick={onClose}
                className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/80 active:scale-95"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {([1, 2] as const).map((day) => {
                const meta = DAY_META[day];
                const accent = day === 1 ? "#f5b547" : "#2dd4bf";
                return (
                  <div key={day} className="mb-6">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>
                        {meta.label}
                      </span>
                      <span className="text-[13px] font-semibold text-white/80">{meta.name}</span>
                      <span className="h-px flex-1 bg-white/10" />
                    </div>
                    <ol className="relative ml-3 border-l border-white/10">
                      {steps.map((s, i) => {
                        if (s.day !== day) return null;
                        const visited = i <= stepIndex;
                        const current = i === stepIndex;
                        const chosen = s.choices?.options.find((o) => o.id === choices[s.id]);
                        return (
                          <li key={s.id} className="relative pl-6">
                            <span
                              className="absolute -left-[7px] top-3 h-3.5 w-3.5 rounded-full border-2"
                              style={{
                                borderColor: visited ? accent : "rgba(255,255,255,0.18)",
                                background: current ? accent : visited ? `${accent}55` : "#0a0e14",
                                boxShadow: current ? `0 0 14px ${accent}` : "none",
                              }}
                            />
                            <button
                              disabled={!visited}
                              onClick={() => {
                                onJump(i);
                                onClose();
                              }}
                              className="mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors enabled:active:bg-white/5 disabled:opacity-40"
                              style={{ background: current ? `${accent}14` : "transparent" }}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                  <span>{s.time}</span>
                                  {chosen && (
                                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 normal-case tracking-normal text-white/70">
                                      {chosen.emoji} {chosen.freeText && notes[s.id]?.trim() ? notes[s.id].trim() : chosen.label}
                                    </span>
                                  )}
                                </div>
                                <div className="truncate text-[15px] font-semibold text-white">{s.title}</div>
                                <div className="truncate text-[12px] text-white/50">{s.subtitle}</div>
                              </div>
                              {!visited && <Lock size={14} className="shrink-0 text-white/30" />}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                );
              })}

              <button
                onClick={() => {
                  if (window.confirm("Restart the trip from Andheri? Your choices will be cleared.")) {
                    onReset();
                    onClose();
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-[14px] font-semibold text-white/70 active:scale-[0.98]"
              >
                <RotateCcw size={15} /> Restart trip
              </button>
              <p className="mt-4 text-center text-[10px] text-white/30">Map © OpenStreetMap contributors · OpenFreeMap</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
