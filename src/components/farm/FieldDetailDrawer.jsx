import React, { useState } from "react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  X,
  Droplets,
  Edit2,
  Trash2,
  Sparkles,
  Layers,
  Calendar,
  FlaskConical,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  AlertTriangle,
} from "lucide-react";
import { getCropEmoji, getSeverityBadgeClass } from "../../utils/formatters.js";

export function FieldDetailDrawer({ field, onClose, onEdit, onDelete, onLogActivity }) {
  const { irrigateField, activities } = useFarm();
  const { isDarkMode } = useTheme();

  const [customNote, setCustomNote] = useState("");

  if (!field) return null;

  const fieldActivities = activities.filter((a) => a.fieldId === field.id);

  // Compute days until harvest
  const harvestDateObj = new Date(field.expectedHarvestDate);
  const now = new Date();
  const diffDays = Math.ceil((harvestDateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-[18px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
        {/* Drawer Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getCropEmoji(field.currentCrop)}</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-heading text-[var(--text-primary)]">{field.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                  {field.healthStatus}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
                {field.currentCrop} • {field.areaAcres} Acres ({field.soilType?.toUpperCase()} Soil)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onEdit(field)}
              className="btn-ghost p-2 rounded-[8px] border border-[var(--border)] cursor-pointer text-[var(--text-secondary)]"
              title="Edit Field"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="btn-ghost p-2 rounded-[8px] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="py-5 space-y-5 text-xs">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Soil Moisture</span>
              <span className={`text-lg font-bold font-heading ${field.moisturePercentage < 40 ? "text-[var(--danger)]" : "text-[var(--info)]"}`}>
                {field.moisturePercentage}% H₂O
              </span>
            </div>

            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block font-semibold">NDVI Index</span>
              <span className="text-lg font-bold font-heading text-purple-500">
                {field.ndviIndex || 0.82}
              </span>
            </div>

            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Days to Harvest</span>
              <span className="text-lg font-bold font-heading text-[var(--warning)]">
                {diffDays > 0 ? `${diffDays} Days` : "Ready"}
              </span>
            </div>

            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Irrigation Type</span>
              <span className="text-xs font-semibold text-[var(--primary)] block truncate mt-1">
                {field.irrigationSource || "Solar Drip"}
              </span>
            </div>
          </div>

          {/* Physiological Stage Progress */}
          <div className="p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-[var(--text-primary)]">
                Crop Phenology: {field.growthStage}
              </span>
              <span className="font-bold text-[var(--primary)] font-heading">
                {field.growthProgressPercent}% Complete
              </span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--surface)]">
              <div
                className="h-full bg-[var(--primary)] rounded-full transition-all"
                style={{ width: `${field.growthProgressPercent || 50}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mt-2 font-mono">
              <span>Sown: {field.sowingDate}</span>
              <span>Target: {field.expectedHarvestDate}</span>
            </div>
          </div>

          {/* Soil Chemistry (NPK & pH) */}
          <div className="p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-[var(--text-primary)] font-heading">
                <FlaskConical className="w-4 h-4 text-[var(--primary)]" />
                <span>Laboratory Soil Profile</span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)]">
                Tested: {field.soilTest?.testDate || "Recent"}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="p-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Nitrogen (N)</span>
                <span className="font-bold text-xs text-[var(--warning)] font-mono">{field.soilTest?.nitrogen || 105} kg/ha</span>
              </div>
              <div className="p-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Phosphorus (P)</span>
                <span className="font-bold text-xs text-[var(--primary)] font-mono">{field.soilTest?.phosphorus || 52} kg/ha</span>
              </div>
              <div className="p-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Potash (K)</span>
                <span className="font-bold text-xs text-[var(--warning)] font-mono">{field.soilTest?.potassium || 48} kg/ha</span>
              </div>
              <div className="p-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">pH Value</span>
                <span className="font-bold text-xs text-[var(--info)] font-mono">{field.soilTest?.ph || 6.8}</span>
              </div>
              <div className="p-2 rounded-[8px] bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[10px] text-[var(--text-muted)] block">Carbon (OC)</span>
                <span className="font-bold text-xs text-[var(--primary)] font-mono">{field.soilTest?.organicCarbon || 0.74}%</span>
              </div>
            </div>
          </div>

          {/* Notes & Audit */}
          {field.notes && (
            <div className="p-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-xs text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)] block mb-1">Agronomist Notes:</strong>
              {field.notes}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onDelete(field)}
            className="btn-danger text-xs py-2 px-3 flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Plot</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => irrigateField(field.id)}
              className="btn-primary text-xs py-2 px-4 flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>1-Click Precision Irrigation</span>
            </button>
            <button
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
