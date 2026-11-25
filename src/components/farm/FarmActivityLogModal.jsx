import React, { useState } from "react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  FileText,
  X,
  Droplets,
  FlaskConical,
  Bug,
  Sparkles,
  ClipboardList,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export function FarmActivityLogModal({ isOpen, onClose, initialFieldId = null }) {
  const { fields, logFieldActivity, farmProfile } = useFarm();
  const { isDarkMode } = useTheme();

  const [fieldId, setFieldId] = useState(initialFieldId || fields[0]?.id || "");
  const [activityType, setActivityType] = useState("fertilizer");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dosage, setDosage] = useState("");
  const [operator, setOperator] = useState(farmProfile?.ownerName || "Farmer");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fieldId) return;

    const fullDesc = `${description}${dosage ? ` | Dosage: ${dosage}` : ""}`;
    logFieldActivity(fieldId, {
      type: activityType,
      title: title || `${activityType.toUpperCase()} Operation`,
      description: fullDesc,
      notes: notes || fullDesc,
      operator: operator || farmProfile?.ownerName || "Farmer",
    });

    onClose();
  };

  const activityPresets = [
    { id: "fertilizer", label: "Fertilizer / Top-Dress", icon: FlaskConical, placeholder: "e.g. 45kg/acre Urea top-dressing at 1st irrigation" },
    { id: "spray", label: "Foliar Spray / Protection", icon: Bug, placeholder: "e.g. Propiconazole 25% EC spray @ 200ml/acre for rust prevention" },
    { id: "irrigation", label: "Irrigation Run", icon: Droplets, placeholder: "e.g. 40mm canal drip cycle run for 4 hours" },
    { id: "scouting", label: "Field Scouting / Health", icon: Sparkles, placeholder: "e.g. Routine canopy inspection. Zero yellow rust observed" },
    { id: "soil_test", label: "Soil Sampling & Test", icon: ClipboardList, placeholder: "e.g. 5-point composite soil sample sent to KVK lab" },
    { id: "harvest", label: "Harvest Operation", icon: Calendar, placeholder: "e.g. Combine harvester scheduled for 80% siliqua maturity" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
      <div className="w-full max-w-lg rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl my-auto max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center">
              <ClipboardList className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">Log Farm Operation</h3>
              <p className="text-xs text-[var(--text-muted)]">
                Record field inputs, sprays, irrigations, and scouting events
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-ghost p-1.5 rounded-[8px] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
          {/* Field Selection */}
          <div>
            <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Target Field Plot *</label>
            <select
              required
              value={fieldId}
              onChange={(e) => setFieldId(e.target.value)}
              className="form-select text-xs py-2"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.currentCrop} - {f.areaAcres} Acres)
                </option>
              ))}
            </select>
          </div>

          {/* Activity Type Selector */}
          <div>
            <label className="font-semibold block mb-1.5 text-[var(--text-secondary)]">Operation Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {activityPresets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = activityType === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setActivityType(preset.id);
                      if (!title) setTitle(preset.label);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-[8px] border text-[11px] font-medium text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)] shadow-sm"
                        : "bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{preset.label.split("/")[0]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Activity Title */}
          <div>
            <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Activity Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1st Urea Top-Dressing Applied"
              className="form-input text-xs py-2"
            />
          </div>

          {/* Description & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Applied before rain"
                className="form-input text-xs py-2"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Dosage / Rate</label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 45 kg/acre"
                className="form-input text-xs py-2"
              />
            </div>
          </div>

          {/* Operator Name */}
          <div>
            <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Operator / Agronomist Name</label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              placeholder="e.g. Farm Manager"
              className="form-input text-xs py-2"
            />
          </div>

          <div className="pt-2 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs py-2 px-4 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary text-xs py-2 px-4 cursor-pointer font-semibold"
            >
              Save Operation Log
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
