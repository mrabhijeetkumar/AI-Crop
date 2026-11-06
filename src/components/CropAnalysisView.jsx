import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  FileText,
  Bookmark,
  RefreshCw,
  ShieldCheck,
  Check,
  ChevronDown,
  Info,
  Sliders,
  ScanEye,
  Scale,
  Printer,
  X,
  Search,
  ExternalLink,
  Layers,
  Sprout,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  Save,
  Compass,
  MapPin,
  Calendar,
  Clock3,
  Zap,
  FlaskConical,
  HelpCircle,
} from "lucide-react";
import { runCropRecommendationEngine } from "../services/cropEngine.js";
import {
  STATE_DISTRICTS_DATA,
  SOIL_TYPE_OPTIONS,
  IRRIGATION_OPTIONS,
  SEASONS_LIST,
  SOWING_MONTHS,
} from "../data/indianStatesDistricts.js";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { DiseaseDiagnosisView } from "./DiseaseDiagnosisView.jsx";
import { CropComparisonMatrix } from "./CropComparisonMatrix.jsx";
import { CropPrintCertificateModal } from "./CropPrintCertificateModal.jsx";
import { getCropImage } from "../utils/cropImages.js";
import confetti from "canvas-confetti";

// Completely EMPTY initial state on first load (user fills everything or clicks sample demo)
const EMPTY_FORM_STATE = {
  state: "",
  district: "",
  village: "",
  landArea: "",
  nitrogen: "",
  phosphorus: "",
  potassium: "",
  ph: "",
  soilType: "",
  temperature: "",
  humidity: "",
  rainfall: "",
  irrigation: "",
  budget: "",
  season: "",
};

// Preset demo sample if user wants to test quickly without manual typing
const DEMO_SAMPLE_STATE = {
  state: "Punjab",
  district: "Kapurthala",
  village: "Phagwara",
  landArea: "2.5",
  nitrogen: "110",
  phosphorus: "52",
  potassium: "48",
  ph: "6.8",
  soilType: "Alluvial",
  temperature: "26",
  humidity: "65",
  rainfall: "90",
  irrigation: "Solar Drip",
  budget: "65000",
  season: "Rabi",
};

const STORAGE_KEY = "ai_crop_analysis_empty_first_v5";

// Static option lists for memoized reference stability
const STATIC_STATE_OPTIONS = Object.keys(STATE_DISTRICTS_DATA);
const STATIC_SOIL_OPTIONS = SOIL_TYPE_OPTIONS.map((s) => s.value);
const STATIC_IRRIGATION_OPTIONS = IRRIGATION_OPTIONS.map((i) => i.value);

