import { motion } from "framer-motion";
import { Phone, Stethoscope, ExternalLink } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Resources() {
  const { t } = useLanguage();

  const heartAttackItems = [
    { labelKey: "res_ha_1l", descKey: "res_ha_1d" },
    { labelKey: "res_ha_2l", descKey: "res_ha_2d" },
    { labelKey: "res_ha_3l", descKey: "res_ha_3d" },
    { labelKey: "res_ha_4l", descKey: "res_ha_4d" },
  ];
  const strokeItems = [
    { labelKey: "res_st_1l", descKey: "res_st_1d" },
    { labelKey: "res_st_2l", descKey: "res_st_2d" },
    { labelKey: "res_st_3l", descKey: "res_st_3d" },
    { labelKey: "res_st_4l", descKey: "res_st_4d" },
  ];
  const orgs = [
    { nameKey: "res_org1_name", descKey: "res_org1_desc", link: "https://www.heart.org/" },
    { nameKey: "res_org2_name", descKey: "res_org2_desc", link: "https://www.who.int/health-topics/cardiovascular-diseases" },
    { nameKey: "res_org3_name", descKey: "res_org3_desc", link: "https://www.cdc.gov/heartdisease/" },
    { nameKey: "res_org4_name", descKey: "res_org4_desc", link: "https://www.nhlbi.nih.gov/" },
  ];

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      <div className="bg-[#0f0c0c] pt-20 pb-16 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-5">{t("res_badge")}</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("res_h1")}
            </h1>
            <p className="text-base text-white/45 leading-relaxed max-w-lg mx-auto font-light">{t("res_sub")}</p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-16 pb-4 max-w-5xl">

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }} className="mb-16">
          <div className="flex items-center gap-3 mb-1 bg-red-700 px-6 py-5 rounded-t-xl">
            <Phone className="h-5 w-5 text-white flex-shrink-0" />
            <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("res_emg_title")}
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4] rounded-b-xl overflow-hidden">
            {[
              { titleKey: "res_ha_title", items: heartAttackItems },
              { titleKey: "res_st_title", items: strokeItems },
            ].map((section, si) => (
              <div key={si} className="bg-[#faf8f5] p-8">
                <h3 className="text-sm font-semibold text-[#0f0c0c] uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-red-700" />
                  {t(section.titleKey)}
                </h3>
                <ul className="space-y-4">
                  {section.items.map((item, ii) => (
                    <li key={ii} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-700 mt-1.5 shrink-0" />
                      <span className="text-sm text-[#8a7070] font-light leading-relaxed">
                        <strong className="text-[#0f0c0c] font-semibold">{t(item.labelKey)}:</strong>{" "}
                        {t(item.descKey)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="mb-8">
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-2">{t("res_trusted_badge")}</p>
            <h2 className="text-3xl font-bold text-[#0f0c0c] tracking-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("res_trusted_h2")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-px bg-[#e8d8d4]">
            {orgs.map((org, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                className="bg-[#faf8f5] hover:bg-white transition-colors p-8 flex flex-col">
                <h3 className="text-xl font-semibold text-[#0f0c0c] mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t(org.nameKey)}
                </h3>
                <p className="text-sm text-[#8a7070] leading-relaxed font-light flex-1 mb-6">{t(org.descKey)}</p>
                <a href={org.link} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-medium text-red-700 hover:text-[#0f0c0c] transition-colors">
                  {t("res_visit")}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </motion.section>

      </div>
    </div>
  );
}
