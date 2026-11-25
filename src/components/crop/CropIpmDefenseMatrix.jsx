import React, { useState } from "react";
import {
  ShieldCheck,
  Bug,
  Sparkles,
  AlertTriangle,
  FlaskConical,
  Sprout,
  Activity,
  CheckCircle2,
  ChevronRight,
  Filter,
} from "lucide-react";
import { FULL_CROPS_INTELLIGENCE_CATALOG } from "../../data/cropIntelligenceData.js";

export function CropIpmDefenseMatrix({ isDarkMode }) {
  const [selectedCropId, setSelectedCropId] = useState("cotton");
  const [activeFilter, setActiveFilter] = useState("all"); // all, insect, disease

  const selectedCrop =
    FULL_CROPS_INTELLIGENCE_CATALOG.find((c) => c.id === selectedCropId) ||
    FULL_CROPS_INTELLIGENCE_CATALOG[2]; // cotton

  const ipmList = selectedCrop.ipmProtocols || [];

  const filteredIpm = ipmList.filter((item) => {
    if (activeFilter === "all") return true;
    return item.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="app-card p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                🛡️ Bio-Defense &amp; IPM Protocols
              </span>
              <span className="text-xs text-[var(--text-muted)] font-semibold">
                Economic Threshold Levels (ETL) &amp; Bio-Solutions
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)]">
              Integrated Pest Management (IPM) &amp; Bio-Protection Hub
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-3xl leading-relaxed">
              Prevent chemical resistance using targeted bio-agents, pheromone lures, botanical extracts, and precise ICAR-approved chemical interventions when ETL is breached.
            </p>
          </div>

          {/* Crop Selector Dropdown */}
          <div className="flex items-center gap-3">
            <select
              value={selectedCropId}
              onChange={(e) => setSelectedCropId(e.target.value)}
              className="form-select text-xs font-semibold py-2 cursor-pointer"
            >
              {FULL_CROPS_INTELLIGENCE_CATALOG.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name} ({c.ipmProtocols?.length || 0} Protocols)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="mt-5 pt-4 border-t border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeFilter === "all"
                  ? "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:text-white dark:border-emerald-500 font-bold shadow-sm"
                  : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              All Threats ({ipmList.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("insect")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeFilter === "insect"
                  ? "bg-amber-500 text-white border-amber-500 font-bold shadow-sm"
                  : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              🐛 Insect Pests ({ipmList.filter((i) => i.type === "insect").length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("disease")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                activeFilter === "disease"
                  ? "bg-cyan-600 text-white border-cyan-600 dark:bg-cyan-500 dark:text-white font-bold shadow-sm"
                  : "bg-[var(--surface-subtle)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              🍄 Fungal / Bacterial ({ipmList.filter((i) => i.type === "disease").length})
            </button>
          </div>

          <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">
            Active Crop: <strong className="text-[var(--text-primary)]">{selectedCrop.name}</strong>
          </span>
        </div>
      </div>

      {/* IPM Protocols Bento Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIpm.map((proto, idx) => (
          <div
            key={idx}
            className="app-card p-5 flex flex-col justify-between transition-all"
          >
            <div>
              {/* Header: Threat Name & ETL */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${
                        proto.type === "insect"
                          ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20"
                          : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20"
                      }`}
                    >
                      {proto.type === "insect" ? "Insect Pest" : "Pathogen"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold font-heading text-[var(--text-primary)] mt-1">
                    {proto.name}
                  </h3>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[var(--text-muted)] block uppercase font-semibold">
                    Economic Threshold (ETL)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                    {proto.etl}
                  </span>
                </div>
              </div>

              {/* Symptoms Description */}
              <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] mb-3">
                <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold mb-0.5">
                  Diagnostic Visual Symptoms:
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {proto.symptoms}
                </p>
              </div>

              {/* Biological / Cultural Control */}
              <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 mb-3 space-y-1">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  Primary Biological &amp; Cultural Control:
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {proto.biologicalControl}
                </p>
              </div>
            </div>

            {/* Chemical Intervention (Targeted Backup) */}
            <div className="p-3 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border)] space-y-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Targeted Chemical Option (Post-ETL Breach):
              </span>
              <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400 leading-relaxed">
                {proto.chemicalOption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
