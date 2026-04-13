import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Play, Zap, Shield, Heart, ChevronRight, RotateCcw } from "lucide-react";
import { HeartExplorerModal } from "@/components/HeartExplorer";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── Constants ──────────────────────────────────────────────────── */

const W = 480;
const H = 600;
const PLAYER_W = 52;
const PLAYER_H = 52;
const PLAYER_Y = H - 90;
const PLAYER_SPEED = 7;

const DIFFICULTIES = {
  easy:   { label: "Easy",   color: "#22c55e", dropSpeed: 1.5,  spawnMs: 1500, increment: 0.00006 },
  medium: { label: "Medium", color: "#f59e0b", dropSpeed: 2.4,  spawnMs: 1050, increment: 0.00016 },
  hard:   { label: "Hard",   color: "#ef4444", dropSpeed: 3.6,  spawnMs: 700,  increment: 0.00028 },
} as const;
type Difficulty = keyof typeof DIFFICULTIES;

const GOOD    = ["🥦", "🍎", "💧", "🏃", "🥕", "🫐", "🥗", "🍇"];
const BAD     = ["🍔", "🍟", "🚬", "🍕", "🥤", "😰", "🍩", "🧁"];
const POWERUP = ["⭐", "🍀"];

interface Item {
  id: number; x: number; y: number; emoji: string;
  kind: "good" | "bad" | "powerup"; size: number;
}
interface Particle {
  id: number; x: number; y: number; emoji: string;
  vx: number; vy: number; life: number; maxLife: number;
}
interface FloatText {
  id: number; x: number; y: number; text: string;
  color: string; life: number; maxLife: number;
}

let uid = 0;
const nid = () => ++uid;

type Phase = "idle" | "playing" | "paused" | "over";

/* ─── useGame ────────────────────────────────────────────────────── */

