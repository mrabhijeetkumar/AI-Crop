// src/components/soil/SoilHealthCardModal.jsx
import React, { useEffect } from "react";
import { formatCurrency } from "../../utils/formatters.js";
import { Printer, X, CheckCircle2, Award, FlaskConical, Leaf } from "lucide-react";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #soil-card-print, #soil-card-print * { visibility: visible !important; }
  #soil-card-print { position: absolute !important; left: 0; top: 0; width: 100%; max-height: none !important; overflow: visible !important; border: 0 !important; box-shadow: none !important; }
  .no-print { display: none !important; }
}`;

const badge = (cls, text) => (
  <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${cls}`}>{text}</span>
);
const GREEN = "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300";
const AMBER = "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300";
const BLUE = "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300";
const ROSE = "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300";

function rangeBadge(value, min, max, unit = "") {
  if (value < min) return badge(AMBER, `Deficit (${value} ${unit})`);
  if (value > max) return badge(BLUE, `Surplus (${value} ${unit})`);
  return badge(GREEN, `Optimal (${value} ${unit})`);
}

export function SoilHealthCardModal({
  isOpen,
  onClose,
  field,
  soilData = {},
  targetCrop,
  fertPlan = {},
  soilHealthScore = 80,
  farmProfile = {},
}) {
  // ✅ hooks BEFORE any early return (old code called useEffect after `return null` → React crash)
  useEffect(() => {
    if (!isOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !field) return null;

  const n = Number(soilData.nitrogen) || 0;
  const p = Number(soilData.phosphorus) || 0;
  const k = Number(soilData.potassium) || 0;
  const ph = Number(soilData.ph) || 0;
  const oc = Number(soilData.organicCarbon) || 0;
  const zn = Number(soilData.zinc) || 0.85;

  const cropName =
    typeof targetCrop === "string" ? targetCrop : targetCrop?.name || field.currentCrop || "Target Crop";
  const area = Number(field.areaAcres) || 1;
  const todayStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const cardRefNo = `SHC-IN-${String(field.id || "FLD").toUpperCase()}-${new Date().getFullYear()}`;
  const grade = soilHealthScore >= 80 ? "A (Optimal)" : soilHealthScore >= 60 ? "B (Good)" : "C (Deficit)";

  const phBadge =
    ph >= 6.5 && ph <= 7.5 ? badge(GREEN, "Neutral (Optimal)")
      : ph > 7.5 ? badge(AMBER, "Slightly Alkaline")
        : badge(ROSE, "Acidic");

  const rows = [
    { label: "Available Nitrogen (N)", value: `${n} kg/ha`, tone: "text-emerald-600 dark:text-emerald-400", bench: "80 - 140 kg/ha (Medium)", status: rangeBadge(n, 80, 140, "kg/ha"), impact: "Drives vegetative canopy expansion & chlorophyll synthesis." },
    { label: "Available Phosphorus (P₂O₅)", value: `${p} kg/ha`, tone: "text-amber-600 dark:text-amber-400", bench: "30 - 65 kg/ha (Medium)", status: rangeBadge(p, 30, 65, "kg/ha"), impact: "Essential for early root branching & energy transfer." },
    { label: "Available Potassium (K₂O)", value: `${k} kg/ha`, tone: "text-teal-600 dark:text-teal-400", bench: "30 - 60 kg/ha (Medium)", status: rangeBadge(k, 30, 60, "kg/ha"), impact: "Regulates stomata, lodging resistance and disease immunity." },
    { label: "Soil Reaction (pH 1:2.5)", value: ph.toFixed(1), tone: "text-cyan-600 dark:text-cyan-400", bench: "6.5 - 7.5 (Neutral Optimal)", status: phBadge, impact: "Controls nutrient solubility and microbial activity." },
    { label: "Organic Carbon (OC %)", value: `${oc.toFixed(2)}%`, tone: "text-emerald-600 dark:text-emerald-400", bench: "> 0.75% (High Fertility)", status: badge(oc >= 0.75 ? GREEN : oc >= 0.5 ? AMBER : ROSE, oc >= 0.75 ? "High (Rich)" : oc >= 0.5 ? "Medium" : "Low"), impact: "Improves moisture retention, microbial biomass and soil structure." },
    { label: "Available Zinc (Zn)", value: `${zn} ppm`, tone: "text-indigo-600 dark:text-indigo-400", bench: "> 0.60 ppm (Critical Limit)", status: badge(zn >= 0.6 ? GREEN : AMBER, zn >= 0.6 ? "Sufficient" : "Deficient"), impact: "Prevents Khaira disease in paddy and interveinal mottling in cereals." },
  ];

  const bags = [
    { name: "DAP (18:46:0)", bags: fertPlan.dapBags, kg: fertPlan.totalDapKg, note: "Apply 100% as basal dose", box: "bg-amber-50 border-amber-200 dark:border-amber-500/20", text: "text-amber-800 dark:text-amber-400" },
    { name: "Urea (46% N)", bags: fertPlan.ureaBags, kg: fertPlan.totalUreaKg, note: "Split in 2 top-dressings", box: "bg-emerald-50 border-emerald-200 dark:border-emerald-500/20", text: "text-emerald-800 dark:text-emerald-400" },
    { name: "MOP Potash (60%)", bags: fertPlan.mopBags, kg: fertPlan.totalMopKg, note: "Apply at sowing", box: "bg-teal-50 border-teal-200 dark:border-teal-500/20", text: "text-teal-800 dark:text-teal-400" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto overscroll-contain print:static print:block print:p-0 print:bg-transparent print:overflow-visible">
      <style>{PRINT_CSS}</style>
      <div
        id="soil-card-print"
        className="bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-slate-100 w-full max-w-4xl rounded-3xl border border-emerald-300 dark:border-emerald-500/25 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col"
      >
        {/* Action bar */}
        <div className="no-print p-4 bg-slate-100 dark:bg-[#0a0d0c] border-b border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-600 text-white flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" /> Official Diagnostic Format
            </span>
            <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium hidden sm:inline">
              ICAR &amp; Soil Health Mission Format
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer">
              <Printer className="w-4 h-4" /> <span>Print Soil Health Card</span>
            </button>
            <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Card body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:overflow-visible">
          <div className="border-b-2 border-emerald-600 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-lg">🌱</div>
              <div>
                <span className="text-[10px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-extrabold block">
                  Soil Health Card Format · AI Generated
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">SOIL HEALTH CARD (SHC)</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Precision Soil Fertility Assessment &amp; Crop Nutrition Prescription
                </p>
              </div>
            </div>
            <div className="sm:text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[11px] font-mono font-bold text-slate-500 block">REF: {cardRefNo}</span>
              <span className="text-xs font-bold block mt-0.5">Issue Date: {todayStr}</span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Based on your recorded soil test
              </span>
            </div>
          </div>

          {/* Farmer & parcel */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-[#0a0d0c] p-4 rounded-2xl border border-slate-200 dark:border-white/[0.08] text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Farmer / Owner</span>
              <span className="font-bold text-sm">{farmProfile.ownerName || "Farmer"}</span>
              <span className="text-[11px] text-slate-500 block">{farmProfile.farmName}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Parcel / Field</span>
              <span className="font-bold text-sm">{field.name}</span>
              <span className="text-[11px] text-slate-500 block">Area: {area} Acres ({(area / 2.471).toFixed(2)} Ha)</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Classification</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm uppercase">{String(field.soilType || "alluvial").replace(/_/g, " ")}</span>
              <span className="text-[11px] text-slate-500 block">Target Crop: {String(cropName).split("(")[0].trim()}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Soil Health Index</span>
              <div className="flex items-baseline gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{soilHealthScore}</span>
                <span className="text-[10px] font-bold text-slate-400">/100</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-600 text-white">Grade {grade}</span>
              </div>
            </div>
          </div>

          {/* Lab table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="w-4 h-4 text-emerald-600" /> 1. Soil Test Results &amp; Reference Ratings
            </h3>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-white/[0.08]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-[#141414] text-slate-700 dark:text-neutral-400 border-b border-slate-200 dark:border-white/[0.08]">
                    {["Parameter", "Measured", "Benchmark", "Status", "Agronomic Impact"].map((h) => (
                      <th key={h} className="p-2.5 font-bold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                  {rows.map((r) => (
                    <tr key={r.label}>
                      <td className="p-2.5 font-bold">{r.label}</td>
                      <td className={`p-2.5 font-extrabold ${r.tone}`}>{r.value}</td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400">{r.bench}</td>
                      <td className="p-2.5">{r.status}</td>
                      <td className="p-2.5 text-slate-500 dark:text-slate-400 text-[11px]">{r.impact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fertilizer */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Leaf className="w-4 h-4 text-emerald-600" /> 2. Fertilizer Prescription for {String(cropName).split("(")[0].trim()} ({area} Acres)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {bags.map((b) => (
                <div key={b.name} className={`p-3 rounded-2xl border text-center dark:bg-[#0a0d0c] ${b.box}`}>
                  <span className={`text-[10px] uppercase font-bold block ${b.text}`}>{b.name}</span>
                  <span className={`text-2xl font-black my-0.5 block ${b.text}`}>{b.bags ?? "—"} Bags</span>
                  <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">{b.kg ?? "—"} kg Total</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{b.note}</span>
                </div>
              ))}
              <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-[#0a0d0c] border border-indigo-200 dark:border-indigo-500/20 text-center">
                <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block">Zinc Sulphate (21%)</span>
                <span className="text-2xl font-black text-indigo-800 dark:text-indigo-400 my-0.5 block">{fertPlan.totalZincKg ?? "—"} kg</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 font-semibold block">Micro-nutrient booster</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Apply separately from DAP</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-600 dark:text-slate-300">Estimated Total Fertilizer Input Cost:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(fertPlan.estCost || 0)}</span>
            </div>
          </div>

          {/* Advisory + signature */}
          <div className="pt-4 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1 text-slate-600 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-white block">Agronomist Advisory &amp; Best Practices:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>Urea aur DAP ko bahut pehle mix karke na rakhein – nami se cake ban jata hai.</li>
                <li>2-3 tonne/acre sadi hui FYM / compost se soil microbial activity badhti hai.</li>
                <li>Urea hamesha nami wali mitti me, sham ke time broadcast karein.</li>
              </ul>
              <p className="text-[10px] text-slate-400 pt-1">
                Advisory is AI-generated from your entered values. Confirm with a local KVK / soil lab before large purchases.
              </p>
            </div>
            <div className="flex flex-col justify-end sm:items-end pt-4 sm:pt-0">
              <div className="border-t border-slate-300 dark:border-slate-700 pt-2 w-48 sm:text-center">
                <span className="font-extrabold block text-xs">Dr. Krishi Agronomy AI</span>
                <span className="text-[10px] text-slate-500 block">Automated Advisory (not a lab certificate)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SoilHealthCardModal;