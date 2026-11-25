// src/components/sections/FarmPerformanceWeatherSection.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart3, Sun, CloudSun, Cloud, CloudRain, CloudLightning, Droplets, Wind, Umbrella, Sprout, ArrowRight, RefreshCw,
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { useFarm } from "../../context/FarmContext.jsx";
import { farmEconomics, formatINR, formatINRCompact } from "../../utils/agronomy.js";

const PERIODS = ["7 Days", "30 Days", "6 Months", "1 Year"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function periodLabels(period) {
  const now = new Date();
  if (period === "7 Days") return Array.from({ length: 7 }, (_, i) => DAYS[new Date(now.getTime() - (6 - i) * 864e5).getDay()]);
  if (period === "30 Days") return ["W1", "W2", "W3", "W4"];
  if (period === "6 Months") return Array.from({ length: 6 }, (_, i) => MONTHS[(now.getMonth() - 5 + i + 12) % 12]);
  return ["Q1", "Q2", "Q3", "Q4"];
}

const WEATHER_ICONS = { sun: Sun, "cloud-sun": CloudSun, cloud: Cloud, rain: CloudRain, thunder: CloudLightning };

export function FarmPerformanceWeatherSection({ onOpenFinancialDetails, onOpenWeatherDetails }) {
  const { farmProfile = {}, fields = [] } = useFarm();
  const [period, setPeriod] = useState("7 Days");
  const [wx, setWx] = useState(null);
  const [wxState, setWxState] = useState("loading"); // loading | ok | error

  /* ---------- live weather (backend geocodes the farm location) ---------- */
  const location = farmProfile.location || farmProfile.district || "Ludhiana, Punjab";
  useEffect(() => {
    const ctrl = new AbortController();
    setWxState("loading");
    fetch(`/api/weather?location=${encodeURIComponent(location)}`, { signal: ctrl.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("weather"))))
      .then((d) => { setWx(d); setWxState("ok"); })
      .catch((e) => { if (e.name !== "AbortError") setWxState("error"); });
    return () => ctrl.abort();
  }, [location]);

  /* ---------- projected performance from real field data ---------- */
  const eco = useMemo(() => farmEconomics(fields), [fields]);
  const data = useMemo(() => {
    const labels = periodLabels(period);
    const n = labels.length;
    return labels.map((day, i) => {
      const t = (i + 1) / n;
      const f = t * t * (3 - 2 * t) * 0.85 + t * 0.15; // smooth ramp 0 → 1
      return {
        day,
        revenue: Math.round(eco.revenue * f),
        expenses: Math.round(eco.investment * f),
        profit: Math.round(eco.profit * f),
      };
    });
  }, [period, eco]);

  const Icon = WEATHER_ICONS[wx?.iconType] || Sun;
  const stats = [
    { label: "Revenue", value: eco.revenue, color: "#F59E0B" },
    { label: "Expenses", value: eco.investment, color: "#22C55E" },
    { label: "Profit", value: eco.profit, color: "#15803D" },
  ];

  return (
    <section id="performance-weather" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch">
        {/* ===== Farm performance ===== */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
                <BarChart3 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white leading-tight">Farm Performance</h3>
                <p className="text-[11px] text-slate-400">
                  Projected season economics {eco.sample && "· sample (add a field for your numbers)"}
                </p>
              </div>
            </div>
            <button onClick={onOpenFinancialDetails} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
              <span>View Details</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="w-2 h-2 rounded-full" style={{ background: s.color }} /> {s.label}
                </div>
                <div className="text-sm sm:text-base font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">{formatINRCompact(s.value)}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg border border-slate-200/70 dark:border-slate-700/70 text-xs font-medium w-fit mb-4" role="tablist">
            {PERIODS.map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={period === p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  period === p
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white font-semibold shadow-2xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <div className="h-[220px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.5} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11, fontWeight: 500 }} />
                <YAxis width={58} tickLine={false} axisLine={false} tick={{ fill: "#64748B", fontSize: 11 }} tickFormatter={formatINRCompact} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "1px solid #334155", borderRadius: 12, color: "#fff", fontSize: 12 }}
                  formatter={(v, name) => [formatINR(v), name]}
                />
                <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#F59E0B" strokeWidth={2.4} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#22C55E" strokeWidth={2.4} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Profit" stroke="#15803D" strokeWidth={2.8} dot={{ r: 3.5 }} activeDot={{ r: 6.5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ===== Weather ===== */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 shadow-2xs hover:shadow-xs transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-500 flex items-center justify-center border border-amber-100 dark:border-amber-900/60">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white leading-tight">Weather Today</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{wx?.locationName || location}</p>
              </div>
            </div>
            <button onClick={onOpenWeatherDetails} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
              <span>Forecast</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {wxState === "loading" && (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-400 gap-2 min-h-[220px]">
              <RefreshCw className="w-4 h-4 animate-spin" /> Live weather load ho raha hai…
            </div>
          )}
          {wxState === "error" && (
            <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 min-h-[220px]">
              Weather abhi available nahi hai. Thodi der baad dobara try karein.
            </div>
          )}
          {wxState === "ok" && wx && (
            <>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <div className="text-4xl sm:text-[44px] font-extrabold font-heading text-slate-900 dark:text-white leading-none tracking-tight">
                    {wx.currentTemp}°C
                  </div>
                  <div className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1.5 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> <span>{wx.condition}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Feels like {wx.feelsLike}°C</div>
                </div>
                <div className="w-28 h-[72px] rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700 shrink-0 bg-gradient-to-br from-sky-100 to-emerald-100 dark:from-slate-800 dark:to-emerald-950">
                  <img src="/images/dashboard_bg.jpg" alt="" onError={(e) => (e.currentTarget.style.display = "none")} className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 text-xs">
                {[
                  { i: Droplets, c: "bg-blue-50 dark:bg-blue-950/60 text-blue-500", v: `${wx.humidity}%`, l: "Humidity" },
                  { i: Wind, c: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300", v: `${wx.windSpeed} km/h`, l: "Wind" },
                  { i: Umbrella, c: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500", v: `${wx.rainChance}%`, l: "Rain" },
                ].map(({ i: I, c, v, l }) => (
                  <div key={l} className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c}`}><I className="w-4 h-4" /></div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">{v}</div>
                      <div className="text-[11px] text-slate-400">{l}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-2.5">
                <Sprout className="w-4 h-4 text-[#15803D] dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-white mb-0.5">Farming Advisory</div>
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                    {wx.advisory?.actions?.[0] || wx.advisory?.title}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {wx.advisory?.sprayCondition && (
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 text-[10px] font-semibold">Spray: {wx.advisory.sprayCondition}</span>
                    )}
                    {wx.advisory?.irrigationAdvice && (
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900 text-[10px] font-semibold">Irrigation: {wx.advisory.irrigationAdvice}</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default FarmPerformanceWeatherSection;