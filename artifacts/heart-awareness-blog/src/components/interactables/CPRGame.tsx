import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, AlertTriangle, CheckCircle2, RotateCcw, ChevronRight } from "lucide-react";

type Phase =
  | "intro"
  | "scene"
  | "responsive"
  | "call911"
  | "compressions"
  | "breaths"
  | "complete";

const STEPS: { phase: Phase; label: string; emoji: string }[] = [
  { phase: "scene",        label: "Check Scene",          emoji: "👀" },
  { phase: "responsive",   label: "Check Response",       emoji: "🤚" },
  { phase: "call911",      label: "Call for Help",        emoji: "📞" },
  { phase: "compressions", label: "30 Compressions",      emoji: "👐" },
  { phase: "breaths",      label: "2 Rescue Breaths",     emoji: "💨" },
];

const TARGET_MIN = 100;
const TARGET_MAX = 120;
const TOTAL_COMPRESSIONS = 30;

function bpmColor(bpm: number | null) {
  if (!bpm) return "rgba(255,255,255,0.08)";
  if (bpm >= TARGET_MIN && bpm <= TARGET_MAX) return "rgba(34,197,94,0.5)";
  if (bpm >= 80 && bpm < TARGET_MIN) return "rgba(251,191,36,0.45)";
  if (bpm > TARGET_MAX && bpm <= 150) return "rgba(251,191,36,0.45)";
  return "rgba(239,68,68,0.45)";
}

function bpmLabel(bpm: number | null) {
  if (!bpm) return null;
  if (bpm >= TARGET_MIN && bpm <= TARGET_MAX) return { text: "Perfect pace!", color: "#22c55e" };
  if (bpm < TARGET_MIN) return { text: "Push faster!", color: "#fbbf24" };
  return { text: "Slow down a bit", color: "#fbbf24" };
}

interface Props { onClose: () => void; }

