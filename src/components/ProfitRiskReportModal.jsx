import React from "react";
import {
  Printer,
  X,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
} from "lucide-react";
import { formatCurrency, formatNumber } from "../utils/formatters.js";

export function ProfitRiskReportModal({
  simulation,
  selectedCrop,
  farmProfile,
  inputVariables,
  isDarkMode,
  onClose,
}) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!simulation || !selectedCrop) return null;

  const handlePrint = () => {
    window.print();
  };

  const reportId = `AGRI-FIN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      id="profit-risk-report-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto overscroll-contain print:p-0 print:bg-white print:static"
    >
      <div
        id="profit-risk-report-content"
        className="relative w-full max-w-4xl my-auto max-h-[92vh] overflow-y-auto custom-scrollbar rounded-[16px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] shadow-2xl transition-all print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full print:bg-white print:text-black"
      >
        {/* Header bar - Hidden in Print */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Farm Financial Feasibility & Risk Audit Report
              </h3>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                Official Agro-Economic Simulation Certificate • {reportId}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="print-feasibility-report-btn"
              onClick={handlePrint}
              className="btn-primary text-xs py-2 px-3.5 inline-flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              id="close-feasibility-report-btn"
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-hover)] transition"
              aria-label="Close report"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Body */}
        <div className="p-6 lg:p-8 space-y-6 print:p-8 print:text-black">
          {/* Printable Official Header */}
          <div className="border-b pb-6 border-[var(--border)] print:border-slate-300">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black tracking-tight font-heading text-emerald-600 dark:text-emerald-400 print:text-emerald-700">
                    GEORK AGRI-FINANCIAL ADVISORY
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 print:border-emerald-800 print:text-emerald-800">
                    ICAR & CACP Standardized
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] print:text-slate-600 mt-1">
                  Comprehensive Crop Cost Engineering, Break-Even Thresholds & PMFBY Risk Audit
                </p>
              </div>
              <div className="text-left sm:text-right text-xs text-[var(--text-muted)] print:text-slate-700">
                <p className="font-mono font-bold text-[var(--text-primary)] print:text-black">ID: {reportId}</p>
                <p>{currentDate} • {currentTime}</p>
              </div>
            </div>

            {/* Farm & Crop Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 p-4 rounded-xl bg-[var(--surface-subtle)] print:bg-slate-50 border border-[var(--border)] print:border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500 block tracking-wider">
                  Farm Estate & Owner
                </span>
                <span className="font-bold text-[var(--text-primary)] print:text-slate-900 block mt-0.5">
                  {farmProfile.farmName || "Geork Agricultural Estate"}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600">{farmProfile.ownerName || "Farmer"}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500 block tracking-wider">
                  Location & State
                </span>
                <span className="font-bold text-[var(--text-primary)] print:text-slate-900 block mt-0.5">
                  {farmProfile.location || "Punjab, India"}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600">Soil: {farmProfile.soilClassification || "Alluvial"}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500 block tracking-wider">
                  Target Crop Variety
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700 block mt-0.5">
                  {selectedCrop.name.split("(")[0]}
                </span>
                <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600">{selectedCrop.season} • {selectedCrop.durationDays} Days</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500 block tracking-wider">
                  Allocated Acreage
                </span>
                <span className="font-bold font-mono text-[var(--text-primary)] print:text-slate-900 text-sm block mt-0.5">
                  {simulation.totalArea} Acres
                </span>
                <p className="text-[11px] text-[var(--text-muted)] print:text-slate-600">Est. Yield: {simulation.totalExpectedYieldQtl} Qtl</p>
              </div>
            </div>
          </div>

          {/* Key Financial KPIs - Bento Matrix */}
          <div>
            <h4 className="text-xs uppercase font-bold text-[var(--text-muted)] print:text-slate-600 tracking-wider mb-3 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Executive Financial Balance Summary</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 print:border-slate-300 print:bg-emerald-50">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 print:text-emerald-800 block tracking-wider">
                  Net Realized Profit
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading text-emerald-600 dark:text-emerald-400 print:text-emerald-700 block mt-1">
                  {formatCurrency(simulation.netProfit)}
                </span>
                <span className="text-xs font-semibold text-[var(--text-secondary)] print:text-slate-700">
                  {formatCurrency(simulation.profitPerAcre)} / Acre Net
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] print:bg-slate-50 border border-[var(--border)] print:border-slate-300">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] print:text-slate-500 block tracking-wider">
                  Gross Harvest Value
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading text-[var(--text-primary)] print:text-slate-900 block mt-1">
                  {formatCurrency(simulation.grossRevenue)}
                </span>
                <span className="text-xs text-[var(--text-muted)] print:text-slate-600">
                  @ ₹{inputVariables.sellingPricePerQtl}/Qtl Market Rate
                </span>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 print:border-slate-300 print:bg-rose-50">
                <span className="text-[10px] uppercase font-bold text-rose-700 dark:text-rose-400 print:text-rose-800 block tracking-wider">
                  Total Input Expenditures
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading text-rose-600 dark:text-rose-400 print:text-rose-700 block mt-1">
                  {formatCurrency(simulation.totalCost)}
                </span>
                <span className="text-xs text-[var(--text-muted)] print:text-slate-600">
                  {formatCurrency(simulation.costPerAcre)} / Acre OPEX
                </span>
              </div>

              <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 print:border-slate-300 print:bg-cyan-50">
                <span className="text-[10px] uppercase font-bold text-cyan-700 dark:text-cyan-400 print:text-cyan-800 block tracking-wider">
                  Projected ROI & B:C
                </span>
                <span className="text-xl sm:text-2xl font-black font-heading text-cyan-600 dark:text-cyan-400 print:text-cyan-700 block mt-1">
                  {simulation.roiPercentage}%
                </span>
                <span className="text-xs text-[var(--text-muted)] print:text-slate-600">
                  Benefit-Cost Ratio: {simulation.benefitCostRatio}x
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Cost Breakdown Table */}
          <div>
            <h4 className="text-xs uppercase font-bold text-[var(--text-muted)] print:text-slate-600 tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Itemized Agronomic Cost Ledger (C2 ICAR Standards)</span>
            </h4>

            <div className="overflow-x-auto rounded-xl border border-[var(--border)] print:border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-subtle)] print:bg-slate-100 text-[var(--text-muted)] print:text-slate-600 border-b border-[var(--border)] print:border-slate-300">
                    <th className="py-2.5 px-4 font-bold uppercase text-[10px]">Cost Category</th>
                    <th className="py-2.5 px-4 font-bold uppercase text-[10px] text-right">Per Acre (₹)</th>
                    <th className="py-2.5 px-4 font-bold uppercase text-[10px] text-right">Total Farm ({simulation.totalArea} A)</th>
                    <th className="py-2.5 px-4 font-bold uppercase text-[10px] text-right">% of OPEX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] print:divide-slate-200">
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Certified Seeds & Seed Treatment</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.seedCostPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.seeds)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.seeds / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Fertilizers, DAP, Urea, MOP & Micronutrients</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.fertilizerCostPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.fertilizers)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.fertilizers / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Plant Protection, Bio-Sprays & Fungicides</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.pesticideCostPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.pesticides)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.pesticides / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Field Labor (Land Prep, Sowing, Weeding, Harvest)</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.laborCostPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.labor)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.labor / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Machinery, Tractor Rental & Diesel Fuel</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.machineryRentalPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.machinery)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.machinery / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Irrigation, Tubewell & Solar Pumping Energy</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.irrigationCostPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.irrigation)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.irrigation / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Post-Harvest Transport, Bagging & Mandi Cess</td>
                    <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.postHarvestTransportPerAcre)}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.transport)}</td>
                    <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.transport / (simulation.totalCost || 1)) * 100)}%</td>
                  </tr>
                  {simulation.costBreakdown.overhead > 0 && (
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-[var(--text-primary)]">Management, Land Lease & Fixed Overheads</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[var(--text-secondary)]">{formatCurrency(inputVariables.overheadCostPerAcre)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-[var(--text-primary)]">{formatCurrency(simulation.costBreakdown.overhead)}</td>
                      <td className="py-2.5 px-4 text-right text-[var(--text-muted)]">{Math.round((simulation.costBreakdown.overhead / (simulation.totalCost || 1)) * 100)}%</td>
                    </tr>
                  )}
                  <tr className="bg-emerald-500/10 print:bg-emerald-100 font-bold text-[var(--text-primary)] print:text-black">
                    <td className="py-3 px-4 uppercase">Total Comprehensive OPEX</td>
                    <td className="py-3 px-4 text-right font-mono">{formatCurrency(simulation.costPerAcre)}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-600 dark:text-emerald-400 print:text-emerald-800">{formatCurrency(simulation.totalCost)}</td>
                    <td className="py-3 px-4 text-right">100%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Break-Even & Risk Cushioning */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] print:bg-slate-50 border border-[var(--border)] print:border-slate-300 text-xs space-y-2">
              <span className="font-bold text-[var(--text-primary)] print:text-slate-800 uppercase text-[11px] block flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Break-Even Threshold Benchmarks</span>
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-lg bg-[var(--surface)] print:bg-white border border-[var(--border)] print:border-slate-200">
                  <span className="text-[10px] text-[var(--text-muted)] print:text-slate-500 block">Min Yield for Zero-Loss</span>
                  <span className="text-sm font-black font-heading text-[var(--text-primary)] print:text-slate-900 block mt-0.5">
                    {simulation.breakEvenYieldQtlPerAcre} Qtl / Acre
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    Safety Margin: +{simulation.marginOfSafetyPercent}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface)] print:bg-white border border-[var(--border)] print:border-slate-200">
                  <span className="text-[10px] text-[var(--text-muted)] print:text-slate-500 block">Cost of Production (COP)</span>
                  <span className="text-sm font-black font-heading text-[var(--text-primary)] print:text-slate-900 block mt-0.5">
                    ₹{simulation.costOfProductionPerQtl} / Qtl
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    Mandi Spread: +₹{simulation.profitMarginPerQtl}/Qtl
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[var(--surface-subtle)] print:bg-slate-50 border border-[var(--border)] print:border-slate-300 text-xs space-y-2">
              <span className="font-bold text-[var(--text-primary)] print:text-slate-800 uppercase text-[11px] block flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>PMFBY Crop Insurance & Risk Rating</span>
              </span>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-lg bg-[var(--surface)] print:bg-white border border-[var(--border)] print:border-slate-200">
                  <span className="text-[10px] text-[var(--text-muted)] print:text-slate-500 block">Total Sum Insured</span>
                  <span className="text-sm font-black font-heading text-emerald-600 dark:text-emerald-400 print:text-emerald-700 block mt-0.5">
                    {formatCurrency(simulation.insurance.totalSumInsured)}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    Premium: {formatCurrency(simulation.insurance.farmerPremiumPayable)} ({simulation.insurance.premiumRatePercent}%)
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface)] print:bg-white border border-[var(--border)] print:border-slate-200">
                  <span className="text-[10px] text-[var(--text-muted)] print:text-slate-500 block">Risk Classification</span>
                  <span className={`text-sm font-black font-heading block mt-0.5 ${
                    simulation.riskAssessment.overallRisk === "Low" ? "text-emerald-600 dark:text-emerald-400 print:text-emerald-700" : "text-amber-600 dark:text-amber-400 print:text-amber-700"
                  }`}>
                    {simulation.riskAssessment.overallRisk} ({simulation.riskAssessment.riskScore}/100)
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                    Monsoon: {simulation.riskAssessment.monsoonSensitivity}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Risk Mitigation Playbook */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] print:bg-slate-50 border border-[var(--border)] print:border-slate-300 text-xs">
            <span className="font-bold text-[var(--text-primary)] print:text-slate-800 uppercase text-[11px] block mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Recommended Farm Management & Hedging Strategies</span>
            </span>
            <ul className="space-y-1.5 text-[var(--text-secondary)] print:text-slate-700 text-[11px]">
              {simulation.riskAssessment.mitigationStrategies.map((strat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 print:text-emerald-700">•</span>
                  <span>{strat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Certification Signature Section */}
          <div className="pt-6 border-t border-[var(--border)] print:border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-[var(--text-muted)] print:text-slate-600">
            <div>
              <p className="font-bold text-[var(--text-primary)] print:text-slate-900">Geork Agri-Intelligence Engine</p>
              <p className="text-[11px]">Certified for Bank Loan Assessment, Kisan Credit Card (KCC) & FPO Operations</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Data generated via deterministic agronomic models backed by ICAR & Mandi APMC live indices.
              </p>
            </div>
            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-[var(--border)] print:border-slate-300 pt-3 sm:pt-0 sm:pl-6">
              <div className="h-10 border-b border-dashed border-[var(--border-strong)] print:border-slate-400 w-48 mb-1"></div>
              <p className="text-[11px] font-bold text-[var(--text-primary)] print:text-slate-800">Authorized Agronomist Signature</p>
              <p className="text-[10px] text-[var(--text-muted)]">Date: {currentDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
