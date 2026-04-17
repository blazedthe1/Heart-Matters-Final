import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, RotateCcw, Trophy, Zap } from "lucide-react";

/* ── Constants ─────────────────────────────────────── */
const BEAT_MS          = 545;   // target ~110 BPM
const PERFECT_WINDOW   = 80;    // ±ms for perfect
const GOOD_WINDOW      = 160;   // ±ms for good
const TOTAL_COMPRESSIONS = 30;
const MAX_LIVES        = 3;
const TOTAL_ROUNDS     = 3;

type Phase =
  | "intro"
  | "countdown"
  | "compressions"
  | "breaths"
  | "roundEnd"
  | "complete";

type HitQuality = "PERFECT!" | "GOOD" | "MISS";

interface HitLabel { text: HitQuality; color: string; }

const HIT_META: Record<HitQuality, { color: string; points: number; lifeChange: number }> = {
  "PERFECT!": { color: "#22c55e", points: 100, lifeChange:  0 },
  "GOOD":     { color: "#fbbf24", points:  40, lifeChange:  0 },
  "MISS":     { color: "#ef4444", points:   0, lifeChange: -1 },
};

function getRating(score: number, maxPossible: number) {
  const pct = score / maxPossible;
  if (pct >= 0.9) return { label: "Heart Hero!", emoji: "🏆", color: "#fbbf24" };
  if (pct >= 0.7) return { label: "Well done!",  emoji: "💚", color: "#22c55e" };
  if (pct >= 0.5) return { label: "Not bad!",    emoji: "👍", color: "#60a5fa" };
  return           { label: "Keep practicing", emoji: "💪", color: "#f87171" };
}

interface Props { onClose: () => void; }

