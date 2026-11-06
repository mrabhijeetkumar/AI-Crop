import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  ShieldCheck,
  Search,
  RefreshCw,
  Clock,
  User,
  Settings,
  Tractor,
  KeyRound,
  Download,
  Database
} from "lucide-react";

export function AuditLogsSection() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/user/audit-logs?userId=${user?.id || "usr_active"}&limit=60`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (e) {
      console.warn("Fetch audit logs note:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user?.id]);

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "auth":
        return { label: "Authentication", bg: isDarkMode ? "bg-blue-950/60 border-blue-600/40 text-blue-300" : "bg-blue-50 border-blue-200 text-blue-800", icon: KeyRound };
      case "profile":
        return { label: "Profile Update", bg: isDarkMode ? "bg-[#141414] border-[#22c55e]/40 text-emerald-400" : "bg-emerald-50 border-emerald-300 text-emerald-800", icon: User };
      case "settings":
        return { label: "System Config", bg: isDarkMode ? "bg-purple-950/60 border-purple-600/40 text-purple-300" : "bg-purple-50 border-purple-200 text-purple-800", icon: Settings };
      case "farm":
        return { label: "Estate & Crops", bg: isDarkMode ? "bg-emerald-950/60 border-emerald-600/40 text-emerald-300" : "bg-emerald-50 border-emerald-200 text-emerald-800", icon: Tractor };
      case "security":
        return { label: "Security Event", bg: isDarkMode ? "bg-amber-950/60 border-amber-600/40 text-amber-300" : "bg-amber-50 border-amber-200 text-amber-800", icon: ShieldCheck };
      case "export":
        return { label: "Data Export", bg: isDarkMode ? "bg-cyan-950/60 border-cyan-600/40 text-cyan-300" : "bg-cyan-50 border-cyan-200 text-cyan-800", icon: Download };
      default:
        return { label: "Database", bg: isDarkMode ? "bg-slate-900 border-slate-700 text-slate-300" : "bg-slate-100 border-slate-300 text-slate-800", icon: Database };
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesCat = filterCategory === "all" || log.category === filterCategory;
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ip && log.ip.includes(searchQuery));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div
        className={`border rounded-3xl p-6 shadow-xl space-y-5 transition-colors ${
          isDarkMode
            ? "bg-[#0F0F0F] border-white/[0.08] text-white"
            : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
        }`}
      >
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
            isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-[#22c55e] shrink-0 ${
                isDarkMode ? "bg-[#141414] border-[#22c55e]/40" : "bg-emerald-50 border-emerald-300"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Security & Real-Time Audit Log</h3>
              <p className={`text-xs ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
                Immutable log of profile updates, crop modifications, credentials changes, and database operations.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchLogs}
            disabled={loading}
            className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 self-end sm:self-auto cursor-pointer transition-colors ${
              isDarkMode
                ? "bg-[#141414] border-[#22c55e]/30 text-emerald-400 hover:bg-[#1c231f]"
                : "bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                isDarkMode ? "text-neutral-400" : "text-emerald-600"
              }`}
            />
            <input
              type="text"
              placeholder="Search audit actions, IP addresses, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-3.5 py-2 text-xs outline-none transition-colors ${
                isDarkMode
                  ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
              }`}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className={`border rounded-xl px-3 py-2 text-xs outline-none font-medium cursor-pointer transition-colors ${
              isDarkMode
                ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
            }`}
          >
            <option value="all">All Categories</option>
            <option value="auth">Authentication</option>
            <option value="profile">Profile Updates</option>
            <option value="settings">System Preferences</option>
            <option value="farm">Farm & Crops</option>
            <option value="security">Security Events</option>
            <option value="export">Data Exports</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="space-y-3">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => {
            const badge = getCategoryBadge(log.category);
            const Icon = badge.icon;
            return (
              <div
                key={log.id}
                className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isDarkMode
                    ? "bg-[#0F0F0F] border-white/[0.08] text-white hover:border-[#22c55e]/40"
                    : "bg-white border-emerald-100 text-slate-900 hover:border-emerald-300 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xl border shrink-0 ${badge.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold">{log.action}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${isDarkMode ? "text-neutral-400" : "text-slate-600"}`}>
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center text-[11px] opacity-70 shrink-0">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className="font-mono mt-0.5">IP: {log.ip || "127.0.0.1"}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`border rounded-3xl p-8 text-center text-xs transition-colors ${
              isDarkMode
                ? "bg-[#0F0F0F] border-white/[0.08] text-neutral-400"
                : "bg-white border-emerald-200 text-slate-600"
            }`}
          >
            No audit logs found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
}
