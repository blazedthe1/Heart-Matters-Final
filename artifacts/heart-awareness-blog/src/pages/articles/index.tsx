import { Link } from "wouter";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getPublishedArticles, type Article } from "@/hooks/useArticles";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ArticlesList() {
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const { t } = useLanguage();

  const loadArticles = () => setAllArticles(getPublishedArticles());

  useEffect(() => {
    loadArticles();
    window.addEventListener("storage", loadArticles);
    return () => window.removeEventListener("storage", loadArticles);
  }, []);

  const usedCategories = Array.from(new Set(allArticles.map(a => a.category)));
  const categories = [t("art_all"), ...usedCategories];

  const filtered = activeCategory === t("art_all") || activeCategory === "All"
    ? allArticles
    : allArticles.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      <div className="bg-[#0f0c0c] pt-20 pb-16 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-4">{t("art_badge")}</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t("art_h1")}
            </h1>
            <p className="text-base text-white/45 leading-relaxed max-w-lg mx-auto font-light">{t("art_sub")}</p>
          </motion.div>
        </div>
      </div>

      <div className="border-b border-[#e8d8d4] bg-white sticky top-[64px] z-10">
        <div className="container mx-auto px-4 md:px-6 flex gap-1 overflow-x-auto py-3 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeCategory === cat || (cat === t("art_all") && (activeCategory === "All" || activeCategory === t("art_all")))
                  ? "bg-[#0f0c0c] text-white"
                  : "bg-transparent text-[#8a7070] hover:text-[#0f0c0c] hover:bg-[#f5ede8]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 pt-14 pb-4 max-w-6xl">
        {filtered.length === 0 ? (
          <div className="text-center py-28">
            <p className="text-[#8a7070] text-base mb-2">
              {allArticles.length === 0 ? t("art_none_all") : t("art_none_cat")}
            </p>
            <p className="text-[#c0a8a8] text-sm">{t("art_check_back")}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e8d8d4]">
            {filtered.map((article, i) => (
              <motion.div key={article.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45 }}>
                <Link href={`/articles/${article.slug}`}>
                  <div className="bg-[#faf8f5] hover:bg-white transition-colors p-8 cursor-pointer h-full flex flex-col group">
                    <p className="text-[10px] tracking-widest uppercase text-red-700 font-medium mb-4">{article.category}</p>
                    <h3 className="text-xl font-semibold text-[#0f0c0c] leading-snug mb-3 group-hover:text-red-700 transition-colors"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {article.title}
                    </h3>
                    <p className="text-sm text-[#8a7070] leading-relaxed line-clamp-3 flex-1 mb-6 font-light">{article.excerpt}</p>
                    <div className="flex justify-between items-center text-[11px] text-[#c0a8a8] pt-4 border-t border-[#e8d8d4]">
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
    </div>
  );
}
