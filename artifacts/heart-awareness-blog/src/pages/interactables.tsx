import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pause, Play, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
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

  const hearts = Array.from({ length: Math.max(display.lives, 0) }, (_, i) => i < display.lives ? "❤️" : "");
  const emptyHearts = Array.from({ length: Math.max(3 - display.lives, 0) }, () => "🖤");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(16px)" }}
      onClick={handleLeave}
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-3 w-full max-w-[520px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HUD */}
        <div className="flex items-center justify-between w-full px-1">
          <div className="flex flex-col min-w-[60px]">
            <span className="text-[9px] tracking-widest uppercase text-white/25 mb-0.5">Score</span>
            <span className="text-2xl font-bold text-white tabular-nums">{display.score}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-0.5 text-lg">{hearts.join("")}{emptyHearts.join("")}</div>
            {display.shieldActive && (
              <span className="text-[9px] tracking-widest uppercase text-yellow-400 font-semibold animate-pulse">⭐ Shield</span>
            )}
            {display.combo >= 3 && display.phase === "playing" && (
              <span className="text-[10px] font-bold text-green-400">🔥 {display.combo}x combo</span>
            )}
          </div>

          <div className="flex items-center gap-2 min-w-[60px] justify-end">
            <div className="flex flex-col items-end">
              <span className="text-[9px] tracking-widest uppercase text-white/25 mb-0.5">Best</span>
              <span className="text-xl font-bold text-white/40 tabular-nums">{display.hiScore}</span>
            </div>
            {(display.phase === "playing" || display.phase === "paused") && (
              <button onClick={togglePause} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
                {display.phase === "paused" ? <Play className="w-3.5 h-3.5 text-white/70" /> : <Pause className="w-3.5 h-3.5 text-white/70" />}
              </button>
            )}
            <button onClick={handleLeave} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer">
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        {/* Level badge */}
        {display.phase === "playing" && (
          <div className="flex items-center gap-3 self-stretch px-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.05] border border-white/[0.07]">
              <span className="text-[9px] tracking-widest uppercase text-white/25">Level</span>
              <span className="text-xs font-bold text-white/70">{display.level}</span>
            </div>
            <div className="flex-1 h-1 rounded-full bg-white/[0.07] overflow-hidden">
              <div className="h-full rounded-full bg-red-600 transition-all duration-300"
                style={{ width: `${((display.score % 100) / 100) * 100}%` }} />
            </div>
            <span className="text-[9px] text-white/25">{100 - (display.score % 100)} to next</span>
          </div>
        )}

        {/* Difficulty selector */}
        <AnimatePresence>
          {display.phase !== "playing" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }} className="flex gap-2 overflow-hidden"
            >
              {(Object.keys(DIFFICULTIES) as Difficulty[]).map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: difficulty === d ? DIFFICULTIES[d].color + "22" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${difficulty === d ? DIFFICULTIES[d].color + "66" : "rgba(255,255,255,0.08)"}`,
                    color: difficulty === d ? DIFFICULTIES[d].color : "rgba(255,255,255,0.4)",
                  }}>
                  {DIFFICULTIES[d].label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Canvas */}
        <div className="relative rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 0 80px rgba(185,28,28,0.25), 0 0 0 1px rgba(255,255,255,0.07)" }}>
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }} className="absolute inset-0 flex items-end justify-center pb-10">
                <button onClick={display.phase === "paused" ? togglePause : startGame}
                  className="bg-red-700 hover:bg-red-600 active:scale-95 transition-all text-white font-semibold text-sm px-10 py-3.5 rounded-full cursor-pointer shadow-lg shadow-red-900/50">
                  {display.phase === "idle" ? "▶  Play" : display.phase === "paused" ? "▶  Resume" : "↺  Play Again"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-xs text-white/25">
          <span>✅ {GOOD.join(" ")}</span>
          <span>❌ {BAD.join(" ")}</span>
          <span>✨ {POWERUP.join(" ")} power-ups</span>
        </div>
        <p className="text-[10px] text-white/15 tracking-wide text-center">
          Mouse / touch to aim &nbsp;·&nbsp; ← → or A D to move &nbsp;·&nbsp; Esc to pause &nbsp;·&nbsp; click outside to close
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ─── Blood Pressure Checker ─────────────────────────────────────── */

function getBPCategory(sys: number, dia: number, t: (k: string) => string) {
  if (sys >= 180 || dia >= 120) return { key: "crisis",  color: "#7f1d1d", border: "#991b1b", text: "#fca5a5", label: t("int_bp_crisis"),  desc: t("int_bp_crisis_desc"),  icon: "🚨" };
  if (sys >= 140 || dia >= 90)  return { key: "high2",   color: "#7f1d1d", border: "#b91c1c", text: "#fca5a5", label: t("int_bp_high2"),   desc: t("int_bp_high2_desc"),   icon: "⚠️" };
  if (sys >= 130 || dia >= 80)  return { key: "high1",   color: "#431407", border: "#c2410c", text: "#fdba74", label: t("int_bp_high1"),   desc: t("int_bp_high1_desc"),   icon: "⚠️" };
  if (sys >= 120 && dia < 80)   return { key: "elevated",color: "#1c1917", border: "#92400e", text: "#fcd34d", label: t("int_bp_elevated"), desc: t("int_bp_elevated_desc"), icon: "📊" };
  return                               { key: "normal",  color: "#052e16", border: "#166534", text: "#86efac", label: t("int_bp_normal"),   desc: t("int_bp_normal_desc"),   icon: "✅" };
}

function BPChecker() {
  const { t } = useLanguage();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [result, setResult] = useState<ReturnType<typeof getBPCategory> | null>(null);
  const [error, setError] = useState("");

  const check = () => {
    const s = parseInt(sys), d = parseInt(dia);
    if (isNaN(s) || isNaN(d) || s < 60 || s > 250 || d < 40 || d > 150) {
      setError("Please enter valid readings (systolic 60-250, diastolic 40-150).");
      setResult(null);
      return;
    }
    setError("");
    setResult(getBPCategory(s, d, t));
  };

  const reset = () => { setSys(""); setDia(""); setResult(null); setError(""); };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2 font-medium">{t("int_bp_systolic")}</label>
          <input
            type="number" value={sys} onChange={e => setSys(e.target.value)}
            placeholder="e.g. 120" min={60} max={250}
            className="w-full rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2 font-medium">{t("int_bp_diastolic")}</label>
          <input
            type="number" value={dia} onChange={e => setDia(e.target.value)}
            placeholder="e.g. 80" min={40} max={150}
            className="w-full rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">{error}</p>}

      <div className="flex gap-3">
        <button
          onClick={check}
          className="flex-1 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 cursor-pointer"
          style={{ background: "rgba(185,28,28,0.8)", border: "1px solid rgba(239,68,68,0.4)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,1)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(185,28,28,0.8)")}
        >
          {t("int_bp_submit")}
        </button>
        {result && (
          <button onClick={reset} className="px-4 py-3 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl p-5 space-y-2"
            style={{ background: result.color, border: `1px solid ${result.border}` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium mb-0.5">Result</p>
                <p className="text-xl font-bold" style={{ color: result.text }}>{result.label}</p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-2xl font-bold text-white">{sys}/{dia}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-widest">mmHg</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: result.text + "bb" }}>{result.desc}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reference chart */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-4 py-2.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Reference Chart</p>
        </div>
        {[
          { range: "< 120 / < 80", label: t("int_bp_normal"),   color: "#22c55e" },
          { range: "120-129 / < 80", label: t("int_bp_elevated"), color: "#eab308" },
          { range: "130-139 / 80-89", label: t("int_bp_high1"),  color: "#f97316" },
          { range: "≥ 140 / ≥ 90", label: t("int_bp_high2"),    color: "#ef4444" },
          { range: "≥ 180 / ≥ 120", label: t("int_bp_crisis"),  color: "#dc2626" },
        ].map((row, i) => (
          <div key={i} className="flex items-center justify-between px-4 py-2.5"
            style={{ borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
            <span className="text-xs font-mono text-white/40">{row.range}</span>
            <span className="text-xs font-semibold" style={{ color: row.color }}>{row.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Heart Rate Zone Calculator ─────────────────────────────────── */

const HR_ZONES = [
  { key: "int_hr_zone_rest",      pct: [50, 60], color: "#6366f1", bg: "#1e1b4b" },
  { key: "int_hr_zone_fatburn",   pct: [60, 70], color: "#22c55e", bg: "#052e16" },
  { key: "int_hr_zone_aerobic",   pct: [70, 80], color: "#3b82f6", bg: "#0c1a2e" },
  { key: "int_hr_zone_anaerobic", pct: [80, 90], color: "#f59e0b", bg: "#1c0f00" },
  { key: "int_hr_zone_max",       pct: [90, 100],color: "#ef4444", bg: "#2d0a0a" },
] as const;

function HRCalculator() {
  const { t } = useLanguage();
  const [age, setAge] = useState("");
  const [maxHR, setMaxHR] = useState<number | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    const a = parseInt(age);
    if (isNaN(a) || a < 10 || a > 100) {
      setError("Please enter a valid age between 10 and 100.");
      setMaxHR(null);
      return;
    }
    setError("");
    setMaxHR(220 - a);
  };

  const reset = () => { setAge(""); setMaxHR(null); setError(""); };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2 font-medium">{t("int_hr_age")}</label>
        <div className="flex gap-3">
          <input
            type="number" value={age} onChange={e => setAge(e.target.value)}
            placeholder="e.g. 16" min={10} max={100}
            className="flex-1 rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none transition-all"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            onKeyDown={e => e.key === "Enter" && calculate()}
          />
          <button
            onClick={calculate}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95 cursor-pointer"
            style={{ background: "rgba(185,28,28,0.8)", border: "1px solid rgba(239,68,68,0.4)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,1)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(185,28,28,0.8)")}
          >
            {t("int_hr_submit")}
          </button>
          {maxHR && (
            <button onClick={reset} className="px-4 py-3 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">{error}</p>}

      <AnimatePresence>
        {maxHR && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl px-5 py-3.5"
              style={{ background: "rgba(185,28,28,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <span className="text-2xl">❤️</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-medium">{t("int_hr_maxrate")}</p>
                <p className="text-2xl font-bold text-white">{maxHR} <span className="text-sm font-normal text-white/40">{t("int_hr_bpm")}</span></p>
              </div>
            </div>

            <div className="space-y-2">
              {HR_ZONES.map((z, i) => {
                const lo = Math.round(maxHR * z.pct[0] / 100);
                const hi = Math.round(maxHR * z.pct[1] / 100);
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                    style={{ background: z.bg, border: `1px solid ${z.color}22` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: z.color }} />
                      <span className="text-sm font-semibold" style={{ color: z.color }}>{t(z.key)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-sm font-mono text-white/70">{lo}–{hi} {t("int_hr_bpm")}</span>
                      <div className="hidden sm:flex items-center gap-1 rounded-full px-2 py-0.5"
                        style={{ background: `${z.color}18` }}>
                        <span className="text-[10px] font-medium" style={{ color: z.color }}>{z.pct[0]}–{z.pct[1]}%</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Myth vs Fact ───────────────────────────────────────────────── */

function MythFact() {
  const { t } = useLanguage();
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const cards = [1, 2, 3, 4, 5, 6];

  const toggle = (i: number) => setFlipped(f => ({ ...f, [i]: !f[i] }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {cards.map((n) => {
          const isFlipped = !!flipped[n];
          return (
            <motion.button
              key={n}
              onClick={() => toggle(n)}
              className="relative rounded-2xl p-5 text-left cursor-pointer transition-all duration-300 overflow-hidden"
              style={{
                background: isFlipped ? "rgba(5,46,22,0.8)" : "rgba(255,255,255,0.04)",
                border: isFlipped ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(255,255,255,0.09)",
                minHeight: 110,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <AnimatePresence mode="wait">
                {!isFlipped ? (
                  <motion.div key="myth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(239,68,68,0.2)", color: "#f87171" }}>
                        {t("int_myth_label")}
                      </span>
                    </div>
                    <p className="text-sm text-white/70 leading-relaxed font-medium">{t(`int_myth${n}`)}</p>
                    <p className="text-[10px] text-white/25 mt-3 flex items-center gap-1">
                      <span>👆</span> {t("int_tap_to_flip")}
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="fact" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(34,197,94,0.2)", color: "#4ade80" }}>
                        ✓ {t("int_fact_label")}
                      </span>
                    </div>
                    <p className="text-sm text-green-200/80 leading-relaxed">{t(`int_fact${n}`)}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
      <p className="text-center text-[11px] text-white/20 mt-2">{t("int_myth_desc")}</p>
    </div>
  );
}

/* ─── Expandable Tool Card ────────────────────────────────────────── */

interface ToolCardProps {
  icon: string;
  title: string;
  desc: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function ToolCard({ icon, title, desc, color, borderColor, children, defaultOpen = false }: ToolCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden w-full max-w-2xl mx-auto"
      style={{ border: `1px solid ${open ? borderColor : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.3s" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer transition-all"
        style={{ background: open ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/35 mt-0.5">{desc}</p>
        </div>
        <div className="text-white/30 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function Interactables() {
  const [gameOpen, setGameOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-['Outfit',sans-serif]" style={{ background: "#0f0c0c" }}>

      <div className="pt-16 pb-10 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(180,20,20,0.18), transparent 65%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">{t("int_page_badge")}</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("int_page_title")}</h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">{t("int_page_learn")}</p>
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mx-8" />

      <div className="flex flex-col items-center gap-4 py-12 px-6">

        {/* Heart Defender Game */}
        <motion.button
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
          onClick={() => setGameOpen(true)}
          className="group flex items-center gap-5 rounded-2xl px-7 py-5 cursor-pointer transition-all w-full max-w-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.3)" }}>
            <span className="text-2xl">❤️</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-white mb-0.5">{t("int_game_name")}</p>
            <p className="text-xs text-white/35">{t("int_game_desc")}</p>
          </div>
          <div className="px-4 py-2 rounded-full bg-red-700/80 text-white text-xs font-bold group-hover:bg-red-600 transition-colors flex-shrink-0">
            {t("int_game_play")}
          </div>
        </motion.button>

        {/* Heart Explorer */}
        <motion.button
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          onClick={() => setExplorerOpen(true)}
          className="group flex items-center gap-5 rounded-2xl px-7 py-5 cursor-pointer transition-all w-full max-w-2xl"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(28,60,185,0.2)", border: "1px solid rgba(28,60,185,0.3)" }}>
            <span className="text-2xl">🫀</span>
          </div>
          <div className="text-left flex-1">
            <p className="text-sm font-semibold text-white mb-0.5">{t("int_explorer_name")}</p>
            <p className="text-xs text-white/35">{t("int_explorer_desc")}</p>
          </div>
          <div className="px-4 py-2 rounded-full text-white text-xs font-bold transition-colors flex-shrink-0"
            style={{ background: "rgba(79,70,229,0.8)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(99,102,241,0.9)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(79,70,229,0.8)")}>
            {t("int_explorer_cta")}
          </div>
        </motion.button>

        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full max-w-2xl my-2" />

        {/* Blood Pressure Checker */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="w-full max-w-2xl">
          <ToolCard
            icon="🩺"
            title={t("int_bp_title")}
            desc={t("int_bp_desc")}
            color="#ef4444"
            borderColor="rgba(239,68,68,0.3)"
          >
            <BPChecker />
          </ToolCard>
        </motion.div>

        {/* Heart Rate Zone Calculator */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="w-full max-w-2xl">
          <ToolCard
            icon="💓"
            title={t("int_hr_title")}
            desc={t("int_hr_desc")}
            color="#f59e0b"
            borderColor="rgba(245,158,11,0.3)"
          >
            <HRCalculator />
          </ToolCard>
        </motion.div>

        {/* Myth vs Fact */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="w-full max-w-2xl">
          <ToolCard
            icon="🧠"
            title={t("int_myth_title")}
            desc={t("int_myth_desc")}
            color="#8b5cf6"
            borderColor="rgba(139,92,246,0.3)"
          >
            <MythFact />
          </ToolCard>
        </motion.div>
      </div>

      <div className="mx-6 mb-12 max-w-2xl mx-auto rounded-2xl bg-amber-950/30 border border-amber-700/25 px-5 py-3.5 flex items-start gap-2.5">
        <span className="text-sm mt-0.5">⚠️</span>
        <p className="text-xs text-amber-200/50 leading-relaxed">{t("int_disclaimer")}</p>
      </div>

      <AnimatePresence>
        {gameOpen && <GameModal onClose={() => setGameOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {explorerOpen && <HeartExplorerModal onClose={() => setExplorerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
