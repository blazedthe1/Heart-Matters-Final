import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ECGMonitor } from "@/components/ECGMonitor";
import { getPublishedArticles, type Article } from "@/hooks/useArticles";

export default function Home() {
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);

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
              Student-led CVD Prevention
            </div>

            <h1
              className="text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-[#0f0c0c] mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Listen to the{" "}
              <em className="text-red-700 not-italic">rhythm</em>
              <br />of your life.
            </h1>

            <p className="text-base text-[#8a7070] leading-relaxed max-w-md mb-10 font-light">
              A student-driven platform bringing cardiovascular health education
              to everyone — clear, compassionate, and evidence-based.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link href="/risk-assessment">
                <button className="bg-[#0f0c0c] hover:bg-red-700 transition-colors text-white text-sm font-medium px-8 py-3.5 rounded-full cursor-pointer">
                  Take the Risk Quiz
                </button>
              </Link>
              <Link href="/articles">
                <button className="bg-transparent hover:border-red-600 hover:text-red-700 transition-colors text-[#0f0c0c] text-sm font-normal border border-[#e8d8d4] px-8 py-3.5 rounded-full cursor-pointer">
                  Read Articles
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
        </motion.div>
      </section>

      {/* ─── STATS STRIP ──────────────────────────────────────── */}
      <div className="relative bg-[#0f0c0c] overflow-hidden">
        {/* Subtle red glow across the strip */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(180,20,20,0.18), transparent 65%)" }} />

        <div className="relative grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/[0.06]">
          {[
            { num: "17.9M", label: "Cardiovascular deaths globally each year", tag: "Leading cause of mortality" },
            { num: "80%", label: "Of premature CVD cases are preventable", tag: "Through lifestyle changes" },
            { num: "#1", label: "CVD is the world's single biggest killer", tag: "Knowledge is your defense" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.55 }}
              className="relative group py-14 px-10 text-center flex flex-col items-center gap-3"
            >
              {/* Per-card inner glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: "radial-gradient(ellipse at 50% 80%, rgba(180,20,20,0.12), transparent 70%)" }} />

              <div
                className="text-6xl lg:text-7xl font-bold leading-none tracking-tight text-white relative z-10"
                style={{ fontFamily: "'Cormorant Garamond', serif",
                  textShadow: "0 0 60px rgba(220,30,30,0.35)" }}
              >
                <span className="text-red-500">{s.num}</span>
              </div>

              <div className="relative z-10">
                <p className="text-sm text-white/55 leading-relaxed max-w-[200px]">{s.label}</p>
                <p className="text-[11px] text-red-500/70 mt-1.5 tracking-widest uppercase font-medium">{s.tag}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom border line */}
        <div className="h-px bg-gradient-to-r from-transparent via-red-900/40 to-transparent" />
      </div>

      {/* ─── FEATURES ─────────────────────────────────────────── */}
      <section className="py-24 px-10 lg:px-16 max-w-6xl mx-auto w-full">
        <div className="mb-14">
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">What we do</p>
          <h2
            className="text-5xl font-bold text-[#0f0c0c] leading-tight tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Education that<br />saves lives.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-[#e8d8d4]">
          {[
            {
              num: "01",
              title: "Evidence-based articles",
              desc: "Every piece of content is grounded in clinical research, written accessibly for everyone — no jargon, no fear-mongering.",
            },
            {
              num: "02",
              title: "Personal risk assessment",
              desc: "Take our 5-minute quiz to understand your individual cardiovascular risk factors and get personalised guidance.",
            },
            {
              num: "03",
              title: "Community submissions",
              desc: "Students, educators, and health advocates can contribute articles — reviewed before publishing to ensure quality.",
            },
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
              <h3 className="text-base font-semibold text-[#0f0c0c] mb-2">{f.title}</h3>
              <p className="text-sm text-[#8a7070] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── ARTICLES ──────────────────────────────────────────── */}
      <section className="bg-[#0f0c0c] py-24 px-10 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <p className="text-[11px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">Latest insights</p>
              <h2
                className="text-5xl font-bold text-white leading-tight tracking-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                From the blog
              </h2>
              <p className="text-sm text-white/40 mt-2 max-w-sm leading-relaxed">
                Our most recent articles on heart health, nutrition, and well-being.
              </p>
            </div>
            <Link href="/articles">
              <button className="text-sm text-white/40 hover:text-white transition-colors border-b border-white/20 hover:border-white/60 pb-0.5 bg-transparent cursor-pointer whitespace-nowrap">
                View all articles →
              </button>
            </Link>
          </div>

          {latestArticles.length === 0 ? (
            <div className="text-center py-20 border border-white/[0.07] rounded-xl">
              <p className="text-white/30 text-sm">No articles published yet.</p>
              <Link href="/articles">
                <button className="mt-4 text-red-400 text-xs hover:text-red-300 transition-colors cursor-pointer bg-transparent border-0">
                  Check back soon →
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
          <p className="text-[11px] tracking-[0.14em] uppercase text-red-700 font-medium mb-4">Take action today</p>
          <h2
            className="text-5xl md:text-6xl font-bold text-[#0f0c0c] leading-tight tracking-tight mb-6 max-w-2xl mx-auto"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Know Your Risk.<br />Protect Your Future.
          </h2>
          <p className="text-base text-[#8a7070] leading-relaxed max-w-md mx-auto mb-10 font-light">
            Our comprehensive risk assessment takes less than 5 minutes and gives
            you personalised, actionable recommendations.
          </p>
          <Link href="/risk-assessment">
            <button className="bg-red-700 hover:bg-[#0f0c0c] transition-colors text-white text-sm font-medium px-10 py-4 rounded-full cursor-pointer">
              Start Your Assessment
            </button>
          </Link>
        </motion.div>
      </section>

      {/* ─── DISCLAIMER ────────────────────────────────────────── */}
      <div className="bg-amber-50 border-t-2 border-amber-400 px-10 py-4 flex items-start gap-3">
        <span className="text-base mt-0.5">⚠️</span>
        <p className="text-xs text-amber-900 leading-relaxed">
          <strong>Medical disclaimer:</strong> Heart Matters is an educational platform only. Nothing on this site
          constitutes medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional
          for any medical concerns.
        </p>
      </div>

    </div>
  );
}
