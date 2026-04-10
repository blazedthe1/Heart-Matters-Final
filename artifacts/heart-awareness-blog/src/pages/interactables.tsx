import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

/* ─── Blood Pressure Checker ─────────────────────────────────────── */

type BPCategory = "normal" | "elevated" | "high1" | "high2" | "crisis";

function classifyBP(sys: number, dia: number): BPCategory {
  if (sys > 180 || dia > 120) return "crisis";
  if (sys >= 140 || dia >= 90) return "high2";
  if (sys >= 130 || dia >= 80) return "high1";
  if (sys >= 120 && dia < 80) return "elevated";
  return "normal";
}

const BP_CONFIG: Record<BPCategory, { colorClass: string; bgClass: string; borderClass: string; dot: string }> = {
  normal:   { colorClass: "text-emerald-400", bgClass: "bg-emerald-950/60",  borderClass: "border-emerald-600/40", dot: "bg-emerald-400" },
  elevated: { colorClass: "text-yellow-400",  bgClass: "bg-yellow-950/60",   borderClass: "border-yellow-600/40",  dot: "bg-yellow-400" },
  high1:    { colorClass: "text-orange-400",  bgClass: "bg-orange-950/60",   borderClass: "border-orange-600/40",  dot: "bg-orange-400" },
  high2:    { colorClass: "text-red-400",     bgClass: "bg-red-950/60",      borderClass: "border-red-600/40",     dot: "bg-red-400"    },
  crisis:   { colorClass: "text-rose-300",    bgClass: "bg-rose-950/80",     borderClass: "border-rose-500/60",    dot: "bg-rose-300"   },
};

