import { Link, useLocation } from "wouter";
import { Heart, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/articles", label: "Articles" },
  { href: "/risk-assessment", label: "Risk Assessment" },
  { href: "/resources", label: "Resources" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors relative group ${
                  location === link.href
                    ? "text-red-400"
                    : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
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

          <button
            className="md:hidden text-white/70 hover:text-white transition-colors p-1"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
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
              background: "rgba(10,8,8,0.88)",
              backdropFilter: "blur(20px) saturate(160%)",
              WebkitBackdropFilter: "blur(20px) saturate(160%)",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <nav className="flex flex-col divide-y divide-white/[0.06]">
              {navLinks.map(link => (
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
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
