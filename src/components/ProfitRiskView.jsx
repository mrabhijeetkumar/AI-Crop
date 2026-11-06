import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { CROPS_CATALOG } from "../data/cropsData.js";
import {
  computeProfitRiskSimulation,
  computeSensitivityMatrix,
  computeBreakEvenCurve,
  compareCropsEconomics,
} from "../utils/calculations.js";
import { formatCurrency, formatNumber, getCropEmoji } from "../utils/formatters.js";
import {
  Calculator,
  PieChart as PieIcon,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Scale,
  Sparkles,
  RefreshCw,
  Printer,
  ChevronRight,
  SlidersHorizontal,
  Info,
  DollarSign,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Calendar,
  Compass,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Minus,
  Briefcase,
  Store,
  FileText,
  BadgePercent,
  Cpu,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { ProfitRiskReportModal } from "./ProfitRiskReportModal.jsx";

// Strategy Presets for instant agricultural modeling
const STRATEGY_PRESETS = [
  {
    id: "standard_icar",
    name: "ICAR Recommended",
    badge: "Standard",
    desc: "Balanced commercial inputs adhering to state agricultural university package of practices.",
    multiplier: { seed: 1.0, fert: 1.0, pest: 1.0, labor: 1.0, mach: 1.0, irr: 1.0, yield: 1.0 },
  },
  {
    id: "precision_ag",
    name: "High-Tech / Precision Ag",
    badge: "Max Yield",
    desc: "Premium hybrid seeds, micro-drip fertigation, bio-stimulants and mechanization for peak yields.",
    multiplier: { seed: 1.3, fert: 1.25, pest: 1.2, labor: 0.85, mach: 1.3, irr: 0.8, yield: 1.25 },
  },
  {
    id: "low_cost",
    name: "Low-Cost / Zero Budget",
    badge: "Budget",
    desc: "Farmyard manure, jeevamrut, minimal synthetic fertilizers and low-tillage practices.",
    multiplier: { seed: 0.8, fert: 0.45, pest: 0.5, labor: 1.2, mach: 0.7, irr: 0.75, yield: 0.85 },
  },
  {
    id: "drip_resilient",
    name: "Solar Drip Climate-Resilient",
    badge: "Water Saver",
    desc: "Solar-powered micro-drip lines, mulching, and drought-tolerant seed varieties.",
    multiplier: { seed: 1.1, fert: 0.9, pest: 0.9, labor: 0.9, mach: 1.1, irr: 0.5, yield: 1.12 },
  },
];

export function ProfitRiskView() {
  const { farmProfile, fields, marketData } = useFarm();
  const { isDarkMode } = useTheme();

  // Active sub-tab state
  const [activeTab, setActiveTab] = useState("modeler"); // 'modeler' | 'breakeven' | 'sensitivity' | 'comparison' | 'risk'

  // Selected crop
  const [selectedCropId, setSelectedCropId] = useState("wheat");
  const selectedCrop = useMemo(() => {
    return CROPS_CATALOG.find((c) => c.id === selectedCropId) || CROPS_CATALOG[0];
  }, [selectedCropId]);

  // Selected field sync
  const [selectedFieldId, setSelectedFieldId] = useState("custom");

  // Core production inputs
  const [areaAcres, setAreaAcres] = useState(10);
  const [expectedYieldQtl, setExpectedYieldQtl] = useState(selectedCrop.averageYieldQtlPerAcre || 21.5);
  const [sellingPricePerQtl, setSellingPricePerQtl] = useState(selectedCrop.typicalPricePerQtl || 2350);

  // Granular Operational Expenditures (₹ / Acre)
  const [seedCost, setSeedCost] = useState(1800);
  const [fertCost, setFertCost] = useState(3800);
  const [pestCost, setPestCost] = useState(1400);
  const [laborCost, setLaborCost] = useState(4500);
  const [irrCost, setIrrCost] = useState(1200);
  const [machCost, setMachCost] = useState(3200);
  const [transCost, setTransCost] = useState(800);
  const [overheadCost, setOverheadCost] = useState(1500);

  // Risk parameters (0-25 scale factors)
  const [climateRisk, setClimateRisk] = useState(8);
  const [pestRisk, setPestRisk] = useState(12);
  const [marketRisk, setMarketRisk] = useState(14);
  const [inputInflation, setInputInflation] = useState(10);

  // UI preferences
  const [showSliderToggles, setShowSliderToggles] = useState(false);
  const [activeStrategy, setActiveStrategy] = useState("standard_icar");
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Auto-tune inputs when crop changes
  const handleCropChange = useCallback((cId) => {
    setSelectedCropId(cId);
    const crop = CROPS_CATALOG.find((item) => item.id === cId);
    if (!crop) return;

    setExpectedYieldQtl(crop.averageYieldQtlPerAcre || 20);
    setSellingPricePerQtl(crop.typicalPricePerQtl || 2400);

    // Adjust realistic baseline cost structure per crop type
    if (crop.category === "Vegetable") {
      setSeedCost(3500);
      setFertCost(5800);
      setPestCost(3200);
      setLaborCost(8500);
      setMachCost(3800);
      setIrrCost(2200);
      setTransCost(1800);
      setOverheadCost(2000);
    } else if (crop.category === "Cash Crop") {
      setSeedCost(2800);
      setFertCost(4800);
      setPestCost(2800);
      setLaborCost(6800);
      setMachCost(3800);
      setIrrCost(1800);
      setTransCost(1200);
      setOverheadCost(1800);
    } else if (crop.category === "Oilseed" || crop.category === "Pulse") {
      setSeedCost(1400);
      setFertCost(2500);
      setPestCost(1000);
      setLaborCost(3400);
      setMachCost(2600);
      setIrrCost(800);
      setTransCost(700);
      setOverheadCost(1200);
    } else {
      // Cereals
      setSeedCost(1800);
      setFertCost(3800);
      setPestCost(1400);
      setLaborCost(4500);
      setMachCost(3200);
      setIrrCost(1200);
      setTransCost(800);
      setOverheadCost(1500);
    }
    setActiveStrategy("standard_icar");
  }, []);

  // Sync with selected farm field
  const handleFieldSelect = (fieldId) => {
    setSelectedFieldId(fieldId);
    if (fieldId === "custom") return;

    const targetField = fields?.find((f) => f.id === fieldId);
    if (targetField) {
      setAreaAcres(Number(targetField.areaAcres) || 10);
      // Check if crop matches catalog
      const matchedCrop = CROPS_CATALOG.find(
        (c) =>
          c.name.toLowerCase().includes(targetField.currentCrop?.toLowerCase().split(" ")[0] || "") ||
          targetField.currentCrop?.toLowerCase().includes(c.id)
      );
      if (matchedCrop) {
        handleCropChange(matchedCrop.id);
      }
    }
  };

  // Sync Mandi Live Market Price
  const handleSyncMandiPrice = () => {
    let syncedPrice = selectedCrop.typicalPricePerQtl;
    // Check if marketData contains recent APMC rate for this crop
    if (Array.isArray(marketData) && marketData.length > 0) {
      const match = marketData.find(
        (m) =>
          m.commodity?.toLowerCase().includes(selectedCrop.id) ||
          selectedCrop.name.toLowerCase().includes(m.commodity?.toLowerCase())
      );
      if (match && match.modalPrice) {
        syncedPrice = match.modalPrice;
      }
    } else if (selectedCrop.mspPerQtl) {
      syncedPrice = selectedCrop.mspPerQtl;
    }
    setSellingPricePerQtl(syncedPrice);
  };

  // Apply Strategy Preset
  const handleApplyStrategy = (stratId) => {
    setActiveStrategy(stratId);
    const strat = STRATEGY_PRESETS.find((s) => s.id === stratId);
    if (!strat) return;

    const baseYield = selectedCrop.averageYieldQtlPerAcre;
    setExpectedYieldQtl(Number((baseYield * strat.multiplier.yield).toFixed(1)));
    setSeedCost((prev) => Math.round(prev * strat.multiplier.seed));
    setFertCost((prev) => Math.round(prev * strat.multiplier.fert));
    setPestCost((prev) => Math.round(prev * strat.multiplier.pest));
    setLaborCost((prev) => Math.round(prev * strat.multiplier.labor));
    setMachCost((prev) => Math.round(prev * strat.multiplier.mach));
    setIrrCost((prev) => Math.round(prev * strat.multiplier.irr));
  };

  // Numeric Stepper Helper
  const stepValue = (setter, current, step, min = 0, max = 1000000) => {
    const val = Number(current) || 0;
    const next = Math.min(max, Math.max(min, val + step));
    setter(next);
  };

  // Computed Financial Simulation Model
  const simulationResult = useMemo(() => {
    const input = {
      cropName: selectedCrop.name,
      season: selectedCrop.season,
      areaAcres,
      expectedYieldQtlPerAcre: expectedYieldQtl,
      sellingPricePerQtl,
      seedCostPerAcre: seedCost,
      fertilizerCostPerAcre: fertCost,
      pesticideCostPerAcre: pestCost,
      laborCostPerAcre: laborCost,
      irrigationCostPerAcre: irrCost,
      machineryRentalPerAcre: machCost,
      postHarvestTransportPerAcre: transCost,
      overheadCostPerAcre: overheadCost,
      climateRiskFactor: climateRisk,
      pestRiskFactor: pestRisk,
      marketRiskFactor: marketRisk,
      inputInflationFactor: inputInflation,
    };
    return computeProfitRiskSimulation(input);
  }, [
    selectedCrop,
    areaAcres,
    expectedYieldQtl,
    sellingPricePerQtl,
    seedCost,
    fertCost,
    pestCost,
    laborCost,
    irrCost,
    machCost,
    transCost,
    overheadCost,
    climateRisk,
    pestRisk,
    marketRisk,
    inputInflation,
  ]);

  // Computed Sensitivity Matrix (5x5)
  const sensitivityData = useMemo(() => {
    return computeSensitivityMatrix({
      areaAcres,
      expectedYieldQtlPerAcre: expectedYieldQtl,
      sellingPricePerQtl,
      seedCostPerAcre: seedCost,
      fertilizerCostPerAcre: fertCost,
      pesticideCostPerAcre: pestCost,
      laborCostPerAcre: laborCost,
      irrigationCostPerAcre: irrCost,
      machineryRentalPerAcre: machCost,
      postHarvestTransportPerAcre: transCost,
      overheadCostPerAcre: overheadCost,
    });
  }, [
    areaAcres,
    expectedYieldQtl,
    sellingPricePerQtl,
    seedCost,
    fertCost,
    pestCost,
    laborCost,
    irrCost,
    machCost,
    transCost,
    overheadCost,
  ]);

  // Computed Break-Even Curve Data
  const breakEvenCurveData = useMemo(() => {
    return computeBreakEvenCurve({
      areaAcres,
      expectedYieldQtlPerAcre: expectedYieldQtl,
      sellingPricePerQtl,
      seedCostPerAcre: seedCost,
      fertilizerCostPerAcre: fertCost,
      pesticideCostPerAcre: pestCost,
      laborCostPerAcre: laborCost,
      irrigationCostPerAcre: irrCost,
      machineryRentalPerAcre: machCost,
      postHarvestTransportPerAcre: transCost,
      overheadCostPerAcre: overheadCost,
    });
  }, [
    areaAcres,
    expectedYieldQtl,
    sellingPricePerQtl,
    seedCost,
    fertCost,
    pestCost,
    laborCost,
    irrCost,
    machCost,
    transCost,
    overheadCost,
  ]);

  // Computed Multi-Crop Comparison List
  const multiCropList = useMemo(() => {
    return compareCropsEconomics(CROPS_CATALOG, areaAcres, selectedCrop.season);
  }, [areaAcres, selectedCrop.season]);

  // Cost Allocation Donut Data
  const costPieData = useMemo(() => {
    const raw = [
      { name: "Fertilizer & NPK", value: simulationResult.costBreakdown.fertilizers, color: "#22c55e" },
      { name: "Field Labor", value: simulationResult.costBreakdown.labor, color: "#facc15" },
      { name: "Machinery & Fuel", value: simulationResult.costBreakdown.machinery, color: "#38bdf8" },
      { name: "Seeds & Hybrid", value: simulationResult.costBreakdown.seeds, color: "#a855f7" },
      { name: "Pesticides & Bio", value: simulationResult.costBreakdown.pesticides, color: "#f43f5e" },
      { name: "Irrigation & Power", value: simulationResult.costBreakdown.irrigation, color: "#06b6d4" },
      { name: "Transport & Cess", value: simulationResult.costBreakdown.transport, color: "#86efac" },
      { name: "Fixed Overheads", value: simulationResult.costBreakdown.overhead, color: "#94a3b8" },
    ];
    return raw.filter((item) => item.value > 0);
  }, [simulationResult]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner & Control Bar */}
      <div className="app-card p-6 border border-[var(--border)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 flex items-center gap-1.5 font-mono">
                <BadgePercent className="w-3.5 h-3.5" />
                <span>Farm Economics & Risk Engine</span>
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                📍 {farmProfile.location || "Punjab, India"}
              </span>
              <span className="text-xs text-[var(--primary)] font-semibold font-mono">
                ICAR C2 Standard
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-heading font-bold tracking-tight text-[var(--text-primary)]">
              Crop Profitability & Risk Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm mt-1 max-w-2xl text-[var(--text-secondary)]">
              Model operational expenditures, simulate real-time Mandi market margins, evaluate break-even points, and stress-test weather and market risk.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Field Sync Selector */}
            <div className="relative">
              <select
                id="select-farm-field-sync"
                value={selectedFieldId}
                onChange={(e) => handleFieldSelect(e.target.value)}
                className="form-select text-xs font-semibold cursor-pointer"
              >
                <option value="custom">⚙️ Custom Parameters</option>
                {fields?.map((f) => (
                  <option key={f.id} value={f.id}>
                    🌱 {f.name} ({f.areaAcres} A - {f.currentCrop.split(" ")[0]})
                  </option>
                ))}
              </select>
            </div>

            {/* Target Crop Selector */}
            <div className="relative">
              <select
                id="select-target-crop"
                value={selectedCropId}
                onChange={(e) => handleCropChange(e.target.value)}
                className="form-select text-xs font-bold text-[var(--primary)] cursor-pointer"
              >
                {CROPS_CATALOG.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCropEmoji(c.name)} {c.name.split("(")[0]} ({c.season})
                  </option>
                ))}
              </select>
            </div>

            {/* Print / Report Button */}
            <button
              id="open-profit-risk-report-btn"
              onClick={() => setReportModalOpen(true)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Export Plan</span>
            </button>
          </div>
        </div>

        {/* Strategy Presets Strip */}
        <div className="mt-5 pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Agronomic Strategy Presets:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {STRATEGY_PRESETS.map((strat) => {
              const isSelected = activeStrategy === strat.id;
              return (
                <button
                  key={strat.id}
                  id={`strategy-preset-${strat.id}`}
                  onClick={() => handleApplyStrategy(strat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent shadow-md shadow-emerald-600/20"
                      : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  }`}
                  title={strat.desc}
                >
                  <span>{strat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-[var(--primary-soft)] text-[var(--primary)]"
                  }`}>
                    {strat.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5 Executive Financial Metric Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Net Realized Profit */}
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Net Farm Profit
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 my-1 block">
            {formatCurrency(simulationResult.netProfit)}
          </span>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span>{formatCurrency(simulationResult.profitPerAcre)} / Acre</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{simulationResult.netMarginPercent}% margin</span>
          </div>
        </div>

        {/* Metric 2: Gross Harvest Revenue */}
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Gross Revenue
            </span>
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-heading font-bold text-[var(--text-primary)] my-1 block">
            {formatCurrency(simulationResult.grossRevenue)}
          </span>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>{simulationResult.totalExpectedYieldQtl} Qtl Output</span>
            <span>@ ₹{sellingPricePerQtl}/Qtl</span>
          </div>
        </div>

        {/* Metric 3: Total OPEX Expenditures */}
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Total OPEX Cost
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-heading font-bold text-rose-600 dark:text-rose-400 my-1 block">
            {formatCurrency(simulationResult.totalCost)}
          </span>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] font-mono">
            <span>{formatCurrency(simulationResult.costPerAcre)} / Acre</span>
            <span>COP: ₹{simulationResult.costOfProductionPerQtl}/Qtl</span>
          </div>
        </div>

        {/* Metric 4: Return on Investment (ROI) */}
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Return on Investment
            </span>
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <BadgePercent className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-heading font-bold text-[var(--primary)] my-1 block font-mono">
            {simulationResult.roiPercentage}%
          </span>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-mono">B:C Ratio: {simulationResult.benefitCostRatio}x</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Strong</span>
          </div>
        </div>

        {/* Metric 5: Break-Even Safety Margin */}
        <div className="app-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-secondary)]">
              Break-Even Yield
            </span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Scale className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-heading font-bold text-amber-600 dark:text-amber-400 my-1 block">
            {simulationResult.breakEvenYieldQtlPerAcre} <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Qtl/A</span>
          </span>
          <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
            <span className="font-mono">Price: ₹{simulationResult.breakEvenPricePerQtl}/Q</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">+{simulationResult.marginOfSafetyPercent}% buf</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[var(--border)]">
        {[
          { id: "modeler", label: "Cost & Production Modeler", icon: Calculator },
          { id: "breakeven", label: "Break-Even & Cost Curves", icon: Scale },
          { id: "sensitivity", label: "Price-Yield Sensitivity Matrix", icon: SlidersHorizontal },
          { id: "comparison", label: "Crop Decision Matrix", icon: Layers },
          { id: "risk", label: "Risk Engine & Insurance", icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`profit-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= TAB 1: COST & PRODUCTION MODELER ================= */}
      {activeTab === "modeler" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left 7 Columns: Direct Value Form Inputs */}
          <div className="lg:col-span-7 app-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-[var(--primary)]" />
                <h2 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  Direct Value Input Modeler
                </h2>
              </div>
              <button
                id="toggle-sliders-mode"
                onClick={() => setShowSliderToggles(!showSliderToggles)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition ${
                  showSliderToggles
                    ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20"
                    : "text-[var(--text-secondary)] border-[var(--border)] hover:text-[var(--text-primary)]"
                }`}
              >
                {showSliderToggles ? "Sliders: ON" : "Sliders: OFF"}
              </button>
            </div>

            {/* SECTION 1: Core Farm & Market Variables */}
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold text-[var(--primary)] tracking-wider block font-mono">
                1. Core Harvest & Market Variables
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Land Area Input */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                  <label htmlFor="input-land-area" className="text-xs font-medium text-[var(--text-secondary)] uppercase block mb-1.5">
                    Land Area
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="input-land-area"
                      type="number"
                      min="0.5"
                      max="1000"
                      step="0.5"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(Math.max(0.1, Number(e.target.value)))}
                      className="form-input w-full text-base font-bold font-mono pr-14"
                    />
                    <span className="absolute right-3 text-xs font-semibold text-[var(--primary)] pointer-events-none select-none">
                      Acres
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepValue(setAreaAcres, areaAcres, -1, 0.5, 500)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Decrease land area"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepValue(setAreaAcres, areaAcres, 1, 0.5, 500)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Increase land area"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono whitespace-nowrap">Total: {areaAcres} A</span>
                  </div>
                  {showSliderToggles && (
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={areaAcres}
                      onChange={(e) => setAreaAcres(Number(e.target.value))}
                      className="w-full accent-[var(--primary)] mt-2"
                    />
                  )}
                </div>

                {/* Expected Yield Input */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                  <label htmlFor="input-expected-yield" className="text-xs font-medium text-[var(--text-secondary)] uppercase block mb-1.5">
                    Expected Yield
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="input-expected-yield"
                      type="number"
                      min="1"
                      max="500"
                      step="0.5"
                      value={expectedYieldQtl}
                      onChange={(e) => setExpectedYieldQtl(Math.max(0.1, Number(e.target.value)))}
                      className="form-input w-full text-base font-bold font-mono text-amber-600 dark:text-amber-400 pr-14"
                    />
                    <span className="absolute right-3 text-xs font-semibold text-amber-600 dark:text-amber-400 pointer-events-none select-none">
                      Qtl/A
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepValue(setExpectedYieldQtl, expectedYieldQtl, -1, 1, 500)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Decrease expected yield"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepValue(setExpectedYieldQtl, expectedYieldQtl, 1, 1, 500)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-amber-500/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Increase expected yield"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono whitespace-nowrap">Total: {Math.round(expectedYieldQtl * areaAcres)} Qtl</span>
                  </div>
                  {showSliderToggles && (
                    <input
                      type="range"
                      min="2"
                      max="150"
                      value={expectedYieldQtl}
                      onChange={(e) => setExpectedYieldQtl(Number(e.target.value))}
                      className="w-full accent-amber-500 mt-2"
                    />
                  )}
                </div>

                {/* Mandi Selling Price Input */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="input-selling-price" className="text-xs font-medium text-[var(--text-secondary)] uppercase">
                      Mandi Price
                    </label>
                    <button
                      id="sync-live-mandi-rate-btn"
                      type="button"
                      onClick={handleSyncMandiPrice}
                      className="text-[10px] font-bold text-[var(--primary)] hover:underline flex items-center gap-0.5 cursor-pointer"
                      title="Sync with Live Mandi Rate / MSP"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>Sync</span>
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-sm font-bold text-[var(--primary)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="input-selling-price"
                      type="number"
                      min="500"
                      max="30000"
                      step="50"
                      value={sellingPricePerQtl}
                      onChange={(e) => setSellingPricePerQtl(Math.max(1, Number(e.target.value)))}
                      className="form-input w-full text-base font-bold font-mono text-[var(--primary)] pl-8 pr-12"
                    />
                    <span className="absolute right-3 text-xs font-medium text-[var(--text-muted)] pointer-events-none select-none">
                      /Qtl
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => stepValue(setSellingPricePerQtl, sellingPricePerQtl, -50, 500, 30000)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Decrease selling price"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => stepValue(setSellingPricePerQtl, sellingPricePerQtl, 50, 500, 30000)}
                        className="w-6 h-6 rounded-md bg-[var(--surface)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--primary)]/50 flex items-center justify-center transition cursor-pointer"
                        aria-label="Increase selling price"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <span className="text-[11px] text-[var(--text-muted)] font-mono whitespace-nowrap">
                      MSP: ₹{selectedCrop.mspPerQtl || selectedCrop.typicalPricePerQtl}
                    </span>
                  </div>
                  {showSliderToggles && (
                    <input
                      type="range"
                      min="800"
                      max="12000"
                      step="50"
                      value={sellingPricePerQtl}
                      onChange={(e) => setSellingPricePerQtl(Number(e.target.value))}
                      className="w-full accent-[var(--primary)] mt-2"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Agronomic Operational Costs (₹ Per Acre) */}
            <div className="space-y-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-[var(--primary)] tracking-wider block font-mono">
                  2. Agronomic & Field Input Expenditures (₹ / Acre)
                </span>
                <span className="text-xs text-[var(--text-secondary)]">
                  Total: <strong className="text-rose-600 dark:text-rose-400 font-mono">{formatCurrency(simulationResult.costPerAcre)}</strong> / A
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Seed & Hybrid */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#a855f7] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-seed"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Seeds & Seed Treatment"
                    >
                      Seeds &amp; Seed Treatment
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title={`Rate: ${selectedCrop.seedRatePerAcre || "Standard"}`}
                    >
                      Rate: {selectedCrop.seedRatePerAcre || "Standard"}
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-seed"
                      type="number"
                      value={seedCost}
                      onChange={(e) => setSeedCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Fertilizers & NPK */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#22c55e] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-fert"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Fertilizers, DAP & Urea"
                    >
                      Fertilizers, DAP &amp; Urea
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title={`NPK: ${selectedCrop.optimalN}:${selectedCrop.optimalP}:${selectedCrop.optimalK}`}
                    >
                      NPK: {selectedCrop.optimalN}:{selectedCrop.optimalP}:{selectedCrop.optimalK}
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-fert"
                      type="number"
                      value={fertCost}
                      onChange={(e) => setFertCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Plant Protection & Sprays */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#f43f5e] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-pest"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Plant Protection & Bio-sprays"
                    >
                      Plant Protection &amp; Sprays
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title="Fungicides & Pesticides"
                    >
                      Fungicides &amp; Pests
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-pest"
                      type="number"
                      value={pestCost}
                      onChange={(e) => setPestCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Field Labor */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#facc15] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-labor"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Field Labor & Weeding"
                    >
                      Field Labor &amp; Weeding
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title="Sowing, manual weeding, harvest"
                    >
                      Sowing, weeding, harvest
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-labor"
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Machinery & Fuel */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#38bdf8] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-mach"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Machinery & Harvester"
                    >
                      Machinery &amp; Harvester
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title="Tractor, diesel, combine harvester"
                    >
                      Tractor, diesel, combine
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-mach"
                      type="number"
                      value={machCost}
                      onChange={(e) => setMachCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Irrigation & Energy */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#06b6d4] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-irr"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Irrigation & Pumping Power"
                    >
                      Irrigation &amp; Power
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title={`Water need: ${selectedCrop.waterRequirementMm} mm`}
                    >
                      Water: {selectedCrop.waterRequirementMm} mm
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-irr"
                      type="number"
                      value={irrCost}
                      onChange={(e) => setIrrCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Post Harvest & Transport */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#86efac] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-trans"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Transport & Mandi Cess"
                    >
                      Transport &amp; Mandi Cess
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title="Bagging, loading, APMC fee"
                    >
                      Bagging, loading, APMC
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-trans"
                      type="number"
                      value={transCost}
                      onChange={(e) => setTransCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                {/* Fixed Overheads & Land Lease */}
                <div className="p-3.5 rounded-xl border border-[var(--border)] border-l-[3px] border-l-[#94a3b8] bg-[var(--surface-subtle)] flex items-center justify-between gap-3 hover:border-[var(--border-strong)] transition-all">
                  <div className="flex-1 min-w-0 pr-2">
                    <label
                      htmlFor="cost-input-overhead"
                      className="text-xs font-bold text-[var(--text-primary)] block truncate cursor-pointer hover:text-[var(--primary)] transition-colors"
                      title="Fixed Overheads & Land Lease"
                    >
                      Fixed Overheads &amp; Lease
                    </label>
                    <span
                      className="text-[11px] text-[var(--text-muted)] block truncate mt-0.5 font-mono"
                      title="Land interest, supervisory & maintenance"
                    >
                      Land interest, supervision
                    </span>
                  </div>
                  <div className="relative flex items-center shrink-0 w-28">
                    <span className="absolute left-2.5 text-xs font-semibold text-[var(--text-muted)] pointer-events-none select-none">
                      ₹
                    </span>
                    <input
                      id="cost-input-overhead"
                      type="number"
                      value={overheadCost}
                      onChange={(e) => setOverheadCost(Math.max(0, Number(e.target.value)))}
                      className="form-input w-28 pl-6 pr-2.5 py-1.5 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Live Cost Donut + Quick Financial Scorecard */}
          <div className="lg:col-span-5 space-y-6">
            {/* Cost Distribution Donut */}
            <div className="app-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-[var(--primary)]" />
                  <span>Expenditure Distribution</span>
                </h3>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-bold font-mono">
                  {formatCurrency(simulationResult.totalCost)} Total
                </span>
              </div>

              {/* Donut Chart with Center Metric */}
              <div className="relative h-44 w-full flex items-center justify-center my-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={costPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {costPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [`${formatCurrency(value)}`, "Expenditure"]}
                      contentStyle={{
                        backgroundColor: "var(--surface-modal)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Stat */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] font-mono">
                    OPEX
                  </span>
                  <span className="text-sm font-bold font-mono text-[var(--text-primary)]">
                    {simulationResult.costPerAcre ? formatCurrency(simulationResult.costPerAcre) : "₹0"}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">/ Acre</span>
                </div>
              </div>

              {/* Categorized Breakdown Legend */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-3 border-t border-[var(--border)]">
                {costPieData.map((item) => {
                  const pct = simulationResult.totalCost > 0
                    ? Math.round((item.value / simulationResult.totalCost) * 100)
                    : 0;
                  return (
                    <div key={item.name} className="flex items-center justify-between text-xs py-0.5">
                      <div className="flex items-center gap-1.5 min-w-0 pr-1">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span
                          className="text-[11px] text-[var(--text-secondary)] truncate font-medium"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[var(--text-primary)] shrink-0">
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Cost Drivers Summary */}
              <div className="pt-2 border-t border-[var(--border)] space-y-2">
                <span className="text-xs font-semibold text-[var(--text-secondary)] block">Top Cost Drivers:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Labor & Sowing</span>
                    <span className="font-heading font-bold text-amber-600 dark:text-amber-400">{formatCurrency(simulationResult.costBreakdown.labor)}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Fertilizers & NPK</span>
                    <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(simulationResult.costBreakdown.fertilizers)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cash Flow Health & Margin Card */}
            <div className="app-card p-6 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  Realized Unit Economics
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                  Healthy Cash Flow
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)]">Market Price per Qtl:</span>
                  <span className="font-bold font-mono text-[var(--primary)]">₹{sellingPricePerQtl}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-[var(--text-secondary)]">Cost of Production (COP) / Qtl:</span>
                  <span className="font-bold font-mono text-rose-600 dark:text-rose-400">₹{simulationResult.costOfProductionPerQtl}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-[var(--border)] font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">Net Margin Per Quintal:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">+₹{simulationResult.profitMarginPerQtl} / Qtl</span>
                </div>
              </div>

              <button
                onClick={() => setActiveTab("breakeven")}
                className="w-full mt-3 py-2.5 rounded-xl text-xs font-semibold btn-secondary flex items-center justify-center gap-1.5"
              >
                <span>View Complete Break-Even Chart</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: BREAK-EVEN & CASH FLOW ANALYSIS ================= */}
      {activeTab === "breakeven" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Main Break-Even Intersection Chart */}
          <div className="app-card p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-500" />
                  <span>Harvest Revenue vs. Operational Cost Curve</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Visualizes the exact Break-Even intersection point where total harvest earnings surpass cumulative farm expenditures.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold font-mono">
                  Break-Even: {simulationResult.breakEvenYieldQtlPerAcre} Qtl/Acre
                </span>
              </div>
            </div>

            {/* Recharts Area Curve */}
            <div className="h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={breakEvenCurveData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(163, 177, 198, 0.45)"} />
                  <XAxis
                    dataKey="yieldPerAcre"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickFormatter={(val) => `${val} Q/A`}
                  />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value, name) => [
                      formatCurrency(value),
                      name === "revenue" ? "Gross Revenue" : name === "cost" ? "Cumulative Cost" : "Net Profit",
                    ]}
                    labelFormatter={(label) => `Yield: ${label} Quintals / Acre`}
                    contentStyle={{
                      backgroundColor: "var(--surface-modal)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Revenue (₹)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    name="Total OPEX Cost (₹)"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    name="Net Realized Profit (₹)"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <ReferenceLine
                    x={simulationResult.breakEvenYieldQtlPerAcre}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    label={{
                      value: `Break-Even: ${simulationResult.breakEvenYieldQtlPerAcre} Q`,
                      fill: "#f59e0b",
                      fontSize: 11,
                      position: "top",
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Benchmarks Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[var(--border)] text-xs">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                  Margin of Safety Buffer
                </span>
                <span className="text-xl font-heading font-bold text-emerald-600 dark:text-emerald-400 my-1 block">
                  +{simulationResult.marginOfSafetyPercent}%
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Yield can drop by up to {formatNumber(expectedYieldQtl - simulationResult.breakEvenYieldQtlPerAcre)} Qtl/Acre before experiencing operational loss.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                  Cost of Production (COP)
                </span>
                <span className="text-xl font-heading font-bold text-[var(--primary)] my-1 block font-mono">
                  ₹{simulationResult.costOfProductionPerQtl} / Qtl
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Current Mandi Price (₹{sellingPricePerQtl}) provides a protective spread of +₹{simulationResult.profitMarginPerQtl}/Qtl.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                  Minimum Floor Price
                </span>
                <span className="text-xl font-heading font-bold text-amber-600 dark:text-amber-400 my-1 block font-mono">
                  ₹{simulationResult.breakEvenPricePerQtl} / Qtl
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Lowest open-auction mandi bidding rate required to recover 100% of input capital.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: PRICE-YIELD SENSITIVITY MATRIX ================= */}
      {activeTab === "sensitivity" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="app-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
                  <span>Price vs. Yield Sensitivity Heatmap Matrix</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Stress-test farm outcomes across 25 combinations of fluctuating Mandi prices and harvest yields (Net Profit ₹ / Acre).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40 inline-block"></span> High Profit
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500/40 inline-block"></span> Moderate
                </span>
                <span className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <span className="w-3 h-3 rounded bg-rose-500/20 border border-rose-500/40 inline-block"></span> Loss
                </span>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-b border-[var(--border)]">
                    <th className="py-3 px-3 text-left font-semibold uppercase text-[10px]">
                      Mandi Price \ Yield
                    </th>
                    {sensitivityData.yieldDeltas.map((y, idx) => (
                      <th key={idx} className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                        {y.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {sensitivityData.matrix.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="py-3 px-3 text-left font-bold font-mono text-[var(--primary)] bg-[var(--surface-subtle)] border-r border-[var(--border)] whitespace-nowrap">
                        {row.priceLabel}
                      </td>
                      {row.cells.map((cell, cIdx) => {
                        let cellBg = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
                        if (cell.netProfitPerAcre < 0) {
                          cellBg = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
                        } else if (cell.netProfitPerAcre < 18000) {
                          cellBg = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                        }

                        return (
                          <td
                            key={cIdx}
                            className={`py-3 px-2 transition border-b border-[var(--border)] ${
                              cell.isBase ? "ring-2 ring-emerald-500 ring-inset font-bold" : ""
                            }`}
                          >
                            <div className={`p-2 rounded-lg border ${cellBg}`}>
                              <span className="font-heading font-bold block text-xs font-mono">
                                {cell.netProfitPerAcre >= 0 ? "+" : ""}
                                {formatCurrency(cell.netProfitPerAcre)}
                              </span>
                              <span className="text-[10px] opacity-80 block font-mono">
                                ROI: {cell.roi}%
                              </span>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 3 Scenario Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-rose-600 dark:text-rose-400 uppercase text-[11px]">Bear / Drought (-20%)</span>
                  <ArrowDownRight className="w-4 h-4 text-rose-500" />
                </div>
                <span className="text-lg font-heading font-bold text-rose-600 dark:text-rose-400 block font-mono">
                  {formatCurrency(Math.round(simulationResult.netProfit * 0.45))} Net
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Simulates unseasonal weather deficit (-20% yield) & post-harvest market glut (-10% price).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase text-[11px]">Base Forecast</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-lg font-heading font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                  {formatCurrency(simulationResult.netProfit)} Net
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Standard agronomic yields ({expectedYieldQtl} Qtl/A) @ current mandi rate (₹{sellingPricePerQtl}).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--primary)] uppercase text-[11px]">Bull / Optimal (+20%)</span>
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-lg font-heading font-bold text-[var(--primary)] block font-mono">
                  {formatCurrency(Math.round(simulationResult.netProfit * 1.55))} Net
                </span>
                <p className="text-xs text-[var(--text-secondary)]">
                  Peak micro-drip precision yield (+20%) timed with festive market price surge (+15%).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: CROP DECISION MATRIX ================= */}
      {activeTab === "comparison" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="app-card p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-500" />
                  <span>Comparative Crop Decision Matrix ({areaAcres} Acres)</span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  Benchmark net profits, capital requirements, and water profitability ratios across candidate crops on your land parcel.
                </p>
              </div>
            </div>

            {/* Bar Chart: Net Profit across Crops */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={multiCropList.slice(0, 6).map((item) => ({
                    name: item.crop.name.split("(")[0],
                    profitPerAcre: item.profitPerAcre,
                    costPerAcre: item.costPerAcre,
                    roi: item.roi,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(163, 177, 198, 0.45)"} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), "Amount per Acre"]}
                    contentStyle={{
                      backgroundColor: "var(--surface-modal)",
                      borderColor: "var(--border)",
                      borderRadius: "0.75rem",
                      fontSize: "12px",
                      color: "var(--text-primary)",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="profitPerAcre" name="Net Profit (₹ / Acre)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="costPerAcre" name="Investment Cost (₹ / Acre)" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Crop Ranking List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {multiCropList.slice(0, 6).map((item, idx) => {
                const isSelected = item.crop.id === selectedCropId;
                return (
                  <div
                    key={item.crop.id}
                    onClick={() => handleCropChange(item.crop.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-emerald-500/10 border-emerald-500/50 shadow-sm"
                        : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getCropEmoji(item.crop.name)}</span>
                        <div>
                          <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">{item.crop.name.split("(")[0]}</h4>
                          <span className="text-[10px] text-[var(--text-muted)]">{item.crop.season} • {item.crop.category}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">#{idx + 1}</span>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-[var(--border)]">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Net Profit / Acre:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(item.profitPerAcre)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Expected Total Net ({areaAcres} A):</span>
                        <span className="font-semibold text-[var(--text-primary)] font-mono">{formatCurrency(item.netProfit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Projected ROI:</span>
                        <span className="font-semibold text-[var(--primary)] font-mono">{item.roi}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-secondary)]">Water Efficiency:</span>
                        <span className="font-semibold text-amber-600 dark:text-amber-400 font-mono">₹{item.waterProfitRatio}/mm</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: RISK ENGINE & INSURANCE ================= */}
      {activeTab === "risk" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* Left 7 Columns: 4-Pillar Vulnerability Matrix */}
          <div className="lg:col-span-7 app-card p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
                  4-Pillar Agronomic Risk Scorecard
                </h3>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full uppercase border font-mono ${
                  simulationResult.riskAssessment.overallRisk === "Low"
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}
              >
                {simulationResult.riskAssessment.overallRisk} Risk ({simulationResult.riskAssessment.riskScore}/100)
              </span>
            </div>

            {/* 4 Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Climate Risk */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Climate & Monsoon Risk</span>
                  </div>
                  <span className="text-xs font-bold text-[var(--primary)] font-mono">
                    {simulationResult.riskAssessment.pillars.climateRisk.score}/25
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(simulationResult.riskAssessment.pillars.climateRisk.score / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Water requirement ({selectedCrop.waterRequirementMm} mm). Sensitivity: {simulationResult.riskAssessment.monsoonSensitivity}.
                </p>
              </div>

              {/* Market Risk */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Market Price Volatility</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {simulationResult.riskAssessment.pillars.marketRisk.score}/25
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(simulationResult.riskAssessment.pillars.marketRisk.score / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Cushioned by MSP (₹{selectedCrop.mspPerQtl || "N/A"}). Margin buffer: +{simulationResult.marginOfSafetyPercent}%.
                </p>
              </div>

              {/* Pest & Disease Risk */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Pest & Pathogen Pressure</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">
                    {simulationResult.riskAssessment.pillars.pestRisk.score}/25
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${(simulationResult.riskAssessment.pillars.pestRisk.score / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Key vulnerabilities: {selectedCrop.keyDiseases?.slice(0, 2).join(", ") || "Standard rusts"}.
                </p>
              </div>

              {/* Financial Resilience */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Financial Capital Resilience</span>
                  </div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                    {simulationResult.riskAssessment.pillars.financialResilience.score}/25
                  </span>
                </div>
                <div className="w-full bg-[var(--border)] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(simulationResult.riskAssessment.pillars.financialResilience.score / 25) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  ROI: {simulationResult.roiPercentage}% • B:C Ratio: {simulationResult.benefitCostRatio}x.
                </p>
              </div>
            </div>

            {/* Actionable Mitigation Strategies */}
            <div className="space-y-2.5 pt-2">
              <span className="text-xs uppercase font-bold text-[var(--text-secondary)] block">
                Prescribed Risk Mitigation Actions:
              </span>
              <ul className="space-y-2 text-xs">
                {simulationResult.riskAssessment.mitigationStrategies.map((strat, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-[var(--text-secondary)] text-xs leading-relaxed">{strat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right 5 Columns: PMFBY Crop Insurance Calculator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="app-card p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-heading font-bold text-[var(--text-primary)]">
                    PMFBY Insurance Estimator
                  </h3>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                  Govt Subsidized
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                  <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold block">
                    Total Farm Sum Insured
                  </span>
                  <span className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 my-1 block font-mono">
                    {formatCurrency(simulationResult.insurance.totalSumInsured)}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-mono">
                    {formatCurrency(simulationResult.insurance.sumInsuredPerAcre)} / Acre Coverage
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Farmer Premium</span>
                    <span className="text-sm font-heading font-bold text-[var(--primary)] font-mono">
                      {formatCurrency(simulationResult.insurance.farmerPremiumPayable)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono">({simulationResult.insurance.premiumRatePercent}% flat rate)</span>
                  </div>

                  <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Govt Subsidy Share</span>
                    <span className="text-sm font-heading font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      ~{formatCurrency(simulationResult.insurance.govtSubsidyEstimate)}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block font-mono">(80% state & central)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-[var(--text-secondary)] leading-relaxed">
                  🛡️ <strong>Zero-Loss Shield</strong>: PMFBY safeguards against prevented sowing, localized hail, mid-season drought, and post-harvest crop loss up to 14 days after harvesting.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Printable Feasibility Report Modal */}
      {reportModalOpen && (
        <ProfitRiskReportModal
          simulation={simulationResult}
          selectedCrop={selectedCrop}
          farmProfile={farmProfile}
          inputVariables={{
            areaAcres,
            expectedYieldQtl,
            sellingPricePerQtl,
            seedCostPerAcre: seedCost,
            fertilizerCostPerAcre: fertCost,
            pesticideCostPerAcre: pestCost,
            laborCostPerAcre: laborCost,
            irrigationCostPerAcre: irrCost,
            machineryRentalPerAcre: machCost,
            postHarvestTransportPerAcre: transCost,
            overheadCostPerAcre: overheadCost,
          }}
          isDarkMode={isDarkMode}
          onClose={() => setReportModalOpen(false)}
        />
      )}
    </div>
  );
}
