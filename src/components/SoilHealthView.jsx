import React, { useState, useMemo, useEffect } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { CROPS_CATALOG } from "../data/cropsData.js";
import { SOIL_TYPES } from "../data/soilTypes.js";
import { calculateFertilizerDose } from "../utils/calculations.js";
import { getCropEmoji } from "../utils/formatters.js";

// Specialized Soil Sub-components
import { SoilHealthOverviewCards } from "./soil/SoilHealthOverviewCards.jsx";
import { SoilNPKSliders } from "./soil/SoilNPKSliders.jsx";
import { SoilFertilizerCalculator } from "./soil/SoilFertilizerCalculator.jsx";
import { SoilAIAuditPanel } from "./soil/SoilAIAuditPanel.jsx";
import { SoilRemediationPlanner } from "./soil/SoilRemediationPlanner.jsx";
import { SoilHistoryTimeline } from "./soil/SoilHistoryTimeline.jsx";
import { SoilTextureSelector } from "./soil/SoilTextureSelector.jsx";
import { SoilHealthCardModal } from "./soil/SoilHealthCardModal.jsx";

import {
  Sparkles,
  FlaskConical,
  Calculator,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Award,
  Layers,
  Leaf,
  History,
  Activity,
  Printer,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
} from "lucide-react";