function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>, difficulty: Difficulty) {
  const diff = DIFFICULTIES[difficulty];

  const state = useRef({
    phase: "idle" as Phase,
    playerX: W / 2 - PLAYER_W / 2,
    left: false, right: false,
    items: [] as Item[],
    particles: [] as Particle[],
    floatTexts: [] as FloatText[],
    score: 0, lives: 3, combo: 0,
    speed: diff.dropSpeed, frame: 0, shakeFrames: 0,
    shieldActive: false, shieldFrames: 0,
    flashColor: null as string | null, flashFrames: 0,
    level: 1,
  });

  const [display, setDisplay] = useState({
    score: 0, lives: 3, phase: "idle" as Phase,
    hiScore: parseInt(localStorage.getItem("hd_hi") ?? "0"),
    combo: 0, shieldActive: false, level: 1,
  });

  const hiScoreRef = useRef(parseInt(localStorage.getItem("hd_hi") ?? "0"));
  const rafRef = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSpawn = useCallback(() => {
    if (state.current.phase !== "playing") return;
    const interval = Math.max(350, diff.spawnMs - state.current.frame * 0.05);
    spawnTimerRef.current = setTimeout(() => {
      if (state.current.phase !== "playing") return;
      const roll = Math.random();
      let kind: Item["kind"];
      let pool: string[];
      if (roll < 0.06) { kind = "powerup"; pool = POWERUP; }
      else if (roll < 0.48) { kind = "bad"; pool = BAD; }
      else { kind = "good"; pool = GOOD; }
      state.current.items.push({
        id: nid(),
        x: 24 + Math.random() * (W - 72),
        y: -44,
        emoji: pool[Math.floor(Math.random() * pool.length)],
        kind, size: kind === "powerup" ? 38 : 34,
      });
      scheduleSpawn();
    }, interval);
  }, [diff.spawnMs]);

  const endGame = useCallback(() => {
    const s = state.current;
    s.phase = "over";
    if (s.score > hiScoreRef.current) {
      hiScoreRef.current = s.score;
      localStorage.setItem("hd_hi", String(s.score));
    }
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    setDisplay(d => ({ ...d, score: s.score, lives: 0, phase: "over", hiScore: hiScoreRef.current }));
  }, []);

  const startGame = useCallback(() => {
    const s = state.current;
    s.phase = "playing";
    s.playerX = W / 2 - PLAYER_W / 2;
    s.items = []; s.particles = []; s.floatTexts = [];
    s.score = 0; s.lives = 3; s.combo = 0; s.level = 1;
    s.speed = diff.dropSpeed; s.frame = 0; s.shakeFrames = 0;
    s.shieldActive = false; s.shieldFrames = 0;
    s.flashColor = null; s.flashFrames = 0;
    setDisplay({ score: 0, lives: 3, phase: "playing", hiScore: hiScoreRef.current, combo: 0, shieldActive: false, level: 1 });
    scheduleSpawn();
  }, [diff.dropSpeed, scheduleSpawn]);

  const togglePause = useCallback(() => {
    const s = state.current;
    if (s.phase === "playing") {
      s.phase = "paused";
      if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
      setDisplay(d => ({ ...d, phase: "paused" }));
    } else if (s.phase === "paused") {
      s.phase = "playing";
      scheduleSpawn();
      setDisplay(d => ({ ...d, phase: "playing" }));
    }
  }, [scheduleSpawn]);

  const leaveGame = useCallback(() => {
    const s = state.current;
    s.phase = "idle";
    s.items = []; s.particles = []; s.floatTexts = [];
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

    const newLevel = Math.floor(s.score / 100) + 1;
    if (newLevel > s.level) {
      s.level = newLevel;
      s.flashColor = "#7c3aed";
      s.flashFrames = 18;
      s.floatTexts.push({ id: nid(), x: W / 2, y: H / 2, text: `LEVEL ${s.level}!`, color: "#c4b5fd", life: 60, maxLife: 60 });
      setDisplay(d => ({ ...d, level: s.level }));
    }

    if (s.shieldActive) {
      s.shieldFrames--;
      if (s.shieldFrames <= 0) { s.shieldActive = false; setDisplay(d => ({ ...d, shieldActive: false })); }
    }

    if (s.left)  s.playerX = Math.max(0, s.playerX - PLAYER_SPEED);
    if (s.right) s.playerX = Math.min(W - PLAYER_W, s.playerX + PLAYER_SPEED);

    s.items.forEach(item => { item.y += s.speed * (item.kind === "powerup" ? 0.75 : 1); });

    const px = s.playerX, py = PLAYER_Y;
    s.items = s.items.filter(item => {
      const hit = (
        item.x + item.size > px + 6 && item.x < px + PLAYER_W - 6 &&
        item.y + item.size > py + 6 && item.y < py + PLAYER_H - 6
      );
      if (hit) {
        const count = item.kind === "powerup" ? 10 : 6;
        for (let i = 0; i < count; i++) {
          s.particles.push({ id: nid(), x: item.x + item.size / 2, y: item.y + item.size / 2, emoji: item.emoji, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5 - 2, life: 32, maxLife: 32 });
        }

        if (item.kind === "good") {
          s.combo++;
          const multiplier = s.combo >= 5 ? 3 : s.combo >= 3 ? 2 : 1;
          const pts = 10 * multiplier;
          s.score += pts;
          s.flashColor = "#16a34a"; s.flashFrames = 6;
          const label = multiplier > 1 ? `+${pts} x${multiplier} COMBO!` : `+${pts}`;
          s.floatTexts.push({ id: nid(), x: item.x + item.size / 2, y: item.y, text: label, color: multiplier > 1 ? "#86efac" : "#4ade80", life: 40, maxLife: 40 });
          setDisplay(d => ({ ...d, score: s.score, combo: s.combo }));
        } else if (item.kind === "bad") {
          if (s.shieldActive) {
            s.shieldActive = false; s.shieldFrames = 0;
            s.floatTexts.push({ id: nid(), x: item.x + item.size / 2, y: item.y, text: "BLOCKED!", color: "#fbbf24", life: 40, maxLife: 40 });
            setDisplay(d => ({ ...d, shieldActive: false }));
          } else {
            s.combo = 0;
            s.lives -= 1; s.shakeFrames = 18;
            s.flashColor = "#dc2626"; s.flashFrames = 12;
            s.floatTexts.push({ id: nid(), x: item.x + item.size / 2, y: item.y, text: "-1 ❤️", color: "#f87171", life: 40, maxLife: 40 });
            setDisplay(d => ({ ...d, lives: s.lives, combo: 0 }));
            if (s.lives <= 0) { endGame(); return false; }
          }
        } else {
          if (item.emoji === "⭐") {
            s.shieldActive = true; s.shieldFrames = 300;
            s.floatTexts.push({ id: nid(), x: item.x + item.size / 2, y: item.y, text: "SHIELD!", color: "#fde68a", life: 50, maxLife: 50 });
            setDisplay(d => ({ ...d, shieldActive: true }));
          } else {
            s.lives = Math.min(5, s.lives + 1);
            s.floatTexts.push({ id: nid(), x: item.x + item.size / 2, y: item.y, text: "+1 ❤️", color: "#f9a8d4", life: 50, maxLife: 50 });
            setDisplay(d => ({ ...d, lives: s.lives }));
          }
        }
        return false;
      }
      return item.y <= H + 20;
    });

    s.particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.28; p.life--; });
    s.particles = s.particles.filter(p => p.life > 0);
    s.floatTexts.forEach(f => { f.y -= 1.2; f.life--; });
    s.floatTexts = s.floatTexts.filter(f => f.life > 0);
    if (s.shakeFrames > 0) s.shakeFrames--;
    if (s.flashFrames > 0) s.flashFrames--;

    const shakeX = s.shakeFrames > 0 ? (Math.random() - 0.5) * 7 : 0;
    const shakeY = s.shakeFrames > 0 ? (Math.random() - 0.5) * 4 : 0;
    ctx.save();
    ctx.translate(shakeX, shakeY);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#120e0e");
    bg.addColorStop(1, "#0a0707");
    ctx.fillStyle = bg;
    ctx.fillRect(-10, -10, W + 20, H + 20);

    ctx.strokeStyle = "rgba(255,255,255,0.018)";
    ctx.lineWidth = 1;
    for (let y = 0; y < H; y += 6) { ctx.beginPath(); ctx.moveTo(-10, y); ctx.lineTo(W + 10, y); ctx.stroke(); }

    ctx.strokeStyle = "rgba(255,255,255,0.025)";
    for (let x = 80; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }

    if (s.flashColor && s.flashFrames > 0) {
      ctx.fillStyle = s.flashColor + Math.floor((s.flashFrames / 14) * 40).toString(16).padStart(2, "0");
      ctx.fillRect(-10, -10, W + 20, H + 20);
    }

    const grd = ctx.createLinearGradient(0, 0, W, 0);
    grd.addColorStop(0, "transparent");
    grd.addColorStop(0.5, "rgba(185,28,28,0.6)");
    grd.addColorStop(1, "transparent");
    ctx.strokeStyle = grd; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, PLAYER_Y + PLAYER_H + 6); ctx.lineTo(W, PLAYER_Y + PLAYER_H + 6); ctx.stroke();

    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    s.items.forEach(item => {
      ctx.globalAlpha = 1;
      if (item.kind === "powerup") {
        ctx.shadowColor = item.emoji === "⭐" ? "#fbbf24" : "#f9a8d4";
        ctx.shadowBlur = 18 + Math.sin(s.frame * 0.12) * 6;
      }
      ctx.font = `${item.size}px serif`;
      ctx.fillText(item.emoji, item.x + item.size / 2, item.y + item.size / 2);
      ctx.shadowBlur = 0;
    });

    s.particles.forEach(p => {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.font = "18px serif";
      ctx.fillText(p.emoji, p.x, p.y);
    });
    ctx.globalAlpha = 1;

    s.floatTexts.forEach(f => {
      const alpha = Math.min(1, f.life / 20);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = f.color;
      ctx.font = `bold ${f.text.includes("LEVEL") ? 22 : 15}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(f.text, f.x, f.y);
    });
    ctx.globalAlpha = 1;

    if (s.shieldActive) {
      ctx.save();
      ctx.globalAlpha = 0.55 + Math.sin(s.frame * 0.15) * 0.2;
      ctx.strokeStyle = "#fde68a";
      ctx.lineWidth = 3;
      ctx.shadowColor = "#fbbf24"; ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2, 34, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    const pulse = 1 + Math.sin(s.frame * 0.18) * 0.05;
    ctx.font = `${Math.round(PLAYER_H * pulse)}px serif`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.shadowColor = s.shakeFrames > 0 ? "#dc2626" : "#f43f5e";
    ctx.shadowBlur = s.shakeFrames > 0 ? 28 : 16;
    ctx.fillText("❤️", s.playerX + PLAYER_W / 2, PLAYER_Y + PLAYER_H / 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }, [canvasRef, diff, endGame]);

  useEffect(() => {
    const loop = () => {
      if (state.current.phase === "playing") draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft"  || e.key === "a") state.current.left  = true;
      if (e.key === "ArrowRight" || e.key === "d") state.current.right = true;
      if ((e.key === " " || e.key === "Enter") && state.current.phase !== "playing") startGame();
      if (e.key === "Escape" && (state.current.phase === "playing" || state.current.phase === "paused")) togglePause();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft"  || e.key === "a") state.current.left  = false;
      if (e.key === "ArrowRight" || e.key === "d") state.current.right = false;
    };
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", dn); window.removeEventListener("keyup", up); };
  }, [startGame, togglePause]);

  useEffect(() => {
    if (display.phase === "playing") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#120e0e"); bg.addColorStop(1, "#0a0707");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.02)"; ctx.lineWidth = 1;
    for (let x = 80; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 80; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.textAlign = "center"; ctx.textBaseline = "middle";

    if (display.phase === "idle") {
      ctx.font = "80px serif"; ctx.shadowColor = "#f43f5e"; ctx.shadowBlur = 40;
      ctx.fillText("❤️", W / 2, H / 2 - 90); ctx.shadowBlur = 0;
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 30px sans-serif";
      ctx.fillText("Heart Defender", W / 2, H / 2 - 14);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "13px sans-serif";
      ctx.fillText("Catch healthy items · Dodge junk food", W / 2, H / 2 + 24);
      ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.font = "11px sans-serif";
      ctx.fillText("⭐ Shield  ·  🍀 Extra life  ·  🔥 Combos", W / 2, H / 2 + 50);
      ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.font = "11px sans-serif";
      ctx.fillText("← → or drag to move  ·  Esc to pause", W / 2, H / 2 + 72);
    } else if (display.phase === "paused") {
      ctx.font = "64px serif"; ctx.fillText("⏸", W / 2, H / 2 - 70);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px sans-serif"; ctx.fillText("Paused", W / 2, H / 2 - 10);
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "13px sans-serif"; ctx.fillText("Press Esc or tap Resume", W / 2, H / 2 + 26);
      ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "bold 22px sans-serif"; ctx.fillText(`Score: ${display.score}`, W / 2, H / 2 + 62);
    } else {
      ctx.font = "64px serif"; ctx.fillText("💔", W / 2, H / 2 - 110);
      ctx.fillStyle = "#f87171"; ctx.font = "bold 32px sans-serif"; ctx.fillText("Game Over", W / 2, H / 2 - 46);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 48px sans-serif"; ctx.fillText(String(display.score), W / 2, H / 2 + 18);
      ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = "13px sans-serif";
      ctx.fillText(display.score > display.hiScore ? "🏆 New Best!" : `Best: ${display.hiScore}`, W / 2, H / 2 + 60);
    }
  }, [display.phase, display.score, display.hiScore, canvasRef]);

  const onPointerMove = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || state.current.phase !== "playing") return;
    const rect = canvas.getBoundingClientRect();
    state.current.playerX = Math.max(0, Math.min(W - PLAYER_W, (clientX - rect.left) * (W / rect.width) - PLAYER_W / 2));
  }, [canvasRef]);

  return { display, startGame, leaveGame, togglePause, onPointerMove };
}

/* ─── Game Modal ─────────────────────────────────────────────────── */

function GameModal({ onClose }: { onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const { display, startGame, leaveGame, togglePause, onPointerMove } = useGame(canvasRef, difficulty);

  const handleLeave = () => { leaveGame(); onClose(); };

  const lives = Math.max(display.lives, 0);
  const maxLives = 5;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
      onClick={handleLeave}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center gap-3 w-full max-w-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── HUD ── */}
        <div className="flex items-stretch justify-between w-full gap-3">
          {/* Score */}
          <div className="flex-1 rounded-xl px-4 py-2.5 flex flex-col justify-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-[9px] tracking-[0.18em] uppercase text-white/30 mb-0.5">Score</span>
            <span className="text-2xl font-bold text-white tabular-nums leading-none">{display.score}</span>
          </div>

          {/* Lives + status */}
          <div className="flex-1 rounded-xl px-4 py-2.5 flex flex-col items-center justify-center gap-1"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex gap-0.5">
              {Array.from({ length: maxLives }).map((_, i) => (
                <span key={i} className="text-base transition-all duration-200"
                  style={{ opacity: i < lives ? 1 : 0.15, filter: i < lives ? "drop-shadow(0 0 4px #f43f5e)" : "none" }}>
                  ❤️
                </span>
              ))}
            </div>
            {display.shieldActive && (
              <span className="text-[9px] tracking-widest uppercase text-yellow-400 font-bold animate-pulse flex items-center gap-1">
                <span>⭐</span> Shield Active
              </span>
            )}
            {display.combo >= 3 && display.phase === "playing" && (
              <span className="text-[9px] font-bold text-emerald-400 flex items-center gap-0.5">
                🔥 {display.combo}x combo
              </span>
            )}
          </div>

          {/* Best + controls */}
          <div className="flex-1 rounded-xl px-4 py-2.5 flex flex-col justify-center items-end"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="text-[9px] tracking-[0.18em] uppercase text-white/30 mb-0.5">Best</span>
            <span className="text-2xl font-bold text-white/40 tabular-nums leading-none">{display.hiScore}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 justify-center">
            {(display.phase === "playing" || display.phase === "paused") && (
              <button onClick={togglePause}
                className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
                {display.phase === "paused" ? <Play className="w-3.5 h-3.5 text-white/70" /> : <Pause className="w-3.5 h-3.5 text-white/70" />}
              </button>
            )}
            <button onClick={handleLeave}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.2)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* ── Level bar ── */}
        {display.phase === "playing" && (
          <div className="flex items-center gap-3 self-stretch">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="text-[9px] tracking-widest uppercase text-white/25">Lv</span>
              <span className="text-xs font-bold text-white/80">{display.level}</span>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
              <motion.div className="h-full rounded-full bg-gradient-to-r from-red-700 to-red-500"
                animate={{ width: `${((display.score % 100) / 100) * 100}%` }}
                transition={{ duration: 0.3 }} />
            </div>
            <span className="text-[9px] text-white/25 tabular-nums">{100 - (display.score % 100)} pts</span>
          </div>
        )}

        {/* ── Difficulty ── */}
        <AnimatePresence>
          {display.phase !== "playing" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="flex gap-2 overflow-hidden self-stretch"
            >
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: difficulty === d ? DIFFICULTIES[d].color + "18" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${difficulty === d ? DIFFICULTIES[d].color + "55" : "rgba(255,255,255,0.07)"}`,
                    color: difficulty === d ? DIFFICULTIES[d].color : "rgba(255,255,255,0.35)",
                  }}>
                  {DIFFICULTIES[d].label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Canvas ── */}
        <div className="relative rounded-2xl overflow-hidden self-stretch"
          style={{ boxShadow: "0 0 80px rgba(185,28,28,0.2), 0 0 0 1px rgba(255,255,255,0.06)" }}>
          <canvas
            ref={canvasRef}
            width={W} height={H}
            className="block touch-none"
            style={{ width: "min(480px, calc(100vw - 40px))", height: "auto", cursor: "none" }}
            onMouseMove={(e) => onPointerMove(e.clientX)}
            onTouchMove={(e) => { e.preventDefault(); onPointerMove(e.touches[0].clientX); }}
          />

          <AnimatePresence>
            {(display.phase === "idle" || display.phase === "over" || display.phase === "paused") && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }} className="absolute inset-0 flex items-end justify-center pb-10">
                <button onClick={display.phase === "paused" ? togglePause : startGame}
                  className="relative overflow-hidden text-white font-semibold text-sm px-10 py-3.5 rounded-full cursor-pointer transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)", boxShadow: "0 4px 24px rgba(185,28,28,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 32px rgba(220,38,38,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(185,28,28,0.5), 0 0 0 1px rgba(255,255,255,0.1) inset")}>
                  {display.phase === "idle" ? "▶  Play" : display.phase === "paused" ? "▶  Resume" : "↺  Play Again"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Legend ── */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px]"
          style={{ color: "rgba(255,255,255,0.2)" }}>
          <span>✅ {GOOD.join(" ")}</span>
          <span>❌ {BAD.join(" ")}</span>
          <span>✨ {POWERUP.join(" ")} power-ups</span>
        </div>
        <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.12)", letterSpacing: "0.04em" }}>
          Mouse / touch · ← → or A D · Esc to pause · click outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Cardiac Timeline ───────────────────────────────────────────── */

