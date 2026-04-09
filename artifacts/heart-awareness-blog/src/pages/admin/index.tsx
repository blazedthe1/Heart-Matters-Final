import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Heart, Plus, Edit2, Trash2, LogOut, ArrowLeft, Eye, EyeOff, Settings, X, Check } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  useArticles,
  validatePassword,
  startAdminSession,
  endAdminSession,
  checkAdminSession,
  getAdminPassword,
  setAdminPassword,
  DEFAULT_PASSWORD,
} from "@/hooks/useArticles";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const { articles, deleteArticle, refresh } = useArticles();

  useEffect(() => {
    if (checkAdminSession()) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePassword(password)) {
      startAdminSession();
      setIsAuthenticated(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password. Please try again.");
    }
  };

  const handleLogout = () => {
    endAdminSession();
    setIsAuthenticated(false);
    setPassword("");
  };

  const handleDelete = (id: string) => {
    deleteArticle(id);
    setDeleteId(null);
    refresh();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPw) return;
    if (newPw !== confirmPw) {
      alert("Passwords do not match.");
      return;
    }
    if (newPw.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    setAdminPassword(newPw);
    setPwSuccess(true);
    setNewPw("");
    setConfirmPw("");
    setTimeout(() => setPwSuccess(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f0c0c] flex items-center justify-center p-4"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(120,0,0,0.25), transparent 70%), #0f0c0c" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-red-900/40 border border-red-800/40 rounded-2xl mb-4">
              <Heart className="h-6 w-6 fill-red-500 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Heart Matters Admin
            </h1>
            <p className="text-sm text-white/40 mt-1.5">Enter your password to manage articles</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/[0.12] text-white placeholder:text-white/25 rounded-xl px-4 py-3 text-sm outline-none focus:border-red-600/60 focus:ring-1 focus:ring-red-600/30 transition pr-11"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <AnimatePresence>
              {authError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs px-1"
                >
                  {authError}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-600 transition-colors text-white text-sm font-medium py-3 rounded-xl cursor-pointer"
            >
              Sign In
            </button>
          </form>


        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-['Outfit',sans-serif]">

      {/* Top bar */}
      <div className="bg-[#0f0c0c] border-b border-white/[0.08] sticky top-0 z-30">
        <div className="container mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="h-4 w-4 fill-red-600 text-red-600 flex-shrink-0" />
            <span className="text-white font-semibold text-sm">Admin Panel</span>
            <span className="hidden md:block text-white/20 text-xs">— Heart Matters</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-white/35 hover:text-white transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-3 w-3" /> View site
            </Link>
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-white/35 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/[0.06]"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-white/35 hover:text-red-400 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 py-10 max-w-5xl">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0f0c0c]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Articles
            </h1>
            <p className="text-sm text-[#8a7070] mt-0.5">{articles.length} article{articles.length !== 1 ? "s" : ""} total</p>
          </div>
          <Link href="/admin/articles/new">
            <button className="flex items-center gap-2 bg-[#0f0c0c] hover:bg-red-700 transition-colors text-white text-sm font-medium px-5 py-2.5 rounded-full cursor-pointer">
              <Plus className="h-4 w-4" /> New Article
            </button>
          </Link>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-[#e8d8d4] rounded-2xl">
            <Heart className="h-10 w-10 text-[#e8d8d4] mx-auto mb-4" />
            <p className="text-[#8a7070] mb-1">No articles yet</p>
            <p className="text-[#c0a8a8] text-sm">Create your first article to get started.</p>
            <Link href="/admin/articles/new">
              <button className="mt-6 bg-[#0f0c0c] text-white text-sm font-medium px-6 py-2.5 rounded-full cursor-pointer hover:bg-red-700 transition-colors">
                Write your first article
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {articles.map((article) => (
              <div
                key={article.id}
                className="bg-white border border-[#e8d8d4] rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] tracking-widest uppercase text-red-700 font-medium">{article.category}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      article.published
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[#0f0c0c] text-base truncate" title={article.title}>
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-[#c0a8a8] mt-1">
                    <span>{article.author}</span>
                    <span>·</span>
                    <span>{article.readTime}</span>
                    <span>·</span>
                    <span>{format(new Date(article.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {article.published && (
                    <Link href={`/articles/${article.slug}`}>
                      <button className="p-2 text-[#8a7070] hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="View article">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                  )}
                  <Link href={`/admin/articles/edit/${article.id}`}>
                    <button className="p-2 text-[#8a7070] hover:text-[#0f0c0c] hover:bg-[#f5ede8] rounded-lg transition-colors" title="Edit">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </Link>
                  <button
                    onClick={() => setDeleteId(article.id)}
                    className="p-2 text-[#8a7070] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-bold text-[#0f0c0c] text-lg mb-2">Delete Article</h3>
              <p className="text-[#8a7070] text-sm mb-6">This action cannot be undone. The article will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 border border-[#e8d8d4] text-[#8a7070] hover:bg-[#f5ede8] py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteId)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[#0f0c0c] text-lg">Settings</h3>
                <button onClick={() => setSettingsOpen(false)} className="text-[#8a7070] hover:text-[#0f0c0c] transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#0f0c0c] mb-1.5 block uppercase tracking-widest">Change Password</label>
                  <input
                    type="password"
                    placeholder="New password (min 6 chars)"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
                  />
                </div>
                <div>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    className="w-full border border-[#e8d8d4] text-[#0f0c0c] placeholder:text-[#c0a8a8] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-red-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#0f0c0c] hover:bg-red-700 transition-colors text-white text-sm font-medium py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  {pwSuccess ? (
                    <><Check className="h-4 w-4" /> Password updated!</>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-[#e8d8d4]">
                <p className="text-[11px] text-[#c0a8a8] leading-relaxed">
                  Password is stored locally in your browser. Both of you will need to use the same password on whatever device you're writing on.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
