import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const HR_ZONES = [
  { key: "int_hr_zone_rest",      pct: [50, 60]  as [number,number], color: "#6366f1", bg: "#1e1b4b" },
  { key: "int_hr_zone_fatburn",   pct: [60, 70]  as [number,number], color: "#22c55e", bg: "#052e16" },
  { key: "int_hr_zone_aerobic",   pct: [70, 80]  as [number,number], color: "#3b82f6", bg: "#0c1a2e" },
  { key: "int_hr_zone_anaerobic", pct: [80, 90]  as [number,number], color: "#f59e0b", bg: "#1c0f00" },
  { key: "int_hr_zone_max",       pct: [90, 100] as [number,number], color: "#ef4444", bg: "#2d0a0a" },
];

export function HRCalculator() {
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
            <button onClick={reset}
              className="px-4 py-3 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
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
                <p className="text-2xl font-bold text-white">
                  {maxHR} <span className="text-sm font-normal text-white/40">{t("int_hr_bpm")}</span>
                </p>
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
