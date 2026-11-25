import React, { useState } from "react";
import {
  Layers,
  FlaskConical,
  Sparkles,
  Droplets,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  FileText,
  Sliders,
  RefreshCw,
} from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";

export function SoilHealthSection({ onOpenSoilCardModal }) {
  const farm = useFarm();

  // Interactive Soil Parameter States
  const [ph, setPh] = useState(6.8);
  const [nitrogen, setNitrogen] = useState(245); // kg/ha
  const [phosphorus, setPhosphorus] = useState(18.5); // kg/ha
  const [potassium, setPotassium] = useState(210); // kg/ha
  const [organicCarbon, setOrganicCarbon] = useState(0.68); // %
  const [soilMoisture, setSoilMoisture] = useState(28); // %

  // Status calculation
  const getNutrientStatus = (val, low, high) => {
    if (val < low) return { label: "Deficient", color: "text-amber-600 bg-amber-50 dark:bg-amber-950/60" };
    if (val > high) return { label: "Excess", color: "text-rose-600 bg-rose-50 dark:bg-rose-950/60" };
    return { label: "Optimal", color: "text-emerald-600 bg-green-50 dark:bg-emerald-950/60" };
  };

  const nStatus = getNutrientStatus(nitrogen, 200, 350);
  const pStatus = getNutrientStatus(phosphorus, 15, 25);
  const kStatus = getNutrientStatus(potassium, 150, 300);
  const ocStatus = getNutrientStatus(organicCarbon, 0.5, 0.75);

  return (
    <section id="soil-health" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800 mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Government Soil Health Card (SHC) Telemetry</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Soil Health & Nutrient Card
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Real-time physicochemical audit: Macro-nutrients (N-P-K), organic carbon, pH reaction index, and fertilizer bag calculator.
            </p>
          </div>

          <button
            onClick={() => onOpenSoilCardModal && onOpenSoilCardModal()}
            className="h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-2 shadow-2xs cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#15803D]" />
            <span>View Full Soil Health Card (PDF)</span>
          </button>
        </div>

        {/* 6 Key Parameter Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 my-6">
          {/* Soil pH */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Soil pH</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {ph}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-green-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Neutral (Optimal)
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Ideal range: 6.5 - 7.5</span>
          </div>

          {/* Nitrogen */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Nitrogen (N)</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {nitrogen} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${nStatus.color}`}>
                {nStatus.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 240 - 280 kg/ha</span>
          </div>

          {/* Phosphorus */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Phosphorus (P)</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {phosphorus} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${pStatus.color}`}>
                {pStatus.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 16 - 22 kg/ha</span>
          </div>

          {/* Potassium */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Potassium (K)</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {potassium} <span className="text-xs font-normal text-slate-400">kg/ha</span>
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${kStatus.color}`}>
                {kStatus.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Target: 180 - 250 kg/ha</span>
          </div>

          {/* Organic Carbon */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Organic Carbon</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {organicCarbon}%
              </div>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${ocStatus.color}`}>
                {ocStatus.label}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Target: &gt; 0.75%</span>
          </div>

          {/* Soil Moisture */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">Soil Moisture</span>
            <div className="my-2">
              <div className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
                {soilMoisture}%
              </div>
              <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">
                Adequate
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Root zone sensor depth: 15cm</span>
          </div>
        </div>

        {/* Interactive Sliders & Soil Improvement Recommendations (Two Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Interactive Test Sliders (6 cols) */}
          <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#15803D]" />
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Simulate Custom Soil Test Values
                </span>
              </div>
              <button
                onClick={() => {
                  setPh(6.8);
                  setNitrogen(245);
                  setPhosphorus(18.5);
                  setPotassium(210);
                }}
                className="text-[11px] font-medium text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset Defaults</span>
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* pH Slider */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Soil pH Reaction</span>
                  <strong>{ph}</strong>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="9.0"
                  step="0.1"
                  value={ph}
                  onChange={(e) => setPh(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
              </div>

              {/* Nitrogen Slider */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Available Nitrogen (N)</span>
                  <strong>{nitrogen} kg/ha</strong>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="5"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
              </div>

              {/* Phosphorus Slider */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Available Phosphorus (P)</span>
                  <strong>{phosphorus} kg/ha</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="0.5"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
              </div>

              {/* Potassium Slider */}
              <div>
                <div className="flex justify-between font-medium text-slate-700 dark:text-slate-300 mb-1">
                  <span>Available Potassium (K)</span>
                  <strong>{potassium} kg/ha</strong>
                </div>
                <input
                  type="range"
                  min="80"
                  max="400"
                  step="5"
                  value={potassium}
                  onChange={(e) => setPotassium(Number(e.target.value))}
                  className="w-full accent-green-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Agronomy Prescription & Soil Improvement (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>ICAR Certified Soil Remediation Plan</span>
              </h4>

              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Commercial Fertilizer Recommendation: </strong>
                    Apply 1 bag (50kg) DAP + 20kg MOP as basal dose at sowing. Top-dress with 45kg Neem Coated Urea in 2 split applications.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Organic Carbon Boost: </strong>
                    Incorporate 2 tonnes of Farm Yard Manure (FYM) or 500kg Vermicompost per acre before final harrowing to improve microbial count.
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 dark:text-white">Micronutrient Safeguard: </strong>
                    Apply Zinc Sulphate (21%) @ 10kg/acre every 2 years to prevent Khaira disease and chlorosis in wheat/paddy.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="text-slate-500">Target Crops for this Soil: <strong>Wheat, Mustard, Barley, Chickpea</strong></span>
              <button
                onClick={() => onOpenSoilCardModal && onOpenSoilCardModal()}
                className="font-semibold text-[#15803D] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Fertilizer Bags Schedule</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SoilHealthSection;