export function CPRGameModal({ onClose }: Props) {
  const [phase, setPhase]           = useState<Phase>("intro");
  const [count, setCount]           = useState(0);        // compressions done
  const [bpm, setBpm]               = useState<number | null>(null);
  const [breathsDone, setBreathsDone] = useState(0);
  const [shake, setShake]           = useState(false);
  const [pulse, setPulse]           = useState(false);
  const lastClickRef                = useRef<number | null>(null);
  const stepIndex = STEPS.findIndex(s => s.phase === phase);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const triggerPulse = () => {
    setPulse(true);
    setTimeout(() => setPulse(false), 180);
  };

  const handleCompression = () => {
    const now = Date.now();
    if (lastClickRef.current) {
      const intervalMs = now - lastClickRef.current;
      const newBpm = Math.round(60000 / intervalMs);
      setBpm(newBpm > 200 ? 200 : newBpm);
    }
    lastClickRef.current = now;
    triggerPulse();
    setCount(prev => {
      const next = prev + 1;
      if (next >= TOTAL_COMPRESSIONS) {
        setTimeout(() => {
          setBpm(null);
          lastClickRef.current = null;
          setPhase("breaths");
        }, 400);
      }
      return next;
    });
  };

  const handleBreath = () => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
    setBreathsDone(prev => {
      if (prev + 1 >= 2) setTimeout(() => setPhase("complete"), 400);
      return prev + 1;
    });
  };

  const restart = () => {
    setPhase("intro"); setCount(0); setBpm(null);
    setBreathsDone(0); lastClickRef.current = null;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 24 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-lg rounded-3xl overflow-hidden relative"
        style={{ background: "#0f0c0c", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <span className="text-sm">🫀</span>
            </div>
            <div>
              <p className="text-white text-sm font-semibold leading-none">CPR Training</p>
              <p className="text-white/30 text-[10px] mt-0.5">Interactive guide</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors cursor-pointer p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Step progress bar */}
        {phase !== "intro" && phase !== "complete" && (
          <div className="px-6 pt-4">
            <div className="flex gap-1.5">
              {STEPS.map((s, i) => (
                <div
                  key={s.phase}
                  className="flex-1 h-1 rounded-full transition-all duration-300"
                  style={{ background: i < stepIndex ? "#ef4444" : i === stepIndex ? "rgba(239,68,68,0.6)" : "rgba(255,255,255,0.1)" }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-xs">{STEPS[stepIndex]?.emoji}</span>
              <p className="text-[11px] text-white/40 font-medium">{STEPS[stepIndex]?.label}</p>
              <span className="text-white/20 text-[11px]">· Step {stepIndex + 1} of {STEPS.length}</span>
            </div>
          </div>
        )}

        {/* Phases */}
        <div className="p-6 min-h-[320px] flex flex-col justify-between">
          <AnimatePresence mode="wait">

            {/* Intro */}
            {phase === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col items-center text-center gap-4 py-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <span className="text-4xl">🫀</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CPR Training Game</h2>
                  <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">Step through a real CPR scenario. You'll check the scene, call for help, and do compressions at the right pace.</p>
                </div>
                <div className="flex flex-col gap-2 w-full max-w-xs text-left mt-2">
                  {STEPS.map(s => (
                    <div key={s.phase} className="flex items-center gap-3 text-xs text-white/50">
                      <span className="text-base flex-shrink-0">{s.emoji}</span>
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPhase("scene")}
                  className="mt-2 px-8 py-3 rounded-xl bg-red-700 hover:bg-red-600 transition-colors text-white font-semibold text-sm cursor-pointer"
                >
                  Start Training →
                </button>
              </motion.div>
            )}

            {/* Scene check */}
            {phase === "scene" && (
              <motion.div key="scene" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Is the scene safe?</h2>
                  <p className="text-sm text-white/40 leading-relaxed">Before approaching, scan the area for hazards — traffic, fire, electrical risks. Only help if you won't be harmed.</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: "🚗", label: "No traffic" },
                    { icon: "🔥", label: "No fire" },
                    { icon: "⚡", label: "No electricity" },
                  ].map(h => (
                    <div key={h.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                      <div className="text-2xl mb-1">{h.icon}</div>
                      <p className="text-[11px] text-white/50">{h.label}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setPhase("responsive")}
                  className="w-full py-3.5 rounded-xl bg-green-700/80 hover:bg-green-700 transition-colors text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="h-4 w-4" /> Scene is safe — approach
                </button>
              </motion.div>
            )}

            {/* Responsiveness */}
            {phase === "responsive" && (
              <motion.div key="responsive" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Check for responsiveness</h2>
                  <p className="text-sm text-white/40 leading-relaxed">Tap the person's shoulder firmly and shout: <em className="text-white/70">"Are you OK? Can you hear me?"</em></p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  animate={shake ? { x: [-4, 4, -4, 4, 0] } : {}}
                  onClick={() => { setShake(true); setTimeout(() => { setShake(false); setPhase("call911"); }, 700); }}
                  className="w-full py-12 rounded-2xl flex flex-col items-center gap-3 cursor-pointer transition-all"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.07)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                >
                  <span className="text-5xl">🤚</span>
                  <p className="text-white/60 text-sm">Tap to shake shoulder</p>
                </motion.button>
              </motion.div>
            )}

            {/* Call 911 */}
            {phase === "call911" && (
              <motion.div key="call911" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>No response — call for help</h2>
                  <p className="text-sm text-white/40 leading-relaxed">If the person is unresponsive and not breathing normally, call emergency services immediately. If others are nearby, shout <em className="text-white/70">"Someone call 911!"</em></p>
                </div>
                <div className="flex items-center gap-3 rounded-xl p-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-xs text-white/50 leading-relaxed">If alone, call first. If others are present, tell someone specific to call — pointing increases response rate.</p>
                </div>
                <button
                  onClick={() => setPhase("compressions")}
                  className="w-full py-3.5 rounded-xl text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(239,68,68,0.8)", border: "1px solid rgba(239,68,68,0.4)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(239,68,68,0.8)")}
                >
                  <Phone className="h-4 w-4" /> 911 called — start CPR
                </button>
              </motion.div>
            )}

            {/* Compressions game */}
            {phase === "compressions" && (
              <motion.div key="compressions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>30 chest compressions</h2>
                    <p className="text-sm text-white/40">Push hard and fast — aim for 100–120 BPM</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-3xl font-bold text-white leading-none">{count}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">of {TOTAL_COMPRESSIONS}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-red-600"
                    animate={{ width: `${(count / TOTAL_COMPRESSIONS) * 100}%` }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                </div>

                {/* BPM feedback */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/30">BPM target: 100–120</span>
                  {bpm && (
                    <span style={{ color: bpmLabel(bpm)?.color }} className="font-medium">
                      {bpm} BPM — {bpmLabel(bpm)?.text}
                    </span>
                  )}
                </div>

                {/* Big compression button */}
                <motion.button
                  animate={pulse ? { scale: [1, 0.93, 1] } : {}}
                  transition={{ duration: 0.18 }}
                  onClick={handleCompression}
                  disabled={count >= TOTAL_COMPRESSIONS}
                  className="w-full py-12 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all select-none"
                  style={{
                    background: bpmColor(bpm),
                    border: `1px solid ${bpm && bpm >= TARGET_MIN && bpm <= TARGET_MAX ? "rgba(34,197,94,0.4)" : "rgba(255,255,255,0.12)"}`,
                  }}
                >
                  <span className="text-5xl">{count >= TOTAL_COMPRESSIONS ? "✅" : "👐"}</span>
                  <p className="text-white/70 text-sm font-medium select-none">
                    {count >= TOTAL_COMPRESSIONS ? "Compressions done!" : "Press to compress"}
                  </p>
                  {!bpm && count === 0 && (
                    <p className="text-white/30 text-xs">Keep a steady rhythm</p>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Rescue breaths */}
            {phase === "breaths" && (
              <motion.div key="breaths" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>2 rescue breaths</h2>
                    <p className="text-sm text-white/40">Tilt the head back, lift the chin, seal mouth-to-mouth and give a breath over 1 second. Watch for chest rise.</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-3xl font-bold text-white leading-none">{breathsDone}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">of 2</p>
                  </div>
                </div>
                <div className="flex gap-4 justify-center">
                  {[0, 1].map(i => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.92 }}
                      onClick={breathsDone === i ? handleBreath : undefined}
                      disabled={breathsDone > i}
                      className="flex-1 py-10 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-all"
                      style={{
                        background: breathsDone > i ? "rgba(34,197,94,0.15)" : breathsDone === i ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)",
                        border: breathsDone > i ? "1px solid rgba(34,197,94,0.35)" : "1px solid rgba(255,255,255,0.1)",
                        opacity: breathsDone < i ? 0.4 : 1,
                        cursor: breathsDone === i ? "pointer" : "default",
                      }}
                      onMouseEnter={e => { if (breathsDone === i) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                      onMouseLeave={e => { if (breathsDone === i) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                    >
                      <span className="text-4xl">{breathsDone > i ? "✅" : "💨"}</span>
                      <p className="text-white/60 text-xs">Breath {i + 1}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Complete */}
            {phase === "complete" && (
              <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center gap-4 py-4">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.15 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <span className="text-4xl">🏆</span>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Cycle complete!</h2>
                  <p className="text-sm text-white/40 leading-relaxed max-w-xs mx-auto">
                    Great work. In a real emergency, keep repeating — 30 compressions then 2 breaths — until paramedics arrive or the person responds.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-xs mt-2">
                  <div className="rounded-xl p-3 text-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <p className="text-2xl font-bold text-white">30</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Compressions</p>
                  </div>
                  <div className="rounded-xl p-3 text-center" style={{ background: "rgba(79,70,229,0.1)", border: "1px solid rgba(79,70,229,0.2)" }}>
                    <p className="text-2xl font-bold text-white">2</p>
                    <p className="text-[10px] text-white/35 mt-0.5">Rescue breaths</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={restart} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors cursor-pointer">
                    <RotateCcw className="h-3.5 w-3.5" /> Practice again
                  </button>
                  <button onClick={onClose} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-medium transition-colors cursor-pointer">
                    Done <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer disclaimer */}
        {phase !== "intro" && phase !== "complete" && (
          <div className="px-6 pb-4">
            <p className="text-[10px] text-white/20 text-center leading-relaxed">
              ⚠️ For educational purposes only. This is not a substitute for accredited CPR certification.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
