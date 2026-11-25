import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  Droplets,
  PieChart,
  Layers,
  Sparkles,
} from "lucide-react";

export function FarmOperationsTelemetrySection({ onOpenTasksModal, onOpenFarmFields }) {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "1st Urea Top-Dress Split",
      crop: "Wheat (Sector Plot A)",
      due: "Tomorrow, 8:00 AM",
      priority: "High",
      completed: false,
    },
    {
      id: 2,
      title: "Drip Irrigation & Soil Moisture Audit",
      crop: "Mustard (Parcel B)",
      due: "In 2 days",
      priority: "Normal",
      completed: false,
    },
    {
      id: 3,
      title: "Preventive Bio-Fungicide Spray",
      crop: "Wheat & Mustard",
      due: "In 4 days",
      priority: "Normal",
      completed: false,
    },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const cropsDistribution = [
    { name: "Wheat (HD-2967)", percent: 36, acres: "2.0 Acres", color: "#15803D" },
    { name: "Paddy (Basmati)", percent: 26, acres: "1.4 Acres", color: "#22C55E" },
    { name: "Mustard (Pusa Bold)", percent: 20, acres: "1.1 Acres", color: "#F59E0B" },
    { name: "Cotton (Bt Hybrid)", percent: 10, acres: "0.55 Acres", color: "#0EA5E9" },
    { name: "Fallow / Rotation", percent: 8, acres: "0.45 Acres", color: "#94A3B8" },
  ];

  return (
    <section id="farm-operations" className="w-full scroll-mt-24 space-y-4">
      {/* 3-Column Grid matching original Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[18px]">
        {/* ================= CARD 1: UPCOMING FARM TASKS ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                    Farm Operations &amp; Tasks
                  </h3>
                  <p className="text-[11px] text-slate-400">Scheduled agronomy actions</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 text-[10px] font-bold">
                {tasks.filter((t) => !t.completed).length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                    task.completed
                      ? "bg-slate-50 dark:bg-slate-850/60 border-slate-200/60 opacity-60"
                      : "bg-white dark:bg-slate-850 border-slate-200/80 dark:border-slate-800 hover:border-emerald-400"
                  }`}
                >
                  <button className="mt-0.5 text-slate-400 hover:text-[#15803D] transition-colors">
                    <CheckCircle2
                      className={`w-4 h-4 ${
                        task.completed ? "text-[#15803D] fill-green-100" : ""
                      }`}
                    />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-xs font-bold text-slate-800 dark:text-white truncate ${
                        task.completed ? "line-through text-slate-400" : ""
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11px] text-slate-400">{task.crop}</div>
                    <div className="flex items-center gap-1.5 mt-1 text-[10px] text-slate-500 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{task.due}</span>
                      {task.priority === "High" && (
                        <span className="ml-auto px-1.5 py-0.2 rounded-sm bg-rose-50 text-rose-600 font-bold text-[9px]">
                          High
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                const title = prompt("Enter new farm task title:");
                if (title) {
                  setTasks((prev) => [
                    ...prev,
                    {
                      id: Date.now(),
                      title,
                      crop: "Main Farm Parcel",
                      due: "Next Week",
                      priority: "Normal",
                      completed: false,
                    },
                  ]);
                }
              }}
              className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Farm Task</span>
            </button>
            {onOpenTasksModal && (
              <button
                onClick={onOpenTasksModal}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-medium"
              >
                Task Calendar →
              </button>
            )}
          </div>
        </div>

        {/* ================= CARD 2: SOIL MOISTURE TREND CURVE ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-sky-950/60 text-[#0EA5E9] flex items-center justify-center">
                  <Droplets className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                    Soil Moisture Dynamics
                  </h3>
                  <p className="text-[11px] text-slate-400">Volumetric Water Content (% VWC)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-sky-950/60 text-[#0EA5E9] text-[10px] font-bold">
                Optimal (Field Capacity)
              </span>
            </div>

            {/* Precision SVG Curved Spline Chart */}
            <div className="relative h-44 w-full my-2">
              {/* Y-axis grid */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono pointer-events-none text-slate-400 dark:text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">100%</span>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">75%</span>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">50%</span>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">25%</span>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">0%</span>
                  <div className="flex-1 border-b border-slate-100 dark:border-slate-800" />
                </div>
              </div>

              {/* Chart SVG */}
              <svg
                className="absolute inset-0 w-full h-full pl-8 pr-2"
                viewBox="0 0 320 150"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="moistureGradientSaaS" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#15803D" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#15803D" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                  d="M 15 50 C 45 60, 65 85, 95 92 C 120 95, 140 98, 165 95 L 165 145 L 15 145 Z"
                  fill="url(#moistureGradientSaaS)"
                />

                {/* Solid Line (Actual) */}
                <path
                  d="M 15 50 C 45 60, 65 85, 95 92 C 120 95, 140 98, 165 95"
                  fill="none"
                  stroke="#15803D"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <circle cx="15" cy="50" r="3.5" fill="#15803D" />
                <circle cx="65" cy="85" r="3.5" fill="#15803D" />
                <circle cx="115" cy="95" r="3.5" fill="#15803D" />
                <circle
                  cx="165"
                  cy="95"
                  r="5"
                  fill="#ffffff"
                  stroke="#15803D"
                  strokeWidth="3"
                />

                {/* Dashed Line (Forecast) */}
                <path
                  d="M 165 95 C 195 92, 230 75, 265 60 C 285 52, 305 48, 315 45"
                  fill="none"
                  stroke="#22C55E"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                <circle cx="240" cy="70" r="3" fill="#22C55E" />
                <circle cx="315" cy="45" r="3" fill="#22C55E" />
              </svg>

              {/* Floating Pill Callout */}
              <div className="absolute top-[70px] left-[52%] -translate-x-1/2 px-2 py-0.5 rounded-full border border-emerald-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-[11px] shadow-sm">
                52% VWC
              </div>
            </div>

            {/* X-axis date labels */}
            <div className="flex justify-between pl-8 pr-2 text-[10px] font-medium text-slate-400">
              <span>Day 1</span>
              <span>Day 3</span>
              <span className="font-bold text-[#15803D]">Today (52%)</span>
              <span>+3 Days</span>
              <span>+7 Days</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 font-semibold text-[#15803D]">
              <span className="w-3 h-0.5 bg-[#15803D]" />
              <span>Actual Probe</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <span className="w-3 h-0.5 border-t border-dashed border-[#22C55E]" />
              <span>Satellite Forecast</span>
            </div>
          </div>
        </div>

        {/* ================= CARD 3: CROP DISTRIBUTION DONUT ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                    Crop Land Allocation
                  </h3>
                  <p className="text-[11px] text-slate-400">Planted acreage distribution</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                5.5 Acres Total
              </span>
            </div>

            {/* Donut graphic representation */}
            <div className="flex items-center gap-4 my-2">
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="3.2"
                  />
                  {/* Wheat: 36% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#15803D"
                    strokeWidth="3.4"
                    strokeDasharray="36 64"
                    strokeDashoffset="0"
                  />
                  {/* Paddy: 26% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#22C55E"
                    strokeWidth="3.4"
                    strokeDasharray="26 74"
                    strokeDashoffset="-36"
                  />
                  {/* Mustard: 20% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="3.4"
                    strokeDasharray="20 80"
                    strokeDashoffset="-62"
                  />
                  {/* Cotton: 10% */}
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="transparent"
                    stroke="#0EA5E9"
                    strokeWidth="3.4"
                    strokeDasharray="10 90"
                    strokeDashoffset="-82"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-base font-extrabold font-heading text-slate-900 dark:text-white">
                    4
                  </span>
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
                    Crops
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="flex-1 space-y-1.5 text-xs">
                {cropsDistribution.map((crop) => (
                  <div key={crop.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: crop.color }}
                      />
                      <span className="text-slate-700 dark:text-slate-300 font-medium truncate text-[11px]">
                        {crop.name.split(" ")[0]}
                      </span>
                    </div>
                    <span className="font-bold font-mono text-slate-900 dark:text-white text-[11px]">
                      {crop.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">4 Active Cultivations</span>
            {onOpenFarmFields && (
              <button
                onClick={onOpenFarmFields}
                className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Manage Land Parcels</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FarmOperationsTelemetrySection;

