import { ReactNode, useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useLocation } from "wouter";
import { ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const tickerItems = [
  "Student-Led Initiative",
  "Cardiovascular Health",
  "Community First",
  "Know Your Risk",
  "Heart Disease Awareness",
  "Prevention Through Education",
  "Rajagiri Public School",
  "Empowering Young Hearts",
];

function Ticker() {
  const repeated = [...tickerItems, ...tickerItems];
  return (
    <div className="bg-red-700 text-white overflow-hidden py-2 select-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-xs font-semibold tracking-widest uppercase">
            {item}
            <span className="w-1 h-1 rounded-full bg-red-300 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

function BackToTop() {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.22 }}
          onClick={scrollToTop}
          title={t("back_to_top")}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-full shadow-lg cursor-pointer transition-all group"
          style={{
            background: "rgba(15,12,12,0.88)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(185,28,28,0.92)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(15,12,12,0.88)"; }}
        >
          <ChevronUp className="w-4 h-4 text-white/70 group-hover:text-white transition-colors" />
          <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors hidden sm:inline">
            {t("back_to_top")}
          </span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <Ticker />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
      <BackToTop />
    </div>
  );
}
