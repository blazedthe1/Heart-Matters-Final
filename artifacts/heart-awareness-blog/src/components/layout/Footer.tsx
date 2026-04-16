import { Link } from "wouter";
import { Heart } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#0f0c0c] text-white/40 pt-16 pb-10 font-['Outfit',sans-serif]">
      <div className="container mx-auto px-4 md:px-6 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 mb-5 w-fit">
            <Heart className="h-5 w-5 fill-red-600 text-red-600" />
            <span className="font-bold text-base text-white tracking-tight">Heart Matters</span>
          </Link>
          <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">{t("footer_initiative")}</p>
          <p className="text-sm leading-relaxed max-w-xs font-light">{t("footer_desc")}</p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-5">{t("footer_explore")}</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/articles" className="hover:text-white transition-colors">{t("footer_all_art")}</Link></li>
            <li><Link href="/risk-assessment" className="hover:text-white transition-colors">{t("footer_quiz")}</Link></li>
            <li><Link href="/interactables" className="hover:text-white transition-colors">{t("nav_interactables")}</Link></li>
            <li><Link href="/suggestions" className="hover:text-white transition-colors">{t("nav_suggestions")}</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">{t("nav_resources")}</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-5">{t("footer_about_lbl")}</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">{t("footer_mission")}</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">{t("footer_team")}</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">{t("footer_trusted")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-14 pt-8 border-t border-white/[0.07] text-[11px] flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Heart Matters</p>
        <p className="max-w-lg text-center md:text-right opacity-70">{t("footer_legal")}</p>
      </div>
    </footer>
  );
}
