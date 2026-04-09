import { useState, useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, Save, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { useArticles, checkAdminSession, type Article } from "@/hooks/useArticles";
import ReactMarkdown from "react-markdown";

const CATEGORIES = [
  "Prevention", "Nutrition", "Lifestyle", "Mental Health",
  "Emergency", "Research", "Exercise", "Sleep", "Stress",
];

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

type FormData = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  published: boolean;
};

export default function ArticleFormPage() {
  const [, editParams] = useRoute("/admin/articles/edit/:id");
  const isEdit = !!editParams?.id;
  const articleId = editParams?.id ?? null;

  const [, setLocation] = useLocation();
  const { articles, createArticle, updateArticle } = useArticles();

  const [form, setForm] = useState<FormData>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Prevention",
    author: "",
    readTime: "5 min read",
    published: false,
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!checkAdminSession()) {
      setLocation("/admin");
    }
  }, []);

  useEffect(() => {
    if (isEdit && articleId) {
      const found = articles.find(a => a.id === articleId);
      if (found) {
        setForm({
          title: found.title,
          slug: found.slug,
          excerpt: found.excerpt,
          content: found.content,
          category: found.category,
          author: found.author,
          readTime: found.readTime,
          published: found.published,
        });
        setSlugEdited(true);
      }
    }
  }, [articles, isEdit, articleId]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm(p => ({
      ...p,
      title: val,
      slug: slugEdited ? p.slug : slugify(val),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.content || !form.author) {
      setError("Please fill in all required fields.");
      return;
    }
    if (isEdit && articleId) {
      updateArticle(articleId, form);
    } else {
      createArticle(form);
    }
    setSaved(true);
    setTimeout(() => setLocation("/admin"), 900);
  };

  const wordCount = form.content.trim() ? form.content.trim().split(/\s+/).length : 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] pb-24 font-['Outfit',sans-serif]">

      {/* Top bar */}
      <div className="bg-[#0f0c0c] border-b border-white/[0.08] sticky top-0 z-30">
        <div className="container mx-auto px-4 max-w-5xl h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <button className="text-white/40 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer">
                <ArrowLeft className="h-4 w-4" />
              </button>
            </Link>
            <span className="text-white text-sm font-medium">{isEdit ? "Edit Article" : "New Article"}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setPreview(v => !v)}
              className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white/[0.06] cursor-pointer"
            >
              {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              {preview ? "Edit" : "Preview"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={saved}
              className={`flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full transition-all cursor-pointer ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-red-700 hover:bg-red-600 text-white"
              }`}
            >
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : "Save Article"}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-5xl pt-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">

          {/* Main content */}
          <div className="md:col-span-2 space-y-5">
            <input
              type="text"
              placeholder="Article title *"
              value={form.title}
              onChange={handleTitleChange}
              required
              className="w-full bg-white border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-5 py-3.5 text-xl font-semibold outline-none focus:border-red-400 transition"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            />

            <textarea
              placeholder="Short excerpt — appears on the articles list page *"
              value={form.excerpt}
              onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))}
              required
              rows={3}
              className="w-full bg-white border border-[#e8d8d4] text-[#8a7070] placeholder:text-[#c0a8a8] rounded-xl px-5 py-3.5 text-sm outline-none focus:border-red-400 transition resize-none"
            />

            <div className="bg-white border border-[#e8d8d4] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#e8d8d4] bg-[#faf8f5]">
                <span className="text-[11px] uppercase tracking-widest text-[#8a7070] font-medium">
                  {preview ? "Preview" : "Content (Markdown supported)"}
                </span>
                <span className="text-[11px] text-[#c0a8a8]">{wordCount} words</span>
              </div>

              {preview ? (
                <div className="p-6 min-h-[400px] prose prose-sm max-w-none
                  prose-headings:text-[#0f0c0c] prose-p:text-[#8a7070] prose-li:text-[#8a7070]
                  prose-strong:text-[#0f0c0c] prose-a:text-red-700">
                  {form.content ? (
                    <ReactMarkdown>{form.content}</ReactMarkdown>
                  ) : (
                    <p className="text-[#c0a8a8] italic">Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                <textarea
                  placeholder={`Write your article here using Markdown...\n\n## Section heading\n\nYour paragraph text here.\n\n- Bullet point\n- Another point\n\n**Bold text** and *italic text* are supported.`}
                  value={form.content}
                  onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
                  required
                  className="w-full px-5 py-4 text-sm text-[#0f0c0c] placeholder:text-[#d4c4c4] font-mono outline-none resize-none min-h-[400px]"
                  style={{ lineHeight: "1.8" }}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-white border border-[#e8d8d4] rounded-xl p-5 space-y-5">

              {/* Published toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0f0c0c]">Published</p>
                  <p className="text-xs text-[#8a7070]">Visible on the site</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, published: !p.published }))}
                  className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${
                    form.published ? "bg-red-600" : "bg-[#e8d8d4]"
                  }`}
                >
                  <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.published ? "translate-x-5" : "translate-x-0"
                  }`} />
                </button>
              </div>

              {/* Category */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5 block">Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-[#e8d8d4] text-[#0f0c0c] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition bg-white cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Author */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5 block">Author *</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.author}
                  onChange={e => setForm(p => ({ ...p, author: e.target.value }))}
                  required
                  className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
                />
              </div>

              {/* Read time */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5 block">Read Time</label>
                <input
                  type="text"
                  placeholder="e.g. 5 min read"
                  value={form.readTime}
                  onChange={e => setForm(p => ({ ...p, readTime: e.target.value }))}
                  className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
                />
              </div>

              {/* Slug */}
              <div>
                <label className="text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5 block">URL Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => { setSlugEdited(true); setForm(p => ({ ...p, slug: e.target.value })); }}
                  className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:border-red-400 transition"
                />
                {form.slug && (
                  <p className="text-[10px] text-[#c0a8a8] mt-1.5">/articles/<span className="text-red-700">{form.slug}</span></p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={saved}
              className={`w-full flex items-center justify-center gap-2 text-sm font-medium py-3 rounded-xl transition-all cursor-pointer ${
                saved
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0f0c0c] hover:bg-red-700 text-white"
              }`}
            >
              <Save className="h-4 w-4" />
              {saved ? "Saved!" : (isEdit ? "Save Changes" : "Publish Article")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
