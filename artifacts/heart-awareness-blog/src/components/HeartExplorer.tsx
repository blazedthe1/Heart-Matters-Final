import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Info, Droplet, Heart, ChevronRight } from "lucide-react";
import { HeartPartId, HeartPart, heartParts } from "@/data/heart-parts";

const heartImgSrc = `${import.meta.env.BASE_URL}heart-hd.png`;

// Image is 1456×816. Heart occupies the center of the frame.
// ViewBox crops to the heart region with a little padding.
const HEART_VIEWBOX = "330 0 770 816";
const CONTAINER_RATIO = "770 / 816";

const RENDER_ORDER: HeartPartId[] = [
  "right-ventricle", "left-ventricle",
  "right-atrium", "left-atrium",
  "septum", "aorta", "pulmonary-artery",
  "superior-vena-cava", "inferior-vena-cava",
  "pulmonary-veins", "tricuspid-valve",
  "mitral-valve", "pulmonary-valve", "aortic-valve",
];

const TYPE_META: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  Chamber:   { icon: <Heart className="w-3 h-3" />,     color: "#f87171", bg: "rgba(239,68,68,0.1)",   border: "rgba(239,68,68,0.25)" },
  Valve:     { icon: <Activity className="w-3 h-3" />,  color: "#fb923c", bg: "rgba(251,146,60,0.1)",  border: "rgba(251,146,60,0.25)" },
  Vessel:    { icon: <Droplet className="w-3 h-3" />,   color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.25)" },
  Structure: { icon: <Info className="w-3 h-3" />,      color: "#a78bfa", bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.25)" },
};

