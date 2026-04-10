import { Link, useLocation } from "wouter";
import { Heart, Menu, X, Globe, ChevronDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { LANGUAGES } from "@/data/translations";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { lang, setLang, t } = useLanguage();
  const langRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/", key: "nav_home" },
    { href: "/articles", key: "nav_articles" },
    { href: "/risk-assessment", key: "nav_risk" },
    { href: "/interactables", label: "Interactables" },
    { href: "/resources", key: "nav_resources" },
    { href: "/about", key: "nav_about" },
  ];

  const currentLang = LANGUAGES.find((l) => l.code === lang)!;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-50 w-full transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(15,12,12,0.72)"
            : "rgba(15,12,12,0.55)",
          backdropFilter: "blur(18px) saturate(160%)",
          WebkitBackdropFilter: "blur(18px) saturate(160%)",
          borderBottom: scrolled
            ? "1px solid rgba(255,255,255,0.09)"
            : "1px solid rgba(255,255,255,0.04)",
          boxShadow: scrolled ? "0 2px 32px 0 rgba(0,0,0,0.38)" : "none",
        }}
      >
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <Heart className="h-5 w-5 fill-red-600 text-red-600" />
            <div className="flex flex-col leading-none">
              <span className="font-bold text-base tracking-tight text-white">Heart Matters</span>
              <span className="text-[9px] font-medium tracking-widest text-white/35 uppercase">Rajagiri Public School</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors relative group ${
                  location === link.href
                    ? "text-red-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {"label" in link ? link.label : t(link.key!)}
                {location === link.href && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-px bg-red-500"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen((v) => !v)}
                className="hidden md:flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-white/[0.07] transition-colors cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{currentLang.flag} {currentLang.label}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden z-50"
                    style={{
                      background: "rgba(20,16,16,0.97)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      backdropFilter: "blur(20px)",
                    }}
                  >
                    {LANGUAGES.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => { setLang(l.code); setLangOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs transition-colors cursor-pointer text-left ${
                          lang === l.code
                            ? "bg-red-700/30 text-white"
                            : "text-white/60 hover:text-white hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-base">{l.flag}</span>
                        <span className="font-medium">{l.label}</span>
                        {lang === l.code && <span className="ml-auto text-red-400">✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile burger */}
            <button
              className="md:hidden text-white/70 hover:text-white transition-colors p-1"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-40 md:hidden"
            style={{
              background: "rgba(10,8,8,0.95)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <nav className="flex flex-col divide-y divide-white/[0.06]">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-6 py-4 text-sm font-medium transition-colors ${
                    location === link.href
                      ? "text-red-400 bg-white/[0.03]"
                      : "text-white/60 hover:text-white hover:bg-white/[0.03]"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {"label" in link ? link.label : t(link.key!)}
                </Link>
              ))}
              {/* Language options in mobile menu */}
              <div className="px-4 py-3">
                <p className="text-[10px] uppercase tracking-widest text-white/25 mb-2 px-2">Language</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setMenuOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        lang === l.code
                          ? "bg-red-700/30 text-white"
                          : "text-white/50 hover:text-white hover:bg-white/[0.05]"
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
