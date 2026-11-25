import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Search,
  ChevronRight,
  Check,
  ArrowUpDown,
} from "lucide-react";
import { CROP_CATEGORIES } from "../../data/cropIntelligenceData.js";
import { formatCurrency } from "../../utils/formatters.js";

export function CropSuitabilityGrid({
  evaluations = [],
  compareList = [],
  onToggleCompare,
  onOpenBlueprint,
  onNavigateToProfitRisk,
  isDarkMode,
}) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("overallScore");

  // Filtering & Sorting
  const filteredCrops = useMemo(() => {
    let result = [...evaluations];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.crop.category === selectedCategory);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.crop.name.toLowerCase().includes(q) ||
          item.crop.hindiName.toLowerCase().includes(q) ||
          item.crop.scientificName.toLowerCase().includes(q) ||
          item.crop.season.toLowerCase().includes(q)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "overallScore") return b.overallScore - a.overallScore;
      if (sortBy === "netProfit") return b.netProfit - a.netProfit;
      if (sortBy === "yield") return b.projectedYield - a.projectedYield;
      if (sortBy === "duration") return a.crop.durationDays - b.crop.durationDays;
      if (sortBy === "water") return a.crop.waterRequirementMm - b.crop.waterRequirementMm;
      if (sortBy === "roi") return b.roiPercent - a.roiPercent;
      return 0;
    });

    return result;
  }, [evaluations, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-5">
      {/* Category Filter Pills & Search Bar */}
      <div className="app-card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by crop, Hindi name, botanical name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input w-full pl-10 pr-4 py-2 text-xs"
            />
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select text-xs py-1.5 cursor-pointer font-medium"
            >
              <option value="overallScore">Highest AI Match Index</option>
              <option value="netProfit">Maximum Net Profit (₹/Ac)</option>
              <option value="yield">Projected Yield (Qtl/Ac)</option>
              <option value="duration">Fastest Harvest (Days)</option>
              <option value="water">Lowest Water Requirement</option>
              <option value="roi">Highest ROI Percentage</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {CROP_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-white dark:border-emerald-500 font-bold shadow-sm"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                <span>{cat.emoji}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Count */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-sm font-bold font-heading text-[var(--text-primary)]">
            Ranked Agronomic Candidates ({filteredCrops.length})
          </span>
        </div>
        {compareList.length > 0 && (
          <span className="text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            Comparing {compareList.length} of 4 crops
          </span>
        )}
      </div>

      {/* Bento Grid of Ranked Crop Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredCrops.map((evalItem, index) => {
          const {
            crop,
            overallScore,
            projectedYield,
            netProfit,
            roiPercent,
            soilChemScore,
            hydroScore,
            climateScore,
            econScore,
            strengths,
            advisories,
          } = evalItem;
          const isRankOne = index === 0 && selectedCategory === "all" && !searchQuery;
          const isSelectedForCompare = compareList.some((c) => c.id === crop.id);

          return (
            <div
              key={crop.id}
              id={`crop-intelligence-card-${crop.id}`}
              className={`app-card p-5 flex flex-col justify-between transition-all relative overflow-hidden group ${
                isRankOne
                  ? "border-emerald-500 shadow-md ring-1 ring-emerald-500/30"
                  : ""
              }`}
            >
              {/* Top Card Header */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl filter drop-shadow-md group-hover:scale-105 transition-transform">
                      {crop.emoji}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h3 className="text-base font-bold font-heading leading-tight text-[var(--text-primary)]">
                          {crop.name}
                        </h3>
                        {isRankOne && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 shadow-sm">
                            ⭐ Top Pick
                          </span>
                        )}
                        {crop.mspPerQtl > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-mono">
                            MSP ₹{crop.mspPerQtl}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-0.5">
                        {crop.hindiName} • <span className="italic">{crop.scientificName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Overall Match Circle / Score */}
                  <div className="text-right shrink-0">
                    <div className="flex items-baseline justify-end gap-0.5">
                      <span
                        className={`text-2xl font-black font-heading ${
                          overallScore >= 80
                            ? "text-emerald-600 dark:text-emerald-400"
                            : overallScore >= 60
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        {overallScore}%
                      </span>
                    </div>
                    <span className="text-[10px] block font-bold uppercase tracking-wider text-[var(--text-muted)]">
                      Match Index
                    </span>
                  </div>
                </div>

                {/* 4-Pillar Breakdown Bars */}
                <div className="mt-3.5 grid grid-cols-4 gap-1.5 p-2 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5 text-[var(--text-secondary)]">
                      <span>Soil</span>
                      <span className="font-mono font-bold text-[var(--text-primary)]">
                        {soilChemScore}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--border)]">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${soilChemScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5 text-[var(--text-secondary)]">
                      <span>Water</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">
                        {hydroScore}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--border)]">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${hydroScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5 text-[var(--text-secondary)]">
                      <span>Season</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                        {climateScore}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--border)]">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${climateScore}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5 text-[var(--text-secondary)]">
                      <span>Market</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {econScore}%
                      </span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden bg-[var(--border)]">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${econScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Key Agronomic KPIs Grid */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] block text-[var(--text-muted)]">
                      Proj. Yield
                    </span>
                    <span className="font-bold font-mono text-xs block text-[var(--text-primary)] mt-0.5">
                      {projectedYield} Qtl/Ac
                    </span>
                  </div>

                  <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] block text-[var(--text-muted)]">
                      Net Profit / Ac
                    </span>
                    <span
                      className={`font-bold font-mono text-xs block mt-0.5 ${
                        netProfit >= 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {formatCurrency(netProfit)}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] block text-[var(--text-muted)]">
                      Duration / ROI
                    </span>
                    <span className="font-bold font-mono text-xs block text-[var(--text-primary)] mt-0.5">
                      {crop.durationDays}d • {roiPercent}%
                    </span>
                  </div>
                </div>

                {/* Strengths & Advisories Bullet List */}
                <div className="mt-3 space-y-1.5">
                  {strengths.map((str, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)]"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-snug">{str}</span>
                    </div>
                  ))}
                  {advisories.length > 0 && (
                    <div className="flex items-start gap-1.5 text-[11px] pt-0.5 text-amber-700 dark:text-amber-400">
                      <span className="text-amber-500 shrink-0 font-bold">ℹ</span>
                      <span className="leading-snug">{advisories[0]}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onToggleCompare(crop)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelectedForCompare
                      ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400 font-bold"
                      : "btn-secondary"
                  }`}
                >
                  {isSelectedForCompare ? "✓ Added to Deck" : "+ Compare"}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenBlueprint(evalItem)}
                    className="btn-primary text-xs py-1.5 px-3 inline-flex items-center gap-1"
                  >
                    <span>Blueprint</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
