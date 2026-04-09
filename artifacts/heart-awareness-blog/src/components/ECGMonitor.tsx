import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type RhythmKey = "normal" | "tachy" | "brady" | "afib";

interface Rhythm {
  key: RhythmKey;
  emoji: string;
  label: string;
  sublabel: string;
  bpm: number;
  bpmRange: string;
  color: string;
  bg: string;
  glow: string;
  whatItMeans: string;
  waveform: (t: number, phase: number) => number;
}

const RHYTHMS: Rhythm[] = [
  {
    key: "normal",
    emoji: "💚",
    label: "Normal",
    sublabel: "Sinus Rhythm",
    bpm: 72,
    bpmRange: "60–100 BPM",
    color: "#22c55e",
    bg: "#052e16",
    glow: "rgba(34,197,94,0.35)",
    whatItMeans:
      "Your heart is beating at a healthy, steady pace. The electrical signal travels from top to bottom in perfect order — like a well-rehearsed band.",
    waveform: (t, phase) => {
      const c = (t + phase) % 1;
      if (c < 0.1) return Math.sin(c * Math.PI * 10) * 0.08;
      if (c < 0.2) return Math.sin((c - 0.1) * Math.PI * 10) * 0.06;
      if (c < 0.3) return Math.sin(((c - 0.2) / 0.1) * Math.PI) * 0.9;
      if (c < 0.38) return -Math.sin(((c - 0.3) / 0.08) * Math.PI) * 0.25;
      if (c < 0.5) return Math.sin(((c - 0.38) / 0.12) * Math.PI) * 0.35;
      return 0;
    },
  },
  {
    key: "tachy",
    emoji: "🔴",
    label: "Too Fast",
    sublabel: "Tachycardia",
    bpm: 138,
    bpmRange: "> 100 BPM",
    color: "#f97316",
    bg: "#1c0700",
    glow: "rgba(249,115,22,0.35)",
    whatItMeans:
      "The heart is racing too fast. It doesn't get enough time to fill with blood between beats — like running a sprint non-stop. Can be caused by stress, fever, or caffeine.",
    waveform: (t, phase) => {
      const c = (t * 1.9 + phase) % 1;
      if (c < 0.08) return Math.sin((c / 0.08) * Math.PI) * 0.12;
      if (c < 0.22) return Math.sin(((c - 0.08) / 0.14) * Math.PI) * 0.88;
      if (c < 0.32) return -Math.sin(((c - 0.22) / 0.1) * Math.PI) * 0.22;
      if (c < 0.45) return Math.sin(((c - 0.32) / 0.13) * Math.PI) * 0.3;
      return 0;
    },
  },
  {
    key: "brady",
    emoji: "🔵",
    label: "Too Slow",
    sublabel: "Bradycardia",
    bpm: 44,
    bpmRange: "< 60 BPM",
    color: "#60a5fa",
    bg: "#030f1c",
    glow: "rgba(96,165,250,0.35)",
    whatItMeans:
      "The heart is beating too slowly. Blood may not be pumping efficiently. Normal in athletes, but can also signal a problem with the heart's electrical system.",
    waveform: (t, phase) => {
      const c = (t * 0.6 + phase) % 1;
      if (c < 0.06) return Math.sin((c / 0.06) * Math.PI) * 0.12;
      if (c < 0.18) return Math.sin(((c - 0.06) / 0.12) * Math.PI) * 1.0;
      if (c < 0.26) return -Math.sin(((c - 0.18) / 0.08) * Math.PI) * 0.22;
      if (c < 0.4) return Math.sin(((c - 0.26) / 0.14) * Math.PI) * 0.32;
      return 0;
    },
  },
  {
    key: "afib",
    emoji: "⚡",
    label: "Irregular",
    sublabel: "Atrial Fibrillation",
    bpm: 105,
    bpmRange: "Unpredictable",
    color: "#c084fc",
    bg: "#120520",
    glow: "rgba(192,132,252,0.35)",
    whatItMeans:
      "The upper chambers of the heart fire chaotically. The heartbeat becomes totally irregular — like a drummer who lost the beat. A major risk factor for stroke.",
    waveform: (t, phase) => {
      const noise =
        Math.sin(t * 43 + phase * 11) * 0.07 + Math.sin(t * 29) * 0.05;
      const c =
        (t * 1.4 + phase + Math.sin(t * 0.9) * 0.05) % 1;
      if (c < 0.28)
        return (
          Math.sin((c / 0.28) * Math.PI) *
            (0.75 + Math.sin(t * 3.1) * 0.18) +
          noise
        );
      if (c < 0.42)
        return -Math.sin(((c - 0.28) / 0.14) * Math.PI) * 0.2 + noise;
      if (c < 0.58)
        return Math.sin(((c - 0.42) / 0.16) * Math.PI) * 0.28 + noise;
      return noise;
    },
  },
];

function hexRgb(hex: string) {
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}

