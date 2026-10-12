import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sunrise } from "lucide-react";

interface Props {
  show: boolean;
}

/** Full-screen night → morning card shown when the itinerary moves from Day 1 to Day 2. */
export default function DayTransition({ show }: Props) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="day-transition"
          className="absolute inset-0 z-[900] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.7 } }}
          transition={{ duration: 0.4 }}
        >
          {/* Night sky → dawn */}
          <motion.div
            className="absolute inset-0"
            initial={{ background: "linear-gradient(180deg, #05070c 0%, #0b1020 60%, #141b2b 100%)" }}
            animate={{ background: "linear-gradient(180deg, #0a1a24 0%, #0f3a3e 55%, #2dd4bf 140%)" }}
            transition={{ delay: 1.6, duration: 1.4, ease: "easeInOut" }}
          />
          {/* stars */}
          {[...Array(26)].map((_, i) => (
            <motion.span
              key={i}
              className="absolute h-[2px] w-[2px] rounded-full bg-white"
              style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 60}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.9, 0.3, 0] }}
              transition={{ delay: 0.2 + (i % 5) * 0.15, duration: 2.4 }}
            />
          ))}
          {/* sun */}
          <motion.div
            className="absolute left-1/2 h-40 w-40 rounded-full"
            style={{ background: "radial-gradient(circle, #f5b547 0%, rgba(245,181,71,0.35) 45%, transparent 70%)", top: "58%" }}
            initial={{ x: "-50%", y: 160, opacity: 0 }}
            animate={{ x: "-50%", y: 0, opacity: 1 }}
            transition={{ delay: 1.7, duration: 1.3, ease: [0.2, 0.8, 0.2, 1] }}
          />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: [0, 1, 1, 0], y: [12, 0, 0, -10] }}
              transition={{ duration: 1.9, times: [0, 0.2, 0.75, 1] }}
              className="absolute flex flex-col items-center"
            >
              <Moon size={28} className="text-white/70" />
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/50">Day 1 complete</div>
              <div className="mt-2 font-display text-[40px] italic leading-none text-white">Good night, Daman</div>
              <div className="mt-3 text-[14px] text-white/60">Tuesday 3 Nov · back at Moustache</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.0, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
              className="absolute flex flex-col items-center"
            >
              <Sunrise size={28} className="text-sun-400" />
              <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-sea-300">Day 2 · Moti Daman</div>
              <div className="mt-2 font-display text-[40px] italic leading-none text-white">Good morning</div>
              <div className="mt-3 text-[14px] text-white/70">Wednesday 4 Nov · breakfast at 9:30, check-out at 11</div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
