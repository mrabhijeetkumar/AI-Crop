import React from "react";
import {
  MapPin,
  CloudSun,
  Droplets,
  Wind,
  Gauge,
  Sparkles,
  ChevronDown,
  Layers,
  Thermometer,
} from "lucide-react";

export function AdvisorGroundingBar({
  fields = [],
  selectedFieldId,
  onSelectField,
  weather,
  activePersona = "general",
  groundingEnabled = true,
  onToggleGrounding,
  isDarkMode = true,
}) {
  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0] || {};

  const personaTitles = {
    general: "🌾 Senior AI Agronomist (Dr. Krishi)",
    pathology: "🔬 Plant Doctor & IPM Specialist",
    soil_nutrition: "🧪 Soil Chemistry & Fertilizer Nutritionist",
    market: "📈 Agri-Commodity Mandi Strategist",
    schemes: "🏛️ Kisan Welfare & Subsidy Advisor",
  };

  return (
    <div className="border border-[var(--border)] bg-[var(--surface-subtle)] rounded-2xl p-3 sm:p-4 shadow-sm transition-colors">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Active Crop & Field Dropdown */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="badge badge-primary flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{personaTitles[activePersona] || personaTitles.general}</span>
          </div>

          {/* Field Selector */}
          <div className="relative inline-block">
            <select
              value={selectedFieldId || (fields[0]?.id ?? "")}
              onChange={(e) => onSelectField(e.target.value)}
              className="form-select pl-8 pr-8 py-1.5 text-xs font-medium cursor-pointer"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id} className="bg-[var(--surface)] text-[var(--text-primary)]">
                  {f.name} ({f.currentCrop} - {f.areaAcres} Ac)
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 text-[var(--primary)] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Live IoT Telemetry Grounding Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Temperature & Weather */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] font-mono">
            <Thermometer className="w-3.5 h-3.5 text-amber-500" />
            <span>{weather?.temperature || 28}°C</span>
          </div>

          {/* Moisture */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] font-mono">
            <Droplets className="w-3.5 h-3.5 text-sky-500" />
            <span>Moisture: <strong className="text-[var(--text-primary)]">{selectedField?.moisturePercentage || 52}%</strong></span>
          </div>

          {/* Soil pH / Health */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-secondary)] font-mono">
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            <span>pH: <strong className="text-[var(--text-primary)]">{selectedField?.soilTest?.ph || 6.8}</strong></span>
          </div>

          {/* Grounding Toggle */}
          <button
            onClick={onToggleGrounding}
            className={`px-3 py-1 rounded-xl border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              groundingEnabled
                ? "bg-[var(--primary-soft)] border-[var(--primary)]/40 text-[var(--primary)] font-bold shadow-sm ring-1 ring-[var(--primary)]/20"
                : "border-[var(--border)] bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
            title="Ground AI with Real-time IoT Farm Telemetry"
          >
            <Sparkles className="w-3 h-3 text-[var(--primary)]" />
            <span>{groundingEnabled ? "Farm Grounding: ON" : "Farm Grounding: OFF"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdvisorGroundingBar;
