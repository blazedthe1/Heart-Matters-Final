import { useState, useEffect, useCallback } from "react";

export type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  readTime: string;
  published: boolean;
  createdAt: string;
};

const STORAGE_KEY = "heartmatters_articles";
export const PASSWORD_KEY = "heartmatters_admin_password";
export const DEFAULT_PASSWORD = "heartmatters2024";
const SESSION_KEY = "heartmatters_admin_session";

function loadArticles(): Article[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveArticles(articles: Article[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
}

export function getAdminPassword(): string {
  return localStorage.getItem(PASSWORD_KEY) ?? DEFAULT_PASSWORD;
}

export function setAdminPassword(pw: string) {
  localStorage.setItem(PASSWORD_KEY, pw);
}

export function checkAdminSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function startAdminSession() {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function endAdminSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function validatePassword(pw: string): boolean {
  return pw === getAdminPassword();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function useArticles() {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    setArticles(loadArticles());
  }, []);

  const refresh = useCallback(() => {
    setArticles(loadArticles());
  }, []);

  const createArticle = useCallback(
    (data: Omit<Article, "id" | "createdAt" | "slug"> & { slug?: string }) => {
      const all = loadArticles();
      const base = data.slug || slugify(data.title);
      let slug = base;
      let i = 1;
      while (all.some((a) => a.slug === slug)) {
        slug = `${base}-${i++}`;
      }
      const newArticle: Article = {
        ...data,
        slug,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      const updated = [newArticle, ...all];
      saveArticles(updated);
      setArticles(updated);
      return newArticle;
    },
    []
  );

  const updateArticle = useCallback((id: string, data: Partial<Omit<Article, "id" | "createdAt">>) => {
    const all = loadArticles();
    const updated = all.map((a) => (a.id === id ? { ...a, ...data } : a));
    saveArticles(updated);
    setArticles(updated);
  }, []);

  const deleteArticle = useCallback((id: string) => {
    const all = loadArticles();
    const updated = all.filter((a) => a.id !== id);
    saveArticles(updated);
    setArticles(updated);
  }, []);

  const getBySlug = useCallback((slug: string): Article | undefined => {
    return loadArticles().find((a) => a.slug === slug);
  }, []);

  return { articles, createArticle, updateArticle, deleteArticle, getBySlug, refresh };
}

export function getPublishedArticles(): Article[] {
  return loadArticles().filter((a) => a.published);
}
