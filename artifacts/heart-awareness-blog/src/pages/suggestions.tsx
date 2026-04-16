import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSuggestions } from "@/hooks/useSuggestions";

const EDITORS = [
  { name: "Mishal Mohamed", email: "mishal.nediyodath@gmail.com" },
  { name: "Alby Anish",     email: "gallantyoungman@gmail.com"    },
];

const SUGGESTION_TYPES = [
  "sug_type_content",
  "sug_type_feature",
  "sug_type_bug",
  "sug_type_general",
] as const;

export default function Suggestions() {
  const { t } = useLanguage();
  const { addSuggestion } = useSuggestions();

  const [name, setName]       = useState("");
  const [type, setType]       = useState("sug_type_general");
  const [message, setMessage] = useState("");
  const [sent, setSent]       = useState(false);

  const canSend = name.trim().length > 0 && message.trim().length > 10;

  const handleSend = () => {
    if (!canSend) return;
    addSuggestion(name.trim(), type, message.trim());
    setSent(true);
  };

  const reset = () => {
    setName(""); setType("sug_type_general"); setMessage(""); setSent(false);
  };

  return (
    <div className="min-h-screen font-['Outfit',sans-serif] bg-[#faf8f5]">

      {/* Hero */}
      <section className="bg-[#0f0c0c] py-24 px-10 lg:px-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 60% 30%, rgba(192,57,43,0.14), transparent 65%)" }} />
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
            <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-4">{t("sug_badge")}</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("sug_title").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 && <br />}</span>
              ))}
            </h1>
            <p className="text-base text-white/40 leading-relaxed max-w-lg">{t("sug_sub")}</p>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-red-900/30 to-transparent" />

      <section className="py-20 px-10 lg:px-16">
        <div className="max-w-4xl mx-auto grid md:grid-cols-5 gap-12">

          {/* Form — left 3 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
            className="md:col-span-3 space-y-6"
          >
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-16 flex flex-col items-center gap-4"
                >
                  <CheckCircle2 className="h-14 w-14 text-green-600" />
                  <h2 className="text-2xl font-bold text-[#0f0c0c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Suggestion received!
                  </h2>
                  <p className="text-sm text-[#8a7070] leading-relaxed max-w-xs">
                    Thank you, {name.split(" ")[0]}. The editors can read your suggestion in the admin panel.
                  </p>
                  <button
                    onClick={reset}
                    className="mt-4 text-sm text-red-700 hover:text-red-600 border-b border-red-300 hover:border-red-500 transition-colors bg-transparent cursor-pointer"
                  >
                    Send another →
                  </button>
                </motion.div>
              ) : (
                <motion.div key="form" className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {/* Name */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-2">
                      {t("sug_name_label")}
                    </label>
                    <input
                      type="text"
                      placeholder={t("sug_name_ph")}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full border border-[#e8d8d4] bg-white text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-2">
                      {t("sug_type_label")}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTION_TYPES.map(k => (
                        <button
                          key={k}
                          onClick={() => setType(k)}
                          className="px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                          style={{
                            background: type === k ? "#0f0c0c" : "#f5ede8",
                            color:      type === k ? "#ffffff" : "#8a7070",
                            border:     type === k ? "1px solid #0f0c0c" : "1px solid #e8d8d4",
                          }}
                        >
                          {t(k)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-2">
                      {t("sug_msg_label")}
                    </label>
                    <textarea
                      placeholder={t("sug_msg_ph")}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      rows={6}
                      className="w-full border border-[#e8d8d4] bg-white text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-3 text-sm outline-none focus:border-red-400 transition resize-none"
                    />
                    <p className="text-[10px] text-[#c0a8a8] mt-1.5 text-right">{message.length} chars</p>
                  </div>

                  {/* Send */}
                  <button
                    onClick={handleSend}
                    disabled={!canSend}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-semibold text-sm transition-all"
                    style={{
                      background: canSend ? "#0f0c0c" : "#e8d8d4",
                      color:      canSend ? "#ffffff" : "#c0a8a8",
                      cursor:     canSend ? "pointer" : "not-allowed",
                    }}
                    onMouseEnter={e => { if (canSend) e.currentTarget.style.background = "#b91c1c"; }}
                    onMouseLeave={e => { if (canSend) e.currentTarget.style.background = canSend ? "#0f0c0c" : "#e8d8d4"; }}
                  >
                    <Send className="h-4 w-4" />
                    {t("sug_send")}
                  </button>

                  <p className="text-[11px] text-[#c0a8a8] text-center leading-relaxed">
                    {t("sug_or_email")}:{" "}
                    {EDITORS.map((e, i) => (
                      <span key={e.email}>
                        <a href={`mailto:${e.email}`} className="text-red-600 hover:text-red-700 transition-colors font-mono text-[10px]">
                          {e.email}
                        </a>
                        {i < EDITORS.length - 1 && " · "}
                      </span>
                    ))}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sidebar — right 2 cols */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            className="md:col-span-2 space-y-6"
          >
            <div className="border border-[#e8d8d4] rounded-2xl p-6">
              <p className="text-[10px] uppercase tracking-widest text-[#8a7070] font-medium mb-4">{t("sug_types_title")}</p>
              <ul className="space-y-3">
                {(["sug_cat1","sug_cat2","sug_cat3","sug_cat4"] as const).map(k => (
                  <li key={k} className="flex items-start gap-2.5 text-xs text-[#8a7070] leading-relaxed">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">✦</span>
                    {t(k)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-[#c0a8a8] font-medium px-1">Editors</p>
              {EDITORS.map(editor => (
                <a
                  key={editor.email}
                  href={`mailto:${editor.email}`}
                  className="flex items-center gap-3 rounded-xl p-4 border border-[#e8d8d4] hover:border-red-300 bg-white hover:bg-red-50 transition-all group"
                >
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(185,28,28,0.1)", border: "1px solid rgba(185,28,28,0.2)" }}>
                    <Mail className="h-4 w-4 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#0f0c0c]">{editor.name}</p>
                    <p className="text-[11px] font-mono text-red-600 truncate group-hover:text-red-700 transition-colors">{editor.email}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
