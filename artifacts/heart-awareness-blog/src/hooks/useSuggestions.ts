import { useState, useEffect, useCallback } from "react";

export interface Suggestion {
  id: string;
  name: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

const KEY = "hm_suggestions";

function load(): Suggestion[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

function save(items: Suggestion[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("hm_suggestions_updated"));
}

export function useSuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>(load);

  useEffect(() => {
    const sync = () => setSuggestions(load());
    window.addEventListener("hm_suggestions_updated", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("hm_suggestions_updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const addSuggestion = useCallback((name: string, type: string, message: string) => {
    const item: Suggestion = {
      id: Date.now().toString(),
      name,
      type,
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    const updated = [item, ...load()];
    save(updated);
    setSuggestions(updated);
  }, []);

  const markRead = useCallback((id: string) => {
    const updated = load().map(s => s.id === id ? { ...s, read: true } : s);
    save(updated);
    setSuggestions(updated);
  }, []);

  const deleteSuggestion = useCallback((id: string) => {
    const updated = load().filter(s => s.id !== id);
    save(updated);
    setSuggestions(updated);
  }, []);

  const unreadCount = suggestions.filter(s => !s.read).length;

  return { suggestions, addSuggestion, markRead, deleteSuggestion, unreadCount };
}
