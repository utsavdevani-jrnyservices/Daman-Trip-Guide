import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Clock, Copy, ExternalLink, RotateCcw, Share2 } from "lucide-react";
import type { Step } from "../types";
import type { PlanItem } from "../hooks/useItinerary";
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
  note: string;
  choiceMade: boolean;
  isLast: boolean;
  plan: PlanItem[];
  onNext: () => void;
  onBack: () => void;
  onChoose: (stepId: string, choiceId: string) => void;
  onNote: (stepId: string, text: string) => void;
  onReset: () => void;
}

const spring = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

function planText(plan: PlanItem[]) {
  const lines = plan.map((p) => `• ${p.stepTitle} – ${p.prompt} ${p.choice}${p.note ? ` (${p.note})` : ""}`);
  return `Daman trip – our picks\n${lines.join("\n")}`;
}

const GuideSheet = forwardRef<HTMLDivElement, Props>(function GuideSheet(
  { step, prevStep, stepIndex, total, phase, progress, accent, choiceId, note, choiceMade, isLast, plan, onNext, onBack, onChoose, onNote, onReset },
  ref,
) {
  const [collapsed, setCollapsed] = useState(false);
  const [shared, setShared] = useState<"idle" | "copied" | "failed">("idle");
  const traveling = phase === "traveling";
  const transport = step.transport ?? "walk";
  const selected = step.choices?.options.find((o) => o.id === choiceId);

  const share = async () => {
    const text = planText(plan);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Daman trip plan", text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared("copied");
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShared("copied");
      } catch {
        setShared("failed");
      }
    }
    setTimeout(() => setShared("idle"), 2000);
  };

  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-[600] px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <motion.div
        layout
        transition={spring}
        className="glass-strong overflow-hidden rounded-[28px]"
        style={{ boxShadow: `0 30px 80px -24px rgba(0,0,0,.9), 0 0 0 1px ${accent}26, inset 0 1px 0 rgba(255,255,255,.1)` }}
      >
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
                    className="max-h-[52vh] overflow-y-auto"
                  >
                    {step.warning && (
                      <div className="mt-3.5 flex gap-2.5 rounded-2xl border border-red-400/40 bg-red-500/15 px-3.5 py-3">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-300" />
                        <p className="text-[14px] font-semibold leading-snug text-red-100">{step.warning}</p>
                      </div>
                    )}

                    <p className="mt-3.5 text-[15px] leading-[1.55] text-white/80">{step.description}</p>

                    {(step.tips?.length || step.links?.length) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {step.tips?.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[12px] text-white/70">
                            {t}
                          </span>
                        ))}
                        {step.links?.map((l) => (
                          <a
                            key={l.url}
                            href={l.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold"
                            style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}
                          >
                            {l.label} <ExternalLink size={11} />
                          </a>
                        ))}
                      </div>
                    )}

                    {step.choices && (
                      <div className="mt-4">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{step.choices.prompt}</div>
                        <div className="grid grid-cols-1 gap-2">
                          {step.choices.options.map((opt) => {
                            const isSel = choiceId === opt.id;
                            return (
                              <motion.button
                                key={opt.id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onChoose(step.id, opt.id)}
                                className="flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors"
                                style={{
                                  borderColor: isSel ? accent : "rgba(255,255,255,0.1)",
                                  background: isSel ? `${accent}1a` : "rgba(255,255,255,0.04)",
                                  boxShadow: isSel ? `0 0 24px -8px ${accent}` : "none",
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
                                    borderColor: isSel ? accent : "rgba(255,255,255,0.18)",
                                    background: isSel ? accent : "transparent",
                                    color: "#0a0e14",
                                  }}
                                >
                                  {isSel && <Check size={14} strokeWidth={3} />}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                        {selected?.freeText && (
                          <textarea
                            id={`note-${step.id}`}
                            value={note}
                            onChange={(e) => onNote(step.id, e.target.value)}
                            placeholder={selected.freeTextPlaceholder ?? "Type what the group wants to do"}
                            rows={2}
                            className="mt-2 w-full resize-none rounded-2xl border bg-white/5 px-3.5 py-3 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
                            style={{ borderColor: `${accent}66` }}
                          />
                        )}
                      </div>
                    )}

                    {isLast && (
                      <div className="mt-4">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Your plan</div>
                        {plan.length === 0 ? (
                          <p className="text-[14px] text-white/55">No choices were made on this run.</p>
                        ) : (
                          <ul className="grid gap-1.5">
                            {plan.map((p) => (
                              <li key={p.stepId} className="rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5">
                                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                                  {p.stepTitle} · {p.prompt}
                                </div>
                                <div className="text-[15px] font-semibold text-white">{p.choice}</div>
                                {p.note && <div className="text-[13px] text-white/65">“{p.note}”</div>}
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                          onClick={share}
                          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-2xl border py-3 text-[14px] font-semibold"
                          style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}
                        >
                          {shared === "copied" ? <Copy size={15} /> : <Share2 size={15} />}
                          {shared === "copied" ? "Copied to clipboard" : shared === "failed" ? "Couldn't share" : "Share this plan"}
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center gap-2">
                {stepIndex > 0 && (
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
                  className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-bold tracking-tight disabled:cursor-not-allowed"
                  style={{
                    background: choiceMade ? accent : "rgba(255,255,255,0.08)",
                    color: choiceMade ? "#0a0e14" : "rgba(255,255,255,0.4)",
                    boxShadow: choiceMade ? `0 14px 36px -12px ${accent}` : "none",
                  }}
                >
                  {choiceMade && <span className="shimmer pointer-events-none absolute inset-0" />}
                  {isLast ? <RotateCcw size={16} /> : null}
                  <span className="relative">
                    {!choiceMade ? (selected?.freeText ? "Type your plan to continue" : "Pick an option to continue") : step.actionLabel}
                  </span>
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
