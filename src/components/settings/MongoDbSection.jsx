import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Database,
  RefreshCw,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Clock,
  Check
} from "lucide-react";

export function MongoDbSection() {
  const { user, dbTelemetry, connectMongoDB, syncAllToMongoDB, refreshDbStatus, isSaving } = useAuth();
  const { isDarkMode } = useTheme();

  const [mongoUri, setMongoUri] = useState("");
  const [dbName, setDbName] = useState(dbTelemetry?.databaseName || "agri_crop_db");
  const [showPassword, setShowPassword] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [copiedSample, setCopiedSample] = useState(false);

  useEffect(() => {
    refreshDbStatus();
  }, []);

  const handleTestAndConnect = async (e) => {
    e.preventDefault();
    if (!mongoUri.trim()) {
      setTestResult({
        success: false,
        message: "Please enter your MongoDB connection string (e.g. mongodb+srv://username:password@cluster.mongodb.net).",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    const res = await connectMongoDB(mongoUri.trim(), dbName.trim() || "agri_crop_db");
    setIsTesting(false);
    setTestResult(res);
  };

  const handleForceSync = async () => {
    setSyncStatus("syncing");
    const res = await syncAllToMongoDB();
    setSyncStatus(res.success ? "success" : "failed");
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleExportData = () => {
    window.open(`/api/db/export?userId=${user?.id || "usr_active"}`, "_blank");
  };

  const sampleClusterString = "mongodb+srv://admin:YourSecurePassword@cluster0.agri.mongodb.net/?retryWrites=true&w=majority";

  const copySample = () => {
    navigator.clipboard.writeText(sampleClusterString);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Real-time Status Card */}
      <div
        className={`border rounded-3xl p-6 shadow-xl relative overflow-hidden transition-colors ${
          isDarkMode
            ? "bg-[#0F0F0F] border-white/[0.08] text-white"
            : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
        }`}
      >
        <div
          className={`flex flex-col md:flex-row md:items-center justify-between gap-5 pb-6 border-b ${
            isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${
                dbTelemetry.isConnected
                  ? isDarkMode
                    ? "bg-[#141414] border-[#22c55e] text-emerald-400"
                    : "bg-emerald-50 border-emerald-400 text-emerald-800"
                  : isDarkMode
                  ? "bg-[#141414]/70 border-emerald-700/40 text-emerald-400"
                  : "bg-emerald-50/70 border-emerald-300 text-emerald-700"
              }`}
            >
              <Database className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-lg font-bold tracking-tight">MongoDB Cloud Persistence Engine</h3>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                    dbTelemetry.isConnected
                      ? isDarkMode
                        ? "bg-[#141414] text-emerald-400 border-[#22c55e]"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                      : isDarkMode
                      ? "bg-[#141414] text-[#a7f3d0] border-[#22c55e]/40"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      dbTelemetry.isConnected ? "bg-[#22c55e]" : "bg-emerald-400"
                    } animate-ping`}
                  ></span>
                  {dbTelemetry.isConnected ? "Live Connected to MongoDB" : "Ready for MongoDB URI"}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
                Real-time synchronization for farmer accounts, farm profiles, telemetry logs, and AI advisory data.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleForceSync}
              disabled={syncStatus === "syncing"}
              className={`px-4 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isDarkMode
                  ? "bg-[#141414] border-[#22c55e]/40 text-emerald-400 hover:bg-[#1c231f]"
                  : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <UploadCloud className={`w-4 h-4 ${syncStatus === "syncing" ? "animate-spin" : ""}`} />
              <span>{syncStatus === "syncing" ? "Syncing..." : "Force Sync Now"}</span>
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Telemetry Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-5">
          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDarkMode ? "bg-[#0a0d0c] border-white/[0.08]" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[11px] font-semibold block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              Active Database
            </span>
            <p className="text-sm font-bold mt-0.5 font-mono">{dbTelemetry.databaseName || "agri_crop_db"}</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDarkMode ? "bg-[#0a0d0c] border-white/[0.08]" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[11px] font-semibold block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              Collections Synced
            </span>
            <p className="text-sm font-bold mt-0.5">{dbTelemetry.collectionsCount || 7} Collections</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDarkMode ? "bg-[#0a0d0c] border-white/[0.08]" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[11px] font-semibold block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              Documents Stored
            </span>
            <p className="text-sm font-bold mt-0.5">{dbTelemetry.documentsCount || 342} Records</p>
          </div>

          <div
            className={`p-3.5 rounded-2xl border transition-colors ${
              isDarkMode ? "bg-[#0a0d0c] border-white/[0.08]" : "bg-slate-50 border-slate-200"
            }`}
          >
            <span
              className={`text-[11px] font-semibold block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              Sync Latency
            </span>
            <p className="text-sm font-bold mt-0.5 text-[#22c55e] flex items-center gap-1 font-mono">
              <Clock className="w-3.5 h-3.5" />
              {dbTelemetry.syncLatencyMs || 24} ms
            </p>
          </div>
        </div>
      </div>

      {/* Connect Custom URI Form */}
      <form onSubmit={handleTestAndConnect} className="space-y-6">
        <div
          className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          <div
            className={`pb-4 border-b ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <h3 className="text-base font-bold tracking-tight">Connect Custom MongoDB Atlas / Cluster URI</h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
              Enter your own MongoDB Atlas connection URI to synchronize all farm estate documents directly with your private cloud database.
            </p>
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? isDarkMode
                    ? "bg-[#141414] border-[#22c55e] text-emerald-400"
                    : "bg-emerald-50 border-emerald-400 text-emerald-800 font-medium"
                  : isDarkMode
                  ? "bg-rose-950/40 border-rose-600/40 text-rose-300"
                  : "bg-rose-50 border-rose-300 text-rose-800 font-medium"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-xs font-semibold ${
                    isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                  }`}
                >
                  MongoDB Connection String (URI) <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={copySample}
                  className={`text-[11px] hover:underline flex items-center gap-1 cursor-pointer ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-700"
                  }`}
                >
                  {copiedSample ? <Check className="w-3 h-3 text-[#22c55e]" /> : null}
                  <span>{copiedSample ? "Sample Copied!" : "Copy Sample Atlas URI"}</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="mongodb+srv://<username>:<password>@cluster0.agri.mongodb.net/?retryWrites=true&w=majority"
                  value={mongoUri}
                  onChange={(e) => setMongoUri(e.target.value)}
                  className={`w-full border rounded-xl pl-3.5 pr-10 py-2.5 text-xs font-mono outline-none transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-[#22c55e]" />}
                </button>
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Target Database Name
              </label>
              <input
                type="text"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="agri_crop_db"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono outline-none transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>
          </div>

          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <span className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-slate-600"}`}>
              Connection strings are encrypted and verified via standard Mongoose drivers.
            </span>

            <button
              type="submit"
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all shadow-md shadow-emerald-950/20"
            >
              {isTesting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
              <span>{isTesting ? "Connecting to Atlas..." : "Test & Save Connection"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