const TIMELINE_STAGES = [
  {
    age: "20s", title: "Early Adulthood", subtitle: "Habits formed now echo for decades.",
    color: "#60a5fa", bg: "rgba(96,165,250,0.08)",
    choices: [
      { id: "20-fast",   emoji: "🍔", label: "Mostly fast food & processed snacks",    impact: -2, desc: "High sodium and trans fats begin building arterial plaque early." },
      { id: "20-active", emoji: "🏃", label: "Regular exercise — gym or sport",         impact:  3, desc: "Aerobic fitness in your 20s lowers lifetime cardiovascular risk by up to 35%." },
      { id: "20-smoke",  emoji: "🚬", label: "Social smoking — just on weekends",       impact: -3, desc: "There's no safe level. Even light smoking accelerates arterial stiffness." },
      { id: "20-sleep",  emoji: "😴", label: "Consistent 7–8 hrs of sleep",            impact:  2, desc: "Quality sleep regulates blood pressure and inflammatory markers." },
    ],
  },
  {
    age: "30s", title: "Career & Family", subtitle: "Stress peaks. So does risk — if unchecked.",
    color: "#f59e0b", bg: "rgba(245,158,11,0.08)",
    choices: [
      { id: "30-stress",  emoji: "😰", label: "High-stress job, rarely decompress",         impact: -2, desc: "Chronic stress elevates cortisol, raising blood pressure and inflammation." },
      { id: "30-checkup", emoji: "🩺", label: "Annual health checks, know your numbers",     impact:  3, desc: "Catching hypertension or high cholesterol early is one of the highest-value interventions." },
      { id: "30-drink",   emoji: "🍷", label: "Unwinding with 2–3 drinks most nights",       impact: -2, desc: "Regular alcohol raises triglycerides and blood pressure over time." },
      { id: "30-cook",    emoji: "🥗", label: "Cooking most meals at home",                  impact:  2, desc: "Home cooking correlates with lower sodium intake and better dietary variety." },
    ],
  },
  {
    age: "40s", title: "Midlife", subtitle: "The decade where risk factors compound.",
    color: "#f97316", bg: "rgba(249,115,22,0.08)",
    choices: [
      { id: "40-sedentary", emoji: "💺", label: "Mostly desk-bound, little movement",          impact: -2, desc: "Sedentary time increases cardiovascular mortality independently of exercise." },
      { id: "40-quit",      emoji: "🚭", label: "Quitting smoking if you hadn't already",      impact:  3, desc: "Within 10 years of quitting, heart disease risk halves regardless of history." },
      { id: "40-med",       emoji: "💊", label: "Managing blood pressure with medication",      impact:  2, desc: "Controlled hypertension dramatically reduces stroke and heart attack risk." },
      { id: "40-weight",    emoji: "⚖️", label: "Significant weight gain over the decade",     impact: -2, desc: "Visceral fat is metabolically active and promotes systemic inflammation." },
    ],
  },
  {
    age: "50s", title: "Pre-Senior", subtitle: "Small changes still move the needle significantly.",
    color: "#e24b4a", bg: "rgba(226,75,74,0.08)",
    choices: [
      { id: "50-walk",    emoji: "🚶", label: "Daily 30-min walk, no matter what",          impact:  3, desc: "Moderate walking at 50+ reduces cardiovascular events by over 30%." },
      { id: "50-diet",    emoji: "🫒", label: "Switching to a Mediterranean-style diet",     impact:  2, desc: "The PREDIMED trial showed a 30% reduction in major cardiovascular events." },
      { id: "50-mental",  emoji: "🧠", label: "Ignoring mental health, pushing through",     impact: -2, desc: "Depression and anxiety are independent risk factors for heart disease." },
      { id: "50-social",  emoji: "🤝", label: "Strong social connections & community",       impact:  2, desc: "Social isolation carries cardiovascular risk comparable to smoking 15 cigarettes a day." },
    ],
  },
] as const;

