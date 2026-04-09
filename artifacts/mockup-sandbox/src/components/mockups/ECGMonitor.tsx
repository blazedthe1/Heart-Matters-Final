import { useEffect, useRef, useState, useCallback } from "react";

interface Condition {
  name: string;
  color: string;
  bgColor: string;
  glowColor: string;
  bpm: number;
  description: string;
  waveform: (t: number, phase: number) => number;
}

const conditions: Condition[] = [
  {
    name: "Normal Sinus Rhythm",
    color: "#00ff88",
    bgColor: "#001a0d",
    glowColor: "rgba(0,255,136,0.4)",
    bpm: 72,
    description: "Regular rhythm · 60–100 bpm",
    waveform: (t, phase) => {
      const cycle = (t + phase) % 1;
      if (cycle < 0.1) return Math.sin(cycle * Math.PI * 10) * 0.08;
      if (cycle < 0.2) return Math.sin((cycle - 0.1) * Math.PI * 10) * 0.06;
      if (cycle < 0.3) {
        const x = (cycle - 0.2) / 0.1;
        return Math.sin(x * Math.PI) * 0.9;
      }
      if (cycle < 0.38) {
        const x = (cycle - 0.3) / 0.08;
        return -Math.sin(x * Math.PI) * 0.25;
      }
      if (cycle < 0.5) {
        const x = (cycle - 0.38) / 0.12;
        return Math.sin(x * Math.PI) * 0.35;
      }
      return Math.sin(cycle * Math.PI * 2) * 0.03;
    },
  },
  {
    name: "Ventricular Fibrillation",
    color: "#ff2244",
    bgColor: "#1a0005",
    glowColor: "rgba(255,34,68,0.5)",
    bpm: 300,
    description: "Life-threatening · Chaotic rhythm",
    waveform: (t, phase) => {
      const f = t * 8 + phase * 30;
      return (
        Math.sin(f * 7.3) * 0.35 +
        Math.sin(f * 11.7 + 2) * 0.28 +
        Math.sin(f * 5.1 - 1) * 0.22 +
        Math.sin(f * 17.3) * 0.15 +
        (Math.random() - 0.5) * 0.1
      );
    },
  },
  {
    name: "Atrial Fibrillation",
    color: "#ff8800",
    bgColor: "#1a0800",
    glowColor: "rgba(255,136,0,0.4)",
    bpm: 110,
    description: "Irregular rhythm · No P-waves",
    waveform: (t, phase) => {
      const cycle = (t * 1.5 + phase) % 1;
      const noise = Math.sin(t * 47 + phase * 13) * 0.08 + Math.sin(t * 31) * 0.05;
      if (cycle < 0.25) {
        const x = (cycle / 0.25);
        return Math.sin(x * Math.PI) * (0.7 + Math.sin(t * 3) * 0.2) + noise;
      }
      if (cycle < 0.38) {
        const x = (cycle - 0.25) / 0.13;
        return -Math.sin(x * Math.PI) * 0.2 + noise;
      }
      if (cycle < 0.55) {
        const x = (cycle - 0.38) / 0.17;
        return Math.sin(x * Math.PI) * 0.28 + noise;
      }
      return noise;
    },
  },
  {
    name: "Bradycardia",
    color: "#4488ff",
    bgColor: "#000d1a",
    glowColor: "rgba(68,136,255,0.4)",
    bpm: 40,
    description: "Slow heart rate · < 60 bpm",
    waveform: (t, phase) => {
      const cycle = ((t * 0.55) + phase) % 1;
      if (cycle < 0.06) return Math.sin(cycle * Math.PI * 16) * 0.07;
      if (cycle < 0.1) return Math.sin((cycle - 0.06) * Math.PI * 25) * 0.05;
      if (cycle < 0.18) {
        const x = (cycle - 0.1) / 0.08;
        return Math.sin(x * Math.PI) * 1.0;
      }
      if (cycle < 0.25) {
        const x = (cycle - 0.18) / 0.07;
        return -Math.sin(x * Math.PI) * 0.22;
      }
      if (cycle < 0.38) {
        const x = (cycle - 0.25) / 0.13;
        return Math.sin(x * Math.PI) * 0.32;
      }
      return Math.sin(cycle * Math.PI * 3) * 0.015;
    },
  },
  {
    name: "Tachycardia",
    color: "#ff44aa",
    bgColor: "#1a000f",
    glowColor: "rgba(255,68,170,0.4)",
    bpm: 155,
    description: "Fast heart rate · > 100 bpm",
    waveform: (t, phase) => {
      const cycle = ((t * 2.1) + phase) % 1;
      if (cycle < 0.08) return Math.sin(cycle * Math.PI * 12) * 0.06;
      if (cycle < 0.22) {
        const x = (cycle - 0.08) / 0.14;
        return Math.sin(x * Math.PI) * 0.85;
      }
      if (cycle < 0.32) {
        const x = (cycle - 0.22) / 0.1;
        return -Math.sin(x * Math.PI) * 0.2;
      }
      if (cycle < 0.45) {
        const x = (cycle - 0.32) / 0.13;
        return Math.sin(x * Math.PI) * 0.3;
      }
      return Math.sin(cycle * Math.PI * 4) * 0.02;
    },
  },
  {
    name: "Heart Block (3rd Degree)",
    color: "#aa44ff",
    bgColor: "#0d001a",
    glowColor: "rgba(170,68,255,0.4)",
    bpm: 35,
    description: "Complete AV dissociation",
    waveform: (t, phase) => {
      const pCycle = (t * 1.2 + phase) % 1;
      const qrsCycle = (t * 0.45 + phase * 0.5) % 1;
      const pWave = pCycle < 0.15 ? Math.sin((pCycle / 0.15) * Math.PI) * 0.12 : 0;
      let qrs = 0;
      if (qrsCycle < 0.08) {
        const x = qrsCycle / 0.08;
        qrs = Math.sin(x * Math.PI) * 0.95;
      } else if (qrsCycle < 0.18) {
        const x = (qrsCycle - 0.08) / 0.1;
        qrs = -Math.sin(x * Math.PI) * 0.3;
      } else if (qrsCycle < 0.32) {
        const x = (qrsCycle - 0.18) / 0.14;
        qrs = Math.sin(x * Math.PI) * 0.25;
      }
      return pWave + qrs;
    },
  },
  {
    name: "ST Elevation (STEMI)",
    color: "#ffdd00",
    bgColor: "#1a1400",
    glowColor: "rgba(255,221,0,0.4)",
    bpm: 88,
    description: "Myocardial infarction · Emergency",
    waveform: (t, phase) => {
      const cycle = (t + phase) % 1;
      if (cycle < 0.08) return Math.sin(cycle * Math.PI * 12) * 0.07;
      if (cycle < 0.22) {
        const x = (cycle - 0.08) / 0.14;
        return Math.sin(x * Math.PI) * 0.9;
      }
      if (cycle < 0.3) {
        const x = (cycle - 0.22) / 0.08;
        return 0.35 + Math.sin(x * Math.PI) * 0.05;
      }
      if (cycle < 0.45) {
        const x = (cycle - 0.3) / 0.15;
        return 0.35 - x * 0.35 + Math.sin(x * Math.PI) * 0.15;
      }
      if (cycle < 0.62) {
        const x = (cycle - 0.45) / 0.17;
        return Math.sin(x * Math.PI) * 0.28;
      }
      return Math.sin(cycle * Math.PI * 2) * 0.015;
    },
  },
  {
    name: "Ventricular Tachycardia",
    color: "#ff6600",
    bgColor: "#1a0500",
    glowColor: "rgba(255,102,0,0.45)",
    bpm: 185,
    description: "Dangerous · Wide QRS · No P-waves",
    waveform: (t, phase) => {
      const cycle = ((t * 2.8) + phase) % 1;
      if (cycle < 0.18) {
        const x = cycle / 0.18;
        return Math.sin(x * Math.PI) * 0.95 + Math.sin(x * Math.PI * 3) * 0.12;
      }
      if (cycle < 0.38) {
        const x = (cycle - 0.18) / 0.2;
        return -Math.sin(x * Math.PI) * 0.55;
      }
      if (cycle < 0.55) {
        const x = (cycle - 0.38) / 0.17;
        return Math.sin(x * Math.PI) * 0.3;
      }
      return Math.sin(cycle * Math.PI * 5) * 0.04;
    },
  },
];

