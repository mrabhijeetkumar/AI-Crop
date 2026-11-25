// src/components/sections/FarmOverviewKPISection.jsx
import React from "react";
import { Tractor, Sprout, HeartPulse, IndianRupee, Plus } from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { cleanCropName, farmEconomics, formatINRCompact } from "../../utils/agronomy.js";

const TONES = {
  neutral: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  green: "bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-900/60",
  amber: "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/60",
  rose: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
};

function KpiCard({ icon: Icon, tone = "neutral", label, value, chip, sub, onClick }) {
  const clickable = Boolean(onClick);
  return (
    <div
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => clickable && (e.key === "Enter" || e.key === " ") && onClick()}
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 min-h-[124px] h-full shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-150 flex items-center group ${clickable ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-4 min-w-0 w-full">
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 border ${TONES[tone] || TONES.neutral}`}>
          <Icon className="w-5 h-5 stroke-[2]" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">{label}</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold font-heading tabular-nums text-slate-900 dark:text-white leading-none tracking-tight">
              {value}
            </span>
            {chip && (
              <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200/70">
                {chip}
              </span>
            )}
          </div>
          <span className="text-[11.5px] font-normal text-slate-400 dark:text-slate-500 mt-1 block truncate">{sub}</span>
        </div>
      </div>
    </div>
  );
}

export function FarmOverviewKPISection({ onOpenFieldModal }) {
  const { farmProfile = {}, fields = [], openQuickAction } = useFarm();

  const mappedArea = fields.reduce((t, f) => t + (Number(f.areaAcres) || 0), 0);
  const totalArea = Number(farmProfile.totalAreaAcres) || mappedArea || 0;

  const cropNames = [...new Set(fields.map((f) => cleanCropName(f.currentCrop)).filter(Boolean))];
  const eco = farmEconomics(fields);

  const total = fields.length;
  const healthy = fields.filter((f) => ["Excellent", "Good"].includes(f.healthStatus)).length;
  const healthPct = total ? Math.round((healthy / total) * 100) : null;
  const avgNdvi = total ? (fields.reduce((s, f) => s + (Number(f.ndviIndex) || 0), 0) / total).toFixed(2) : null;

  // Semantic health status tone: only use status colors for actual conditions
  const healthTone =
    healthPct === null
      ? "neutral"
      : healthPct >= 80
      ? "green"
      : healthPct >= 60
      ? "amber"
      : "rose";

  return (
    <section id="farm-overview" className="w-full scroll-mt-24">
      {total === 0 && (
        <div className="mb-4 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs sm:text-sm text-emerald-900 dark:text-emerald-200">
            <strong>No plots mapped yet.</strong> Add your first field to populate real yield projections, soil data, and health insights.
          </p>
          <button
            onClick={() => openQuickAction?.("field")}
            className="h-8 px-3.5 rounded-lg bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add first field
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KpiCard
          icon={Tractor}
          tone="green"
          label="Total Farm Area"
          value={`${totalArea.toLocaleString("en-IN", { maximumFractionDigits: 1 })} Acres`}
          chip={total ? `${total} plot${total > 1 ? "s" : ""}` : undefined}
          sub="Registered land"
          onClick={onOpenFieldModal}
        />
        <KpiCard
          icon={Sprout}
          tone="neutral"
          label="Active Crops"
          value={`${cropNames.length} ${cropNames.length === 1 ? "Crop" : "Crops"}`}
          sub={cropNames.length ? cropNames.slice(0, 2).join(", ") + (cropNames.length > 2 ? ` +${cropNames.length - 2}` : "") : "No crop sown yet"}
          onClick={onOpenFieldModal}
        />
        <KpiCard
          icon={IndianRupee}
          tone="green"
          label="Expected Profit"
          value={total ? formatINRCompact(eco.profit) : "—"}
          chip={total ? "Estimate" : undefined}
          sub={total ? "This season (planning estimate)" : "Add a field to estimate"}
        />
        <KpiCard
          icon={HeartPulse}
          tone={healthTone}
          label="Crop Health"
          value={healthPct !== null ? `${healthPct}%` : "—"}
          chip={avgNdvi ? `NDVI ${avgNdvi}` : undefined}
          sub={healthPct === null ? "No data yet" : healthPct >= 80 ? "Optimal vigor" : healthPct >= 60 ? "Some plots need care" : "Needs attention"}
          onClick={onOpenFieldModal}
        />
      </div>
    </section>
  );
}

export default FarmOverviewKPISection;