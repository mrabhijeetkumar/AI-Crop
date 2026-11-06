import React from "react";
import {
  Sprout,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
} from "lucide-react";

export function CropRecommendationsSection({
  onOpenCropBlueprint,
  onOpenFullAnalysis,
}) {
  const recommendedCrops = [
    {
      id: "wheat",
      name: "Wheat",
      variety: "HD-2967 / HD-3086",
      score: "94%",
      pricePerAcre: "₹25,000 / acre",
      expectedProfitPerAcre: 25000,
      duration: "120-140 days",
      expectedYieldQtl: 22.5,
      estimatedInvestment: 21500,
      suitabilityScore: 94,
      image: "/images/crop-wheat.jpg",
      tag: "Highest Return",
    },
    {
      id: "mustard",
      name: "Mustard",
      variety: "Pusa Bold",
      score: "89%",
      pricePerAcre: "₹22,000 / acre",
      expectedProfitPerAcre: 22000,
      duration: "100-120 days",
      expectedYieldQtl: 8.5,
      estimatedInvestment: 14200,
      suitabilityScore: 89,
      image: "/images/crop-mustard.jpg",
      tag: "Low Water",
    },
    {
      id: "rice",
      name: "Rice",
      variety: "Basmati 1121",
      score: "82%",
      pricePerAcre: "₹18,000 / acre",
      expectedProfitPerAcre: 18000,
      duration: "120-150 days",
      expectedYieldQtl: 28.0,
      estimatedInvestment: 24000,
      suitabilityScore: 82,
      image: "/images/crop-rice.jpg",
      tag: "High Demand",
    },
  ];

  return (
    <section id="crop-recommendations" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                AI Crop Recommendations
              </h3>
            </div>
            <p className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Best matched crops for your farm based on soil chemistry, weather forecast and APMC market trends.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenFullAnalysis}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
              title="Click to change State, District & Village"
            >
              <MapPin className="w-3.5 h-3.5 text-[#15803D]" />
              <span>Phagwara, Kapurthala, Punjab</span>
            </button>

            {onOpenFullAnalysis && (
              <button
                onClick={onOpenFullAnalysis}
                className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View All Crops</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 3 Clean Recommendation Cards Matching Reference Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6">
          {recommendedCrops.map((crop) => (
            <div
              key={crop.id}
              className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-5 hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex items-center gap-4 group"
            >
              {/* Photo Thumbnail (115-120px) */}
              <div className="w-[115px] h-[115px] sm:w-[120px] sm:h-[120px] rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700 bg-slate-100 relative shadow-2xs">
                <img
                  src={crop.image}
                  alt={crop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Card Body */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-[115px] sm:h-[120px] py-0.5">
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white truncate">
                      {crop.name}
                    </h4>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-emerald-950/80 text-[#15803D] dark:text-emerald-400 shrink-0">
                      {crop.score}
                    </span>
                  </div>

                  <div className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-slate-100 mb-0.5">
                    {crop.pricePerAcre}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{crop.duration}</span>
                  </div>
                </div>

                <button
                  onClick={() => onOpenCropBlueprint && onOpenCropBlueprint(crop)}
                  className="w-full h-9 sm:h-10 px-3 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
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
