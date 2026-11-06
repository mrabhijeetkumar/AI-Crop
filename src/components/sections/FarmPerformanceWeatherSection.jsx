import React, { useState } from "react";
import {
  BarChart3,
  Sun,
  Droplets,
  Wind,
  Umbrella,
  Sprout,
  ArrowRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export function FarmPerformanceWeatherSection({ onOpenFinancialDetails, onOpenWeatherDetails }) {
  const [filterPeriod, setFilterPeriod] = useState("7 Days");

  // Multi-timeframe line chart data matching screenshot curve & values (0k to 150k)
  const chartDataMap = {
    "7 Days": [
      { day: "Mon", revenue: 65, expenses: 40, profit: 20 },
      { day: "Tue", revenue: 85, expenses: 55, profit: 30 },
      { day: "Wed", revenue: 105, expenses: 70, profit: 42 },
      { day: "Thu", revenue: 135, expenses: 95, profit: 54 },
      { day: "Fri", revenue: 130, expenses: 90, profit: 52 },
      { day: "Sat", revenue: 135, expenses: 95, profit: 56 },
      { day: "Sun", revenue: 140, expenses: 100, profit: 60 },
    ],
    "30 Days": [
      { day: "W1", revenue: 70, expenses: 45, profit: 25 },
      { day: "W2", revenue: 95, expenses: 60, profit: 35 },
      { day: "W3", revenue: 120, expenses: 80, profit: 48 },
      { day: "W4", revenue: 145, expenses: 98, profit: 62 },
    ],
    "6 Months": [
      { day: "Jun", revenue: 60, expenses: 38, profit: 22 },
      { day: "Jul", revenue: 80, expenses: 50, profit: 30 },
      { day: "Aug", revenue: 110, expenses: 75, profit: 45 },
      { day: "Sep", revenue: 125, expenses: 85, profit: 50 },
      { day: "Oct", revenue: 138, expenses: 92, profit: 58 },
      { day: "Nov", revenue: 148, expenses: 105, profit: 65 },
    ],
    "1 Year": [
      { day: "Q1", revenue: 75, expenses: 45, profit: 30 },
      { day: "Q2", revenue: 100, expenses: 65, profit: 42 },
      { day: "Q3", revenue: 125, expenses: 85, profit: 52 },
      { day: "Q4", revenue: 150, expenses: 105, profit: 68 },
    ],
  };

  const currentChartData = chartDataMap[filterPeriod] || chartDataMap["7 Days"];

  return (
    <section id="performance-weather" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* ================= LEFT: FARM PERFORMANCE (7 COLS / 60%) ================= */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                  <BarChart3 className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Farm Performance
                </h3>
              </div>
              <button
                onClick={() => {
                  if (onOpenFinancialDetails) onOpenFinancialDetails();
                  else {
                    const el = document.getElementById("profit-risk");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Filter Pills & Legend */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-medium">
                {["7 Days", "30 Days", "6 Months", "1 Year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setFilterPeriod(period)}
                    className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer text-xs ${
                      filterPeriod === period
                        ? "bg-[#15803D] text-white font-semibold shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Legend with distinct color dots */}
              <div className="flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                  <span>Revenue</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
                  <span>Expenses</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                  <span>Profit</span>
                </div>
              </div>
            </div>

            {/* Recharts Line Chart with generous 220px height */}
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis
                    domain={[0, 150]}
                    ticks={[0, 50, 100, 150]}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }}
                    tickFormatter={(v) => `${v}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                    }}
                    formatter={(val) => [`₹${val},000`, ""]}
                  />
                  {/* Revenue Line (Amber/Orange) */}
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#F59E0B"
                    strokeWidth={2.4}
                    dot={{ r: 4, fill: "#F59E0B", strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    name="Revenue"
                  />
                  {/* Expenses Line (Light Green) */}
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="#22C55E"
                    strokeWidth={2.4}
                    dot={{ r: 4, fill: "#22C55E", strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                    name="Expenses"
                  />
                  {/* Profit Line (Forest Green) */}
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="#15803D"
                    strokeWidth={2.8}
                    dot={{ r: 4.5, fill: "#15803D", strokeWidth: 1 }}
                    activeDot={{ r: 6.5 }}
                    name="Profit"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: WEATHER TODAY (5 COLS / 40%) ================= */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-900/60 shadow-2xs">
                  <Sun className="w-5 h-5 fill-amber-500/20" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Weather Today
                </h3>
              </div>
              {onOpenWeatherDetails && (
                <button
                  onClick={onOpenWeatherDetails}
                  className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Forecast</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Temperature & Landscape Photo Banner */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-4xl sm:text-[44px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                  28°C
                </div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Sunny • Optimal Conditions</span>
                </div>
              </div>

              {/* Landscape photo thumbnail */}
              <div className="w-28 h-18 rounded-xl overflow-hidden shadow-xs border border-slate-200/80 shrink-0">
                <img
                  src="/images/dashboard_bg.jpg"
                  alt="Sunny Farm Field"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 3 Metrics: Humidity, Wind, Rain */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-500 flex items-center justify-center shrink-0">
                  <Droplets className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">65%</div>
                  <div className="text-[11px] text-slate-400">Humidity</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">12 km/h</div>
                  <div className="text-[11px] text-slate-400">Wind</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center shrink-0">
                  <Umbrella className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">10%</div>
                  <div className="text-[11px] text-slate-400">Rain</div>
                </div>
              </div>
            </div>

            {/* Farming Advisory Note */}
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-2.5">
              <Sprout className="w-4 h-4 text-[#15803D] dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <div className="font-bold text-slate-900 dark:text-white mb-0.5">
                  Farming Advisory
                </div>
                <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                  Weather is good for crop monitoring and light irrigation. Soil moisture is within safe vegetative threshold.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FarmPerformanceWeatherSection;
