// src/components/sections/DrKrishiAndNewsRow.jsx
import React, { useEffect, useState } from "react";
import { Send, Newspaper, ArrowRight, ExternalLink, MessageSquare, Sprout } from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { RichText } from "../advisor/RichText.jsx";
import { askDrKrishi, buildFarmContext, OFFLINE_REPLY } from "../../utils/advisorApi.js";

const QUICK_PROMPTS = ["Which crop is best?", "How to increase profit?", "Soil health tips?"];

const FALLBACK_SCHEMES = [
  { id: "pm_kisan", scheme_name: "PM-KISAN", benefit: "₹6,000/year income support in 3 installments via DBT.", official_portal: "https://pmkisan.gov.in" },
  { id: "pmfby", scheme_name: "PMFBY Crop Insurance", benefit: "Low-premium cover against yield loss and local calamities.", official_portal: "https://pmfby.gov.in" },
  { id: "kcc", scheme_name: "Kisan Credit Card (KCC)", benefit: "Low-interest crop credit with prompt-repayment incentive.", official_portal: "https://www.myscheme.gov.in/schemes/kcc" },
];

export function DrKrishiAndNewsRow({ onOpenAdvisor, onOpenSchemes }) {
  const { farmProfile = {}, fields = [], weather = {} } = useFarm();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [schemes, setSchemes] = useState(FALLBACK_SCHEMES);

  // Real scheme matching from the backend (falls back to the static list)
  useEffect(() => {
    const acres = Number(farmProfile.totalAreaAcres) || 2;
    const state = farmProfile.state || "Punjab";
    const crop = (fields[0]?.currentCrop || "Wheat").split("(")[0].trim();
    const ctrl = new AbortController();
    fetch(`/api/ml/schemes?land_acres=${acres}&state=${encodeURIComponent(state)}&crop=${encodeURIComponent(crop)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => Array.isArray(d?.schemes) && d.schemes.length && setSchemes(d.schemes.slice(0, 3)))
      .catch(() => { });
    return () => ctrl.abort();
  }, [farmProfile.totalAreaAcres, farmProfile.state, fields]);

  const handleAsk = async (text) => {
    const q = (text ?? question).trim();
    if (!q || isAsking) return;
    setQuestion(q);
    setIsAsking(true);
    setAnswer("");
    try {
      const res = await askDrKrishi({
        message: q,
        farmContext: buildFarmContext({ farmProfile, fields, weather }),
      });
      setAnswer(res.text);
    } catch {
      setAnswer(OFFLINE_REPLY);
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
      {/* ===== Dr. Krishi ===== */}
      <div id="dr-krishi" className="lg:col-span-7 bg-gradient-to-r from-emerald-50/80 via-green-50/40 to-white dark:from-slate-900 dark:to-slate-800/60 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col scroll-mt-24">
        <div className="flex items-start gap-4 mb-3.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-dr-krishi"))}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-300/80 dark:border-emerald-700 shrink-0 relative cursor-pointer hover:border-emerald-500 hover:scale-105 transition-all bg-emerald-700 flex items-center justify-center"
            title="Open Dr. Krishi floating chat"
            aria-label="Open Dr. Krishi chat"
          >
            <img
              src="/images/dr-krishi-avatar-portrait.png"
              alt=""
              onError={(e) => { e.currentTarget.style.display = "none"; }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <Sprout className="w-8 h-8 text-white" />
            <span className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
          </button>
          <div className="flex-1">
            <h3 className="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
              Meet Dr. Krishi – Your AI Farming Assistant
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Ask anything about farming, fertilizer dosage, or pest management.
            </p>
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex items-center gap-2.5 my-3.5">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question (e.g. How to increase wheat yield?)…"
            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim()}
            className="h-11 px-5 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 disabled:opacity-50 text-xs font-semibold"
          >
            <span>{isAsking ? "Thinking…" : "Ask AI"}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {(isAsking || answer) && (
          <div className="p-3.5 mb-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed max-h-64 overflow-y-auto">
            <span className="font-bold text-[#15803D] block mb-1">Dr. Krishi</span>
            {isAsking ? (
              <div className="flex items-center gap-1.5 py-1">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            ) : (
              <>
                <RichText text={answer} />
                <button
                  type="button"
                  onClick={onOpenAdvisor}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] hover:underline cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Continue in full AI Advisor
                </button>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs mt-auto">
          <span className="text-slate-400 text-[11px] font-semibold">Quick Questions:</span>
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => handleAsk(p)}
              className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#15803D] hover:border-emerald-300 text-xs font-medium transition-colors cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Schemes ===== */}
      <div id="news-schemes" className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col scroll-mt-24">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
              <Newspaper className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Schemes For You</h3>
          </div>
          <button onClick={onOpenSchemes} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors">
            <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3 flex-1">
          {schemes.map((s, i) => (
            <a
              key={s.id || i}
              href={s.official_portal}
              target="_blank"
              rel="noreferrer"
              className={`group flex items-start gap-3 ${i > 0 ? "pt-3 border-t border-slate-100 dark:border-slate-800" : ""}`}
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 flex items-center justify-center shrink-0 text-lg">🏛️</div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white leading-snug group-hover:text-[#15803D] transition-colors flex items-center gap-1">
                  <span className="truncate">{s.scheme_name}</span>
                  <ExternalLink className="w-3 h-3 shrink-0 opacity-50" />
                </h4>
                <p className="text-[11.5px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{s.benefit}</p>
              </div>
            </a>
          ))}
        </div>
        <p className="text-[10px] text-slate-400 mt-4">Eligibility official portal par verify karein.</p>
      </div>
    </div>
  );
}

export default DrKrishiAndNewsRow;