export function SoilHealthView() {
  const { fields, updateField, logFieldActivity, addNotification, farmProfile } = useFarm();
  const { isDarkMode } = useTheme();

  // Active Tab state
  const [activeTab, setActiveTab] = useState("overview");

  // Selected Field
  const [selectedFieldId, setSelectedFieldId] = useState(() => fields[0]?.id || "fld_01");
  const currentField = fields.find((f) => f.id === selectedFieldId) || fields[0] || {
    id: "fld_01",
    name: "North Plot A",
    areaAcres: 14.5,
    currentCrop: "Wheat (HD-2967)",
    soilType: "alluvial",
    soilTest: {
      nitrogen: 105,
      phosphorus: 52,
      potassium: 48,
      ph: 6.8,
      organicCarbon: 0.74,
      testDate: "2025-10-28",
    },
  };

  // Editable test parameters
  const [soilN, setSoilN] = useState(currentField?.soilTest?.nitrogen || 105);
  const [soilP, setSoilP] = useState(currentField?.soilTest?.phosphorus || 52);
  const [soilK, setSoilK] = useState(currentField?.soilTest?.potassium || 48);
  const [soilPH, setSoilPH] = useState(currentField?.soilTest?.ph || 6.8);
  const [organicCarbon, setOrganicCarbon] = useState(currentField?.soilTest?.organicCarbon || 0.74);
  const [ec, setEc] = useState(0.65);
  const [sulfur, setSulfur] = useState(14);
  const [zinc, setZinc] = useState(0.85);
  const [iron, setIron] = useState(6.5);
  const [boron, setBoron] = useState(0.65);

  // Target Crop & Acreage for Fertilizer Engine
  const [targetCropId, setTargetCropId] = useState("wheat");
  const [calcAcres, setCalcAcres] = useState(currentField?.areaAcres || 14.5);

  // Modal State
  const [showHealthCardModal, setShowHealthCardModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState(null);

  // Synchronize inputs when selected field changes
  useEffect(() => {
    if (currentField && currentField.soilTest) {
      setSoilN(currentField.soilTest.nitrogen || 105);
      setSoilP(currentField.soilTest.phosphorus || 52);
      setSoilK(currentField.soilTest.potassium || 48);
      setSoilPH(currentField.soilTest.ph || 6.8);
      setOrganicCarbon(currentField.soilTest.organicCarbon || 0.74);
      setCalcAcres(currentField.areaAcres || 14.5);
    }
  }, [selectedFieldId]);

  const targetCrop = CROPS_CATALOG.find((c) => c.id === targetCropId) || CROPS_CATALOG[0];

  // Compute exact fertilizer dose
  const fertPlan = useMemo(() => {
    return calculateFertilizerDose(calcAcres, soilN, soilP, soilK, targetCrop);
  }, [calcAcres, soilN, soilP, soilK, targetCrop]);

  // Overall Soil Health Score calculation (0-100)
  const soilHealthScore = useMemo(() => {
    let score = 72;
    if (soilN >= 90 && soilN <= 140) score += 7;
    else score -= Math.abs(soilN - 115) * 0.1;

    if (soilP >= 35 && soilP <= 65) score += 7;
    else score -= Math.abs(soilP - 50) * 0.12;

    if (soilK >= 35 && soilK <= 65) score += 7;
    else score -= Math.abs(soilK - 50) * 0.12;

    const phDeviation = Math.abs(soilPH - 6.8);
    score -= phDeviation * 10;

    score += Math.min(organicCarbon, 1.2) * 14;

    if (zinc >= 0.6) score += 2;
    if (sulfur >= 10) score += 2;

    return Math.max(35, Math.min(98, Math.round(score)));
  }, [soilN, soilP, soilK, soilPH, organicCarbon, zinc, sulfur]);

  const handleFieldChange = (fId) => {
    setSelectedFieldId(fId);
  };

  const handleResetToField = () => {
    if (currentField?.soilTest) {
      setSoilN(currentField.soilTest.nitrogen || 105);
      setSoilP(currentField.soilTest.phosphorus || 52);
      setSoilK(currentField.soilTest.potassium || 48);
      setSoilPH(currentField.soilTest.ph || 6.8);
      setOrganicCarbon(currentField.soilTest.organicCarbon || 0.74);
      setCalcAcres(currentField.areaAcres || 14.5);
    }
  };

  const handleSaveToField = async () => {
    setIsSaving(true);
    try {
      const updatedSoilTest = {
        nitrogen: soilN,
        phosphorus: soilP,
        potassium: soilK,
        ph: soilPH,
        organicCarbon,
        testDate: new Date().toISOString().split("T")[0],
      };

      updateField(selectedFieldId, {
        soilTest: updatedSoilTest,
      });

      if (logFieldActivity) {
        logFieldActivity(
          selectedFieldId,
          "Soil Health Calibration",
          `Updated laboratory test (N:${soilN}, P:${soilP}, K:${soilK}, pH:${soilPH.toFixed(1)}, OC:${organicCarbon.toFixed(2)}%)`
        );
      }

      if (addNotification) {
        addNotification({
          title: "Soil Test Saved",
          message: `Soil diagnostic parameters updated for ${currentField.name}.`,
          type: "success",
        });
      }

      setSaveSuccess(true);
      setSaveSuccessMessage(`Soil test values successfully synchronized to ${currentField.name}!`);
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveSuccessMessage(null);
      }, 4000);
    } catch (err) {
      console.error("Save soil test error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleApplySoilDefaults = (soilTypeObj) => {
    setSoilN(soilTypeObj.defaultN);
    setSoilP(soilTypeObj.defaultP);
    setSoilK(soilTypeObj.defaultK);
    setSoilPH(soilTypeObj.defaultPH);
    setOrganicCarbon(0.70);
    updateField(selectedFieldId, {
      soilType: soilTypeObj.id,
    });
    setSaveSuccessMessage(`Applied ${soilTypeObj.name} pedological defaults to ${currentField.name}!`);
    setTimeout(() => setSaveSuccessMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-16 w-full animate-in fade-in duration-200">
      {/* Toast Banner */}
      {saveSuccessMessage && (
        <div className="p-3.5 rounded-[12px] bg-[var(--surface-strong)] border border-[var(--border-strong)] text-[var(--text-primary)] text-xs font-semibold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)]" />
            <span>{saveSuccessMessage}</span>
          </div>
          <button
            onClick={() => setSaveSuccessMessage(null)}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Header Banner with Parcel Picker */}
      <div className="app-card p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 flex items-center gap-1.5 font-mono">
                <FlaskConical className="w-3.5 h-3.5" />
                Soil Lab &amp; Agronomy Suite
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                {farmProfile.location || "Punjab, India"}
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
              Soil Health Index &amp; Precision Agronomy Hub
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
              Real-time laboratory probe calibration, ICAR-standard Soil Health Cards, exact bag-level fertilizer schedules (DAP, Urea, MOP), and AI agronomic soil reclamation protocols.
            </p>
          </div>

          {/* Parcel Switcher & Quick Export */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={selectedFieldId}
              onChange={(e) => handleFieldChange(e.target.value)}
              className="form-select text-xs py-2 font-medium"
            >
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {getCropEmoji(f.currentCrop)} {f.name} ({f.areaAcres}A • {f.soilType?.toUpperCase()})
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowHealthCardModal(true)}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer font-semibold"
              title="View & Print Official Soil Health Card"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Soil Health Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-[10px] border border-[var(--border)] overflow-x-auto">
        <button
          onClick={() => setActiveTab("overview")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "overview"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>NPK &amp; Health Meter</span>
        </button>

        <button
          onClick={() => setActiveTab("fertilizer")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "fertilizer"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Fertilizer Calculator</span>
        </button>

        <button
          onClick={() => setActiveTab("ai_audit")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "ai_audit"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Agronomic Audit</span>
        </button>

        <button
          onClick={() => setActiveTab("remediation")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "remediation"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Leaf className="w-3.5 h-3.5" />
          <span>Soil Remediation</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>History &amp; Trends</span>
        </button>

        <button
          onClick={() => setActiveTab("texture")}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[6px] text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "texture"
              ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Soil Classification</span>
        </button>
      </div>

      {/* Dynamic Tab Body */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Top Score & Diagnostic Overview Cards */}
          <SoilHealthOverviewCards
            soilN={soilN}
            soilP={soilP}
            soilK={soilK}
            soilPH={soilPH}
            organicCarbon={organicCarbon}
            ec={ec}
            soilHealthScore={soilHealthScore}
            currentField={currentField}
            onSaveToField={handleSaveToField}
            onOpenHealthCard={() => setShowHealthCardModal(true)}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
          />

          {/* Interactive NPK Precision Diagnostic Sliders */}
          <SoilNPKSliders
            soilN={soilN}
            setSoilN={setSoilN}
            soilP={soilP}
            setSoilP={setSoilP}
            soilK={soilK}
            setSoilK={setSoilK}
            soilPH={soilPH}
            setSoilPH={setSoilPH}
            organicCarbon={organicCarbon}
            setOrganicCarbon={setOrganicCarbon}
            ec={ec}
            setEc={setEc}
            sulfur={sulfur}
            setSulfur={setSulfur}
            zinc={zinc}
            setZinc={setZinc}
            iron={iron}
            setIron={setIron}
            boron={boron}
            setBoron={setBoron}
            onResetToField={handleResetToField}
            onSaveToField={handleSaveToField}
            currentFieldName={currentField?.name}
          />
        </div>
      )}

      {activeTab === "fertilizer" && (
        <SoilFertilizerCalculator
          calcAcres={calcAcres}
          setCalcAcres={setCalcAcres}
          targetCropId={targetCropId}
          setTargetCropId={setTargetCropId}
          fertPlan={fertPlan}
          soilN={soilN}
          soilP={soilP}
          soilK={soilK}
          currentField={currentField}
          onLogFertilizerActivity={() => {
            if (logFieldActivity) {
              logFieldActivity(
                selectedFieldId,
                "Fertilizer Top-Dressing",
                `Applied ${fertPlan.ureaBags} bags Urea, ${fertPlan.dapBags} bags DAP, and ${fertPlan.mopBags} bags MOP.`
              );
            }
            if (addNotification) {
              addNotification({
                title: "Fertilizer Logged",
                message: `Fertilizer application recorded for ${currentField.name}.`,
                type: "success",
              });
            }
            setSaveSuccessMessage(`Recorded fertilizer task in farm log for ${currentField.name}!`);
            setTimeout(() => setSaveSuccessMessage(null), 3500);
          }}
        />
      )}

      {activeTab === "ai_audit" && (
        <SoilAIAuditPanel
          soilN={soilN}
          soilP={soilP}
          soilK={soilK}
          soilPH={soilPH}
          organicCarbon={organicCarbon}
          zinc={zinc}
          sulfur={sulfur}
          currentField={currentField}
          targetCrop={targetCrop}
        />
      )}

      {activeTab === "remediation" && (
        <SoilRemediationPlanner
          soilPH={soilPH}
          organicCarbon={organicCarbon}
          soilType={currentField?.soilType}
          currentField={currentField}
        />
      )}

      {activeTab === "history" && (
        <SoilHistoryTimeline
          currentField={currentField}
          fields={fields}
        />
      )}

      {activeTab === "texture" && (
        <SoilTextureSelector
          currentSoilTypeId={currentField?.soilType || "alluvial"}
          onApplySoilDefaults={handleApplySoilDefaults}
          currentFieldName={currentField?.name}
        />
      )}

      {/* Official Soil Health Card Modal */}
      {showHealthCardModal && (
        <SoilHealthCardModal
          currentField={currentField}
          soilN={soilN}
          soilP={soilP}
          soilK={soilK}
          soilPH={soilPH}
          organicCarbon={organicCarbon}
          ec={ec}
          sulfur={sulfur}
          zinc={zinc}
          iron={iron}
          boron={boron}
          soilHealthScore={soilHealthScore}
          onClose={() => setShowHealthCardModal(false)}
        />
      )}
    </div>
  );
}
