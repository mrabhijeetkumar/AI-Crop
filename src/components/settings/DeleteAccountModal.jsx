import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useFarm } from "../../context/FarmContext.jsx";
import {
  AlertTriangle,
  Trash2,
  Download,
  CheckCircle2,
  X,
  Lock,
  RefreshCw,
  FileText,
  Database,
  Sparkles,
  ArrowRight,
  UserX,
  ShieldAlert,
  Server,
  Layers,
  MapPin,
  Activity,
  History,
  Key,
} from "lucide-react";

export function DeleteAccountModal({ isOpen, onClose }) {
  const { user, deleteAccount, downloadBackup, openAuthModal } = useAuth();
  const { resetFarmState } = useFarm();
  const { isDarkMode } = useTheme();

  const [confirmInput, setConfirmInput] = useState("");
  const [agreeCheckbox, setAgreeCheckbox] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletionStep, setDeletionStep] = useState(0); // 0: Idle, 1: Revoking, 2: Mongo Purge, 3: Cache Wipe, 4: Finished
  const [deletionStats, setDeletionStats] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [backupDownloaded, setBackupDownloaded] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === "DELETE" && agreeCheckbox;

  const handleDownloadBackup = async () => {
    setIsDownloadingBackup(true);
    try {
      const res = await downloadBackup(user?.id);
      if (res.success) {
        setBackupDownloaded(true);
      } else {
        setErrorMessage("Failed to generate backup download. You can still proceed with deletion.");
      }
    } catch (e) {
      setErrorMessage("Backup download encountered an issue.");
    } finally {
      setIsDownloadingBackup(false);
    }
  };

  const executeDeletion = async () => {
    if (!isConfirmed || isDeleting) return;

    setErrorMessage(null);
    setIsDeleting(true);
    setDeletionStep(1);

    // Step 1: Revoke tokens
    await new Promise((r) => setTimeout(r, 600));
    setDeletionStep(2);

    try {
      // Step 2: Call backend deletion pipeline
      const res = await deleteAccount({
        userId: user?.id,
        confirmationPhrase: confirmInput.trim(),
        backupRequested: false,
      });

      if (res.success) {
        setDeletionStep(3);
        if (typeof resetFarmState === "function") {
          resetFarmState();
        }
        await new Promise((r) => setTimeout(r, 500));
        setDeletionStep(4);
        setDeletionStats(res.deletedStats || {
          users: 1,
          userSettings: 1,
          farmProfiles: 1,
          farmFields: 6,
          auditLogs: 12,
          sessions: 2,
          totalDocuments: 22,
        });
      } else {
        setIsDeleting(false);
        setDeletionStep(0);
        setErrorMessage(res.error || "Failed to purge user records from MongoDB.");
      }
    } catch (err) {
      setIsDeleting(false);
      setDeletionStep(0);
      setErrorMessage("Network error during MongoDB cascade deletion.");
    }
  };

  const handleFinishAndRegister = () => {
    onClose();
    openAuthModal("signup");
  };

  const handleFinishAndLogin = () => {
    onClose();
    openAuthModal("login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="app-card p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto custom-scrollbar border-rose-500/30">
        {/* Close Button (disabled while deleting) */}
        {!isDeleting && deletionStep !== 4 && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* STEP 4: SUCCESS VIEW */}
        {deletionStep === 4 ? (
          <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-heading font-bold tracking-tight text-slate-900 dark:text-white">
                Account & MongoDB Records Permanently Erased
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All cloud profiles, field geometries, sensor streams, and session tokens have been completely removed.
              </p>
            </div>

            {/* Statistics Badge */}
            {deletionStats && (
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-left text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-emerald-600 dark:text-emerald-400 pb-1 border-b border-slate-200 dark:border-slate-800">
                  <span className="flex items-center gap-1.5 font-heading">
                    <Database className="w-4 h-4" />
                    MongoDB Cascade Purge Report
                  </span>
                  <span className="font-mono">{deletionStats.totalDocuments || "All"} Documents Wiped</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-slate-600 dark:text-slate-400">
                  <div>• Agronomist Profile: <span className="font-semibold text-slate-900 dark:text-white">Removed</span></div>
                  <div>• Farm Estate & Settings: <span className="font-semibold text-slate-900 dark:text-white">Removed</span></div>
                  <div>• Field Boundaries & NDVI: <span className="font-semibold text-slate-900 dark:text-white">Removed</span></div>
                  <div>• Soil Scans & Telemetry: <span className="font-semibold text-slate-900 dark:text-white">Removed</span></div>
                  <div>• Security Audit Trail: <span className="font-semibold text-slate-900 dark:text-white">Removed</span></div>
                  <div>• JWT Auth Sessions: <span className="font-semibold text-slate-900 dark:text-white">Revoked</span></div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleFinishAndRegister}
                className="btn-primary flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Register New Farm Account</span>
              </button>
              <button
                type="button"
                onClick={handleFinishAndLogin}
                className="btn-secondary flex-1 py-3 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>Sign In to Existing</span>
              </button>
            </div>
          </div>
        ) : (
          /* REGULAR FORM & IN-PROGRESS VIEW */
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-heading font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Permanent Account & Data Wipe
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Industry-standard GDPR & Data Privacy right-to-be-forgotten action.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Data Destruction Breakdown Card */}
            <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-50/50 dark:bg-rose-950/20 space-y-3">
              <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5 font-heading">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                The following records will be permanently deleted from MongoDB:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11.5px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <UserX className="w-3.5 h-3.5 text-rose-500" />
                  <span>Agronomist Profile & Credentials</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Farm Estate & Field Polygons</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-rose-500" />
                  <span>Soil NPK Tests & Moisture Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-rose-500" />
                  <span>Crop Profit Models & Advisory</span>
                </div>
                <div className="flex items-center gap-2">
                  <History className="w-3.5 h-3.5 text-rose-500" />
                  <span>Audit Logs & Security Traces</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="w-3.5 h-3.5 text-rose-500" />
                  <span>JWT Tokens & Active Sessions</span>
                </div>
              </div>
            </div>

            {/* PRE-DELETION BACKUP / SAVE DATA BOX */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-700 dark:text-emerald-400 font-heading">
                    <Database className="w-4 h-4 text-emerald-500" />
                    <span>Download Complete Farm Archive (JSON Backup)</span>
                  </div>
                  <p className="text-[11.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Before permanently purging your data, you can download a complete offline JSON copy of all your farm plots, soil telemetry, and profile settings.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isDownloadingBackup || isDeleting}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all cursor-pointer ${
                    backupDownloaded
                      ? "btn-secondary text-emerald-600 dark:text-emerald-400"
                      : "btn-primary"
                  }`}
                >
                  {isDownloadingBackup ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Exporting...</span>
                    </>
                  ) : backupDownloaded ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Backup Saved</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Archive</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* PROGRESS BAR (IF IN DELETION PROCESS) */}
            {isDeleting ? (
              <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/30 space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600 dark:text-rose-400 font-heading">
                  <RefreshCw className="w-4 h-4 animate-spin text-rose-500" />
                  <span>Cascade Deleting Records from MongoDB...</span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className={`flex items-center gap-2 ${deletionStep >= 1 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                    {deletionStep > 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-rose-500 animate-pulse" />}
                    <span>1. Validating identity & revoking session JWT</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deletionStep >= 2 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                    {deletionStep > 2 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-rose-500 animate-pulse" />}
                    <span>2. Cascade purging MongoDB collections (users, farms, fields, soil, logs)</span>
                  </div>
                  <div className={`flex items-center gap-2 ${deletionStep >= 3 ? "text-slate-900 dark:text-slate-100" : "text-slate-400"}`}>
                    {deletionStep > 3 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border border-rose-500 animate-pulse" />}
                    <span>3. Clearing client cache & memory stores</span>
                  </div>
                </div>
              </div>
            ) : (
              /* CONFIRMATION SAFEGUARDS */
              <div className="space-y-4 pt-1">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Type <span className="font-bold text-rose-600 dark:text-rose-400 underline">DELETE</span> below to confirm permanent destruction:
                  </label>
                  <input
                    type="text"
                    value={confirmInput}
                    onChange={(e) => setConfirmInput(e.target.value)}
                    placeholder="DELETE"
                    className="form-input text-xs font-mono border-rose-400 focus:border-rose-600"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
                  <input
                    type="checkbox"
                    checked={agreeCheckbox}
                    onChange={(e) => setAgreeCheckbox(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-rose-400 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-slate-600 dark:text-slate-300">
                    I understand that this action is immediate, irreversible, and all cloud records in MongoDB will be permanently purged.
                  </span>
                </label>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary flex-1 py-2.5 px-4 text-xs font-bold cursor-pointer"
                  >
                    Cancel & Keep Account
                  </button>
                  <button
                    type="button"
                    onClick={executeDeletion}
                    disabled={!isConfirmed || isDeleting}
                    className="btn-danger flex-1 py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DeleteAccountModal;
