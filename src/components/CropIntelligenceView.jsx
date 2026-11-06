import React, { useState, useMemo } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { FULL_CROPS_INTELLIGENCE_CATALOG } from "../data/cropIntelligenceData.js";
import { calculatePrecisionCropSuitability } from "../utils/cropIntelligenceEngine.js";
import { CropHeaderControls } from "./crop/CropHeaderControls.jsx";
import { CropSuitabilityGrid } from "./crop/CropSuitabilityGrid.jsx";
import { CropRotationPlanner } from "./crop/CropRotationPlanner.jsx";
import { CropLifecycleCalendar } from "./crop/CropLifecycleCalendar.jsx";
import { CropIpmDefenseMatrix } from "./crop/CropIpmDefenseMatrix.jsx";
import { CropComparisonDeck } from "./crop/CropComparisonDeck.jsx";
import { CropAgronomyBlueprintModal } from "./crop/CropAgronomyBlueprintModal.jsx";
import {
  Sparkles,
  Layers,
  RotateCcw,
  Calendar,
  ShieldCheck,
  Scale,
  TrendingUp,
} from "lucide-react";

export function CropIntelligenceView() {
  const { farmProfile, setActiveTab } = useFarm();
  const { isDarkMode } = useTheme();

  // Active Sub-Tab
  const [activeSubTab, setActiveSubTab] = useState("suitability");

  // Soil & Environmental Simulation Parameters
  const [soilParams, setSoilParams] = useState({
    soilType: "alluvial",
    soilN: 105,
    soilP: 52,
    soilK: 48,
    soilPH: 6.8,
    organicCarbon: 0.65,
    ec: 0.45,
    waterAvailability: "Moderate (Borewell/Sprinkler)",
  });

  const [climateParams, setClimateParams] = useState({
    season: "Rabi",
    temperature: 24,
    rainfall: 120,
  });

  // Selected Modal Blueprint & Compare Deck
  const [blueprintModalData, setBlueprintModalData] = useState(null);
  const [isBlueprintModalOpen, setIsBlueprintModalOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Reset to default agro-climatic baseline
  const handleResetDefaults = () => {
    setSoilParams({
      soilType: "alluvial",
      soilN: 105,
      soilP: 52,
      soilK: 48,
      soilPH: 6.8,
      organicCarbon: 0.65,
      ec: 0.45,
      waterAvailability: "Moderate (Borewell/Sprinkler)",
    });
    setClimateParams({
      season: "Rabi",
      temperature: 24,
      rainfall: 120,
    });
  };

  // Sync with selected user farm field
  const handleSyncFarmField = (field) => {
    if (!field) return;
    setSoilParams((prev) => ({
      ...prev,
      soilType: field.soilType || prev.soilType,
      soilPH: field.soilPh || prev.soilPH,
      soilN: field.soilN || prev.soilN,
      soilP: field.soilP || prev.soilP,
      soilK: field.soilK || prev.soilK,
    }));
  };

  // Real-time reactive calculation across all 22 major crops
  const evaluations = useMemo(() => {
    return FULL_CROPS_INTELLIGENCE_CATALOG.map((crop) =>
      calculatePrecisionCropSuitability(crop, soilParams, climateParams)
    );
  }, [soilParams, climateParams]);

  // Lookup map for fast evaluation retrieval in comparison deck
  const evaluationsMap = useMemo(() => {
    const map = {};
    evaluations.forEach((ev) => {
      map[ev.crop.id] = ev;
    });
    return map;
  }, [evaluations]);

  // Toggle Crop Comparison
  const handleToggleCompare = (crop) => {
    if (compareList.some((c) => c.id === crop.id)) {
      setCompareList(compareList.filter((c) => c.id !== crop.id));
    } else {
      if (compareList.length >= 4) {
        setCompareList([...compareList.slice(1), crop]);
      } else {
        setCompareList([...compareList, crop]);
      }
    }
  };

  const handleRemoveFromCompare = (cropId) => {
    setCompareList(compareList.filter((c) => c.id !== cropId));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  // Open Blueprint Modal
  const handleOpenBlueprint = (evalData) => {
    setBlueprintModalData(evalData);
    setIsBlueprintModalOpen(true);
  };

  const navTabs = [
    {
      id: "suitability",
      label: "AI Crop Match Engine",
      icon: Sparkles,
      badge: `${evaluations.length} Crops`,
    },
    {
      id: "rotation",
      label: "3-Season Rotation & Synergy",
      icon: RotateCcw,
      badge: "Regenerative",
    },
    {
      id: "lifecycle",
      label: "5-Stage Growth & Water",
      icon: Calendar,
      badge: "Phenology",
    },
    {
      id: "ipm",
      label: "Bio-Defense & IPM Hub",
      icon: ShieldCheck,
      badge: "ETL Defense",
    },
    {
      id: "compare",
      label: `Comparison Deck (${compareList.length})`,
      icon: Scale,
      badge: compareList.length > 0 ? `${compareList.length} Active` : null,
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Agro-Climatic Header & Input Simulator */}
      <CropHeaderControls
        soilParams={soilParams}
        setSoilParams={setSoilParams}
        climateParams={climateParams}
        setClimateParams={setClimateParams}
        onResetDefaults={handleResetDefaults}
        onSyncFarmField={handleSyncFarmField}
        farmFields={farmProfile?.fields || []}
        isDarkMode={isDarkMode}
      />

      {/* Sub-Navigation Suite Tabs */}
      <div
        className="flex items-center gap-1.5 p-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] overflow-x-auto scrollbar-none shadow-sm transition-colors"
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Sub-Tab Views */}
      {activeSubTab === "suitability" && (
        <CropSuitabilityGrid
          evaluations={evaluations}
          compareList={compareList}
          onToggleCompare={handleToggleCompare}
          onOpenBlueprint={handleOpenBlueprint}
          onNavigateToProfitRisk={() => setActiveTab("profit_risk")}
          isDarkMode={isDarkMode}
        />
      )}

      {activeSubTab === "rotation" && (
        <CropRotationPlanner
          isDarkMode={isDarkMode}
          onOpenBlueprint={handleOpenBlueprint}
        />
      )}

      {activeSubTab === "lifecycle" && (
        <CropLifecycleCalendar
          isDarkMode={isDarkMode}
          onOpenBlueprint={handleOpenBlueprint}
        />
      )}

      {activeSubTab === "ipm" && (
        <CropIpmDefenseMatrix isDarkMode={isDarkMode} />
      )}

      {activeSubTab === "compare" && (
        <CropComparisonDeck
          compareList={compareList}
          onRemoveFromCompare={handleRemoveFromCompare}
          onClearCompare={handleClearCompare}
          onOpenBlueprint={handleOpenBlueprint}
          evaluationsMap={evaluationsMap}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Full-Screen In-Depth Agronomy Blueprint Modal */}
      <CropAgronomyBlueprintModal
        isOpen={isBlueprintModalOpen}
        onClose={() => setIsBlueprintModalOpen(false)}
        evaluationData={blueprintModalData}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
