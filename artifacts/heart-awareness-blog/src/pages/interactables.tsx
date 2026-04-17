import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartExplorerModal } from "@/components/HeartExplorer";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeartDefenderModal } from "@/components/interactables/HeartDefender";
import { HRCalculator } from "@/components/interactables/HRCalculator";

const IDEAS = [
  "CPR step-by-step guide",
  "Heart sound player",
  "Lifestyle impact sliders",
  "Symptom warning cards",
  "Blood pressure coach",
  "Healthy meal builder",
];

export default function Interactables() {
  const [gameOpen, setGameOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="min-h-screen font-['Outfit',sans-serif]" style={{ background: "#0f0c0c" }}>
      <div className="pt-16 pb-10 px-6 relative overflow-hidden text-center">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(180,20,20,0.18), transparent 65%)" }} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">{t("int_page_badge")}</p>
          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("int_page_title")}</h1>
          <p className="text-sm text-white/40 max-w-md mx-auto leading-relaxed">{t("int_page_learn")}</p>
        </motion.div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent mx-8" />

      <div className="py-12 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="md:col-span-2 lg:row-span-2">
            <button
              onClick={() => setExplorerOpen(true)}
              className="group w-full h-full min-h-[280px] rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all text-left"
              style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(79,70,229,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(79,70,229,0.08)")}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(79,70,229,0.2)", border: "1px solid rgba(79,70,229,0.35)" }}>
                    <span className="text-3xl">🔬</span>
                  </div>
                  <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-medium mb-2">3D Anatomy</p>
                  <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("int_explorer_name")}</h2>
                  <p className="text-sm text-white/40 leading-relaxed max-w-md">{t("int_explorer_desc")}</p>
                </div>
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-300 group-hover:bg-indigo-800/60 transition-colors flex-shrink-0" style={{ background: "rgba(79,70,229,0.2)" }}>{t("int_explorer_cta")} →</span>
              </div>
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <button
              onClick={() => setGameOpen(true)}
              className="group w-full rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all text-left min-h-[220px]"
              style={{ background: "rgba(185,28,28,0.08)", border: "1px solid rgba(185,28,28,0.2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(185,28,28,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(185,28,28,0.08)")}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.35)" }}>
                <span className="text-2xl">❤️</span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-red-400 font-medium mb-1">Game</p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("int_game_name")}</h3>
                <p className="text-xs text-white/35 mt-1">{t("int_game_desc")}</p>
              </div>
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <div className="rounded-2xl overflow-hidden min-h-[220px]" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
              <div className="px-6 pt-6 pb-2 flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-amber-400 font-medium mb-1">Calculator</p>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{t("int_hr_title")}</h3>
                  <p className="text-xs text-white/35 mt-0.5">{t("int_hr_desc")}</p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ml-3" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                  <span className="text-xl">💓</span>
                </div>
              </div>
              <div className="px-4 pb-5">
                <HRCalculator />
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="md:col-span-2 lg:col-span-1">
            <div className="rounded-2xl min-h-[220px] bg-white/5 border border-white/10 p-6 flex flex-col justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/35 font-medium mb-2">CPR guide</p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CPR step-by-step</h3>
                <p className="text-xs text-white/35 mt-2 leading-relaxed">A guided flow that walks users through CPR and AED basics one step at a time.</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  "Check responsiveness",
                  "Call emergency help",
                  "Start compressions",
                  "Use AED when ready",
                ].map(step => (
                  <div key={step} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[11px] text-white/70">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="md:col-span-2 lg:col-span-3">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/35 font-medium mb-2">Interactable ideas</p>
                  <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Pick the next one</h3>
                  <p className="text-xs text-white/35 mt-2 leading-relaxed">Here are all the ideas we can turn into the same rectangular card style.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {IDEAS.map((idea) => (
                  <div key={idea} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                    {idea}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-6">
          <div className="rounded-2xl bg-amber-950/30 border border-amber-700/25 px-5 py-3.5 flex items-start gap-2.5">
            <span className="text-sm mt-0.5">⚠️</span>
            <p className="text-xs text-amber-200/50 leading-relaxed">{t("int_disclaimer")}</p>
          </div>
        </div>
      </div>

      <AnimatePresence>{gameOpen && <HeartDefenderModal onClose={() => setGameOpen(false)} />}</AnimatePresence>
      <AnimatePresence>{explorerOpen && <HeartExplorerModal onClose={() => setExplorerOpen(false)} />}</AnimatePresence>
    </div>
  );
}