const TL_MAX = TIMELINE_STAGES.length * 3;

function tlOutcome(score: number) {
  const p = score / TL_MAX;
  if (p >= 0.8) return { label: "Exceptional heart health", emoji: "❤️",  color: "#22c55e", heartAge: "−8 yrs", desc: "Your lifetime choices have given your cardiovascular system a real advantage. Your heart age is significantly below your chronological age." };
  if (p >= 0.55) return { label: "Good cardiovascular health", emoji: "🧡", color: "#f59e0b", heartAge: "−2 yrs", desc: "Mostly healthy choices with some areas of risk. Your heart is in reasonable shape — targeted improvements could push you into excellent territory." };
  if (p >= 0.3) return { label: "Elevated risk profile",       emoji: "🩶", color: "#f97316", heartAge: "+5 yrs", desc: "Accumulated risk factors have added years to your heart's age. Many of these are reversible with sustained lifestyle change." };
  return         { label: "High cardiovascular risk",          emoji: "🖤", color: "#ef4444", heartAge: "+12 yrs", desc: "A pattern of high-risk choices significantly increases lifetime risk. It's never too late — every positive change helps." };
}

function TLMeter({ score, max }: { score: number; max: number }) {
  const pct = Math.max(0, Math.min(1, score / max));
  const col = pct >= 0.75 ? "#22c55e" : pct >= 0.5 ? "#f59e0b" : pct >= 0.25 ? "#f97316" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Heart health</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
        <motion.div className="h-full rounded-full" style={{ background: col }}
          animate={{ width: `${pct * 100}%` }} transition={{ duration: 0.5, ease: "easeOut" }} />
      </div>
      <span className="text-xs tabular-nums font-medium" style={{ color: col, minWidth: 28 }}>
        {Math.round(pct * 100)}%
      </span>
    </div>
  );
}

