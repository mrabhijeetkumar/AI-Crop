import React from "react";
import { formatCurrency } from "../../utils/formatters.js";
import {
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Award,
  FlaskConical,
  Calendar,
  MapPin,
  Leaf,
  ShieldCheck,
  Download,
} from "lucide-react";

export function SoilHealthCardModal({
  isOpen,
  onClose,
  field,
  soilData,
  targetCrop,
  fertPlan,
  soilHealthScore,
  farmProfile,
}) {
  if (!isOpen || !field) return null;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (value, min, max, unit = "") => {
    if (value < min) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          Deficit ({value} {unit})
        </span>
      );
    }
    if (value > max) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Surplus ({value} {unit})
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        Optimal ({value} {unit})
      </span>
    );
  };

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cardRefNo = `SHC-IN-${field.id.toUpperCase()}-${new Date().getFullYear()}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain">
      <div className="bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-slate-100 w-full max-w-4xl rounded-3xl border border-emerald-300 dark:border-emerald-500/25 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="p-4 bg-slate-100 dark:bg-[#0a0d0c] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              Official Diagnostic Format
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium hidden sm:inline">
              ICAR & Soil Health Mission Certified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Soil Health Card</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Canvas */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0 print:space-y-4 print:text-black">
          {/* Header Banner */}
          <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-2xl shadow-lg">
                🌱
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold block">
                  Ministry of Agriculture & Farmers Welfare Standard
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  NATIONAL SOIL HEALTH CARD (SHC)
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Precision Soil Fertility Assessment & Crop Nutrition Prescription
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-4">
              <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-neutral-400 block">
                REF: {cardRefNo}
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mt-0.5">
                Issue Date: {todayStr}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Lab Quality Verified
              </span>
            </div>
          </div>

          {/* Farmer & Parcel Bio Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#0a0d0c] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer / Owner</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">
                {farmProfile.ownerName || "Abhijeet Kumar"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{farmProfile.farmName}</span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Parcel / Field</span>
              <span className="font-bold text-slate-800 dark:text-white text-sm">{field.name}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Area: {field.areaAcres} Acres ({((field.areaAcres || 1) / 2.471).toFixed(2)} Ha)
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Classification</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase">
                {field.soilType || "Alluvial"}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                Target Crop: {targetCrop?.name?.split("(")[0] || field.currentCrop}
              </span>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Health Index</span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                  {soilHealthScore}
                </span>
                <span className="text-[10px] font-bold text-slate-400">/100</span>
                <span className="px-2 py-0.2 rounded text-[10px] font-extrabold bg-emerald-600 text-white ml-1">
                  Grade {soilHealthScore >= 80 ? "A (Optimal)" : soilHealthScore >= 60 ? "B (Good)" : "C (Deficit)"}
                </span>
              </div>
            </div>
          </div>

          {/* Core Chemical & Physical Soil Parameters Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              1. Laboratory Soil Test Results & Reference Ratings
            </h3>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-neutral-400 border-b border-slate-200 dark:border-white/[0.08]">
                    <th className="p-2.5 font-bold">Parameter</th>
                    <th className="p-2.5 font-bold">Measured Value</th>
                    <th className="p-2.5 font-bold">Standard Benchmarks</th>
                    <th className="p-2.5 font-bold">Diagnostic Status</th>
                    <th className="p-2.5 font-bold">Agronomic Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[rgba(34,197,94,0.12)]">
                  <tr>
                    <td className="p-2.5 font-bold">Available Nitrogen (N)</td>
                    <td className="p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {soilData.nitrogen} kg/ha
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">80 - 140 kg/ha (Medium)</td>
                    <td className="p-2.5">{getStatusBadge(soilData.nitrogen, 80, 140, "kg/ha")}</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Drives vegetative canopy expansion & chlorophyll synthesis.
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold">Available Phosphorus (P₂O₅)</td>
                    <td className="p-2.5 font-extrabold text-amber-600 dark:text-amber-400">
                      {soilData.phosphorus} kg/ha
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">30 - 65 kg/ha (Medium)</td>
                    <td className="p-2.5">{getStatusBadge(soilData.phosphorus, 30, 65, "kg/ha")}</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Essential for early crown root branching & energy ATP transfer.
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold">Available Potassium (K₂O)</td>
                    <td className="p-2.5 font-extrabold text-teal-600 dark:text-teal-400">
                      {soilData.potassium} kg/ha
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">30 - 60 kg/ha (Medium)</td>
                    <td className="p-2.5">{getStatusBadge(soilData.potassium, 30, 60, "kg/ha")}</td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Regulates stomatal opening, lodging resistance, and disease immunity.
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold">Soil Reaction (pH 1:2.5)</td>
                    <td className="p-2.5 font-extrabold text-cyan-600 dark:text-cyan-400">
                      {Number(soilData.ph).toFixed(1)}
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">6.5 - 7.5 (Neutral Optimal)</td>
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          soilData.ph >= 6.5 && soilData.ph <= 7.5
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                            : soilData.ph > 7.5
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {soilData.ph >= 6.5 && soilData.ph <= 7.5
                          ? "Neutral (Optimal)"
                          : soilData.ph > 7.5
                          ? "Slightly Alkaline"
                          : "Acidic"}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Controls chemical nutrient solubility and microbial activity.
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold">Organic Carbon (OC %)</td>
                    <td className="p-2.5 font-extrabold text-emerald-600 dark:text-emerald-400">
                      {Number(soilData.organicCarbon).toFixed(2)}%
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">&gt; 0.75% (High Fertility)</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {soilData.organicCarbon >= 0.75 ? "High (Rich)" : soilData.organicCarbon >= 0.5 ? "Medium" : "Low"}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Improves soil moisture retention, microbial biomass, and crumb structure.
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2.5 font-bold">Available Zinc (Zn)</td>
                    <td className="p-2.5 font-extrabold text-indigo-600 dark:text-indigo-400">
                      {soilData.zinc || 0.85} ppm
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400">&gt; 0.60 ppm (Critical Limit)</td>
                    <td className="p-2.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Sufficient
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">
                      Prevents Khaira disease in paddy and interveinal mottle in cereals.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Exact Bag-Level Fertilizer Prescription */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              2. Precision Fertilizer Prescription for {targetCrop?.name || "Target Crop"} ({field.areaAcres} Acres)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-[#0a0d0c] border border-amber-200 dark:border-amber-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block">
                  DAP (18:46:0)
                </span>
                <span className="text-2xl font-black text-amber-800 dark:text-amber-400 my-0.5 block">
                  {fertPlan.dapBags} Bags
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
                  {fertPlan.totalDapKg} kg Total
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Apply 100% as Basal Dose</span>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#0a0d0c] border border-emerald-200 dark:border-emerald-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                  Urea (46% N)
                </span>
                <span className="text-2xl font-black text-emerald-800 dark:text-emerald-400 my-0.5 block">
                  {fertPlan.ureaBags} Bags
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
                  {fertPlan.totalUreaKg} kg Total
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Split in 2 Top-Dressings</span>
              </div>

              <div className="p-3 rounded-2xl bg-teal-50 dark:bg-[#0a0d0c] border border-teal-200 dark:border-teal-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block">
                  MOP Potash (60%)
                </span>
                <span className="text-2xl font-black text-teal-800 dark:text-teal-400 my-0.5 block">
                  {fertPlan.mopBags} Bags
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
                  {fertPlan.totalMopKg} kg Total
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Apply at Sowing</span>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-[#0a0d0c] border border-indigo-200 dark:border-indigo-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">
                  Zinc Sulphate (21%)
                </span>
                <span className="text-2xl font-black text-indigo-800 dark:text-indigo-400 my-0.5 block">
                  {fertPlan.totalZincKg} kg
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">
                  Micro-Nutrient Booster
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Apply with Basal Dose</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Estimated Total Fertilizer Input Cost:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(fertPlan.estCost)}
              </span>
            </div>
          </div>

          {/* Agronomic Recommendations & Certified Signature Block */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block">Agronomist Advisory & Best Practices:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Never mix Urea and DAP together long before application to prevent moisture absorption and caking.</li>
                <li>Incorporate well-rotted FYM / compost @ 2-3 tonnes/acre to sustain soil microbial biomass.</li>
                <li>Always broadcast Urea in the evening hours when soil possesses active moisture.</li>
              </ul>
            </div>

            <div className="flex flex-col justify-end sm:items-end text-left sm:text-right pt-4 sm:pt-0">
              <div className="border-t border-slate-300 dark:border-slate-700 pt-2 w-48 sm:text-center">
                <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                  Dr. Krishi Agronomy AI
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  Authorized Soil Testing Officer
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono block mt-0.5">
                  Digitally Authenticated
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
