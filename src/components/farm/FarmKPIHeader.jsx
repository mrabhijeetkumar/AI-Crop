import React from "react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Map,
  Plus,
  RefreshCw,
  Droplets,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Radio,
} from "lucide-react";

export function FarmKPIHeader({ onOpenAdd, isRefreshingSensors, onRefreshSensors }) {
  const { farmProfile, fields, syncStatus, lastSyncTime } = useFarm();
  const { isDarkMode } = useTheme();

  const totalAcres = fields.reduce((sum, f) => sum + (Number(f.areaAcres) || 0), 0).toFixed(1);
  const avgMoisture = fields.length > 0
    ? Math.round(fields.reduce((sum, f) => sum + (Number(f.moisturePercentage) || 0), 0) / fields.length)
    : 0;
  const avgNdvi = fields.length > 0
    ? (fields.reduce((sum, f) => sum + (Number(f.ndviIndex) || 0.82), 0) / fields.length).toFixed(2)
    : "0.82";

  const moistureDeficitCount = fields.filter((f) => Number(f.moisturePercentage) < 40).length;

  return (
    <div className="space-y-4">
      {/* Top Banner Card */}
      <div className="app-card p-5 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Title & Location */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                <Radio className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                <span>Farm Boundary &amp; Parcel Registry</span>
              </span>

              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]">
                📍 {farmProfile.location || "North India"}
              </span>

              {/* Real-time sync badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                  syncStatus === "saving"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                    : "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    syncStatus === "saving" ? "bg-amber-400 animate-ping" : "bg-[var(--primary)]"
                  }`}
                />
                <span>
                  {syncStatus === "saving" ? "Saving in real-time..." : `Cloud Synced (${lastSyncTime})`}
                </span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              Field Plots &amp; Crop Cycle Manager
            </h1>

            <p className="text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed text-[var(--text-secondary)]">
              Real-time cadastral parcel management, live IoT soil moisture tracking, physiological growth stages, and field agronomy audit log.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={onRefreshSensors}
              disabled={isRefreshingSensors}
              className="btn-secondary text-xs flex items-center gap-2 cursor-pointer py-2.5 px-3.5"
              title="Poll live IoT soil moisture & temperature sensors"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-[var(--primary)] ${
                  isRefreshingSensors ? "animate-spin text-amber-400" : ""
                }`}
              />
              <span>{isRefreshingSensors ? "Syncing Sensors..." : "Sync IoT Probes"}</span>
            </button>

            <button
              onClick={onOpenAdd}
              className="btn-primary text-xs flex items-center gap-2 cursor-pointer font-bold py-2.5 px-4 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Map New Field Plot</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Land */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Total Land
            </span>
            <div className="w-8 h-8 rounded-xl bg-[var(--primary-soft)] flex items-center justify-center text-[var(--primary)]">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              {totalAcres}
            </span>
            <span className="text-xs font-semibold text-[var(--primary)] uppercase">Acres</span>
          </div>
          <p className="text-[11px] mt-1 font-medium text-[var(--text-muted)]">
            Across <strong className="text-[var(--primary)]">{fields.length} Active Parcels</strong>
          </p>
        </div>

        {/* Avg Soil Moisture */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Avg Soil Moisture
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-[var(--info)]">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-2xl sm:text-3xl font-bold font-heading tracking-tight ${
                avgMoisture < 40 ? "text-[var(--danger)]" : "text-[var(--text-primary)]"
              }`}
            >
              {avgMoisture}%
            </span>
            <span className="text-xs font-semibold text-[var(--info)] uppercase">H₂O</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-[11px]">
            {moistureDeficitCount > 0 ? (
              <span className="text-[var(--danger)] font-medium flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {moistureDeficitCount} plot{moistureDeficitCount > 1 ? "s" : ""} need watering
              </span>
            ) : (
              <span className="text-[var(--success)] font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Optimal hydration levels
              </span>
            )}
          </div>
        </div>

        {/* Satellite NDVI Health */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Satellite NDVI
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              {avgNdvi}
            </span>
            <span className="text-xs font-semibold text-[var(--success)] uppercase">Vigorous</span>
          </div>
          <p className="text-[11px] mt-1 font-medium text-[var(--text-muted)]">
            Chlorophyll canopy absorption 84%+
          </p>
        </div>

        {/* Harvest Pipeline */}
        <div className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Cycle Progress
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-[var(--warning)]">
              <Map className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              {fields.filter((f) => (f.growthProgressPercent || 0) >= 80).length} / {fields.length}
            </span>
            <span className="text-xs font-semibold text-[var(--warning)] uppercase">Maturing</span>
          </div>
          <p className="text-[11px] mt-1 font-medium text-[var(--text-muted)]">
            Next harvest window in 4 days
          </p>
        </div>
      </div>
    </div>
  );
}
