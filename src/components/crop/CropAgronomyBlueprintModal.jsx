// src/components/crop/CropAgronomyBlueprintModal.jsx
import React, { useEffect, useState } from "react";
import {
  X, Printer, Sparkles, ShieldCheck, TrendingUp, FlaskConical, CheckCircle2, Calendar, AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";
import { normalizeCrop } from "../../utils/agronomy.js";

const PRINT_CSS = `
@media print {
  body * { visibility: hidden !important; }
  #blueprint-print, #blueprint-print * { visibility: visible !important; }
  #blueprint-print { position: absolute !important; left: 0; top: 0; width: 100%; max-height: none !important; overflow: visible !important; border: 0 !important; }
  .no-print { display: none !important; }
}`;

const TONES = {
  emerald: "text-emerald-600 dark:text-emerald-400",
  cyan: "text-cyan-600 dark:text-cyan-400",
  amber: "text-amber-600 dark:text-amber-400",
  teal: "text-teal-600 dark:text-teal-400",
  plain: "text-[var(--text-primary)]",
};

const Stat = ({ label, value, sub, tone = "emerald", highlight = false }) => (
  <div className={`p-4 rounded-xl bg-[var(--surface-subtle)] border text-center ${highlight ? "border-emerald-500/30" : "border-[var(--border)]"}`}>
    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">{label}</span>
    <span className={`text-xl sm:text-2xl font-black font-heading block mt-1 ${TONES[tone]}`}>{value}</span>
    {sub && <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">{sub}</span>}
  </div>
);

const Panel = ({ title, titleClass = "", children }) => (
  <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
    {title && <h4 className={`text-xs font-bold font-heading uppercase ${titleClass || "text-[var(--text-primary)]"}`}>{title}</h4>}
    {children}
  </div>
);

export function CropAgronomyBlueprintModal({ isOpen, onClose, evaluationData }) {
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!isOpen) return undefined;
    setActiveTab("overview");
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !evaluationData?.crop) return null;

  // ✅ crash fix: parent used to pass a small "card" object; normalize it so
  // popularVarieties / phenologicalStages / ipmProtocols etc. always exist.
  const crop = normalizeCrop(evaluationData.crop);
  const {
    overallScore = 85, soilChemScore = 80, hydroScore = 85, climateScore = 90, econScore = 80,
    projectedYield = 22, grossRevenue = 54000, inputCost = 15000, netProfit = 39000, roiPercent = 0,
    fertilizerPlan = {}, strengths = [], advisories = [],
  } = evaluationData;

  const tabs = [
    { id: "overview", label: "Suitability", icon: Sparkles },
    { id: "nutrition", label: "NPK & Soil", icon: FlaskConical },
    { id: "lifecycle", label: "Growth & Water", icon: Calendar },
    { id: "ipm", label: "IPM & Bio-Defense", icon: ShieldCheck },
    { id: "economics", label: "Economics", icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain print:static print:block print:p-0 print:bg-transparent print:overflow-visible">
      <style>{PRINT_CSS}</style>
      <div id="blueprint-print" className="w-full max-w-4xl my-auto max-h-[92vh] rounded-[16px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 lg:p-6 border-b border-[var(--border)] flex items-center justify-between gap-3 bg-[var(--surface-subtle)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-4xl">{crop.emoji}</span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold font-heading">{crop.name} Agronomic Blueprint</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Match: {overallScore}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5 truncate">
                {crop.hindiName} • <span className="italic">{crop.scientificName}</span> • {crop.season} ({crop.durationDays} Days)
              </p>
            </div>
          </div>
          <div className="no-print flex items-center gap-2 shrink-0">
            <button type="button" onClick={() => window.print()} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
              <Printer className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Print Dossier</span>
            </button>
            <button type="button" onClick={onClose} aria-label="Close modal" className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="no-print flex items-center gap-1 p-2 bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto shrink-0">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${activeTab === id
                  ? "bg-emerald-600 text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
            >
              <Icon className="w-3.5 h-3.5" /> <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 print:overflow-visible">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="1. Soil Chemistry" value={`${soilChemScore}%`} sub={`pH ${crop.optimalPHMin}-${crop.optimalPHMax} alignment`} />
                <Stat label="2. Hydrology" value={`${hydroScore}%`} sub={`${crop.waterRequirementMm}mm footprint`} tone="cyan" />
                <Stat label="3. Climatic Window" value={`${climateScore}%`} sub={`${crop.season} sowing cycle`} tone="amber" />
                <Stat label="4. Market Economics" value={`${econScore}%`} sub={crop.mspPerQtl > 0 ? `MSP ₹${crop.mspPerQtl}` : "High demand"} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Panel title="Agronomic Match Strengths" titleClass="text-emerald-600 dark:text-emerald-400">
                  {strengths.length === 0 && <p className="text-xs text-[var(--text-muted)]">—</p>}
                  {strengths.map((s, i) => (
                    <div key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" /> <span>{s}</span>
                    </div>
                  ))}
                </Panel>
                <Panel title="Management & Risk Advisories" titleClass="text-amber-600 dark:text-amber-400">
                  {advisories.length === 0 && <p className="text-xs text-[var(--text-muted)]">—</p>}
                  {advisories.map((a, i) => (
                    <div key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> <span>{a}</span>
                    </div>
                  ))}
                </Panel>
              </div>

              <Panel title="Field Geometry & Certified Cultivars">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    ["Row × Plant Spacing", crop.spacingCm],
                    ["Seed Rate", crop.seedRatePerAcre],
                    ["Target Soil Depth", "45 - 90 cm"],
                    ["Water Tolerance", crop.waterTolerance],
                  ].map(([l, v]) => (
                    <div key={l} className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                      <span className="text-[10px] text-[var(--text-muted)] block">{l}</span>
                      <span className="font-bold text-[var(--text-primary)] mt-0.5 block">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">High-Yield Certified Varieties: </strong>
                  {crop.popularVarieties.join(", ")}
                </div>
              </Panel>
            </div>
          )}

          {activeTab === "nutrition" && (
            <div className="space-y-6">
              <Panel>
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h3 className="text-base font-bold font-heading flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-600" /> NPK &amp; Micronutrient Prescription
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">Per-acre dose based on your recorded soil test</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">Est. Fertilizer Cost</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(fertilizerPlan.estimatedCost || 0)} / Acre
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <Stat label="DAP (18:46:0)" value={`${fertilizerPlan.dapBags ?? 1} Bags`} sub={`${fertilizerPlan.dapKg ?? 50} kg`} tone="amber" />
                  <Stat label="Urea (46% N)" value={`${fertilizerPlan.ureaBags ?? 2} Bags`} sub={`${fertilizerPlan.ureaKg ?? 90} kg`} />
                  <Stat label="MOP (60% K₂O)" value={`${fertilizerPlan.mopBags ?? 1} Bags`} sub={`${fertilizerPlan.mopKg ?? 30} kg`} tone="teal" />
                  <Stat label="Zinc + Sulphur" value={`${fertilizerPlan.zincKg ?? 10}kg Zn`} sub={`+${fertilizerPlan.sulphurKg ?? 8}kg Bentonite S`} tone="cyan" />
                </div>
              </Panel>

              <Panel title="Scientific Split Application Schedule">
                {[
                  ["1. Basal (At Sowing)", "emerald", "Apply 100% DAP + 100% MOP + 100% Zinc Sulphate + ~30% of Urea in furrow, 5 cm below seed."],
                  ["2. First Top Dressing (~25 DAS)", "amber", "Broadcast ~35% Urea just before 1st irrigation on moist soil."],
                  ["3. Second Top Dressing (~45-55 DAS)", "cyan", "Remaining ~35% Urea. Add 1% 19:19:19 foliar spray during heat spells."],
                ].map(([t, tone, d]) => (
                  <div key={t} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs">
                    <span className={`font-bold block ${TONES[tone]}`}>{t}</span>
                    <p className="text-[var(--text-secondary)] mt-0.5">{d}</p>
                  </div>
                ))}
              </Panel>
            </div>
          )}

          {activeTab === "lifecycle" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 block uppercase">Total Crop Water Requirement</span>
                  <span className="text-xl font-black font-heading mt-0.5 block">{crop.waterRequirementMm} mm</span>
                </div>
                <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {crop.waterTolerance}
                </span>
              </div>
              {crop.phenologicalStages.map((s) => (
                <Panel key={s.stageNumber}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">{s.stageNumber}</span>
                      <h4 className="text-sm font-bold font-heading">{s.name}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{s.dasRange} • {s.waterVolumePercent}% H₂O</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    <strong className="text-[var(--text-primary)]">Key Actions: </strong>{s.criticalActions}
                  </p>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                    <strong>⚠️ Scouting Alert: </strong>{s.scoutingAlert}
                  </div>
                </Panel>
              ))}
            </div>
          )}

          {activeTab === "ipm" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {crop.ipmProtocols.map((p, i) => (
                <Panel key={i}>
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold font-heading">{p.name}</h4>
                    <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 shrink-0">ETL: {p.etl}</span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]"><strong className="text-[var(--text-primary)]">Symptoms: </strong>{p.symptoms}</p>
                  <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400"><strong>Bio-Control: </strong>{p.biologicalControl}</div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-cyan-700 dark:text-cyan-400"><strong>Chemical: </strong>{p.chemicalOption}</div>
                </Panel>
              ))}
            </div>
          )}

          {activeTab === "economics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Projected Yield" value={`${projectedYield} Qtl/Ac`} tone="plain" />
                <Stat label="Gross Revenue" value={formatCurrency(grossRevenue)} />
                <Stat label="Input Cost" value={formatCurrency(inputCost)} tone="plain" />
                <Stat label="Net Profit" value={formatCurrency(netProfit)} sub={roiPercent ? `ROI ${roiPercent}%` : undefined} highlight />
              </div>
              <Panel title="Market Dynamics & Price Protection">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{crop.economicSummary}</p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
                  <span><strong className="text-[var(--text-primary)]">MSP: </strong>{crop.mspPerQtl > 0 ? `₹${crop.mspPerQtl}/Qtl` : "Market linked"}</span>
                  <span><strong className="text-[var(--text-primary)]">Mandi Modal: </strong>{crop.typicalPricePerQtl > 0 ? `₹${crop.typicalPricePerQtl}/Qtl` : "Check live mandi"}</span>
                  <span><strong className="text-[var(--text-primary)]">Demand: </strong>{crop.marketDemandTrend}</span>
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">Figures are estimates for planning; confirm with live APMC rates before selling.</p>
              </Panel>
              <Panel title="Harvest Timing & Post-Harvest Moisture" titleClass="text-amber-700 dark:text-amber-400">
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Harvest when grain moisture is 14-16%. Sun-dry on a tarpaulin until 10-12% before hermetic storage to prevent aflatoxin and storage-pest damage.
                </p>
              </Panel>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CropAgronomyBlueprintModal;