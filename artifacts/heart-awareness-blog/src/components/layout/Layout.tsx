import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { useLocation } from "wouter";

const tickerItems = [
  "Student-Led Initiative",
  "Cardiovascular Health",
  "Community First",
  "Know Your Risk",
  "Heart Disease Awareness",
  "Prevention Through Education",
  "Rajagiri Public School",
  "Empowering Young Hearts",
];

function Ticker() {
  const repeated = [...tickerItems, ...tickerItems];
  return (
    <div className="bg-red-700 text-white overflow-hidden py-2 select-none">
      <div className="flex animate-ticker whitespace-nowrap">
        {repeated.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-3 px-6 text-xs font-semibold tracking-widest uppercase">
            {item}
            <span className="w-1 h-1 rounded-full bg-red-300 inline-block" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <Ticker />
      <main className="flex-1 flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