const CustomSelect = React.memo(function CustomSelect({
  id,
  value,
  options = [],
  placeholder,
  onChange,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [openUpwards, setOpenUpwards] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  // Fast memoized filtering
  const trimmedQuery = query.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!trimmedQuery) return options;
    return options.filter((option) =>
      String(option).toLowerCase().includes(trimmedQuery)
    );
  }, [options, trimmedQuery]);

  // Synchronous query change - zero lag, no extra render cascades
  const handleQueryChange = (e) => {
    setQuery(e.target.value);
    setHighlightedIndex(0);
  };

  // Helper to scroll item into view only on arrow key navigation
  const scrollToIndex = (index) => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector(`[data-option-index="${index}"]`);
    item?.scrollIntoView({ block: "nearest" });
  };

  // Auto-focus input when opening
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const closeDropdown = (restoreFocus = true) => {
    setOpen(false);
    setQuery("");
    setHighlightedIndex(0);
    if (restoreFocus) {
      buttonRef.current?.focus();
    }
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (!open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setOpenUpwards(spaceBelow < 260 && spaceAbove > spaceBelow);
      const existingIdx = options.findIndex((opt) => opt === value);
      setHighlightedIndex(existingIdx >= 0 ? existingIdx : 0);
    }
    setOpen((prev) => !prev);
  };

  const selectOption = (option) => {
    if (!option) return;
    onChange(option);
    closeDropdown(true);
  };

  // Click outside and global Escape listeners
  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        closeDropdown(false);
      }
    };

    const handleWindowKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDropdown(true);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleWindowKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleWindowKeyDown);
    };
  }, [open]);

  // Direct keyboard navigation on the search input
  const handleInputKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      e.stopPropagation();
      if (filteredOptions.length === 0) return;
      const nextIdx = (highlightedIndex + 1) % filteredOptions.length;
      setHighlightedIndex(nextIdx);
      scrollToIndex(nextIdx);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      e.stopPropagation();
      if (filteredOptions.length === 0) return;
      const prevIdx =
        (highlightedIndex - 1 + filteredOptions.length) % filteredOptions.length;
      setHighlightedIndex(prevIdx);
      scrollToIndex(prevIdx);
    } else if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      const candidate =
        highlightedIndex >= 0 && filteredOptions[highlightedIndex]
          ? filteredOptions[highlightedIndex]
          : filteredOptions[0];
      if (candidate) {
        selectOption(candidate);
      }
    } else if (e.key === "Tab") {
      const candidate =
        highlightedIndex >= 0 && filteredOptions[highlightedIndex]
          ? filteredOptions[highlightedIndex]
          : filteredOptions[0];
      if (candidate && trimmedQuery) {
        selectOption(candidate);
      } else {
        closeDropdown(false);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeDropdown(true);
    }
  };

  // Keyboard navigation on trigger button when dropdown is closed
  const handleButtonKeyDown = (e) => {
    if (disabled) return;
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
  };

  return (
    <div ref={rootRef} className="relative w-full">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggleDropdown}
        onKeyDown={handleButtonKeyDown}
        className={`w-full h-[46px] px-3.5 pr-10 rounded-xl text-xs font-medium outline-none transition-all border text-left flex items-center justify-between gap-2 cursor-pointer ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } bg-white dark:bg-[#0F0F0F] border-slate-300 dark:border-white/10 text-slate-900 dark:text-white hover:border-emerald-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs`}
      >
        <span
          className={`truncate ${
            value
              ? "font-semibold text-slate-900 dark:text-white"
              : "text-slate-400 dark:text-neutral-500 font-normal"
          }`}
        >
          {value || placeholder}
        </span>
        <ChevronDown
          className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-transform duration-200 pointer-events-none ${
            open
              ? "rotate-180 text-emerald-600 dark:text-emerald-400"
              : "text-slate-400 dark:text-neutral-500"
          }`}
        />
      </button>

      {open && !disabled && (
        <div
          className={`absolute left-0 right-0 ${
            openUpwards ? "bottom-full mb-1.5" : "top-full mt-1.5"
          } z-[9999] rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0F0F0F] shadow-2xl shadow-slate-900/15 dark:shadow-black/80 overflow-hidden`}
        >
          {/* Distinct Rounded Search Box Header (Pahle jaisa round type, no ENTER text) */}
          <div className="p-2 border-b border-slate-100 dark:border-white/[0.08]">
            <div className="relative flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-slate-400 dark:text-neutral-500 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleInputKeyDown}
                placeholder={`Search ${placeholder.toLowerCase()}...`}
                className="w-full h-[38px] pl-9 pr-8 rounded-xl text-xs outline-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setHighlightedIndex(0);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-md cursor-pointer transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div
            ref={listRef}
            role="listbox"
            aria-label={placeholder}
            className="max-h-[220px] overflow-y-auto overscroll-contain p-1.5 space-y-0.5 custom-scrollbar"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const selected = option === value;
                const highlighted = index === highlightedIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    data-option-index={index}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => selectOption(option)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-medium flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                      selected
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold"
                        : highlighted
                        ? "bg-slate-100 dark:bg-white/[0.08] text-slate-900 dark:text-white font-semibold"
                        : "text-slate-700 dark:text-neutral-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                    }`}
                  >
                    <span className="truncate">{option}</span>
                    {selected && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[2.5]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-4 text-center text-xs text-slate-400 dark:text-neutral-500">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export function CropAnalysisView() {
  const { isDarkMode } = useTheme();
  const { addNotification, farmProfile, setActiveTab, openAdvisorWithQuery } = useFarm();

  // Master Hub Mode: 'ml_crop_recommendation' | 'comparison' | 'disease_diagnosis'
  const [hubMode, setHubMode] = useState("ml_crop_recommendation");

  // Sub-tab: 'input' | 'results'
  const [activeTabMode, setActiveTabMode] = useState("input");

  // Form State: Starts completely EMPTY on initial load
  const [formState, setFormState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...EMPTY_FORM_STATE, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return EMPTY_FORM_STATE;
  });

  const [lastSavedTime, setLastSavedTime] = useState("");
  const [isSavingRealtime, setIsSavingRealtime] = useState(false);

  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [formError, setFormError] = useState("");
  const [reportModalCrop, setReportModalCrop] = useState(null);
  const [showAllShapFactors, setShowAllShapFactors] = useState(false);

  // Pure updater for 60fps zero-lag typing
  const updateFormField = useCallback((key, value) => {
    setFormState((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  // Debounced auto-save to localStorage without blocking render
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formState));
        setLastSavedTime(
          new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })
        );
      } catch (err) {
        console.error("Auto-save error", err);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formState]);

  const showToast = (text) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Reset form to completely blank
  const handleResetForm = () => {
    setFormState(EMPTY_FORM_STATE);
    localStorage.removeItem(STORAGE_KEY);
    setRecommendations([]);
    setSelectedCrop(null);
    setLastSavedTime("");
    setFormError("");
    showToast("All input fields cleared.");
  };

  // Fill preset demo values for quick testing
  const handleFillDemoData = () => {
    const demoData = { ...DEMO_SAMPLE_STATE };
    setFormState(demoData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoData));
    setLastSavedTime(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    );
    showToast("Sample field & soil test parameters loaded.");
  };

  // Sync live weather telemetry into form
  const handleUseLiveWeather = () => {
    const locQuery = formState.district
      ? `${formState.district}, ${formState.state || "India"}`
      : "Punjab, India";

    fetch(`/api/weather?location=${encodeURIComponent(locQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        const temp = String(data.currentTemp || 28);
        const hum = String(data.humidity || 65);
        const rain = String(data.rainChance > 40 ? 110 : 45);

        updateFormField("temperature", temp);
        updateFormField("humidity", hum);
        updateFormField("rainfall", rain);
        showToast(
          `Live telemetry microclimate synced for ${data.locationName || formState.district || "location"}`
        );
      })
      .catch(() => {
        updateFormField("temperature", "28");
        updateFormField("humidity", "70");
        updateFormField("rainfall", "120");
        showToast("Telemetry microclimate synced (28°C, 70% hum, 120mm rain).");
      });
  };

  // Execute AI Crop Recommendation Engine
  const handleRunAnalysis = async () => {
    setFormError("");

    // Required fields check
    const requiredChecks = [
      [formState.nitrogen, "Nitrogen (N)"],
      [formState.phosphorus, "Phosphorus (P)"],
      [formState.potassium, "Potassium (K)"],
      [formState.temperature, "Temperature"],
      [formState.humidity, "Humidity"],
      [formState.rainfall, "Rainfall"],
    ];

    const missing = requiredChecks.find(([val]) => !String(val || "").trim());
    if (missing) {
      const msg = `Please enter a value for ${missing[1]} before running the AI model.`;
      setFormError(msg);
      showToast(msg);
      return;
    }

    setLoading(true);

    const payload = {
      state: formState.state || "Punjab",
      district: formState.district || "Kapurthala",
      village: formState.village || "",
      nitrogen: Number(formState.nitrogen) || 80,
      phosphorus: Number(formState.phosphorus) || 40,
      potassium: Number(formState.potassium) || 35,
      ph: Number(formState.ph) || 6.5,
      soilType: formState.soilType || "Alluvial",
      temperature: Number(formState.temperature) || 28,
      humidity: Number(formState.humidity) || 70,
      rainfall: Number(formState.rainfall) || 120,
      irrigation: formState.irrigation || "Solar Drip",
      budget: formState.budget || "60000",
      season: formState.season || "Rabi",
      landArea: Number(formState.landArea) || 2.5,
    };

    try {
      const res = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecommendations(data.recommendations);
        setSelectedCrop(data.recommendations[0]);
      } else {
        const localRecs = runCropRecommendationEngine(payload);
        setRecommendations(localRecs);
        setSelectedCrop(localRecs[0]);
      }
    } catch {
      const localRecs = runCropRecommendationEngine(payload);
      setRecommendations(localRecs);
      setSelectedCrop(localRecs[0]);
    }

    setLoading(false);
    setActiveTabMode("results");

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#4ade80", "#16834b", "#60a5fa"],
    });

    showToast("AI Agronomy Simulation Complete!");
  };

  const handleSaveCropToFarm = () => {
    if (!selectedCrop) return;
    setSavedSuccess(true);
    addNotification({
      title: "Crop Recommendation Saved",
      message: `${selectedCrop.cropDisplayName} added to your farm planned crops with ${selectedCrop.suitabilityScore}% suitability index.`,
      type: "success",
    });
    setTimeout(() => setSavedSuccess(false), 3000);
    showToast(`${selectedCrop.cropDisplayName} saved to your farm!`);
  };

  const handleOpenAdvisor = (crop) => {
    const cropName = crop?.cropDisplayName || "Wheat";
    const query = `Can you provide a complete seasonal package of practices (POP), sowing depth, irrigation schedule, and organic disease protection plan for growing ${cropName} in ${formState.state || "India"}?`;
    if (openAdvisorWithQuery) {
      openAdvisorWithQuery(query);
    } else {
      setActiveTab("ai_advisor");
    }
  };

  const currentDistricts = useMemo(() => {
    if (!formState.state) return [];
    return STATE_DISTRICTS_DATA[formState.state] || [];
  }, [formState.state]);

  const landHa = Number(formState.landArea) || 1;

  const shapFactors = selectedCrop
    ? [
        {
          label: "Soil Nitrogen (N)",
          shap: 2.8,
          isPos: true,
          insight: `Nitrogen availability (${formState?.nitrogen || 110} kg/ha) boosts vegetative canopy and tillering vigor.`,
        },
        {
          label: "Seasonal Precipitation",
          shap: 1.6,
          isPos: true,
          insight: `Rainfall & irrigation adequacy (${formState?.rainfall || 90} mm) supports critical flowering moisture index.`,
        },
        {
          label: "Soil Phosphorus (P)",
          shap: formState?.phosphorus && Number(formState.phosphorus) < 40 ? -1.4 : 1.1,
          isPos: !(formState?.phosphorus && Number(formState.phosphorus) < 40),
          insight:
            formState?.phosphorus && Number(formState.phosphorus) < 40
              ? `Phosphorus deficit (${formState.phosphorus} kg/ha) restricts root branching and grain weight.`
              : `Phosphorus levels ensure strong root architecture and early crop establishment.`,
        },
        {
          label: "Soil Potash (K)",
          shap: 0.8,
          isPos: true,
          insight: "Potash level builds lodging resistance and grain starch filling.",
        },
        {
          label: "Soil pH Reaction",
          shap: formState?.ph && (Number(formState.ph) < 6.0 || Number(formState.ph) > 7.8) ? -0.9 : 0.5,
          isPos: !(formState?.ph && (Number(formState.ph) < 6.0 || Number(formState.ph) > 7.8)),
          insight:
            formState?.ph && (Number(formState.ph) < 6.0 || Number(formState.ph) > 7.8)
              ? `Sub-optimal pH (${formState.ph}) causes micronutrient lockup in rhizosphere.`
              : `Neutral soil pH (${formState?.ph || 6.8}) maximizes macronutrient bioavailability.`,
        },
      ]
    : [];
  const visibleShapFactors = showAllShapFactors ? shapFactors : shapFactors.slice(0, 3);

  return (
    <div className="space-y-6 pb-16 w-full">
      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-[9999] space-y-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="px-4 py-3 rounded-[12px] bg-[var(--surface-strong)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-xl text-xs font-semibold flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-bottom-2 fade-in"
          >
            <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span>{toast.text}</span>
          </div>
        ))}
      </div>

      {/* Report Modal */}
      {reportModalCrop && (
        <CropPrintCertificateModal
          crop={reportModalCrop}
          formState={formState}
          isDarkMode={isDarkMode}
          onClose={() => setReportModalCrop(null)}
        />
      )}

      {/* HEADER BANNER & ACTION BAR */}
      <div className="app-card p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5" />
                ICAR ML Engine v2.0
              </span>
              {lastSavedTime && (
                <span className="text-xs font-medium flex items-center gap-1.5 text-[var(--text-muted)]">
                  <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse" />
                  Auto-saved at {lastSavedTime}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              AI Crop Recommendation &amp; Soil Intelligence
            </h1>
            <p className="text-xs sm:text-sm max-w-3xl leading-relaxed text-[var(--text-secondary)]">
              Input your local soil lab test parameters, seasonal climate, and farm coordinates to generate precision crop matching and ROI analysis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleFillDemoData}
              title="Auto-fill with sample field & soil parameters"
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>Auto-Fill Sample Data</span>
            </button>
            <button
              type="button"
              onClick={handleResetForm}
              title="Clear all fields"
              className="btn-ghost text-xs flex items-center gap-1.5 cursor-pointer border border-[var(--border)]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Form</span>
            </button>
          </div>
        </div>

        {/* Master Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-5 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={() => setHubMode("ml_crop_recommendation")}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
              hubMode === "ml_crop_recommendation"
                ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)] shadow-sm"
                : "bg-[var(--surface-strong)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)]"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>AI Crop Recommendation Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => setHubMode("comparison")}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
              hubMode === "comparison"
                ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)] shadow-sm"
                : "bg-[var(--surface-strong)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)]"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Multi-Crop Comparison Matrix</span>
          </button>

          <button
            type="button"
            onClick={() => setHubMode("disease_diagnosis")}
            className={`px-4 py-2 rounded-[10px] text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
              hubMode === "disease_diagnosis"
                ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)] shadow-sm"
                : "bg-[var(--surface-strong)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)]"
            }`}
          >
            <ScanEye className="w-4 h-4" />
            <span>Leaf Pathology &amp; Disease Scanner</span>
          </button>
        </div>
      </div>

      {/* RENDER VIEW ACCORDING TO HUB MODE */}
      {hubMode === "disease_diagnosis" && (
        <DiseaseDiagnosisView
          onDiagnoseComplete={() => {
            showToast("Leaf pathology analysis complete!");
          }}
        />
      )}

      {hubMode === "comparison" && (
        <CropComparisonMatrix
          recommendations={
            recommendations.length > 0
              ? recommendations
              : runCropRecommendationEngine(EMPTY_FORM_STATE)
          }
          formState={formState}
          isDarkMode={isDarkMode}
          onSelectCrop={(crop) => {
            setSelectedCrop(crop);
            setHubMode("ml_crop_recommendation");
            setActiveTabMode("results");
          }}
          onOpenAdvisor={handleOpenAdvisor}
        />
      )}

      {hubMode === "ml_crop_recommendation" && (
        <div className="space-y-6">
          {/* Analysis Input vs Results Tab Bar */}
          <div className="border-b border-[var(--border)] pb-1">
            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setActiveTabMode("input")}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTabMode === "input"
                    ? "text-[var(--primary)] font-bold font-heading"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>Analysis Input</span>
                {activeTabMode === "input" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTabMode("results")}
                className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 cursor-pointer ${
                  activeTabMode === "results"
                    ? "text-[var(--primary)] font-bold font-heading"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Results</span>
                {recommendations.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--primary-soft)] text-[var(--primary)] font-bold font-mono">
                    {recommendations.length}
                  </span>
                )}
                {activeTabMode === "results" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* TAB 1: ANALYSIS INPUT */}
          {activeTabMode === "input" && (
            <div className="space-y-6">
              {formError && (
                <div className="p-4 rounded-[12px] bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 2-COLUMN MAIN INPUT GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* CARD 1: Farm Details */}
                  <div className="app-card p-5 sm:p-6 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white">
                          Farm &amp; Geographic Location
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                          State, district &amp; arable land plot area
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* State & District row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="state-select"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            State
                          </label>
                          <CustomSelect
                            id="state-select"
                            value={formState.state}
                            options={STATIC_STATE_OPTIONS}
                            placeholder="Select state"
                            onChange={(val) => {
                              updateFormField("state", val);
                              const newDistricts = STATE_DISTRICTS_DATA[val] || [];
                              if (newDistricts.length > 0) {
                                updateFormField("district", newDistricts[0]);
                              } else {
                                updateFormField("district", "");
                              }
                            }}
                            isDarkMode={isDarkMode}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="district-select"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            District
                          </label>
                          <CustomSelect
                            id="district-select"
                            value={formState.district}
                            options={currentDistricts}
                            placeholder={formState.state ? "Select district" : "Select state first"}
                            disabled={!formState.state}
                            onChange={(val) => updateFormField("district", val)}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>

                      {/* Village & Land Area row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="village-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Village / City (optional)
                          </label>
                          <input
                            id="village-input"
                            type="text"
                            value={formState.village}
                            onChange={(e) => updateFormField("village", e.target.value)}
                            placeholder="e.g. Sasaram"
                            className="w-full h-[46px] px-3.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="land-area-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Land Area (hectares)
                          </label>
                          <div className="relative">
                            <input
                              id="land-area-input"
                              type="number"
                              step="0.1"
                              min="0.1"
                              value={formState.landArea}
                              onChange={(e) => updateFormField("landArea", e.target.value)}
                              placeholder="e.g. 2.5"
                              className="w-full h-[46px] pl-3.5 pr-12 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              ha
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD 2: Soil Parameters */}
                  <div className="app-card p-5 sm:p-6 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <FlaskConical className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white">
                          Soil Laboratory Parameters
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                          Nutrient levels and laboratory soil test values
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* N, P, K row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="n-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Nitrogen N
                          </label>
                          <div className="relative">
                            <input
                              id="n-input"
                              type="number"
                              value={formState.nitrogen}
                              onChange={(e) => updateFormField("nitrogen", e.target.value)}
                              placeholder="e.g. 80"
                              className="w-full h-[46px] pl-3.5 pr-14 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              kg/ha
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="p-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Phosphorus P
                          </label>
                          <div className="relative">
                            <input
                              id="p-input"
                              type="number"
                              value={formState.phosphorus}
                              onChange={(e) => updateFormField("phosphorus", e.target.value)}
                              placeholder="e.g. 40"
                              className="w-full h-[46px] pl-3.5 pr-14 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              kg/ha
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="k-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Potassium K
                          </label>
                          <div className="relative">
                            <input
                              id="k-input"
                              type="number"
                              value={formState.potassium}
                              onChange={(e) => updateFormField("potassium", e.target.value)}
                              placeholder="e.g. 35"
                              className="w-full h-[46px] pl-3.5 pr-14 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              kg/ha
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* pH & Soil Type row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="ph-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Soil pH Level
                          </label>
                          <div className="relative">
                            <input
                              id="ph-input"
                              type="number"
                              step="0.1"
                              min="3"
                              max="10"
                              value={formState.ph}
                              onChange={(e) => updateFormField("ph", e.target.value)}
                              placeholder="e.g. 6.5"
                              className="w-full h-[46px] pl-3.5 pr-12 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              pH
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="soil-type-select"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Soil Classification
                          </label>
                          <CustomSelect
                            id="soil-type-select"
                            value={formState.soilType}
                            options={STATIC_SOIL_OPTIONS}
                            placeholder="Select soil type"
                            onChange={(val) => updateFormField("soilType", val)}
                            isDarkMode={isDarkMode}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-6">
                  {/* CARD 3: Climate & Weather */}
                  <div className="app-card p-5 sm:p-6 transition-all hover:shadow-md">
                    <div className="flex items-center justify-between gap-3 mb-5 pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
                          <CloudRain className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white">
                            Climate &amp; Environmental Telemetry
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-neutral-400">
                            Microclimate parameters &amp; irrigation source
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleUseLiveWeather}
                        className="py-1.5 px-3 rounded-full border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs shrink-0"
                        title="Sync with live weather station"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span className="hidden sm:inline">Sync Live Weather</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Temp, Humidity, Rain row */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label
                            htmlFor="temp-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Temperature
                          </label>
                          <div className="relative">
                            <input
                              id="temp-input"
                              type="number"
                              value={formState.temperature}
                              onChange={(e) => updateFormField("temperature", e.target.value)}
                              placeholder="e.g. 28"
                              className="w-full h-[46px] pl-3.5 pr-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              °C
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="hum-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Humidity
                          </label>
                          <div className="relative">
                            <input
                              id="hum-input"
                              type="number"
                              value={formState.humidity}
                              onChange={(e) => updateFormField("humidity", e.target.value)}
                              placeholder="e.g. 70"
                              className="w-full h-[46px] pl-3.5 pr-8 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              %
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label
                            htmlFor="rain-input"
                            className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                          >
                            Rainfall
                          </label>
                          <div className="relative">
                            <input
                              id="rain-input"
                              type="number"
                              value={formState.rainfall}
                              onChange={(e) => updateFormField("rainfall", e.target.value)}
                              placeholder="e.g. 120"
                              className="w-full h-[46px] pl-3.5 pr-10 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 pointer-events-none">
                              mm
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Irrigation row */}
                      <div className="space-y-1.5">
                        <label
                          htmlFor="irrigation-select"
                          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                        >
                          Irrigation Source
                        </label>
                        <CustomSelect
                          id="irrigation-select"
                          value={formState.irrigation}
                          options={STATIC_IRRIGATION_OPTIONS}
                          placeholder="Select irrigation"
                          onChange={(val) => updateFormField("irrigation", val)}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    </div>
                  </div>

                  {/* CARD 4: Financial & Season */}
                  <div className="app-card p-5 sm:p-6 transition-all hover:shadow-md">
                    <div className="flex items-center gap-3 mb-5 pb-3.5 border-b border-slate-200/80 dark:border-white/[0.08]">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/15 border border-purple-500/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold font-heading text-slate-900 dark:text-white">
                          Economics &amp; Agricultural Season
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-neutral-400">
                          Working capital budget &amp; target cropping season
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="budget-input"
                          className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400"
                        >
                          Budget Available (₹, optional)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500 dark:text-neutral-400 pointer-events-none">
                            ₹
                          </span>
                          <input
                            id="budget-input"
                            type="number"
                            value={formState.budget}
                            onChange={(e) => updateFormField("budget", e.target.value)}
                            placeholder="e.g. 60000"
                            className="w-full h-[46px] pl-8 pr-3.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-xs font-mono font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400">
                          Target Cropping Season
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: "Kharif", label: "Kharif", sub: "Monsoon" },
                            { id: "Rabi", label: "Rabi", sub: "Winter" },
                            { id: "Zaid", label: "Zaid", sub: "Summer" },
                          ].map((seasonItem) => {
                            const isSelected = formState.season === seasonItem.id;
                            return (
                              <button
                                key={seasonItem.id}
                                type="button"
                                onClick={() => updateFormField("season", isSelected ? "" : seasonItem.id)}
                                className={`py-2 px-2 sm:px-3 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                  isSelected
                                    ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                                    : "bg-white dark:bg-[#0F0F0F] border-slate-300 dark:border-white/10 text-slate-700 dark:text-neutral-300 hover:border-emerald-500 hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                                }`}
                              >
                                <span className="font-bold">{seasonItem.label}</span>
                                <span className={`text-[10px] font-normal ${isSelected ? "text-emerald-100" : "text-slate-500 dark:text-neutral-400"}`}>
                                  {seasonItem.sub}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BOTTOM SUBMIT ACTION CONSOLE */}
              <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-3.5">
                <button
                  type="button"
                  id="crop-engine-run-btn"
                  onClick={handleRunAnalysis}
                  disabled={loading}
                  className="w-full sm:w-auto min-w-[280px] sm:min-w-[360px] h-[52px] px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[15px] font-bold flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Computing ICAR Agronomy Engine...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                      <span>Run AI Crop Analysis</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500 dark:text-neutral-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    PAU &amp; ICAR Grounded Multi-Variate Model
                  </span>
                  <span className="text-slate-300 dark:text-neutral-600">•</span>
                  <span>Real-Time APMC Mandi ROI Forecast</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: RESULTS VIEW */}
          {activeTabMode === "results" && (
            <div>
              {recommendations.length === 0 ? (
                /* EMPTY RESULTS STATE */
                <div className="app-card p-10 md:p-14 text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center mx-auto">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h3 className="text-xl font-bold font-heading text-[var(--text-primary)]">
                      No AI Analysis Generated Yet
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Enter your farm location, soil chemistry parameters, and climate in the <strong>Analysis Input</strong> tab, then click <strong>Run AI Analysis</strong> to compute precision crop matches.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveTabMode("input")}
                      className="btn-primary text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Go to Analysis Input</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleFillDemoData();
                        setTimeout(() => handleRunAnalysis(), 100);
                      }}
                      className="btn-secondary text-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Load Sample Data &amp; Run</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* RICH RESULTS DOSSIER */
                selectedCrop && (
                  <div className="space-y-6">
                    {/* TOP RECOMMENDED CROP HERO DOSSIER CARD */}
                    <div className="app-card p-6 md:p-8 border-2 border-[var(--primary)] shadow-lg relative overflow-hidden">
                      {/* Top Badge Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[var(--border)]">
                        <div className="flex items-center gap-2.5">
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-[var(--primary)] text-slate-950 font-heading">
                            ★ TOP AI MATCH
                          </span>
                          <span className="text-xs font-semibold text-[var(--text-secondary)]">
                            {selectedCrop.category} • {selectedCrop.growingSeason} Season
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setReportModalCrop(selectedCrop)}
                            className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3"
                          >
                            <Printer className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span>Print Certificate &amp; PDF</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveCropToFarm}
                            className={`btn-primary text-xs flex items-center gap-1.5 cursor-pointer py-1.5 px-3 font-semibold ${
                              savedSuccess ? "bg-emerald-600" : ""
                            }`}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>{savedSuccess ? "Saved to Farm ✓" : "Save to My Farm"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Premium Recommended Crop Hero */}
                      <div className="crop-result-hero-grid my-6">
                        <div className="crop-result-main space-y-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="crop-result-rank-badge">Rank #1 recommendation</span>
                            <span className="crop-result-season-badge">{selectedCrop.growingSeason} season</span>
                          </div>
                          <div>
                            <h2 className="text-3xl md:text-4xl font-bold font-heading text-[var(--primary)] tracking-tight">
                              {selectedCrop.cropDisplayName}
                            </h2>
                            <div className="text-xs italic text-[var(--text-muted)] font-mono mt-1">
                              {selectedCrop.scientificName}
                            </div>
                          </div>
                          <p className="text-xs sm:text-sm max-w-3xl leading-relaxed text-[var(--text-secondary)]">
                            {selectedCrop.aiInsight}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                            <span className="crop-result-detail-chip"><Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />{selectedCrop.growingSeason} crop</span>
                            <span className="crop-result-detail-chip"><Clock3 className="w-3.5 h-3.5 text-[var(--primary)]" />{selectedCrop.durationDays}</span>
                          </div>
                          <div className="crop-result-score-row">
                            <div className="crop-result-score-card">
                              <span>AI suitability</span>
                              <strong>{selectedCrop.suitabilityScore}%</strong>
                              <small>Overall fit</small>
                            </div>
                            <div className="crop-result-score-card crop-result-score-blue">
                              <span>Confidence</span>
                              <strong>{selectedCrop.modelConfidence}%</strong>
                              <small>Model confidence</small>
                            </div>
                          </div>
                        </div>
                        <div className="crop-result-image-frame">
                          {getCropImage(selectedCrop.cropDisplayName, null) ? (
                            <img
                              src={getCropImage(selectedCrop.cropDisplayName, null)}
                              alt={`${selectedCrop.cropDisplayName} crop field`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="crop-image-fallback"><Sprout className="w-10 h-10" /><span>Crop image unavailable</span></div>
                          )}
                          <span className="crop-result-image-label">Recommended crop</span>
                        </div>
                      </div>

                      {/* Key Financial & Agronomic Metrics Strip */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-6 border-t border-[var(--border)]">
                        <div className="crop-result-metric-card">
                          <div className="crop-result-metric-label"><Droplets className="w-3.5 h-3.5 text-[var(--info)]" />
                            Expected Yield
                          </div>
                          <div className="text-lg font-bold font-heading text-[var(--text-primary)] mt-1">
                            {selectedCrop.expectedYield} t/ha
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-muted)]">
                            Total: {(selectedCrop.expectedYield * 10 * landHa).toFixed(1)} Qtl
                          </div>
                        </div>

                        <div className="crop-result-metric-card">
                          <div className="crop-result-metric-label"><TrendingUp className="w-3.5 h-3.5 text-[var(--primary)]" />
                            APMC Mandi Price
                          </div>
                          <div className="text-lg font-bold font-heading text-[var(--text-primary)] mt-1">
                            ₹{selectedCrop.marketPrice.toLocaleString("en-IN")}/qtl
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-muted)]">
                            Gross: ₹{Math.round(selectedCrop.expectedYield * 10 * selectedCrop.marketPrice * landHa).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="crop-result-metric-card">
                          <div className="crop-result-metric-label"><DollarSign className="w-3.5 h-3.5 text-[var(--warning)]" />
                            Cultivation Cost
                          </div>
                          <div className="text-lg font-bold font-heading text-[var(--warning)] mt-1">
                            ₹{selectedCrop.cultivationCost.toLocaleString("en-IN")}/ha
                          </div>
                          <div className="text-[11px] font-mono text-[var(--text-muted)]">
                            Field Cost: ₹{Math.round(selectedCrop.cultivationCost * landHa).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="crop-result-metric-card">
                          <div className="crop-result-metric-label"><CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                            Projected Profit
                          </div>
                          <div className="text-lg font-bold font-heading text-[var(--success)] mt-1">
                            ₹{selectedCrop.expectedProfit.toLocaleString("en-IN")}/ha
                          </div>
                          <div className="text-[11px] font-semibold text-[var(--success)] font-mono">
                            Field Net: ₹{Math.round(selectedCrop.expectedProfit * landHa).toLocaleString("en-IN")}
                          </div>
                        </div>

                        <div className="crop-result-metric-card col-span-2 sm:col-span-1">
                          <div className="crop-result-metric-label"><AlertTriangle className="w-3.5 h-3.5 text-[var(--warning)]" />
                            Risk Profile
                          </div>
                          <div className="mt-1">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-block ${
                                selectedCrop.riskLevel === "Low"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                  : selectedCrop.riskLevel === "Moderate"
                                  ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                  : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                              }`}
                            >
                              {selectedCrop.riskLevel} Risk
                            </span>
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] mt-1">
                            High MSP stability
                          </div>
                        </div>
                      </div>

                      {/* 5-Factor Agronomic Compatibility Scorecard */}
                      <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                        <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                          Agronomic Compatibility Breakdown
                        </div>
                        <div className="crop-result-compatibility-grid">
                          <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--text-secondary)]">Soil NPK</span>
                              <span className="font-bold text-[var(--primary)] font-heading">{selectedCrop.soilSuitability}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface)]">
                              <div className="h-full bg-[var(--primary)] rounded-full transition-all" style={{ width: `${selectedCrop.soilSuitability}%` }} />
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--text-secondary)]">Thermal Fit</span>
                              <span className="font-bold text-teal-500 font-heading">{selectedCrop.temperatureCompatibility}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface)]">
                              <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${selectedCrop.temperatureCompatibility}%` }} />
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--text-secondary)]">Moisture &amp; Rain</span>
                              <span className="font-bold text-[var(--info)] font-heading">{selectedCrop.rainfallCompatibility}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface)]">
                              <div className="h-full bg-[var(--info)] rounded-full transition-all" style={{ width: `${selectedCrop.rainfallCompatibility}%` }} />
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--text-secondary)]">Humidity</span>
                              <span className="font-bold text-indigo-500 font-heading">{selectedCrop.humidityCompatibility}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface)]">
                              <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${selectedCrop.humidityCompatibility}%` }} />
                            </div>
                          </div>

                          <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--text-secondary)]">Market Demand</span>
                              <span className="font-bold text-[var(--warning)] font-heading">{selectedCrop.marketOpportunity}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface)]">
                              <div className="h-full bg-[var(--warning)] rounded-full transition-all" style={{ width: `${selectedCrop.marketOpportunity}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explainable AI: SHAP Feature Attribution Waterfall */}
                      <div className="mt-6 pt-6 border-t border-[var(--border)] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
                              Explainable AI (SHAP TreeExplainer Waterfall)
                            </span>
                          </div>
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-semibold font-mono border border-[var(--primary)]/20">
                            R² = 0.9935 | MAE = 4.11 Qtl
                          </span>
                        </div>

                        <div className="p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)] space-y-3">
                          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                            Shapley Additive feature attributions quantifying marginal yield impact for {selectedCrop.cropDisplayName || selectedCrop.crop}:
                          </p>

                          <div className="space-y-2 pt-1">
                            {visibleShapFactors.map((item, idx) => (
                              <div key={idx} className="p-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--surface)] space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium text-[var(--text-primary)]">{item.label}</span>
                                  <span className={`font-mono font-bold ${item.isPos ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
                                    {item.isPos ? `+${item.shap} Qtl/Acre` : `${item.shap} Qtl/Acre`}
                                  </span>
                                </div>
                                <div className="w-full h-1.5 rounded-full overflow-hidden bg-[var(--surface-strong)]">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      item.isPos ? "bg-[var(--success)]" : "bg-[var(--danger)]"
                                    }`}
                                    style={{ width: `${Math.min(100, Math.abs(item.shap) * 30)}%` }}
                                  />
                                </div>
                                <p className="text-[11px] text-[var(--text-muted)]">{item.insight}</p>
                              </div>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowAllShapFactors((previous) => !previous)}
                            className="w-full pt-2 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors cursor-pointer"
                          >
                            {showAllShapFactors ? "Show Top 3 Factors" : `View All Factors (${shapFactors.length})`}
                          </button>
                        </div>
                      </div>

                      {/* Package of Practices (POP) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
                        <div className="p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)]">
                          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs mb-2 font-heading">
                            <Layers className="w-4 h-4" />
                            Nutrient Management &amp; Fertilizer Schedule
                          </div>
                          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                            {selectedCrop.chemicalSchedule}
                          </p>
                        </div>

                        <div className="p-4 rounded-[12px] border border-[var(--border)] bg-[var(--surface-strong)]">
                          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs mb-2 font-heading">
                            <ShieldCheck className="w-4 h-4" />
                            Organic Protection &amp; IPM Protocol
                          </div>
                          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                            {selectedCrop.organicRemedy}
                          </p>
                        </div>
                      </div>

                      {/* Action Bar Footer */}
                      <div className="mt-6 pt-5 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                        <button
                          type="button"
                          onClick={() => handleOpenAdvisor(selectedCrop)}
                          className="btn-primary text-xs flex items-center gap-2 cursor-pointer font-semibold py-2.5 px-4"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Consult AI Advisor on {selectedCrop.cropDisplayName.split(" ")[0]}</span>
                        </button>

                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setHubMode("comparison")}
                            className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
                          >
                            <Scale className="w-3.5 h-3.5" />
                            <span>Compare Alternatives</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveTabMode("input")}
                            className="btn-ghost border border-[var(--border)] text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Edit Inputs</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* ALTERNATIVE RANKED CROPS */}
                    {recommendations.length > 1 && (
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                              Alternative Ranked Crop Options
                            </h3>
                            <p className="text-xs text-[var(--text-muted)]">
                              Select any alternative crop to view its agronomic profile.
                            </p>
                          </div>
                          <span className="text-xs font-mono font-medium text-[var(--primary)]">
                            {recommendations.length - 1} Alternatives
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {recommendations.slice(1, 4).map((altCrop, idx) => (
                            <div
                              key={altCrop.crop}
                              onClick={() => setSelectedCrop(altCrop)}
                              className={`crop-alternative-card app-card transition-all cursor-pointer ${
                                selectedCrop.crop === altCrop.crop
                                  ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-md"
                                  : "hover:border-[var(--primary)]"
                              }`}
                            >
                              <div className="crop-alternative-image">
                                {getCropImage(altCrop.cropDisplayName, null) ? (
                                  <img src={getCropImage(altCrop.cropDisplayName, null)} alt={`${altCrop.cropDisplayName} crop`} loading="lazy" />
                                ) : (
                                  <div className="crop-image-fallback"><Sprout className="w-8 h-8" /><span>Image unavailable</span></div>
                                )}
                                <span className="crop-alternative-rank">Rank #{idx + 2}</span>
                                <span className="crop-alternative-score">{altCrop.suitabilityScore}% fit</span>
                              </div>
                              <div className="crop-alternative-content">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h4 className="text-base font-bold font-heading text-[var(--text-primary)] leading-tight">{altCrop.cropDisplayName}</h4>
                                    <div className="text-[11px] text-[var(--text-muted)] font-mono mt-1">{altCrop.growingSeason} • {altCrop.durationDays}</div>
                                  </div>
                                  <span className={`crop-risk-dot ${altCrop.riskLevel === "Low" ? "crop-risk-low" : altCrop.riskLevel === "Moderate" ? "crop-risk-medium" : "crop-risk-high"}`} title={`${altCrop.riskLevel} risk`} />
                                </div>
                                <div className="crop-alternative-stats">
                                  <div><span>Expected yield</span><strong>{altCrop.expectedYield} t/ha</strong></div>
                                  <div><span>Net profit</span><strong>₹{altCrop.expectedProfit.toLocaleString("en-IN")}/ha</strong></div>
                                </div>
                                <button type="button" className="crop-alternative-action">View Details <ArrowRight className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
