import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

export interface ToolCardProps {
  icon: string;
  title: string;
  desc: string;
  color: string;
  borderColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function ToolCard({ icon, title, desc, color, borderColor, children, defaultOpen = false }: ToolCardProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <motion.div
      layout
      className="rounded-2xl overflow-hidden w-full"
      style={{ border: `1px solid ${open ? borderColor : "rgba(255,255,255,0.08)"}`, transition: "border-color 0.3s" }}
    >
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-6 py-5 text-left cursor-pointer transition-all"
        style={{ background: open ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)" }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
      >
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
          style={{ background: `${color}22`, border: `1px solid ${color}44` }}>
          {icon}
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-white/35 mt-0.5">{desc}</p>
        </div>
        <div className="text-white/30 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-6 pb-6 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
