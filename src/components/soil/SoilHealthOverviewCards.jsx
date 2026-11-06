import React from "react";
import {
  Activity,
  Award,
  FlaskConical,
  Sparkles,
  Droplets,
  Zap,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Save,
} from "lucide-react";

export function SoilHealthOverviewCards({
  soilN,
  soilP,
  soilK,
  soilPH,
  organicCarbon,
  ec = 0.65,
  soilHealthScore,
  currentField,
  onSaveToField,
  onOpenHealthCard,
  isSaving,
  saveSuccess,
}) {
  // Score interpretation
  const getScoreGrade = (score) => {
    if (score >= 85) return { grade: "Grade A", label: "Prime High Fertility", color: "text-[var(--success)]", bg: "bg-emerald-500/10 border-emerald-500/30" };
    if (score >= 70) return { grade: "Grade B", label: "Good Moderate Fertility", color: "text-teal-500", bg: "bg-teal-500/10 border-teal-500/30" };
    if (score >= 50) return { grade: "Grade C", label: "Moderate Deficit / Stressed", color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/30" };
    return { grade: "Grade D", label: "Critical Depleted Soil", color: "text-red-500", bg: "bg-red-500/10 border-red-500/30" };
  };

  const gradeInfo = getScoreGrade(soilHealthScore);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Master Soil Health Index Gauge Card (5 cols on lg) */}
      <div className="lg:col-span-5 app-card p-5 lg:p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-xs">
              <Activity className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                Soil Health Index (SHI)
              </h3>
              <span className="text-[10px] text-[var(--text-muted)]">
                Composite Chemical &amp; Physical Score
              </span>
            </div>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${gradeInfo.bg} ${gradeInfo.color}`}>
            {gradeInfo.grade}
          </span>
        </div>

        {/* Circular Radial Score Display */}
        <div className="py-4 flex flex-col items-center justify-center text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* SVG Circular Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="currentColor"
                className="text-[var(--border)]"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#22c55e"
                className="transition-all duration-700 ease-out"
                strokeWidth="8"
                strokeDasharray={251.2}
                strokeDashoffset={251.2 - (251.2 * soilHealthScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
                {soilHealthScore}
              </span>
              <span className="text-[10px] font-semibold text-[var(--text-muted)] -mt-1">
                OUT OF 100
              </span>
            </div>
          </div>

          <span className="text-xs font-bold text-[var(--primary)] mt-2 font-heading">
            {gradeInfo.label}
          </span>
          <p className="text-[11px] text-[var(--text-secondary)] max-w-xs mt-1 leading-relaxed">
            Composite rating based on Available N, P, K, Reaction pH ({soilPH.toFixed(1)}), and Organic Carbon ({organicCarbon.toFixed(2)}%).
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="pt-3 border-t border-[var(--border)] flex items-center gap-2">
          <button
            onClick={onSaveToField}
            disabled={isSaving}
            className="btn-primary flex-1 text-xs py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 font-semibold"
          >
            {saveSuccess ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Field Record Saved!</span>
              </>
            ) : isSaving ? (
              <>
                <Save className="w-3.5 h-3.5 animate-spin" />
                <span>Saving to Parcel...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Sync to Field Record</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenHealthCard}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer font-medium"
            title="Generate and Print Official Soil Health Card (SHC)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="hidden sm:inline">Health Card</span>
          </button>
        </div>
      </div>

      {/* 2. 4 Quick Diagnostic Parameter Cards (7 cols on lg) */}
      <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* pH Card */}
        <div className="app-card p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Soil Reaction (pH)
            </span>
            <span className="w-7 h-7 rounded-md bg-blue-500/10 text-[var(--info)] flex items-center justify-center font-bold text-xs font-heading">
              pH
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {soilPH.toFixed(1)}
            </span>
            <span className="text-xs font-semibold text-[var(--info)]">
              {soilPH >= 6.5 && soilPH <= 7.5 ? "Neutral / Ideal" : soilPH < 6.5 ? "Acidic" : "Alkaline"}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (soilPH / 10) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block">Ideal agronomic range: 6.5 - 7.5</span>
        </div>

        {/* Organic Carbon Card */}
        <div className="app-card p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Organic Carbon (OC)
            </span>
            <span className="w-7 h-7 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center font-bold text-xs font-heading">
              OC
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {organicCarbon.toFixed(2)}%
            </span>
            <span className="text-xs font-semibold text-[var(--success)]">
              {organicCarbon >= 0.75 ? "High Organic Matter" : organicCarbon >= 0.5 ? "Medium" : "Low Organic"}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] rounded-full transition-all"
              style={{ width: `${Math.min(100, (organicCarbon / 1.5) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block">Target threshold: &gt;0.75% for microbial vigor</span>
        </div>

        {/* Nitrogen (N) Card */}
        <div className="app-card p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Available Nitrogen (N)
            </span>
            <span className="w-7 h-7 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs font-heading">
              N
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {soilN}
            </span>
            <span className="text-xs font-semibold text-slate-400">kg/ha</span>
            <span className="text-xs font-semibold text-[var(--warning)] ml-auto">
              {soilN < 100 ? "Low Deficit" : soilN <= 150 ? "Medium Level" : "High Level"}
            </span>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (soilN / 200) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block">Recommended baseline: 120 - 150 kg/ha</span>
        </div>

        {/* Phosphorus & Potassium Combined */}
        <div className="app-card p-4 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Phosphorus (P) &amp; Potash (K)
            </span>
            <span className="w-7 h-7 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-xs font-heading">
              P/K
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] block">Available P:</span>
              <span className="text-base font-bold font-heading text-[var(--text-primary)]">{soilP} kg/ha</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[var(--text-muted)] block">Available K:</span>
              <span className="text-base font-bold font-heading text-[var(--text-primary)]">{soilK} kg/ha</span>
            </div>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, ((soilP + soilK) / 160) * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-[var(--text-muted)] block">Target: P &gt;45 kg/ha • K &gt;40 kg/ha</span>
        </div>
      </div>
    </div>
  );
}
