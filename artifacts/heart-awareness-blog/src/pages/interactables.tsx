import { motion } from "framer-motion";
import { Puzzle } from "lucide-react";

export default function Interactables() {
  return (
    <div className="min-h-screen bg-[#faf8f5] font-['Outfit',sans-serif]">

      {/* ─── HEADER ───────────────────────────────────────────── */}
      <div className="bg-[#0f0c0c] pt-20 pb-24 px-10 lg:px-16 relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 110%, rgba(180,20,20,0.2), transparent 65%)" }}
        />
        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-4">Explore</p>
            <h1
              className="text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Interactables
            </h1>
            <p className="text-base text-white/45 max-w-lg mx-auto leading-relaxed font-light">
              Hands-on tools and simulations to help you explore cardiovascular health — see it, feel it, understand it.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── CONTENT ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-10 lg:px-16 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          {/* Empty state illustration */}
          <div className="border-2 border-dashed border-[#e8d8d4] rounded-3xl py-28 px-10 w-full max-w-2xl flex flex-col items-center gap-5">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-2"
              style={{ background: "rgba(185,28,28,0.07)", border: "1px solid rgba(185,28,28,0.15)" }}
            >
              <Puzzle className="w-9 h-9 text-red-300" />
            </div>
            <div>
              <p className="text-xl font-semibold text-[#0f0c0c] mb-2">No interactables yet</p>
              <p className="text-sm text-[#8a7070] max-w-sm leading-relaxed">
                We're building exciting interactive tools — ECG simulators, risk calculators, anatomy explorers and more. Check back soon!
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-700 font-medium">Coming soon</span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