function BloodPressureChecker() {
  const { t } = useLanguage();
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");
  const [result, setResult] = useState<BPCategory | null>(null);

  const handleCheck = () => {
    const s = parseInt(sys, 10);
    const d = parseInt(dia, 10);
    if (!isNaN(s) && !isNaN(d) && s > 0 && d > 0) {
      setResult(classifyBP(s, d));
    }
  };

  const cfg = result ? BP_CONFIG[result] : null;
  const labelKey = result ? (`int_bp_${result}` as const) : null;
  const descKey  = result ? (`int_bp_${result}_desc` as const) : null;

  return (
    <ToolCard num="01" titleKey="int_bp_title" descKey="int_bp_desc">
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        {[
          { labelKey: "int_bp_systolic",  value: sys, set: setSys,  placeholder: "120" },
          { labelKey: "int_bp_diastolic", value: dia, set: setDia,  placeholder: "80"  },
        ].map(({ labelKey: lk, value, set, placeholder }) => (
          <div key={lk}>
            <label className="block text-xs text-white/50 mb-1.5 tracking-wide">{t(lk)}</label>
            <input
              type="number"
              min={1}
              max={300}
              value={value}
              onChange={(e) => { set(e.target.value); setResult(null); }}
              placeholder={placeholder}
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-500/60 transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleCheck}
        disabled={!sys || !dia}
        className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium py-3 rounded-xl cursor-pointer"
      >
        {t("int_bp_submit")}
      </button>

      <AnimatePresence>
        {result && cfg && labelKey && descKey && (
          <motion.div
            key={result}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className={`mt-5 rounded-2xl p-5 border ${cfg.bgClass} ${cfg.borderClass}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-2 h-2 rounded-full ${cfg.dot} animate-pulse`} />
              <span className={`text-sm font-bold ${cfg.colorClass}`}>{t(labelKey)}</span>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">{t(descKey)}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolCard>
  );
}

/* ─── Heart Rate Zone Calculator ─────────────────────────────────── */

const HR_ZONES = [
  { key: "int_hr_zone_rest",      pctLow: 50, pctHigh: 60, color: "#60a5fa", track: "bg-blue-500/20",   bar: "bg-blue-500"   },
  { key: "int_hr_zone_fatburn",   pctLow: 60, pctHigh: 70, color: "#34d399", track: "bg-emerald-500/20",bar: "bg-emerald-500"},
  { key: "int_hr_zone_aerobic",   pctLow: 70, pctHigh: 80, color: "#fbbf24", track: "bg-yellow-500/20", bar: "bg-yellow-500" },
  { key: "int_hr_zone_anaerobic", pctLow: 80, pctHigh: 90, color: "#f97316", track: "bg-orange-500/20", bar: "bg-orange-500" },
  { key: "int_hr_zone_max",       pctLow: 90, pctHigh: 100,color: "#f43f5e", track: "bg-rose-500/20",   bar: "bg-rose-500"   },
];

function HeartRateZones() {
  const { t } = useLanguage();
  const [age, setAge] = useState("");
  const [maxHR, setMaxHR] = useState<number | null>(null);

  const handleCalc = () => {
    const a = parseInt(age, 10);
    if (!isNaN(a) && a > 0 && a < 130) setMaxHR(220 - a);
  };

  return (
    <ToolCard num="02" titleKey="int_hr_title" descKey="int_hr_desc">
      <div className="mb-5">
        <label className="block text-xs text-white/50 mb-1.5 tracking-wide">{t("int_hr_age")}</label>
        <input
          type="number"
          min={5}
          max={120}
          value={age}
          onChange={(e) => { setAge(e.target.value); setMaxHR(null); }}
          placeholder="25"
          className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm placeholder-white/20 focus:outline-none focus:border-red-500/60 transition-colors"
        />
      </div>

      <button
        onClick={handleCalc}
        disabled={!age}
        className="w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white text-sm font-medium py-3 rounded-xl cursor-pointer mb-5"
      >
        {t("int_hr_submit")}
      </button>

      <AnimatePresence>
        {maxHR && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5 px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08]">
              <span className="text-xs text-white/50">{t("int_hr_maxrate")}</span>
              <span className="text-lg font-bold text-red-400">{maxHR} <span className="text-xs font-normal text-white/40">{t("int_hr_bpm")}</span></span>
            </div>

            <div className="space-y-3">
              {HR_ZONES.map((zone, i) => {
                const lo = Math.round(maxHR * zone.pctLow / 100);
                const hi = Math.round(maxHR * zone.pctHigh / 100);
                const barW = zone.pctHigh - zone.pctLow; // width relative to 50-100 range
                const barOffset = zone.pctLow - 50;
                return (
                  <motion.div
                    key={zone.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <span className="text-xs font-medium w-20 flex-shrink-0" style={{ color: zone.color }}>
                      {t(zone.key as any)}
                    </span>
                    <div className="flex-1 h-5 rounded-full overflow-hidden bg-white/[0.06] relative">
                      <div
                        className={`absolute top-0 h-full rounded-full ${zone.bar}`}
                        style={{
                          left: `${barOffset * 2}%`,
                          width: `${barW * 2}%`,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <span className="text-xs text-white/50 w-24 text-right flex-shrink-0 font-mono">
                      {lo}–{hi} {t("int_hr_bpm")}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </ToolCard>
  );
}

/* ─── Myth vs. Fact Flip Cards ───────────────────────────────────── */

const MYTHS = [1, 2, 3, 4, 5, 6] as const;

function FlipCard({ num }: { num: number }) {
  const { t } = useLanguage();
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="h-52 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped((v) => !v)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Front — Myth */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border border-white/[0.08]"
          style={{ backfaceVisibility: "hidden", background: "rgba(255,255,255,0.04)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-widest uppercase text-red-400/80 font-semibold px-2.5 py-1 rounded-full bg-red-900/30 border border-red-700/30">
              {t("int_myth_label")}
            </span>
            <span className="text-white/20 text-xs">{String(num).padStart(2, "0")}</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-medium">{t(`int_myth${num}` as any)}</p>
          <p className="text-[10px] text-white/25 tracking-wide">{t("int_tap_to_flip")}</p>
        </div>

        {/* Back — Fact */}
        <div
          className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between border border-emerald-700/30"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "rgba(6,78,59,0.25)",
          }}
        >
          <span className="text-[10px] tracking-widest uppercase text-emerald-400/90 font-semibold px-2.5 py-1 rounded-full bg-emerald-900/40 border border-emerald-700/30 w-fit">
            {t("int_fact_label")}
          </span>
          <p className="text-sm text-white/80 leading-relaxed">{t(`int_fact${num}` as any)}</p>
          <p className="text-[10px] text-emerald-400/40 tracking-wide">{t("int_tap_to_flip")}</p>
        </div>
      </motion.div>
    </div>
  );
}

function MythVsFact() {
  const { t } = useLanguage();
  return (
    <ToolCard num="03" titleKey="int_myth_title" descKey="int_myth_desc">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MYTHS.map((n) => (
          <FlipCard key={n} num={n} />
        ))}
      </div>
    </ToolCard>
  );
}

/* ─── Shared Tool Card wrapper ───────────────────────────────────── */

function ToolCard({
  num, titleKey, descKey, children,
}: {
  num: string; titleKey: string; descKey: string; children: React.ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55 }}
      className="rounded-3xl p-8 border border-white/[0.08]"
      style={{ background: "rgba(255,255,255,0.035)" }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-300"
          style={{ background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.3)" }}
        >
          {num}
        </div>
        <div>
          <h2
            className="text-2xl font-bold text-white leading-tight mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t(titleKey as any)}
          </h2>
          <p className="text-sm text-white/45 leading-relaxed">{t(descKey as any)}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */

export default function Interactables() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-['Outfit',sans-serif]" style={{ background: "#0f0c0c" }}>

      {/* Header */}
      <div className="pt-20 pb-16 px-10 lg:px-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(180,20,20,0.2), transparent 65%)" }}
        />
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-4">{t("int_page_badge")}</p>
            <h1
              className="text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("int_page_title")}
            </h1>
            <p className="text-base text-white/45 max-w-lg mx-auto leading-relaxed font-light">{t("int_page_sub")}</p>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mx-10 lg:mx-16" />

      {/* Tools */}
      <div className="max-w-5xl mx-auto px-10 lg:px-16 py-16 flex flex-col gap-8">
        <BloodPressureChecker />
        <HeartRateZones />
        <MythVsFact />
      </div>

      {/* Disclaimer */}
      <div className="mx-10 lg:mx-16 mb-16 rounded-2xl bg-amber-950/30 border border-amber-700/30 px-6 py-4 flex items-start gap-3">
        <span className="text-base mt-0.5">⚠️</span>
        <p className="text-xs text-amber-200/60 leading-relaxed">
          These tools are for educational purposes only and do not constitute medical advice. Always consult a qualified healthcare provider for diagnosis and treatment.
        </p>
      </div>

    </div>
  );
}
