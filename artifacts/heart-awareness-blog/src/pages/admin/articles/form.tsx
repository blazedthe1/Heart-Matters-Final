import { useState, useEffect, useRef } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ArrowLeft, Save, Eye, EyeOff, Image, Link2, Film, Bold, Italic, Heading2, List } from "lucide-react";
import { motion } from "framer-motion";
import { useArticles, checkAdminSession, type Article } from "@/hooks/useArticles";
import ReactMarkdown from "react-markdown";

const PRESET_CATEGORIES = [
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

/* ─── Toolbar Helpers ────────────────────────────────────────────── */

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string,
  placeholder: string,
  onChange: (val: string) => void
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end) || placeholder;
  const newVal = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
  onChange(newVal);
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = start + before.length;
    textarea.selectionEnd = start + before.length + selected.length;
  }, 0);
}

interface ToolbarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}
function ToolbarButton({ icon, label, onClick }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-[#f5ede8] text-[#8a7070] hover:text-red-700 transition-colors cursor-pointer text-xs font-medium"
    >
      {icon}
    </button>
  );
}

interface MediaDialogProps {
  mode: "image" | "gif" | "link";
  onInsert: (md: string) => void;
  onClose: () => void;
}
function MediaDialog({ mode, onInsert, onClose }: MediaDialogProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [linkText, setLinkText] = useState("");

  const isImage = mode === "image" || mode === "gif";

  const handleInsert = () => {
    if (isImage && url) {
      onInsert(`![${alt || (mode === "gif" ? "animation" : "image")}](${url})`);
    } else if (mode === "link" && url) {
      onInsert(`[${linkText || "link text"}](${url})`);
    }
    onClose();
  };

  const titles = { image: "Insert Image", gif: "Insert GIF", link: "Insert Link" };
  const urlPh = { image: "https://example.com/image.jpg", gif: "https://giphy.com/media/xxx/giphy.gif", link: "https://example.com" };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,12,12,0.7)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.96, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#0f0c0c]">{titles[mode]}</h3>
          <button onClick={onClose} className="text-[#8a7070] hover:text-[#0f0c0c] transition-colors text-xl leading-none cursor-pointer">×</button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5">URL *</label>
            <input
              type="url"
              autoFocus
              placeholder={urlPh[mode]}
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
            />
          </div>

          {isImage && (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5">Alt text</label>
              <input
                type="text"
                placeholder="Describe the image"
                value={alt}
                onChange={e => setAlt(e.target.value)}
                className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
              />
            </div>
          )}

          {mode === "link" && (
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-[#8a7070] font-medium mb-1.5">Link text</label>
              <input
                type="text"
                placeholder="Click here to learn more"
                value={linkText}
                onChange={e => setLinkText(e.target.value)}
                className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
              />
            </div>
          )}

          {isImage && url && (
            <div className="rounded-xl overflow-hidden border border-[#e8d8d4] bg-[#faf8f5]">
              <p className="text-[10px] uppercase tracking-widest text-[#8a7070] px-3 py-2 border-b border-[#e8d8d4]">Preview</p>
              <div className="p-3">
                <img
                  src={url}
                  alt={alt || "preview"}
                  className="max-h-32 max-w-full rounded-lg object-contain mx-auto"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <button
            type="button"
            onClick={handleInsert}
            disabled={!url}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-40"
            style={{ background: "#0f0c0c" }}
            onMouseEnter={e => { if (url) e.currentTarget.style.background = "#b91c1c"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#0f0c0c"; }}
          >
            Insert
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#8a7070] border border-[#e8d8d4] hover:border-red-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Form ──────────────────────────────────────────────────── */

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
  const [customCat, setCustomCat] = useState("");
  const [mediaDialog, setMediaDialog] = useState<"image" | "gif" | "link" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isCustom = !PRESET_CATEGORIES.includes(form.category);

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

  const setContent = (val: string) => setForm(p => ({ ...p, content: val }));

  const toolbarAction = (before: string, after: string, placeholder: string) => {
    if (!textareaRef.current) return;
    insertAtCursor(textareaRef.current, before, after, placeholder, setContent);
  };

  const handleMediaInsert = (md: string) => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const newVal = ta.value.substring(0, start) + "\n" + md + "\n" + ta.value.substring(start);
    setContent(newVal);
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
                  {preview ? "Preview" : "Content"}
                </span>
                <span className="text-[11px] text-[#c0a8a8]">{wordCount} words</span>
              </div>

              {/* Formatting toolbar — shown only in edit mode */}
              {!preview && (
                <div className="flex flex-wrap items-center gap-1 px-4 py-2 border-b border-[#e8d8d4] bg-white">
                  <ToolbarButton icon={<Bold className="w-3.5 h-3.5" />} label="Bold" onClick={() => toolbarAction("**", "**", "bold text")} />
                  <ToolbarButton icon={<Italic className="w-3.5 h-3.5" />} label="Italic" onClick={() => toolbarAction("*", "*", "italic text")} />
                  <ToolbarButton icon={<Heading2 className="w-3.5 h-3.5" />} label="Heading" onClick={() => toolbarAction("\n## ", "", "Section heading")} />
                  <ToolbarButton icon={<List className="w-3.5 h-3.5" />} label="Bullet list" onClick={() => toolbarAction("\n- ", "", "list item")} />
                  <div className="w-px h-4 bg-[#e8d8d4] mx-1" />
                  <ToolbarButton icon={<Image className="w-3.5 h-3.5" />} label="Insert image" onClick={() => setMediaDialog("image")} />
                  <ToolbarButton icon={<Film className="w-3.5 h-3.5" />} label="Insert GIF" onClick={() => setMediaDialog("gif")} />
                  <ToolbarButton icon={<Link2 className="w-3.5 h-3.5" />} label="Insert link" onClick={() => setMediaDialog("link")} />
                  <div className="ml-auto text-[10px] text-[#c0a8a8] hidden sm:block">Markdown supported</div>
                </div>
              )}

              {preview ? (
                <div className="p-6 min-h-[400px] prose prose-sm max-w-none
                  prose-headings:text-[#0f0c0c] prose-p:text-[#8a7070] prose-li:text-[#8a7070]
                  prose-strong:text-[#0f0c0c] prose-a:text-red-700 prose-img:rounded-xl prose-img:shadow-md">
                  {form.content ? (
                    <ReactMarkdown>{form.content}</ReactMarkdown>
                  ) : (
                    <p className="text-[#c0a8a8] italic">Nothing to preview yet...</p>
                  )}
                </div>
              ) : (
                <textarea
                  ref={textareaRef}
                  placeholder={`Write your article here...\n\n## Section heading\n\nYour paragraph text.\n\n- Bullet point\n\n**Bold** and *italic* supported.\n\nAdd images: ![alt](url)\nAdd links: [text](url)`}
                  value={form.content}
                  onChange={e => setContent(e.target.value)}
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
                  value={isCustom ? "__custom__" : form.category}
                  onChange={e => {
                    if (e.target.value === "__custom__") {
                      setForm(p => ({ ...p, category: customCat || "" }));
                    } else {
                      setCustomCat("");
                      setForm(p => ({ ...p, category: e.target.value }));
                    }
                  }}
                  className="w-full border border-[#e8d8d4] text-[#0f0c0c] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition bg-white cursor-pointer"
                >
                  {PRESET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  <option value="__custom__">✏️ Custom category…</option>
                </select>
                {isCustom && (
                  <input
                    type="text"
                    placeholder="Enter your category name"
                    value={form.category}
                    onChange={e => {
                      setCustomCat(e.target.value);
                      setForm(p => ({ ...p, category: e.target.value }));
                    }}
                    autoFocus
                    className="mt-2 w-full border border-red-300 text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-500 transition bg-red-50"
                  />
                )}
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

            {/* Markdown cheatsheet */}
            <div className="bg-white border border-[#e8d8d4] rounded-xl p-4 space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-[#8a7070] font-medium">Quick Reference</p>
              {[
                ["**text**", "Bold"],
                ["*text*", "Italic"],
                ["## Heading", "Section"],
                ["![alt](url)", "Image / GIF"],
                ["[text](url)", "Link"],
                ["- item", "Bullet"],
                ["> quote", "Blockquote"],
              ].map(([code, label]) => (
                <div key={code} className="flex items-center justify-between text-[11px]">
                  <code className="bg-[#f5ede8] text-red-700 rounded px-1.5 py-0.5 font-mono">{code}</code>
                  <span className="text-[#c0a8a8]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Media insert dialog */}
      {mediaDialog && (
        <MediaDialog
          mode={mediaDialog}
          onInsert={handleMediaInsert}
          onClose={() => setMediaDialog(null)}
        />
      )}
    </div>
  );
}
