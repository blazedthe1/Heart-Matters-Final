import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Info, Droplet } from "lucide-react";
import { HeartPartId, HeartPart, heartParts } from "@/data/heart-parts";

const heartImgSrc = `${import.meta.env.BASE_URL}heart-hd.png`;

const HEART_VIEWBOX = "590 10 690 1060";
const CONTAINER_RATIO = "690 / 1060";

const RENDER_ORDER: HeartPartId[] = [
  "right-ventricle", "left-ventricle",
  "right-atrium", "left-atrium",
  "septum", "aorta", "pulmonary-artery",
  "superior-vena-cava", "inferior-vena-cava",
  "pulmonary-veins", "tricuspid-valve",
  "mitral-valve", "pulmonary-valve", "aortic-valve",
];

const regionPaths: Partial<Record<HeartPartId, string>> = {
  "right-atrium": [
    "M 698 72", "C 658 105 632 185 622 295",
    "C 618 375 618 445 620 508", "L 908 510",
    "C 905 445 898 375 885 298", "C 870 215 845 152 808 108",
    "C 778 75 742 62 710 64", "Z",
  ].join(" "),
  "left-atrium": [
    "M 920 68", "C 968 78 1048 112 1128 185",
    "C 1188 240 1228 315 1245 400", "L 1248 510",
    "L 912 510", "C 908 445 900 375 892 298",
    "C 882 220 864 155 842 110", "C 900 80 920 68 920 68", "Z",
  ].join(" "),
  "right-ventricle": [
    "M 620 510", "C 618 590 618 685 622 780",
    "C 630 870 652 948 692 996", "C 728 1028 778 1042 840 1040",
    "C 875 1038 905 1036 930 1036", "C 928 950 922 855 918 760",
    "C 915 668 912 582 910 510", "L 620 510", "Z",
  ].join(" "),
  "left-ventricle": [
    "M 912 510", "L 1248 510",
    "C 1248 598 1246 698 1238 795", "C 1225 880 1195 955 1145 1002",
    "C 1098 1038 1040 1050 978 1048", "C 955 1042 940 1038 930 1036",
    "C 926 950 920 858 918 762", "C 915 668 912 582 912 510", "Z",
  ].join(" "),
  septum: [
    "M 908 505", "C 912 495 926 495 930 505",
    "L 935 1036", "C 930 1042 925 1040 920 1036",
    "L 908 505", "Z",
  ].join(" "),
  "tricuspid-valve": [
    "M 628 505", "C 680 482 772 476 858 488",
    "C 892 494 908 504 908 514", "C 858 524 768 528 682 516",
    "C 650 510 630 508 628 505", "Z",
  ].join(" "),
  "mitral-valve": [
    "M 912 505", "C 968 482 1075 476 1175 490",
    "C 1215 498 1240 508 1240 518", "C 1188 530 1078 534 972 522",
    "C 930 514 912 510 912 505", "Z",
  ].join(" "),
  "pulmonary-valve": [
    "M 700 392", "C 725 370 760 362 800 375",
    "C 828 385 842 402 838 418", "C 810 432 768 432 735 418",
    "C 712 408 700 398 700 392", "Z",
  ].join(" "),
  "aortic-valve": [
    "M 845 368", "C 868 348 906 342 942 358",
    "C 965 370 972 388 962 402", "C 935 418 895 415 868 400",
    "C 850 390 845 378 845 368", "Z",
  ].join(" "),
  aorta: [
    "M 842 24", "L 948 24",
    "C 950 80 950 155 948 240", "C 946 295 942 340 938 372",
    "L 845 372", "C 842 340 840 295 840 240",
    "C 838 155 838 80 842 24", "Z",
  ].join(" "),
  "pulmonary-artery": [
    "M 700 105", "C 710 75 738 52 775 48",
    "C 812 44 848 60 868 88", "C 882 108 885 135 878 158",
    "L 848 162", "C 852 145 848 125 838 110",
    "C 818 88 788 78 758 82", "C 732 86 715 105 710 132",
    "L 692 128", "C 694 118 698 110 700 105", "Z",
  ].join(" "),
  "superior-vena-cava": [
    "M 1002 24", "C 1004 18 1058 18 1060 24",
    "L 1062 248", "C 1062 258 1000 258 1000 248",
    "L 1002 24", "Z",
  ].join(" "),
  "inferior-vena-cava": [
    "M 818 942", "C 820 935 862 935 864 942",
    "L 866 1042", "C 866 1050 818 1050 818 1042",
    "L 818 942", "Z",
  ].join(" "),
  "pulmonary-veins": [
    "M 1220 322", "L 1282 318", "L 1284 355", "L 1222 360",
    "L 1222 390", "L 1282 386", "L 1282 422", "L 1220 426", "Z",
  ].join(" "),
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function HeartSVG({
  hoveredPart, selectedPart, onHover, onClick,
}: {
  hoveredPart: HeartPartId | null;
  selectedPart: HeartPartId | null;
  onHover: (id: HeartPartId | null) => void;
  onClick: (id: HeartPartId | null) => void;
}) {
  return (
    <div
      className="select-none"
      style={{
        width: "100%",
        maxWidth: "min(80vh, 360px)",
        aspectRatio: CONTAINER_RATIO,
        margin: "0 auto",
        filter: "drop-shadow(0 0 55px rgba(180,20,20,0.30)) drop-shadow(0 16px 48px rgba(0,0,0,0.90))",
      }}
      onClick={() => onClick(null)}
    >
      <svg viewBox={HEART_VIEWBOX} className="w-full h-full" style={{ display: "block", overflow: "visible" }}>
        <image href={heartImgSrc} x="0" y="0" width="1920" height="1080" preserveAspectRatio="none" />
        <defs>
          {RENDER_ORDER.map((id) => {
            const part = heartParts[id];
            return (
              <filter key={`f-${id}`} id={`he-glow-${id}`} x="-40%" y="-40%" width="180%" height="180%">
                <feFlood floodColor={part.hoverColor} floodOpacity="0.9" result="color" />
                <feComposite in="color" in2="SourceGraphic" operator="in" result="tinted" />
                <feGaussianBlur in="tinted" stdDeviation="18" result="outerGlow" />
                <feGaussianBlur in="tinted" stdDeviation="6" result="innerGlow" />
                <feMerge>
                  <feMergeNode in="outerGlow" />
                  <feMergeNode in="innerGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            );
          })}
        </defs>
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
              filter={isActive ? `url(#he-glow-${id})` : undefined}
              opacity={isDeemphasized ? 0 : 1}
              style={{ cursor: "pointer", transition: "fill 0.15s ease, stroke 0.15s ease, opacity 0.2s ease" }}
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

function PartDetail({ part, onClose }: { part: HeartPart; onClose: () => void }) {
  return (
    <motion.div
      key={part.id}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      transition={{ type: "spring", damping: 28, stiffness: 220 }}
      className="flex flex-col h-full"
    >
      <div className="h-1 w-full rounded-t-xl flex-shrink-0" style={{ backgroundColor: part.color }} />
      <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-white/[0.07] flex-shrink-0">
        <div>
          <span className="text-[9px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-1.5 mb-1">
            {part.type === "Chamber" && <Activity className="w-3 h-3" />}
            {(part.type === "Valve" || part.type === "Vessel") && <Droplet className="w-3 h-3" />}
            {part.type === "Structure" && <Info className="w-3 h-3" />}
            {part.type}
          </span>
          <h3 className="text-xl font-bold text-white tracking-tight" style={{ textShadow: `0 0 20px ${part.color}66` }}>
            {part.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.14] transition-colors text-white/50 hover:text-white/80 cursor-pointer flex-shrink-0 mt-0.5"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5 min-h-0">
        <div>
          <p className="text-sm text-white/75 font-medium leading-relaxed mb-2">{part.shortDescription}</p>
          {part.longDescription.split("\n\n").map((para, i) => (
            <p key={i} className="text-xs text-white/45 leading-relaxed mb-2">{para}</p>
          ))}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
          <h4 className="text-[9px] font-bold tracking-widest uppercase text-white/30 flex items-center gap-1.5 mb-3">
            <Activity className="w-3 h-3" />
            Fast Facts
          </h4>
          <ul className="flex flex-col gap-2">
            {part.fastFacts.map((fact, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: part.hoverColor }} />
                <span className="text-xs text-white/55 leading-relaxed">{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

export function HeartExplorerModal({ onClose }: { onClose: () => void }) {
  const [hoveredPart, setHoveredPart] = useState<HeartPartId | null>(null);
  const [selectedPart, setSelectedPart] = useState<HeartPartId | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const activePart = hoveredPart ?? selectedPart;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
      onMouseMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative w-full max-w-4xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
        style={{
          background: "#0d0a0a",
          border: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 0 80px rgba(185,28,28,0.2)",
          maxHeight: "calc(100vh - 32px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.14] transition-colors text-white/50 hover:text-white cursor-pointer md:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-col md:w-[55%] flex-shrink-0">
          <div className="px-6 pt-5 pb-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Heart Explorer
              </h2>
              <p className="text-[10px] tracking-widest uppercase text-white/30 mt-0.5">
                {selectedPart ? "Click elsewhere to deselect" : "Hover · Click to explore"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hidden md:flex w-8 h-8 items-center justify-center rounded-full bg-white/[0.07] hover:bg-white/[0.14] transition-colors text-white/50 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
            <HeartSVG
              hoveredPart={hoveredPart}
              selectedPart={selectedPart}
              onHover={setHoveredPart}
              onClick={setSelectedPart}
            />
          </div>

          <div className="px-6 pb-4 flex flex-wrap gap-x-4 gap-y-1">
            {(["Chamber", "Valve", "Vessel", "Structure"] as const).map((type) => {
              const ex = RENDER_ORDER.find((id) => heartParts[id].type === type);
              const color = ex ? heartParts[ex].hoverColor : "#fff";
              return (
                <div key={type} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">{type}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div
          className="md:w-[45%] border-t md:border-t-0 md:border-l border-white/[0.06] flex flex-col"
          style={{ minHeight: "280px", maxHeight: "calc(100vh - 80px)" }}
        >
          <AnimatePresence mode="wait">
            {selectedPart ? (
              <PartDetail key={selectedPart} part={heartParts[selectedPart]} onClose={() => setSelectedPart(null)} />
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center gap-3 px-6 py-8 text-center"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.3)" }}>
                  <span className="text-2xl">🫀</span>
                </div>
                <p className="text-sm text-white/30 leading-relaxed max-w-[220px]">
                  Click any region on the heart to learn what it does.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <AnimatePresence>
        {hoveredPart && !selectedPart && (
          <motion.div
            key={hoveredPart}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="fixed pointer-events-none z-[60] rounded-xl border border-white/[0.1] px-4 py-3 max-w-[220px]"
            style={{
              left: mousePos.x + 16,
              top: mousePos.y + 16,
              background: "rgba(13,10,10,0.95)",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 20px ${heartParts[hoveredPart].hoverColor}33`,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{heartParts[hoveredPart].name}</span>
              <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full text-white/50"
                style={{ background: hexToRgba(heartParts[hoveredPart].hoverColor, 0.15) }}>
                {heartParts[hoveredPart].type}
              </span>
            </div>
            <p className="text-xs text-white/50 leading-snug">{heartParts[hoveredPart].shortDescription}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
