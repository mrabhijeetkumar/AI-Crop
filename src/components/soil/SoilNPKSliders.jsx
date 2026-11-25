import React, { useState } from "react";
import {
  FlaskConical,
  Sparkles,
  RefreshCw,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Zap,
  Plus,
  Minus,
  Check,
  Info,
  Beaker,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export function SoilNPKSliders({
  soilN,
  setSoilN,
  soilP,
  setSoilP,
  soilK,
  setSoilK,
  soilPH,
  setSoilPH,
  organicCarbon,
  setOrganicCarbon,
  ec = 0.65,
  setEc,
  sulfur = 14,
  setSulfur,
  zinc = 0.85,
  setZinc,
  iron = 6.5,
  setIron,
  boron = 0.65,
  setBoron,
  currentField,
  onResetToField,
}) {
  const [showMicros, setShowMicros] = useState(true);

  // Status helper functions
  const getNStatus = (val) => {
    if (val < 80) return { label: "Deficit Low", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", percent: Math.min(100, (val / 220) * 100), zone: "low", tip: "Nitrogen deficiency reduces vegetative growth and leaf chlorophyll." };
    if (val > 140) return { label: "High Surplus", color: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", percent: Math.min(100, (val / 220) * 100), zone: "high", tip: "Excess nitrogen may cause lodging and delayed maturity." };
    return { label: "Optimal Range", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", percent: Math.min(100, (val / 220) * 100), zone: "optimal", tip: "Ideal available nitrogen level for peak photosynthetic yield." };
  };

  const getPStatus = (val) => {
    if (val < 30) return { label: "Deficit Low", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", percent: Math.min(100, (val / 100) * 100), zone: "low", tip: "Low phosphorus stunts root establishment and tillering." };
    if (val > 65) return { label: "High Surplus", color: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", percent: Math.min(100, (val / 100) * 100), zone: "high", tip: "High phosphorus can bind with micronutrients like Zinc and Iron." };
    return { label: "Optimal Range", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", percent: Math.min(100, (val / 100) * 100), zone: "optimal", tip: "Optimal phosphorus for strong root development and energy transfer." };
  };

  const getKStatus = (val) => {
    if (val < 30) return { label: "Deficit Low", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", percent: Math.min(100, (val / 120) * 100), zone: "low", tip: "Potassium deficit weakens stalk strength and drought tolerance." };
    if (val > 60) return { label: "High Surplus", color: "text-cyan-500 dark:text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30", percent: Math.min(100, (val / 120) * 100), zone: "high", tip: "Adequate potassium reserve in soil matrix." };
    return { label: "Optimal Range", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", percent: Math.min(100, (val / 120) * 100), zone: "optimal", tip: "Optimal potassium enhances disease resistance and grain weight." };
  };

  const getPHStatus = (val) => {
    if (val < 6.0) return { label: "Acidic (<6.0)", color: "text-rose-500 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-500/30", advice: "Apply Agricultural Lime (CaCO₃) to raise pH" };
    if (val > 7.6) return { label: "Alkaline (>7.6)", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", advice: "Apply Phosphogypsum to lower alkalinity" };
    return { label: "Neutral Optimal", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", advice: "Ideal biological nutrient bioavailability" };
  };

  const getOCStatus = (val) => {
    if (val < 0.50) return { label: "Low (<0.50%)", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-500/30", advice: "Incorporate 5-8 MT FYM compost or green manure" };
    if (val >= 0.75) return { label: "High Rich (≥0.75%)", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", advice: "Superior microbial biomass & moisture retention" };
    return { label: "Medium (0.50-0.75%)", color: "text-teal-600 dark:text-teal-400", bg: "bg-teal-500/10 border-teal-500/30", advice: "Maintain regular organic matter inputs" };
  };

  const applyPreset = (presetName) => {
    switch (presetName) {
      case "optimal":
        setSoilN(120);
        setSoilP(55);
        setSoilK(52);
        setSoilPH(6.8);
        setOrganicCarbon(0.82);
        if (setEc) setEc(0.65);
        if (setZinc) setZinc(1.1);
        if (setSulfur) setSulfur(16);
        if (setIron) setIron(7.2);
        if (setBoron) setBoron(0.85);
        break;
      case "low_fertility":
        setSoilN(65);
        setSoilP(24);
        setSoilK(28);
        setSoilPH(6.2);
        setOrganicCarbon(0.42);
        if (setEc) setEc(0.45);
        if (setZinc) setZinc(0.45);
        if (setSulfur) setSulfur(8);
        if (setIron) setIron(3.8);
        if (setBoron) setBoron(0.4);
        break;
      case "black_cotton":
        setSoilN(95);
        setSoilP(42);
        setSoilK(68);
        setSoilPH(7.7);
        setOrganicCarbon(0.58);
        if (setEc) setEc(0.85);
        if (setZinc) setZinc(0.75);
        if (setSulfur) setSulfur(12);
        if (setIron) setIron(5.5);
        if (setBoron) setBoron(0.6);
        break;
      case "high_organic":
        setSoilN(145);
        setSoilP(68);
        setSoilK(62);
        setSoilPH(7.0);
        setOrganicCarbon(1.15);
        if (setEc) setEc(0.72);
        if (setZinc) setZinc(1.4);
        if (setSulfur) setSulfur(22);
        if (setIron) setIron(9.0);
        if (setBoron) setBoron(1.0);
        break;
      case "saline_sodic":
        setSoilN(82);
        setSoilP(30);
        setSoilK(45);
        setSoilPH(8.3);
        setOrganicCarbon(0.38);
        if (setEc) setEc(2.1);
        if (setZinc) setZinc(0.4);
        if (setSulfur) setSulfur(10);
        if (setIron) setIron(4.0);
        if (setBoron) setBoron(0.45);
        break;
      default:
        break;
    }
  };

  const nStat = getNStatus(soilN);
  const pStat = getPStatus(soilP);
  const kStat = getKStatus(soilK);
  const phStat = getPHStatus(soilPH);
  const ocStat = getOCStatus(organicCarbon);

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-6">
      {/* Panel Header & Benchmark Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25 shadow-sm">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              Soil Test Diagnostic Entry
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-[#141414] text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                Direct Value Fill
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Target Plot: <strong className="text-slate-800 dark:text-white font-bold">{currentField?.name || "Selected Plot"}</strong> ({currentField?.soilType?.toUpperCase() || "ALLUVIAL"} SOIL)
            </p>
          </div>
        </div>

        {/* Action Controls: Reset to Field & Quick Lab Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onResetToField}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(34,197,94,0.25)] text-slate-700 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold hover:bg-slate-100 dark:hover:bg-[#141414] transition-all cursor-pointer shadow-sm"
            title="Reload saved field laboratory test numbers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Field</span>
          </button>

          <select
            onChange={(e) => {
              if (e.target.value) applyPreset(e.target.value);
            }}
            defaultValue=""
            className="bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-[rgba(34,197,94,0.25)] text-slate-800 dark:text-neutral-400 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
          >
            <option value="" disabled>
              ⚡ Quick Lab Benchmark Presets...
            </option>
            <option value="optimal">🌱 Balanced Fertile Alluvial (Optimal NPK)</option>
            <option value="low_fertility">⚠️ Deficit / Leached Low Fertility</option>
            <option value="black_cotton">🌾 Black Regur Cotton Soil (High K)</option>
            <option value="high_organic">🪱 High Compost Organic Soil (Rich SOC)</option>
            <option value="saline_sodic">🧂 Alkaline / Saline Soil (High pH & EC)</option>
          </select>
        </div>
      </div>

      {/* 1. PRIMARY MACRO-NUTRIENTS (N, P, K) VALUE FILL CARDS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Beaker className="w-3.5 h-3.5 text-emerald-500" />
            Primary Macronutrients (NPK Probes)
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Directly enter test readings or click quick-fill chips
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Available Nitrogen (N) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-700 dark:text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25 shadow-inner">
                  N
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Available Nitrogen (N)
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Alkaline KMnO₄ Method
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${nStat.bg} ${nStat.color}`}>
                {nStat.label}
              </span>
            </div>

            {/* Direct Value Input Field with Stepper Buttons */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setSoilN((prev) => Math.max(10, prev - 5))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-[#141414] dark:hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease 5 kg/ha"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1 flex-1">
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={soilN}
                  onChange={(e) => setSoilN(Math.max(0, Number(e.target.value)))}
                  className="w-16 text-center text-lg font-black text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                />
                <span className="text-xs font-bold text-slate-400">kg/ha</span>
              </div>

              <button
                type="button"
                onClick={() => setSoilN((prev) => Math.min(300, prev + 5))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-[#141414] dark:hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase 5 kg/ha"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benchmark Preset Fill Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                <span>Quick Benchmarks:</span>
                <span className="text-slate-500">Optimal: 80–140</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "Low", val: 65 },
                  { label: "Med", val: 95 },
                  { label: "Opt", val: 120 },
                  { label: "High", val: 160 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSoilN(item.val)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                      soilN === item.val
                        ? "bg-[#22c55e] text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-[#0F0F0F] text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#141414] border border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    {item.label} <span className="opacity-75">({item.val})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Status Meter Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-[rgba(34,197,94,0.12)]">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    soilN < 80 ? "bg-amber-500" : soilN > 140 ? "bg-cyan-500" : "bg-[#22c55e]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, (soilN / 220) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                <span>&lt;80 Low</span>
                <span className="text-emerald-600 dark:text-emerald-400">80-140 Optimal</span>
                <span>&gt;140 High</span>
              </div>
            </div>
          </div>

          {/* Card 2: Available Phosphorus (P2O5) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-3 shadow-sm hover:border-amber-500/40 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-[#141414] text-amber-700 dark:text-amber-400 font-black text-sm flex items-center justify-center border border-amber-300 dark:border-amber-500/30 shadow-inner">
                  P
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Available Phosphorus (P₂O₅)
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Olsen / Bray Method
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${pStat.bg} ${pStat.color}`}>
                {pStat.label}
              </span>
            </div>

            {/* Direct Value Input Field with Stepper Buttons */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setSoilP((prev) => Math.max(5, prev - 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-[#141414] dark:hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease 2 kg/ha"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1 flex-1">
                <input
                  type="number"
                  min="5"
                  max="150"
                  value={soilP}
                  onChange={(e) => setSoilP(Math.max(0, Number(e.target.value)))}
                  className="w-16 text-center text-lg font-black text-amber-600 dark:text-amber-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-amber-500 rounded px-1"
                />
                <span className="text-xs font-bold text-slate-400">kg/ha</span>
              </div>

              <button
                type="button"
                onClick={() => setSoilP((prev) => Math.min(150, prev + 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-700 dark:hover:bg-[#141414] dark:hover:text-amber-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase 2 kg/ha"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benchmark Preset Fill Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                <span>Quick Benchmarks:</span>
                <span className="text-slate-500">Optimal: 30–65</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "Low", val: 22 },
                  { label: "Med", val: 45 },
                  { label: "Opt", val: 55 },
                  { label: "High", val: 75 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSoilP(item.val)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                      soilP === item.val
                        ? "bg-amber-500 text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-[#0F0F0F] text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#141414] border border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    {item.label} <span className="opacity-75">({item.val})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Status Meter Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-[rgba(34,197,94,0.12)]">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    soilP < 30 ? "bg-amber-500" : soilP > 65 ? "bg-cyan-500" : "bg-[#22c55e]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, (soilP / 100) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                <span>&lt;30 Low</span>
                <span className="text-amber-600 dark:text-amber-400">30-65 Optimal</span>
                <span>&gt;65 High</span>
              </div>
            </div>
          </div>

          {/* Card 3: Available Potassium (K2O) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-3 shadow-sm hover:border-teal-500/40 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-[#141414] text-teal-700 dark:text-teal-400 font-black text-sm flex items-center justify-center border border-teal-300 dark:border-teal-500/30 shadow-inner">
                  K
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">
                    Available Potassium (K₂O)
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Neutral Ammonium Acetate
                  </span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${kStat.bg} ${kStat.color}`}>
                {kStat.label}
              </span>
            </div>

            {/* Direct Value Input Field with Stepper Buttons */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setSoilK((prev) => Math.max(5, prev - 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-[#141414] dark:hover:text-teal-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease 2 kg/ha"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1 flex-1">
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={soilK}
                  onChange={(e) => setSoilK(Math.max(0, Number(e.target.value)))}
                  className="w-16 text-center text-lg font-black text-teal-600 dark:text-teal-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1"
                />
                <span className="text-xs font-bold text-slate-400">kg/ha</span>
              </div>

              <button
                type="button"
                onClick={() => setSoilK((prev) => Math.min(180, prev + 2))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-teal-100 hover:text-teal-700 dark:hover:bg-[#141414] dark:hover:text-teal-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase 2 kg/ha"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benchmark Preset Fill Chips */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-slate-400 font-semibold flex items-center justify-between">
                <span>Quick Benchmarks:</span>
                <span className="text-slate-500">Optimal: 30–60</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { label: "Low", val: 24 },
                  { label: "Med", val: 38 },
                  { label: "Opt", val: 50 },
                  { label: "High", val: 72 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSoilK(item.val)}
                    className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                      soilK === item.val
                        ? "bg-teal-500 text-slate-950 shadow-sm"
                        : "bg-slate-100 dark:bg-[#0F0F0F] text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#141414] border border-slate-200/60 dark:border-slate-800"
                    }`}
                  >
                    {item.label} <span className="opacity-75">({item.val})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Diagnostic Status Meter Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-[rgba(34,197,94,0.12)]">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    soilK < 30 ? "bg-amber-500" : soilK > 60 ? "bg-teal-500" : "bg-[#22c55e]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, (soilK / 120) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                <span>&lt;30 Low</span>
                <span className="text-teal-600 dark:text-teal-400">30-60 Optimal</span>
                <span>&gt;60 High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PHYSICOCHEMICAL PROPERTIES: SOIL pH & ORGANIC CARBON VALUE FILL */}
      <div className="space-y-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-neutral-400 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-500" />
          Physicochemical Matrix & Organic Carbon (SOC)
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: Soil pH Reaction */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-3 shadow-sm hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Soil Reaction (pH - 1:2.5 Suspension)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {phStat.advice}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${phStat.bg} ${phStat.color}`}>
                {phStat.label}
              </span>
            </div>

            {/* Direct Input with Stepper */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setSoilPH((prev) => Math.max(4.0, Number((prev - 0.1).toFixed(1))))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-[#141414] dark:hover:text-cyan-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease pH 0.1"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1 flex-1">
                <input
                  type="number"
                  step="0.1"
                  min="4.0"
                  max="10.0"
                  value={soilPH}
                  onChange={(e) => setSoilPH(Math.max(3.0, Math.min(11.0, Number(e.target.value))))}
                  className="w-16 text-center text-lg font-black text-cyan-600 dark:text-cyan-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1"
                />
                <span className="text-xs font-bold text-slate-400">pH Units</span>
              </div>

              <button
                type="button"
                onClick={() => setSoilPH((prev) => Math.min(10.0, Number((prev + 0.1).toFixed(1))))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-cyan-100 hover:text-cyan-700 dark:hover:bg-[#141414] dark:hover:text-cyan-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase pH 0.1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benchmark Chips */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: "Acidic", val: 5.5 },
                { label: "Mild Acid", val: 6.2 },
                { label: "Neutral", val: 6.8 },
                { label: "Alkaline", val: 8.2 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSoilPH(item.val)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                    Math.abs(soilPH - item.val) < 0.05
                      ? "bg-cyan-500 text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-[#0F0F0F] text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#141414] border border-slate-200/60 dark:border-slate-800"
                  }`}
                >
                  {item.label} <span className="opacity-75">({item.val})</span>
                </button>
              ))}
            </div>

            {/* pH Spectrum Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-[rgba(34,197,94,0.12)]">
              <div className="relative h-2 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 via-emerald-400 via-cyan-400 to-purple-600 overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 w-2.5 bg-white border-2 border-slate-900 rounded-full shadow-md"
                  style={{ left: `${Math.min(95, Math.max(2, ((soilPH - 4.5) / 5.0) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                <span className="text-rose-500">4.5 Acidic</span>
                <span className="text-emerald-500 font-bold">6.5 - 7.5 Neutral</span>
                <span className="text-purple-400">9.5 Alkaline</span>
              </div>
            </div>
          </div>

          {/* Card: Organic Carbon (OC %) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col justify-between space-y-3 shadow-sm hover:border-emerald-500/40 transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Soil Organic Carbon (SOC %)
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {ocStat.advice}
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${ocStat.bg} ${ocStat.color}`}>
                {ocStat.label}
              </span>
            </div>

            {/* Direct Input with Stepper */}
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1.5 shadow-inner">
              <button
                type="button"
                onClick={() => setOrganicCarbon((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-[#141414] dark:hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Decrease OC 0.05%"
              >
                <Minus className="w-4 h-4" />
              </button>

              <div className="flex items-baseline justify-center gap-1 flex-1">
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  max="3.0"
                  value={organicCarbon}
                  onChange={(e) => setOrganicCarbon(Math.max(0.05, Math.min(4.0, Number(e.target.value))))}
                  className="w-16 text-center text-lg font-black text-emerald-600 dark:text-emerald-400 bg-transparent focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                />
                <span className="text-xs font-bold text-slate-400">% by weight</span>
              </div>

              <button
                type="button"
                onClick={() => setOrganicCarbon((prev) => Math.min(3.0, Number((prev + 0.05).toFixed(2))))}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0a0d0c] text-slate-700 dark:text-slate-300 hover:bg-emerald-100 hover:text-emerald-700 dark:hover:bg-[#141414] dark:hover:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer"
                title="Increase OC 0.05%"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Benchmark Chips */}
            <div className="grid grid-cols-4 gap-1">
              {[
                { label: "Low", val: 0.38 },
                { label: "Med", val: 0.62 },
                { label: "High", val: 0.85 },
                { label: "Rich", val: 1.20 },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setOrganicCarbon(item.val)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition-all cursor-pointer ${
                    Math.abs(organicCarbon - item.val) < 0.02
                      ? "bg-[#22c55e] text-slate-950 shadow-sm"
                      : "bg-slate-100 dark:bg-[#0F0F0F] text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-[#141414] border border-slate-200/60 dark:border-slate-800"
                  }`}
                >
                  {item.label} <span className="opacity-75">({item.val}%)</span>
                </button>
              ))}
            </div>

            {/* Diagnostic Status Meter Bar */}
            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-[rgba(34,197,94,0.12)]">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${
                    organicCarbon < 0.50 ? "bg-amber-500" : organicCarbon >= 0.75 ? "bg-[#22c55e]" : "bg-teal-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(8, (organicCarbon / 1.5) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                <span>&lt;0.50% Low</span>
                <span className="text-teal-500">0.50-0.75% Medium</span>
                <span className="text-emerald-500 font-bold">&gt;0.75% High</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECONDARY & TRACE MICRONUTRIENTS DIRECT VALUE FILL (EC, Zn, S, Fe, B) */}
      <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08]">
        <button
          type="button"
          onClick={() => setShowMicros(!showMicros)}
          className="w-full py-2.5 flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-neutral-400 hover:text-emerald-600 dark:hover:text-white transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Secondary & Micronutrients (EC Salinity, Zinc, Sulfur, Iron, Boron)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>{showMicros ? "Hide Trace Elements" : "Expand 5 Trace Nutrients"}</span>
            {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showMicros && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-3 animate-in fade-in duration-150">
            {/* 1. Salinity (EC) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white">Salinity (EC)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  (ec || 0.65) < 1.0 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {(ec || 0.65) < 1.0 ? "Non-Saline" : "Saline Stress"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setEc && setEc((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="4.0"
                    value={ec || 0.65}
                    onChange={(e) => setEc && setEc(Number(e.target.value))}
                    className="w-12 text-center text-sm font-black text-purple-600 dark:text-purple-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-slate-400">dS/m</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEc && setEc((prev) => Math.min(4.0, Number((prev + 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-purple-100 hover:text-purple-600 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>

              <span className="text-[9px] text-slate-400 block text-center">
                Threshold: &lt;1.0 dS/m
              </span>
            </div>

            {/* 2. Zinc (Zn) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white">Zinc (Zn)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  (zinc || 0.85) >= 0.6 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {(zinc || 0.85) >= 0.6 ? "Sufficient" : "Deficient"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setZinc && setZinc((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="3.0"
                    value={zinc || 0.85}
                    onChange={(e) => setZinc && setZinc(Number(e.target.value))}
                    className="w-12 text-center text-sm font-black text-indigo-600 dark:text-indigo-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-slate-400">ppm</span>
                </div>
                <button
                  type="button"
                  onClick={() => setZinc && setZinc((prev) => Math.min(3.0, Number((prev + 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-600 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>

              <span className="text-[9px] text-slate-400 block text-center">
                Threshold: &gt;0.6 ppm
              </span>
            </div>

            {/* 3. Sulfur (S) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white">Sulfur (S)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  (sulfur || 14) >= 10 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {(sulfur || 14) >= 10 ? "Adequate" : "Low S"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setSulfur && setSulfur((prev) => Math.max(2, prev - 1))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-600 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    step="1"
                    min="2"
                    max="50"
                    value={sulfur || 14}
                    onChange={(e) => setSulfur && setSulfur(Number(e.target.value))}
                    className="w-12 text-center text-sm font-black text-amber-600 dark:text-amber-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-slate-400">ppm</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSulfur && setSulfur((prev) => Math.min(50, prev + 1))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-amber-100 hover:text-amber-600 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>

              <span className="text-[9px] text-slate-400 block text-center">
                Threshold: &gt;10.0 ppm
              </span>
            </div>

            {/* 4. Iron (Fe) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white">Iron (Fe)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  (iron || 6.5) >= 4.5 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-500"
                }`}>
                  {(iron || 6.5) >= 4.5 ? "Sufficient" : "Chlorotic"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setIron && setIron((prev) => Math.max(1, Number((prev - 0.5).toFixed(1))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="25"
                    value={iron || 6.5}
                    onChange={(e) => setIron && setIron(Number(e.target.value))}
                    className="w-12 text-center text-sm font-black text-rose-600 dark:text-rose-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-slate-400">ppm</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIron && setIron((prev) => Math.min(25, Number((prev + 0.5).toFixed(1))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>

              <span className="text-[9px] text-slate-400 block text-center">
                Threshold: &gt;4.5 ppm
              </span>
            </div>

            {/* 5. Boron (B) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 dark:text-white">Boron (B)</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                  (boron || 0.65) >= 0.5 ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 text-amber-500"
                }`}>
                  {(boron || 0.65) >= 0.5 ? "Optimal" : "Deficient"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1 bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-white/[0.08] rounded-xl p-1">
                <button
                  type="button"
                  onClick={() => setBoron && setBoron((prev) => Math.max(0.1, Number((prev - 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-cyan-100 hover:text-cyan-600 flex items-center justify-center text-xs"
                >
                  -
                </button>
                <div className="flex items-baseline gap-1">
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="3.0"
                    value={boron || 0.65}
                    onChange={(e) => setBoron && setBoron(Number(e.target.value))}
                    className="w-12 text-center text-sm font-black text-cyan-600 dark:text-cyan-400 bg-transparent focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-slate-400">ppm</span>
                </div>
                <button
                  type="button"
                  onClick={() => setBoron && setBoron((prev) => Math.min(3.0, Number((prev + 0.05).toFixed(2))))}
                  className="w-6 h-6 rounded bg-slate-100 dark:bg-[#0a0d0c] text-slate-600 dark:text-slate-300 hover:bg-cyan-100 hover:text-cyan-600 flex items-center justify-center text-xs"
                >
                  +
                </button>
              </div>

              <span className="text-[9px] text-slate-400 block text-center">
                Threshold: &gt;0.5 ppm
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

