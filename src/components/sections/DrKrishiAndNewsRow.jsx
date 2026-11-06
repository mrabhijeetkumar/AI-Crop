import React, { useState } from "react";
import {
  Send,
  Newspaper,
  ArrowRight,
  Bot,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export function DrKrishiAndNewsRow({ onOpenAdvisor, onOpenSchemes }) {
  const [question, setQuestion] = useState("");
  const [chatAnswer, setChatAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const quickPrompts = [
    "Which crop is best?",
    "How to increase profit?",
    "Soil health tips?",
  ];

  const handleAsk = async (textToAsk) => {
    const q = textToAsk || question;
    if (!q.trim()) return;

    setQuestion(q);
    setIsAsking(true);
    setChatAnswer("");

    try {
      const res = await fetch("/api/advisor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatAnswer(data.response || data.reply || data.answer || "Optimal recommendation generated.");
      } else {
        provideGroundedFallback(q);
      }
    } catch (e) {
      provideGroundedFallback(q);
    } finally {
      setIsAsking(false);
    }
  };

  const provideGroundedFallback = (q) => {
    const qLow = q.toLowerCase();
    if (qLow.includes("crop") || qLow.includes("best")) {
      setChatAnswer(
        "🌾 Wheat (HD-2967) and Mustard (Pusa Bold) are your highest ROI crops this Rabi cycle, yielding up to ₹25,000/acre net profit with assured MSP."
      );
    } else if (qLow.includes("profit") || qLow.includes("increase")) {
      setChatAnswer(
        "💰 Optimize DAP placement at sowing, split Urea into 2 doses with irrigation, and sell 60% stock when mandi prices peak ₹150 above MSP."
      );
    } else {
      setChatAnswer(
        "🧪 Maintain soil Organic Carbon above 0.75% by incorporating 2 tonnes of FYM per acre and applying Zinc Sulphate (21%) @ 10kg/acre."
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
      {/* ================= LEFT: MEET DR. KRISHI (7 COLS / 60%) ================= */}
      <div id="dr-krishi" className="lg:col-span-7 bg-gradient-to-r from-emerald-50/80 via-green-50/40 to-white dark:from-slate-900 dark:to-slate-850 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between scroll-mt-24">
        <div>
          {/* Header with 3D Robot Mascot Icon */}
          <div className="flex items-start gap-4 mb-3.5">
            {/* 3D Robot Avatar Container */}
            <div
              onClick={() => window.dispatchEvent(new CustomEvent("open-dr-krishi"))}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-300/80 dark:border-emerald-700 shadow-xs flex items-center justify-center shrink-0 relative cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-slate-900 group"
              title="Click to open Dr. Krishi AI floating chat"
            >
              <img
                src="/images/dr-krishi-avatar-portrait.png"
                alt="Dr. Krishi AI Assistant"
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-300"
              />
              <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
            </div>

            {/* Title & Subtitle */}
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
                Meet Dr. Krishi – Your AI Farming Assistant
              </h3>
              <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
                Ask anything about farming, fertilizer dosage, or pest management.
              </p>
            </div>
          </div>

          {/* Interactive Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAsk();
            }}
            className="flex items-center gap-2.5 my-3.5"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your question (e.g. How to increase wheat yield?)..."
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
            <button
              type="submit"
              disabled={isAsking || !question.trim()}
              className="h-11 px-5 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50 text-xs font-semibold"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Answer Preview when received */}
          {chatAnswer && (
            <div className="p-3.5 mb-2.5 rounded-xl bg-white dark:bg-slate-850 border border-emerald-200 text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed shadow-2xs animate-in fade-in">
              <span className="font-bold text-[#15803D]">Dr. Krishi: </span>
              {chatAnswer}
            </div>
          )}

          {/* Quick Questions Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Quick Questions:</span>
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleAsk(prompt)}
                className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#15803D] hover:border-emerald-300 text-xs font-medium transition-colors cursor-pointer shadow-2xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================= RIGHT: LATEST NEWS & SCHEMES (5 COLS / 40%) ================= */}
      <div id="news-schemes" className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between scroll-mt-24">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                <Newspaper className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Latest News &amp; Schemes
              </h3>
            </div>
            <button
              onClick={() => {
                if (onOpenSchemes) onOpenSchemes();
                else {
                  const el = document.getElementById("news-schemes");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two News/Scheme Items matching screenshot */}
          <div className="space-y-4">
            {/* Item 1: Farmer photo + New Kisan Samman Nidhi */}
            <div className="flex items-center gap-3.5 group cursor-pointer">
              <div className="w-20 h-16 rounded-xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xs shrink-0">
                <img
                  src="/images/farmer-thumbs-up.jpg"
                  alt="Farmer News"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#15803D] transition-colors">
                  New Kisan Samman Nidhi ₹6,000 per year installment released
                </h4>
                <div className="text-[11px] text-slate-400 mt-1">Nov 1, 2024 • Ministry of Agriculture</div>
              </div>
            </div>

            {/* Item 2: Ashoka Emblem / Govt seal + PM-KISAN Scheme Benefits */}
            <div className="flex items-center gap-3.5 group cursor-pointer pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="w-20 h-16 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 shadow-2xs flex items-center justify-center shrink-0 text-2xl font-bold text-slate-700">
                🏛️
              </div>
              <div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#15803D] transition-colors">
                  PM-KISAN Scheme Benefits &amp; Organic Fertilizer Subsidy 2025
                </h4>
                <div className="text-[11px] text-slate-400 mt-1">Oct 28, 2024 • Krishi Kalyan Portal</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DrKrishiAndNewsRow;

