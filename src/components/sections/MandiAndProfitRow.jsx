// src/components/sections/MandiAndProfitRow.jsx
import React, { useEffect, useMemo, useState } from "react";
import { TrendingUp, ArrowRight, ArrowUpRight, ArrowDownRight, FileText, Briefcase, Wallet } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { useFarm } from "../../context/FarmContext.jsx";
import { farmEconomics, formatINR, formatINRCompact } from "../../utils/agronomy.js";

const ICONS = { wheat: "🌾", mustard: "🌼", rice: "🌾", paddy: "🌾", maize: "🌽", cotton: "☁️", soybean: "🫘", potato: "🥔", onion: "🧅", tomato: "🍅" };
const iconFor = (name = "") => ICONS[Object.keys(ICONS).find((k) => name.toLowerCase().includes(k))] || "🌱";

const FALLBACK_ROWS = [
  { id: "wheat", crop: "Wheat", mandi: "Ludhiana", price: 2425, change: 2.1 },
  { id: "mustard", crop: "Mustard", mandi: "Jaipur", price: 6200, change: 1.5 },
  { id: "rice", crop: "Rice", mandi: "Karnal", price: 3100, change: -0.5 },
];

const STAGES = [
  { label: "Sowing", f: 0.2 },
  { label: "Growth", f: 0.45 },
  { label: "Maturity", f: 0.75 },
  { label: "Harvest", f: 1 },
];

export function MandiAndProfitRow({ onOpenProfitDetails, onOpenMarketDetails }) {
  const { farmProfile = {}, fields = [] } = useFarm();
  const [rows, setRows] = useState(FALLBACK_ROWS);
  const [live, setLive] = useState(false);

  const state = farmProfile.state || "Punjab";
  const district = farmProfile.district || (farmProfile.location || "").split(",")[0]?.trim() || "Ludhiana";

  /* ---------- live mandi prices ---------- */
  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/market?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("market"))))
      .then((list) => {
        if (!Array.isArray(list) || !list.length) return;
        const wanted = ["wheat", "mustard", "rice"];
        const picked = wanted.map((w) => list.find((x) => (x.rawCropName || x.crop || "").toLowerCase().includes(w))).filter(Boolean);
        const final = (picked.length >= 2 ? picked : list.slice(0, 3)).map((x, i) => ({
          id: `${x.rawCropName || x.crop}-${i}`,
          crop: x.rawCropName || String(x.crop).split("(")[0].trim(),
          mandi: x.district || district,
          price: Number(x.mandiPrice) || 0,
          change: Number(x.priceChange) || 0,
        }));
        setRows(final);
        setLive(true);
      })
      .catch(() => { });
    return () => ctrl.abort();
  }, [state, district]);

  /* ---------- profit & risk from real fields ---------- */
  const eco = useMemo(() => farmEconomics(fields), [fields]);
  const chartData = useMemo(
    () => STAGES.map(({ label, f }) => ({
      month: label,
      revenue: Math.round(eco.revenue * f),
      expenses: Math.round(eco.investment * Math.min(1, f + 0.15)),
      profit: Math.round(Math.max(0, eco.revenue * f - eco.investment * Math.min(1, f + 0.15))),
    })),
    [eco]
  );

  const metrics = [
    { icon: FileText, cls: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600", label: "Estimated Revenue", value: eco.revenue, strong: false },
    { icon: Briefcase, cls: "bg-amber-50 dark:bg-amber-950/60 text-amber-600", label: "Total Investment", value: eco.investment, strong: false },
    { icon: Wallet, cls: "bg-emerald-100/80 dark:bg-emerald-900/60 text-[#15803D]", label: "Expected Profit", value: eco.profit, strong: true },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
      {/* ===== Mandi prices ===== */}
      <div id="mandi-prices" className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col scroll-mt-24">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white leading-tight">Today's Mandi Prices</h3>
              <p className="text-[11px] text-slate-400">{live ? `${district}, ${state}` : "Sample rates · live feed unavailable"}</p>
            </div>
          </div>
          <button onClick={onOpenMarketDetails} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
            <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-5">
          <div className="w-28 sm:w-32 h-32 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 hidden sm:block bg-amber-50 dark:bg-slate-800">
            <img
              src="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80"
              alt="Harvested grain sacks in mandi"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/crop-wheat.jpg";
              }}
              className="w-full h-full object-cover"
            />
          </div>

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
                {rows.map((row) => {
                  const up = row.change >= 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">
                        <span className="mr-1.5">{iconFor(row.crop)}</span>{row.crop}
                      </td>
                      <td className="py-2.5 text-slate-500 dark:text-slate-400">{row.mandi}</td>
                      <td className="py-2.5 font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">₹{row.price.toLocaleString("en-IN")}/qtl</td>
                      <td className="py-2.5 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold border ${up ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/70 border-emerald-200/50" : "text-rose-700 bg-rose-50 dark:bg-rose-950/70 border-rose-200/50"
                          }`}>
                          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {Math.abs(row.change).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ===== Profit & risk ===== */}
      <div id="profit-risk" className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white leading-tight">Profit &amp; Risk Analysis</h3>
              <p className="text-[11px] text-slate-400">{eco.sample ? "Sample · add a field for your numbers" : "Based on your mapped fields"}</p>
            </div>
          </div>
          <button onClick={onOpenProfitDetails} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
            <span>View Details</span> <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5 space-y-3 text-xs">
            {metrics.map(({ icon: Icon, cls, label, value, strong }) => (
              <div key={label} className="flex items-start gap-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${cls}`}><Icon className="w-3.5 h-3.5" /></div>
                <div>
                  <div className="text-[11px] text-slate-400">{label}</div>
                  <div className={`font-extrabold text-sm sm:text-base ${strong ? "text-[#15803D] dark:text-emerald-400" : "text-slate-900 dark:text-white"}`}>
                    {formatINRCompact(value)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="col-span-7">
            <div className="flex items-center justify-end gap-3 text-[10.5px] font-semibold text-slate-500 mb-2">
              {[["#86EFAC", "Revenue"], ["#F59E0B", "Expenses"], ["#15803D", "Profit"]].map(([c, l]) => (
                <span key={l} className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: c }} /> {l}</span>
              ))}
            </div>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 10, fontWeight: 500 }} />
                  <YAxis width={46} tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 9 }} tickFormatter={formatINRCompact} />
                  <Tooltip
                    cursor={{ fill: "rgba(148,163,184,.12)" }}
                    contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: 10, color: "#fff", fontSize: 11 }}
                    formatter={(v, n) => [formatINR(v), n]}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#86EFAC" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#F59E0B" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#15803D" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-auto pt-3">Estimates use typical per-acre costs &amp; returns; actual profit depends on yield and mandi price.</p>
      </div>
    </div>
  );
}

export default MandiAndProfitRow;