const TRAIL_LENGTH = 600;
const CANVAS_HEIGHT = 260;
const NUM_GRID_H = 8;
const NUM_GRID_V = 5;

export default function ECGMonitor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const mouseXRef = useRef<number>(0.5);
  const conditionIndexRef = useRef<number>(0);
  const [conditionIndex, setConditionIndex] = useState(0);
  const condition = conditions[conditionIndex];

  const getConditionFromMouse = useCallback((x: number, width: number) => {
    const ratio = x / width;
    return Math.min(Math.floor(ratio * conditions.length), conditions.length - 1);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const ratio = e.clientX / window.innerWidth;
      mouseXRef.current = ratio;
      const idx = getConditionFromMouse(e.clientX, window.innerWidth);
      if (idx !== conditionIndexRef.current) {
        conditionIndexRef.current = idx;
        setConditionIndex(idx);
      }
    };
    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [getConditionFromMouse]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let startTime: number | null = null;
    const points: { x: number; y: number }[] = [];

    const draw = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = (timestamp - startTime) / 1000;
      timeRef.current = elapsed;

      const cond = conditions[conditionIndexRef.current];
      const W = canvas.width;
      const H = canvas.height;

      ctx.fillStyle = cond.bgColor;
      ctx.fillRect(0, 0, W, H);

      const gridColorMain = `rgba(${hexToRgb(cond.color)}, 0.08)`;
      const gridColorAccent = `rgba(${hexToRgb(cond.color)}, 0.04)`;

      const cellW = W / (NUM_GRID_H * 5);
      const cellH = H / (NUM_GRID_V * 5);

      ctx.strokeStyle = gridColorAccent;
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= NUM_GRID_H * 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, H);
        ctx.stroke();
      }
      for (let j = 0; j <= NUM_GRID_V * 5; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellH);
        ctx.lineTo(W, j * cellH);
        ctx.stroke();
      }

      ctx.strokeStyle = gridColorMain;
      ctx.lineWidth = 1;
      for (let i = 0; i <= NUM_GRID_H; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW * 5, 0);
        ctx.lineTo(i * cellW * 5, H);
        ctx.stroke();
      }
      for (let j = 0; j <= NUM_GRID_V; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * cellH * 5);
        ctx.lineTo(W, j * cellH * 5);
        ctx.stroke();
      }

      const speed = cond.bpm / 72;
      const phase = (elapsed * speed * 0.38) % 1;

      points.length = 0;
      for (let i = 0; i < W; i++) {
        const t = i / W;
        const y = cond.waveform(t, phase);
        const cy = H / 2 - y * (H * 0.38);
        points.push({ x: i, y: cy });
      }

      const glowRgb = hexToRgb(cond.color);

      for (let pass = 0; pass < 3; pass++) {
        const blur = [12, 6, 2][pass];
        const alpha = [0.18, 0.3, 1][pass];
        ctx.shadowBlur = blur;
        ctx.shadowColor = cond.glowColor;
        ctx.strokeStyle = `rgba(${glowRgb}, ${alpha})`;
        ctx.lineWidth = [3, 2, 1.5][pass];
        ctx.beginPath();
        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.shadowColor = "transparent";

      const cursorX = mouseXRef.current * W;
      const nearestIdx = Math.floor(mouseXRef.current * (points.length - 1));
      const dotY = points[nearestIdx]?.y ?? H / 2;

      ctx.strokeStyle = `rgba(${glowRgb}, 0.25)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(cursorX, 0);
      ctx.lineTo(cursorX, H);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.shadowBlur = 16;
      ctx.shadowColor = cond.color;
      ctx.fillStyle = cond.color;
      ctx.beginPath();
      ctx.arc(cursorX, dotY, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex flex-col items-center justify-center select-none"
      style={{
        backgroundColor: condition.bgColor,
        transition: "background-color 0.6s ease",
        cursor: "none",
        fontFamily: "'Inter', 'Helvetica Neue', sans-serif",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 50%, ${condition.glowColor} 0%, transparent 70%)`,
          transition: "all 0.6s ease",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center gap-6 px-6">
        <div className="text-center mb-2">
          <div
            className="text-xs font-semibold tracking-[0.25em] uppercase mb-2 opacity-60"
            style={{ color: condition.color, transition: "color 0.4s ease" }}
          >
            ECG Monitor · Cardiac Rhythm Analysis
          </div>

          <div
            className="text-4xl font-bold tracking-tight mb-1"
            style={{
              color: condition.color,
              textShadow: `0 0 30px ${condition.glowColor}, 0 0 60px ${condition.glowColor}`,
              transition: "color 0.4s ease, text-shadow 0.4s ease",
            }}
          >
            {condition.name}
          </div>

          <div
            className="text-sm opacity-70 mt-1"
            style={{ color: condition.color, transition: "color 0.4s ease" }}
          >
            {condition.description}
          </div>
        </div>

        <div
          className="w-full max-w-5xl rounded-lg overflow-hidden"
          style={{
            border: `1px solid rgba(${hexToRgbStr(condition.color)}, 0.25)`,
            boxShadow: `0 0 40px ${condition.glowColor}, inset 0 0 20px rgba(0,0,0,0.5)`,
            transition: "border-color 0.4s ease, box-shadow 0.4s ease",
          }}
        >
          <canvas
            ref={canvasRef}
            width={900}
            height={CANVAS_HEIGHT}
            className="w-full block"
            style={{ imageRendering: "pixelated" }}
          />
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <div
              className="text-5xl font-bold tabular-nums"
              style={{
                color: condition.color,
                textShadow: `0 0 20px ${condition.glowColor}`,
                transition: "color 0.4s ease",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {condition.bpm}
            </div>
            <div
              className="text-xs tracking-widest uppercase mt-1 opacity-60"
              style={{ color: condition.color }}
            >
              BPM
            </div>
          </div>

          <div
            className="w-px self-stretch opacity-20"
            style={{ backgroundColor: condition.color }}
          />

          <div className="flex flex-col gap-1">
            {conditions.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: i === conditionIndex ? c.color : "transparent",
                    border: `1px solid ${c.color}`,
                    boxShadow: i === conditionIndex ? `0 0 8px ${c.color}` : "none",
                    transform: i === conditionIndex ? "scale(1.3)" : "scale(1)",
                  }}
                />
                <span
                  className="text-xs transition-all duration-300"
                  style={{
                    color: i === conditionIndex ? c.color : `rgba(${hexToRgbStr(c.color)}, 0.35)`,
                    fontWeight: i === conditionIndex ? "600" : "400",
                  }}
                >
                  {c.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          className="text-xs opacity-40 tracking-widest uppercase"
          style={{ color: condition.color, transition: "color 0.4s ease" }}
        >
          Move cursor left ← → right to change condition
        </div>
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function hexToRgbStr(hex: string): string {
  return hexToRgb(hex);
}
