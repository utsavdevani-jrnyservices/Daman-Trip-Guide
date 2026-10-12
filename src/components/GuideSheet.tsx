import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Clock, RotateCcw } from "lucide-react";
import type { Step } from "../types";
import { STOP_SVG, VEHICLE_LABEL, VEHICLE_SVG } from "./mapIcons";

interface Props {
  step: Step;
  prevStep: Step | null;
  stepIndex: number;
  total: number;
  phase: "idle" | "traveling";
  progress: number;
  accent: string;
  choiceId?: string;
  choiceMade: boolean;
  isLast: boolean;
  onNext: () => void;
  onBack: () => void;
  onChoose: (stepId: string, choiceId: string) => void;
  onReset: () => void;
}

const spring = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

const GuideSheet = forwardRef<HTMLDivElement, Props>(function GuideSheet(
  { step, prevStep, stepIndex, total, phase, progress, accent, choiceId, choiceMade, isLast, onNext, onBack, onChoose, onReset },
  ref,
) {
  const [collapsed, setCollapsed] = useState(false);
  const traveling = phase === "traveling";
  const transport = step.transport ?? "walk";

  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-[600] px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <motion.div
        layout
        transition={spring}
        className="glass-strong overflow-hidden rounded-[28px]"
        style={{ boxShadow: `0 30px 80px -24px rgba(0,0,0,.9), 0 0 0 1px ${accent}26, inset 0 1px 0 rgba(255,255,255,.1)` }}
      >
        {/* Handle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="flex w-full items-center justify-center pb-1 pt-2.5 text-white/40"
          aria-label={collapsed ? "Expand guide" : "Collapse guide"}
        >
          <span className="mr-2 h-1 w-10 rounded-full bg-white/20" />
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {traveling ? (
            <motion.div
              key="traveling"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-5 pb-5 pt-1"
            >
              <div className="flex items-center gap-4">
                <span
                  className="grid h-14 w-14 shrink-0 animate-bob place-items-center rounded-2xl"
                  style={{ background: `${accent}1f`, color: accent, boxShadow: `0 0 0 1px ${accent}40` }}
                  dangerouslySetInnerHTML={{ __html: VEHICLE_SVG[transport].replace('width="22" height="22"', 'width="28" height="28"') }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    {VEHICLE_LABEL[transport]} · en route
                  </div>
                  <div className="mt-0.5 font-display text-[22px] leading-[1.1] text-white">
                    {prevStep?.title} <span className="text-white/35">→</span> {step.title}
                  </div>
                  {step.legLabel && <div className="mt-1 text-[13px] text-white/60">{step.legLabel}</div>}
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-100 ease-linear"
                  style={{ width: `${Math.round(progress * 100)}%`, background: accent, boxShadow: `0 0 12px ${accent}` }}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
              className="px-5 pb-4"
            >
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${accent}1f`, color: accent, boxShadow: `0 0 0 1px ${accent}40` }}
                  dangerouslySetInnerHTML={{ __html: STOP_SVG[step.iconType] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    <span>Stop {stepIndex + 1}/{total}</span>
                    <span className="h-1 w-1 rounded-full bg-white/25" />
                    <span className="inline-flex items-center gap-1" style={{ color: accent }}>
                      <Clock size={11} /> {step.time}
                    </span>
                  </div>
                  <h1 className="mt-0.5 font-display text-[28px] leading-[1.05] text-white">{step.title}</h1>
                  <div className="mt-0.5 text-[13px] text-white/55">{step.subtitle}</div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="mt-3.5 text-[15px] leading-[1.55] text-white/80">{step.description}</p>

                    {step.tips && step.tips.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {step.tips.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[12px] text-white/70">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {step.choices && (
                      <div className="mt-4">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                          {step.choices.prompt}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {step.choices.options.map((opt) => {
                            const selected = choiceId === opt.id;
                            return (
                              <motion.button
                                key={opt.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onChoose(step.id, opt.id)}
                                className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors"
                                style={{
                                  borderColor: selected ? accent : "rgba(255,255,255,0.1)",
                                  background: selected ? `${accent}1a` : "rgba(255,255,255,0.04)",
                                  boxShadow: selected ? `0 0 24px -8px ${accent}` : "none",
                                }}
                              >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-[20px]">{opt.emoji}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[15px] font-semibold text-white">{opt.label}</span>
                                  {opt.hint && <span className="block text-[12px] text-white/55">{opt.hint}</span>}
                                </span>
                                <span
                                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all"
                                  style={{
                                    borderColor: selected ? accent : "rgba(255,255,255,0.18)",
                                    background: selected ? accent : "transparent",
                                    color: "#0a0e14",
                                  }}
                                >
                                  {selected && <Check size={14} strokeWidth={3} />}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                {stepIndex > 0 && !isLast && (
                  <button
                    onClick={onBack}
                    className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 active:scale-95"
                    aria-label="Previous stop"
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: choiceMade ? 0.98 : 1 }}
                  onClick={isLast ? onReset : onNext}
                  disabled={!choiceMade}
                  className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-bold tracking-tight text-ink-900 disabled:cursor-not-allowed"
                  style={{
                    background: choiceMade ? accent : "rgba(255,255,255,0.08)",
                    color: choiceMade ? "#0a0e14" : "rgba(255,255,255,0.4)",
                    boxShadow: choiceMade ? `0 14px 36px -12px ${accent}` : "none",
                  }}
                >
                  {choiceMade && <span className="shimmer pointer-events-none absolute inset-0" />}
                  {isLast ? <RotateCcw size={16} /> : null}
                  <span className="relative">{!choiceMade ? "Pick an option to continue" : step.actionLabel}</span>
                  {!isLast && choiceMade && <ArrowRight size={16} className="relative" />}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

export default GuideSheet;
