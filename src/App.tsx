import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2 } from "lucide-react";
import MapView from "./components/MapView";
import GuideSheet from "./components/GuideSheet";
import TopBar from "./components/TopBar";
import Timeline from "./components/Timeline";
import { useItinerary } from "./hooks/useItinerary";

const ACCENT = { 1: "#f5b547", 2: "#2dd4bf" } as const;

export default function App() {
  const it = useItinerary();
  const accent = ACCENT[it.step.day];

  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(300);
  const [progress, setProgress] = useState(0);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [overviewKey, setOverviewKey] = useState(0);

  // Measure the sheet so the camera keeps the target in the visible map area.
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSheetHeight(Math.round(entry.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const onArrived = useCallback(() => {
    setProgress(0);
    it.arrived();
  }, [it.arrived]);

  return (
    <div className="app-shell">
      <div className="absolute inset-0">
        <MapView
          steps={it.steps}
          stepIndex={it.state.stepIndex}
          step={it.step}
          phase={it.state.phase}
          journeyKey={it.state.journeyKey}
          choices={it.state.choices}
          activeLeg={it.activeLeg}
          accent={accent}
          sheetHeight={sheetHeight}
          overviewKey={overviewKey}
          onArrived={onArrived}
          onProgress={setProgress}
        />
      </div>

      {/* Vignette so the chrome reads cleanly over any tile */}
      <div className="pointer-events-none absolute inset-0 z-[400] bg-[radial-gradient(120%_80%_at_50%_0%,rgba(7,9,13,0.55)_0%,rgba(7,9,13,0)_45%),linear-gradient(to_top,rgba(7,9,13,0.75)_0%,rgba(7,9,13,0)_40%)]" />

      <TopBar
        steps={it.steps}
        stepIndex={it.state.stepIndex}
        step={it.step}
        accent={accent}
        onOpenTimeline={() => setTimelineOpen(true)}
      />

      {/* Floating map action */}
      <button
        onClick={() => setOverviewKey((k) => k + 1)}
        className="glass absolute right-4 z-[500] grid h-11 w-11 place-items-center rounded-full text-white/85 transition-transform active:scale-95"
        style={{ bottom: sheetHeight + 16 }}
        aria-label="Show the day so far"
      >
        <Maximize2 size={17} />
      </button>

      <GuideSheet
        ref={sheetRef}
        step={it.step}
        prevStep={it.prevStep}
        stepIndex={it.state.stepIndex}
        total={it.steps.length}
        phase={it.state.phase}
        progress={progress}
        accent={accent}
        choiceId={it.state.choices[it.step.id]}
        choiceMade={it.choiceMade}
        isLast={it.isLast}
        onNext={it.next}
        onBack={it.back}
        onChoose={it.choose}
        onReset={it.reset}
      />

      <Timeline
        open={timelineOpen}
        steps={it.steps}
        stepIndex={it.state.stepIndex}
        choices={it.state.choices}
        onClose={() => setTimelineOpen(false)}
        onJump={it.jump}
        onReset={it.reset}
      />
    </div>
  );
}
