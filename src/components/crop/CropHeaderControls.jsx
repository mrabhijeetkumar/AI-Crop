import React, { useState } from "react";
import {
  Sliders,
  Sparkles,
  RefreshCw,
  MapPin,
  Check,
} from "lucide-react";
import { AGRO_CLIMATIC_PRESETS } from "../../data/cropIntelligenceData.js";
import { SOIL_TYPES } from "../../data/soilTypes.js";

export function CropHeaderControls({
  soilParams,
  setSoilParams,
  climateParams,
  setClimateParams,
  onResetDefaults,
  onSyncFarmField,
  farmFields = [],
  isDarkMode,
}) {
  const [selectedPresetId, setSelectedPresetId] = useState("indo_gangetic");
  const [showAdvancedInputs, setShowAdvancedInputs] = useState(false);
  const [selectedFieldId, setSelectedFieldId] = useState("");

  const handleApplyPreset = (presetId) => {
    setSelectedPresetId(presetId);
    const preset = AGRO_CLIMATIC_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setSoilParams({
        soilType: preset.soilType,
        soilN: preset.nitrogen,
        soilP: preset.phosphorus,
        soilK: preset.potassium,
        soilPH: preset.ph,
        organicCarbon: preset.organicCarbon,
        ec: preset.ec,
        waterAvailability: preset.waterAvailability,
      });
      setClimateParams({
        season: preset.season,
        temperature: preset.temperature,
        rainfall: preset.rainfall,
      });
    }
  };

  const handleFieldChange = (fieldId) => {
    setSelectedFieldId(fieldId);
    if (!fieldId) return;
    const field = farmFields.find((f) => f.id === fieldId);
    if (field && onSyncFarmField) {
      onSyncFarmField(field);
    }
  };

  return (
    <div
      className="app-card p-5 lg:p-6 transition-all"
    >
      {/* Top Banner Row */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-5 border-b border-[var(--border)]">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border border-[var(--primary)]/20 bg-[var(--primary-soft)] text-[var(--primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
              ICAR-Calibrated Agro-Climatic Intelligence
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
              ⚡ Real-Time Reactive Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-[var(--text-primary)]">
            Crop Intelligence &amp; Agronomic Matching Suite
          </h1>
          <p className="text-xs sm:text-sm max-w-3xl leading-relaxed text-[var(--text-secondary)]">
            Multi-dimensional simulation engine factoring Soil NPK chemistry, pH buffering, irrigation hydrology, seasonal thermal windows, and MSP market economics.
          </p>
        </div>

        {/* Quick Actions & Field Sync */}
        <div className="flex flex-wrap items-center gap-2.5">
          {farmFields.length > 0 && (
            <div className="relative">
              <select
                value={selectedFieldId}
                onChange={(e) => handleFieldChange(e.target.value)}
                className="form-select text-xs font-semibold py-1.5 cursor-pointer"
              >
                <option value="">🌾 Pull from My Farm Fields...</option>
                {farmFields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.areaAcres} Acres • {f.currentCrop || "Idle"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={onResetDefaults}
            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>
        </div>
      </div>

      {/* Preset Agro-Climatic Zone Strip */}
      <div className="pt-4 pb-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
            Regional Agro-Climatic Presets
          </label>
          <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">
            Click to auto-populate regional soil profiles
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {AGRO_CLIMATIC_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary-soft)] border-[var(--primary)] shadow-sm ring-1 ring-[var(--primary)]/30"
                    : "bg-[var(--surface-subtle)] border-[var(--border)] hover:border-[var(--primary)]/40 text-[var(--text-secondary)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold block truncate ${isSelected ? "text-[var(--primary)] font-heading" : "text-[var(--text-primary)]"}`}>
                    {preset.name}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />}
                </div>
                <span className="text-[10px] block truncate mt-0.5 text-[var(--text-muted)]">
                  {preset.soilTypeName}
                </span>
                <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-[var(--text-secondary)]">
                  <span>N:{preset.nitrogen}</span>
                  <span>P:{preset.phosphorus}</span>
                  <span>K:{preset.potassium}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Parameters Control Panel */}
      <div className="pt-3 border-t border-[var(--border)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Soil Classification */}
          <div>
            <label className="text-xs font-bold block mb-1.5 text-[var(--text-secondary)]">
              Soil Type Classification
            </label>
            <select
              value={soilParams.soilType}
              onChange={(e) =>
                setSoilParams((prev) => ({ ...prev, soilType: e.target.value }))
              }
              className="form-select w-full text-xs font-semibold py-2 cursor-pointer"
            >
              {SOIL_TYPES.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.texture})
                </option>
              ))}
            </select>
          </div>

          {/* Sowing Season */}
          <div>
            <label className="text-xs font-bold block mb-1.5 text-[var(--text-secondary)]">
              Target Sowing Season
            </label>
            <div className="grid grid-cols-4 gap-1">
              {["Rabi", "Kharif", "Zaid", "All"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setClimateParams((prev) => ({ ...prev, season: s }))
                  }
                  className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    climateParams.season === s
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-transparent font-bold shadow-md shadow-emerald-600/20"
                      : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Irrigation & Water Availability */}
          <div>
            <label className="text-xs font-bold block mb-1.5 text-[var(--text-secondary)]">
              Irrigation &amp; Hydrology
            </label>
            <select
              value={soilParams.waterAvailability}
              onChange={(e) =>
                setSoilParams((prev) => ({
                  ...prev,
                  waterAvailability: e.target.value,
                }))
              }
              className="form-select w-full text-xs font-semibold py-2 cursor-pointer"
            >
              <option value="Low (Rainfed)">Low (Rainfed / Drought Prone)</option>
              <option value="Moderate (Borewell/Sprinkler)">
                Moderate (Borewell / Sprinkler)
              </option>
              <option value="High (Canal/Drip)">
                High (Canal Surface / Solar Drip)
              </option>
            </select>
          </div>

          {/* Soil pH Balance */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-bold text-[var(--text-secondary)]">
                Soil pH Reaction
              </label>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">
                {Number(soilParams.soilPH).toFixed(1)}{" "}
                <span className="text-[10px] font-normal text-[var(--text-muted)]">
                  {soilParams.soilPH < 6.0
                    ? "(Acidic)"
                    : soilParams.soilPH > 7.5
                    ? "(Alkaline)"
                    : "(Neutral)"}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={soilParams.soilPH}
                onChange={(e) =>
                  setSoilParams((prev) => ({
                    ...prev,
                    soilPH: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-cyan-500 cursor-pointer h-2 bg-[var(--surface-subtle)] rounded-lg"
              />
              <input
                type="number"
                step="0.1"
                min="4.5"
                max="9.0"
                value={soilParams.soilPH}
                onChange={(e) =>
                  setSoilParams((prev) => ({
                    ...prev,
                    soilPH: Number(e.target.value),
                  }))
                }
                className="w-14 text-center text-xs font-mono font-bold py-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-cyan-700 dark:text-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* NPK Precision Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 mt-4 border-t border-[var(--border)]">
          {/* Nitrogen N */}
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                Available Nitrogen (N)
              </span>
              <span className="text-xs font-mono font-bold text-[var(--primary)]">
                {soilParams.soilN} kg/ha
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="30"
                max="220"
                value={soilParams.soilN}
                onChange={(e) =>
                  setSoilParams((prev) => ({
                    ...prev,
                    soilN: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-[var(--primary)] cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilN: Math.max(30, p.soilN - 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilN: Math.min(220, p.soilN + 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Phosphorus P */}
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                Available Phosphorus (P)
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                {soilParams.soilP} kg/ha
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="120"
                value={soilParams.soilP}
                onChange={(e) =>
                  setSoilParams((prev) => ({
                    ...prev,
                    soilP: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-amber-500 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilP: Math.max(10, p.soilP - 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilP: Math.min(120, p.soilP + 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Potassium K */}
          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-[var(--text-secondary)]">
                Available Potassium (K)
              </span>
              <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400">
                {soilParams.soilK} kg/ha
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="140"
                value={soilParams.soilK}
                onChange={(e) =>
                  setSoilParams((prev) => ({
                    ...prev,
                    soilK: Number(e.target.value),
                  }))
                }
                className="flex-1 accent-teal-500 cursor-pointer"
              />
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilK: Math.max(10, p.soilK - 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  -
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSoilParams((p) => ({
                      ...p,
                      soilK: Math.min(140, p.soilK + 5),
                    }))
                  }
                  className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Optional Toggle for Advanced Climate/SOC/EC parameters */}
        <div className="mt-3 text-right">
          <button
            type="button"
            onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
            className="text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer text-[var(--primary)] hover:underline"
          >
            <span>
              {showAdvancedInputs ? "Hide Secondary Diagnostics" : "+ Fine-Tune Soil Carbon, EC & Temperature"}
            </span>
          </button>
        </div>

        {showAdvancedInputs && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 mt-2 border-t border-[var(--border)]">
            <div>
              <label className="text-xs font-semibold block mb-1 text-[var(--text-secondary)]">
                Organic Carbon (SOC %)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.8"
                value={soilParams.organicCarbon}
                onChange={(e) =>
                  setSoilParams((p) => ({
                    ...p,
                    organicCarbon: Number(e.target.value),
                  }))
                }
                className="form-input w-full text-xs font-mono py-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-[var(--text-secondary)]">
                Electrical Conductivity (EC dS/m)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="6.0"
                value={soilParams.ec}
                onChange={(e) =>
                  setSoilParams((p) => ({
                    ...p,
                    ec: Number(e.target.value),
                  }))
                }
                className="form-input w-full text-xs font-mono py-1.5"
              />
            </div>

            <div>
              <label className="text-xs font-semibold block mb-1 text-[var(--text-secondary)]">
                Average Seasonal Temp (°C)
              </label>
              <input
                type="number"
                min="10"
                max="45"
                value={climateParams.temperature}
                onChange={(e) =>
                  setClimateParams((p) => ({
                    ...p,
                    temperature: Number(e.target.value),
                  }))
                }
                className="form-input w-full text-xs font-mono py-1.5"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
