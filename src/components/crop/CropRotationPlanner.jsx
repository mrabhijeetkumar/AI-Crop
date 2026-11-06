import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Droplets,
  ShieldCheck,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  Leaf,
  Plus,
} from "lucide-react";
import { CROP_ROTATION_PRESETS } from "../../utils/cropIntelligenceEngine.js";
import { FULL_CROPS_INTELLIGENCE_CATALOG } from "../../data/cropIntelligenceData.js";
import { formatCurrency } from "../../utils/formatters.js";

export function CropRotationPlanner({ isDarkMode, onOpenBlueprint }) {
  const [selectedPreset, setSelectedPreset] = useState(CROP_ROTATION_PRESETS[0]);
  const [customKharif, setCustomKharif] = useState("paddy");
  const [customRabi, setCustomRabi] = useState("wheat");
  const [customZaid, setCustomZaid] = useState("chickpea");
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSelectPreset = (preset) => {
    setSelectedPreset(preset);
    setIsCustomMode(false);
  };

  // Find crops for custom calculation
  const kharifCrop = FULL_CROPS_INTELLIGENCE_CATALOG.find((c) => c.id === customKharif) || FULL_CROPS_INTELLIGENCE_CATALOG[1];
  const rabiCrop = FULL_CROPS_INTELLIGENCE_CATALOG.find((c) => c.id === customRabi) || FULL_CROPS_INTELLIGENCE_CATALOG[0];
  const zaidCrop = FULL_CROPS_INTELLIGENCE_CATALOG.find((c) => c.id === customZaid) || FULL_CROPS_INTELLIGENCE_CATALOG[4];

  // Custom calculations
  const customAnnualProfit =
    (kharifCrop.averageYieldQtlPerAcre * kharifCrop.typicalPricePerQtl - kharifCrop.estInputCostPerAcre) +
    (rabiCrop.averageYieldQtlPerAcre * rabiCrop.typicalPricePerQtl - rabiCrop.estInputCostPerAcre) +
    (zaidCrop.averageYieldQtlPerAcre * zaidCrop.typicalPricePerQtl - zaidCrop.estInputCostPerAcre);

  const isLegumeIncluded = [kharifCrop, rabiCrop, zaidCrop].some((c) => c.category === "Pulse" || c.category === "Oilseed" && c.id === "soybean");
  const customNitrogenCredit = isLegumeIncluded ? +25 : -40;
  const customSoilScore = isLegumeIncluded ? 90 : 72;

  // Intercropping recommendations from selected catalog
  const featuredIntercrops = [
    {
      mainCrop: "Bt Cotton",
      companion: "Cowpea / Green Gram",
      ratio: "2:1 Strip Row",
      ler: "1.34 LER",
      bonusPercent: 18,
      benefit: "Cowpea acts as green trap for bollworm while fixing 25 kg N/acre for cotton root zone.",
    },
    {
      mainCrop: "Sugarcane",
      companion: "Autumn Potato / Onion",
      ratio: "1:2 Trench Spacing",
      ler: "1.42 LER",
      bonusPercent: 24,
      benefit: "Potato/Onion matures in 90 days, covering 100% of sugarcane field preparation expenses.",
    },
    {
      mainCrop: "Wheat",
      companion: "Mustard (Sarson)",
      ratio: "9:1 Classic Ratio",
      ler: "1.25 LER",
      bonusPercent: 14,
      benefit: "Mustard perimeter provides early cash return and repels wheat aphids effectively.",
    },
    {
      mainCrop: "Maize / Corn",
      companion: "Cowpea / Soybean",
      ratio: "2:2 Strip Intercrop",
      ler: "1.38 LER",
      bonusPercent: 20,
      benefit: "Dual-canopy optimizes sunlight absorption while legume suppresses persistent broadleaf weeds.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                🔄 Regenerative Agronomy Matrix
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                Multi-Season Sequence &amp; Intercropping
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
              Smart Crop Rotation &amp; Companion Planting Engine
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
              Break monoculture pest cycles, replenish organic soil carbon, and fix up to 35 kg biological Nitrogen/acre while maximizing 365-day farm income.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={isCustomMode ? "btn-primary text-xs py-2 px-3.5" : "btn-secondary text-xs py-2 px-3.5"}
            >
              {isCustomMode ? "✓ Custom Builder Active" : "+ Build Custom Rotation"}
            </button>
          </div>
        </div>

        {/* Preset Selector Strip */}
        <div className="mt-5 pt-4 border-t border-[var(--border)]">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider block mb-2">
            Validated Multi-Season Systems (ICAR Tested)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CROP_ROTATION_PRESETS.map((preset) => {
              const isSelected = !isCustomMode && selectedPreset.id === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-emerald-500/40 text-[var(--text-secondary)]"
                  }`}
                >
                  <span className={`text-xs font-bold block mb-1 font-heading ${isSelected ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--text-primary)]"}`}>
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block mb-2">
                    {preset.region}
                  </span>
                  <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[var(--border)]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                      {formatCurrency(preset.totalAnnualProfit)}/yr
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Health: {preset.soilHealthScore}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Sequence Visualizer */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              {isCustomMode ? "Custom 3-Season Rotation Blueprint" : selectedPreset.name}
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isCustomMode ? "Tailored sequence for your field" : selectedPreset.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                Est. Annual Net Profit
              </span>
              <span className="text-lg font-black font-heading text-emerald-600 dark:text-emerald-400">
                {formatCurrency(isCustomMode ? customAnnualProfit : selectedPreset.totalAnnualProfit)} / Acre
              </span>
            </div>
          </div>
        </div>

        {/* Custom Selector Dropdowns if Custom Mode is Active */}
        {isCustomMode && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
            <div>
              <label className="text-xs font-bold text-amber-700 dark:text-amber-400 block mb-1">
                1. Kharif Season (Monsoon)
              </label>
              <select
                value={customKharif}
                onChange={(e) => setCustomKharif(e.target.value)}
                className="form-select w-full text-xs font-semibold py-2"
              >
                {FULL_CROPS_INTELLIGENCE_CATALOG.filter(
                  (c) => c.season === "Kharif" || c.season === "All Seasons"
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name} ({c.durationDays}d)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-cyan-700 dark:text-cyan-400 block mb-1">
                2. Rabi Season (Winter)
              </label>
              <select
                value={customRabi}
                onChange={(e) => setCustomRabi(e.target.value)}
                className="form-select w-full text-xs font-semibold py-2"
              >
                {FULL_CROPS_INTELLIGENCE_CATALOG.filter(
                  (c) => c.season === "Rabi" || c.season === "All Seasons"
                ).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name} ({c.durationDays}d)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-1">
                3. Zaid / Summer (Catch Crop)
              </label>
              <select
                value={customZaid}
                onChange={(e) => setCustomZaid(e.target.value)}
                className="form-select w-full text-xs font-semibold py-2"
              >
                {FULL_CROPS_INTELLIGENCE_CATALOG.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.emoji} {c.name} ({c.durationDays}d)
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* 3 Step Sequence Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {/* Kharif Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-amber-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  Step 1 • Kharif (Monsoon)
                </span>
                <span className="text-xs text-amber-700 dark:text-amber-400 font-bold font-mono">
                  {isCustomMode ? `${kharifCrop.durationDays} Days` : selectedPreset.seasons.kharif.duration}
                </span>
              </div>
              <h4 className="text-base font-bold font-heading text-[var(--text-primary)] mt-1">
                {isCustomMode ? `${kharifCrop.emoji} ${kharifCrop.name}` : selectedPreset.seasons.kharif.cropName}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isCustomMode ? kharifCrop.economicSummary : selectedPreset.seasons.kharif.role}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Est. Profit</span>
              <span className="font-bold font-mono text-amber-700 dark:text-amber-400">
                {formatCurrency(
                  isCustomMode
                    ? kharifCrop.averageYieldQtlPerAcre * kharifCrop.typicalPricePerQtl - kharifCrop.estInputCostPerAcre
                    : selectedPreset.seasons.kharif.profitEst
                )}
              </span>
            </div>
          </div>

          {/* Rabi Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-cyan-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                  Step 2 • Rabi (Winter)
                </span>
                <span className="text-xs text-cyan-700 dark:text-cyan-400 font-bold font-mono">
                  {isCustomMode ? `${rabiCrop.durationDays} Days` : selectedPreset.seasons.rabi.duration}
                </span>
              </div>
              <h4 className="text-base font-bold font-heading text-[var(--text-primary)] mt-1">
                {isCustomMode ? `${rabiCrop.emoji} ${rabiCrop.name}` : selectedPreset.seasons.rabi.cropName}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isCustomMode ? rabiCrop.economicSummary : selectedPreset.seasons.rabi.role}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Est. Profit</span>
              <span className="font-bold font-mono text-cyan-700 dark:text-cyan-400">
                {formatCurrency(
                  isCustomMode
                    ? rabiCrop.averageYieldQtlPerAcre * rabiCrop.typicalPricePerQtl - rabiCrop.estInputCostPerAcre
                    : selectedPreset.seasons.rabi.profitEst
                )}
              </span>
            </div>
          </div>

          {/* Zaid Card */}
          <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-emerald-500/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                  Step 3 • Zaid (Summer Catch)
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                  {isCustomMode ? `${zaidCrop.durationDays} Days` : selectedPreset.seasons.zaid.duration}
                </span>
              </div>
              <h4 className="text-base font-bold font-heading text-[var(--text-primary)] mt-1">
                {isCustomMode ? `${zaidCrop.emoji} ${zaidCrop.name}` : selectedPreset.seasons.zaid.cropName}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {isCustomMode ? zaidCrop.economicSummary : selectedPreset.seasons.zaid.role}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Est. Profit</span>
              <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(
                  isCustomMode
                    ? zaidCrop.averageYieldQtlPerAcre * zaidCrop.typicalPricePerQtl - zaidCrop.estInputCostPerAcre
                    : selectedPreset.seasons.zaid.profitEst
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Soil Health & Biological Impact Metrics */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs">
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Soil Organic Health Score
            </span>
            <span className="text-lg font-black font-heading text-[var(--text-primary)] mt-0.5 block">
              {isCustomMode ? `${customSoilScore}%` : `${selectedPreset.soilHealthScore}%`}
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Continuous root organic exudates build microbial biomass.
            </p>
          </div>

          <div>
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Biological Nitrogen Fixation
            </span>
            <span className="text-lg font-black font-heading text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              {isCustomMode
                ? customNitrogenCredit > 0 ? `+${customNitrogenCredit} kg/Ac` : `${customNitrogenCredit} kg/Ac`
                : selectedPreset.nitrogenBalanceKgPerAcre > 0
                ? `+${selectedPreset.nitrogenBalanceKgPerAcre} kg/Ac`
                : `${selectedPreset.nitrogenBalanceKgPerAcre} kg/Ac`}
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Legume nodule fixation cuts commercial urea expenses.
            </p>
          </div>

          <div>
            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
              Pest &amp; Weed Disruption Rating
            </span>
            <span className="text-lg font-black font-heading text-cyan-600 dark:text-cyan-400 mt-0.5 block">
              {isCustomMode ? "88% Efficiency" : selectedPreset.pestCycleBreakEffect.split("-")[0]}
            </span>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Breaks monophagous insect pupation and root-knot nematodes.
            </p>
          </div>
        </div>
      </div>

      {/* Companion & Intercropping Systems */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              High-Synergy Companion &amp; Intercropping Systems
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Simultaneous multi-crop canopy configurations with Land Equivalent Ratio (LER &gt; 1.25)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredIntercrops.map((ic, i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold font-heading text-[var(--text-primary)]">{ic.mainCrop}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">+</span>
                    <span className="text-sm font-bold font-heading text-emerald-600 dark:text-emerald-400">{ic.companion}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                    {ic.ler}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-2.5 text-xs text-[var(--text-secondary)] font-semibold">
                  <span>📐 Row Ratio: <strong className="text-[var(--text-primary)]">{ic.ratio}</strong></span>
                  <span>✨ Yield Synergy: <strong className="text-emerald-600 dark:text-emerald-400">+{ic.bonusPercent}%</strong></span>
                </div>

                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {ic.benefit}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
