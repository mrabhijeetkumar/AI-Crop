import React, { useState } from "react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Compass,
  Layers,
  Droplets,
  Eye,
  Maximize2,
  Sparkles,
  Zap,
  Info,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getCropEmoji } from "../../utils/formatters.js";

export function FarmGISMap({ onSelectField, onOpenEdit }) {
  const { fields, farmProfile, irrigateField } = useFarm();
  const { isDarkMode } = useTheme();

  const [activeLayer, setActiveLayer] = useState("crops"); // 'crops' | 'moisture' | 'ndvi'
  const [hoveredPlot, setHoveredPlot] = useState(null);
  const [selectedPlotId, setSelectedPlotId] = useState(fields[0]?.id || null);

  const selectedField = fields.find((f) => f.id === selectedPlotId) || fields[0];

  // Grid coordinates mapping for up to 8 plots in a realistic agricultural cadastral grid
  const plotLayouts = [
    { x: 30, y: 30, w: 260, h: 160, rotation: 0 },
    { x: 310, y: 30, w: 290, h: 160, rotation: 0 },
    { x: 620, y: 30, w: 280, h: 220, rotation: 0 },
    { x: 30, y: 210, w: 260, h: 220, rotation: 0 },
    { x: 310, y: 210, w: 290, h: 220, rotation: 0 },
    { x: 620, y: 270, w: 280, h: 160, rotation: 0 },
    { x: 30, y: 450, w: 420, h: 160, rotation: 0 },
    { x: 470, y: 450, w: 430, h: 160, rotation: 0 },
  ];

  const getPlotColor = (field) => {
    if (activeLayer === "moisture") {
      const m = Number(field.moisturePercentage) || 50;
      if (m < 35) return isDarkMode ? "fill-rose-900/40 stroke-rose-400" : "fill-rose-100 stroke-rose-500";
      if (m < 45) return isDarkMode ? "fill-amber-900/40 stroke-amber-400" : "fill-amber-100 stroke-amber-500";
      if (m < 60) return isDarkMode ? "fill-emerald-900/50 stroke-[#22c55e]" : "fill-emerald-100 stroke-emerald-600";
      return isDarkMode ? "fill-cyan-900/50 stroke-cyan-400" : "fill-cyan-100 stroke-cyan-600";
    }

    if (activeLayer === "ndvi") {
      const ndvi = Number(field.ndviIndex) || 0.8;
      if (ndvi >= 0.85) return isDarkMode ? "fill-emerald-800/60 stroke-emerald-400" : "fill-emerald-200 stroke-emerald-700";
      if (ndvi >= 0.75) return isDarkMode ? "fill-lime-900/50 stroke-lime-400" : "fill-lime-100 stroke-lime-600";
      return isDarkMode ? "fill-yellow-900/40 stroke-yellow-400" : "fill-yellow-100 stroke-yellow-600";
    }

    // Default crop layer coloring
    const crop = (field.currentCrop || "").toLowerCase();
    if (crop.includes("wheat")) return isDarkMode ? "fill-[#1b2721] stroke-[#4ade80]" : "fill-emerald-50 stroke-emerald-500";
    if (crop.includes("corn") || crop.includes("maize")) return isDarkMode ? "fill-[#272a1e] stroke-amber-400" : "fill-amber-50 stroke-amber-500";
    if (crop.includes("soybean")) return isDarkMode ? "fill-[#182723] stroke-teal-400" : "fill-teal-50 stroke-teal-500";
    if (crop.includes("mustard")) return isDarkMode ? "fill-[#2a261c] stroke-yellow-400" : "fill-yellow-50 stroke-yellow-500";
    if (crop.includes("potato")) return isDarkMode ? "fill-[#2a201b] stroke-orange-400" : "fill-orange-50 stroke-orange-500";
    if (crop.includes("barley")) return isDarkMode ? "fill-[#1b232a] stroke-blue-400" : "fill-blue-50 stroke-blue-500";
    return isDarkMode ? "fill-[var(--surface-strong)] stroke-[var(--primary)]" : "fill-slate-100 stroke-slate-400";
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="app-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-[var(--primary)]" />
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            GIS Spectral Layers:
          </span>
          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-[10px] border border-[var(--border)]">
            <button
              onClick={() => setActiveLayer("crops")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === "crops"
                  ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              🌱 Crops &amp; Cadastre
            </button>

            <button
              onClick={() => setActiveLayer("moisture")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === "moisture"
                  ? "bg-blue-500 text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              💧 Soil Moisture
            </button>

            <button
              onClick={() => setActiveLayer("ndvi")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold transition-all cursor-pointer ${
                activeLayer === "ndvi"
                  ? "bg-purple-500 text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              🛰️ Sentinel NDVI
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-[var(--primary)] font-medium">
            <Compass className="w-3.5 h-3.5" />
            North 12° E • 31.22° N, 75.77° E
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)]">
            Resolution: 10m/px
          </span>
        </div>
      </div>

      {/* Main Map Canvas and Inspector Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Visual Map Area */}
        <div className="lg:col-span-8 app-card p-4 sm:p-6 relative overflow-hidden">
          {/* Top-Right Mini Coordinates */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-[var(--surface-strong)]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[var(--border)] text-[11px] text-[var(--text-primary)] shadow-sm">
            <span className="text-[var(--primary)] font-bold">N ↑</span>
            <span>{farmProfile.location || "Punjab Cadastre"}</span>
          </div>

          {/* SVG Cadastral Parcel Geometry */}
          <div className="w-full overflow-x-auto">
            <svg
              viewBox="0 0 940 640"
              className="w-full h-auto min-w-[600px] select-none"
            >
              {/* Canal & Farm Road Infrastructure */}
              <path
                d="M 10 195 L 930 195"
                stroke={isDarkMode ? "rgba(148, 163, 152, 0.25)" : "#cbd5e1"}
                strokeWidth="6"
                strokeDasharray="8 6"
                fill="none"
              />
              <path
                d="M 300 10 L 300 630"
                stroke={isDarkMode ? "rgba(96, 165, 250, 0.35)" : "#60a5fa"}
                strokeWidth="8"
                fill="none"
              />
              <path
                d="M 610 10 L 610 630"
                stroke={isDarkMode ? "rgba(148, 163, 152, 0.25)" : "#cbd5e1"}
                strokeWidth="6"
                strokeDasharray="8 6"
                fill="none"
              />

              {/* Labels for Infrastructure */}
              <text x="310" y="24" fill={isDarkMode ? "#60a5fa" : "#2563eb"} fontSize="10" fontWeight="bold">
                🌊 Main Solar Drip Canal Line
              </text>
              <text x="18" y="190" fill={isDarkMode ? "#c1cec5" : "#64748b"} fontSize="9" fontWeight="bold">
                🚜 Field Access Road
              </text>

              {/* Farm Parcel Polygons */}
              {fields.map((field, idx) => {
                const layout = plotLayouts[idx % plotLayouts.length];
                const isSelected = field.id === selectedPlotId;
                const isHovered = hoveredPlot?.id === field.id;

                return (
                  <g
                    key={field.id}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => setHoveredPlot(field)}
                    onMouseLeave={() => setHoveredPlot(null)}
                    onClick={() => {
                      setSelectedPlotId(field.id);
                      if (onSelectField) onSelectField(field.id);
                    }}
                  >
                    {/* Parcel Rect */}
                    <rect
                      x={layout.x}
                      y={layout.y}
                      width={layout.w}
                      height={layout.h}
                      rx="14"
                      className={`${getPlotColor(field)} transition-all`}
                      strokeWidth={isSelected ? "3" : isHovered ? "2.2" : "1.5"}
                    />

                    {/* Sensor Probe Indicator Icon */}
                    <circle
                      cx={layout.x + layout.w - 20}
                      cy={layout.y + 20}
                      r="5"
                      fill="#22c55e"
                    />

                    {/* Crop Emoji & Name */}
                    <text
                      x={layout.x + 18}
                      y={layout.y + 36}
                      fill={isDarkMode ? "#f1f5f3" : "#0f172a"}
                      fontSize="13"
                      fontWeight="bold"
                      className="select-none font-heading"
                    >
                      {getCropEmoji(field.currentCrop)} {field.name}
                    </text>

                    {/* Crop & Variety Tag */}
                    <text
                      x={layout.x + 18}
                      y={layout.y + 56}
                      fill={isDarkMode ? "#c1cec5" : "#475569"}
                      fontSize="11"
                      fontWeight="500"
                      className="select-none"
                    >
                      {field.currentCrop}
                    </text>

                    {/* Area & Stage */}
                    <rect
                      x={layout.x + 18}
                      y={layout.y + 68}
                      width="70"
                      height="20"
                      rx="6"
                      fill={isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)"}
                    />
                    <text
                      x={layout.x + 24}
                      y={layout.y + 82}
                      fill={isDarkMode ? "#f1f5f3" : "#1e293b"}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {field.areaAcres} Acres
                    </text>

                    {/* Live Sensor Telemetry Badge */}
                    <rect
                      x={layout.x + 94}
                      y={layout.y + 68}
                      width="90"
                      height="20"
                      rx="6"
                      fill={isDarkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)"}
                    />
                    <text
                      x={layout.x + 100}
                      y={layout.y + 82}
                      fill={field.moisturePercentage < 40 ? "#ef4444" : isDarkMode ? "#60a5fa" : "#2563eb"}
                      fontSize="10"
                      fontWeight="bold"
                    >
                      💧 {field.moisturePercentage}% H₂O
                    </text>

                    {/* Growth Progress Bar */}
                    <rect
                      x={layout.x + 18}
                      y={layout.y + layout.h - 30}
                      width={layout.w - 36}
                      height="5"
                      rx="2.5"
                      fill={isDarkMode ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.1)"}
                    />
                    <rect
                      x={layout.x + 18}
                      y={layout.y + layout.h - 30}
                      width={((layout.w - 36) * (field.growthProgressPercent || 50)) / 100}
                      height="5"
                      rx="2.5"
                      fill="#22c55e"
                    />

                    {/* Progress text */}
                    <text
                      x={layout.x + 18}
                      y={layout.y + layout.h - 14}
                      fill={isDarkMode ? "#8d9d92" : "#64748b"}
                      fontSize="10"
                      fontWeight="500"
                    >
                      {field.growthStage} ({field.growthProgressPercent}%)
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Map Legend Overlay */}
          <div className="mt-4 p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex items-center justify-between flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-[var(--text-primary)]">Legend:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                <span>Healthy Moisture (&gt;50%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span>Moderate (40-50%)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span>Water Deficit (&lt;40%)</span>
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)]">Click plot to inspect details</span>
          </div>
        </div>

        {/* Right Side Inspector Panel */}
        <div className="lg:col-span-4 space-y-4">
          {selectedField ? (
            <div className="app-card p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                    {selectedField.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    {selectedField.currentCrop} • {selectedField.areaAcres} Acres
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                  {selectedField.healthStatus}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Soil Type</span>
                  <span className="font-medium text-[var(--text-primary)] capitalize">{selectedField.soilType}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Moisture</span>
                  <span className="font-bold font-heading text-[var(--info)]">{selectedField.moisturePercentage}% H₂O</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">NDVI Index</span>
                  <span className="font-bold font-heading text-[var(--primary)]">{selectedField.ndviIndex || 0.82}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Growth Stage</span>
                  <span className="font-medium text-[var(--text-primary)]">{selectedField.growthStage}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[var(--border)]">
                  <span className="text-[var(--text-muted)]">Expected Harvest</span>
                  <span className="font-mono text-[var(--text-primary)]">{selectedField.expectedHarvestDate}</span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => irrigateField(selectedField.id)}
                  className="btn-primary flex-1 text-xs py-2 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>1-Click Irrigate</span>
                </button>
                {onOpenEdit && (
                  <button
                    onClick={() => onOpenEdit(selectedField)}
                    className="btn-secondary text-xs py-2 px-3 cursor-pointer"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="app-card p-8 text-center text-xs text-[var(--text-muted)]">
              Select a field plot to inspect
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