export function ECGMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const rhythmRef = useRef<Rhythm>(RHYTHMS[0]);
  const [active, setActive] = useState<RhythmKey>("normal");

  const rhythm = RHYTHMS.find((r) => r.key === active)!;

  useEffect(() => {
    rhythmRef.current = RHYTHMS.find((r) => r.key === active)!;
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let start: number | null = null;

    const draw = (ts: number) => {
      if (!start) start = ts;
      const elapsed = (ts - start) / 1000;
      const r = rhythmRef.current;
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = r.bg;
      ctx.fillRect(0, 0, W, H);

      const cw = W / 40;
      const ch = H / 25;
      ctx.strokeStyle = `rgba(${hexRgb(r.color)},0.04)`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 40; i++) {
        ctx.beginPath(); ctx.moveTo(i * cw, 0); ctx.lineTo(i * cw, H); ctx.stroke();
      }
      for (let j = 0; j <= 25; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * ch); ctx.lineTo(W, j * ch); ctx.stroke();
      }
      ctx.strokeStyle = `rgba(${hexRgb(r.color)},0.1)`;
      ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        ctx.beginPath(); ctx.moveTo(i * cw * 5, 0); ctx.lineTo(i * cw * 5, H); ctx.stroke();
      }
      for (let j = 0; j <= 5; j++) {
        ctx.beginPath(); ctx.moveTo(0, j * ch * 5); ctx.lineTo(W, j * ch * 5); ctx.stroke();
      }

      const phase = (elapsed * (r.bpm / 72) * 0.38) % 1;
      const pts: [number, number][] = [];
      for (let i = 0; i < W; i++) {
        const y = r.waveform(i / W, phase);
        pts.push([i, H / 2 - y * H * 0.38]);
      }

      for (let pass = 0; pass < 3; pass++) {
        ctx.shadowBlur = [20, 8, 0][pass];
        ctx.shadowColor = r.glow;
        ctx.strokeStyle = `rgba(${hexRgb(r.color)},${[0.12, 0.28, 1][pass]})`;
        ctx.lineWidth = [5, 2.5, 1.5][pass];
        ctx.beginPath();
        pts.forEach(([x, y], i) =>
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y),
        );
        ctx.stroke();
      }
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className="w-full rounded-2xl overflow-hidden transition-colors duration-500"
      style={{
        background: rhythm.bg,
        border: `1px solid rgba(${hexRgb(rhythm.color)},0.2)`,
        boxShadow: `0 0 60px ${rhythm.glow}`,
      }}
    >
      {/* Header row */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase font-semibold opacity-40 text-white mb-2">
            ECG Monitor · Live Simulation
          </p>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{rhythm.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-white leading-tight">
                {rhythm.label}
              </h3>
              <p className="text-sm opacity-50 text-white">{rhythm.sublabel}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-4xl font-bold tabular-nums transition-colors duration-300"
            style={{ color: rhythm.color }}
          >
            {rhythm.bpm}
          </div>
          <div className="text-[10px] tracking-widest uppercase opacity-40 text-white mt-0.5">
            BPM
          </div>
        </div>
      </div>

      {/* Waveform canvas */}
      <div
        className="mx-4 rounded-xl overflow-hidden"
        style={{
          border: `1px solid rgba(${hexRgb(rhythm.color)},0.15)`,
        }}
      >
        <canvas
          ref={canvasRef}
          width={900}
          height={200}
          className="w-full block"
        />
      </div>

      {/* Condition buttons */}
      <div className="grid grid-cols-4 gap-2 px-4 pt-4">
        {RHYTHMS.map((r) => (
          <button
            key={r.key}
            onClick={() => setActive(r.key)}
            className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all duration-200 cursor-pointer"
            style={{
              background:
                active === r.key
                  ? `rgba(${hexRgb(r.color)},0.18)`
                  : "rgba(255,255,255,0.04)",
              border:
                active === r.key
                  ? `1px solid rgba(${hexRgb(r.color)},0.5)`
                  : "1px solid rgba(255,255,255,0.07)",
              boxShadow:
                active === r.key
                  ? `0 0 16px rgba(${hexRgb(r.color)},0.25)`
                  : "none",
            }}
          >
            <span className="text-lg">{r.emoji}</span>
            <span className="text-[11px] font-semibold text-white">
              {r.label}
            </span>
            <span className="text-[9px] opacity-40 text-white">
              {r.bpmRange}
            </span>
          </button>
        ))}
      </div>

      {/* Plain-English explanation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
          className="mx-4 mt-3 mb-5 rounded-xl px-4 py-3"
          style={{
            background: `rgba(${hexRgb(rhythm.color)},0.08)`,
            border: `1px solid rgba(${hexRgb(rhythm.color)},0.12)`,
          }}
        >
          <p
            className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
            style={{ color: rhythm.color }}
          >
            What this means
          </p>
          <p className="text-[12px] text-white/60 leading-relaxed">
            {rhythm.whatItMeans}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
