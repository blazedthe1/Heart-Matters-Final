import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LangCode, LANGUAGES, T } from "@/data/translations";

interface LanguageContextValue {
  lang: LangCode;
  dir: "ltr" | "rtl";
  setLang: (l: LangCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  dir: "ltr",
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");

  const langMeta = LANGUAGES.find((l) => l.code === lang)!;
  const dir = langMeta?.dir ?? "ltr";

  const setLang = (l: LangCode) => {
    setLangState(l);
  };

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const row = T[key];
    if (!row) return key;
    let str = row[lang] ?? row["en"] ?? key;
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      });
    }
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
