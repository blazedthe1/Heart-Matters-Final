import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BP_CATEGORIES = [
  { key: "int_bp_normal",   descKey: "int_bp_normal_desc",   color: "#22c55e", icon: "✅" },
  { key: "int_bp_elevated", descKey: "int_bp_elevated_desc", color: "#f59e0b", icon: "⚠️" },
  { key: "int_bp_high1",    descKey: "int_bp_high1_desc",    color: "#f97316", icon: "🔶" },
  { key: "int_bp_high2",    descKey: "int_bp_high2_desc",    color: "#ef4444", icon: "🔴" },
  { key: "int_bp_crisis",   descKey: "int_bp_crisis_desc",   color: "#dc2626", icon: "🚨" },
] as const;

function getBPCategory(sys: number, dia: number): typeof BP_CATEGORIES[number] {
  if (sys < 120 && dia < 80)   return BP_CATEGORIES[0];
  if (sys <= 129 && dia < 80)  return BP_CATEGORIES[1];
  if (sys <= 139 || dia <= 89) return BP_CATEGORIES[2];
  if (sys <= 179 || dia <= 119) return BP_CATEGORIES[3];
  return BP_CATEGORIES[4];
}

export function BPChecker() {
  const { t } = useLanguage();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [result, setResult] = useState<typeof BP_CATEGORIES[number] | null>(null);
  const [error, setError] = useState("");

  const check = () => {
    const s = parseInt(sys), d = parseInt(dia);
    if (isNaN(s) || isNaN(d) || s < 60 || s > 250 || d < 40 || d > 150) {
      setError("Please enter valid readings (systolic 60–250, diastolic 40–150).");
      setResult(null);
      return;
    }
    setError("");
    setResult(getBPCategory(s, d));
  };

  const reset = () => { setSys(""); setDia(""); setResult(null); setError(""); };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: t("int_bp_systolic"),  val: sys, set: setSys, ph: "e.g. 120" },
          { label: t("int_bp_diastolic"), val: dia, set: setDia, ph: "e.g. 80"  },
        ].map(({ label, val, set, ph }) => (
          <div key={label}>
            <label className="block text-[11px] uppercase tracking-widest text-white/40 mb-2 font-medium">{label}</label>
            <input
              type="number" value={val} placeholder={ph}
              onChange={e => set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && check()}
              className="w-full rounded-xl px-4 py-3 text-white text-lg font-semibold outline-none transition-all"
              style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(239,68,68,0.6)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)")}
            />
          </div>
        ))}
      </div>

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
          <button onClick={reset}
            className="px-4 py-3 rounded-xl text-white/50 hover:text-white transition-colors cursor-pointer"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-xs bg-red-950/40 border border-red-800/40 rounded-lg px-4 py-2">{error}</p>
      )}

      <AnimatePresence>
        {result && (
          <motion.div
            key={result.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl px-5 py-4 space-y-2"
            style={{ background: `${result.color}14`, border: `1px solid ${result.color}40` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.icon}</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: result.color }}>
                  {sys}/{dia} mmHg
                </p>
                <p className="text-lg font-bold text-white">{t(result.key)}</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{t(result.descKey)}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-xl overflow-hidden border border-white/[0.06]">
        <div className="px-4 py-2.5 bg-white/[0.04] border-b border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Reference Chart</p>
        </div>
        {[
          { icon: "✅", label: "Normal",               range: "< 120 / < 80",    color: "#22c55e" },
          { icon: "⚠️", label: "Elevated",             range: "120–129 / < 80",  color: "#f59e0b" },
          { icon: "🔶", label: "High — Stage 1",       range: "130–139 / 80–89", color: "#f97316" },
          { icon: "🔴", label: "High — Stage 2",       range: "140–179 / 90–119",color: "#ef4444" },
          { icon: "🚨", label: "Hypertensive Crisis",  range: "180+ / 120+",     color: "#dc2626" },
        ].map(row => (
          <div key={row.label} className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0">
            <div className="flex items-center gap-2.5">
              <span className="text-sm">{row.icon}</span>
              <span className="text-xs font-medium" style={{ color: row.color }}>{row.label}</span>
            </div>
            <span className="text-[11px] text-white/30 font-mono">{row.range}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
