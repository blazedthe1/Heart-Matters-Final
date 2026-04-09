import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Activity, ArrowRight, RefreshCcw, ShieldAlert, HeartPulse } from "lucide-react";
import { Link } from "wouter";

const questions = [
  {
    id: "age",
    question: "What is your age range?",
    options: [
      { value: "under_40", label: "Under 40", points: 0 },
      { value: "40_55", label: "40 - 55", points: 1 },
      { value: "56_70", label: "56 - 70", points: 2 },
      { value: "over_70", label: "Over 70", points: 3 },
    ]
  },
  {
    id: "smoking",
    question: "What is your smoking status?",
    options: [
      { value: "never", label: "Never smoked", points: 0 },
      { value: "former", label: "Former smoker", points: 1 },
      { value: "current_light", label: "Current smoker (less than a pack/day)", points: 2 },
      { value: "current_heavy", label: "Current smoker (pack or more/day)", points: 3 },
    ]
  },
  {
    id: "bp",
    question: "How is your blood pressure?",
    options: [
      { value: "normal", label: "Normal (around 120/80) / well-managed", points: 0 },
      { value: "elevated", label: "Slightly elevated", points: 1 },
      { value: "high", label: "High (often above 140/90)", points: 2 },
      { value: "unknown", label: "I don't know my numbers", points: 1 },
    ]
  },
  {
    id: "family",
    question: "Do you have a family history of early heart disease? (Before age 55 in men, 65 in women)",
    options: [
      { value: "no", label: "No", points: 0 },
      { value: "yes_distant", label: "Yes, in grandparents/extended family", points: 1 },
      { value: "yes_close", label: "Yes, in parents or siblings", points: 2 },
      { value: "unknown", label: "I'm not sure", points: 1 },
    ]
  },
  {
    id: "exercise",
    question: "How often do you engage in moderate exercise (brisk walking, swimming, cycling) for at least 30 minutes?",
    options: [
      { value: "daily", label: "Almost every day", points: 0 },
      { value: "sometimes", label: "2-3 times a week", points: 1 },
      { value: "rarely", label: "Rarely / less than once a week", points: 2 },
      { value: "never", label: "Never", points: 3 },
    ]
  },
  {
    id: "stress",
    question: "How would you rate your typical daily stress levels?",
    options: [
      { value: "low", label: "Low and well-managed", points: 0 },
      { value: "moderate", label: "Moderate, but I cope okay", points: 1 },
      { value: "high", label: "High, frequently feel overwhelmed", points: 2 },
    ]
  }
];

export default function RiskAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const handleAnswer = (value: string) => {
    const currentQ = questions[currentStep];
    const selectedOption = currentQ.options.find(opt => opt.value === value);
    
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: selectedOption?.points || 0
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setIsComplete(true);
    }
  };

  const resetQuiz = () => {
    setCurrentStep(0);
    setAnswers({});
    setIsComplete(false);
  };

  const calculateRisk = () => {
    const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
    if (totalScore <= 3) return { level: "Low", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20", text: "You're making great choices. Keep maintaining your healthy habits." };
    if (totalScore <= 7) return { level: "Moderate", color: "text-amber-600 bg-amber-500/10 border-amber-500/20", text: "There is room for improvement. Focus on small lifestyle adjustments." };
    return { level: "Higher", color: "text-destructive bg-destructive/10 border-destructive/20", text: "We strongly recommend scheduling a checkup with your doctor to discuss your cardiovascular health." };
  };

  const risk = isComplete ? calculateRisk() : null;

  return (
    <div className="min-h-screen bg-[#faf8f5] py-16 md:py-24 font-['Outfit',sans-serif]">
      <div className="container mx-auto px-4 md:px-6 max-w-2xl">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] tracking-[0.14em] uppercase text-red-700 font-medium mb-4">Know Your Risk</p>
          <h1
            className="text-4xl md:text-5xl font-bold text-[#0f0c0c] mb-4 tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Heart Health Assessment
          </h1>
          <p className="text-sm text-[#8a7070] leading-relaxed font-light max-w-sm mx-auto">
            A quick, confidential quiz to help you understand your baseline cardiovascular risk.
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-0.5 bg-[#e8d8d4] mb-8 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-700 transition-all duration-500 ease-out"
            style={{ width: isComplete ? "100%" : `${(currentStep / questions.length) * 100}%` }}
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e8d8d4] rounded-2xl overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-8 md:p-12"
              >
                <div className="mb-8">
                  <span className="text-[10px] font-medium text-red-700 uppercase tracking-widest mb-3 block">
                    Question {currentStep + 1} of {questions.length}
                  </span>
                  <h2
                    className="text-2xl font-bold text-[#0f0c0c] leading-snug"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {questions[currentStep].question}
                  </h2>
                </div>

                <RadioGroup onValueChange={handleAnswer} className="gap-3 mb-8">
                  {questions[currentStep].options.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} className="peer sr-only" />
                      <Label
                        htmlFor={option.value}
                        className="flex flex-1 items-center rounded-xl border border-[#e8d8d4] bg-[#faf8f5] p-4 hover:border-red-300 hover:bg-red-50 peer-data-[state=checked]:border-red-700 peer-data-[state=checked]:bg-red-50 cursor-pointer transition-all text-sm text-[#0f0c0c] font-light"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex justify-between items-center pt-6 border-t border-[#e8d8d4]">
                  <span className="text-xs text-[#c0a8a8]">
                    {questions.length - currentStep - 1} question{questions.length - currentStep - 1 !== 1 ? "s" : ""} remaining
                  </span>
                  <Button
                    onClick={handleNext}
                    disabled={answers[questions[currentStep].id] === undefined}
                    className="bg-[#0f0c0c] hover:bg-red-700 text-white rounded-full px-8 text-sm font-medium transition-colors"
                  >
                    {currentStep === questions.length - 1 ? "See Results" : "Next"}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="p-8 md:p-12 text-center flex flex-col items-center"
              >
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6">
                  <Activity className="h-8 w-8 text-red-700" />
                </div>

                <h2
                  className="text-3xl font-bold text-[#0f0c0c] mb-2"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  Assessment Complete
                </h2>
                <p className="text-sm text-[#8a7070] mb-8 font-light">Based on your answers, your current risk profile is:</p>

                <div className={`w-full max-w-sm rounded-2xl border-2 p-8 mb-8 ${risk?.color}`}>
                  <span
                    className="text-4xl font-bold block mb-2"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {risk?.level} Risk
                  </span>
                  <p className="text-sm font-medium opacity-90">{risk?.text}</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 w-full max-w-sm mb-8">
                  <button
                    onClick={resetQuiz}
                    className="flex items-center justify-center gap-2 border border-[#e8d8d4] rounded-full py-3 px-6 text-sm font-medium text-[#8a7070] hover:border-[#0f0c0c] hover:text-[#0f0c0c] transition-colors cursor-pointer"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Retake Quiz
                  </button>
                  <Link href="/articles">
                    <button className="w-full flex items-center justify-center gap-2 bg-[#0f0c0c] hover:bg-red-700 text-white rounded-full py-3 px-6 text-sm font-medium transition-colors cursor-pointer">
                      <HeartPulse className="h-4 w-4" />
                      Read Articles
                    </button>
                  </Link>
                </div>

                <p className="text-[11px] text-[#c0a8a8] max-w-xs font-light">
                  For educational purposes only. Not a substitute for professional medical advice. Consult your doctor.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
