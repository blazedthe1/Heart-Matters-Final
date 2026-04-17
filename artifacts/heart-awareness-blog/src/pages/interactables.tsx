import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartExplorerModal } from "@/components/HeartExplorer";
import { useLanguage } from "@/contexts/LanguageContext";
import { HeartDefenderModal } from "@/components/interactables/HeartDefender";
import { HRCalculator } from "@/components/interactables/HRCalculator";
import { CPRGameModal } from "@/components/interactables/CPRGame";

export default function Interactables() {
  const [gameOpen, setGameOpen]     = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [cprOpen, setCprOpen]       = useState(false);
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

          {/* Heart Explorer — featured, spans 2 cols + 2 rows */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="md:col-span-2 lg:row-span-2">
            <button
              onClick={() => setExplorerOpen(true)}
              className="group w-full h-full min-h-[280px] rounded-2xl p-6 flex flex-col cursor-pointer transition-all text-left overflow-hidden relative"
              style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(79,70,229,0.14)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(79,70,229,0.08)")}
            >
              <div className="flex items-start justify-between gap-4 relative z-10">
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

              {/* Anatomy preview illustration */}
              <div className="flex-1 flex items-end justify-center pt-4 relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.025, 1] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="relative"
                >
                  <svg width="260" height="200" viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-70">
                    {/* Outer heart shape */}
                    <path d="M130 185 C90 162, 20 130, 12 78 C8 50, 22 22, 50 18 C68 14, 90 24, 105 44 C112 34, 122 18, 130 14 C138 18, 148 34, 155 44 C170 24, 192 14, 210 18 C238 22, 252 50, 248 78 C240 130, 170 162, 130 185Z" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" fill="rgba(79,70,229,0.07)" />
                    {/* Septum divider */}
                    <line x1="130" y1="38" x2="130" y2="158" stroke="rgba(129,140,248,0.25)" strokeWidth="1" strokeDasharray="4 3" />
                    <line x1="72" y1="100" x2="188" y2="100" stroke="rgba(129,140,248,0.2)" strokeWidth="1" strokeDasharray="4 3" />
                    {/* Left Atrium */}
                    <ellipse cx="90" cy="68" rx="30" ry="24" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" fill="rgba(99,102,241,0.1)" />
                    {/* Right Atrium */}
                    <ellipse cx="170" cy="68" rx="30" ry="24" stroke="rgba(167,139,250,0.55)" strokeWidth="1.2" fill="rgba(99,102,241,0.1)" />
                    {/* Left Ventricle */}
                    <path d="M62 100 Q68 138, 130 175 Q118 138, 118 100 Z" stroke="rgba(129,140,248,0.55)" strokeWidth="1.2" fill="rgba(79,70,229,0.13)" />
                    {/* Right Ventricle */}
                    <path d="M198 100 Q192 138, 130 175 Q142 138, 142 100 Z" stroke="rgba(129,140,248,0.55)" strokeWidth="1.2" fill="rgba(79,70,229,0.13)" />
                    {/* Aortic arch */}
                    <path d="M105 52 C98 28, 80 15, 95 10 C112 5, 128 20, 130 38" stroke="rgba(167,139,250,0.7)" strokeWidth="2" fill="none" />
                    {/* Pulmonary artery */}
                    <path d="M155 52 C162 28, 180 15, 165 10 C148 5, 132 20, 130 38" stroke="rgba(129,140,248,0.5)" strokeWidth="1.5" fill="none" />
                    {/* Atrioventricular valves - small circles */}
                    <circle cx="90" cy="100" r="5" stroke="rgba(167,139,250,0.6)" strokeWidth="1" fill="rgba(99,102,241,0.2)" />
                    <circle cx="170" cy="100" r="5" stroke="rgba(167,139,250,0.6)" strokeWidth="1" fill="rgba(99,102,241,0.2)" />
                    {/* Labels */}
                    <text x="62" y="63" fill="rgba(167,139,250,0.75)" fontSize="9" fontFamily="Outfit, sans-serif" fontWeight="600">LA</text>
                    <text x="174" y="63" fill="rgba(167,139,250,0.75)" fontSize="9" fontFamily="Outfit, sans-serif" fontWeight="600">RA</text>
                    <text x="72" y="140" fill="rgba(129,140,248,0.65)" fontSize="9" fontFamily="Outfit, sans-serif" fontWeight="600">LV</text>
                    <text x="172" y="140" fill="rgba(129,140,248,0.65)" fontSize="9" fontFamily="Outfit, sans-serif" fontWeight="600">RV</text>
                    <text x="82" y="9" fill="rgba(196,181,253,0.65)" fontSize="8" fontFamily="Outfit, sans-serif">Aorta</text>
                    <text x="148" y="9" fill="rgba(167,139,250,0.55)" fontSize="8" fontFamily="Outfit, sans-serif">PA</text>
                    {/* Glow radial behind heart */}
                    <ellipse cx="130" cy="100" rx="90" ry="70" fill="url(#heartGlow)" />
                    <defs>
                      <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(99,102,241,0.08)" />
                        <stop offset="100%" stopColor="rgba(99,102,241,0)" />
                      </radialGradient>
                    </defs>
                  </svg>
                  {/* Floating chamber dots */}
                  {[
                    { cx: 90, cy: 68, delay: 0 },
                    { cx: 170, cy: 68, delay: 0.3 },
                    { cx: 88, cy: 132, delay: 0.6 },
                    { cx: 172, cy: 132, delay: 0.9 },
                  ].map((dot, i) => (
                    <motion.div
                      key={i}
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.2, delay: dot.delay, ease: "easeInOut" }}
                      className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400"
                      style={{ left: dot.cx - 3, top: dot.cy - 3 }}
                    />
                  ))}
                </motion.div>
              </div>
            </button>
          </motion.div>

          {/* Heart Defender */}
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

          {/* HR Calculator */}
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

          {/* CPR Game */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="md:col-span-2 lg:col-span-1">
            <button
              onClick={() => setCprOpen(true)}
              className="group w-full rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition-all text-left min-h-[220px]"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(34,197,94,0.12)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(34,197,94,0.06)")}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)" }}>
                <span className="text-2xl">🫀</span>
              </div>
              <div className="mt-4">
                <p className="text-[10px] uppercase tracking-widest text-green-400 font-medium mb-1">Interactive Guide</p>
                <h3 className="text-lg font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>CPR Training</h3>
                <p className="text-xs text-white/35 mt-1">Step through a real CPR scenario — check the scene, call for help, and practice compressions at the right pace.</p>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-4 py-2 rounded-xl text-xs font-semibold text-green-300 group-hover:bg-green-900/60 transition-colors" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>
                  Start Training →
                </span>
              </div>
            </button>
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
      <AnimatePresence>{cprOpen && <CPRGameModal onClose={() => setCprOpen(false)} />}</AnimatePresence>
    </div>
  );
}
