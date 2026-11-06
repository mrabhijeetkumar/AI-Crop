import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Sliders,
  Bot,
  Languages,
  Bell,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
  DollarSign,
  Save,
  RefreshCw,
  Sun,
  Moon,
  Database
} from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English (Standard)" },
  { code: "hi", name: "हिंदी (Hindi)" },
  { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "mr", name: "मराठी (Marathi)" },
  { code: "te", name: "తెలుగు (Telugu)" },
  { code: "gu", name: "ગુજરાતી (Gujarati)" },
  { code: "bn", name: "বাংলা (Bengali)" },
];

const AI_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash (Recommended)",
    desc: "Sub-second crop vision analysis, rapid spray scheduling & dynamic mandi intelligence.",
    badge: "Ultra Fast",
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro (Deep Agronomy)",
    desc: "Advanced multi-spectral NDVI reasoning, fungal mutation tracing & complex soil chemistry calculations.",
    badge: "Deep Reasoning",
  },
];

export function PreferencesSection() {
  const { settings, updateSettings, isSaving } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    theme: isDarkMode ? "dark" : "light",
    language: settings?.language || "en",
    currency: settings?.currency || "₹",
    unitSystem: settings?.unitSystem || "metric",
    aiModel: settings?.aiModel || "gemini-2.5-flash",
    aiTone: settings?.aiTone || "scientific",
    notifications: {
      sprayAlerts: settings?.notifications?.sprayAlerts ?? true,
      mandiSpikes: settings?.notifications?.mandiSpikes ?? true,
      pestWarnings: settings?.notifications?.pestWarnings ?? true,
      weatherExtremes: settings?.notifications?.weatherExtremes ?? true,
      weeklySummaryEmail: settings?.notifications?.weeklySummaryEmail ?? false,
      smsAlerts: settings?.notifications?.smsAlerts ?? true,
      whatsAppUpdates: settings?.notifications?.whatsAppUpdates ?? true,
    },
    autoSyncSensors: settings?.autoSyncSensors ?? true,
    dataSharingConsent: settings?.dataSharingConsent ?? true,
  });

  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        language: settings.language || "en",
        currency: settings.currency || "₹",
        unitSystem: settings.unitSystem || "metric",
        aiModel: settings.aiModel || "gemini-2.5-flash",
        aiTone: settings.aiTone || "scientific",
        notifications: {
          sprayAlerts: settings.notifications?.sprayAlerts ?? true,
          mandiSpikes: settings.notifications?.mandiSpikes ?? true,
          pestWarnings: settings.notifications?.pestWarnings ?? true,
          weatherExtremes: settings.notifications?.weatherExtremes ?? true,
          weeklySummaryEmail: settings.notifications?.weeklySummaryEmail ?? false,
          smsAlerts: settings.notifications?.smsAlerts ?? true,
          whatsAppUpdates: settings.notifications?.whatsAppUpdates ?? true,
        },
        autoSyncSensors: settings.autoSyncSensors ?? true,
        dataSharingConsent: settings.dataSharingConsent ?? true,
      }));
    }
  }, [settings]);

  const [saveBanner, setSaveBanner] = useState(false);

  const handleToggleNotification = (key) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key],
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateSettings(formData);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3500);
  };

  return (
    <div className="space-y-6">
      {saveBanner && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl animate-in fade-in border ${
            isDarkMode
              ? "bg-[#141414] border-[#22c55e] text-emerald-400"
              : "bg-emerald-50 border-emerald-400 text-emerald-900"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
          <div className="text-xs">
            <p className="font-bold">System preferences saved!</p>
            <p className={isDarkMode ? "text-[#a7f3d0]" : "text-emerald-700"}>
              Synchronized with MongoDB database in real-time.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Appearance & AI Engine */}
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
              Theme & AI Reasoning Configuration
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
              Customize platform appearance, regional localization, and Gemini models.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Visual Theme Selection */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Display Theme Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isDarkMode) toggleTheme();
                    setFormData((p) => ({ ...p, theme: "light" }));
                  }}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    !isDarkMode
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                      : "bg-[#0a0d0c] border-[rgba(34,197,94,0.2)] text-neutral-400 hover:text-white"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isDarkMode) toggleTheme();
                    setFormData((p) => ({ ...p, theme: "dark" }));
                  }}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                    isDarkMode
                      ? "bg-[#22c55e] text-slate-950 border-[#22c55e] shadow-md"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:text-emerald-900"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Forest</span>
                </button>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Interface Language (भाषा)
              </label>
              <div className="relative">
                <Languages
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <select
                  value={formData.language}
                  onChange={(e) => setFormData((p) => ({ ...p, language: e.target.value }))}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Currency Unit */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Financial Currency
              </label>
              <div className="relative">
                <DollarSign
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                >
                  <option value="₹">₹ INR (Indian Rupee - Standard)</option>
                  <option value="$">$ USD (US Dollar)</option>
                  <option value="€">€ EUR (Euro)</option>
                </select>
              </div>
            </div>
          </div>

          {/* AI Model Architecture Selection */}
          <div className="space-y-3 pt-2">
            <label
              className={`block text-xs font-semibold ${
                isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
              }`}
            >
              Gemini AI Agronomy Engine
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AI_MODELS.map((model) => {
                const isSelected = formData.aiModel === model.id;
                return (
                  <div
                    key={model.id}
                    onClick={() => setFormData((p) => ({ ...p, aiModel: model.id }))}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? isDarkMode
                          ? "bg-[#141414] border-[#22c55e] shadow-lg shadow-emerald-950/40"
                          : "bg-emerald-50 border-emerald-500 shadow-sm"
                        : isDarkMode
                        ? "bg-[#0a0d0c] border-[rgba(34,197,94,0.2)] hover:border-[#22c55e]/50"
                        : "bg-slate-50 border-slate-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-[#22c55e]" />
                        <span>{model.name}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isSelected
                            ? isDarkMode
                              ? "bg-[#22c55e] text-slate-950 border-[#22c55e]"
                              : "bg-emerald-600 text-white border-emerald-600"
                            : isDarkMode
                            ? "bg-[#0F0F0F] text-neutral-400 border-white/[0.1]"
                            : "bg-white text-slate-600 border-slate-300"
                        }`}
                      >
                        {model.badge}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-2 leading-relaxed ${
                        isDarkMode ? "text-neutral-400" : "text-slate-600"
                      }`}
                    >
                      {model.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Real-time Notifications Configuration */}
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
              Push Alerts & Telemetry Channels
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
              Configure automated notifications for disease outbreaks, mandi price spikes, and weather anomalies.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "sprayAlerts", title: "Micro-Spray Weather Window Alerts", desc: "Alert when wind and rainfall allow chemical sprays." },
              { id: "mandiSpikes", title: "APMC Mandi Price Spike Alerts", desc: "Notify when wheat or mustard rates hit target selling price." },
              { id: "pestWarnings", title: "Regional Fungal / Pest Outbreak Alerts", desc: "Early warning when neighboring farms report rust or blight." },
              { id: "weatherExtremes", title: "Extreme Weather / Frost Warnings", desc: "Immediate push for impending hailstorms or sudden frost." },
              { id: "smsAlerts", title: "Direct SMS Field Dispatches", desc: "Critical action tasks sent directly to farm supervisor mobile." },
              { id: "whatsAppUpdates", title: "Daily Morning WhatsApp Digest", desc: "Comprehensive summary delivered at 6:30 AM IST." },
            ].map((item) => {
              const active = formData.notifications[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => handleToggleNotification(item.id)}
                  className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between gap-4 transition-all ${
                    active
                      ? isDarkMode
                        ? "bg-[#141414] border-[#22c55e]/50"
                        : "bg-emerald-50/60 border-emerald-300"
                      : isDarkMode
                      ? "bg-[#0a0d0c] border-[rgba(34,197,94,0.15)] opacity-60"
                      : "bg-slate-50 border-slate-200 opacity-60"
                  }`}
                >
                  <div>
                    <h4 className="text-xs font-bold">{item.title}</h4>
                    <p
                      className={`text-[11px] mt-0.5 leading-tight ${
                        isDarkMode ? "text-neutral-400" : "text-slate-600"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <div
                    className={`w-10 h-6 rounded-full p-0.5 transition-colors shrink-0 ${
                      active ? "bg-[#22c55e]" : "bg-slate-600"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        active ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Save Action Button */}
          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs ${
                isDarkMode ? "text-neutral-400" : "text-emerald-700 font-medium"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Real-time MongoDB synchronization enabled</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Saving to MongoDB..." : "Save Preferences"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
