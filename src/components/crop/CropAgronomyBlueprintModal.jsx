import React, { useState } from "react";
import {
  X,
  Printer,
  Sparkles,
  Layers,
  Droplets,
  Sprout,
  ShieldCheck,
  TrendingUp,
  FlaskConical,
  CheckCircle2,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  ArrowRight,
  Leaf,
  Scale,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";

export function CropAgronomyBlueprintModal({
  isOpen,
  onClose,
  evaluationData,
  isDarkMode,
}) {
  const [activeTab, setActiveTab] = useState("overview");

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !evaluationData || !evaluationData.crop) return null;

  const {
    crop,
    overallScore = 85,
    soilChemScore = 80,
    hydroScore = 85,
    climateScore = 90,
    econScore = 80,
    projectedYield = 22,
    grossRevenue = 54000,
    inputCost = 15000,
    netProfit = 39000,
    roiPercent = 260,
    fertilizerPlan = {},
    strengths = [],
    advisories = [],
  } = evaluationData;

  const handlePrint = () => {
    window.print();
  };

  const tabs = [
    { id: "overview", label: "Suitability & Diagnostics", icon: Sparkles },
    { id: "nutrition", label: "NPK & Soil Prescription", icon: FlaskConical },
    { id: "lifecycle", label: "5-Stage Growth & Water", icon: Calendar },
    { id: "ipm", label: "IPM & Bio-Defense", icon: ShieldCheck },
    { id: "economics", label: "Economics & Harvest", icon: TrendingUp },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain">
      <div
        className="w-full max-w-4xl my-auto max-h-[92vh] rounded-[16px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] flex flex-col overflow-hidden shadow-2xl transition-all custom-scrollbar"
      >
        {/* Modal Top Header */}
        <div className="p-5 lg:p-6 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-subtle)] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-4xl filter drop-shadow-md">{crop.emoji}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
                  {crop.name} Agronomic Blueprint
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Match: {overallScore}%
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                {crop.hindiName} • <span className="italic">{crop.scientificName}</span> • {crop.season} ({crop.durationDays} Days)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Dossier</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] cursor-pointer transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-1 p-2 bg-[var(--surface)] border-b border-[var(--border)] overflow-x-auto scrollbar-none shrink-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-white font-bold shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: OVERVIEW & 4-PILLAR SUITABILITY */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 4-Pillar Score Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    1. Soil Chemistry
                  </span>
                  <span className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
                    {soilChemScore}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    pH {crop.optimalPHMin}-{crop.optimalPHMax} Alignment
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    2. Hydrology Match
                  </span>
                  <span className="text-2xl font-black font-heading text-cyan-600 dark:text-cyan-400 block mt-1">
                    {hydroScore}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    {crop.waterRequirementMm}mm Footprint
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    3. Climatic Window
                  </span>
                  <span className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400 block mt-1">
                    {climateScore}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    {crop.season} Sowing Cycle
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    4. Market Economics
                  </span>
                  <span className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
                    {econScore}%
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    {crop.mspPerQtl > 0 ? `MSP ₹${crop.mspPerQtl}` : "High Demand"}
                  </span>
                </div>
              </div>

              {/* Strengths & Management Advisories */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                  <h4 className="text-xs font-bold font-heading text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Agronomic Match Strengths
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    {strengths.map((str, i) => (
                      <div key={i} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓</span>
                        <span>{str}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                  <h4 className="text-xs font-bold font-heading text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Management &amp; Risk Advisories
                  </h4>
                  <div className="space-y-1.5 pt-1">
                    {advisories.map((adv, i) => (
                      <div key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                        <span className="text-amber-500 font-bold">!</span>
                        <span>{adv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cultivar & Field Geometry Parameters */}
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <h4 className="text-xs font-bold font-heading text-[var(--text-primary)] mb-2 uppercase">
                  Field Geometry &amp; Certified Cultivars
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Row x Plant Spacing</span>
                    <span className="font-bold font-mono text-[var(--text-primary)] mt-0.5 block">{crop.spacingCm}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Seed Rate</span>
                    <span className="font-bold font-mono text-[var(--text-primary)] mt-0.5 block">{crop.seedRatePerAcre}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Target Soil Depth</span>
                    <span className="font-bold font-mono text-[var(--text-primary)] mt-0.5 block">45 - 90 cm</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Tolerance</span>
                    <span className="font-bold text-cyan-600 dark:text-cyan-400 mt-0.5 block">{crop.waterTolerance}</span>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">High-Yield Certified Varieties: </strong>
                  {crop.popularVarieties.join(", ")}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION & FERTILIZER PRESCRIPTION */}
          {activeTab === "nutrition" && (
            <div className="space-y-6">
              {/* Prescribed Commercial Bags */}
              <div className="p-5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
                  <div>
                    <h3 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
                      <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Custom NPK &amp; Micronutrient Prescription
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Targeted dosage per acre based on native soil deficit test values
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                      Est. Fertilizer Cost
                    </span>
                    <span className="text-base font-bold font-heading text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(fertilizerPlan.estimatedCost || 4200)} / Acre
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-amber-500/20 text-center">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 block font-bold uppercase">
                      DAP (18:46:0)
                    </span>
                    <span className="text-2xl font-black font-heading text-amber-600 dark:text-amber-400 block mt-1">
                      {fertilizerPlan.dapBags || 1}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      Bags ({fertilizerPlan.dapKg || 50} kg)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-emerald-500/20 text-center">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold uppercase">
                      Urea (46% N)
                    </span>
                    <span className="text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
                      {fertilizerPlan.ureaBags || 2}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      Bags ({fertilizerPlan.ureaKg || 90} kg)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-teal-500/20 text-center">
                    <span className="text-[10px] text-teal-700 dark:text-teal-400 block font-bold uppercase">
                      MOP (60% K₂O)
                    </span>
                    <span className="text-2xl font-black font-heading text-teal-600 dark:text-teal-400 block mt-1">
                      {fertilizerPlan.mopBags || 1}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      Bags ({fertilizerPlan.mopKg || 30} kg)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[var(--surface)] border border-cyan-500/20 text-center">
                    <span className="text-[10px] text-cyan-700 dark:text-cyan-400 block font-bold uppercase">
                      Zinc + Sulphur
                    </span>
                    <span className="text-xl font-black font-heading text-cyan-600 dark:text-cyan-400 block mt-1">
                      {fertilizerPlan.zincKg || 10}kg Zn
                    </span>
                    <span className="text-xs text-[var(--text-muted)] block">
                      +{fertilizerPlan.sulphurKg || 8}kg Bentonite S
                    </span>
                  </div>
                </div>
              </div>

              {/* Fertilizer Split Application Protocol */}
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-3">
                <h4 className="text-xs font-bold font-heading text-[var(--text-primary)] uppercase">
                  Scientific Split Application Schedule
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                      1. Basal Application (At Sowing / Transplanting):
                    </span>
                    <p className="text-[var(--text-secondary)] mt-0.5">
                      Apply 100% DAP + 100% MOP + 100% Zinc Sulphate + 30% total Urea in furrow 5cm below seed depth.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="font-bold text-amber-700 dark:text-amber-400 block">
                      2. First Top Dressing (Vegetative / Tillering Stage ~ 25 DAS):
                    </span>
                    <p className="text-[var(--text-secondary)] mt-0.5">
                      Broadcast 35% Urea immediately prior to 1st irrigation. Ensure soil has proper moisture.
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="font-bold text-cyan-700 dark:text-cyan-400 block">
                      3. Second Top Dressing / Foliar Spray (Flowering / Booting ~ 45-55 DAS):
                    </span>
                    <p className="text-[var(--text-secondary)] mt-0.5">
                      Broadcast remaining 35% Urea. Supplement with 1% 19:19:19 water-soluble NPK foliar spray during high-temperature spells.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 5-STAGE GROWTH & WATER */}
          {activeTab === "lifecycle" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 block uppercase">
                    Total Crop Water Requirement
                  </span>
                  <span className="text-xl font-black font-heading text-[var(--text-primary)] mt-0.5 block">
                    {crop.waterRequirementMm} mm
                  </span>
                </div>
                <span className="text-xs text-cyan-700 dark:text-cyan-400 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                  {crop.waterTolerance}
                </span>
              </div>

              <div className="space-y-3">
                {crop.phenologicalStages.map((stage) => (
                  <div
                    key={stage.stageNumber}
                    className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-black text-xs flex items-center justify-center border border-emerald-500/20">
                          {stage.stageNumber}
                        </span>
                        <h4 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                          {stage.name}
                        </h4>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {stage.dasRange} • {stage.waterVolumePercent}% H₂O
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                      <strong className="text-[var(--text-primary)]">Key Actions: </strong>{stage.criticalActions}
                    </p>

                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-300">
                      <strong>⚠️ Scouting Alert: </strong>{stage.scoutingAlert}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: IPM & BIO-DEFENSE */}
          {activeTab === "ipm" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {crop.ipmProtocols.map((proto, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                        {proto.name}
                      </h4>
                      <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                        ETL: {proto.etl}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-secondary)]">
                      <strong className="text-[var(--text-primary)]">Symptoms: </strong>{proto.symptoms}
                    </p>

                    <div className="p-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400">
                      <strong>Bio-Control: </strong>{proto.biologicalControl}
                    </div>

                    <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs text-cyan-700 dark:text-cyan-400 font-mono">
                      <strong>Chemical: </strong>{proto.chemicalOption}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ECONOMICS & HARVEST */}
          {activeTab === "economics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Projected Yield
                  </span>
                  <span className="text-xl font-black font-heading text-[var(--text-primary)] block mt-1">
                    {projectedYield} Qtl/Ac
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Gross Revenue
                  </span>
                  <span className="text-xl font-black font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
                    {formatCurrency(grossRevenue)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-center">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold tracking-wider">
                    Input Cost (OPEX)
                  </span>
                  <span className="text-xl font-black font-heading text-[var(--text-secondary)] block mt-1">
                    {formatCurrency(inputCost)}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-emerald-500/30 text-center">
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block uppercase font-bold tracking-wider">
                    Net Realized Profit
                  </span>
                  <span className="text-xl font-black font-heading text-emerald-600 dark:text-emerald-400 block mt-1">
                    {formatCurrency(netProfit)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                <h4 className="text-xs font-bold font-heading text-[var(--text-primary)] uppercase">
                  Market Dynamics &amp; Price Protection
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {crop.economicSummary}
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[var(--text-muted)] font-mono">
                  <span><strong className="text-[var(--text-primary)]">MSP: </strong>{crop.mspPerQtl > 0 ? `₹${crop.mspPerQtl}/Qtl` : "Market Linked"}</span>
                  <span><strong className="text-[var(--text-primary)]">Mandi Modal Price: </strong>₹{crop.typicalPricePerQtl}/Qtl</span>
                  <span><strong className="text-[var(--text-primary)]">Demand Trend: </strong>{crop.marketDemandTrend}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                <h4 className="text-xs font-bold font-heading text-amber-700 dark:text-amber-400 uppercase">
                  Harvest Timing &amp; Post-Harvest Moisture Protocol
                </h4>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  Harvest when grain moisture drops to 14-16% (seed rattles in pod/panicle turns golden yellow). Dry immediately on tarpaulin under sun until moisture stabilizes at 10-12% for safe hermetic silo storage to prevent aflatoxin and pulse beetle infestations.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
