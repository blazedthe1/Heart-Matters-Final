import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, Copy, Check } from "lucide-react";
import { ECGMonitor } from "@/components/ECGMonitor";
import { getPublishedArticles, type Article } from "@/hooks/useArticles";
import { useLanguage } from "@/contexts/LanguageContext";

const EDITORS = [
  { name: "Mishal Mohamed", email: "mishal.nediyodath@gmail.com" },
  { name: "Alby Anish", email: "gallantyoungman@gmail.com" },
];


function CopyEmailButton({ email, copyLabel, copiedLabel }: { email: string; copyLabel: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
      style={{ background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)", color: copied ? "#4ade80" : "rgba(255,255,255,0.5)" }}
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? copiedLabel : copyLabel}
    </button>
  );
}

export default function Home() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const { t } = useLanguage();

  useEffect(() => {
    setLatestArticles(getPublishedArticles().slice(0, 3));
  }, []);

  return (
    <div className="flex flex-col w-full font-['Outfit',sans-serif]">

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="grid md:grid-cols-2 min-h-[92vh]">

        {/* Left — text */}
        <div className="flex flex-col justify-center px-10 py-24 lg:px-16 bg-[#faf8f5]">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 text-xs font-medium tracking-widest uppercase px-4 py-1.5 rounded-full mb-8 w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
              {t("hero_badge")}
            </div>

            <h1
              className="text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-[#0f0c0c] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {t("hero_title1")}{" "}
              <em className="text-red-700 not-italic">{t("hero_title2")}</em>
              <br />{t("hero_title3")}
            </h1>

            <p className="text-base text-[#8a7070] leading-relaxed max-w-md mb-10 font-light">
              {t("hero_sub")}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/risk-assessment">
                <button className="bg-[#0f0c0c] hover:bg-red-700 transition-colors text-white text-sm font-medium px-8 py-3.5 rounded-full cursor-pointer">
                  {t("hero_cta1")}
                </button>
              </Link>
              <Link href="/articles">
                <button className="bg-transparent hover:border-red-600 hover:text-red-700 transition-colors text-[#0f0c0c] text-sm font-normal border border-[#e8d8d4] px-8 py-3.5 rounded-full cursor-pointer">
                  {t("hero_cta2")}
                </button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Right — ECG dashboard panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative bg-[#0f0c0c] flex flex-col items-center justify-start gap-0 p-8 overflow-y-auto overflow-x-hidden"
        >
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 60% 30%, rgba(192,57,43,0.18), transparent 65%)" }} />
          <ECGMonitor />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="relative z-10 mt-8"
          >
            <Link href="/interactables">
              <button className="group flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.12] hover:border-red-500/50 transition-all duration-300 text-white text-sm font-medium px-6 py-3 rounded-2xl cursor-pointer backdrop-blur-sm">
                <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-700/80 group-hover:bg-red-600 transition-colors">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 01-.657.643 48.39 48.39 0 01-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 01-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 00-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 01-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 00.657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 005.427-.63 48.05 48.05 0 00.582-4.717.532.532 0 00-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.4.959.4v0a.656.656 0 00.658-.663 48.422 48.422 0 00-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 01-.61-.58v0z" />
                  </svg>
                </span>
                <span>Check out our Interactables</span>
                <svg className="w-3.5 h-3.5 text-white/40 group-hover:text-white/70 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────────── */}
      <div className="relative bg-[#0f0c0c] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(180,20,20,0.18), transparent 65%)" }} />

        <div className="relative grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {[
            { num: "17.9M", labelKey: "stats_1_label", tagKey: "stats_1_tag" },
            { num: "80%",   labelKey: "stats_2_label", tagKey: "stats_2_tag" },
            { num: "#1",    labelKey: "stats_3_label", tagKey: "stats_3_tag" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className="relative group py-14 px-10 text-center flex flex-col items-center gap-3"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(180,20,20,0.12), transparent 70%)" }} />
              <div
                className="text-6xl lg:text-7xl font-bold leading-none tracking-tight text-white relative z-10"
                style={{ fontFamily: "'Cormorant Garamond', serif", textShadow: "0 0 60px rgba(220,30,30,0.35)" }}
              >
                <span className="text-red-500">{s.num}</span>
              </div>
              <div className="relative z-10">
                <p className="text-sm text-white/55 leading-relaxed max-w-[200px]">{t(s.labelKey)}</p>
                <p className="text-[11px] text-red-500/70 mt-1.5 tracking-widest uppercase font-medium">{t(s.tagKey)}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
      </div>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="py-24 px-10 lg:px-16 max-w-6xl mx-auto w-full">
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">{t("feat_badge")}</p>
          <h2
            className="text-5xl font-bold text-[#0f0c0c] leading-tight tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("feat_title").split("\n").map((line, i) => (
              <span key={i}>{line}{i === 0 && <br />}</span>
            ))}
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[#e8d8d4]">
          {[
            { num: "01", titleKey: "feat_1_title", descKey: "feat_1_desc" },
            { num: "02", titleKey: "feat_2_title", descKey: "feat_2_desc" },
            { num: "03", titleKey: "feat_3_title", descKey: "feat_3_desc" },
          ].map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-[#faf8f5] hover:bg-[#f5ede8] transition-colors p-10"
            >
              <div
                className="text-4xl font-semibold text-[#e8d8d4] leading-none mb-5"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {f.num}
              </div>
              <h3 className="text-base font-semibold text-[#0f0c0c] mb-2">{t(f.titleKey)}</h3>
              <p className="text-sm text-[#8a7070] leading-relaxed">{t(f.descKey)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── SUBMIT YOUR ARTICLE ───────────────────────────────── */}
      <section className="bg-[#0f0c0c] py-24 px-10 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">

            {/* Left — heading + description */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-4">{t("submit_badge")}</p>
              <h2
                className="text-5xl font-bold text-white leading-tight tracking-tight mb-6"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t("submit_title").split("\n").map((line, i) => (
                  <span key={i}>{line}{i === 0 && <br />}</span>
                ))}
              </h2>
              <p className="text-sm text-white/45 leading-relaxed mb-8">
                {t("submit_sub")}
              </p>

              {/* Guidelines */}
              <div className="border border-white/[0.07] rounded-xl p-5">
                <p className="text-[10px] tracking-widest uppercase text-white/30 mb-3">{t("submit_guidelines_title")}</p>
                <ul className="space-y-2.5">
                  {(["submit_g1","submit_g2","submit_g3","submit_g4"] as const).map((key) => (
                    <li key={key} className="flex items-start gap-2.5 text-[12px] text-white/50 leading-relaxed">
                      <span className="text-red-500 mt-0.5 flex-shrink-0">✦</span>
                      {t(key)}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right — email cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="space-y-4"
            >
              <p className="text-[10px] tracking-widest uppercase text-white/25 mb-4">{t("submit_contact")}</p>

              {EDITORS.map((editor) => (
                <div
                  key={editor.email}
                  className="group rounded-2xl p-5 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(185,28,28,0.2)", border: "1px solid rgba(185,28,28,0.3)" }}
                      >
                        <Mail className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{editor.name}</p>
                        <a
                          href={`mailto:${editor.email}`}
                          className="text-xs text-red-400 hover:text-red-300 transition-colors font-mono"
                        >
                          {editor.email}
                        </a>
                      </div>
                    </div>
                    <CopyEmailButton
                      email={editor.email}
                      copyLabel={t("submit_copy")}
                      copiedLabel={t("submit_copied")}
                    />
                  </div>

                </div>
              ))}

              <p className="text-[11px] text-white/20 text-center pt-2 leading-relaxed">
                We review every submission within 7 days and reply to all authors.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DIVIDER ───────────────────────────────────────────── */}
      <div className="bg-[#0f0c0c] px-10 lg:px-16">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/60 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/[0.08] bg-white/[0.03]">
            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/30 font-medium">Latest from the blog</span>
            <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />
          </div>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-red-900/60 to-transparent" />
        </div>
      </div>

      {/* ─── ARTICLES ──────────────────────────────────────────── */}
      <section className="bg-[#0f0c0c] py-24 px-10 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">{t("blog_badge")}</p>
              <h2
                className="text-5xl font-bold text-white leading-tight tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                {t("blog_title")}
              </h2>
              <p className="text-sm text-white/40 mt-2 max-w-sm leading-relaxed">{t("blog_sub")}</p>
            </div>
            <Link href="/articles">
              <button className="text-sm text-white/40 hover:text-white transition-colors border-b border-white/20 hover:border-white/60 pb-0.5 bg-transparent cursor-pointer whitespace-nowrap">
                {t("blog_view_all")}
              </button>
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <div className="text-center py-20 border border-white/[0.07] rounded-xl">
              <p className="text-white/30 text-sm">{t("blog_empty")}</p>
              <Link href="/articles">
                <button className="mt-4 text-red-400 text-xs hover:text-red-300 transition-colors cursor-pointer bg-transparent border-0">
                  {t("blog_check_back")}
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-px bg-white/10">
              {latestArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <Link href={`/articles/${article.slug}`}>
                    <div className="bg-[#0f0c0c] hover:bg-[#1c1414] transition-colors p-8 cursor-pointer h-full flex flex-col">
                      <p className="text-[10px] tracking-widest uppercase text-red-400 font-medium mb-4">
                        {article.category}
                      </p>
                      <h3
                        className="text-xl font-semibold text-white leading-snug mb-3"
                        style={{ fontFamily: "'Cormorant Garamond', serif" }}
                      >
                        {article.title}
                      </h3>
                      <p className="text-xs text-white/35 leading-relaxed mb-6 flex-1 line-clamp-3">
                        {article.excerpt}
                      </p>
                      <div className="flex justify-between text-[11px] text-white/25 pt-4 border-t border-white/[0.07]">
                        <span>{article.author}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ───────────────────────────────────────────────── */}
      <section className="relative py-32 px-10 text-center bg-[#f5ede8] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-red-100 opacity-60 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-700 font-medium mb-4">{t("cta_badge")}</p>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#0f0c0c] leading-tight tracking-tight mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {t("cta_title1")}<br />{t("cta_title2")}
          </h2>
          <p className="text-base text-[#8a7070] leading-relaxed max-w-md mx-auto mb-10 font-light">
            {t("cta_sub")}
          </p>
          <Link href="/risk-assessment">
            <button className="bg-red-700 hover:bg-[#0f0c0c] transition-colors text-white text-sm font-medium px-10 py-4 rounded-full cursor-pointer">
              {t("cta_btn")}
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ─── DISCLAIMER ────────────────────────────────────────── */}
      <div className="bg-amber-50 border-t-2 border-amber-400 px-10 py-4 flex items-start gap-3">
        <span className="text-base mt-0.5">⚠️</span>
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Medical disclaimer:</strong> {t("disclaimer")}
        </p>
      </div>

    </div>
  );
}
