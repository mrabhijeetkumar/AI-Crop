import React from "react";
import {
  TrendingUp,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Briefcase,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export function MandiAndProfitRow({ onOpenProfitDetails, onOpenMarketDetails }) {
  // Mandi Table Data matching the screenshot
  const mandiRows = [
    {
      id: "wheat",
      crop: "Wheat",
      icon: "🌾",
      mandi: "Ludhiana",
      price: "₹2,425 / qtl",
      change: "+2.1%",
      isPositive: true,
    },
    {
      id: "mustard",
      crop: "Mustard",
      icon: "🌼",
      mandi: "Jaipur",
      price: "₹6,200 / qtl",
      change: "+1.5%",
      isPositive: true,
    },
    {
      id: "rice",
      crop: "Rice",
      icon: "🌾",
      mandi: "Karnal",
      price: "₹3,100 / qtl",
      change: "-0.5%",
      isPositive: false,
    },
  ];

  // Grouped Bar Chart Data matching the screenshot (Jan, Feb, Mar, Apr)
  const financialBarData = [
    { month: "Jan", revenue: 95, expenses: 40, profit: 55 },
    { month: "Feb", revenue: 110, expenses: 50, profit: 60 },
    { month: "Mar", revenue: 115, expenses: 52, profit: 63 },
    { month: "Apr", revenue: 140, expenses: 65, profit: 75 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
      {/* ================= LEFT: TODAY'S MANDI PRICES ================= */}
      <div id="mandi-prices" className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between scroll-mt-24">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Today's Mandi Prices
              </h3>
            </div>
            <button
              onClick={() => {
                if (onOpenMarketDetails) onOpenMarketDetails();
                else {
                  const el = document.getElementById("mandi-prices");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content: Left Jute Sacks Photo + Right Table */}
          <div className="flex items-center gap-5">
            {/* Jute Sacks of Grain Photo */}
            <div className="w-28 sm:w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xs shrink-0">
              <img
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
                alt="Harvested Grain Jute Sacks in Mandi"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Clean Mandi Table */}
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold text-[11px]">
                    <th className="pb-2.5">Crop</th>
                    <th className="pb-2.5">Mandi</th>
                    <th className="pb-2.5">Modal Price</th>
                    <th className="pb-2.5 text-right">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 dark:divide-slate-800/90">
                  {mandiRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{row.icon}</span>
                        <span>{row.crop}</span>
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.mandi}</td>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200">{row.price}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            row.isPositive
                              ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/50"
                              : "text-rose-700 bg-rose-50 dark:bg-rose-950/70 border border-rose-200/50"
                          }`}
                        >
                          {row.isPositive ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>{row.change}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT: PROFIT & RISK ANALYSIS ================= */}
      <div id="profit-risk" className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between scroll-mt-24">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                Profit &amp; Risk Analysis
              </h3>
            </div>
            <button
              onClick={() => {
                if (onOpenProfitDetails) onOpenProfitDetails();
              }}
              className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Content: Left 3 Metrics + Right Grouped Bar Chart */}
          <div className="grid grid-cols-12 gap-4 items-center">
            {/* Left 3 Metrics */}
            <div className="col-span-5 space-y-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Estimated Revenue</div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">₹1,50,000</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Total Investment</div>
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">₹65,000</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100/80 dark:bg-emerald-900/60 text-[#15803D] flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-400">Expected Profit</div>
                  <div className="font-extrabold text-sm sm:text-base text-[#15803D] dark:text-emerald-400">₹85,000</div>
                </div>
              </div>
            </div>

            {/* Right Grouped Bar Chart */}
            <div className="col-span-7">
              {/* Legend matching screenshot: ● Revenue ● Expenses ● Profit */}
              <div className="flex items-center justify-end gap-3 text-[10.5px] font-semibold text-slate-500 mb-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#86EFAC]" />
                  <span>Revenue</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Expenses</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                  <span>Profit</span>
                </span>
              </div>

              <div className="h-[135px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financialBarData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 500 }} />
                    <YAxis
                      domain={[0, 150]}
                      ticks={[0, 25, 50, 75, 100]}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: "#64748B", fontSize: 9 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderRadius: "10px",
                        color: "#fff",
                        fontSize: "11px",
                        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.2)",
                      }}
                      formatter={(val) => [`₹${val},000`, ""]}
                    />
                    <Bar dataKey="revenue" fill="#86EFAC" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="expenses" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="profit" fill="#15803D" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MandiAndProfitRow;

