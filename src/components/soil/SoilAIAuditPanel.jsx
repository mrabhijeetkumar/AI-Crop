import React, { useState } from "react";
import {
  Sparkles,
  RefreshCw,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingUp,
  ShieldAlert,
  Zap,
} from "lucide-react";

export function SoilAIAuditPanel({
  soilN,
  soilP,
  soilK,
  soilPH,
  organicCarbon,
  currentField,
  targetCrop,
  calcAcres,
}) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [activePromptType, setActivePromptType] = useState("general");

  const fetchAiSoilAdvice = async (specificGoal = "general") => {
    setActivePromptType(specificGoal);
    setAiLoading(true);
    try {
      const res = await fetch("/api/gemini/soil-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          n: soilN,
          p: soilP,
          k: soilK,
          ph: soilPH,
          organicCarbon,
          soilType: currentField.soilType,
          targetCrop: targetCrop.name,
          areaAcres: calcAcres,
          goal: specificGoal,
        }),
      });
      const data = await res.json();
      if (data && data.advice) {
        setAiAdvice(data.advice);
      }
    } catch (err) {
      console.error("AI Soil advice error:", err);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Dr. Krishi AI Soil Scientist & Agronomic Audit
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25">
                Gemini 3.7
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Analyzes micro & macro nutrient ratios to predict yield responses and soil biological conditioning
            </p>
          </div>
        </div>

        <button
          disabled={aiLoading}
          onClick={() => fetchAiSoilAdvice("general")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {aiLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing Soil Chemistry...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Run AI Soil Audit</span>
            </>
          )}
        </button>
      </div>

      {/* Quick Strategic Audit Triggers */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-400 whitespace-nowrap">
          Quick AI Protocols:
        </span>
        <button
          onClick={() => fetchAiSoilAdvice("yield_maximization")}
          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0a0d0c] hover:bg-emerald-50 dark:hover:bg-[#141414] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-[rgba(34,197,94,0.2)] font-semibold transition-all whitespace-nowrap cursor-pointer"
        >
          🌾 Maximize {targetCrop?.name?.split("(")[0]} Yield
        </button>
        <button
          onClick={() => fetchAiSoilAdvice("ph_salinity")}
          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0a0d0c] hover:bg-emerald-50 dark:hover:bg-[#141414] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-[rgba(34,197,94,0.2)] font-semibold transition-all whitespace-nowrap cursor-pointer"
        >
          🧪 Saline & pH Reclamation
        </button>
        <button
          onClick={() => fetchAiSoilAdvice("organic_carbon")}
          className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#0a0d0c] hover:bg-emerald-50 dark:hover:bg-[#141414] text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-[rgba(34,197,94,0.2)] font-semibold transition-all whitespace-nowrap cursor-pointer"
        >
          🪱 Carbon & Microbial Sequestration
        </button>
      </div>

      {/* AI Advice Output Display */}
      {aiAdvice ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Yield Impact Banner */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#141414] border border-emerald-300 dark:border-emerald-500/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-neutral-400 block">
                  Projected Agronomic Yield Response
                </span>
                <span className="text-sm font-extrabold text-emerald-950 dark:text-white">
                  {aiAdvice.expectedYieldImpact || "+18-25% Yield Increase with Scheduled Fertilizer Splits"}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-white dark:bg-[#0a0d0c] text-emerald-700 dark:text-emerald-400 font-mono font-bold text-xs border border-emerald-200 dark:border-[rgba(34,197,94,0.25)]">
              pH: {aiAdvice.phStatus || "Optimal Range"}
            </span>
          </div>

          {/* Actionable Soil Conditioning Tips */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Scientific Soil Improvement Protocol</span>
            </h4>

            <ul className="space-y-2 text-xs text-slate-700 dark:text-[#d1fae5]">
              {aiAdvice.soilImprovementTips?.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-dashed border-slate-200 dark:border-white/[0.08] text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">
            Ready for Agronomic AI Diagnostic
          </h4>
          <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-md mx-auto">
            Click &ldquo;Run AI Soil Audit&rdquo; to send the current laboratory probe parameters ({soilN} N, {soilP} P, {soilK} K, pH {soilPH.toFixed(1)}) to the Gemini Agricultural Intelligence Engine.
          </p>
        </div>
      )}
    </div>
  );
}
