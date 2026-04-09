import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import NotFound from "@/pages/not-found";
import ReactMarkdown from "react-markdown";
import { useState, useEffect } from "react";
import { type Article, getPublishedArticles } from "@/hooks/useArticles";
import { format } from "date-fns";

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug || "";
  const [article, setArticle] = useState<Article | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = getPublishedArticles().find(a => a.slug === slug);
    setArticle(found);
    setLoading(false);
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!article) {
    return <NotFound />;
  }

  return (
    <article className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      <header className="bg-[#0f0c0c] pt-16 pb-14 border-b border-white/[0.07]">
        <div className="container mx-auto px-4 md:px-6 max-w-3xl">
          <Link href="/articles" className="inline-flex items-center text-sm text-white/40 hover:text-white transition-colors mb-8 gap-1.5">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to articles
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[10px] tracking-[0.14em] uppercase text-red-400 font-medium mb-5">
              {article.category}
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-6"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {article.title}
            </h1>
            <p className="text-base text-white/45 leading-relaxed mb-8 font-light max-w-2xl">
              {article.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-white/30 pt-6 border-t border-white/[0.07]">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                <span>{article.author}</span>
              </div>
              <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 max-w-3xl pt-14">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-[#0f0c0c] prose-headings:tracking-tight
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-5
            prose-h2:font-['Cormorant_Garamond',serif]
            prose-p:text-[#8a7070] prose-p:leading-relaxed prose-p:mb-6 prose-p:font-light
            prose-li:text-[#8a7070] prose-li:font-light
            prose-strong:text-[#0f0c0c] prose-strong:font-semibold
            prose-a:text-red-700"
        >
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-[#e8d8d4]">
          <div className="bg-[#0f0c0c] rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3
                className="text-2xl font-bold text-white mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Concerned about your heart health?
              </h3>
              <p className="text-sm text-white/45 font-light">
                Take our 5-minute risk assessment to get personalised recommendations.
              </p>
            </div>
            <Link href="/risk-assessment" className="shrink-0">
              <button className="bg-red-700 hover:bg-white hover:text-[#0f0c0c] text-white text-sm font-medium px-8 py-3.5 rounded-full transition-colors cursor-pointer whitespace-nowrap">
                Start Assessment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