// All paths remapped from original 1920×1080 SVG space → 1456×816 image space
// Scale factors: x * (1456/1920) = x * 0.7583, y * (816/1080) = y * 0.7556
const regionPaths: Partial<Record<HeartPartId, string>> = {
  "right-atrium":      "M 529 54 C 499 79 479 140 472 223 C 469 283 469 336 470 384 L 689 385 C 686 336 681 283 671 225 C 660 162 641 115 613 82 C 590 57 563 47 538 48 Z",
  "left-atrium":       "M 698 51 C 734 59 795 85 855 140 C 901 181 931 238 944 302 L 946 385 L 692 385 C 689 336 682 283 676 225 C 669 166 655 117 639 83 C 682 60 698 51 698 51 Z",
  "right-ventricle":   "M 470 385 C 469 446 469 518 472 589 C 478 657 494 716 525 753 C 552 777 590 787 637 786 C 664 784 686 783 705 783 C 704 718 699 646 696 574 C 694 505 692 440 690 385 L 470 385 Z",
  "left-ventricle":    "M 692 385 L 946 385 C 946 452 945 527 939 601 C 929 665 906 722 868 757 C 833 784 789 793 742 792 C 724 787 713 784 705 783 C 702 718 698 648 696 576 C 694 505 692 440 692 385 Z",
  "septum":            "M 689 382 C 692 374 702 374 705 382 L 709 783 C 705 787 701 786 698 783 L 689 382 Z",
  "tricuspid-valve":   "M 476 382 C 516 364 585 360 651 369 C 676 373 689 381 689 388 C 651 396 582 399 517 390 C 493 385 478 384 476 382 Z",
  "mitral-valve":      "M 692 382 C 734 364 815 360 891 370 C 921 376 940 384 940 391 C 901 400 817 403 737 394 C 705 388 692 385 692 382 Z",
  "pulmonary-valve":   "M 531 296 C 550 280 576 274 607 283 C 628 291 639 304 635 316 C 614 326 582 326 557 316 C 540 308 531 301 531 296 Z",
  "aortic-valve":      "M 641 278 C 658 263 687 258 714 270 C 732 280 737 293 730 304 C 709 316 679 314 658 302 C 645 295 641 286 641 278 Z",
  "aorta":             "M 639 18 L 719 18 C 720 60 720 117 719 181 C 717 223 714 257 711 281 L 641 281 C 639 257 637 223 637 181 C 635 117 635 60 639 18 Z",
  "pulmonary-artery":  "M 531 79 C 538 57 560 39 588 36 C 616 33 643 45 658 66 C 669 82 671 102 666 119 L 643 122 C 646 110 643 94 635 83 C 620 66 598 59 575 62 C 555 65 542 79 538 100 L 525 97 C 526 89 529 83 531 79 Z",
  "superior-vena-cava":"M 760 18 C 761 14 802 14 804 18 L 805 187 C 805 195 758 195 758 187 L 760 18 Z",
  "inferior-vena-cava":"M 620 712 C 622 706 654 706 655 712 L 657 787 C 657 793 620 793 620 787 L 620 712 Z",
  "pulmonary-veins":   "M 925 243 L 972 240 L 974 268 L 927 272 L 927 295 L 972 292 L 972 319 L 925 322 Z",
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ── Heart SVG ── */
function HeartSVG({ hoveredPart, selectedPart, onHover, onClick, showOutlines }: {
  hoveredPart: HeartPartId | null;
  selectedPart: HeartPartId | null;
  showOutlines: boolean;
  onHover: (id: HeartPartId | null) => void;
  onClick: (id: HeartPartId | null) => void;
}) {
  return (
    <div
      className="select-none relative"
      style={{
        width: "100%",
        maxWidth: "min(75vh, 380px)",
        aspectRatio: CONTAINER_RATIO,
        margin: "0 auto",
      }}
      onClick={() => onClick(null)}
    >
      {/* Outline layer */}
      {showOutlines && (
        <svg
          viewBox={HEART_VIEWBOX}
          className="w-full h-full"
          style={{ display: "block", position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          {RENDER_ORDER.map((id) => {
            const p = regionPaths[id];
            if (!p) return null;
            const part = heartParts[id];
            const isActive = hoveredPart === id || selectedPart === id;
            if (isActive) return null;
            const outlineColor = TYPE_META[part.type]?.color ?? "#ffffff";
            return (
              <path
                key={`outline-${id}`}
                d={p}
                fill={hexToRgba(part.hoverColor, 0.03)}
                stroke={outlineColor}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeDasharray="8 5"
                opacity={0.2}
                style={{ transition: "opacity 0.2s ease" }}
              />
            );
          })}
        </svg>
      )}

      {/* Main SVG */}
      <svg
        viewBox={HEART_VIEWBOX}
        className="w-full h-full"
        style={{ display: "block" }}
      >
        {/* Render image at full 1456×816 — viewBox handles the crop */}
        <image
          href={heartImgSrc}
          x="0"
          y="0"
          width="1456"
          height="816"
          preserveAspectRatio="xMidYMid meet"
        />

        {RENDER_ORDER.map((id) => {
          const path = regionPaths[id];
          if (!path) return null;
          const part = heartParts[id];
          const isHovered = hoveredPart === id;
          const isSelected = selectedPart === id;
          const isActive = isHovered || isSelected;
          const isDeemphasized = selectedPart !== null && !isActive;
          return (
            <path
              key={id}
              d={path}
              fill={isActive ? hexToRgba(part.hoverColor, 0.38) : "transparent"}
              stroke={isActive ? part.hoverColor : "transparent"}
              strokeWidth={isActive ? 2.5 : 0}
              strokeLinejoin="round"
              opacity={isDeemphasized ? 0.08 : 1}
              style={{ cursor: "pointer", transition: "fill 0.15s ease, stroke 0.15s ease, opacity 0.25s ease" }}
              onMouseEnter={() => onHover(id)}
              onMouseLeave={() => onHover(null)}
              onClick={(e) => { e.stopPropagation(); onClick(selectedPart === id ? null : id); }}
            />
          );
        })}
      </svg>
    </div>
  );
}

/* ── Part Detail Panel ── */
function PartDetail({ part, onClose }: { part: HeartPart; onClose: () => void }) {
  const meta = TYPE_META[part.type] ?? TYPE_META.Structure;

  return (
    <motion.div
      key={part.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", damping: 30, stiffness: 260 }}
      className="flex flex-col h-full"
    >
      {/* Color bar */}
      <div className="h-0.5 w-full flex-shrink-0" style={{
        background: `linear-gradient(to right, ${part.hoverColor}, ${part.color}44, transparent)`
      }} />

      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md mb-2.5"
              style={{ background: meta.bg, border: `1px solid ${meta.border}` }}>
              <span style={{ color: meta.color }}>{meta.icon}</span>
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: meta.color }}>
                {part.type}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-white leading-tight"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                textShadow: `0 0 30px ${part.hoverColor}55`
              }}>
              {part.name}
            </h3>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer flex-shrink-0 mt-1"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
            <X className="w-3.5 h-3.5 text-white/50" />
          </button>
        </div>

        <p className="text-sm leading-relaxed mt-3" style={{ color: "rgba(255,255,255,0.65)" }}>
          {part.shortDescription}
        </p>
      </div>

      <div className="mx-5 h-px flex-shrink-0" style={{ background: "rgba(255,255,255,0.05)" }} />

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 min-h-0"
        style={{ scrollbarWidth: "none" }}>
        <div>
          {part.longDescription.split("\n\n").map((para, i) => (
            <p key={i} className="text-xs leading-relaxed mb-2" style={{ color: "rgba(255,255,255,0.38)" }}>
              {para}
            </p>
          ))}
        </div>

        <div className="rounded-xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="px-4 pt-3 pb-2 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <Activity className="w-3 h-3" style={{ color: part.hoverColor }} />
            <span className="text-[9px] font-bold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.3)" }}>Fast Facts</span>
          </div>
          <ul className="px-4 py-3 flex flex-col gap-3">
            {part.fastFacts.map((fact, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center mt-0.5"
                  style={{ background: hexToRgba(part.hoverColor, 0.15), border: `1px solid ${hexToRgba(part.hoverColor, 0.3)}` }}>
                  <span className="text-[8px] font-bold" style={{ color: part.hoverColor }}>{i + 1}</span>
                </div>
                <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>{fact}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Idle Panel ── */
function IdlePanel() {
  return (
    <motion.div
      key="idle"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-10 text-center"
    >
      <div className="relative">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 rounded-full"
          style={{ background: "rgba(239,68,68,0.3)" }}
        />
        <div className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
          style={{ background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.25)" }}>
          🫀
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-white/60 mb-1">Select a region</p>
        <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: "rgba(255,255,255,0.25)" }}>
          Click any highlighted area on the heart to explore its anatomy and function.
        </p>
      </div>

      <div className="flex items-center gap-2 mt-2">
        <div className="h-px w-8" style={{ background: "rgba(255,255,255,0.08)" }} />
        <span className="text-[10px] tabular-nums" style={{ color: "rgba(255,255,255,0.2)" }}>
          {RENDER_ORDER.length} regions to explore
        </span>
        <div className="h-px w-8" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
    </motion.div>
  );
}

/* ── Main Modal ── */
export function HeartExplorerModal({ onClose }: { onClose: () => void }) {
  const [hoveredPart, setHoveredPart] = useState<HeartPartId | null>(null);
  const [selectedPart, setSelectedPart] = useState<HeartPartId | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const filterType = null;
  const showOutlines = true;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.94)" }}
      onClick={onClose}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 12 }}
        transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-4xl rounded-2xl flex flex-col md:flex-row"
        style={{
          background: "#0b0808",
          border: "1px solid rgba(255,255,255,0.07)",
          maxHeight: "min(680px, calc(100vh - 32px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Left panel: Heart visualization ── */}
        <div className="flex flex-col md:w-[58%] flex-shrink-0">

          {/* Header */}
          <div className="px-6 pt-5 pb-4 flex items-start justify-between flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                <span className="text-[9px] tracking-[0.2em] uppercase font-bold"
                  style={{ color: "rgba(255,255,255,0.3)" }}>Cardiac Anatomy</span>
              </div>
              <h2 className="text-2xl font-bold text-white leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", letterSpacing: "-0.01em" }}>
                Heart Explorer
              </h2>
            </div>
            <button onClick={onClose}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-xl transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}>
              <X className="w-4 h-4 text-white/50" />
            </button>
            <button onClick={onClose}
              className="md:hidden flex w-8 h-8 items-center justify-center rounded-xl transition-all cursor-pointer"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <X className="w-4 h-4 text-white/50" />
            </button>
          </div>

          {/* Heart */}
          <div className="flex-1 flex items-center justify-center px-2 py-2">
            <HeartSVG
              hoveredPart={hoveredPart}
              selectedPart={selectedPart}
              showOutlines={showOutlines}
              onHover={setHoveredPart}
              onClick={setSelectedPart}
            />
          </div>

        </div>

        {/* ── Right panel: Detail ── */}
        <div
          className="md:w-[42%] flex flex-col"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.05)",
            borderLeft: "1px solid rgba(255,255,255,0.05)",
            minHeight: "280px",
            maxHeight: "calc(100vh - 80px)",
            background: "rgba(255,255,255,0.015)",
          }}
        >
          <AnimatePresence mode="wait">
            {selectedPart
              ? <PartDetail key={selectedPart} part={heartParts[selectedPart]} onClose={() => setSelectedPart(null)} />
              : <IdlePanel key="idle" />
            }
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Hover tooltip ── */}
      <AnimatePresence>
        {hoveredPart && !selectedPart && (
          <motion.div
            key={hoveredPart}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 4 }}
            transition={{ duration: 0.1 }}
            className="fixed pointer-events-none z-[60] rounded-xl max-w-[230px] overflow-hidden"
            style={{
              left: mousePos.x + 14,
              top: mousePos.y + 14,
              background: "rgba(10,8,8,0.97)",
              border: `1px solid rgba(255,255,255,0.08)`,
              borderLeft: `3px solid ${heartParts[hoveredPart].hoverColor}`,
            }}
          >
            <div className="px-3.5 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-bold text-white leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {heartParts[hoveredPart].name}
                </span>
                {(() => {
                  const meta = TYPE_META[heartParts[hoveredPart].type];
                  return (
                    <span className="text-[8px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-md flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}>
                      {heartParts[hoveredPart].type}
                    </span>
                  );
                })()}
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                {heartParts[hoveredPart].shortDescription}
              </p>
              <div className="flex items-center gap-1 mt-2" style={{ color: heartParts[hoveredPart].hoverColor + "99" }}>
                <span className="text-[9px] font-medium">Click to explore</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
