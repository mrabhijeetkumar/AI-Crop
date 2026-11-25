import React, { useState, useMemo } from "react";
import {
  Calculator,
  TrendingUp,
  Scale,
  PieChart as PieIcon,
  DollarSign,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  ArrowUpRight,
  Sliders,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "../../utils/formatters.js";

export function ProfitRiskSection({ onGenerateProfitReport }) {
  // Interactive Calculator State
  const [selectedCrop, setSelectedCrop] = useState("wheat");
  const [farmAreaAcres, setFarmAreaAcres] = useState(5.0);
  const [expectedYieldQtl, setExpectedYieldQtl] = useState(22.5); // per acre
  const [sellingPriceQtl, setSellingPriceQtl] = useState(2380); // ₹ per qtl

  // Cultivation Expense Breakdown (per acre)
  const [seedCost, setSeedCost] = useState(2400);
  const [fertilizerCost, setFertilizerCost] = useState(4800);
  const [labourCost, setLabourCost] = useState(5500);
  const [irrigationCost, setIrrigationCost] = useState(2200);
  const [machineryCost, setMachineryCost] = useState(4500);
  const [otherExpenses, setOtherExpenses] = useState(2100);

  // Crop presets
  const cropPresets = {
    wheat: {
      name: "Wheat (HD-2967)",
      yield: 22.5,
      price: 2380,
      seed: 2400,
      fertilizer: 4800,
      labour: 5500,
      irrigation: 2200,
      machinery: 4500,
      other: 2100,
      risk: "Low",
    },
    mustard: {
      name: "Mustard (Pusa Bold)",
      yield: 8.5,
      price: 5780,
      seed: 1200,
      fertilizer: 3200,
      labour: 3800,
      irrigation: 1200,
      machinery: 3200,
      other: 1600,
      risk: "Low-Moderate",
    },
    chickpea: {
      name: "Chickpea / Chana (JG-14)",
      yield: 10.2,
      price: 5450,
      seed: 2800,
      fertilizer: 2200,
      labour: 4200,
      irrigation: 1100,
      machinery: 3500,
      other: 1800,
      risk: "Low",
    },
    paddy: {
      name: "Paddy / Rice (PR-126)",
      yield: 30.5,
      price: 2320,
      seed: 1800,
      fertilizer: 5400,
      labour: 7200,
      irrigation: 3800,
      machinery: 4800,
      other: 2500,
      risk: "Moderate",
    },
  };

  const handleSelectPreset = (cropKey) => {
    setSelectedCrop(cropKey);
    const p = cropPresets[cropKey];
    if (p) {
      setExpectedYieldQtl(p.yield);
      setSellingPriceQtl(p.price);
      setSeedCost(p.seed);
      setFertilizerCost(p.fertilizer);
      setLabourCost(p.labour);
      setIrrigationCost(p.irrigation);
      setMachineryCost(p.machinery);
      setOtherExpenses(p.other);
    }
  };

  // Dynamic Financial Calculations
  const costPerAcre =
    seedCost + fertilizerCost + labourCost + irrigationCost + machineryCost + otherExpenses;
  const totalCost = costPerAcre * farmAreaAcres;
  const grossRevenue = farmAreaAcres * expectedYieldQtl * sellingPriceQtl;
  const netProfit = grossRevenue - totalCost;
  const profitMarginPercent = grossRevenue > 0 ? Math.round((netProfit / grossRevenue) * 100) : 0;
  const breakEvenYieldQtl = sellingPriceQtl > 0 ? (costPerAcre / sellingPriceQtl).toFixed(1) : 0;

  // Comparison Chart Data across crops for 5 acres
  const comparisonChartData = [
    { crop: "Wheat", revenue: 267750, expenses: 107500, profit: 160250 },
    { crop: "Mustard", revenue: 245650, expenses: 71000, profit: 174650 },
    { crop: "Chickpea", revenue: 277950, expenses: 78000, profit: 199950 },
    { crop: "Paddy", revenue: 353800, expenses: 127500, profit: 226300 },
  ];

  return (
    <section id="profit-risk" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Agricultural Financial Econometrics</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Crop Profit & Risk Analysis
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Real-time interactive sensitivity simulator: Dynamic gross margin, break-even yields, and cultivation cost breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {Object.keys(cropPresets).map((cKey) => (
              <button
                key={cKey}
                onClick={() => handleSelectPreset(cKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
                  selectedCrop === cKey
                    ? "bg-[#15803D] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                }`}
              >
                {cKey}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Financial Highlight KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750">
            <span className="text-xs font-medium text-slate-500">Gross Estimated Revenue</span>
            <div className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              ₹{grossRevenue.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-400">
              {farmAreaAcres} Acres × {expectedYieldQtl} Qtl @ ₹{sellingPriceQtl}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750">
            <span className="text-xs font-medium text-slate-500">Total Cultivation Cost</span>
            <div className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              ₹{totalCost.toLocaleString("en-IN")}
            </div>
            <span className="text-[11px] text-slate-400">
              ₹{costPerAcre.toLocaleString("en-IN")} per acre
            </span>
          </div>

          <div className="p-4 rounded-xl bg-green-50/70 dark:bg-emerald-950/40 border border-green-200/80 dark:border-emerald-800">
            <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Net Expected Profit</span>
            <div className="text-xl sm:text-2xl font-bold font-heading text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              ₹{netProfit.toLocaleString("en-IN")}
              <ArrowUpRight className="w-4 h-4 shrink-0" />
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
              ₹{Math.round(netProfit / farmAreaAcres).toLocaleString("en-IN")} profit / acre
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-750">
            <span className="text-xs font-medium text-slate-500">Profit Margin & Break-Even</span>
            <div className="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              {profitMarginPercent}%
            </div>
            <span className="text-[11px] text-slate-400">
              Break-even yield: <strong>{breakEvenYieldQtl} Qtl/Acre</strong>
            </span>
          </div>
        </div>

        {/* Dynamic Calculator & Cross-Crop Comparison Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Interactive Calculator Inputs (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/40 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#15803D]" />
                <span>Input Parameters & Expense Drivers</span>
              </h3>
              <span className="text-[11px] text-slate-400">Instant Real-Time Math</span>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-4 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Farm Area (Acres)
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={farmAreaAcres}
                  onChange={(e) => setFarmAreaAcres(Math.max(0.1, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Expected Yield (Qtl/Acre)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={expectedYieldQtl}
                  onChange={(e) => setExpectedYieldQtl(Math.max(1, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">
                  Selling Price (₹/Qtl)
                </label>
                <input
                  type="number"
                  min="500"
                  step="50"
                  value={sellingPriceQtl}
                  onChange={(e) => setSellingPriceQtl(Math.max(100, Number(e.target.value)))}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Cost Breakdown Inputs (2 columns) */}
            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-700">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                Expense Breakdown per Acre:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Seeds & Nursery (₹)</label>
                  <input
                    type="number"
                    value={seedCost}
                    onChange={(e) => setSeedCost(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Fertilizer & DAP (₹)</label>
                  <input
                    type="number"
                    value={fertilizerCost}
                    onChange={(e) => setFertilizerCost(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Farm Labour (₹)</label>
                  <input
                    type="number"
                    value={labourCost}
                    onChange={(e) => setLabourCost(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Irrigation / Diesel (₹)</label>
                  <input
                    type="number"
                    value={irrigationCost}
                    onChange={(e) => setIrrigationCost(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Tractor & Harvester (₹)</label>
                  <input
                    type="number"
                    value={machineryCost}
                    onChange={(e) => setMachineryCost(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Weedicide / Misc (₹)</label>
                  <input
                    type="number"
                    value={otherExpenses}
                    onChange={(e) => setOtherExpenses(Number(e.target.value))}
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cross Crop Comparative Financial BarChart (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-850 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-750 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white">
                  Crop Net Profit Benchmark (5 Acres)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Comparative revenue versus total cultivation expenses
              </p>

              <div className="h-[210px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="crop" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748B", fontSize: 10 }}
                      tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderColor: "#334155",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "12px",
                      }}
                      formatter={(value) => [`₹${value.toLocaleString("en-IN")}`, ""]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }} />
                    <Bar dataKey="expenses" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expenses" />
                    <Bar dataKey="profit" fill="#16A34A" radius={[4, 4, 0, 0]} name="Net Profit" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Risk Indicator Badge */}
            <div className="p-3 mt-3 rounded-xl bg-green-50 dark:bg-emerald-950/40 border border-green-200/80 dark:border-emerald-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Risk Level: Low Volatility
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                MSP Assured
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfitRiskSection;

