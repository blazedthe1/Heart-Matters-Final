import { motion } from "framer-motion";
import { Heart, Users, Lightbulb, Target, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      <section className="bg-[#0f0c0c] pt-20 pb-20 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-5">{t("about_badge")}</p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("about_h1_1")} <em className="text-red-600 not-italic">{t("about_h1_em")}</em>
            </h1>
            <p className="text-base text-white/45 leading-relaxed max-w-xl mx-auto font-light">{t("about_sub")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4]">
            {[
              { icon: Target,    titleKey: "about_m_title", bodyKey: "about_m_body" },
              { icon: Lightbulb, titleKey: "about_p_title", bodyKey: "about_p_body" },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#faf8f5] hover:bg-white transition-colors p-10">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <item.icon className="h-5 w-5 text-red-700" />
                </div>
                <h2 className="text-3xl font-bold text-[#0f0c0c] mb-4 tracking-tight"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t(item.titleKey)}
                </h2>
                <p className="text-sm text-[#8a7070] leading-relaxed font-light">{t(item.bodyKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6 bg-[#0f0c0c]">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-14 text-center">
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-3">{t("about_v_badge")}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("about_v_h2")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-white/10">
            {[
              { num: "01", icon: Heart,    titleKey: "about_v1_title", descKey: "about_v1_desc" },
              { num: "02", icon: Lightbulb,titleKey: "about_v2_title", descKey: "about_v2_desc" },
              { num: "03", icon: Users,    titleKey: "about_v3_title", descKey: "about_v3_desc" },
            ].map((value, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#0f0c0c] hover:bg-[#1c1414] transition-colors p-10">
                <div className="text-4xl font-semibold text-white/10 mb-5 leading-none"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {value.num}
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{t(value.titleKey)}</h3>
                <p className="text-sm text-white/35 leading-relaxed font-light">{t(value.descKey)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 md:px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-14">
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">{t("about_t_badge")}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0f0c0c] leading-tight tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("about_t_h2")}
            </h2>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.6 }}
            className="relative bg-white border border-[#e8d8d4] rounded-2xl overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-700" />
            <div className="p-10 md:p-14">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0f0c0c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Mishal &amp; Alby
                  </h3>
                  <p className="text-[10px] tracking-widest uppercase text-red-700 font-medium">{t("about_t_grade")}</p>
                </div>
              </div>
              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light mb-6">
                Heart Matters was built from the ground up by Mishal and Alby, two Grade 10 students at Rajagiri Public School in Qatar. What started as a shared curiosity about cardiovascular health quickly grew into something much bigger — a platform designed to make life-saving information accessible, approachable, and genuinely useful for people of all ages.
              </p>
              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light mb-6">
                Every article, every feature, and every line of code on this website represents hours of research, late-night problem-solving, and a deep belief that young people can make a real difference. We wanted to prove that meaningful health education does not have to come from a hospital or a textbook — it can come from students who care enough to build something worth sharing.
              </p>
              <p className="text-[#5a4a4a] leading-[1.85] text-[15px] font-light">
                We poured our hearts (pun intended) into this project, and we sincerely hope it helps you or someone you love learn something new about keeping their heart healthy. If even one person takes a small step toward better cardiovascular health because of this site, then every bit of effort was worth it. Thank you for being here.
              </p>
            </div>
            <div className="border-t border-[#e8d8d4] bg-[#faf8f5] px-10 md:px-14 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-[#8a7070] font-light">{t("about_t_built")}</p>
              <div className="flex items-center gap-1.5 text-xs text-red-700 font-medium">
                <Heart className="h-3.5 w-3.5 fill-red-700" />
                {t("about_t_hearts")}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
