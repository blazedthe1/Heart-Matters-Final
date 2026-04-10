import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Game constants ─────────────────────────────────────────────── */

const W = 480;
const H = 600;
const PLAYER_W = 52;
const PLAYER_H = 52;
const PLAYER_Y = H - 80;
const PLAYER_SPEED = 6;
const INITIAL_DROP_SPEED = 2.4;
const SPEED_INCREMENT = 0.00018;
const SPAWN_INTERVAL_MS = 1100;

const GOOD = ["🥦", "🍎", "💧", "🏃", "🥕", "🫐"];
const BAD  = ["🍔", "🍟", "🚬", "🍕", "🥤", "😰"];

interface Item {
  id: number;
  x: number;
  y: number;
  emoji: string;
  good: boolean;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  emoji: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

let idCounter = 0;
const nextId = () => ++idCounter;

/* ─── useGame hook ───────────────────────────────────────────────── */

type Phase = "idle" | "playing" | "over";

function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const state = useRef({
    phase: "idle" as Phase,
    playerX: W / 2 - PLAYER_W / 2,
    left: false,
    right: false,
    items: [] as Item[],
    particles: [] as Particle[],
    score: 0,
    lives: 3,
    speed: INITIAL_DROP_SPEED,
    frame: 0,
    lastSpawn: 0,
    shakeFrames: 0,
  });

  const [display, setDisplay] = useState({ score: 0, lives: 3, phase: "idle" as Phase, hiScore: 0 });
  const hiScoreRef = useRef(0);
  const rafRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* spawn items */
  const scheduleSpawn = useCallback(() => {
    if (state.current.phase !== "playing") return;
    const interval = Math.max(500, SPAWN_INTERVAL_MS - state.current.frame * 0.06);
    spawnTimerRef.current = setTimeout(() => {
      if (state.current.phase !== "playing") return;
      const good = Math.random() > 0.42;
      const pool = good ? GOOD : BAD;
      const emoji = pool[Math.floor(Math.random() * pool.length)];
      state.current.items.push({
        id: nextId(),
        x: 24 + Math.random() * (W - 72),
        y: -40,
        emoji,
        good,
        size: 34,
      });
      scheduleSpawn();
    }, interval);
  }, []);

  const startGame = useCallback(() => {
    const s = state.current;
    s.phase = "playing";
    s.playerX = W / 2 - PLAYER_W / 2;
    s.items = [];
    s.particles = [];
    s.score = 0;
    s.lives = 3;
    s.speed = INITIAL_DROP_SPEED;
    s.frame = 0;
    s.shakeFrames = 0;
    setDisplay({ score: 0, lives: 3, phase: "playing", hiScore: hiScoreRef.current });
    scheduleSpawn();
  }, [scheduleSpawn]);

  const endGame = useCallback(() => {
    const s = state.current;
    s.phase = "over";
    if (s.score > hiScoreRef.current) hiScoreRef.current = s.score;
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    setDisplay(d => ({ ...d, score: s.score, lives: s.lives, phase: "over", hiScore: hiScoreRef.current }));
  }, []);

  /* draw */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const s = state.current;

    s.frame++;
    s.speed = INITIAL_DROP_SPEED + s.frame * SPEED_INCREMENT;

    /* move player */
    if (s.left)  s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
    if (s.right) s.playerX = Math.min(W - PLAYER_W, s.playerX + PLAYER_SPEED);

    /* move items */
    s.items.forEach(item => { item.y += s.speed; });

    /* collision + off-screen */
    const px = s.playerX, py = PLAYER_Y;
    s.items = s.items.filter(item => {
      const hit = (
        item.x + item.size > px + 6 &&
        item.x < px + PLAYER_W - 6 &&
        item.y + item.size > py + 6 &&
        item.y < py + PLAYER_H - 6
      );
      if (hit) {
        /* burst particles */
        for (let i = 0; i < 6; i++) {
          s.particles.push({
            id: nextId(),
            x: item.x + item.size / 2,
            y: item.y + item.size / 2,
            emoji: item.emoji,
            vx: (Math.random() - 0.5) * 5,
            vy: -Math.random() * 4 - 2,
            life: 28,
            maxLife: 28,
          });
        }
        if (item.good) {
          s.score += 10;
          setDisplay(d => ({ ...d, score: s.score }));
        } else {
          s.lives -= 1;
          s.shakeFrames = 14;
          setDisplay(d => ({ ...d, lives: s.lives }));
          if (s.lives <= 0) { endGame(); return false; }
        }
        return false;
      }
      if (item.y > H + 20) return false;
      return true;
    });

