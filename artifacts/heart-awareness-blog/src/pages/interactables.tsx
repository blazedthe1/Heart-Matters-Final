import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/* ─── Game constants ─────────────────────────────────────────────── */

const W = 480;
const H = 600;
const PLAYER_W = 52;
const PLAYER_H = 52;
const PLAYER_Y = H - 80;
const PLAYER_SPEED = 6;

const DIFFICULTIES = {
  easy:   { label: "Easy",   color: "#22c55e", dropSpeed: 1.6,  spawnMs: 1400, increment: 0.00008 },
  medium: { label: "Medium", color: "#f59e0b", dropSpeed: 2.4,  spawnMs: 1100, increment: 0.00018 },
  hard:   { label: "Hard",   color: "#ef4444", dropSpeed: 3.5,  spawnMs: 750,  increment: 0.00032 },
} as const;
type Difficulty = keyof typeof DIFFICULTIES;

const GOOD = ["🥦", "🍎", "💧", "🏃", "🥕", "🫐"];
const BAD  = ["🍔", "🍟", "🚬", "🍕", "🥤", "😰"];

interface Item {
  id: number; x: number; y: number; emoji: string; good: boolean; size: number;
}
interface Particle {
  id: number; x: number; y: number; emoji: string;
  vx: number; vy: number; life: number; maxLife: number;
}

let idCounter = 0;
const nextId = () => ++idCounter;

type Phase = "idle" | "playing" | "over";

/* ─── useGame hook ───────────────────────────────────────────────── */

