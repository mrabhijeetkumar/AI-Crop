import React from "react";
import {
  Tractor,
  Sprout,
  HeartPulse,
} from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";

export function FarmOverviewKPISection({ onOpenFieldModal }) {
  const farm = useFarm();
  const farmProfile = farm?.farmProfile || {};
  const fields = farm?.fields || [];
  const totalArea = Number(
    farmProfile.totalAreaAcres ||
      fields.reduce((total, field) => total + Number(field.areaAcres || 0), 0) ||
      5.5
  );
  const activeCrops =
    new Set(fields.map((field) => field.currentCrop).filter(Boolean)).size ||
    (fields.length > 0 ? fields.length : 4);

  return (
    <section id="farm-overview" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
        {/* ================= CARD 1: TOTAL FARM AREA ================= */}
        <div
          onClick={onOpenFieldModal}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 min-h-[126px] h-full shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Tractor className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Total Farm Area
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[25px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                  {totalArea.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Acres
                </span>
                <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  +5%
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">
                Registered Land
              </span>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: ACTIVE CROPS ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 min-h-[126px] h-full shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Active Crops
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[25px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                  {activeCrops} Crops
                </span>
                <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  +1 new
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">
                Wheat, Mustard +2
              </span>
            </div>
          </div>
        </div>

        {/* ================= CARD 3: EXPECTED PROFIT ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 min-h-[126px] h-full shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs group-hover:scale-105 transition-transform text-lg font-extrabold">
              ₹
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Expected Profit
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[25px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                  ₹85,000
                </span>
                <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  +18%
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">
                This Season
              </span>
            </div>
          </div>
        </div>

        {/* ================= CARD 4: CROP HEALTH ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 min-h-[126px] h-full shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all duration-200 flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">
                Crop Health
              </span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-[25px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                  92%
                </span>
                <span className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  +3%
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 block">
                Optimal Vigor
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FarmOverviewKPISection;
