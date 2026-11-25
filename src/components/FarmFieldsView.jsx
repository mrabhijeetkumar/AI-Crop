import React, { useState, useMemo } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { SOIL_TYPES } from "../data/soilTypes.js";
import { CROPS_CATALOG } from "../data/cropsData.js";
import { FarmKPIHeader } from "./farm/FarmKPIHeader.jsx";
import { FarmGISMap } from "./farm/FarmGISMap.jsx";
import { FarmActivityLogModal } from "./farm/FarmActivityLogModal.jsx";
import { FieldDetailDrawer } from "./farm/FieldDetailDrawer.jsx";
import { FieldDeleteConfirmModal } from "./farm/FieldDeleteConfirmModal.jsx";
import {
  Map,
  Plus,
  Edit2,
  Trash2,
  X,
  Droplets,
  Search,
  Filter,
  ArrowUpDown,
  Sparkles,
  Layers,
  Activity,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ClipboardList,
  Eye,
  Info,
} from "lucide-react";
import { getCropEmoji, getSeverityBadgeClass } from "../utils/formatters.js";

export function FarmFieldsView() {
  const {
    fields,
    addField,
    updateField,
    deleteField,
    irrigateField,
    refreshAllSensors,
    activities,
    farmProfile,
  } = useFarm();
  const { isDarkMode } = useTheme();

  // Tab mode: 'grid' | 'map' | 'activity' | 'irrigation'
  const [viewTab, setViewTab] = useState("grid");

  // Filtering & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [soilFilter, setSoilFilter] = useState("all");
  const [healthFilter, setHealthFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  // Sensor Refresh state
  const [isRefreshingSensors, setIsRefreshingSensors] = useState(false);

  // Modals & Drawers
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [inspectingField, setInspectingField] = useState(null);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityModalFieldId, setActivityModalFieldId] = useState(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState(null);

  // Toast feedback state
  const [quickToast, setQuickToast] = useState(null);

  const showToast = (message) => {
    setQuickToast(message);
    setTimeout(() => {
      setQuickToast(null);
    }, 3500);
  };

  // Form State for Add / Edit
  const [name, setName] = useState("");
  const [areaAcres, setAreaAcres] = useState(5.0);
  const [soilType, setSoilType] = useState("alluvial");
  const [currentCrop, setCurrentCrop] = useState("Wheat (HD-2967)");
  const [variety, setVariety] = useState("HD-2967 High Yield");
  const [growthStage, setGrowthStage] = useState("Tillering / Vegetative");
  const [growthProgress, setGrowthProgress] = useState(40);
  const [sowingDate, setSowingDate] = useState("2025-11-15");
  const [expectedHarvestDate, setExpectedHarvestDate] = useState("2026-04-10");
  const [healthStatus, setHealthStatus] = useState("Good");
  const [irrigationSource, setIrrigationSource] = useState("Solar Drip & Tube Canal");
  const [moisturePercentage, setMoisturePercentage] = useState(52);
  const [ndviIndex, setNdviIndex] = useState(0.82);
  const [notes, setNotes] = useState("");

  // Soil Chemistry
  const [soilN, setSoilN] = useState(105);
  const [soilP, setSoilP] = useState(52);
  const [soilK, setSoilK] = useState(48);
  const [soilPh, setSoilPh] = useState(6.8);
  const [soilOrganicCarbon, setSoilOrganicCarbon] = useState(0.74);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (modalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  const handleOpenAdd = () => {
    setEditingField(null);
    const charCode = 65 + fields.length;
    setName(`Sector ${String.fromCharCode(charCode <= 90 ? charCode : 65)} Plot`);
    setAreaAcres(8.5);
    setSoilType("alluvial");
    setCurrentCrop("Wheat (HD-2967)");
    setVariety("HD-2967 High Yield");
    setGrowthStage("Tillering / Vegetative");
    setGrowthProgress(38);
    setSowingDate(new Date(Date.now() - 3600000 * 24 * 35).toISOString().split("T")[0]);
    setExpectedHarvestDate(new Date(Date.now() + 3600000 * 24 * 75).toISOString().split("T")[0]);
    setHealthStatus("Good");
    setIrrigationSource("Solar Drip & Canal Tubewell");
    setMoisturePercentage(54);
    setNdviIndex(0.82);
    setNotes("Normal vegetative growth. Zero pest or fungal incidence observed.");
    setSoilN(105);
    setSoilP(52);
    setSoilK(48);
    setSoilPh(6.8);
    setSoilOrganicCarbon(0.74);
    setModalOpen(true);
  };

  const handleOpenEdit = (field) => {
    setEditingField(field);
    setName(field.name);
    setAreaAcres(field.areaAcres);
    setSoilType(field.soilType);
    setCurrentCrop(field.currentCrop);
    setVariety(field.variety || field.currentCrop);
    setGrowthStage(field.growthStage);
    setGrowthProgress(field.growthProgressPercent);
    setSowingDate(field.sowingDate);
    setExpectedHarvestDate(field.expectedHarvestDate);
    setHealthStatus(field.healthStatus);
    setIrrigationSource(field.irrigationSource);
    setMoisturePercentage(field.moisturePercentage);
    setNdviIndex(field.ndviIndex || 0.82);
    setNotes(field.notes);
    setSoilN(field.soilTest?.nitrogen || 105);
    setSoilP(field.soilTest?.phosphorus || 52);
    setSoilK(field.soilTest?.potassium || 48);
    setSoilPh(field.soilTest?.ph || 6.8);
    setSoilOrganicCarbon(field.soilTest?.organicCarbon || 0.74);
    setModalOpen(true);
  };

  // Crop change helper in modal
  const handleCropSelect = (selectedCropName) => {
    setCurrentCrop(selectedCropName);
    const found = CROPS_CATALOG.find((c) =>
      c.name.toLowerCase().includes(selectedCropName.toLowerCase()) ||
      selectedCropName.toLowerCase().includes(c.name.toLowerCase())
    );
    if (found) {
      setVariety(`${selectedCropName} (Certified)`);
      if (found.durationDays) {
        const d = new Date(sowingDate || Date.now());
        d.setDate(d.getDate() + found.durationDays);
        setExpectedHarvestDate(d.toISOString().split("T")[0]);
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name,
      areaAcres: Number(areaAcres),
      soilType,
      currentCrop,
      variety,
      growthStage,
      growthProgressPercent: Number(growthProgress),
      sowingDate,
      expectedHarvestDate,
      healthStatus,
      irrigationSource,
      moisturePercentage: Number(moisturePercentage),
      ndviIndex: Number(ndviIndex),
      notes,
      soilTest: {
        nitrogen: Number(soilN),
        phosphorus: Number(soilP),
        potassium: Number(soilK),
        ph: Number(soilPh),
        organicCarbon: Number(soilOrganicCarbon),
        testDate: new Date().toISOString().split("T")[0],
      },
    };

    if (editingField) {
      updateField(editingField.id, payload);
      showToast(`Field ${name} updated and synced in real-time.`);
    } else {
      addField(payload);
      showToast(`New parcel ${name} mapped and saved.`);
    }
    setModalOpen(false);
  };

  const handle1ClickIrrigate = async (field) => {
    await irrigateField(field.id);
    showToast(`Precision irrigation applied to ${field.name}! Moisture raised to 70%+ H₂O.`);
  };

  const handleRefreshSensors = async () => {
    setIsRefreshingSensors(true);
    await refreshAllSensors();
    setIsRefreshingSensors(false);
    showToast("Live IoT probes, soil moisture & NDVI refreshed.");
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmTarget) {
      deleteField(deleteConfirmTarget.id);
      showToast(`Field ${deleteConfirmTarget.name} removed from farm registry.`);
      setDeleteConfirmTarget(null);
      if (inspectingField?.id === deleteConfirmTarget.id) {
        setInspectingField(null);
      }
    }
  };

  // Filtered & Sorted Fields
  const filteredFields = useMemo(() => {
    return fields
      .filter((f) => {
        const matchesSearch =
          f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.currentCrop.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesSoil = soilFilter === "all" || f.soilType === soilFilter;
        const matchesHealth = healthFilter === "all" || f.healthStatus === healthFilter;

        return matchesSearch && matchesSoil && matchesHealth;
      })
      .sort((a, b) => {
        if (sortBy === "area_desc") return b.areaAcres - a.areaAcres;
        if (sortBy === "area_asc") return a.areaAcres - b.areaAcres;
        if (sortBy === "moisture_asc") return a.moisturePercentage - b.moisturePercentage;
        if (sortBy === "progress_desc") return b.growthProgressPercent - a.growthProgressPercent;
        if (sortBy === "harvest_date") return new Date(a.expectedHarvestDate) - new Date(b.expectedHarvestDate);
        return 0;
      });
  }, [fields, searchQuery, soilFilter, healthFilter, sortBy]);

  return (
    <div className="space-y-6 pb-16 w-full animate-in fade-in duration-200">
      {/* Toast Alert */}
      {quickToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--surface-strong)] border border-[var(--border-strong)] text-[var(--text-primary)] px-4 py-3 rounded-[12px] shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[var(--primary)] shrink-0" />
          <span className="text-xs font-semibold">{quickToast}</span>
        </div>
      )}

      {/* Farm KPI Banner & Realtime Status */}
      <FarmKPIHeader
        onOpenAdd={handleOpenAdd}
        isRefreshingSensors={isRefreshingSensors}
        onRefreshSensors={handleRefreshSensors}
      />

      {/* Navigation Sub-Tabs & Filter Toolbar */}
      <div className="app-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Sub-Tabs Selector */}
          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-[12px] border border-[var(--border)] shadow-sm overflow-x-auto">
            <button
              onClick={() => setViewTab("grid")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === "grid"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plot Grid ({fields.length})</span>
            </button>

            <button
              onClick={() => setViewTab("map")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === "map"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span>GIS Satellite Map</span>
            </button>

            <button
              onClick={() => setViewTab("activity")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === "activity"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Operations Log ({activities.length})</span>
            </button>

            <button
              onClick={() => setViewTab("irrigation")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[8px] text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                viewTab === "irrigation"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>Water Schedule</span>
            </button>
          </div>

          {/* Quick Action to record activity */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActivityModalFieldId(fields[0]?.id || null);
                setActivityModalOpen(true);
              }}
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
            >
              <ClipboardList className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>+ Log Operation</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        {viewTab === "grid" && (
          <div className="pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plot name, crop, notes..."
                className="form-input pl-9 text-xs py-1.5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Soil Type Filter */}
            <div>
              <select
                value={soilFilter}
                onChange={(e) => setSoilFilter(e.target.value)}
                className="form-select text-xs py-1.5 font-medium"
              >
                <option value="all">🌱 All Soil Types</option>
                {SOIL_TYPES.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Filter */}
            <div>
              <select
                value={healthFilter}
                onChange={(e) => setHealthFilter(e.target.value)}
                className="form-select text-xs py-1.5 font-medium"
              >
                <option value="all">🩺 All Health Statuses</option>
                <option value="Excellent">✨ Excellent</option>
                <option value="Good">✅ Good</option>
                <option value="Needs Attention">⚠️ Needs Attention</option>
                <option value="Critical">🚨 Critical</option>
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="form-select text-xs py-1.5 font-medium"
              >
                <option value="default">↕️ Default Ordering</option>
                <option value="area_desc">📐 Largest Area First</option>
                <option value="area_asc">📐 Smallest Area First</option>
                <option value="moisture_asc">💧 Lowest Moisture</option>
                <option value="progress_desc">🌾 Closest to Harvest</option>
                <option value="harvest_date">📅 Earliest Harvest Date</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* View 1: Main Plot Cards Grid */}
      {viewTab === "grid" && (
        <div className="space-y-4">
          {filteredFields.length === 0 ? (
            <div className="app-card p-12 text-center text-[var(--text-muted)]">
              <Map className="w-12 h-12 mx-auto text-[var(--text-muted)] mb-3" />
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mb-1">No Farm Plots Found</h3>
              <p className="text-xs max-w-sm mx-auto mb-4">
                No parcels matched your active filters or search query. Try clearing filters or map a new plot.
              </p>
              <button
                onClick={handleOpenAdd}
                className="btn-primary text-xs py-2 px-4 cursor-pointer"
              >
                + Map New Field Plot
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredFields.map((field) => (
                <div
                  key={field.id}
                  className="app-card p-5 hover:border-[var(--primary)] transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Card Header: Title & Actions */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl transition-transform group-hover:scale-105">
                          {getCropEmoji(field.currentCrop)}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold font-heading text-[var(--text-primary)] leading-tight">
                            {field.name}
                          </h3>
                          <p className="text-xs text-[var(--primary)] font-medium mt-0.5">
                            {field.currentCrop}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setInspectingField(field)}
                          className="btn-ghost p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Inspect Plot"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(field)}
                          className="btn-ghost p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          title="Edit Field Plot"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmTarget(field)}
                          className="btn-ghost p-1.5 rounded-[6px] text-[var(--text-muted)] hover:text-red-500 cursor-pointer"
                          title="Delete Field Plot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                        {field.healthStatus}
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]">
                        {field.areaAcres} Acres
                      </span>

                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]">
                        {field.soilType.toUpperCase()}
                      </span>
                    </div>

                    {/* Growth Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-1 font-medium text-[var(--text-secondary)]">
                        <span>
                          Stage: <strong className="text-[var(--text-primary)]">{field.growthStage}</strong>
                        </span>
                        <span className="text-[var(--primary)] font-bold">
                          {field.growthProgressPercent}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[var(--surface-strong)] overflow-hidden">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
                          style={{ width: `${field.growthProgressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Metrics Grid: Moisture & NDVI */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-xs">
                      <div>
                        <span className="text-[10px] block font-medium text-[var(--text-muted)]">
                          Soil Moisture
                        </span>
                        <span className={`font-bold font-heading ${field.moisturePercentage < 40 ? "text-[var(--danger)]" : "text-[var(--info)]"}`}>
                          {field.moisturePercentage}% H₂O
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] block font-medium text-[var(--text-muted)]">
                          Vegetative NDVI
                        </span>
                        <span className="font-bold font-heading text-[var(--primary)]">
                          {field.ndviIndex || 0.82}
                        </span>
                      </div>
                    </div>

                    {/* Notes */}
                    <p className="text-xs p-2.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] line-clamp-2 leading-relaxed text-[var(--text-secondary)]">
                      <strong className="text-[var(--primary)]">Log: </strong>
                      {field.notes}
                    </p>
                  </div>

                  {/* Card Footer: Quick Actions + Dates */}
                  <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)]">
                      <span>Sown: {field.sowingDate}</span>
                      <span>Harvest: {field.expectedHarvestDate}</span>
                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handle1ClickIrrigate(field)}
                        className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
                        title="1-Click Irrigation Run"
                      >
                        <Droplets className="w-3.5 h-3.5" />
                        <span>Water Plot</span>
                      </button>

                      <button
                        onClick={() => {
                          setActivityModalFieldId(field.id);
                          setActivityModalOpen(true);
                        }}
                        className="btn-secondary text-xs py-1.5 px-3 flex items-center justify-center gap-1 cursor-pointer"
                        title="Record Fertilizer, Spray or Scouting"
                      >
                        <ClipboardList className="w-3.5 h-3.5 text-[var(--primary)]" />
                        <span>Log</span>
                      </button>

                      <button
                        onClick={() => setInspectingField(field)}
                        className="btn-secondary text-xs p-1.5 flex items-center justify-center cursor-pointer"
                        title="Deep Inspect Plot"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* View 2: Interactive GIS Satellite Map */}
      {viewTab === "map" && (
        <FarmGISMap
          onSelectField={(id) => {
            const f = fields.find((item) => item.id === id);
            if (f) setInspectingField(f);
          }}
          onOpenEdit={handleOpenEdit}
        />
      )}

      {/* View 3: Operations Audit Stream */}
      {viewTab === "activity" && (
        <div className="app-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Farm Agronomy Audit Log
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Chronological ledger of irrigation events, fertilizer top-dressing, foliar pest sprays, and scouting logs.
              </p>
            </div>
            <button
              onClick={() => {
                setActivityModalFieldId(fields[0]?.id || null);
                setActivityModalOpen(true);
              }}
              className="btn-primary text-xs py-2 px-3.5 font-semibold cursor-pointer"
            >
              + Record Operation
            </button>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                    {act.type === "irrigation" ? (
                      <Droplets className="w-4 h-4 text-[var(--info)]" />
                    ) : act.type === "created" ? (
                      <Map className="w-4 h-4 text-[var(--primary)]" />
                    ) : (
                      <Activity className="w-4 h-4 text-purple-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-[var(--text-primary)]">
                        {act.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] font-medium">
                        {act.fieldName} ({act.crop})
                      </span>
                    </div>
                    <p className="text-xs mt-0.5 text-[var(--text-secondary)]">
                      {act.description}
                    </p>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      Operator: <strong className="text-[var(--text-secondary)]">{act.operator || "Farmer"}</strong>
                    </span>
                  </div>
                </div>

                <div className="text-right text-[11px] text-[var(--text-muted)] shrink-0 font-mono">
                  <span>{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* View 4: Water Schedule Matrix */}
      {viewTab === "irrigation" && (
        <div className="app-card p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                💧 Farm Water Budgeting &amp; Soil Moisture Matrix
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Real-time soil hydration deficit indicators, automated scheduling, and 1-click water triggers.
              </p>
            </div>

            <button
              onClick={async () => {
                for (const f of fields) {
                  await irrigateField(f.id);
                }
                showToast("Bulk precision irrigation activated across all active parcels!");
              }}
              className="btn-primary text-xs py-2 px-4 font-bold cursor-pointer"
            >
              🌊 Irrigate All Parcels
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => {
              const isDeficit = field.moisturePercentage < 40;
              return (
                <div
                  key={field.id}
                  className={`p-4 rounded-[12px] border flex flex-col justify-between ${
                    isDeficit
                      ? "border-red-500/30 bg-red-500/5"
                      : "border-[var(--border)] bg-[var(--surface-strong)]"
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 font-heading text-[var(--text-primary)]">
                        <span>{getCropEmoji(field.currentCrop)}</span>
                        <span>{field.name}</span>
                      </h4>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isDeficit
                            ? "bg-red-500/15 text-red-500 border border-red-500/30"
                            : "bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20"
                        }`}
                      >
                        {isDeficit ? "⚠️ Water Deficit" : "✅ Hydrated"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-[var(--text-muted)]">Current Soil Moisture:</span>
                      <span className={`text-xl font-bold font-heading ${isDeficit ? "text-[var(--danger)]" : "text-[var(--info)]"}`}>
                        {field.moisturePercentage}% H₂O
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-[var(--surface)] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isDeficit ? "bg-red-500" : "bg-blue-500"
                        }`}
                        style={{ width: `${field.moisturePercentage}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                      <span>Source: {field.irrigationSource}</span>
                      <span>Last: {field.lastIrrigated || "Recently"}</span>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-[var(--border)] flex items-center gap-2">
                    <button
                      onClick={() => handle1ClickIrrigate(field)}
                      className="btn-primary w-full py-1.5 text-xs font-semibold cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Droplets className="w-3.5 h-3.5" />
                      <span>Apply 40mm Irrigation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Field Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-2xl rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Map className="w-5 h-5 text-[var(--primary)]" />
                <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                  {editingField ? "Edit Field Plot" : "Map New Field Plot"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="btn-ghost p-1.5 rounded-[8px] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="py-4 space-y-4 text-xs">
              {/* Plot Name & Acreage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Field Plot Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. North Field Sector A"
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Area (Acres) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    value={areaAcres}
                    onChange={(e) => setAreaAcres(Number(e.target.value))}
                    className="form-input text-xs py-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Crop & Variety with Presets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Crop Type *</label>
                  <input
                    type="text"
                    required
                    value={currentCrop}
                    onChange={(e) => handleCropSelect(e.target.value)}
                    placeholder="e.g. Wheat (HD-2967) / Mustard"
                    className="form-input text-xs py-2"
                  />
                  {/* Quick crop pills */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {["Wheat", "Rice/Paddy", "Corn", "Mustard", "Soybean", "Cotton", "Potato"].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => handleCropSelect(c)}
                        className={`text-[10px] px-2 py-0.5 rounded-[6px] border transition-colors cursor-pointer ${
                          currentCrop.includes(c)
                            ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)]"
                            : "bg-[var(--surface-strong)] text-[var(--text-secondary)] border-[var(--border)] hover:border-[var(--primary)]"
                        }`}
                      >
                        {getCropEmoji(c)} {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Soil Classification</label>
                  <select
                    value={soilType}
                    onChange={(e) => setSoilType(e.target.value)}
                    className="form-select text-xs py-2"
                  >
                    {SOIL_TYPES.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Growth Stage & Progress */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Growth Stage</label>
                  <input
                    type="text"
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                    placeholder="e.g. Flowering / Grain Filling"
                    className="form-input text-xs py-2"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">
                    Growth Progress % ({growthProgress}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={growthProgress}
                    onChange={(e) => setGrowthProgress(Number(e.target.value))}
                    className="w-full accent-[var(--primary)] cursor-pointer mt-2"
                  />
                </div>
              </div>

              {/* Sowing & Harvest Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Sowing Date</label>
                  <input
                    type="date"
                    value={sowingDate}
                    onChange={(e) => setSowingDate(e.target.value)}
                    className="form-input text-xs py-2 font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Expected Harvest Date</label>
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="form-input text-xs py-2 font-mono"
                  />
                </div>
              </div>

              {/* Health & Moisture */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Health Status</label>
                  <select
                    value={healthStatus}
                    onChange={(e) => setHealthStatus(e.target.value)}
                    className="form-select text-xs py-2"
                  >
                    <option value="Excellent">✨ Excellent</option>
                    <option value="Good">✅ Good</option>
                    <option value="Needs Attention">⚠️ Needs Attention</option>
                    <option value="Critical">🚨 Critical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold block mb-1 text-[var(--text-secondary)]">
                    Soil Moisture % ({moisturePercentage}%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={moisturePercentage}
                    onChange={(e) => setMoisturePercentage(Number(e.target.value))}
                    className="form-input text-xs py-2 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Soil Chemistry (NPK, pH, Carbon) */}
              <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] space-y-2">
                <span className="font-semibold block text-[var(--text-primary)] font-heading">
                  🧪 Soil Chemistry (NPK &amp; pH)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block">Nitrogen (N)</label>
                    <input
                      type="number"
                      value={soilN}
                      onChange={(e) => setSoilN(e.target.value)}
                      className="form-input text-xs py-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block">Phosphorus (P)</label>
                    <input
                      type="number"
                      value={soilP}
                      onChange={(e) => setSoilP(e.target.value)}
                      className="form-input text-xs py-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block">Potash (K)</label>
                    <input
                      type="number"
                      value={soilK}
                      onChange={(e) => setSoilK(e.target.value)}
                      className="form-input text-xs py-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block">pH Value</label>
                    <input
                      type="number"
                      step="0.1"
                      value={soilPh}
                      onChange={(e) => setSoilPh(e.target.value)}
                      className="form-input text-xs py-1 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--text-muted)] block">Carbon %</label>
                    <input
                      type="number"
                      step="0.01"
                      value={soilOrganicCarbon}
                      onChange={(e) => setSoilOrganicCarbon(e.target.value)}
                      className="form-input text-xs py-1 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Agronomist Notes */}
              <div>
                <label className="font-semibold block mb-1 text-[var(--text-secondary)]">Plot Notes &amp; Observations</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record crop standing condition, fertilizer schedule, or upcoming tasks..."
                  className="form-input text-xs py-2"
                />
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="btn-secondary text-xs py-2 px-4 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2 px-4 font-semibold cursor-pointer"
                >
                  {editingField ? "Save Changes" : "Create Field Plot"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Field Detail Drawer */}
      {inspectingField && (
        <FieldDetailDrawer
          field={inspectingField}
          onClose={() => setInspectingField(null)}
          onEdit={(f) => {
            setInspectingField(null);
            handleOpenEdit(f);
          }}
          onDelete={(f) => {
            setDeleteConfirmTarget(f);
          }}
          onLogActivity={() => {
            setActivityModalFieldId(inspectingField.id);
            setActivityModalOpen(true);
          }}
        />
      )}

      {/* Activity Log Modal */}
      <FarmActivityLogModal
        isOpen={activityModalOpen}
        onClose={() => setActivityModalOpen(false)}
        initialFieldId={activityModalFieldId}
      />

      {/* Delete Confirmation Modal */}
      <FieldDeleteConfirmModal
        isOpen={!!deleteConfirmTarget}
        fieldName={deleteConfirmTarget?.name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteConfirmTarget(null)}
      />
    </div>
  );
}
