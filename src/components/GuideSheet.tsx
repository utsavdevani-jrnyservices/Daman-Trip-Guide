import { forwardRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, Copy, ExternalLink, Hourglass, Lock, MapPin, RotateCcw, Sparkles, Star,
} from "lucide-react";
import type { Rating, Step } from "../types";
import { fmtDur, fmtKm, fmtTime, TRANSPORT_VERB, type Slot } from "../lib/schedule";
import type { PlanItem } from "../hooks/useItinerary";
import { STOP_SVG, VEHICLE_LABEL, VEHICLE_SVG } from "./mapIcons";
import StayTimer from "./StayTimer";

interface Props {
  step: Step;
  prevStep: Step | null;
  stepIndex: number;
  total: number;
  phase: "idle" | "traveling";
  progress: number;
  accent: string;
  legKm?: number;
  slot: Slot;
  choiceId?: string;
  note: string;
  choiceMade: boolean;
  isLast: boolean;
  plan: PlanItem[];
  message: string;
  onNext: () => void;
  onBack: () => void;
  onChoose: (stepId: string, choiceId: string) => void;
  onNote: (stepId: string, text: string) => void;
  onReset: () => void;
}

const spring = { type: "spring", stiffness: 420, damping: 38, mass: 0.9 } as const;

function RatingLine({ rating, accent }: { rating: Rating; accent: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: accent }}>
      <Star size={12} fill={accent} /> {rating.stars.toFixed(1)} <span className="font-normal text-white/50">· {rating.reviews}</span>
    </span>
  );
}

function MapsLink({ url, accent, small }: { url: string; accent: string; small?: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${small ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[12px]"}`}
      style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}
    >
      <MapPin size={small ? 10 : 11} /> Google Maps <ExternalLink size={small ? 9 : 10} />
    </a>
  );
}

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2z" />
  </svg>
);