    /* update particles */
    s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--; });
    s.particles = s.particles.filter(p => p.life > 0);

    if (s.shakeFrames > 0) s.shakeFrames--;

    /* ── render ── */
    const shakeX = s.shakeFrames > 0 ? (Math.random() - 0.5) * 6 : 0;
    const shakeY = s.shakeFrames > 0 ? (Math.random() - 0.5) * 6 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    /* background */
    ctx.fillStyle = "#0f0c0c";
    ctx.fillRect(-10, -10, W + 20, H + 20);

    /* lane guides */
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    /* ground line */
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0, "transparent");
    grad.addColorStop(0.5, "rgba(185,28,28,0.5)");
    grad.addColorStop(1, "transparent");
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, PLAYER_Y + PLAYER_H + 4); ctx.lineTo(W, PLAYER_Y + PLAYER_H + 4); ctx.stroke();

    /* items */
    ctx.font = "34px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    s.items.forEach(item => {
      ctx.globalAlpha = 1;
      ctx.fillText(item.emoji, item.x + item.size / 2, item.y + item.size / 2);
    });

    /* particles */
    s.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.font = "20px serif";
      ctx.fillText(p.emoji, p.x, p.y);
    });
    ctx.globalAlpha = 1;

    /* player heart */
    const heartPulse = 1 + Math.sin(s.frame * 0.18) * 0.05;
    ctx.font = `${Math.round(PLAYER_H * heartPulse)}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    /* glow */
    ctx.shadowColor = s.shakeFrames > 0 ? "#dc2626" : "#f43f5e";
    ctx.shadowBlur = s.shakeFrames > 0 ? 24 : 14;
    ctx.fillText("❤️", s.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }, [canvasRef, endGame]);

  /* game loop */
  useEffect(() => {
    const loop = () => {
      if (state.current.phase === "playing") draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  /* keyboard */
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
    window.addEventListener("keyup",   onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [startGame]);

  /* touch / mouse drag on canvas */
  const onPointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || state.current.phase !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = W / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    state.current.playerX = Math.max(0, Math.min(W - PLAYER_W, canvasX - PLAYER_W / 2));
  }, [canvasRef]);

  return { display, startGame, onPointerMove };
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function Interactables() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { display, startGame, onPointerMove } = useGame(canvasRef);

  /* draw idle / game-over screen via canvas when not playing */
  useEffect(() => {
    if (display.phase === "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f0c0c";
    ctx.fillRect(0, 0, W, H);

    /* subtle grid */
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 80; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (display.phase === "idle") {
      ctx.font = "80px serif";
      ctx.shadowColor = "#f43f5e"; ctx.shadowBlur = 30;
      ctx.fillText("❤️", W / 2, H / 2 - 80);
      ctx.shadowBlur = 0;

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 28px 'Outfit', sans-serif";
      ctx.fillText("Heart Defender", W / 2, H / 2 - 10);

      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.font = "14px 'Outfit', sans-serif";
      ctx.fillText("Catch healthy items · Dodge junk food", W / 2, H / 2 + 28);

      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.font = "12px 'Outfit', sans-serif";
      ctx.fillText("← → keys or drag to move", W / 2, H / 2 + 56);
    } else {
      /* game over */
      ctx.font = "56px serif";
      ctx.fillText("💔", W / 2, H / 2 - 100);

      ctx.fillStyle = "#f87171";
      ctx.font = "bold 30px 'Outfit', sans-serif";
      ctx.fillText("Game Over", W / 2, H / 2 - 40);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 42px 'Outfit', sans-serif";
      ctx.fillText(String(display.score), W / 2, H / 2 + 18);

      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.font = "13px 'Outfit', sans-serif";
      ctx.fillText(`Best: ${display.hiScore}`, W / 2, H / 2 + 56);
    }
  }, [display.phase, display.score, display.hiScore]);

  const hearts = Array.from({ length: 3 }, (_, i) => i < display.lives ? "❤️" : "🖤");

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

      {/* Game area */}
      <div className="flex flex-col items-center py-12 px-4 gap-5">

        {/* HUD */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex items-center justify-between w-full max-w-[480px] px-1"
        >
          <div className="flex flex-col">
            <span className="text-[10px] tracking-widest uppercase text-white/25 mb-0.5">Score</span>
            <span className="text-2xl font-bold text-white tabular-nums">{display.score}</span>
          </div>
          <div className="flex gap-1 text-xl">{hearts}</div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] tracking-widest uppercase text-white/25 mb-0.5">Best</span>
            <span className="text-2xl font-bold text-white/50 tabular-nums">{display.hiScore}</span>
          </div>
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative rounded-3xl overflow-hidden"
          style={{ boxShadow: "0 0 60px rgba(185,28,28,0.2), 0 0 0 1px rgba(255,255,255,0.06)" }}
        >
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className="block touch-none"
            style={{ width: "min(480px, calc(100vw - 32px))", height: "auto", cursor: "none" }}
            onMouseMove={(e) => onPointerMove(e.clientX)}
            onTouchMove={(e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX); }}
          />

          {/* Overlay buttons */}
          <AnimatePresence>
            {display.phase !== "playing" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
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
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex gap-6 text-xs text-white/35"
        >
          <span>✅ Catch: {GOOD.join(" ")}</span>
          <span>❌ Dodge: {BAD.join(" ")}</span>
        </motion.div>

        {/* Controls hint */}
        <p className="text-[11px] text-white/20 tracking-wide">
          Mouse / touch to aim &nbsp;·&nbsp; ← → or A / D to move &nbsp;·&nbsp; 3 lives
        </p>

      </div>

      {/* Disclaimer */}
      <div className="mx-8 mb-12 rounded-2xl bg-amber-950/30 border border-amber-700/25 px-5 py-3.5 flex items-start gap-2.5">
        <span className="text-sm mt-0.5">⚠️</span>
        <p className="text-xs text-amber-200/50 leading-relaxed">
          This game is for educational fun only. Always consult a qualified healthcare provider for medical advice.
        </p>
      </div>

    </div>
  );
}
