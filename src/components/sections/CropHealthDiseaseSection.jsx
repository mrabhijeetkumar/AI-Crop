import React, { useState } from "react";
import {
  Sprout,
  ScanEye,
  UploadCloud,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { SAMPLE_LEAVES } from "../../data/sampleDiseases.js";

export function CropHealthDiseaseSection({ onOpenDiseaseReport, onOpenFullScanner }) {
  const [selectedLeaf, setSelectedLeaf] = useState(
    "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80"
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisDone, setDiagnosisDone] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedLeaf(event.target.result);
        setDiagnosisDone(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setDiagnosisDone(true);
    }, 1000);
  };

  return (
    <section id="crop-health-disease" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
        {/* ================= CARD 1: CROP HEALTH OVERVIEW ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                  <Sprout className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  Crop Health Overview
                </h3>
              </div>
              <button
                onClick={() => {
                  if (onOpenDiseaseReport) onOpenDiseaseReport();
                  else {
                    const el = document.getElementById("reports");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Content matching screenshot: Donut ring on left, metrics in middle, leaf photo on right */}
            <div className="flex items-center justify-between gap-4 py-2">
              {/* Circular Donut Ring */}
              <div className="relative w-30 h-30 flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8.5"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#15803D"
                    strokeWidth="8.5"
                    strokeDasharray="251.2"
                    strokeDashoffset="20.1" // 92%
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl sm:text-[26px] font-extrabold font-heading text-slate-900 dark:text-white leading-none">
                    92%
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">
                    Healthy
                  </span>
                </div>
              </div>

              {/* Status List with color dots */}
              <div className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 px-2">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Healthy Crops</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white text-sm">3</strong>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <span>Attention Required</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white text-sm">1</strong>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Critical</span>
                  </div>
                  <strong className="text-slate-900 dark:text-white text-sm">0</strong>
                </div>
              </div>

              {/* Leaf close-up photo */}
              <div className="w-28 h-24 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xs shrink-0 hidden sm:block">
                <img
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80"
                  alt="Healthy Green Leaves"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ================= CARD 2: AI DISEASE DETECTION ================= */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60 shadow-2xs">
                  <ScanEye className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">
                  AI Disease Detection
                </h3>
              </div>
              <button
                onClick={() => {
                  if (onOpenFullScanner) onOpenFullScanner();
                  else {
                    const el = document.getElementById("crop-health-disease");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>View Details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Upload a crop image to detect diseases and get instant agronomic remedies
            </p>

            {/* Elements matching screenshot: Upload box + Diseased leaf photo + Analyze button */}
            <div className="flex items-center justify-between gap-3.5">
              {/* Upload Image Box */}
              <label
                htmlFor="diseaseLeafUpload"
                className="flex-1 h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-emerald-50/30 transition-all"
              >
                <input
                  id="diseaseLeafUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
                <span className="text-xs font-semibold text-slate-800 dark:text-white">
                  Upload Image
                </span>
                <span className="text-[10px] text-slate-400">
                  Drag &amp; drop or click
                </span>
              </label>

              {/* Sample diseased leaf thumbnail */}
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 shadow-2xs shrink-0">
                <img
                  src={selectedLeaf}
                  alt="Diseased Leaf Sample"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Analyze Crop Button */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="h-11 px-5 rounded-full bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 active:scale-[0.98]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze Crop</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>

            {/* Result diagnosis banner when analyzed */}
            {diagnosisDone && (
              <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/90 text-emerald-800 border border-emerald-200 text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
                <span>
                  <strong>Diagnosis:</strong> Early Leaf Rust detected (96.4% confidence). Apply Propiconazole 25% EC @ 200ml/acre.
                </span>
                <span className="font-bold text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Treated</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default CropHealthDiseaseSection;
