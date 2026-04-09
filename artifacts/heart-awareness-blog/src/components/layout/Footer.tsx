import { Link } from "wouter";
import { Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0f0c0c] text-white/40 pt-16 pb-10 font-['Outfit',sans-serif]">
      <div className="container mx-auto px-4 md:px-6 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="flex items-center gap-2.5 mb-5 w-fit">
            <Heart className="h-5 w-5 fill-red-600 text-red-600" />
            <span className="font-bold text-base text-white tracking-tight">Heart Matters</span>
          </Link>
          <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-3">A Student-Led Initiative</p>
          <p className="text-sm leading-relaxed max-w-xs font-light">
            A student-driven cardiovascular health awareness platform from Rajagiri Public School — clear, compassionate, and evidence-based.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-5">Explore</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/articles" className="hover:text-white transition-colors">All Articles</Link></li>
            <li><Link href="/risk-assessment" className="hover:text-white transition-colors">Risk Quiz</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Resources</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white tracking-widest uppercase mb-5">About</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/about" className="hover:text-white transition-colors">Our Mission</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">Our Team</Link></li>
            <li><Link href="/resources" className="hover:text-white transition-colors">Trusted Sources</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 md:px-6 mt-14 pt-8 border-t border-white/[0.07] text-[11px] flex flex-col md:flex-row justify-between items-center gap-4">
        <p>© {new Date().getFullYear()} Heart Matters — Rajagiri Public School.</p>
        <p className="max-w-lg text-center md:text-right opacity-70">
          For educational purposes only. Not a substitute for professional medical advice. Always consult your doctor.
        </p>
      </div>
    </footer>
  );
}
