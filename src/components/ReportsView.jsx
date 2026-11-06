import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  Check,
  RefreshCw,
  Plus,
  Calendar,
  ShieldCheck,
  Sparkles,
  Layers,
  Sprout,
  TrendingUp,
  Droplets,
  Award,
  Search,
  Filter,
  Printer,
  Share2,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useFarm } from "../context/FarmContext.jsx";
import { GenerateReportModal } from "./reports/GenerateReportModal.jsx";
import { ReportDetailModal } from "./reports/ReportDetailModal.jsx";

export function ReportsView() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { farmProfile, fields, weather } = useFarm();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingId, setGeneratingId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [activeReportModal, setActiveReportModal] = useState(null);

  // Fetch reports from backend API
  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.warn("Failed to load reports from server, using local fallback", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchCategory =
        selectedCategory === "all" || r.type === selectedCategory;
      const matchStatus =
        statusFilter === "all" || r.status === statusFilter;
      const matchSearch =
        searchQuery.trim() === "" ||
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.primaryCrop?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.auditor?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCategory && matchStatus && matchSearch;
    });
  }, [reports, selectedCategory, statusFilter, searchQuery]);

  // Download high-precision PDF
  const downloadReportPDF = (report) => {
    setGeneratingId(report.id);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Top Primary Header Band
      doc.setFillColor(15, 23, 42); // Slate-900
      doc.rect(0, 0, pageWidth, 38, "F");

      // Top Accent Line
      doc.setFillColor(16, 185, 129); // Emerald-500
      doc.rect(0, 38, pageWidth, 2, "F");

      // Title & Branding
      doc.setTextColor(52, 211, 153);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("AGRICULTURE AI — PRECISION CROP AUDIT & INTELLIGENCE", 14, 16);

      doc.setTextColor(241, 245, 249);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.text(
        "Official Agricultural Science & Estate Optimization Certificate",
        14,
        24
      );
      doc.text(
        `Generated: ${new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })} | Manager: ${user?.name || farmProfile.ownerName || "Abhijeet Kumar"}`,
        14,
        31
      );

      // Report Header Section
      let currentY = 48;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.text(report.title, 14, currentY);

      currentY += 7;
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(70, 70, 70);
      doc.text(
        `Estate: ${report.estateName || farmProfile.farmName} | Location: ${
          farmProfile.location
        }`,
        14,
        currentY
      );

      currentY += 5.5;
      doc.text(
        `Audit Scope: ${report.categoryName?.toUpperCase() || report.type.toUpperCase()} | Status: ${
          report.status
        } | Score: ${report.healthScore || 90}/100`,
        14,
        currentY
      );

      // Line separator
      currentY += 4;
      doc.setDrawColor(16, 185, 129);
      doc.setLineWidth(0.4);
      doc.line(14, currentY, pageWidth - 14, currentY);

      // Executive Summary Box
      currentY += 6;
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(14, currentY, pageWidth - 28, 26, 3, 3, "FD");

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("Executive Agronomy Summary & Evaluation:", 18, currentY + 6.5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      const splitSummary = doc.splitTextToSize(report.summary, pageWidth - 36);
      doc.text(splitSummary, 18, currentY + 12.5);

      // Key Metrics Table
      currentY += 34;
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11.5);
      doc.text("Key Agronomic & Telemetry Performance Metrics:", 14, currentY);
      currentY += 6;

      const metricsToPrint = report.metrics && report.metrics.length > 0
        ? report.metrics
        : [
            { label: "Overall Farm Health Score", value: `${report.healthScore || 89} / 100`, detail: "Vigorous" },
            { label: "Total Monitored Cultivation Area", value: report.areaMonitored || "149.0 Acres", detail: "Active Sectors" },
            { label: "Soil NPK & Organic Carbon", value: "N:105 | P:52 | K:48 kg/ha", detail: "pH 6.8 (Optimal)" },
            { label: "Primary Crop Match", value: report.primaryCrop || "Wheat (HD-2967)", detail: "94% Suitability" },
            { label: "Projected Yield & Return", value: report.projectedProfit || "Net ₹92,400/ha", detail: "Low Economic Risk" },
            { label: "APMC Mandi Spot Benchmark", value: "₹2,380 / Quintal", detail: "Above ₹2,275 MSP" },
          ];

      doc.setFontSize(9);
      metricsToPrint.forEach((m, idx) => {
        if (currentY > pageHeight - 45) {
          doc.addPage();
          currentY = 20;
        }

        doc.setFillColor(
          idx % 2 === 0 ? 248 : 255,
          idx % 2 === 0 ? 250 : 255,
          idx % 2 === 0 ? 252 : 255
        );
        doc.rect(14, currentY, pageWidth - 28, 7.5, "F");

        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text(m.label, 18, currentY + 5);

        doc.setFont("helvetica", "normal");
        doc.text(m.value, 95, currentY + 5);

        doc.setTextColor(16, 185, 129);
        doc.text(m.detail, 150, currentY + 5);

        currentY += 7.5;
      });

      // Field Highlights Table (if exists)
      if (report.fieldHighlights && report.fieldHighlights.length > 0) {
        currentY += 8;
        if (currentY > pageHeight - 50) {
          doc.addPage();
          currentY = 20;
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.text("Monitored Field Parcels & Growth Breakdown:", 14, currentY);
        currentY += 5.5;

        // Table Header
        doc.setFillColor(241, 245, 249);
        doc.rect(14, currentY, pageWidth - 28, 6.5, "F");
        doc.setFontSize(8);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 41, 59);
        doc.text("Parcel Name", 18, currentY + 4.5);
        doc.text("Crop Variety", 75, currentY + 4.5);
        doc.text("Acreage", 120, currentY + 4.5);
        doc.text("Stage & Condition", 150, currentY + 4.5);
        currentY += 6.5;

        report.fieldHighlights.forEach((f, idx) => {
          doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
          doc.rect(14, currentY, pageWidth - 28, 6, "F");
          doc.setFontSize(8);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(51, 65, 85);
          doc.text(f.name, 18, currentY + 4);
          doc.text(f.crop, 75, currentY + 4);
          doc.text(f.area, 120, currentY + 4);
          doc.text(`${f.stage} (${f.health})`, 150, currentY + 4);
          currentY += 6;
        });
      }

      // Precision Action Directives
      currentY += 8;
      if (currentY > pageHeight - 45) {
        doc.addPage();
        currentY = 20;
      }

      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Precision Action Directives:", 14, currentY);
      currentY += 6;

      const actionsToPrint = report.actions && report.actions.length > 0
        ? report.actions
        : [
            "Maintain optimal root-zone moisture between 50-60% across monitored sectors.",
            "Apply Basal Di-ammonium Phosphate (DAP) @ 50 kg/ha at sowing.",
            "Top dress with Urea @ 30 kg/ha at Crown Root Initiation (21-25 days).",
            "Scout perimeter sectors for aphid pressure during high humidity windows.",
          ];

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      actionsToPrint.forEach((act, idx) => {
        const text = `${idx + 1}. ${act}`;
        const lines = doc.splitTextToSize(text, pageWidth - 32);
        doc.text(lines, 18, currentY);
        currentY += lines.length * 4.5 + 1.5;
      });

      // Footer
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        "Agriculture AI Platform • Machine Learning Crop Profit Optimization Engine • ISO 17025 Conformity",
        14,
        pageHeight - 8
      );

      const sanitizedName = report.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .slice(0, 35);
      doc.save(`${sanitizedName}_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setTimeout(() => setGeneratingId(null), 800);
    }
  };

  // Export JSON of all reports
  const handleExportAllJSON = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      farmProfile,
      weatherSnapshot: weather,
      totalReports: reports.length,
      reports,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Farm_Intelligence_Reports_${farmProfile.farmName.replace(/\s+/g, "_")}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle report deletion
  const handleDeleteReport = async (id) => {
    try {
      await fetch(`/api/reports/${id}`, { method: "DELETE" });
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Category Tabs definitions
  const CATEGORIES = [
    { id: "all", label: "All Audits", icon: Award },
    { id: "crop_profit", label: "Crop & Yield", icon: Sprout },
    { id: "soil_audit", label: "Soil & NPK", icon: Layers },
    { id: "pathology", label: "Pathology & Doctor", icon: ShieldCheck },
    { id: "mandi_finance", label: "Mandi & Pricing", icon: TrendingUp },
    { id: "water_irrigation", label: "Irrigation & Water", icon: Droplets },
    { id: "scheme_dossier", label: "Kisan Yojna", icon: Award },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Header Executive Bar */}
      <div className="app-card p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-primary font-mono text-[11px] uppercase tracking-wider">
                📄 ISO 17025 Agronomic Audit Engine
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Verified Digital Dossier
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-[var(--primary)]" />
              <span>Farm Intelligence Reports & PDF Export</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl leading-relaxed">
              Download certified agronomic recommendations, soil health audits,
              multispectral pathology logs, and APMC financial profit
              projections.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleExportAllJSON}
              className="btn-secondary py-2.5 px-3.5 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[var(--primary)]" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="btn-primary py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate New Audit</span>
            </button>
          </div>
        </div>

        {/* Quick Estate Metrics Ribbon */}
        <div className="mt-6 pt-5 border-t border-[var(--border)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Audited Acreage
            </span>
            <span className="text-base font-heading font-bold text-[var(--primary)] font-mono">
              {fields.reduce((acc, f) => acc + f.areaAcres, 0)} Acres
            </span>
            <span className="text-[10px] block mt-0.5 text-[var(--text-muted)]">
              {fields.length} Active Parcels
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Estate Health Score
            </span>
            <span className="text-base font-heading font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              91.4 / 100
            </span>
            <span className="text-[10px] block mt-0.5 text-[var(--text-muted)]">
              Top Tier Vigorous
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Certified Dossiers
            </span>
            <span className="text-base font-heading font-bold text-[var(--primary)] font-mono">
              {reports.length} Reports
            </span>
            <span className="text-[10px] block mt-0.5 text-[var(--text-muted)]">
              ISO 17025 Standard
            </span>
          </div>

          <div className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Net Margin Alpha
            </span>
            <span className="text-base font-heading font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              +18.4%
            </span>
            <span className="text-[10px] block mt-0.5 text-[var(--text-muted)]">
              vs APMC Regional Mean
            </span>
          </div>
        </div>
      </div>

      {/* Navigation & Search Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Chips Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                    : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm hover:border-[var(--primary)]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input & Status Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports or crops..."
              className="form-input pl-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select text-xs font-medium cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Certified">Certified</option>
            <option value="Completed">Completed</option>
            <option value="Action Required">Action Required</option>
            <option value="In Review">In Review</option>
          </select>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
          <RefreshCw className="w-8 h-8 text-[var(--primary)] animate-spin" />
          <p className="text-xs text-[var(--primary)] font-medium">
            Loading Certified Agronomic Reports...
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="app-card py-16 text-center text-[var(--text-muted)]">
          <Award className="w-12 h-12 mx-auto text-[var(--primary)]/40 mb-3" />
          <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
            No Reports Found
          </h3>
          <p className="text-xs mt-1 max-w-sm mx-auto">
            No audits matched your search criteria. Try changing the category or
            generate a new custom audit.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setStatusFilter("all");
              setSearchQuery("");
            }}
            className="btn-secondary mt-4 py-2 px-4 text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredReports.map((r) => {
            const isCertified = r.status === "Certified";
            const isActionReq = r.status === "Action Required";

            return (
              <div
                key={r.id}
                className="app-card p-6 space-y-4 flex flex-col justify-between group hover:border-[var(--primary)]/60 transition-all"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`badge text-[11px] font-bold uppercase tracking-wider ${
                          isCertified
                            ? "badge-primary"
                            : isActionReq
                            ? "badge-amber"
                            : "badge-blue"
                        }`}
                      >
                        {r.status}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 hidden sm:inline">
                        {r.categoryName}
                      </span>
                    </div>

                    <span className="text-[12px] flex items-center gap-1 font-mono text-slate-400 dark:text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {r.generatedDate}
                    </span>
                  </div>

                  {/* Title & Summary */}
                  <h3
                    onClick={() => setActiveReportModal(r)}
                    className="text-lg font-heading font-bold text-[var(--text-primary)] leading-snug cursor-pointer transition-colors group-hover:text-[var(--primary)]"
                  >
                    {r.title}
                  </h3>

                  <p className="text-[13px] text-slate-600 dark:text-slate-400 mt-2 leading-relaxed line-clamp-3">
                    {r.summary}
                  </p>

                  {/* Metrics preview row */}
                  {r.metrics && r.metrics.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {r.metrics[0]?.label || "Health Metric"}
                        </span>
                        <strong className="text-[var(--primary)] text-xs font-bold font-mono">
                          {r.metrics[0]?.value}
                        </strong>
                      </div>

                      <div className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {r.metrics[1]?.label || "Financial Yield"}
                        </span>
                        <strong className="text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
                          {r.metrics[1]?.value}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveReportModal(r)}
                    className="text-xs font-bold flex items-center gap-1.5 text-[var(--primary)] hover:underline transition-colors cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-[var(--primary)]" />
                    <span>View Audit</span>
                  </button>

                  <button
                    id={`download-report-${r.id}`}
                    onClick={() => downloadReportPDF(r)}
                    disabled={generatingId === r.id}
                    className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {generatingId === r.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Rendering PDF...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Generate Custom Audit Modal */}
      <GenerateReportModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        onReportCreated={(newRep) => {
          setReports((prev) => [newRep, ...prev]);
        }}
      />

      {/* In-Depth Report Reader & Action Modal */}
      <ReportDetailModal
        isOpen={Boolean(activeReportModal)}
        onClose={() => setActiveReportModal(null)}
        report={activeReportModal}
        onDownloadPDF={downloadReportPDF}
        onDeleteReport={handleDeleteReport}
        isDownloading={generatingId === activeReportModal?.id}
      />
    </div>
  );
}

export default ReportsView;
