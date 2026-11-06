import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Award,
  Sparkles,
  CheckCircle2,
  Save,
  MapPin,
  FileBadge,
  RefreshCw,
  Clock,
  Database,
} from "lucide-react";

const AVATAR_PRESETS = [
  { name: "Modern Agronomist", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=160&auto=format&fit=crop" },
  { name: "Field Director", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=160&auto=format&fit=crop" },
  { name: "Drone Specialist", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=160&auto=format&fit=crop" },
  { name: "Precision Scientist", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=160&auto=format&fit=crop" },
  { name: "Estate Manager", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=160&auto=format&fit=crop" },
];

export function ProfileSection() {
  const { user, updateUser, updateAvatar, isSaving } = useAuth();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    role: user?.role || "Farm Manager",
    designation: user?.designation || "",
    bio: user?.bio || "",
    location: user?.location || "",
    state: user?.state || "",
    district: user?.district || "",
    farmerId: user?.farmerId || "",
    kccNumber: user?.kccNumber || "",
    experienceYears: user?.experienceYears ?? 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        role: user.role || "Farm Manager",
        designation: user.designation || "",
        bio: user.bio || "",
        location: user.location || "",
        state: user.state || "",
        district: user.district || "",
        farmerId: user.farmerId || "",
        kccNumber: user.kccNumber || "",
        experienceYears: user.experienceYears ?? 0,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "Farm Manager",
        designation: "",
        bio: "",
        location: "",
        state: "",
        district: "",
        farmerId: "",
        kccNumber: "",
        experienceYears: 0,
      });
    }
  }, [user]);

  const [saveBanner, setSaveBanner] = useState(false);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState("");

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectPreset = (url) => {
    updateAvatar(url);
    setPresetModalOpen(false);
  };

  const handleCustomUrlSubmit = (e) => {
    e.preventDefault();
    if (!customAvatarInput.trim()) return;
    updateAvatar(customAvatarInput.trim());
    setCustomAvatarInput("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(formData);
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
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
            <p className="font-bold">Profile updated successfully!</p>
            <p className={isDarkMode ? "text-[#a7f3d0]" : "text-emerald-700"}>
              Changes committed to MongoDB database in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Main Agronomist Credentials Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          {/* Card Header */}
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <div>
              <h3 className="text-lg font-bold tracking-tight">
                Personal & Professional Agronomist Credentials
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
                These details are stored directly in MongoDB and reflected across all telemetry and advisory modules.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setPresetModalOpen(!presetModalOpen)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDarkMode
                    ? "bg-[#141414] border-emerald-500/25 hover:bg-[#1c231f] text-emerald-400"
                    : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100 text-emerald-800"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#22c55e]" />
                <span>Avatar Presets</span>
              </button>
            </div>
          </div>

          {/* Preset Selector Drawer */}
          {presetModalOpen && (
            <div
              className={`p-4 rounded-2xl border space-y-3 animate-in fade-in transition-colors ${
                isDarkMode
                  ? "bg-[#0a0d0c] border-white/[0.1]"
                  : "bg-slate-50 border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">Select Preset Avatar</span>
                <button
                  type="button"
                  onClick={() => setPresetModalOpen(false)}
                  className={`text-xs cursor-pointer ${
                    isDarkMode ? "text-neutral-400 hover:text-white" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(preset.url)}
                    className={`p-2 rounded-xl border hover:border-[#22c55e] cursor-pointer flex flex-col items-center gap-2 group transition-all ${
                      isDarkMode
                        ? "bg-[#0F0F0F] border-[rgba(34,197,94,0.2)]"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-14 h-14 rounded-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span
                      className={`text-[10px] text-center font-medium leading-tight ${
                        isDarkMode ? "text-neutral-400" : "text-slate-700"
                      }`}
                    >
                      {preset.name}
                    </span>
                  </div>
                ))}
              </div>

              <div
                className={`pt-2 border-t flex gap-2 ${
                  isDarkMode ? "border-[rgba(34,197,94,0.15)]" : "border-slate-200"
                }`}
              >
                <input
                  type="url"
                  value={customAvatarInput}
                  onChange={(e) => setCustomAvatarInput(e.target.value)}
                  placeholder="Or paste any custom image URL (https://...)"
                  className={`flex-1 border rounded-xl px-3 py-1.5 text-xs outline-none focus:border-[#22c55e] transition-colors ${
                    isDarkMode
                      ? "bg-[#0F0F0F] border-[rgba(34,197,94,0.25)] text-white"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={handleCustomUrlSubmit}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#141414] border-[#22c55e] text-emerald-400 hover:bg-[#1c231f]"
                      : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  Apply URL
                </button>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Official Email */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Official Email (UID Record) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="email"
                  required
                  placeholder="name@farm.in"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Primary Phone Number (SMS Telemetry)
              </label>
              <div className="relative">
                <Phone
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="tel"
                  placeholder="+91 98765 00000"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Agricultural Role */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Agricultural Role
              </label>
              <div className="relative">
                <Briefcase
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange("role", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                >
                  <option value="Farm Owner">Farm Owner (Master Control)</option>
                  <option value="Farm Manager">Farm Manager (Operations & Telemetry)</option>
                  <option value="Senior Agronomist">Senior Agronomist (Pathology & Diagnostics)</option>
                  <option value="Field Supervisor">Field Supervisor (Field Operations)</option>
                  <option value="Agricultural Officer">Agricultural Officer (Compliance & Schemes)</option>
                </select>
              </div>
            </div>

            {/* Professional Designation */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Professional Designation
              </label>
              <div className="relative">
                <Award
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. Lead Agronomy Specialist"
                  value={formData.designation}
                  onChange={(e) => handleInputChange("designation", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Experience in Agriculture */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Experience in Agriculture (Years)
              </label>
              <div className="relative">
                <Clock
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={formData.experienceYears}
                  onChange={(e) => handleInputChange("experienceYears", parseInt(e.target.value) || 0)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* National Farmer ID */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                National Farmer ID (PM-KISAN / AgriStack)
              </label>
              <div className="relative">
                <FileBadge
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. PMK-BR-2024-889412"
                  value={formData.farmerId}
                  onChange={(e) => handleInputChange("farmerId", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-mono transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* KCC Number */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                KCC Account Registration Number
              </label>
              <input
                type="text"
                placeholder="e.g. KCC-SBIN-89304721"
                value={formData.kccNumber}
                onChange={(e) => handleInputChange("kccNumber", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-mono transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* Base Residence & District */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Base Residence & District
              </label>
              <div className="relative">
                <MapPin
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. Rohtas, Bihar, India"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Profile Bio / Summary */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1.5 ${
                isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
              }`}
            >
              Agronomist Profile Summary & Research Focus
            </label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              className={`w-full border rounded-2xl p-3.5 text-xs outline-none leading-relaxed resize-none font-normal transition-colors ${
                isDarkMode
                  ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                  : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
              }`}
              placeholder="Describe your agricultural specialties, acreage overseen, and crop varieties..."
            />
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
              <span>{isSaving ? "Saving to MongoDB..." : "Save Profile Details"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
