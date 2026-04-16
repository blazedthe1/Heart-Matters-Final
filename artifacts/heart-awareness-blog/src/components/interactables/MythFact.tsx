import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

export function MythFact() {
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
                  <motion.div
                    key="myth"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
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
                  <motion.div
                    key="fact"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                  >
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
