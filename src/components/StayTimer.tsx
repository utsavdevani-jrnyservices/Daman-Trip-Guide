import { motion } from "framer-motion";
import { fmtDur } from "../lib/schedule";

interface Props {
  minutes: number;
  accent: string;
  /** Re-run the draw animation when this changes. */
  playKey: string;
}

/** A ring that draws itself on arrival, with the expected time at the stop inside. */
export default function StayTimer({ minutes, accent, playKey }: Props) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-16 w-16 shrink-0">
        <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
          <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
          <motion.circle
            key={playKey}
            cx="32"
            cy="32"
            r={r}
            fill="none"
            stroke={accent}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 2.2, ease: [0.2, 0.8, 0.2, 1], delay: 0.2 }}
            style={{ filter: `drop-shadow(0 0 6px ${accent}88)` }}
          />
        </svg>
        <motion.div
          key={`${playKey}-label`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="absolute inset-0 grid place-items-center text-center leading-none"
        >
          <span className="text-[13px] font-extrabold text-white">{fmtDur(minutes).replace(" min", "m").replace(" h", "h")}</span>
        </motion.div>
      </div>
      <div className="leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">Expected time here</div>
        <div className="text-[18px] font-bold text-white">≈{fmtDur(minutes)}</div>
      </div>
    </div>
  );
}
