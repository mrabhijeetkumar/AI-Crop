// src/components/sections/CropRecommendationsSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Sprout, ArrowRight, Clock, MapPin, Sparkles } from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { SQ, averageSoil, cleanCropName, getCropEconomics, getCurrentSeason } from "../../utils/agronomy.js";

const IMAGES = {
  wheat: "/images/crop-wheat.jpg",
  mustard: "/images/crop-mustard.jpg",
  rice: "/images/crop-rice.jpg",
  paddy: "/images/crop-rice.jpg",
  maize: "/images/crop-maize.jpg",
  corn: "/images/crop-maize.jpg",
  cotton: "/images/crop-cotton.jpg",
  potato: "/images/crop-potato.jpg",
  sugarcane: "/images/crop-sugarcane.jpg",
  chickpea: "/images/crop-chickpea.jpg",
  gram: "/images/crop-chickpea.jpg",
  chana: "/images/crop-chickpea.jpg",
  soybean: "/images/crop-soybean.jpg",
  soya: "/images/crop-soybean.jpg",
};
const imageFor = (name = "") => IMAGES[Object.keys(IMAGES).find((k) => name.toLowerCase().includes(k))];

const FALLBACK = [
  { id: "wheat", name: "Wheat", variety: "HD-2967 / HD-3086", suitabilityScore: 94, expectedProfitPerAcre: 25000, duration: "120-140 days", expectedYieldQtl: 22.5, estimatedInvestment: 21500, tag: "Highest Return" },
  { id: "mustard", name: "Mustard", variety: "Pusa Bold", suitabilityScore: 89, expectedProfitPerAcre: 22000, duration: "100-120 days", expectedYieldQtl: 8.5, estimatedInvestment: 14200, tag: "Low Water" },
  { id: "rice", name: "Rice", variety: "Basmati 1121", suitabilityScore: 82, expectedProfitPerAcre: 18000, duration: "120-150 days", expectedYieldQtl: 28, estimatedInvestment: 24000, tag: "High Demand" },
];

/** Maps one /api/predict recommendation (per-hectare numbers) to a dashboard card (per-acre). */
function mapRecommendation(r, i) {
  const full = r.cropDisplayName || r.crop || "Crop";
  const name = cleanCropName(full);
  const eco = getCropEconomics(name);
  const round100 = (n) => Math.round(n / 100) * 100;
  const profit = Number(r.expectedProfit) ? round100(Number(r.expectedProfit) / SQ) : eco.profit;
  const invest = Number(r.cultivationCost) ? round100(Number(r.cultivationCost) / SQ) : eco.cost;
  const yieldQtl = Number(r.expectedYield) ? Math.round(((Number(r.expectedYield) * 10) / SQ) * 10) / 10 : eco.yield;
  return {
    id: String(r.crop || name).toLowerCase(),
    name,
    variety: (full.match(/\(([^)]+)\)/) || [])[1] || "",
    scientificName: r.scientificName,
    season: r.growingSeason,
    suitabilityScore: Number(r.suitabilityScore) || 85,
    expectedProfitPerAcre: profit,
    estimatedInvestment: invest,
    expectedYieldQtl: yieldQtl,
    duration: r.durationDays ? `${String(r.durationDays).replace(/\s*days?/i, "")} days` : "—",
    tag: i === 0 ? "Best Match" : r.riskLevel ? `${r.riskLevel} Risk` : "Recommended",
    aiInsight: r.aiInsight,
  };
}

function CropImage({ crop }) {
  const [failed, setFailed] = useState(false);
  const src = imageFor(crop.name);
  if (!src || failed) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-green-50 dark:from-emerald-950 dark:to-slate-800 text-[#15803D]">
        <Sprout className="w-10 h-10" />
      </div>
    );
  }
  return (
    <img src={src} alt={crop.name} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
  );
}

export function CropRecommendationsSection({ onOpenCropBlueprint, onOpenFullAnalysis }) {
  const { farmProfile = {}, fields = [] } = useFarm();
  const [crops, setCrops] = useState(FALLBACK);
  const [status, setStatus] = useState("loading"); // loading | ai | fallback

  const district = farmProfile.district || (farmProfile.location || "").split(",")[0]?.trim() || "";
  const state = farmProfile.state || "";
  const locationLabel = [district, state].filter(Boolean).join(", ") || farmProfile.location || "Set farm location";
  const soil = useMemo(() => averageSoil(fields), [fields]);

  useEffect(() => {
    const ctrl = new AbortController();
    setStatus("loading");
    fetch("/api/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: ctrl.signal,
      body: JSON.stringify({
        state: state || "Punjab",
        district: district || "Ludhiana",
        season: getCurrentSeason(),
        nitrogen: soil.nitrogen,
        phosphorus: soil.phosphorus,
        potassium: soil.potassium,
        ph: soil.ph,
        soilType: farmProfile.primarySoilType || "Alluvial",
      }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("predict"))))
      .then((d) => {
        const list = Array.isArray(d?.recommendations) ? d.recommendations.slice(0, 3).map(mapRecommendation) : [];
        if (list.length) { setCrops(list); setStatus("ai"); } else { setCrops(FALLBACK); setStatus("fallback"); }
      })
      .catch((e) => { if (e.name !== "AbortError") { setCrops(FALLBACK); setStatus("fallback"); } });
    return () => ctrl.abort();
  }, [state, district, soil.nitrogen, soil.phosphorus, soil.potassium, soil.ph, farmProfile.primarySoilType]);

  return (
    <section id="crop-recommendations" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">AI Crop Recommendations</h3>
              <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${status === "ai"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
                  : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                }`}>
                <Sparkles className="w-3 h-3" /> {status === "ai" ? `Live · ${getCurrentSeason()} season` : status === "loading" ? "Analysing…" : "Sample data"}
              </span>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Best matched crops for your farm based on soil chemistry, weather and APMC market trends.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onOpenFullAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Change State, District & Village"
            >
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" /> <span>{locationLabel}</span>
            </button>
            <button onClick={onOpenFullAnalysis} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors">
              <span>View All Crops</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 transition-opacity ${status === "loading" ? "opacity-60" : "opacity-100"}`}>
          {crops.map((crop) => (
            <div key={crop.id} className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/90 dark:border-slate-700/70 p-4 sm:p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200 flex items-center gap-4 group">
              <div className="w-[104px] h-[104px] sm:w-[112px] sm:h-[112px] rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-100 relative">
                <CropImage crop={crop} />
                {crop.tag && (
                  <span className="absolute left-1.5 top-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold backdrop-blur-sm">{crop.tag}</span>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between min-h-[104px]">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white truncate">{crop.name}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-emerald-950/80 text-[#15803D] dark:text-emerald-400 shrink-0">{crop.suitabilityScore}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{crop.variety}</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                    ₹{Number(crop.expectedProfitPerAcre).toLocaleString("en-IN")} <span className="text-[11px] font-medium text-slate-400">net / acre</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> <span>{crop.duration}</span>
                  </div>
                </div>
                <button
                  onClick={() => onOpenCropBlueprint?.(crop)}
                  className="mt-2 w-full h-9 px-3 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-[0.98]"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CropRecommendationsSection;