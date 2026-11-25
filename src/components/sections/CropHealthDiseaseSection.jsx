// src/components/sections/CropHealthDiseaseSection.jsx
import React, { useState } from "react";
import { Sprout, ScanEye, UploadCloud, ArrowRight, RefreshCw, X, BookmarkPlus, CheckCircle2 } from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";

const SEVERITY_STYLE = {
  Healthy: "bg-emerald-100 text-emerald-800",
  Low: "bg-emerald-100 text-emerald-800",
  Moderate: "bg-amber-100 text-amber-800",
  High: "bg-orange-100 text-orange-800",
  Critical: "bg-rose-100 text-rose-800",
};

/** Resize big phone photos before upload (faster + cheaper AI call) */
function fileToResizedDataUrl(file, maxSide = 1024, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function CropHealthDiseaseSection({ onOpenDiseaseReport, onOpenFullScanner }) {
  const { fields = [], addDiagnosis } = useFarm();
  const [leaf, setLeaf] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  /* ----- real health numbers from the user's fields ----- */
  const total = fields.length;
  const healthy = fields.filter((f) => ["Excellent", "Good"].includes(f.healthStatus)).length;
  const attention = fields.filter((f) => f.healthStatus === "Needs Attention").length;
  const critical = fields.filter((f) => f.healthStatus === "Critical").length;
  const pct = total ? Math.round((healthy / total) * 100) : 0;
  const CIRC = 251.2;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Sirf image file (JPG/PNG) upload karein.");
    try {
      setLeaf(await fileToResizedDataUrl(file));
      setResult(null);
      setSaved(false);
      setError("");
    } catch {
      setError("Image read nahi ho paayi. Dusri photo try karein.");
    }
  };

  const clearLeaf = () => { setLeaf(null); setResult(null); setError(""); setSaved(false); };

  const handleAnalyze = async () => {
    if (!leaf || analyzing) return;
    setAnalyzing(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/gemini/diagnose-leaf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: leaf,
          mimeType: "image/jpeg",
          cropHint: (fields[0]?.currentCrop || "Unknown crop").split("(")[0].trim(),
        }),
      });
      if (!res.ok) throw new Error("diagnose");
      const data = await res.json();
      setResult({ ...data.diagnosis, source: data.source });
    } catch {
      setError("Diagnosis fail ho gaya. Internet check karke dobara try karein.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result || saved) return;
    addDiagnosis?.({
      diseaseName: result.diseaseName,
      cropIdentified: result.cropIdentified,
      severity: result.severity,
      confidenceScore: result.confidenceScore,
      chemicalTreatment: result.chemicalTreatment,
      organicRemedy: result.organicRemedy,
    });
    setSaved(true);
  };

  const isOffline = result?.source?.startsWith("local");

  return (
    <section id="crop-health-disease" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-stretch">
        {/* ===== Crop health overview ===== */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">Crop Health Overview</h3>
            </div>
            <button onClick={onOpenDiseaseReport} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
              <span>View Report</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {total === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 py-8">
              Field add karte hi yahan aapki crop health dikhegi.
            </div>
          ) : (
            <div className="flex items-center justify-between gap-4 py-2">
              <div className="relative w-[120px] h-[120px] flex items-center justify-center shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E2E8F0" strokeWidth="8.5" className="dark:stroke-slate-700" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#15803D" strokeWidth="8.5" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - pct / 100)} strokeLinecap="round" style={{ transition: "stroke-dashoffset .6s ease" }} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-extrabold font-heading text-slate-900 dark:text-white leading-none">{pct}%</span>
                  <span className="text-[11px] text-slate-500 font-medium mt-1">Healthy</span>
                </div>
              </div>

              <div className="space-y-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 flex-1 px-2">
                {[
                  { c: "bg-emerald-500", l: "Healthy Plots", v: healthy },
                  { c: "bg-amber-400", l: "Attention Required", v: attention },
                  { c: "bg-rose-500", l: "Critical", v: critical },
                ].map((r) => (
                  <div key={r.l} className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${r.c}`} /> <span>{r.l}</span></div>
                    <strong className="text-slate-900 dark:text-white text-sm">{r.v}</strong>
                  </div>
                ))}
              </div>

              <div className="w-28 h-24 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shrink-0 hidden sm:block bg-emerald-50 dark:bg-slate-800">
                <img
                  src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=400&q=80"
                  alt="Healthy green leaves"
                  loading="lazy"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>

        {/* ===== AI disease detection ===== */}
        <div className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200/90 dark:border-slate-800 p-6 sm:p-7 shadow-2xs hover:shadow-xs transition-shadow flex flex-col">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-100/90 dark:border-emerald-900/60">
                <ScanEye className="w-5 h-5 stroke-[2.2]" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white">AI Disease Detection</h3>
            </div>
            <button onClick={onOpenFullScanner} className="text-xs font-semibold text-[#15803D] hover:text-[#16A34A] flex items-center gap-1 cursor-pointer">
              <span>Full Scanner</span> <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 mb-4">Pattay ki photo upload karein – bimari aur ilaaj turant milega.</p>

          <div className="flex items-center gap-3.5">
            {leaf ? (
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700 shrink-0">
                <img src={leaf} alt="Uploaded leaf" className="w-full h-full object-cover" />
                <button onClick={clearLeaf} aria-label="Remove photo" className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : null}

            <label
              htmlFor="diseaseLeafUpload"
              className="flex-1 h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-2xl flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all"
            >
              <input id="diseaseLeafUpload" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              <UploadCloud className="w-6 h-6 text-emerald-600 mb-1" />
              <span className="text-xs font-semibold text-slate-800 dark:text-white">{leaf ? "Change Image" : "Upload Image"}</span>
              <span className="text-[10px] text-slate-400">JPG / PNG, click to choose</span>
            </label>

            <button
              onClick={handleAnalyze}
              disabled={!leaf || analyzing}
              className="h-11 px-5 rounded-full bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /><span>Analyzing…</span></>
              ) : (
                <><span>Analyze</span><ArrowRight className="w-3.5 h-3.5" /></>
              )}
            </button>
          </div>

          {error && <p className="mt-3 text-xs font-medium text-rose-600">{error}</p>}

          {result && (
            <div className="mt-3.5 p-3.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-900 text-xs space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <strong>{result.diseaseName}</strong>
                  <span className="text-slate-500 dark:text-slate-400"> · {result.cropIdentified} · {result.confidenceScore}% confidence</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${SEVERITY_STYLE[result.severity] || "bg-slate-100 text-slate-700"}`}>{result.severity}</span>
              </div>
              {result.chemicalTreatment && <p><strong>Treatment:</strong> {result.chemicalTreatment}</p>}
              {result.organicRemedy && <p><strong>Organic:</strong> {result.organicRemedy}</p>}
              {isOffline && (
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  AI vision key set nahi hai – ye sample guidance hai, photo ka actual analysis nahi.
                </p>
              )}
              <button
                onClick={handleSave}
                disabled={saved}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] dark:text-emerald-400 hover:underline disabled:no-underline disabled:opacity-70 cursor-pointer"
              >
                {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                {saved ? "Saved to history" : "Save to diagnosis history"}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default CropHealthDiseaseSection;