const GuideSheet = forwardRef<HTMLDivElement, Props>(function GuideSheet(
  { step, prevStep, stepIndex, total, phase, progress, accent, legKm, slot, choiceId, note, choiceMade, isLast, plan, message, onNext, onBack, onChoose, onNote, onReset },
  ref,
) {
  const [collapsed, setCollapsed] = useState(false);
  const [copied, setCopied] = useState<"idle" | "ok" | "fail">("idle");
  const traveling = phase === "traveling";
  const transport = step.transport ?? "walk";
  const selected = step.choices?.options.find((o) => o.id === choiceId);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied("ok");
    } catch {
      setCopied("fail");
    }
    setTimeout(() => setCopied("idle"), 2000);
  };
  const waHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div ref={ref} className="absolute inset-x-0 bottom-0 z-[600] px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
      <motion.div
        layout
        transition={spring}
        className="glass-strong overflow-hidden rounded-[28px]"
        style={{ boxShadow: `0 30px 80px -24px rgba(0,0,0,.9), 0 0 0 1px ${accent}26, inset 0 1px 0 rgba(255,255,255,.1)` }}
      >
        <button onClick={() => setCollapsed((c) => !c)} className="flex w-full items-center justify-center pb-1 pt-2.5 text-white/40" aria-label={collapsed ? "Expand guide" : "Collapse guide"}>
          <span className="mr-2 h-1 w-10 rounded-full bg-white/20" />
          {collapsed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <AnimatePresence mode="wait" initial={false}>
          {traveling ? (
            <motion.div key="traveling" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="px-5 pb-5 pt-1">
              <div className="flex items-center gap-4">
                <span
                  className="grid h-14 w-14 shrink-0 animate-bob place-items-center rounded-2xl"
                  style={{ background: `${accent}1f`, color: accent, boxShadow: `0 0 0 1px ${accent}40` }}
                  dangerouslySetInnerHTML={{ __html: VEHICLE_SVG[transport].replace('width="24" height="24"', 'width="30" height="30"') }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">{VEHICLE_LABEL[transport]} · en route</div>
                  <div className="mt-0.5 font-display text-[22px] leading-[1.1] text-white">
                    {prevStep?.title} <span className="text-white/35">→</span> {step.title}
                  </div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Distance</div>
                  <div className="text-[17px] font-bold text-white">{legKm != null ? fmtKm(legKm) : "–"}</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 leading-tight">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{TRANSPORT_VERB[transport]}</div>
                  <div className="text-[17px] font-bold text-white">{transport === "train" ? step.legLabel?.split(" · ")[0] ?? "–" : `≈${fmtDur(slot.travelMin)}`}</div>
                </div>
                <div className="rounded-xl border px-3 py-2 leading-tight" style={{ borderColor: `${accent}55`, background: `${accent}12` }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Arrive</div>
                  <div className="text-[15px] font-bold text-white">{slot.fixed ? fmtTime(slot.arrive, 1) : `~${fmtTime(slot.arrive)}`}</div>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full transition-[width] duration-100 ease-linear" style={{ width: `${Math.round(progress * 100)}%`, background: accent, boxShadow: `0 0 12px ${accent}` }} />
              </div>
            </motion.div>
          ) : (
            <motion.div key={step.id} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }} className="px-5 pb-4">
              {/* Header */}
              <div className="flex items-start gap-3.5">
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
                  style={{ background: `${accent}1f`, color: accent, boxShadow: `0 0 0 1px ${accent}40` }}
                  dangerouslySetInnerHTML={{ __html: STOP_SVG[step.iconType] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
                    <span>Stop {stepIndex + 1}/{total}</span>
                    {step.fixed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 normal-case tracking-normal text-white/70">
                        <Lock size={10} /> {step.fixed}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-0.5 font-display text-[28px] leading-[1.05] text-white">{step.title}</h1>
                  <div className="mt-0.5 text-[13px] text-white/55">{step.subtitle}</div>
                </div>
              </div>

              {/* Arrival timer + window */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3">
                <div className="flex items-center justify-between gap-3">
                  {slot.stay > 0 ? (
                    <StayTimer minutes={slot.stay} accent={accent} playKey={step.id} />
                  ) : (
                    <div className="leading-tight">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Time here</div>
                      <div className="text-[18px] font-bold text-white">{step.duration ?? "–"}</div>
                    </div>
                  )}
                  <div className="shrink-0 text-right leading-tight">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">{slot.fixed ? "At" : "Arrive"}</div>
                    <div className="text-[15px] font-bold" style={{ color: accent }}>{slot.fixed ? fmtTime(slot.arrive, 1) : `~${fmtTime(slot.arrive)}`}</div>
                    {slot.stay > 0 && (
                      <>
                        <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Leave by</div>
                        <div className="text-[15px] font-bold text-white">~{fmtTime(slot.leave)}</div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              {slot.slack >= 10 && (
                <div className="mt-2 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                  <Hourglass size={14} className="mt-0.5 shrink-0" style={{ color: accent }} />
                  <p className="text-[12.5px] leading-snug text-white/75">
                    <span className="font-semibold text-white">≈{fmtDur(Math.round(slot.slack / 5) * 5)} free</span> before this. {step.slackHint ?? ""}
                  </p>
                </div>
              )}

              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }} className="max-h-[48vh] overflow-y-auto">
                    {step.warning && (
                      <div className="mt-3.5 flex gap-2.5 rounded-2xl border border-red-400/40 bg-red-500/15 px-3.5 py-3">
                        <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-300" />
                        <p className="text-[14px] font-semibold leading-snug text-red-100">{step.warning}</p>
                      </div>
                    )}

                    <p className="mt-3.5 text-[15px] leading-[1.55] text-white/80">{step.description}</p>
                    {!slot.fixed && slot.stay > 0 && stepIndex > 0 && (
                      <p className="mt-1.5 text-[11.5px] text-white/40">Times are a guide, give or take 15 minutes. They move with the options the group picks.</p>
                    )}

                    {step.why && (
                      <div className="mt-3 rounded-2xl border px-3.5 py-3" style={{ borderColor: `${accent}33`, background: `${accent}0d` }}>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: accent }}>
                          <Sparkles size={12} /> Why here
                        </div>
                        <p className="mt-1 text-[13.5px] leading-[1.5] text-white/80">{step.why}</p>
                        {(step.rating || step.mapsUrl) && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {step.rating && <RatingLine rating={step.rating} accent={accent} />}
                            {step.mapsUrl && <MapsLink url={step.mapsUrl} accent={accent} />}
                          </div>
                        )}
                      </div>
                    )}
                    {!step.why && step.mapsUrl && (
                      <div className="mt-2.5">
                        <MapsLink url={step.mapsUrl} accent={accent} />
                      </div>
                    )}

                    {(step.tips?.length || step.links?.length) && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {step.tips?.map((t) => (
                          <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[12px] text-white/70">{t}</span>
                        ))}
                        {step.links?.map((l) => (
                          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold" style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}>
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
                                className="flex items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors"
                                style={{
                                  borderColor: isSel ? accent : opt.recommended ? `${accent}55` : "rgba(255,255,255,0.1)",
                                  background: isSel ? `${accent}1a` : "rgba(255,255,255,0.04)",
                                  boxShadow: isSel ? `0 0 24px -8px ${accent}` : "none",
                                }}
                              >
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5 text-[20px]">{opt.emoji}</span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex flex-wrap items-center gap-1.5">
                                    <span className="text-[15px] font-semibold text-white">{opt.label}</span>
                                    {opt.recommended && (
                                      <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: accent, color: "#0a0e14" }}>
                                        Recommended
                                      </span>
                                    )}
                                  </span>
                                  {opt.hint && <span className="mt-0.5 block text-[12px] text-white/55">{opt.hint}</span>}
                                  {opt.stayMin != null && opt.stayMin > 0 && (
                                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold text-white/80">
                                      <Hourglass size={10} /> ≈{fmtDur(opt.stayMin)}
                                    </span>
                                  )}
                                  {opt.why && <span className="mt-1 block text-[12.5px] leading-snug text-white/75">{opt.why}</span>}
                                  {(opt.rating || opt.mapsUrl) && (
                                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                                      {opt.rating && <RatingLine rating={opt.rating} accent={accent} />}
                                      {opt.mapsUrl && <MapsLink url={opt.mapsUrl} accent={accent} small />}
                                    </span>
                                  )}
                                </span>
                                <span className="mt-2 grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-all" style={{ borderColor: isSel ? accent : "rgba(255,255,255,0.18)", background: isSel ? accent : "transparent", color: "#0a0e14" }}>
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
                            placeholder={selected.freeTextPlaceholder ?? "Type here"}
                            rows={2}
                            className="mt-2 w-full resize-none rounded-2xl border bg-white/5 px-3.5 py-3 text-[15px] text-white placeholder:text-white/35 focus:outline-none"
                            style={{ borderColor: `${accent}66` }}
                          />
                        )}
                        {selected?.id === "suggest" && note.trim().length > 2 && (
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(note.trim() + " Daman")}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold"
                            style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}
                          >
                            <MapPin size={12} /> Check “{note.trim().slice(0, 28)}{note.trim().length > 28 ? "…" : ""}” on Google Maps <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}

                    {isLast && (
                      <div className="mt-4">
                        <div className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">Our itinerary</div>
                        <div className="mb-2.5 grid grid-cols-2 gap-2">
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 rounded-2xl py-3 text-[14px] font-bold text-[#0a0e14]"
                            style={{ background: "#25D366", boxShadow: "0 12px 30px -12px #25D366" }}
                          >
                            <WhatsAppIcon /> Share on WhatsApp
                          </a>
                          <button onClick={copy} className="flex items-center justify-center gap-2 rounded-2xl border py-3 text-[14px] font-semibold" style={{ borderColor: `${accent}66`, color: accent, background: `${accent}14` }}>
                            <Copy size={15} /> {copied === "ok" ? "Copied" : copied === "fail" ? "Couldn't copy" : "Copy message"}
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 px-3.5 py-3 font-sans text-[13px] leading-[1.5] text-white/80">{message}</pre>
                        {plan.length === 0 && <p className="mt-2 text-[12px] text-white/45">No choices were made on this run, so the defaults are listed.</p>}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-4 flex items-center gap-2">
                {stepIndex > 0 && (
                  <button onClick={onBack} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/5 text-white/70 active:scale-95" aria-label="Previous stop">
                    <ArrowLeft size={18} />
                  </button>
                )}
                <motion.button
                  whileTap={{ scale: choiceMade ? 0.98 : 1 }}
                  onClick={isLast ? onReset : onNext}
                  disabled={!choiceMade}
                  className="relative flex h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl text-[15px] font-bold tracking-tight disabled:cursor-not-allowed"
                  style={{ background: choiceMade ? accent : "rgba(255,255,255,0.08)", color: choiceMade ? "#0a0e14" : "rgba(255,255,255,0.4)", boxShadow: choiceMade ? `0 14px 36px -12px ${accent}` : "none" }}
                >
                  {choiceMade && <span className="shimmer pointer-events-none absolute inset-0" />}
                  {isLast ? <RotateCcw size={16} /> : null}
                  <span className="relative">{!choiceMade ? (selected?.freeText ? "Type it to continue" : "Pick an option to continue") : step.actionLabel}</span>
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