function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>, difficulty: Difficulty) {
  const diff = DIFFICULTIES[difficulty];
  const state = useRef({
    phase: "idle" as Phase,
    playerX: W / 2 - PLAYER_W / 2,
    left: false, right: false,
    items: [] as Item[],
    particles: [] as Particle[],
    score: 0, lives: 3,
    speed: diff.dropSpeed,
    frame: 0, shakeFrames: 0,
  });

  const [display, setDisplay] = useState({ score: 0, lives: 3, phase: "idle" as Phase, hiScore: 0 });
  const hiScoreRef = useRef(0);
  const rafRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSpawn = useCallback(() => {
    if (state.current.phase !== "playing") return;
    const interval = Math.max(400, diff.spawnMs - state.current.frame * 0.06);
    spawnTimerRef.current = setTimeout(() => {
      if (state.current.phase !== "playing") return;
      const good = Math.random() > 0.42;
      const pool = good ? GOOD : BAD;
      state.current.items.push({
        id: nextId(),
        x: 24 + Math.random() * (W - 72),
        y: -40,
        emoji: pool[Math.floor(Math.random() * pool.length)],
        good, size: 34,
      });
      scheduleSpawn();
    }, interval);
  }, [diff.spawnMs]);

  const endGame = useCallback(() => {
    const s = state.current;
    s.phase = "over";
    if (s.score > hiScoreRef.current) hiScoreRef.current = s.score;
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    setDisplay(d => ({ ...d, score: s.score, lives: s.lives, phase: "over", hiScore: hiScoreRef.current }));
  }, []);

  const startGame = useCallback(() => {
    const s = state.current;
    s.phase = "playing";
    s.playerX = W / 2 - PLAYER_W / 2;
    s.items = []; s.particles = [];
    s.score = 0; s.lives = 3;
    s.speed = diff.dropSpeed;
    s.frame = 0; s.shakeFrames = 0;
    setDisplay({ score: 0, lives: 3, phase: "playing", hiScore: hiScoreRef.current });
    scheduleSpawn();
  }, [diff.dropSpeed, scheduleSpawn]);

  const leaveGame = useCallback(() => {
    const s = state.current;
    s.phase = "idle";
    s.items = []; s.particles = [];
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    setDisplay(d => ({ ...d, phase: "idle" }));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    s.frame++;
    s.speed = diff.dropSpeed + s.frame * diff.increment;

    if (s.left)  s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
    if (s.right) s.playerX = Math.min(W - PLAYER_W, s.playerX + PLAYER_SPEED);

    s.items.forEach(item => { item.y += s.speed; });

    const px = s.playerX, py = PLAYER_Y;
    s.items = s.items.filter(item => {
      const hit = (
        item.x + item.size > px + 6 && item.x < px + PLAYER_W - 6 &&
        item.y + item.size > py + 6 && item.y < py + PLAYER_H - 6
      );
      if (hit) {
        for (let i = 0; i < 6; i++) {
          s.particles.push({
            id: nextId(),
            x: item.x + item.size / 2, y: item.y + item.size / 2,
            emoji: item.emoji,
            vx: (Math.random() - 0.5) * 5, vy: -Math.random() * 4 - 2,
            life: 28, maxLife: 28,
          });
        }
        if (item.good) {
          s.score += 10;
          setDisplay(d => ({ ...d, score: s.score }));
        } else {
          s.lives -= 1; s.shakeFrames = 14;
          setDisplay(d => ({ ...d, lives: s.lives }));
          if (s.lives <= 0) { endGame(); return false; }
        }
        return false;
      }
      return item.y <= H + 20;
    });

    s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--; });
    s.particles = s.particles.filter(p => p.life > 0);
    if (s.shakeFrames > 0) s.shakeFrames--;

    const shakeX = s.shakeFrames > 0 ? (Math.random() - 0.5) * 6 : 0;
    const shakeY = s.shakeFrames > 0 ? (Math.random() - 0.5) * 6 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    ctx.fillStyle = "#0f0c0c";
    ctx.fillRect(-10, -10, W + 20, H + 20);

    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, "rgba(185,28,28,0.5)");
    grad.addColorStop(1, "transparent");
    ctx.strokeStyle = grad; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, PLAYER_Y + PLAYER_H + 4); ctx.lineTo(W, PLAYER_Y + PLAYER_H + 4); ctx.stroke();

    ctx.font = "34px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    s.items.forEach(item => { ctx.globalAlpha = 1; ctx.fillText(item.emoji, item.x + item.size / 2, item.y + item.size / 2); });

    s.particles.forEach(p => { ctx.globalAlpha = p.life / p.maxLife; ctx.font = "20px serif"; ctx.fillText(p.emoji, p.x, p.y); });
    ctx.globalAlpha = 1;

    const heartPulse = 1 + Math.sin(s.frame * 0.18) * 0.05;
    ctx.font = `${Math.round(PLAYER_H * heartPulse)}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = s.shakeFrames > 0 ? "#dc2626" : "#f43f5e";
    ctx.shadowBlur = s.shakeFrames > 0 ? 24 : 14;
    ctx.fillText("❤️", s.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }, [canvasRef, diff, endGame]);

  useEffect(() => {
    const loop = () => { if (state.current.phase === "playing") draw(); rafRef.current = requestAnimationFrame(loop); };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft"  || e.key === "a") state.current.left  = true;
      if (e.key === "ArrowRight" || e.key === "d") state.current.right = true;
      if ((e.key === " " || e.key === "Enter") && state.current.phase !== "playing") startGame();
    };
    const onUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft"  || e.key === "a") state.current.left  = false;
      if (e.key === "ArrowRight" || e.key === "d") state.current.right = false;
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [startGame]);

  const onPointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || state.current.phase !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    state.current.playerX = Math.max(0, Math.min(W - PLAYER_W, (clientX - rect.left) * scaleX - PLAYER_W / 2));
  }, [canvasRef]);

  return { display, startGame, leaveGame, onPointerMove };
}

/* ─── Idle canvas overlay ────────────────────────────────────────── */

function IdleCanvas({ canvasRef, display }: { canvasRef: React.RefObject<HTMLCanvasElement | null>; display: { phase: Phase; score: number; hiScore: number } }) {
  useEffect(() => {
    if (display.phase === "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f0c0c";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 80; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    if (display.phase === "idle") {
      ctx.font = "80px serif"; ctx.shadowColor = "#f43f5e"; ctx.shadowBlur = 30;
      ctx.fillText("❤️", W / 2, H / 2 - 80); ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px sans-serif";
      ctx.fillText("Heart Defender", W / 2, H / 2 - 10);
      ctx.fillStyle = "rgba(255,255,255,0.45)"; ctx.font = "14px sans-serif";
      ctx.fillText("Catch healthy items · Dodge junk food", W / 2, H / 2 + 28);
      ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "12px sans-serif";
      ctx.fillText("← → keys or drag to move", W / 2, H / 2 + 56);
    } else {
      ctx.font = "56px serif"; ctx.fillText("💔", W / 2, H / 2 - 100);
      ctx.fillStyle = "#f87171"; ctx.font = "bold 30px sans-serif";
      ctx.fillText("Game Over", W / 2, H / 2 - 40);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 42px sans-serif";
      ctx.fillText(String(display.score), W / 2, H / 2 + 18);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "13px sans-serif";
      ctx.fillText(`Best: ${display.hiScore}`, W / 2, H / 2 + 56);
    }
  }, [display.phase, display.score, display.hiScore, canvasRef]);

  return null;
}

/* ─── Game Modal ─────────────────────────────────────────────────── */

function GameModal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const { display, startGame, leaveGame, onPointerMove } = useGame(canvasRef, difficulty);

  const hearts = Array.from({ length: 3 }, (_, i) => i < display.lives ? "❤️" : "🖤");

  const handleLeave = () => {
    leaveGame();
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(12px)" }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="relative flex flex-col items-center gap-4 w-full max-w-[520px]"
      >
        {/* Top bar */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest uppercase text-white/25 mb-0.5">Score</span>
            <span className="text-2xl font-bold text-white tabular-nums">{display.score}</span>
          </div>
          <div className="flex gap-1 text-xl">{hearts}</div>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[10px] tracking-widest uppercase text-white/25 mb-0.5">Best</span>
              <span className="text-2xl font-bold text-white/50 tabular-nums">{display.hiScore}</span>
            </div>
            <button
              onClick={handleLeave}
              className="ml-2 flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Leave game"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Difficulty — only shown when not playing */}
        <AnimatePresence>
          {display.phase !== "playing" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2 overflow-hidden"
            >
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: difficulty === d ? DIFFICULTIES[d].color + "33" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${difficulty === d ? DIFFICULTIES[d].color + "88" : "rgba(255,255,255,0.1)"}`,
                    color: difficulty === d ? DIFFICULTIES[d].color : "rgba(255,255,255,0.45)",
                  }}
                >
                  {DIFFICULTIES[d].label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(185,28,28,0.2), 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          <IdleCanvas canvasRef={canvasRef} display={display} />
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block touch-none"
            style={{ width: "min(480px, calc(100vw - 40px))", height: "auto", cursor: "none" }}
            onMouseMove={(e) => onPointerMove(e.clientX)}
            onTouchMove={(e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX); }}
          />

          <AnimatePresence>
            {display.phase !== "playing" && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-end justify-center pb-12"
              >
                <button
                  onClick={startGame}
                  className="bg-red-700 hover:bg-red-600 active:scale-95 transition-all text-white font-semibold text-sm px-10 py-3.5 rounded-full cursor-pointer shadow-lg shadow-red-900/40"
                >
                  {display.phase === "idle" ? "▶  Play" : "↺  Play Again"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend + hint */}
        <div className="flex gap-6 text-xs text-white/30">
          <span>✅ Catch: {GOOD.join(" ")}</span>
          <span>❌ Dodge: {BAD.join(" ")}</span>
        </div>
        <p className="text-[11px] text-white/20 tracking-wide">
          Mouse / touch to aim &nbsp;·&nbsp; ← → or A / D to move &nbsp;·&nbsp; 3 lives
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function Interactables() {
  const [gameOpen, setGameOpen] = useState(false);

  return (
    <div className="min-h-screen font-['Outfit',sans-serif]" style={{ background: "#0f0c0c" }}>

      {/* Header */}
      <div className="pt-16 pb-10 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(180,20,20,0.18), transparent 65%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">Explore</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Interactables
          </h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">
            Learn heart health through play.
          </p>
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mx-8" />

      {/* Game card */}
      <div className="flex flex-col items-center py-16 px-6">
        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          onClick={() => setGameOpen(true)}
          className="group flex items-center gap-5 rounded-2xl px-7 py-5 cursor-pointer transition-all"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        >
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.3)" }}>
            <span className="text-2xl">❤️</span>
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-white mb-0.5">Heart Defender</p>
            <p className="text-xs text-white/40">Catch healthy items · dodge junk food · 3 lives</p>
          </div>
          <div className="ml-4 px-3 py-1.5 rounded-full bg-red-700/80 text-white text-xs font-semibold group-hover:bg-red-600 transition-colors">
            ▶ Play
          </div>
        </motion.button>
      </div>

      {/* Disclaimer */}
      <div className="mx-8 mb-12 rounded-2xl bg-amber-950/30 border border-amber-700/25 px-5 py-3.5 flex items-start gap-2.5">
        <span className="text-sm mt-0.5">⚠️</span>
        <p className="text-xs text-amber-200/50 leading-relaxed">
          This game is for educational fun only. Always consult a qualified healthcare provider for medical advice.
        </p>
      </div>

      {/* Game modal */}
      <AnimatePresence>
        {gameOpen && <GameModal onClose={() => setGameOpen(false)} />}
      </AnimatePresence>

    </div>
  );
}
