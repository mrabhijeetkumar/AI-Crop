import React from "react";
import {
  Scale,
  Sparkles,
  Trash2,
  Trophy,
  Droplets,
  TrendingUp,
  ShieldCheck,
  Zap,
  ChevronRight,
  Layers,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters.js";

export function CropComparisonDeck({
  compareList = [],
  onRemoveFromCompare,
  onClearCompare,
  onOpenBlueprint,
  evaluationsMap = {},
  isDarkMode,
}) {
  if (compareList.length === 0) {
    return (
      <div className="app-card p-10 text-center">
        <Scale className="w-12 h-12 text-[var(--primary)] mx-auto mb-3 opacity-60" />
        <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
          Crop Comparison Deck is Empty
        </h3>
        <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto mt-1 mb-4 leading-relaxed">
          Click <strong>"+ Compare"</strong> on any crop cards in the Match Engine to analyze up to 4 crops head-to-head across 12 agro-economic dimensions.
        </p>
      </div>
    );
  }

  // Identify winners
  let maxProfitCrop = null;
  let minWaterCrop = null;
  let minCostCrop = null;
  let maxScoreCrop = null;

  compareList.forEach((crop) => {
    const evalData = evaluationsMap[crop.id] || {};
    const profit = evalData.netProfit || 0;
    const water = crop.waterRequirementMm || 9999;
    const cost = crop.estInputCostPerAcre || 99999;
    const score = evalData.overallScore || 0;

    if (!maxProfitCrop || profit > (evaluationsMap[maxProfitCrop.id]?.netProfit || 0)) {
      maxProfitCrop = crop;
    }
    if (!minWaterCrop || water < minWaterCrop.waterRequirementMm) {
      minWaterCrop = crop;
    }
    if (!minCostCrop || cost < minCostCrop.estInputCostPerAcre) {
      minCostCrop = crop;
    }
    if (!maxScoreCrop || score > (evaluationsMap[maxScoreCrop.id]?.overallScore || 0)) {
      maxScoreCrop = crop;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                ⚖️ Multi-Dimensional Comparison
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                Head-to-Head Agronomic Benchmarking
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
              Candidate Crop Comparison Deck ({compareList.length} of 4)
            </h2>
          </div>

          <button
            type="button"
            onClick={onClearCompare}
            className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Deck
          </button>
        </div>

        {/* Winner Highlight Pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-[var(--border)]">
          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-emerald-500/20 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-500 shrink-0" />
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                Highest Net Profit
              </span>
              <span className="text-xs font-bold font-heading text-[var(--text-primary)]">
                {maxProfitCrop ? `${maxProfitCrop.emoji} ${maxProfitCrop.name}` : "-"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-cyan-500/20 flex items-center gap-3">
            <Droplets className="w-6 h-6 text-cyan-500 shrink-0" />
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                Lowest Water Need
              </span>
              <span className="text-xs font-bold font-heading text-[var(--text-primary)]">
                {minWaterCrop ? `${minWaterCrop.emoji} ${minWaterCrop.name} (${minWaterCrop.waterRequirementMm}mm)` : "-"}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[var(--surface-subtle)] border border-[var(--primary)]/20 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-[var(--primary)] shrink-0" />
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                Top AI Suitability Match
              </span>
              <span className="text-xs font-bold font-heading text-[var(--text-primary)]">
                {maxScoreCrop ? `${maxScoreCrop.emoji} ${maxScoreCrop.name}` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Table / Grid */}
      <div className="app-card overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-subtle)]">
              <th className="p-4 font-bold text-[var(--text-secondary)] w-48 uppercase text-[10px] tracking-wider">Dimension</th>
              {compareList.map((crop) => (
                <th key={crop.id} className="p-4 font-bold text-[var(--text-primary)] min-w-[200px]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{crop.emoji}</span>
                      <div>
                        <span className="font-bold font-heading block text-sm">{crop.name}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{crop.hindiName}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFromCompare(crop.id)}
                      className="text-[var(--text-muted)] hover:text-rose-500 p-1 cursor-pointer transition"
                      title="Remove"
                      aria-label="Remove crop from comparison"
                    >
                      ✕
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {/* Overall Match Index */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">AI Match Index</td>
              {compareList.map((crop) => {
                const evalData = evaluationsMap[crop.id] || {};
                return (
                  <td key={crop.id} className="p-3.5 font-black text-base text-[var(--primary)] font-heading">
                    {evalData.overallScore || 0}%
                  </td>
                );
              })}
            </tr>

            {/* Net Realized Profit */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Net Realized Profit</td>
              {compareList.map((crop) => {
                const evalData = evaluationsMap[crop.id] || {};
                return (
                  <td key={crop.id} className="p-3.5 font-bold text-sm text-[var(--text-primary)] font-mono">
                    {formatCurrency(evalData.netProfit || 0)} / Acre
                  </td>
                );
              })}
            </tr>

            {/* Projected Yield */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Projected Yield</td>
              {compareList.map((crop) => {
                const evalData = evaluationsMap[crop.id] || {};
                return (
                  <td key={crop.id} className="p-3.5 font-semibold text-[var(--text-primary)] font-mono">
                    {evalData.projectedYield || crop.averageYieldQtlPerAcre} Qtl/Acre
                  </td>
                );
              })}
            </tr>

            {/* Input Cost */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Est. Input Cost (OPEX)</td>
              {compareList.map((crop) => (
                <td key={crop.id} className="p-3.5 font-semibold text-[var(--text-secondary)] font-mono">
                  {formatCurrency(crop.estInputCostPerAcre)} / Acre
                </td>
              ))}
            </tr>

            {/* Return on Investment (ROI) */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Return on Investment</td>
              {compareList.map((crop) => {
                const evalData = evaluationsMap[crop.id] || {};
                return (
                  <td key={crop.id} className="p-3.5 font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                    {evalData.roiPercent || 0}% ROI
                  </td>
                );
              })}
            </tr>

            {/* Water Footprint */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Total Water Footprint</td>
              {compareList.map((crop) => (
                <td key={crop.id} className="p-3.5 font-semibold text-cyan-600 dark:text-cyan-400 font-mono">
                  {crop.waterRequirementMm} mm ({crop.waterTolerance})
                </td>
              ))}
            </tr>

            {/* Duration */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Growth Duration</td>
              {compareList.map((crop) => (
                <td key={crop.id} className="p-3.5 font-semibold text-[var(--text-primary)] font-mono">
                  {crop.durationDays} Days ({crop.season})
                </td>
              ))}
            </tr>

            {/* Government MSP */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Govt. MSP Assurance</td>
              {compareList.map((crop) => (
                <td key={crop.id} className="p-3.5 font-semibold text-amber-600 dark:text-amber-400 font-mono">
                  {crop.mspPerQtl > 0 ? `₹${crop.mspPerQtl} / Qtl` : "Open Market Trading"}
                </td>
              ))}
            </tr>

            {/* Soil Preference */}
            <tr>
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Soil Preference &amp; pH</td>
              {compareList.map((crop) => (
                <td key={crop.id} className="p-3.5 text-[var(--text-secondary)]">
                  pH {crop.optimalPHMin} - {crop.optimalPHMax}
                </td>
              ))}
            </tr>

            {/* Action Row */}
            <tr className="bg-[var(--surface-subtle)]">
              <td className="p-3.5 font-semibold text-[var(--text-secondary)]">Actions</td>
              {compareList.map((crop) => {
                const evalData = evaluationsMap[crop.id] || { crop };
                return (
                  <td key={crop.id} className="p-3.5">
                    <button
                      type="button"
                      onClick={() => onOpenBlueprint(evalData)}
                      className="btn-primary w-full py-2 px-3 text-xs inline-flex items-center justify-center gap-1"
                    >
                      <span>View Blueprint</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