export function CPRGameModal({ onClose }: Props) {
  /* ── Game state ─── */
  const [phase,          setPhase]          = useState<Phase>("intro");
  const [round,          setRound]          = useState(1);
  const [count,          setCount]          = useState(0);
  const [breathCount,    setBreathCount]    = useState(0);
  const [score,          setScore]          = useState(0);
  const [combo,          setCombo]          = useState(0);
  const [maxCombo,       setMaxCombo]       = useState(0);
  const [lives,          setLives]          = useState(MAX_LIVES);
  const [health,         setHealth]         = useState(20);
  const [hitLabel,       setHitLabel]       = useState<HitLabel | null>(null);
  const [beatActive,     setBeatActive]     = useState(false);
  const [countdown,      setCountdown]      = useState(3);
  const [pressEffect,    setPressEffect]    = useState(false);

  const lastClickRef    = useRef<number | null>(null);
  const beatTimestamps  = useRef<number[]>([]);
  const beatInterval    = useRef<ReturnType<typeof setInterval> | null>(null);
  const hitTimeout      = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Keyboard close ─── */
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  /* ── Beat metronome ─── */
  useEffect(() => {
    if (phase === "compressions") {
      beatTimestamps.current = [];
      beatInterval.current = setInterval(() => {
        const now = Date.now();
        beatTimestamps.current.push(now);
        setBeatActive(true);
        setTimeout(() => setBeatActive(false), 100);
      }, BEAT_MS);
    }
    return () => {
      if (beatInterval.current) clearInterval(beatInterval.current);
    };
  }, [phase]);

  /* ── Countdown ─── */
  useEffect(() => {
    if (phase !== "countdown") return;
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 800);
    const t2 = setTimeout(() => setCountdown(1), 1600);
    const t3 = setTimeout(() => {
      setPhase("compressions");
      lastClickRef.current = null;
    }, 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [phase]);

  /* ── Show hit label ─── */
  const showHit = (quality: HitQuality) => {
    if (hitTimeout.current) clearTimeout(hitTimeout.current);
    setHitLabel({ text: quality, color: HIT_META[quality].color });
    hitTimeout.current = setTimeout(() => setHitLabel(null), 700);
  };

  /* ── Compression press ─── */
  const handleCompression = () => {
    const now     = Date.now();
    setPressEffect(true);
    setTimeout(() => setPressEffect(false), 150);

    let quality: HitQuality = "MISS";

    if (lastClickRef.current !== null) {
      const elapsed   = now - lastClickRef.current;
      const deviation = Math.abs(elapsed - BEAT_MS);
      if (deviation <= PERFECT_WINDOW) quality = "PERFECT!";
      else if (deviation <= GOOD_WINDOW) quality = "GOOD";
      else quality = "MISS";
    } else {
      quality = "GOOD"; // first press
    }

    lastClickRef.current = now;
    const meta = HIT_META[quality];
    showHit(quality);

    setLives(prev => {
      const next = Math.min(MAX_LIVES, prev + meta.lifeChange);
      if (next <= 0) { setPhase("complete"); }
      return Math.max(0, next);
    });

    const newCombo = quality === "MISS" ? 0 : combo + 1;
    setCombo(newCombo);
    setMaxCombo(prev => Math.max(prev, newCombo));

    const pts = meta.points * (quality !== "MISS" ? Math.max(1, Math.floor(newCombo / 5) + 1) : 1);
    setScore(prev => prev + pts);

    setHealth(prev => {
      const delta = quality === "PERFECT!" ? 4 : quality === "GOOD" ? 2 : -3;
      return Math.min(100, Math.max(0, prev + delta));
    });

    setCount(prev => {
      const next = prev + 1;
      if (next >= TOTAL_COMPRESSIONS) {
        if (beatInterval.current) clearInterval(beatInterval.current);
        setTimeout(() => setPhase("breaths"), 400);
      }
      return next;
    });
  };

  /* ── Breath press ─── */
  const handleBreath = () => {
    setBreathCount(prev => {
      const next = prev + 1;
      if (next >= 2) {
        setTimeout(() => {
          if (round >= TOTAL_ROUNDS) {
            setPhase("complete");
          } else {
            setPhase("roundEnd");
          }
        }, 400);
      }
      return next;
    });
  };

  /* ── Start next round ─── */
  const startNextRound = () => {
    setRound(r => r + 1);
    setCount(0);
    setBreathCount(0);
    setPhase("countdown");
  };

  /* ── Restart ─── */
  const restart = () => {
    setPhase("intro");
    setRound(1); setCount(0); setBreathCount(0);
    setScore(0); setCombo(0); setMaxCombo(0);
    setLives(MAX_LIVES); setHealth(20);
    lastClickRef.current = null; beatTimestamps.current = [];
  };

  const maxPossible = TOTAL_ROUNDS * TOTAL_COMPRESSIONS * 100 * 4;

  /* ── Health bar color ─── */
  const healthColor = health >= 70 ? "#22c55e" : health >= 40 ? "#fbbf24" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, y: 28 }} animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 28 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="w-full max-w-md rounded-3xl overflow-hidden relative select-none"
        style={{ background: "#0a0808", border: "1px solid rgba(255,255,255,0.08)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <span className="text-sm">🫀</span>
            </div>
            <p className="text-white text-sm font-semibold">CPR Rush</p>
          </div>
          {(phase === "compressions" || phase === "breaths" || phase === "roundEnd") && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: MAX_LIVES }).map((_, i) => (
                  <Heart key={i} className={`h-3.5 w-3.5 ${i < lives ? "fill-red-500 text-red-500" : "text-white/15"}`} />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-400" />
                <span className="text-xs font-bold text-white">{score.toLocaleString()}</span>
              </div>
            </div>
          )}
          <button onClick={onClose} className="text-white/25 hover:text-white transition-colors cursor-pointer p-1 ml-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="min-h-[380px] flex flex-col">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {phase === "intro" && (
              <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center text-center gap-5 px-6 py-10">
                <motion.div
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
                >
                  <span className="text-4xl">⛑</span>
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1.5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CPR Rush</h2>
                  <p className="text-sm text-white/40 max-w-xs mx-auto leading-relaxed">Keep the patient alive! Press to the beat — time your compressions at 100–120 BPM. Earn combos for perfect rhythm.</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30">
                  <span>🎯 Perfect = +100 pts</span>
                  <span>⚡ Combos = multiplier</span>
                  <span>❤️ 3 lives</span>
                </div>
                <button
                  onClick={() => setPhase("countdown")}
                  className="px-8 py-3 rounded-xl bg-red-700 hover:bg-red-600 transition-colors text-white font-bold text-sm cursor-pointer"
                >
                  Start Game →
                </button>
              </motion.div>
            )}

            {/* COUNTDOWN */}
            {phase === "countdown" && (
              <motion.div key="countdown" className="flex flex-col items-center justify-center gap-4 px-6 py-12">
                <p className="text-xs text-white/30 uppercase tracking-widest">Round {round} of {TOTAL_ROUNDS}</p>
                <motion.p
                  key={countdown}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.5, opacity: 0 }}
                  className="text-7xl font-black text-white"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {countdown}
                </motion.p>
                <p className="text-sm text-white/30">Get ready…</p>
              </motion.div>
            )}

            {/* COMPRESSIONS */}
            {phase === "compressions" && (
              <motion.div key="compressions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3 px-5 py-4">
                {/* Patient health */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-white/30 uppercase tracking-widest flex-shrink-0">Patient</span>
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div className="h-full rounded-full transition-all duration-200" style={{ width: `${health}%`, background: healthColor }} />
                  </div>
                  <span className="text-[11px] font-bold flex-shrink-0" style={{ color: healthColor }}>{health}%</span>
                </div>

                {/* Round / combo / count */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/25">Round {round}/{TOTAL_ROUNDS}</span>
                  {combo >= 3 && (
                    <motion.span
                      key={combo}
                      initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                      className="font-bold text-amber-400"
                    >
                      🔥 ×{Math.floor(combo / 5) + 1} combo
                    </motion.span>
                  )}
                  <span className="text-white/40 font-mono">{count} / {TOTAL_COMPRESSIONS}</span>
                </div>

                {/* Compression bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div className="h-full rounded-full bg-red-600" style={{ width: `${(count / TOTAL_COMPRESSIONS) * 100}%` }} transition={{ type: "spring", stiffness: 300 }} />
                </div>

                {/* Beat guide */}
                <div className="flex items-center justify-center gap-2 py-1">
                  <motion.div
                    animate={beatActive ? { scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] } : {}}
                    transition={{ duration: 0.18 }}
                    className="w-3 h-3 rounded-full bg-red-500"
                  />
                  <span className="text-[10px] text-white/25 uppercase tracking-widest">Beat guide — press in sync</span>
                  <motion.div
                    animate={beatActive ? { scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] } : {}}
                    transition={{ duration: 0.18 }}
                    className="w-3 h-3 rounded-full bg-red-500"
                  />
                </div>

                {/* Hit label */}
                <div className="h-6 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    {hitLabel && (
                      <motion.span
                        key={hitLabel.text + Date.now()}
                        initial={{ y: -8, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 8, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="text-sm font-black tracking-wide"
                        style={{ color: hitLabel.color }}
                      >
                        {hitLabel.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* Big press button */}
                <motion.button
                  animate={pressEffect
                    ? { scale: [1, 0.88, 1.04, 1], boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 32px rgba(239,68,68,0.6)", "0 0 0px rgba(239,68,68,0)"] }
                    : beatActive
                    ? { boxShadow: ["0 0 0px rgba(239,68,68,0)", "0 0 18px rgba(239,68,68,0.35)", "0 0 0px rgba(239,68,68,0)"] }
                    : {}}
                  transition={{ duration: 0.18 }}
                  onClick={handleCompression}
                  className="w-full py-12 rounded-2xl flex flex-col items-center gap-2 cursor-pointer transition-colors active:scale-95"
                  style={{ background: "rgba(185,28,28,0.12)", border: "2px solid rgba(185,28,28,0.35)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,0.2)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(185,28,28,0.12)")}
                >
                  <motion.span
                    animate={pressEffect ? { scale: [1, 0.8, 1.1, 1] } : {}}
                    transition={{ duration: 0.18 }}
                    className="text-5xl"
                  >
                    👐
                  </motion.span>
                  <p className="text-white/50 text-xs font-medium">Press to compress</p>
                </motion.button>
              </motion.div>
            )}

            {/* BREATHS */}
            {phase === "breaths" && (
              <motion.div key="breaths" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-5 px-5 py-8">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Compressions done!</p>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Now give 2 rescue breaths</h3>
                </div>
                <div className="flex gap-5">
                  {[0, 1].map(i => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={breathCount === i ? handleBreath : undefined}
                      className="w-28 h-28 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                      style={{
                        cursor:     breathCount === i ? "pointer" : "default",
                        background: breathCount > i  ? "rgba(34,197,94,0.2)"  : breathCount === i ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                        border:     breathCount > i  ? "2px solid rgba(34,197,94,0.5)" : "2px solid rgba(255,255,255,0.1)",
                        opacity:    breathCount < i  ? 0.35 : 1,
                      }}
                      onMouseEnter={e => { if (breathCount === i) e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                      onMouseLeave={e => { if (breathCount === i) e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                    >
                      <span className="text-3xl">{breathCount > i ? "✅" : "💨"}</span>
                      <span className="text-[11px] text-white/50">Breath {i + 1}</span>
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-white/25 text-center max-w-xs">Tilt head back, seal the airway, one full breath each</p>
              </motion.div>
            )}

            {/* ROUND END */}
            {phase === "roundEnd" && (
              <motion.div key="roundEnd" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 px-6 py-10 text-center">
                <span className="text-5xl">✅</span>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Round {round} complete</p>
                  <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Keep going!</h3>
                  <p className="text-sm text-white/40 mt-1">In a real emergency, you keep cycling until help arrives.</p>
                </div>
                <div className="flex gap-3 text-sm font-bold">
                  <span className="text-amber-400">Score: {score.toLocaleString()}</span>
                  <span className="text-white/20">·</span>
                  <span className="text-indigo-400">Best combo: ×{Math.floor(maxCombo / 5) + 1}</span>
                </div>
                <button onClick={startNextRound}
                  className="px-8 py-3 rounded-xl bg-red-700 hover:bg-red-600 text-white font-bold text-sm cursor-pointer transition-colors">
                  Round {round + 1} →
                </button>
              </motion.div>
            )}

            {/* COMPLETE */}
            {phase === "complete" && (() => {
              const rating = getRating(score, maxPossible);
              return (
                <motion.div key="complete" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-4 px-6 py-8 text-center">
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: "spring", delay: 0.1 }}
                    className="text-5xl"
                  >
                    {rating.emoji}
                  </motion.span>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Game Over</p>
                    <h3 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Cormorant Garamond', serif", color: rating.color }}>
                      {rating.label}
                    </h3>
                    <p className="text-sm text-white/35">Patient health: <span style={{ color: healthColor }}>{health}%</span></p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 w-full">
                    <div className="rounded-xl p-3" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
                      <p className="text-lg font-black text-amber-400">{score.toLocaleString()}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Score</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                      <p className="text-lg font-black text-indigo-400">×{Math.floor(maxCombo / 5) + 1}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Best Combo</p>
                    </div>
                    <div className="rounded-xl p-3" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <p className="text-lg font-black text-red-400">{lives}</p>
                      <p className="text-[10px] text-white/30 mt-0.5">Lives left</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={restart}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium cursor-pointer transition-colors">
                      <RotateCcw className="h-3.5 w-3.5" /> Play again
                    </button>
                    <button onClick={onClose}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm font-medium cursor-pointer transition-colors">
                      <Trophy className="h-3.5 w-3.5" /> Finish
                    </button>
                  </div>
                </motion.div>
              );
            })()}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-[9px] text-white/15 text-center pb-3 px-6">
          ⚠️ Educational only — not a substitute for certified CPR training
        </p>
      </motion.div>
    </motion.div>
  );
}
