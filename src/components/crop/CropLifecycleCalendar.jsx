import React, { useState } from "react";
import {
  Calendar,
  Sparkles,
  Droplets,
  Thermometer,
  Layers,
  ShieldAlert,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sprout,
  Check,
  AlertTriangle,
} from "lucide-react";
import { FULL_CROPS_INTELLIGENCE_CATALOG } from "../../data/cropIntelligenceData.js";

export function CropLifecycleCalendar({ isDarkMode, onOpenBlueprint }) {
  const [selectedCropId, setSelectedCropId] = useState("wheat");
  const [activeStageIdx, setActiveStageIdx] = useState(0);

  const selectedCrop =
    FULL_CROPS_INTELLIGENCE_CATALOG.find((c) => c.id === selectedCropId) ||
    FULL_CROPS_INTELLIGENCE_CATALOG[0];

  const stages = selectedCrop.phenologicalStages || [];
  const currentStage = stages[activeStageIdx] || stages[0];

  return (
    <div className="space-y-6">
      {/* Header Selector Strip */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                📅 Phenological Lifecycle Intelligence
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                GDD &amp; Irrigation Timing Matrix
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
              5-Stage Crop Growth Timeline &amp; Scouting Calendar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
              Track critical moisture stress milestones, growing degree days (GDD), precision fertigation schedules, and time-sensitive pest alerts across the full {selectedCrop.durationDays}-day cycle.
            </p>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCropId}
              onChange={(e) => {
                setSelectedCropId(e.target.value);
                setActiveStageIdx(0);
              }}
              className="form-select text-xs font-semibold py-2 cursor-pointer"
            >
              {FULL_CROPS_INTELLIGENCE_CATALOG.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} ({c.durationDays} Days • {c.season})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5-Stage Stepper Navigation Bar */}
        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {stages.map((st, idx) => {
              const isActive = activeStageIdx === idx;
              return (
                <button
                  key={st.stageNumber}
                  type="button"
                  onClick={() => setActiveStageIdx(idx)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                    isActive
                      ? "bg-emerald-500/10 border-emerald-500 shadow-sm ring-1 ring-emerald-500/30"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-emerald-500/40 text-[var(--text-secondary)]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)] font-mono">
                      Stage {st.stageNumber}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400">
                      {st.waterVolumePercent}% H₂O
                    </span>
                  </div>
                  <span className={`text-xs font-bold block truncate font-heading ${isActive ? "text-emerald-700 dark:text-emerald-400" : "text-[var(--text-primary)]"}`}>
                    {st.name.split("&")[0]}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] block font-mono mt-0.5">
                    {st.dasRange}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Stage Deep Dive Bento Box */}
      {currentStage && (
        <div className="app-card p-6 lg:p-7">
          {/* Stage Top Title & Metrics Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-lg font-black font-heading text-emerald-600 dark:text-emerald-400">
                {currentStage.stageNumber}
              </span>
              <div>
                <h3 className="text-lg font-bold font-heading text-[var(--text-primary)]">
                  {currentStage.name}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  Timeline: {currentStage.dasRange} • Heat Units: {currentStage.gdd}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activeStageIdx === 0}
                onClick={() => setActiveStageIdx((prev) => Math.max(0, prev - 1))}
                className="p-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] disabled:opacity-30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Previous stage"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-[var(--text-primary)] font-mono px-2">
                {activeStageIdx + 1} / {stages.length}
              </span>
              <button
                type="button"
                disabled={activeStageIdx === stages.length - 1}
                onClick={() =>
                  setActiveStageIdx((prev) => Math.min(stages.length - 1, prev + 1))
                }
                className="p-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] disabled:opacity-30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                aria-label="Next stage"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Core Stage Intelligence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            {/* Left: Water & Agronomic Operations */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                  <Droplets className="w-4 h-4" />
                  <span>Hydrology &amp; Water Allocation</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      Stage Water Need
                    </span>
                    <span className="font-bold font-mono text-[var(--text-primary)] text-sm mt-0.5 block">
                      {currentStage.waterDepthMm} mm
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">
                      % of Total Lifecycle
                    </span>
                    <span className="font-bold font-mono text-cyan-600 dark:text-cyan-400 text-sm mt-0.5 block">
                      {currentStage.waterVolumePercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] space-y-2">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  <span>Mandatory Field Operations &amp; Fertigation</span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed pt-1">
                  {currentStage.criticalActions}
                </p>
              </div>
            </div>

            {/* Right: Pest & Disease Scouting Alert */}
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-amber-500/20 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Priority Pest &amp; Disease Scouting Advisory</span>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  {currentStage.scoutingAlert}
                </div>
              </div>

              {/* Sowing & Spacing Reference */}
              <div className="p-4 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)] text-xs space-y-2">
                <span className="font-bold text-[var(--text-primary)] block">
                  Agronomic Geometry &amp; Target Cultivars
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Spacing</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{selectedCrop.spacingCm}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block">Seed Rate / Acre</span>
                    <span className="font-bold text-[var(--text-primary)] font-mono">{selectedCrop.seedRatePerAcre}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--text-secondary)]">
                  <strong className="text-[var(--text-primary)]">Recommended Cultivars: </strong>
                  {selectedCrop.popularVarieties.join(", ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
