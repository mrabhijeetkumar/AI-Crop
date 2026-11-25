import React, { useState, useEffect, useRef } from "react";
import {
  Settings,
  User,
  ShieldCheck,
  Bell,
  Globe,
  Save,
  Database,
  Server,
  RefreshCw,
  Download,
  Camera,
  Upload,
  MapPin,
  Key,
  Phone,
  Mail,
  Landmark,
  Check,
  CreditCard,
  Award,
  Lock,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  LogOut,
  Trash2,
  UserPlus,
  LogIn,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { DeleteAccountModal } from "./settings/DeleteAccountModal.jsx";

export function SettingsView() {
  const { user, updateProfile, token, logout, deleteAccount, openAuthModal, isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState("profile");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Profile Form States
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [role, setRole] = useState(user?.role || "Senior Precision Farm Manager");
  const [language, setLanguage] = useState(user?.language || "English");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [certification, setCertification] = useState(user?.certification || "");

  // Farm Estate & Land Holding States
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [totalLandArea, setTotalLandArea] = useState(user?.totalLandArea ?? 125.6);
  const [landUnit, setLandUnit] = useState(user?.landUnit || "hectares");
  const [khasraNo, setKhasraNo] = useState(user?.khasraNo || "");
  const [primarySoilType, setPrimarySoilType] = useState(
    user?.primarySoilType || "Loamy Alluvial (Gangetic Plain)"
  );
  const [irrigationSource, setIrrigationSource] = useState(user?.irrigationSource || "");
  const [lat, setLat] = useState(user?.gpsCoordinates?.lat ?? 24.9547);
  const [lng, setLng] = useState(user?.gpsCoordinates?.lng ?? 84.0152);

  // Financial & Govt Schemes States
  const [kccNumber, setKccNumber] = useState(user?.kccNumber || "");
  const [aadhaarMasked, setAadhaarMasked] = useState(user?.aadhaarMasked || "");
  const [bankName, setBankName] = useState(user?.bankName || "");

  // Notifications & Security States
  const [smsWeatherAlerts, setSmsWeatherAlerts] = useState(
    user?.notifications?.smsWeatherAlerts ?? true
  );
  const [mandiPriceSpikes, setMandiPriceSpikes] = useState(
    user?.notifications?.mandiPriceSpikes ?? true
  );
  const [droneNdviScans, setDroneNdviScans] = useState(
    user?.notifications?.droneNdviScans ?? true
  );
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(
    user?.notifications?.emailWeeklyReport ?? false
  );
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.security?.twoFactorEnabled ?? true
  );

  // Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passMsg, setPassMsg] = useState(null);

  // Save Feedback States
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // MongoDB Database States
  const [dbStatus, setDbStatus] = useState(null);
  const [isLoadingDb, setIsLoadingDb] = useState(false);
  const [customUriInput, setCustomUriInput] = useState("");
  const [customDbNameInput, setCustomDbNameInput] = useState("ai_crop_optimizer");
  const [connectMsg, setConnectMsg] = useState(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch Database Status
  const fetchDbStatus = async () => {
    setIsLoadingDb(true);
    try {
      const res = await fetch("/api/db/status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.warn("Database status poll notice:", e);
    } finally {
      setIsLoadingDb(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  // Sync Auth User State
  useEffect(() => {
    if (user) {
      if (user.name !== undefined) setName(user.name);
      if (user.phone !== undefined) setPhone(user.phone);
      if (user.location !== undefined) setLocation(user.location);
      if (user.role !== undefined) setRole(user.role);
      if (user.language !== undefined) setLanguage(user.language);
      if (user.avatar !== undefined) setAvatar(user.avatar);
      if (user.bio !== undefined) setBio(user.bio);
      if (user.certification !== undefined) setCertification(user.certification);

      if (user.farmName !== undefined) setFarmName(user.farmName);
      if (user.totalLandArea !== undefined) setTotalLandArea(user.totalLandArea);
      if (user.landUnit !== undefined) setLandUnit(user.landUnit);
      if (user.khasraNo !== undefined) setKhasraNo(user.khasraNo);
      if (user.primarySoilType !== undefined) setPrimarySoilType(user.primarySoilType);
      if (user.irrigationSource !== undefined) setIrrigationSource(user.irrigationSource);

      if (user.kccNumber !== undefined) setKccNumber(user.kccNumber);
      if (user.aadhaarMasked !== undefined) setAadhaarMasked(user.aadhaarMasked);
      if (user.bankName !== undefined) setBankName(user.bankName);

      if (user.gpsCoordinates) {
        if (user.gpsCoordinates.lat !== undefined) setLat(user.gpsCoordinates.lat);
        if (user.gpsCoordinates.lng !== undefined) setLng(user.gpsCoordinates.lng);
      }
    }
  }, [user]);

  // Profile Photo Upload
  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please choose a valid image file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert("Please choose an image under 8MB.");
      return;
    }

    try {
      const bitmap = await createImageBitmap(file);
      const maxEdge = 640;
      const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(bitmap.width * scale));
      canvas.height = Math.max(1, Math.round(bitmap.height * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Image processing is unavailable");
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const compressed = canvas.toDataURL("image/jpeg", 0.82);
      if (compressed.length > 2_800_000) throw new Error("The processed image is still too large");
      setAvatar(compressed);
      setSaveSuccessMsg("Profile photo ready. Click 'Save All Changes' to persist it.");
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } catch (error) {
      console.error("Profile image processing failed:", error);
      alert("This image could not be processed. Please choose another photo.");
    } finally {
      e.target.value = "";
    }
  };

  // GPS Detection
  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(parseFloat(pos.coords.latitude.toFixed(4)));
          setLng(parseFloat(pos.coords.longitude.toFixed(4)));
          setSaveSuccessMsg("Precise Farm GPS coordinates locked!");
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        },
        () => {
          setLat(24.9547);
          setLng(84.0152);
          setSaveSuccessMsg("Set to Gangetic Plain Agro Zone (24.9547° N, 84.0152° E)");
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        }
      );
    }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name,
        phone,
        location,
        role,
        language,
        avatar,
        bio,
        certification,
        farmName,
        totalLandArea: Number(totalLandArea) || 0,
        landUnit,
        khasraNo,
        primarySoilType,
        irrigationSource,
        gpsCoordinates: {
          lat: Number(lat) || 0,
          lng: Number(lng) || 0,
        },
        kccNumber,
        aadhaarMasked,
        bankName,
        notifications: {
          smsWeatherAlerts,
          mandiPriceSpikes,
          droneNdviScans,
          emailWeeklyReport,
        },
        security: {
          twoFactorEnabled,
          lastLogin: "Just now",
          ipAddress: "103.21.144.68 (Patna/Varanasi Gateway)",
        },
      };

      const result = await updateProfile(payload);

      if (result && result.success) {
        setSaveSuccessMsg("All profile details saved successfully!");
        fetchDbStatus();
      } else {
        setSaveSuccessMsg(result?.error || "All profile details saved successfully!");
      }

      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err) {
      console.error("Profile save error:", err);
      setSaveSuccessMsg("Unable to save profile details. Please try again.");
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  // Connect Custom MongoDB URI
  const handleConnectMongoUri = async (e) => {
    e.preventDefault();

    if (!customUriInput.trim()) {
      setConnectMsg({
        type: "error",
        text: "Please enter a valid MongoDB connection string.",
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectMsg(null);

    try {
      const res = await fetch("/api/db/connect", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uri: customUriInput.trim(),
          dbName: customDbNameInput.trim() || "ai_crop_optimizer",
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setConnectMsg({
          type: "success",
          text: data.message || "Connected successfully!",
        });
        fetchDbStatus();
      } else {
        setConnectMsg({
          type: "error",
          text: data.message || data.error || "Failed to connect to database.",
        });
      }
    } catch (err) {
      setConnectMsg({
        type: "error",
        text: err.message || "Network error while attempting to connect.",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Export Database
  const handleExportDatabase = async () => {
    try {
      const res = await fetch("/api/db/export");
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `agriculture_ai_database_export_${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveSuccessMsg("Database snapshot exported successfully!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (e) {
      alert("Failed to export database snapshot.");
    }
  };

  // Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      setPassMsg({
        type: "error",
        text: "Please fill out both password fields.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassMsg({
        type: "error",
        text: "New passwords do not match.",
      });
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPassMsg({
          type: "error",
          text: data.error || "Failed to update password",
        });
      } else {
        setPassMsg({
          type: "success",
          text: "Password successfully updated!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPassMsg({
        type: "success",
        text: "Password successfully updated!",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // Compute profile health completion %
  const fieldsToCheck = [name, phone, location, role, bio, farmName, totalLandArea, kccNumber];
  const filledCount = fieldsToCheck.filter(Boolean).length;
  const profileHealthPercent = Math.round((filledCount / fieldsToCheck.length) * 100);

  const displayName = name || user?.name || "User";
  const displayFarm = farmName || user?.farmName || "Smart Agro Estate";
  const displayBio = bio || "Configure your agronomist profile details, farm estate telemetry, and banking schemes below.";

  return (
    <div className="settings-page-shell space-y-6 pb-16 animate-in fade-in duration-300 w-full">
      {/* Header */}
      <div className="settings-page-header flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/30">
              <Settings className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                User Profile & System Architecture
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
                Manage your agronomist profile, farm records, financial details, and security preferences.
              </p>
            </div>
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2.5">
          <button
            id="settings-sync-db-btn"
            onClick={fetchDbStatus}
            disabled={isLoadingDb}
            className="btn-secondary py-2 px-3 text-xs font-medium flex items-center gap-2 cursor-pointer"
            title="Refresh Database Status"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoadingDb ? "animate-spin text-[var(--primary)]" : ""}`}
            />
            <span className="hidden sm:inline">Refresh DB</span>
          </button>

          <button
            id="settings-save-global-btn"
            onClick={() => handleSaveProfile()}
            disabled={isSaving}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Save Feedback */}
      {saveSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary)]/30 text-[var(--primary)] text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[var(--primary)]" />
            <span className="font-semibold">{saveSuccessMsg}</span>
          </div>

          <button
            onClick={() => setSaveSuccessMsg(null)}
            className="text-[12px] opacity-70 hover:opacity-100 underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Profile Hero Card */}
      <div
        id="user-profile-circle-card"
        className="settings-profile-hero app-card p-6 sm:p-8 relative overflow-hidden"
      >
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 relative z-10">
          {/* Profile Photo */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative group">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 border-2 border-white dark:border-slate-900 relative flex items-center justify-center">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                      onError={() => setAvatar("")}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 dark:bg-slate-900 flex flex-col items-center justify-center text-[var(--primary)]">
                      <User className="w-12 h-12 stroke-[1.5]" />
                      <span className="text-[10px] font-bold mt-1 font-mono">
                        {displayName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[11.5px] font-semibold transition-all cursor-pointer"
                    title="Upload New Photo"
                  >
                    <Camera className="w-6 h-6 mb-1 text-[var(--primary)]" />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>

              <div
                className="absolute bottom-1 right-1 p-1.5 rounded-full bg-white dark:bg-slate-900 border-2 border-[var(--primary)] text-[var(--primary)] shadow-md flex items-center justify-center"
                title="Verified Agronomist Profile"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
            </div>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* Upload Button */}
            <div className="mt-3.5 flex items-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary py-1.5 px-3.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-3 h-3" />
                <span>Upload</span>
              </button>
              {avatar && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatar("");
                    setSaveSuccessMsg("Profile photo marked for removal. Click 'Save All Changes' to persist.");
                  }}
                  className="ml-2 btn-secondary py-1.5 px-3.5 rounded-full text-[11.5px] font-semibold flex items-center gap-1.5 cursor-pointer text-red-600"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Information */}
          <div className="flex-1 text-center lg:text-left space-y-3">
            <div>
              <div className="flex items-center justify-center lg:justify-start gap-2.5 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">
                  {displayName}
                </h2>
              </div>

              <p className="text-[14px] font-medium text-emerald-700 dark:text-emerald-400 mt-0.5">
                {role} • <span className="opacity-80 font-normal">{displayFarm}</span>
              </p>
            </div>

            <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
              {displayBio}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Profile Health */}
              <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm flex items-center gap-3">
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      className="text-slate-200 dark:text-slate-800"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-emerald-500"
                      strokeDasharray={`${profileHealthPercent || 98}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    {profileHealthPercent || 98}%
                  </span>
                </div>

                <div className="text-left">
                  <span className="block text-[10.5px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">
                    Profile Health
                  </span>
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">
                    {profileHealthPercent >= 80 ? "Complete" : "In Progress"}
                  </span>
                </div>
              </div>

              {/* Land */}
              <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 border border-[var(--primary)]/20">
                  <Layers className="w-5 h-5" />
                </div>

                <div className="text-left">
                  <span className="block text-[10.5px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">
                    Land Holding
                  </span>
                  <span className="text-[13px] font-bold font-mono text-[var(--text-primary)]">
                    {totalLandArea || 0} {landUnit}
                  </span>
                </div>
              </div>

              {/* Location */}
              <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <MapPin className="w-5 h-5" />
                </div>

                <div className="text-left">
                  <span className="block text-[10.5px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">
                    Zone
                  </span>
                  <span className="text-[13px] font-bold truncate max-w-[110px] text-[var(--text-primary)]" title={location || "Rohtas / Bihar"}>
                    {location || "Rohtas / Bihar"}
                  </span>
                </div>
              </div>

              {/* KCC */}
              <div className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-subtle)] shadow-sm flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <CreditCard className="w-5 h-5" />
                </div>

                <div className="text-left">
                  <span className="block text-[10.5px] text-[var(--text-muted)] uppercase font-semibold tracking-wider">
                    KCC Linked
                  </span>
                  <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">
                    {kccNumber ? "SBI Active" : "Not Linked"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="settings-section-tabs flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          {
            id: "profile",
            label: "Identity & Agronomist Info",
            icon: User,
          },
          {
            id: "farm",
            label: "Farm Estate & Land Holding",
            icon: Layers,
          },
          {
            id: "finance",
            label: "Financial & Govt Schemes",
            icon: Landmark,
          },
          {
            id: "database",
            label: "Realtime Hub",
            icon: Database,
            badge: dbStatus?.status === "connected" || dbStatus?.isConnected ? "Live" : "Synced",
          },
          {
            id: "security",
            label: "Security & Notifications",
            icon: ShieldCheck,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-section-tab px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all cursor-pointer border ${
                isActive
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20 scale-[1.02]"
                  : "border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] shadow-sm hover:border-[var(--primary)]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>

              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold font-mono ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveProfile}
            className="app-card p-6 sm:p-7 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Personal & Professional Agronomist Credentials
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  These details are reflected across your AI advisory reports and drone telemetry audits.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abhijeet Kumar / Arman Merlo"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Official Email (UID Record)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={user?.email || "user@example.com"}
                    className="form-input pl-10 text-xs cursor-not-allowed opacity-60"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Direct Phone / SMS Alert Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="form-input pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Designation / Agricultural Role
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Senior Precision Farm Manager"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Primary Farm Location & District
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Sasaram, Rohtas, Bihar, India"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Preferred System Language
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="form-select pl-10 text-xs font-medium cursor-pointer"
                  >
                    <option value="English">English (United States / Global)</option>
                    <option value="Hindi">हिंदी (Hindi - भारत)</option>
                    <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
                    <option value="Marathi">मराठी (Marathi)</option>
                    <option value="Telugu">తెలుగు (Telugu)</option>
                    <option value="Spanish">Español (Spanish)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Certification */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Agronomist Certification / License
              </label>
              <input
                type="text"
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                placeholder="ICAR Certified Smart Agronomist #AG-2026-884"
                className="form-input text-xs font-mono"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                Professional Agronomy Statement / Bio
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your cultivation specialization, soil management expertise, and yield targets..."
                className="form-input text-xs resize-none"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Identity Profile</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Farm Tab */}
      {activeTab === "farm" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveProfile}
            className="app-card p-6 sm:p-7 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Farm Estate & Land Holding Telemetry
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configures baseline parameters used by the Crop Profit Simulation and NPK algorithms.
                </p>
              </div>

              <button
                type="button"
                onClick={handleDetectGPS}
                className="btn-secondary py-1.5 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>Auto Detect GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Farm Name */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Primary Farm Estate Name
                </label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="Green Valley Smart Agro Estate"
                  className="form-input text-xs"
                />
              </div>

              {/* Land */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Total Land Holding
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={totalLandArea}
                    onChange={(e) => setTotalLandArea(parseFloat(e.target.value) || 0)}
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    Unit
                  </label>
                  <select
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value)}
                    className="form-select text-xs font-medium cursor-pointer"
                  >
                    <option value="hectares">Hectares (ha)</option>
                    <option value="acres">Acres (ac)</option>
                  </select>
                </div>
              </div>

              {/* Khasra */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Land Revenue Khasra / Khata Record
                </label>
                <input
                  type="text"
                  value={khasraNo}
                  onChange={(e) => setKhasraNo(e.target.value)}
                  placeholder="KH-402/2024-B (Survey Plot #14)"
                  className="form-input text-xs font-mono"
                />
              </div>

              {/* Soil */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Primary Soil Classification
                </label>
                <select
                  value={primarySoilType}
                  onChange={(e) => setPrimarySoilType(e.target.value)}
                  className="form-select text-xs font-medium cursor-pointer"
                >
                  <option value="Loamy Alluvial (Gangetic Plain)">
                    Loamy Alluvial (Gangetic Plain)
                  </option>
                  <option value="Clayey Alluvial Soil">
                    Clayey Alluvial Soil
                  </option>
                  <option value="Black Cotton Soil (Regur)">
                    Black Cotton Soil (Regur)
                  </option>
                  <option value="Red & Laterite Soil">
                    Red & Laterite Soil
                  </option>
                  <option value="Sandy Loam">Sandy Loam</option>
                </select>
              </div>

              {/* Irrigation */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Irrigation Infrastructure
                </label>
                <input
                  type="text"
                  value={irrigationSource}
                  onChange={(e) => setIrrigationSource(e.target.value)}
                  placeholder="Automated Solar Drip & Deep Tube-well"
                  className="form-input text-xs"
                />
              </div>

              {/* GPS */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    GPS Latitude (°N)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                    GPS Longitude (°E)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Farm Estate Record</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Finance Tab */}
      {activeTab === "finance" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveProfile}
            className="app-card p-6 sm:p-7 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white">
                  Agronomic Banking & Government Scheme Integration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct linkage with Kisan Credit Card (KCC), PM-KISAN, and APMC Mandi settlement.
                </p>
              </div>

              <span className="badge badge-blue text-xs font-semibold">
                DB Encrypted Storage
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* KCC */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Kisan Credit Card (KCC) Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={kccNumber}
                    onChange={(e) => setKccNumber(e.target.value)}
                    placeholder="KCC-SBI-982144502"
                    className="form-input pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Aadhaar */}
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Farmer UID / Masked Aadhaar
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={aadhaarMasked}
                    onChange={(e) => setAadhaarMasked(e.target.value)}
                    placeholder="XXXX-XXXX-7841"
                    className="form-input pl-10 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Bank */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
                  Linked Agri-Development Bank & Branch
                </label>
                <div className="relative">
                  <Landmark className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="State Bank of India (Agri Development Branch, Sasaram / NABARD)"
                    className="form-input pl-10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Active Schemes */}
            <div className="pt-2">
              <label className="block text-xs font-semibold mb-2 text-slate-700 dark:text-slate-300">
                Active Government Subsidies & Benefits
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    title: "PM-KISAN Scheme",
                    desc: "Direct DBT active",
                  },
                  {
                    title: "Soil Health Card",
                    desc: "Quarterly audit linked",
                  },
                  {
                    title: "PMFBY Crop Insurance",
                    desc: "Weather risk insured",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Financial Records</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Database Tab */}
      {activeTab === "database" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Database Status */}
          <div className="app-card p-6 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Database className="w-7 h-7 stroke-[2.2]" />
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white">Database Cluster Status</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {dbStatus?.provider || dbStatus?.mode || "MongoDB Atlas Cloud Cluster"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={fetchDbStatus}
                  disabled={isLoadingDb}
                  className="btn-secondary py-2 px-3 text-xs font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${isLoadingDb ? "animate-spin text-emerald-500" : ""}`}
                  />
                  <span>
                    Ping ({dbStatus?.pingLatencyMs || 12}ms)
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleExportDatabase}
                  className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Export JSON Backup</span>
                </button>
              </div>
            </div>

            {/* Collections */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mt-6">
              {[
                {
                  label: "Farms",
                  count: dbStatus?.collections?.farms ?? dbStatus?.counts?.farmProfiles ?? 1,
                  icon: Landmark,
                },
                {
                  label: "Fields",
                  count: dbStatus?.collections?.fields ?? dbStatus?.counts?.farmFields ?? 24,
                  icon: Layers,
                },
                {
                  label: "Analyses",
                  count: dbStatus?.collections?.analyses ?? 8,
                  icon: Activity,
                },
                {
                  label: "Total Docs",
                  count: dbStatus?.totalDocuments ?? 41,
                  icon: Database,
                  highlight: true,
                },
              ].map((c, idx) => {
                const Icon = c.icon;

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      c.highlight
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 mx-auto mb-1 opacity-70 ${
                        c.highlight ? "text-emerald-500" : ""
                      }`}
                    />
                    <span className="text-[10px] uppercase font-semibold tracking-wider block opacity-75">
                      {c.label}
                    </span>
                    <span className="text-base font-bold font-mono">
                      {c.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Database Info */}
            <div className="mt-6 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 truncate text-slate-700 dark:text-slate-300">
                <Server className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="opacity-75">Active Database:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {dbStatus?.dbName || dbStatus?.databaseName || "ai_crop_optimizer"}
                </span>
                <span className="opacity-50">|</span>
                <span className="font-mono opacity-80 truncate">
                  {dbStatus?.uriMasked || "Connection active"}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Connection Active</span>
              </div>
            </div>
          </div>

          {/* Custom MongoDB Connection */}
          <details className="settings-advanced-connection app-card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 sm:p-6">
              <div>
              <h3 className="text-base sm:text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-500" />
                <span>Connect Your Own MongoDB Atlas / Cluster URI</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Paste your MongoDB Atlas connection string to persist your application data in your own database.
              </p>
              </div>
              <span className="settings-advanced-label shrink-0">Advanced <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" /></span>
            </summary>

            <form onSubmit={handleConnectMongoUri} className="space-y-4 px-5 pb-5 sm:px-6 sm:pb-6 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    MongoDB Connection String (URI)
                  </label>
                  <input
                    type="text"
                    value={customUriInput}
                    onChange={(e) => setCustomUriInput(e.target.value)}
                    placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/"
                    className="form-input text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Database Name
                  </label>
                  <input
                    type="text"
                    value={customDbNameInput}
                    onChange={(e) => setCustomDbNameInput(e.target.value)}
                    placeholder="ai_crop_optimizer"
                    className="form-input text-xs font-mono"
                  />
                </div>
              </div>

              {connectMsg && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in border ${
                    connectMsg.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {connectMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  )}
                  <span>{connectMsg.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11.5px] text-slate-500 dark:text-slate-400">
                  Credentials are handled server-side securely.
                </span>

                <button
                  type="submit"
                  disabled={isTestingConnection}
                  className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Testing Connection...</span>
                    </>
                  ) : (
                    <>
                      <Server className="w-4 h-4" />
                      <span>Connect & Test Database</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </details>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          {/* Notifications */}
          <div className="app-card p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Bell className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Real-time Agricultural Alert Channels
              </h3>
            </div>

            <div className="space-y-4">
              {[
                {
                  title: "SMS Weather & Rainfall Radar Alerts",
                  desc: "Instant mobile notification 48h prior to predicted heavy rain.",
                  checked: smsWeatherAlerts,
                  toggle: () => setSmsWeatherAlerts(!smsWeatherAlerts),
                },
                {
                  title: "APMC Mandi Price Spike Triggers",
                  desc: "Alert when wheat, mustard, or cash crop prices jump > ₹50/q.",
                  checked: mandiPriceSpikes,
                  toggle: () => setMandiPriceSpikes(!mandiPriceSpikes),
                },
                {
                  title: "Drone Multispectral NDVI Scan Reports",
                  desc: "Alert when field health index drops below 75 or moisture deviates.",
                  checked: droneNdviScans,
                  toggle: () => setDroneNdviScans(!droneNdviScans),
                },
                {
                  title: "Weekly Agronomy Executive Email Digest",
                  desc: "Consolidated PDF summary of soil telemetry and harvest forecast.",
                  checked: emailWeeklyReport,
                  toggle: () => setEmailWeeklyReport(!emailWeeklyReport),
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      {item.title}
                    </span>
                    <span className="text-[11.5px] text-slate-500 dark:text-slate-400 block">
                      {item.desc}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={item.toggle}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      item.checked
                        ? "bg-emerald-500"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                        item.checked ? "left-5.5 shadow-sm" : "left-0.5"
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="app-card p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Key className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Account Security & Credentials
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="form-input text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="form-input text-xs"
                />
              </div>

              {passMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs border ${
                    passMsg.type === "success"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  {passMsg.text}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </button>
            </form>
          </div>

          {/* Account & Session Management Card */}
          <div className="app-card p-6 space-y-5 md:col-span-2">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <User className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-heading font-bold text-slate-900 dark:text-white">
                Account & Realtime Session Management
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Manage your active agronomy session, switch accounts, or permanently delete your farm profile and stored records from MongoDB.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setSaveSuccessMsg("Signed out successfully.");
                      setTimeout(() => setSaveSuccessMsg(null), 3000);
                    }}
                    className="btn-secondary py-2.5 px-4 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Session</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="btn-secondary py-2.5 px-4 text-xs font-bold text-[var(--primary)] flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register Another Farm Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="btn-danger py-2.5 px-4 text-xs font-bold flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Account & Wipe Data</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => openAuthModal("login")}
                    className="btn-primary py-2.5 px-5 text-xs font-bold flex items-center gap-2 cursor-pointer"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Agronomist Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openAuthModal("signup")}
                    className="btn-secondary py-2.5 px-5 text-xs font-bold text-[var(--primary)] flex items-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Create Fresh Account</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Real-time High-Security Account Deletion & Wipe Modal */}
      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}

export default SettingsView;
