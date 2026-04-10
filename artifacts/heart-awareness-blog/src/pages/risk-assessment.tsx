import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity, ArrowRight, RefreshCcw, HeartPulse } from "lucide-react";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";

type QuestionDef = {
  id: string;
  qKey: string;
  options: { value: string; labelKey: string; points: number }[];
};

const QUESTION_DEFS: QuestionDef[] = [
  { id: "age", qKey: "rq1", options: [
    { value: "under_40", labelKey: "rq1_o1", points: 0 },
    { value: "40_55",    labelKey: "rq1_o2", points: 1 },
    { value: "56_70",    labelKey: "rq1_o3", points: 2 },
    { value: "over_70",  labelKey: "rq1_o4", points: 3 },
  ]},
  { id: "smoking", qKey: "rq2", options: [
    { value: "never",         labelKey: "rq2_o1", points: 0 },
    { value: "former",        labelKey: "rq2_o2", points: 1 },
    { value: "current_light", labelKey: "rq2_o3", points: 2 },
    { value: "current_heavy", labelKey: "rq2_o4", points: 3 },
  ]},
  { id: "bp", qKey: "rq3", options: [
    { value: "normal",   labelKey: "rq3_o1", points: 0 },
    { value: "elevated", labelKey: "rq3_o2", points: 1 },
    { value: "high",     labelKey: "rq3_o3", points: 2 },
    { value: "unknown",  labelKey: "rq3_o4", points: 1 },
  ]},
  { id: "family", qKey: "rq4", options: [
    { value: "no",          labelKey: "rq4_o1", points: 0 },
    { value: "yes_distant", labelKey: "rq4_o2", points: 1 },
    { value: "yes_close",   labelKey: "rq4_o3", points: 2 },
    { value: "unknown",     labelKey: "rq4_o4", points: 1 },
  ]},
  { id: "exercise", qKey: "rq5", options: [
    { value: "daily",     labelKey: "rq5_o1", points: 0 },
    { value: "sometimes", labelKey: "rq5_o2", points: 1 },
    { value: "rarely",    labelKey: "rq5_o3", points: 2 },
    { value: "never",     labelKey: "rq5_o4", points: 3 },
  ]},
  { id: "stress", qKey: "rq6", options: [
    { value: "low",      labelKey: "rq6_o1", points: 0 },
    { value: "moderate", labelKey: "rq6_o2", points: 1 },
    { value: "high",     labelKey: "rq6_o3", points: 2 },
  ]},
];

export default function RiskAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);
  const { t } = useLanguage();

  const handleAnswer = (value: string) => {
    const q = QUESTION_DEFS[currentStep];
    const opt = q.options.find(o => o.value === value);
    setAnswers(prev => ({ ...prev, [q.id]: opt?.points ?? 0 }));
  };

  const handleNext = () => {
    if (currentStep < QUESTION_DEFS.length - 1) setCurrentStep(p => p + 1);
    else setIsComplete(true);
  };

  const resetQuiz = () => { setCurrentStep(0); setAnswers({}); setIsComplete(false); };

  const calculateRisk = () => {
    const score = Object.values(answers).reduce((a, b) => a + b, 0);
    if (score <= 3) return { levelKey: "risk_low",      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", textKey: "risk_low_text" };
    if (score <= 7) return { levelKey: "risk_moderate", color: "text-amber-600 bg-amber-500/10 border-amber-500/20",       textKey: "risk_moderate_text" };
    return             { levelKey: "risk_higher",    color: "text-destructive bg-destructive/10 border-destructive/20",    textKey: "risk_higher_text" };
  };

  const risk = isComplete ? calculateRisk() : null;
  const remaining = QUESTION_DEFS.length - currentStep - 1;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 md:py-24 font-['Outfit',sans-serif]">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">

        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-4">{t("risk_badge")}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#0f0c0c] mb-4 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {t("risk_h1")}
          </h1>
          <p className="text-sm text-[#8a7070] leading-relaxed font-light max-w-sm mx-auto">{t("risk_sub")}</p>
        </div>

        <div className="w-full h-0.5 bg-[#e8d8d4] mb-8 rounded-full overflow-hidden">
          <div className="h-full bg-red-700 transition-all duration-500 ease-out"
            style={{ width: isComplete ? "100%" : `${(currentStep / QUESTION_DEFS.length) * 100}%` }} />
        </div>

        <div className="bg-white border border-[#e8d8d4] rounded-2xl overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }} className="p-8 md:p-12">
                <div className="mb-8">
                  <span className="text-[10px] font-medium text-red-700 uppercase tracking-widest mb-3 block">
                    {t("risk_q_of", { n: currentStep + 1, t: QUESTION_DEFS.length })}
                  </span>
                  <h2 className="text-2xl font-bold text-[#0f0c0c] leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {t(QUESTION_DEFS[currentStep].qKey)}
                  </h2>
                </div>

                <RadioGroup onValueChange={handleAnswer} className="gap-3 mb-8">
                  {QUESTION_DEFS[currentStep].options.map(opt => (
                    <div key={opt.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={opt.value} id={opt.value} className="peer sr-only" />
                      <Label htmlFor={opt.value}
                        className="flex flex-1 items-center rounded-xl border border-[#e8d8d4] bg-[#faf8f5] p-4 hover:border-red-300 hover:bg-red-50 peer-data-[state=checked]:border-red-700 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all text-sm text-[#0f0c0c] font-light">
                        {t(opt.labelKey)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center pt-6 border-t border-[#e8d8d4]">
                  <span className="text-xs text-[#c0a8a8]">
                    {remaining === 1 ? t("risk_remaining_1") : t("risk_remaining_p", { n: remaining })}
                  </span>
                  <Button onClick={handleNext}
                    disabled={answers[QUESTION_DEFS[currentStep].id] === undefined}
                    className="bg-[#0f0c0c] hover:bg-red-700 text-white rounded-full px-8 text-sm font-medium transition-colors">
                    {currentStep === QUESTION_DEFS.length - 1 ? t("risk_see_results") : t("risk_next")}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="results" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }} className="p-8 md:p-12 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <Activity className="h-8 w-8 text-red-700" />
                </div>
                <h2 className="text-3xl font-bold text-[#0f0c0c] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {t("risk_complete_h2")}
                </h2>
                <p className="text-sm text-[#8a7070] mb-8 font-light">{t("risk_complete_sub")}</p>

                <div className={`w-full max-w-sm rounded-2xl border-2 p-8 mb-8 ${risk?.color}`}>
                  <span className="text-4xl font-bold block mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {t(risk!.levelKey)} {t("risk_suffix")}
                  </span>
                  <p className="text-sm font-medium opacity-90">{t(risk!.textKey)}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-sm mb-8">
                  <button onClick={resetQuiz}
                    className="flex items-center justify-center gap-2 border border-[#e8d8d4] rounded-full py-3 px-6 text-sm font-medium text-[#8a7070] hover:border-[#0f0c0c] hover:text-[#0f0c0c] transition-colors cursor-pointer">
                    <RefreshCcw className="h-4 w-4" />
                    {t("risk_retake")}
                  </button>
                  <Link href="/articles">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#0f0c0c] hover:bg-red-700 text-white rounded-full py-3 px-6 text-sm font-medium transition-colors cursor-pointer">
                      <HeartPulse className="h-4 w-4" />
                      {t("risk_read_art")}
                    </button>
                  </Link>
                </div>
                <p className="text-[11px] text-[#c0a8a8] max-w-xs font-light">{t("risk_edu")}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