function TLChoiceBtn({ choice, selected, locked, onSelect }: {
  choice: typeof TIMELINE_STAGES[0]["choices"][0];
  selected: boolean; locked: boolean; onSelect: () => void;
}) {
  const good = choice.impact > 0;
  return (
    <motion.button onClick={onSelect} disabled={locked}
      whileHover={!locked ? { scale: 1.015 } : {}} whileTap={!locked ? { scale: 0.985 } : {}}
      className="w-full text-left rounded-xl px-4 py-3 transition-all cursor-pointer disabled:cursor-default"
      style={{
        background: selected ? (good ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? (good ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)") : "rgba(255,255,255,0.07)"}`,
      }}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{choice.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug"
            style={{ color: selected ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)" }}>
            {choice.label}
          </p>
          <AnimatePresence>
            {selected && (
              <motion.p initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: "auto", marginTop: 6 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }} className="text-xs leading-relaxed overflow-hidden"
                style={{ color: good ? "rgba(134,239,172,0.8)" : "rgba(252,165,165,0.8)" }}>
                {choice.desc}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
        {selected && (
          <span className="text-sm font-bold flex-shrink-0" style={{ color: good ? "#4ade80" : "#f87171" }}>
            {good ? `+${choice.impact}` : choice.impact}
          </span>
        )}
      </div>
    </motion.button>
  );
}

function CardiacTimelineModal({ onClose }: { onClose: () => void }) {
  const [stageIdx, setStageIdx] = useState(0);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const stage = TIMELINE_STAGES[stageIdx];
  const pickedId = picks[stageIdx];
  const isLast = stageIdx === TIMELINE_STAGES.length - 1;
  const outcome = tlOutcome(score);

  const handlePick = (choice: typeof stage.choices[0]) => {
    if (picks[stageIdx]) return;
    setPicks(p => ({ ...p, [stageIdx]: choice.id }));
    setScore(s => s + choice.impact);
    setConfirming(true);
  };

  const handleNext = () => {
    setConfirming(false);
    if (isLast) setDone(true);
    else setStageIdx(i => i + 1);
  };

  const handleReset = () => {
    setStageIdx(0); setPicks({}); setScore(0); setDone(false); setConfirming(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(20px)" }}
      onClick={onClose}>
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col"
        style={{ background: "#0b0808", border: "1px solid rgba(255,255,255,0.07)", maxHeight: "calc(100vh - 32px)" }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#e24b4a" }} />
              <span className="text-[9px] tracking-[0.2em] uppercase font-bold" style={{ color: "rgba(255,255,255,0.3)" }}>
                Cardiac Timeline
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!done && (
                <button onClick={handleReset}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                  <RotateCcw className="w-3.5 h-3.5 text-white/40" />
                </button>
              )}
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl transition-all cursor-pointer"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(220,38,38,0.2)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
                <X className="w-4 h-4 text-white/50" />
              </button>
            </div>
          </div>
          {/* Progress pips */}
          <div className="flex gap-1.5 mb-3">
            {TIMELINE_STAGES.map((s, i) => (
              <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-500"
                style={{ background: i < stageIdx || done ? TIMELINE_STAGES[i].color : i === stageIdx && !done ? `${TIMELINE_STAGES[i].color}55` : "rgba(255,255,255,0.08)" }} />
            ))}
          </div>
          <TLMeter score={score + TL_MAX / 2} max={TL_MAX + TL_MAX / 2} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className="px-5 py-6 flex flex-col gap-5">
                {/* Outcome */}
                <div className="rounded-2xl px-5 py-5 text-center"
                  style={{ background: `${outcome.color}0f`, border: `1px solid ${outcome.color}30` }}>
                  <div className="text-5xl mb-3">{outcome.emoji}</div>
                  <p className="text-lg font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {outcome.label}
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3"
                    style={{ background: `${outcome.color}18`, border: `1px solid ${outcome.color}30` }}>
                    <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: outcome.color }}>Heart age</span>
                    <span className="text-sm font-bold" style={{ color: outcome.color }}>{outcome.heartAge}</span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>{outcome.desc}</p>
                </div>
                {/* Recap */}
                <div>
                  <p className="text-[9px] tracking-widest uppercase font-bold mb-3" style={{ color: "rgba(255,255,255,0.2)" }}>Your journey</p>
                  <div className="flex flex-col gap-2">
                    {TIMELINE_STAGES.map((s, i) => {
                      const picked = s.choices.find(c => c.id === picks[i]);
                      if (!picked) return null;
                      const good = picked.impact > 0;
                      return (
                        <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                            style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                            {picked.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: s.color + "99" }}>{s.age}</p>
                            <p className="text-xs truncate" style={{ color: "rgba(255,255,255,0.5)" }}>{picked.label}</p>
                          </div>
                          <span className="text-sm font-bold flex-shrink-0" style={{ color: good ? "#4ade80" : "#f87171" }}>
                            {good ? `+${picked.impact}` : picked.impact}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button onClick={handleReset}
                  className="w-full py-3.5 rounded-full text-white font-semibold text-sm cursor-pointer transition-all active:scale-95"
                  style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)", boxShadow: "0 4px 24px rgba(185,28,28,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 32px rgba(220,38,38,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(185,28,28,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset")}>
                  ↺ Try Different Choices
                </button>
              </motion.div>
            ) : (
              <motion.div key={stageIdx} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="px-5 py-5 flex flex-col gap-4">
                {/* Stage header */}
                <div className="rounded-xl px-4 py-3.5"
                  style={{ background: stage.bg, border: `1px solid ${stage.color}25` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold tracking-widest uppercase" style={{ color: stage.color }}>Age {stage.age}</span>
                    <div className="flex-1 h-px" style={{ background: `${stage.color}25` }} />
                    <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.2)" }}>{stageIdx + 1} / {TIMELINE_STAGES.length}</span>
                  </div>
                  <p className="text-base font-bold text-white leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{stage.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.35)" }}>{stage.subtitle}</p>
                </div>
                <p className="text-[11px] uppercase tracking-widest font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>Choose your path</p>
                <div className="flex flex-col gap-2">
                  {stage.choices.map(choice => (
                    <TLChoiceBtn key={choice.id} choice={choice}
                      selected={pickedId === choice.id}
                      locked={!!pickedId && pickedId !== choice.id}
                      onSelect={() => handlePick(choice)} />
                  ))}
                </div>
                <AnimatePresence>
                  {confirming && (
                    <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      onClick={handleNext}
                      className="w-full py-3.5 rounded-full text-white font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
                      style={{ background: "linear-gradient(135deg, #b91c1c, #7f1d1d)", boxShadow: "0 4px 24px rgba(185,28,28,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset" }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 4px 32px rgba(220,38,38,0.5), 0 0 0 1px rgba(255,255,255,0.12) inset")}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 4px 24px rgba(185,28,28,0.4), 0 0 0 1px rgba(255,255,255,0.08) inset")}>
                      {isLast ? "See my outcome" : `Jump to your ${TIMELINE_STAGES[stageIdx + 1]?.age}`}
                      <ChevronRight className="w-4 h-4" />
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <p className="text-[10px] text-center" style={{ color: "rgba(255,255,255,0.15)" }}>
            Educational simulation only · Not a medical assessment · Click outside to close
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

const FEATURES_GAME = [
  { icon: "🔥", label: "Combo multipliers" },
  { icon: "⭐", label: "Shield power-ups" },
  { icon: "📈", label: "Difficulty scaling" },
];
const FEATURES_EXPLORER = [
  { icon: "🔍", label: "3D heart anatomy" },
  { icon: "💡", label: "Interactive labels" },
  { icon: "📖", label: "Health insights" },
];

const FEATURES_TIMELINE = [
  { icon: "⏳", label: "4 life stages" },
  { icon: "💥", label: "Compounding choices" },
  { icon: "🫀", label: "Heart age outcome" },
];

export default function Interactables() {
  const [gameOpen, setGameOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#080606",
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: "800px", height: "600px",
          background: "radial-gradient(ellipse, rgba(153,27,27,0.12) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "-10%",
          width: "400px", height: "400px",
          background: "radial-gradient(ellipse, rgba(79,70,229,0.07) 0%, transparent 70%)",
        }} />
      </div>

      {/* ── Hero ── */}
      <div className="relative z-10 pt-20 pb-12 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6"
            style={{ background: "rgba(185,28,28,0.12)", border: "1px solid rgba(185,28,28,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-red-400 font-semibold">Interactive</span>
          </div>

          <h1
            className="text-6xl lg:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("int_page_title")}
          </h1>

          <p className="text-sm text-white/35 max-w-xs mx-auto leading-relaxed mt-4">
            Learn heart health through play and exploration.
          </p>
        </motion.div>
      </div>

      {/* ── Divider ── */}
      <div className="relative z-10 mx-auto max-w-sm">
        <div className="h-px" style={{ background: "linear-gradient(to right, transparent, rgba(185,28,28,0.35), transparent)" }} />
      </div>

      {/* ── Cards ── */}
      <div className="relative z-10 flex flex-col items-center gap-4 py-14 px-6">

        {/* Game Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setGameOpen(true)}
          className="group relative w-full max-w-sm rounded-2xl cursor-pointer text-left overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15 }}
        >
          {/* Card glow on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(185,28,28,0.12), transparent 70%)" }} />

          <div className="relative p-5 flex items-start gap-4">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.25)" }}>
                ❤️
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-white">Heart Defender</p>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "rgba(185,28,28,0.7)", border: "1px solid rgba(220,38,38,0.4)" }}>
                  ▶ PLAY
                </div>
              </div>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">
                Catch healthy foods, dodge junk — protect your heart in this fast-paced arcade game.
              </p>
              <div className="flex gap-3">
                {FEATURES_GAME.map(f => (
                  <div key={f.label} className="flex items-center gap-1">
                    <span className="text-xs">{f.icon}</span>
                    <span className="text-[10px] text-white/30">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className="h-px mx-5 mb-4" style={{ background: "linear-gradient(to right, rgba(185,28,28,0.3), transparent)" }} />
          <div className="px-5 pb-4 flex items-center gap-4">
            {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
              <div key={d} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: DIFFICULTIES[d].color, opacity: 0.7 }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: DIFFICULTIES[d].color + "99" }}>{DIFFICULTIES[d].label}</span>
              </div>
            ))}
          </div>
        </motion.button>

        {/* Explorer Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setExplorerOpen(true)}
          className="group relative w-full max-w-sm rounded-2xl cursor-pointer text-left overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(79,70,229,0.1), transparent 70%)" }} />

          <div className="relative p-5 flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(79,70,229,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
                🔬
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-white">{t("int_explorer_name")}</p>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "rgba(79,70,229,0.65)", border: "1px solid rgba(99,102,241,0.4)" }}>
                  {t("int_explorer_cta")}
                </div>
              </div>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">
                {t("int_explorer_desc")}
              </p>
              <div className="flex gap-3">
                {FEATURES_EXPLORER.map(f => (
                  <div key={f.label} className="flex items-center gap-1">
                    <span className="text-xs">{f.icon}</span>
                    <span className="text-[10px] text-white/30">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px mx-5 mb-3" style={{ background: "linear-gradient(to right, rgba(79,70,229,0.3), transparent)" }} />
          <div className="px-5 pb-4 flex items-center gap-2">
            {[
              { label: "Anatomy", color: "rgba(99,102,241,0.18)", border: "rgba(99,102,241,0.3)", text: "rgba(165,180,252,0.7)" },
              { label: "Education", color: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)", text: "rgba(110,231,183,0.7)" },
              { label: "Interactive", color: "rgba(251,191,36,0.1)", border: "rgba(251,191,36,0.22)", text: "rgba(251,191,36,0.6)" },
            ].map(t => (
              <span key={t.label} className="text-[10px] font-medium px-2 py-0.5 rounded-md"
                style={{ background: t.color, border: `1px solid ${t.border}`, color: t.text }}>
                {t.label}
              </span>
            ))}
          </div>
        </motion.button>
        {/* Timeline Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setTimelineOpen(true)}
          className="group relative w-full max-w-sm rounded-2xl cursor-pointer text-left overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
            style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(245,158,11,0.09), transparent 70%)" }} />

          <div className="relative p-5 flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.22)" }}>
                ⏳
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-bold text-white">Cardiac Timeline</p>
                <div className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                  style={{ background: "rgba(245,158,11,0.55)", border: "1px solid rgba(245,158,11,0.35)" }}>
                  ▶ START
                </div>
              </div>
              <p className="text-xs text-white/35 mb-3 leading-relaxed">
                Make lifestyle choices across four decades of life and see how they shape your heart's age.
              </p>
              <div className="flex gap-3">
                {FEATURES_TIMELINE.map(f => (
                  <div key={f.label} className="flex items-center gap-1">
                    <span className="text-xs">{f.icon}</span>
                    <span className="text-[10px] text-white/30">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="h-px mx-5 mb-3" style={{ background: "linear-gradient(to right, rgba(245,158,11,0.25), transparent)" }} />
          <div className="px-5 pb-4 flex items-center gap-2">
            {["20s", "30s", "40s", "50s"].map((age, i) => (
              <div key={age} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: ["#60a5fa","#f59e0b","#f97316","#e24b4a"][i], opacity: 0.7 }} />
                <span className="text-[9px] uppercase tracking-wider" style={{ color: ["#60a5fa","#f59e0b","#f97316","#e24b4a"][i] + "99" }}>{age}</span>
              </div>
            ))}
          </div>
        </motion.button>

      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 mx-auto max-w-sm mb-16 mx-6 rounded-xl px-5 py-3.5 flex items-start gap-3"
        style={{ background: "rgba(120,80,0,0.12)", border: "1px solid rgba(180,120,0,0.18)" }}
      >
        <span className="text-sm mt-0.5 flex-shrink-0">⚠️</span>
        <p className="text-[11px] leading-relaxed" style={{ color: "rgba(251,191,36,0.45)" }}>
          For educational purposes only. Always consult a qualified healthcare provider for medical advice.
        </p>
      </motion.div>

      <AnimatePresence>
        {gameOpen && <GameModal onClose={() => setGameOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {explorerOpen && <HeartExplorerModal onClose={() => setExplorerOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {timelineOpen && <CardiacTimelineModal onClose={() => setTimelineOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
