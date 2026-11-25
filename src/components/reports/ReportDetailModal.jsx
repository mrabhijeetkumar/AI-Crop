import React, { useState } from "react";
import {
  X,
  Download,
  Printer,
  Share2,
  Check,
  Award,
  Layers,
  Sprout,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Building,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export function ReportDetailModal({
  isOpen,
  onClose,
  report,
  onDownloadPDF,
  onDeleteReport,
  isDownloading,
}) {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

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

  if (!isOpen || !report) return null;

  const handleCopySummary = () => {
    const textToCopy = `*${report.title}*\nEstate: ${report.estateName}\nAuditor: ${report.auditor}\nStatus: ${report.status}\nDate: ${report.generatedDate}\n\n*Summary:*\n${report.summary}\n\n*Key Actions:*\n${report.actions?.map((a, i) => `${i + 1}. ${a}`).join("\n") || ""}\n\nGenerated via AI Crop Intelligence Platform`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🌾 *Farm Intelligence Report*\n*${report.title}*\n\n*Summary:* ${report.summary}\n\n*Health Score:* ${report.healthScore || 90}/100\n*Auditor:* ${report.auditor}\n*Estate:* ${report.estateName}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto overscroll-contain">
      <div className="app-card relative w-full max-w-4xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden custom-scrollbar">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-header)]/80 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="badge badge-emerald text-[10px] font-bold">
                  {report.status}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  Report ID: {report.id}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white tracking-tight line-clamp-1">
                {report.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopySummary}
              title="Copy Summary"
              className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              title="Share on WhatsApp"
              className="py-2 px-3 rounded-xl bg-emerald-600/10 border border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>WhatsApp</span>
            </button>

            <button
              onClick={() => onDownloadPDF(report)}
              disabled={isDownloading}
              className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar print:p-0">
          {/* Document Header Band */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="badge badge-emerald text-[10px] font-bold uppercase tracking-wider">
                  Certified Farm Audit
                </span>
                <span className="text-xs text-[var(--primary)] font-medium">
                  {report.categoryName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-heading font-bold text-[var(--text-primary)]">{report.title}</h1>
              <p className="text-xs text-[var(--text-secondary)] mt-1">
                Audited Estate:{" "}
                <strong className="text-[var(--primary)]">{report.estateName}</strong> |
                Lead Auditor: <strong className="text-[var(--text-primary)]">{report.auditor}</strong>
              </p>
            </div>

            <div className="text-left sm:text-right text-xs shrink-0">
              <div className="font-mono text-[11px] text-[var(--text-muted)]">
                Audit Date: {report.generatedDate}
              </div>
              <div className="text-xs mt-0.5 font-bold font-mono text-emerald-600 dark:text-emerald-400">
                Score: {report.healthScore || 90} / 100
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 text-[var(--text-primary)] font-heading">
              <Award className="w-4 h-4 text-emerald-500" />
              <span>Executive Agronomy Summary</span>
            </h3>
            <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] leading-relaxed text-xs sm:text-sm text-[var(--text-secondary)] shadow-sm">
              {report.summary}
            </div>
          </div>

          {/* Key Metrics Table */}
          {report.metrics && report.metrics.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 text-[var(--text-primary)] font-heading">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Key Agronomic & Telemetry Performance Metrics</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {report.metrics.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm"
                  >
                    <span className="text-[10.5px] uppercase font-bold text-[var(--text-muted)] block">
                      {m.label}
                    </span>
                    <div className="text-base font-heading font-bold text-[var(--primary)] font-mono mt-0.5">
                      {m.value}
                    </div>
                    <div className="text-[11px] mt-0.5 font-medium text-[var(--text-muted)]">
                      {m.detail}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitored Parcels / Field Highlights */}
          {report.fieldHighlights && report.fieldHighlights.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-heading">
                <Sprout className="w-4 h-4 text-emerald-500" />
                <span>Monitored Field Parcels & Growth Stages</span>
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                      <th className="p-3 font-bold">Field Parcel</th>
                      <th className="p-3 font-bold">Current Crop</th>
                      <th className="p-3 font-bold">Acreage</th>
                      <th className="p-3 font-bold">Physiological Stage</th>
                      <th className="p-3 font-bold">Condition</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {report.fieldHighlights.map((f, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-900 dark:text-white">{f.name}</td>
                        <td className="p-3 text-emerald-600 dark:text-emerald-400 font-medium">
                          {f.crop}
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-400">{f.area}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{f.stage}</td>
                        <td className="p-3">
                          <span className="badge badge-emerald text-[10px]">
                            {f.health}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Action Directives */}
          {report.actions && report.actions.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-2.5 flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-heading">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Precision Agronomy Directives</span>
              </h3>
              <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2.5">
                {report.actions.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Footer & Compliance */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <div>
              Certified by AI Crop Platform • ICAR/PAU Agronomic Intelligence Standard • ISO 17025 Conformity
            </div>
            {onDeleteReport && (
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to delete "${report.title}"?`
                    )
                  ) {
                    onDeleteReport(report.id);
                    onClose();
                  }
                }}
                className="text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportDetailModal;
