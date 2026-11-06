import React from "react";
import { SOIL_TYPES } from "../../data/soilTypes.js";
import {
  Layers,
  CheckCircle2,
  Droplets,
  Sparkles,
  Award,
  Leaf,
  Info,
} from "lucide-react";

export function SoilTextureSelector({
  selectedSoilId,
  onSelectSoil,
  onApplyDefaults,
}) {
  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Pedological Soil Classifications & Texture Explorer
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Select a pedological soil order to inspect physical permeability, natural fertility buffers, and suitable crop rotations
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
          ICAR Soil Taxonomy
        </span>
      </div>

      {/* Grid of Soil Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOIL_TYPES.map((st) => {
          const isSelected = selectedSoilId === st.id;
          return (
            <div
              key={st.id}
              onClick={() => onSelectSoil(st.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? "bg-emerald-50/80 dark:bg-[#141414] border-emerald-500 shadow-md shadow-emerald-950/30"
                  : "bg-slate-50 dark:bg-[#0a0d0c] border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: st.color }}
                    />
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                      {st.name}
                    </h4>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                  {st.description}
                </p>

                {/* Key Soil Properties */}
                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-neutral-400 pt-1">
                  <div>
                    <span className="text-slate-400 block font-semibold">Texture:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">
                      {st.texture}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold">Drainage:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate block">
                      {st.drainage}
                    </span>
                  </div>
                </div>

                {/* Recommended Crops Tags */}
                <div className="pt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                    Prime Compatible Crops:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {st.typicalCrops.slice(0, 4).map((cropName, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-md bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-700 dark:text-slate-300"
                      >
                        {cropName}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Apply Baseline Button */}
              <div className="pt-3 mt-3 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  pH: {st.defaultPH} | NPK: {st.defaultN}-{st.defaultP}-{st.defaultK}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onApplyDefaults(st);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold transition-colors cursor-pointer"
                >
                  Load Defaults
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
