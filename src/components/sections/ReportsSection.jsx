import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  Filter,
  Search,
  Sparkles,
  Printer,
  ShieldCheck,
  ChevronRight,
  ArrowDownToLine,
} from "lucide-react";

export function ReportsSection({ onOpenReportDetail, onGenerateReportModal }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const reportsList = [
    {
      id: "rep_crop_suitability_rabi26",
      title: "Rabi 2025-26 Crop Suitability & Profit Optimization Report",
      category: "Crop Suitability",
      date: "Nov 03, 2025",
      fileSize: "1.4 MB",
      status: "Verified PAU-Grounded",
      description: "Complete 14.5 acre farm allocation plan recommending Wheat HD-2967, Mustard, and Chickpea with ₹4,82,500 projected profit.",
    },
    {
      id: "rep_soil_health_audit",
      title: "Comprehensive Soil Fertility & NPK Chemical Audit",
      category: "Soil Health",
      date: "Oct 29, 2025",
      fileSize: "840 KB",
      status: "Official SHC Format",
      description: "Audited analysis of Nitrogen (245 kg/ha), Phosphorus (18.5 kg/ha), Potassium (210 kg/ha), and organic carbon (0.68%).",
    },
    {
      id: "rep_leaf_pathology_summary",
      title: "MobileNetV3 Leaf Pathology & Disease Prescription Record",
      category: "Disease Detection",
      date: "Oct 25, 2025",
      fileSize: "2.1 MB",
      status: "Active Diagnostic",
      description: "Visual inspection heatmaps for Yellow Rust prevention in Wheat Sector Plot A2 with chemical and bio-fungicide ratios.",
    },
    {
      id: "rep_apmc_mandi_forecast",
      title: "APMC Mandi Wholesale 30-Day Econometric Price Projections",
      category: "Market Forecast",
      date: "Oct 20, 2025",
      fileSize: "1.1 MB",
      status: "Market Intelligence",
      description: "Wholesale arrival statistics, modal prices, and hold/sell thresholds for Khanna, Bharatpur, and Karnal mandis.",
    },
    {
      id: "rep_farm_financial_pnl",
      title: "Annual Agricultural P&L & Cultivation Expense Audit",
      category: "Profit & Risk",
      date: "Oct 15, 2025",
      fileSize: "950 KB",
      status: "Audited Ledger",
      description: "Itemized gross revenues, input invoices, machinery rentals, and net profit margins across 5 registered land parcels.",
    },
  ];

  const categories = ["All", "Crop Suitability", "Soil Health", "Disease Detection", "Market Forecast", "Profit & Risk"];

  const filteredReports =
    activeCategory === "All"
      ? reportsList
      : reportsList.filter((r) => r.category === activeCategory);

  const handleDownloadReport = (report) => {
    // Generate browser print / PDF download flow
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${report.title} — AI Crop Profit</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #0F172A; }
              .header { border-bottom: 2px solid #15803D; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
              .brand { font-size: 24px; font-weight: bold; color: #15803D; }
              .title { font-size: 20px; font-weight: bold; margin-bottom: 10px; }
              .meta { font-size: 13px; color: #64748B; margin-bottom: 25px; }
              .content { font-size: 14px; line-height: 1.6; background: #F8FAFC; padding: 25px; border-radius: 12px; border: 1px solid #E2E8F0; }
              .footer { margin-top: 50px; font-size: 12px; color: #94A3B8; text-align: center; border-top: 1px solid #E2E8F0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <div class="brand">🌾 AI Crop Profit</div>
                <div style="font-size: 12px; color: #64748B;">Smart Farming, Higher Profit</div>
              </div>
              <div style="text-align: right; font-size: 12px; color: #64748B;">
                Date: ${report.date}<br />
                Status: Verified Official Record
              </div>
            </div>
            <div class="title">${report.title}</div>
            <div class="meta">Category: ${report.category} • Certified Reference Document</div>
            <div class="content">
              <h3>Executive Agronomy Summary</h3>
              <p>${report.description}</p>
              <h4>Key Data Metrics:</h4>
              <ul>
                <li>Evaluation Accuracy: 98.4% PAU & ICAR Grounded</li>
                <li>Location: Phagwara, Punjab</li>
                <li>Farmer: Satnam Singh (14.5 Total Cultivated Acres)</li>
              </ul>
            </div>
            <div class="footer">
              Generated automatically by AI Crop Profit Platform • www.aicrop.profit
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <section id="reports" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800 mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Certified Documentation Repository</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Reports & Agricultural Documentation
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Export high-resolution PDF agronomy blueprints, soil health cards, disease diagnostic certificates, and P&L statements.
            </p>
          </div>

          <button
            onClick={() => onGenerateReportModal && onGenerateReportModal()}
            className="h-10 px-4 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Custom Report</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 py-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#15803D] text-white font-semibold shadow-xs"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 hover:border-green-300 dark:hover:border-emerald-700 transition-all shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-2.5">
                  <span className="px-2.5 py-0.5 rounded-full font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800">
                    {report.category}
                  </span>
                  <span className="text-slate-400">{report.date}</span>
                </div>

                <h3 className="text-sm font-bold font-heading text-slate-900 dark:text-white leading-snug mb-2">
                  {report.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {report.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-750 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  PDF • {report.fileSize}
                </span>

                <button
                  onClick={() => handleDownloadReport(report)}
                  className="h-8 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#15803D] hover:text-[#15803D] text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                >
                  <ArrowDownToLine className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReportsSection;

