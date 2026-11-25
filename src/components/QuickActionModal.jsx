import React, { useState } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { SOIL_TYPES } from "../data/soilTypes.js";
import { CROPS_CATALOG } from "../data/cropsData.js";
import {
  X,
  Plus,
  Layers,
  Sprout,
  CheckCircle2,
  Calendar,
  Sparkles,
} from "lucide-react";

export function QuickActionModal() {
  const {
    quickActionOpen,
    setQuickActionOpen,
    quickActionType,
    addField,
    fields,
    updateField,
    addNotification,
    setActiveTab,
  } = useFarm();

  const [activeTabType, setActiveTabType] = useState(
    quickActionType || "field"
  );

  // Field Form State
  const [fieldName, setFieldName] = useState("");
  const [fieldArea, setFieldArea] = useState(4.5);
  const [fieldSoil, setFieldSoil] = useState("alluvial");
  const [fieldCrop, setFieldCrop] = useState("Wheat (HD-2967)");
  const [fieldIrrigation, setFieldIrrigation] = useState("Solar Drip & Tube Canal");

  // Soil Form State
  const [selectedFieldForSoil, setSelectedFieldForSoil] = useState(fields[0]?.id || "");
  const [quickN, setQuickN] = useState(110);
  const [quickP, setQuickP] = useState(55);
  const [quickK, setQuickK] = useState(50);
  const [quickPH, setQuickPH] = useState(6.9);
  const [quickOC, setQuickOC] = useState(0.72);

  // Task / Advisory Form State
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("Task");
  const [taskNote, setTaskNote] = useState("");

  React.useEffect(() => {
    if (quickActionOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [quickActionOpen]);

  if (!quickActionOpen) return null;

  const handleClose = () => {
    setQuickActionOpen(false);
  };

  const handleAddFieldSubmit = (e) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    addField({
      name: fieldName.trim(),
      areaAcres: Number(fieldArea) || 1,
      soilType: fieldSoil,
      currentCrop: fieldCrop,
      variety: fieldCrop,
      growthStage: "Vegetative / Tillering",
      growthProgressPercent: 30,
      sowingDate: new Date().toISOString().split("T")[0],
      expectedHarvestDate: new Date(Date.now() + 110 * 24 * 3600 * 1000).toISOString().split("T")[0],
      healthStatus: "Good",
      irrigationSource: fieldIrrigation,
      moisturePercentage: 55,
      ndviIndex: 0.78,
      lastFertilized: new Date().toISOString().split("T")[0],
      lastIrrigated: new Date().toISOString().split("T")[0],
      notes: "Newly mapped farm sector under active monitoring.",
      soilTest: {
        nitrogen: 100,
        phosphorus: 50,
        potassium: 45,
        ph: 6.8,
        organicCarbon: 0.7,
        testDate: new Date().toISOString().split("T")[0],
      },
    });

    handleClose();
    setActiveTab("farm_fields");
  };

  const handleSaveSoilSubmit = (e) => {
    e.preventDefault();
    if (!selectedFieldForSoil) return;

    updateField(selectedFieldForSoil, {
      soilTest: {
        nitrogen: Number(quickN),
        phosphorus: Number(quickP),
        potassium: Number(quickK),
        ph: Number(quickPH),
        organicCarbon: Number(quickOC),
        testDate: new Date().toISOString().split("T")[0],
      },
    });

    addNotification({
      title: "Soil Test Logged",
      message: `Updated NPK (${quickN}-${quickP}-${quickK}) & pH ${quickPH} for field.`,
      type: "success",
      category: "Soil",
      actionTab: "soil_health",
    });

    handleClose();
    setActiveTab("soil_health");
  };

  const handleAddTaskSubmit = (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addNotification({
      title: taskTitle.trim(),
      message: taskNote.trim() || "Reminder recorded for farm schedule.",
      type: "info",
      category: taskCategory,
      actionTab: taskCategory === "Soil" ? "soil_health" : taskCategory === "Disease" ? "disease_diagnosis" : "dashboard",
    });

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
      <div className="app-card w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95 duration-150 my-auto max-h-[92vh] overflow-y-auto custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] border border-[var(--border-strong)] text-[var(--primary)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">Quick Farm Action</h3>
              <p className="text-xs text-[var(--text-muted)]">Map plots, record soil lab tests, or set agronomy alerts</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-3 gap-1 mt-4 p-1 rounded-xl bg-[var(--surface-subtle)] border border-[var(--border)]">
          <button
            onClick={() => setActiveTabType("field")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTabType === "field"
                ? "bg-[var(--surface-card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>Add Plot</span>
          </button>
          <button
            onClick={() => setActiveTabType("soil")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTabType === "soil"
                ? "bg-[var(--surface-card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Soil Test</span>
          </button>
          <button
            onClick={() => setActiveTabType("task")}
            className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTabType === "task"
                ? "bg-[var(--surface-card)] text-[var(--primary)] font-bold shadow-sm border border-[var(--border)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Set Reminder</span>
          </button>
        </div>

        {/* Form 1: Add Plot */}
        {activeTabType === "field" && (
          <form onSubmit={handleAddFieldSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Plot Name / Sector</label>
              <input
                type="text"
                required
                placeholder="e.g. Sector D - East Canal Plot"
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cultivated Area (Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={fieldArea}
                  onChange={(e) => setFieldArea(Number(e.target.value))}
                  className="form-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Soil Classification</label>
                <select
                  value={fieldSoil}
                  onChange={(e) => setFieldSoil(e.target.value)}
                  className="form-select text-xs font-medium cursor-pointer"
                >
                  {SOIL_TYPES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Sown Crop</label>
                <select
                  value={fieldCrop}
                  onChange={(e) => setFieldCrop(e.target.value)}
                  className="form-select text-xs font-medium cursor-pointer"
                >
                  {CROPS_CATALOG.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Irrigation System</label>
                <select
                  value={fieldIrrigation}
                  onChange={(e) => setFieldIrrigation(e.target.value)}
                  className="form-select text-xs font-medium cursor-pointer"
                >
                  <option value="Solar Drip & Tube Canal">Solar Drip & Canal</option>
                  <option value="Tubewell / Borewell">Tubewell / Borewell</option>
                  <option value="Micro-Sprinkler System">Micro-Sprinkler</option>
                  <option value="Rainfed (Monsoon Dependent)">Rainfed</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary py-2 px-4 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save & Map Field</span>
              </button>
            </div>
          </form>
        )}

        {/* Form 2: Soil Test */}
        {activeTabType === "soil" && (
          <form onSubmit={handleSaveSoilSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Assign to Field Plot</label>
              <select
                value={selectedFieldForSoil}
                onChange={(e) => setSelectedFieldForSoil(e.target.value)}
                className="form-select text-xs font-medium cursor-pointer"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.areaAcres} Acres - {f.currentCrop})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Nitrogen (N) kg/ha</label>
                <input
                  type="number"
                  value={quickN}
                  onChange={(e) => setQuickN(Number(e.target.value))}
                  className="form-input text-xs font-mono py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Phosphorus (P) kg/ha</label>
                <input
                  type="number"
                  value={quickP}
                  onChange={(e) => setQuickP(Number(e.target.value))}
                  className="form-input text-xs font-mono py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Potassium (K) kg/ha</label>
                <input
                  type="number"
                  value={quickK}
                  onChange={(e) => setQuickK(Number(e.target.value))}
                  className="form-input text-xs font-mono py-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Soil pH Level</label>
                <input
                  type="number"
                  step="0.1"
                  value={quickPH}
                  onChange={(e) => setQuickPH(Number(e.target.value))}
                  className="form-input text-xs font-mono py-1.5"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-1">Organic Carbon (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={quickOC}
                  onChange={(e) => setQuickOC(Number(e.target.value))}
                  className="form-input text-xs font-mono py-1.5"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary py-2 px-4 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Save Soil Health Test</span>
              </button>
            </div>
          </form>
        )}

        {/* Form 3: Add Task / Reminder */}
        {activeTabType === "task" && (
          <form onSubmit={handleAddTaskSubmit} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reminder Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Apply 2nd Urea Split in Sector A"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="form-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Alert Category</label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value)}
                className="form-select text-xs font-medium cursor-pointer"
              >
                <option value="Task">Agricultural Task / Sowing</option>
                <option value="Disease">Pest / Pathology Scouting</option>
                <option value="Soil">Fertilizer / NPK Top Dressing</option>
                <option value="Weather">Irrigation & Microclimate</option>
                <option value="Market">Mandi Sale Strategy</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Details & Agronomic Notes</label>
              <textarea
                rows={2}
                placeholder="Dosage, water conditions, or specific lot details..."
                value={taskNote}
                onChange={(e) => setTaskNote(e.target.value)}
                className="form-input text-xs resize-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary py-2 px-4 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Advisory Alert</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default QuickActionModal;
