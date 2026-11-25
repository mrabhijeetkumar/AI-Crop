import React, { useState, useEffect } from "react";
import {
  Scale,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Layers,
  ArrowRight,
  Sparkles,
  DollarSign,
  Calendar,
  Check,
} from "lucide-react";

function getShortCropName(displayName) {
  if (!displayName) return "";
  if (displayName.toLowerCase().includes("cotton")) return "Bt Cotton";
  if (displayName.toLowerCase().includes("rice") || displayName.toLowerCase().includes("paddy")) return "Rice / Paddy";
  if (displayName.toLowerCase().includes("mustard")) return "Mustard";
  if (displayName.toLowerCase().includes("chickpea") || displayName.toLowerCase().includes("chana")) return "Chickpea";
  // Remove parenthetical varieties, e.g. "Wheat (HD-2967 / HD-3086)" -> "Wheat"
  const clean = displayName.replace(/\s*\(.*?\)/, "").trim();
  if (clean.includes("/")) {
    return clean.split("/")[0].trim();
  }
  return clean;
}

export function CropComparisonMatrix({
  recommendations = [],
  formState,
  isDarkMode,
  onSelectCrop,
  onOpenAdvisor,
}) {
  const [selectedCropNames, setSelectedCropNames] = useState(() => {
    return recommendations.slice(0, 3).map((r) => r.crop);
  });

  useEffect(() => {
    if (recommendations.length > 0) {
      const valid = selectedCropNames.filter((name) =>
        recommendations.some((r) => r.crop === name)
      );
      if (valid.length === 0) {
        setSelectedCropNames(recommendations.slice(0, 3).map((r) => r.crop));
      }
    }
  }, [recommendations]);

  const availableCrops = recommendations.slice(0, 8);
  const selectedCropsData = recommendations.filter((r) =>
    selectedCropNames.includes(r.crop)
  );

  const toggleCrop = (cropId) => {
    if (selectedCropNames.includes(cropId)) {
      if (selectedCropNames.length > 1) {
        setSelectedCropNames((prev) => prev.filter((id) => id !== cropId));
      }
    } else {
      if (selectedCropNames.length < 4) {
        setSelectedCropNames((prev) => [...prev, cropId]);
      } else {
        setSelectedCropNames((prev) => [...prev.slice(1), cropId]);
      }
    }
  };

  const landAreaHa = Number(formState?.landArea) || 1;

  return (
    <div className="space-y-6">
      {/* Selector Strip */}
      <div className="app-card p-5 sm:p-6 transition-all shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold font-heading flex items-center gap-2.5 text-slate-900 dark:text-white">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                <Scale className="w-4 h-4" />
              </span>
              Select Crops for Comparative Trade-Off Analysis (Up to 4)
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400 pl-10 sm:pl-10.5">
              Compare projected return, input costs, agronomic risk, and water requirement side-by-side.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 shrink-0 self-start sm:self-auto">
            {selectedCropNames.length} of 4 Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {availableCrops.map((c) => {
            const isSelected = selectedCropNames.includes(c.crop);
            const shortName = getShortCropName(c.cropDisplayName);
            return (
              <button
                key={c.crop}
                type="button"
                onClick={() => toggleCrop(c.crop)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30 ring-1 ring-emerald-500"
                    : "bg-slate-50 hover:bg-white dark:bg-[#141414] dark:hover:bg-[#1c1c1c] text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 shadow-2xs"
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-neutral-600" />
                )}
                <span>{shortName}</span>
                <span
                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md ${
                    isSelected
                      ? "bg-white/20 text-white font-semibold"
                      : "bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-neutral-400 font-semibold"
                  }`}
                >
                  {c.suitabilityScore}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {selectedCropsData.map((crop, idx) => {
          const totalProfit = Math.round(crop.expectedProfit * landAreaHa);
          const totalYieldQtl = (crop.expectedYield * 10 * landAreaHa).toFixed(1);
          const isTop = idx === 0;

          return (
            <div
              key={crop.crop}
              className={`rounded-3xl border p-6 flex flex-col justify-between relative transition-all duration-200 ${
                isTop
                  ? "bg-gradient-to-b from-emerald-50/70 via-white to-white dark:bg-[#0F0F0F] border-emerald-400 dark:border-emerald-500/60 shadow-xl shadow-emerald-500/10 dark:shadow-emerald-950/40 ring-1 ring-emerald-400/40 dark:ring-emerald-500/30"
                  : "bg-white dark:bg-[#0F0F0F] border-slate-200/90 dark:border-white/10 hover:border-emerald-500/40 shadow-sm hover:shadow-md"
              }`}
            >
              <div className="space-y-4">
                {isTop && (
                  <div className="mb-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                      Top Recommendation
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-neutral-300">
                      {crop.category}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <Calendar className="w-3 h-3" />
                      {crop.growingSeason}
                    </span>
                  </div>
                  <h4 className="text-xl font-bold font-heading text-slate-900 dark:text-white leading-tight">
                    {crop.cropDisplayName}
                  </h4>
                  <div className="text-xs italic text-slate-500 dark:text-neutral-400 font-mono mt-1">
                    {crop.scientificName}
                  </div>
                </div>

                {/* Score badge */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/[0.08] dark:bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
                      Agronomic Fit
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {crop.suitabilityScore}%
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase">
                      Match
                    </span>
                  </div>
                </div>

                {/* Economic Matrix */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Projected Net Profit</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹{crop.expectedProfit.toLocaleString("en-IN")}/ha
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Field Total ({landAreaHa} ha)</span>
                    <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ₹{totalProfit.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Expected Yield</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      {crop.expectedYield} t/ha <span className="text-slate-400 font-normal">({totalYieldQtl} Qtl)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">APMC Mandi Price</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">
                      ₹{crop.marketPrice.toLocaleString("en-IN")}/qtl
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Cultivation Cost</span>
                    <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                      ₹{crop.cultivationCost.toLocaleString("en-IN")}/ha
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-white/[0.06]">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Growth Duration</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{crop.durationDays}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-500 dark:text-neutral-400 font-medium">Agronomic Risk</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${
                        crop.riskLevel === "Low"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25"
                          : crop.riskLevel === "Moderate"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25"
                          : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25"
                      }`}
                    >
                      {crop.riskLevel} Risk
                    </span>
                  </div>
                </div>

                {/* Compatibility Bars */}
                <div className="space-y-2.5 pt-2.5 border-t border-slate-100 dark:border-white/[0.08]">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 text-slate-600 dark:text-neutral-300 font-medium">
                      <span>Soil Nutrient Match</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{crop.soilSuitability}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                        style={{ width: `${crop.soilSuitability}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1.5 text-slate-600 dark:text-neutral-300 font-medium">
                      <span>Climate &amp; Temp Match</span>
                      <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{crop.temperatureCompatibility}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-white/[0.08] overflow-hidden p-0.5">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full transition-all duration-500"
                        style={{ width: `${crop.temperatureCompatibility}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 space-y-2.5">
                <button
                  type="button"
                  onClick={() => onSelectCrop(crop)}
                  className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    isTop
                      ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-slate-900 hover:bg-emerald-600 text-white dark:bg-[#181818] dark:hover:bg-emerald-600 dark:text-white border border-slate-800 dark:border-white/10 hover:border-emerald-600 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  <span>Select &amp; View Full Dossier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAdvisor(crop)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 bg-slate-50/80 dark:bg-[#141414] hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-neutral-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Ask Dr. Krishi AI</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
