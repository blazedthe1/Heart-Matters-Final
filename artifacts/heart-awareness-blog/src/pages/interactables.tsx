import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartExplorerModal } from "@/components/HeartExplorer";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeartDefenderModal } from "@/components/interactables/HeartDefender";
import { HRCalculator } from "@/components/interactables/HRCalculator";
import { MythFact } from "@/components/interactables/MythFact";
import { ToolCard } from "@/components/interactables/ToolCard";

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

      <div className="mb-12 max-w-2xl mx-auto px-6">
        <div className="rounded-2xl bg-amber-950/30 border border-amber-700/25 px-5 py-3.5 flex items-start gap-2.5">
          <span className="text-sm mt-0.5">⚠️</span>
          <p className="text-xs text-amber-200/50 leading-relaxed">{t("int_disclaimer")}</p>
        </div>
      </div>

      <AnimatePresence>
        {gameOpen && <HeartDefenderModal onClose={() => setGameOpen(false)} />}
      </AnimatePresence>
      <AnimatePresence>
        {explorerOpen && <HeartExplorerModal onClose={() => setExplorerOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
