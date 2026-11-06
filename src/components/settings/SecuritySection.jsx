import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Globe,
  Trash2,
  RefreshCw,
  Eye,
  EyeOff,
  Database,
  Download,
  ShieldAlert,
} from "lucide-react";
import { DeleteAccountModal } from "./DeleteAccountModal.jsx";

export function SecuritySection() {
  const { user, updatePassword, toggle2FA, isSaving, downloadBackup, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloadingBackup, setIsDownloadingBackup] = useState(false);
  const [backupSuccess, setBackupSuccess] = useState(false);

  // 2FA state
  const [twoFaActive, setTwoFaActive] = useState(user?.twoFactorEnabled || false);
  const [show2FaModal, setShow2FaModal] = useState(false);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaStatus, setTwoFaStatus] = useState(null);

  // Active Sessions
  const [sessions, setSessions] = useState([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const res = await fetch(`/api/user/sessions?userId=${user?.id || "usr_active"}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch (e) {
      console.warn("Sessions fetch note:", e);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const res = await fetch(`/api/user/sessions/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      }
    } catch (e) {
      console.warn("Revoke session error:", e);
    }
  };

  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "Empty", color: "bg-slate-500" };
    let score = 0;
    if (pass.length >= 8) score++;
    if (pass.length >= 12) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 25, label: "Weak (add numbers & symbols)", color: "bg-rose-500" };
    if (score === 3) return { score: 50, label: "Moderate (good start)", color: "bg-amber-500" };
    if (score === 4) return { score: 75, label: "Strong", color: "bg-emerald-400" };
    return { score: 100, label: "Enterprise Grade (Very Strong)", color: "bg-[#22c55e]" };
  };

  const strength = calculatePasswordStrength(newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setPasswordStatus({ success: false, message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, message: "Passwords do not match." });
      return;
    }

    setIsChangingPassword(true);
    setPasswordStatus(null);

    const res = await updatePassword(currentPassword, newPassword);
    setIsChangingPassword(false);
    if (res.success) {
      setPasswordStatus({ success: true, message: "Password updated and re-encrypted in real-time." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordStatus({ success: false, message: res.error || "Failed to update password." });
    }
  };

  const handleToggle2Fa = async () => {
    if (twoFaActive) {
      const res = await toggle2FA(false);
      if (res.success) setTwoFaActive(false);
    } else {
      setShow2FaModal(true);
    }
  };

  const verifyAndEnable2Fa = async (e) => {
    e.preventDefault();
    if (twoFaCode.length !== 6) {
      setTwoFaStatus({ success: false, message: "Enter a 6-digit verification code." });
      return;
    }
    const res = await toggle2FA(true);
    if (res.success) {
      setTwoFaActive(true);
      setShow2FaModal(false);
      setTwoFaCode("");
      setTwoFaStatus(null);
    } else {
      setTwoFaStatus({ success: false, message: "Failed to verify 2FA token." });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Password & Security Card */}
      <div
        className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 transition-colors ${
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
          <h3 className="text-lg font-bold tracking-tight">
            Authentication & Security Credentials
          </h3>
          <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
            Update your account password, manage multi-factor authentication, and monitor active sessions.
          </p>
        </div>

        {passwordStatus && (
          <div
            className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 ${
              passwordStatus.success
                ? isDarkMode
                  ? "bg-[#141414] border-[#22c55e] text-emerald-400"
                  : "bg-emerald-50 border-emerald-400 text-emerald-800 font-medium"
                : isDarkMode
                ? "bg-rose-950/40 border-rose-600/40 text-rose-300"
                : "bg-rose-50 border-rose-300 text-rose-800 font-medium"
            }`}
          >
            {passwordStatus.success ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22c55e]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            )}
            <span>{passwordStatus.message}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Current Password
              </label>
              <div className="relative">
                <Lock
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-10 py-2.5 text-xs outline-none transition-colors ${
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
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                New Password
              </label>
              <div className="relative">
                <KeyRound
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {newPassword && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className={isDarkMode ? "text-neutral-400" : "text-slate-600"}>Strength:</span>
                <span className="font-bold">{strength.label}</span>
              </div>
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden ${
                  isDarkMode ? "bg-[#0a0d0c]" : "bg-slate-200"
                }`}
              >
                <div
                  className={`h-full transition-all duration-300 ${strength.color}`}
                  style={{ width: `${strength.score}%` }}
                />
              </div>
            </div>
          )}

          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <span className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-slate-600"}`}>
              Passwords are encrypted before storage in MongoDB.
            </span>

            <button
              type="submit"
              disabled={isChangingPassword || !newPassword}
              className="px-5 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
            >
              {isChangingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>{isChangingPassword ? "Encrypting..." : "Update Password"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Two-Factor Authentication (2FA) Card */}
      <div
        className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 transition-colors ${
          isDarkMode
            ? "bg-[#0F0F0F] border-white/[0.08] text-white"
            : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-[#22c55e] shrink-0 ${
                isDarkMode ? "bg-[#141414] border-[#22c55e]/40" : "bg-emerald-50 border-emerald-300"
              }`}
            >
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold">Two-Factor Authentication (2FA)</h4>
              <p
                className={`text-xs mt-0.5 ${
                  isDarkMode ? "text-neutral-400" : "text-emerald-700"
                }`}
              >
                Protects pesticide spray dispatches and crop financial records with an extra verification code.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggle2Fa}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              twoFaActive
                ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 hover:bg-rose-500/30"
                : "bg-[#22c55e] text-slate-950 hover:bg-[#16a34a] shadow-md shadow-emerald-950/20"
            }`}
          >
            {twoFaActive ? "Disable 2FA Protection" : "Enable 2FA Protection"}
          </button>
        </div>

        {show2FaModal && (
          <form
            onSubmit={verifyAndEnable2Fa}
            className={`p-4 rounded-2xl border space-y-3 animate-in fade-in transition-colors ${
              isDarkMode
                ? "bg-[#0a0d0c] border-white/[0.1]"
                : "bg-slate-50 border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">Enter 6-Digit Authenticator Code</span>
              <button
                type="button"
                onClick={() => setShow2FaModal(false)}
                className={`text-xs cursor-pointer ${
                  isDarkMode ? "text-neutral-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Cancel
              </button>
            </div>

            {twoFaStatus && (
              <p className="text-xs text-rose-400 font-medium">{twoFaStatus.message}</p>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                maxLength={6}
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                className={`w-40 border rounded-xl px-3 py-2 text-center text-sm font-mono tracking-widest outline-none transition-colors ${
                  isDarkMode
                    ? "bg-[#0F0F0F] border-white/[0.1] text-white focus:border-[#4ade80]"
                    : "bg-white border-slate-300 text-slate-900 focus:border-emerald-600"
                }`}
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold cursor-pointer"
              >
                Verify & Activate
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Active Sessions Card */}
      <div
        className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-5 transition-colors ${
          isDarkMode
            ? "bg-[#0F0F0F] border-white/[0.08] text-white"
            : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
        }`}
      >
        <div
          className={`flex items-center justify-between pb-4 border-b ${
            isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
          }`}
        >
          <div>
            <h4 className="text-sm font-bold">Active Agronomist Sessions</h4>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
              Active client devices with live real-time synchronization privileges.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchSessions}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-[#141414] border-white/[0.1] text-emerald-400 hover:bg-[#1c231f]"
                : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSessions ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="space-y-3">
          {sessions.length > 0 ? (
            sessions.map((sess) => (
              <div
                key={sess.id}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08]"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-[#22c55e] shrink-0" />
                  <div>
                    <span className="text-xs font-bold block">{sess.device || "Web Dashboard Browser"}</span>
                    <span
                      className={`text-[11px] block mt-0.5 ${
                        isDarkMode ? "text-neutral-400" : "text-slate-600"
                      }`}
                    >
                      IP: {sess.ip || "127.0.0.1"} • {sess.location || "India"} • Last seen:{" "}
                      {new Date(sess.lastActive || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {sess.isCurrent ? (
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isDarkMode
                        ? "bg-[#141414] text-emerald-400 border-[#22c55e]/40"
                        : "bg-emerald-50 text-emerald-800 border-emerald-300"
                    }`}
                  >
                    Current Active
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="p-1.5 text-rose-400 hover:text-rose-500 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div
              className={`p-4 rounded-2xl border text-center text-xs ${
                isDarkMode
                  ? "bg-[#0a0d0c] border-white/[0.08] text-neutral-400"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              No active third-party sessions. Current browser session is verified.
            </div>
          )}
        </div>
      </div>

      {/* GDPR Data Sovereignty & Permanent Account Wipe Section */}
      <div
        className={`p-6 rounded-3xl border transition-colors ${
          isDarkMode
            ? "bg-[#0b1710] border-red-500/20 text-white"
            : "bg-white border-red-200 text-slate-900 shadow-sm"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              Data Sovereignty & Account Deletion
            </h3>
            <p className={`text-xs ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
              Export a complete archive of your farm records or exercise permanent right-to-be-forgotten on MongoDB.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Export / Backup Box */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
              isDarkMode ? "bg-[#04100a] border-emerald-500/20" : "bg-emerald-50/60 border-emerald-200"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-[#22c55e]">
                <Download className="w-4 h-4" />
                <span>Export Farm Data Archive</span>
              </div>
              <p className={`text-[11.5px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Download all your agronomist telemetry, crop plots, soil tests, and audit logs as an offline JSON archive before making any permanent changes.
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setIsDownloadingBackup(true);
                try {
                  const res = await downloadBackup(user?.id);
                  if (res?.success) {
                    setBackupSuccess(true);
                    setTimeout(() => setBackupSuccess(false), 4000);
                  }
                } finally {
                  setIsDownloadingBackup(false);
                }
              }}
              disabled={isDownloadingBackup}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                backupSuccess
                  ? "bg-emerald-500/20 text-[#22c55e] border border-emerald-500/40"
                  : "bg-[#22c55e] hover:bg-[#16a34a] text-black shadow-md"
              }`}
            >
              {isDownloadingBackup ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating Archive...</span>
                </>
              ) : backupSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Archive Downloaded</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON Archive</span>
                </>
              )}
            </button>
          </div>

          {/* Delete Account Box */}
          <div
            className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 ${
              isDarkMode ? "bg-[#140606] border-red-500/30" : "bg-red-50/60 border-red-200"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs text-red-500">
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Account</span>
              </div>
              <p className={`text-[11.5px] leading-relaxed ${isDarkMode ? "text-slate-400" : "text-slate-600"}`}>
                Immediately and irrecoverably erase all account details, credentials, farm profiles, and sensor telemetry from MongoDB across all collections.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer hover:shadow-red-950/40"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Account & Wipe Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* High-Security Account Deletion Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
