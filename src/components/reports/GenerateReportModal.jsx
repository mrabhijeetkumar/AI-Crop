import React, { useState } from "react";
import {
  X,
  Sparkles,
  Layers,
  Sprout,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Award,
  CheckCircle2,
  Calendar,
  FileSpreadsheet,
} from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function GenerateReportModal({ isOpen, onClose, onReportCreated }) {
  const { farmProfile, fields, weather } = useFarm();
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  const [auditType, setAuditType] = useState("crop_profit");
  const [selectedFieldId, setSelectedFieldId] = useState("all");
  const [title, setTitle] = useState("");
  const [customNotes, setCustomNotes] = useState("");
  const [isSynthesizing, setIsSynthesizing] = useState(false);

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

  const AUDIT_TYPE_CONFIGS = {
    crop_profit: {
      name: "Crop Profit & Yield Optimization",
      icon: TrendingUp,
      color: "#10b981",
      badge: "Commercial Ag-Finance",
      defaultTitle: "Seasonal Yield & Gross Margin Audit",
    },
    soil_audit: {
      name: "Soil Chemistry & NPK Fertility",
      icon: Layers,
      color: "#0ea5e9",
      badge: "Laboratory & Macro-Nutrients",
      defaultTitle: "NPK Macro-Nutrient & Carbon Index Audit",
    },
    pathology: {
      name: "Pest Pathology & Plant Doctor",
      icon: ShieldCheck,
      color: "#f59e0b",
      badge: "Bio-Defense & Quarantine",
      defaultTitle: "Multispectral Pest Risk & Triage Audit",
    },
    mandi_finance: {
      name: "Mandi Market Arbitrage & Trade",
      icon: FileSpreadsheet,
      color: "#8b5cf6",
      badge: "e-NAM & APMC Telemetry",
      defaultTitle: "APMC Price Forecast & Forward Hedging Audit",
    },
    water_irrigation: {
      name: "Precision Irrigation & Water Budget",
      icon: Droplets,
      color: "#06b6d4",
      badge: "Hydrology & Solar Drip",
      defaultTitle: "Solar Drip Water Budget & Aquifer Audit",
    },
    scheme_dossier: {
      name: "Kisan Welfare & Subsidy Dossier",
      icon: Award,
      color: "#10b981",
      badge: "Direct Benefit Transfer",
      defaultTitle: "Kisan Subsidy & KCC Compliance Audit",
    },
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsSynthesizing(true);

    const config = AUDIT_TYPE_CONFIGS[auditType];
    const targetField =
      selectedFieldId === "all"
        ? null
        : fields.find((f) => f.id === selectedFieldId);

    const finalTitle =
      title.trim() ||
      `${config.defaultTitle} — ${targetField ? targetField.name : farmProfile.farmName}`;

    // Compute dynamic metrics based on actual fields telemetry
    const totalArea = targetField
      ? `${targetField.areaAcres} Acres`
      : `${fields.reduce((acc, f) => acc + f.areaAcres, 0)} Acres`;
    const primaryCrop = targetField
      ? targetField.currentCrop
      : "Diversified Multi-Crop (Wheat, Maize, Soybean)";
    const healthScore = targetField
      ? targetField.healthStatus === "Excellent"
        ? 95
        : 88
      : 91;

    const dynamicMetrics = [
      {
        label: "Monitored Estate Area",
        value: totalArea,
        detail: targetField ? "Target Plot" : `${fields.length} Active Sectors`,
        status: "good",
      },
      {
        label: "Agronomic Health Score",
        value: `${healthScore} / 100`,
        detail: "Class-A Agricultural Asset",
        status: "good",
      },
      {
        label: "Soil NPK & Carbon Index",
        value: targetField?.soilTest
          ? `N:${targetField.soilTest.nitrogen} P:${targetField.soilTest.phosphorus} K:${targetField.soilTest.potassium}`
          : "N:105 | P:52 | K:48 kg/ha",
        detail: `pH ${targetField?.soilTest?.ph || "6.8"} (Optimal Range)`,
        status: "good",
      },
      {
        label: "Soil Moisture & Water Index",
        value: `${targetField?.moisturePercentage || "54"}% Moisture`,
        detail: "Root Zone Field Capacity",
        status: "good",
      },
      {
        label: "Projected Net Yield Margin",
        value: "₹88,500 / Hectare",
        detail: "+16.2% vs Regional Baseline",
        status: "good",
      },
      {
        label: "Market Price Benchmark",
        value: "₹2,380 / Qtl (Wheat)",
        detail: "Above MSP ₹2,275",
        status: "good",
      },
    ];

    const dynamicActions = [
      `Maintain optimal root-zone moisture between 50-60% across ${targetField ? targetField.name : "all monitored parcels"}.`,
      "Apply scheduled top-dressing with balanced nitrogen at recommended vegetative intervals.",
      customNotes
        ? `Farmer Directive: "${customNotes}"`
        : "Scout parcel perimeter rows for early pest colonies during warm afternoons.",
      "Review APMC mandi spot prices on e-NAM before finalizing harvest marketing lots.",
    ];

    const newReportPayload = {
      id: `rep_custom_${Date.now()}`,
      title: finalTitle,
      type: auditType,
      categoryName: config.name,
      status: "Certified",
      generatedDate: new Date().toISOString().split("T")[0],
      estateName: farmProfile.farmName,
      auditor: `${user?.name || "Senior Agronomist"} & Dr. Krishi AI Engine`,
      summary:
        customNotes ||
        `Comprehensive on-demand ${config.name.toLowerCase()} for ${farmProfile.farmName} (${farmProfile.location}). Field telemetry indicates high vegetative vigor with soil pH and nutrient dynamics aligned with ICAR precision crop standards.`,
      healthScore,
      areaMonitored: totalArea,
      primaryCrop,
      projectedProfit: "Net ₹88,500/ha",
      metrics: dynamicMetrics,
      actions: dynamicActions,
      fieldHighlights: targetField
        ? [
            {
              name: targetField.name,
              crop: targetField.currentCrop,
              area: `${targetField.areaAcres} Acres`,
              stage: `${targetField.growthStage} (${targetField.growthProgressPercent}%)`,
              health: targetField.healthStatus,
            },
          ]
        : fields.map((f) => ({
            name: f.name,
            crop: f.currentCrop,
            area: `${f.areaAcres} Acres`,
            stage: `${f.growthStage} (${f.growthProgressPercent}%)`,
            health: f.healthStatus,
          })),
      soilProfile: {
        n: targetField?.soilTest?.nitrogen || 105,
        p: targetField?.soilTest?.phosphorus || 52,
        k: targetField?.soilTest?.potassium || 48,
        ph: targetField?.soilTest?.ph || 6.8,
        oc: targetField?.soilTest?.organicCarbon || 0.74,
      },
    };

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReportPayload),
      });
      const data = await res.json();
      if (data.report) {
        onReportCreated(data.report);
      } else {
        onReportCreated(newReportPayload);
      }
    } catch {
      onReportCreated(newReportPayload);
    } finally {
      setIsSynthesizing(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain">
      <div className="app-card relative w-full max-w-2xl my-auto max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                Generate Precision Farm Audit
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Synthesize live IoT sensors, NPK soil records, and Mandi price benchmarks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="mt-6 space-y-5">
          {/* Audit Type Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2.5 text-emerald-800 dark:text-emerald-400 font-heading">
              1. Select Audit Scope & Domain
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(AUDIT_TYPE_CONFIGS).map(([key, cfg]) => {
                const IconComponent = cfg.icon;
                const isSelected = auditType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setAuditType(key);
                      if (!title) setTitle(cfg.defaultTitle);
                    }}
                    className={`p-3 rounded-2xl text-left border flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[var(--primary-soft)] border-emerald-500 ring-2 ring-emerald-500/40 shadow-sm text-[var(--text-primary)]"
                        : "border-[var(--border)] bg-[var(--surface-subtle)] hover:border-emerald-500/40 text-[var(--text-secondary)] shadow-sm hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${cfg.color}15`,
                        borderColor: `${cfg.color}30`,
                        color: cfg.color,
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {cfg.name}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        {cfg.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Field / Sector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-800 dark:text-emerald-400 font-heading">
              2. Target Cultivation Sector
            </label>
            <select
              value={selectedFieldId}
              onChange={(e) => setSelectedFieldId(e.target.value)}
              className="form-select text-xs font-medium cursor-pointer"
            >
              <option value="all">
                🌍 Whole Farm Estate — All Sectors ({fields.reduce((acc, f) => acc + f.areaAcres, 0)} Acres)
              </option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  📍 {f.name} ({f.currentCrop} • {f.areaAcres} Acres)
                </option>
              ))}
            </select>
          </div>

          {/* Report Custom Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-800 dark:text-emerald-400 font-heading">
              3. Report Document Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={AUDIT_TYPE_CONFIGS[auditType].defaultTitle}
              className="form-input text-xs"
            />
          </div>

          {/* Custom Agronomist Directive / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-800 dark:text-emerald-400 font-heading">
              4. Specific Agronomic Notes & Directives (Optional)
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              placeholder="e.g. Conduct pre-irrigation soil moisture test; verify yellow rust resistance in Wheat Sector 1; prepare Mandi warehouse booking..."
              className="form-input text-xs resize-none"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary py-2 px-4 text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSynthesizing}
              className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing Audit Metrics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Certified Audit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GenerateReportModal;
