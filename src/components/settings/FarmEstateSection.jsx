import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  Tractor,
  MapPin,
  Trees,
  Droplets,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  Navigation,
  Scale,
  Building2,
  RefreshCw,
  Plus,
  X,
  Database
} from "lucide-react";

const COMMON_CROPS = [
  "Wheat (HD-2967)",
  "Mustard (Pusa Bold)",
  "Maize (DKC-9108)",
  "Soybean (JS-335)",
  "Paddy / Basmati Rice",
  "Cotton (Bt-Hybrid)",
  "Chickpea (Desi Chana)",
  "Sugarcane (Co-0238)",
  "Potato (Kufri Jyoti)",
  "Sunflower (KBSH-53)",
];

const SOIL_TYPES = [
  { id: "alluvial", name: "Alluvial Sandy Loam (Indo-Gangetic Plain)" },
  { id: "black_cotton", name: "Black Cotton / Regur Soil (Deccan Trap)" },
  { id: "red_laterite", name: "Red & Laterite Soil (Sub-Tropical)" },
  { id: "clay_loam", name: "Clayey Loam (High Water Retention)" },
  { id: "sandy_arid", name: "Arid & Semi-Arid Sandy Soil" },
];

export function FarmEstateSection() {
  const { farmProfile, updateFarmProfile, isSaving } = useAuth();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    farmName: farmProfile?.farmName || "",
    ownerName: farmProfile?.ownerName || "",
    location: farmProfile?.location || "",
    district: farmProfile?.district || "",
    state: farmProfile?.state || "",
    country: farmProfile?.country || "India",
    totalAreaAcres: farmProfile?.totalAreaAcres ?? 0,
    primaryWaterSource: farmProfile?.primaryWaterSource || "",
    primarySoilType: farmProfile?.primarySoilType || "Alluvial Sandy Loam (Indo-Gangetic Plain)",
    primaryCrops: farmProfile?.primaryCrops || [],
    geoCoordinates: farmProfile?.geoCoordinates || { lat: 24.95, lon: 84.01 },
    apmcMandiYard: farmProfile?.apmcMandiYard || "",
    irrigationType: farmProfile?.irrigationType || "",
  });

  useEffect(() => {
    if (farmProfile) {
      setFormData({
        farmName: farmProfile.farmName || "",
        ownerName: farmProfile.ownerName || "",
        location: farmProfile.location || "",
        district: farmProfile.district || "",
        state: farmProfile.state || "",
        country: farmProfile.country || "India",
        totalAreaAcres: farmProfile.totalAreaAcres ?? 0,
        primaryWaterSource: farmProfile.primaryWaterSource || "",
        primarySoilType: farmProfile.primarySoilType || "Alluvial Sandy Loam (Indo-Gangetic Plain)",
        primaryCrops: farmProfile.primaryCrops || [],
        geoCoordinates: farmProfile.geoCoordinates || { lat: 24.95, lon: 84.01 },
        apmcMandiYard: farmProfile.apmcMandiYard || "",
        irrigationType: farmProfile.irrigationType || "",
      });
    } else {
      setFormData({
        farmName: "",
        ownerName: "",
        location: "",
        district: "",
        state: "",
        country: "India",
        totalAreaAcres: 0,
        primaryWaterSource: "",
        primarySoilType: "Alluvial Sandy Loam (Indo-Gangetic Plain)",
        primaryCrops: [],
        geoCoordinates: { lat: 24.95, lon: 84.01 },
        apmcMandiYard: "",
        irrigationType: "",
      });
    }
  }, [farmProfile]);

  const [newCropInput, setNewCropInput] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCrop = (cropName) => {
    const target = cropName.trim();
    if (!target || formData.primaryCrops.includes(target)) return;
    setFormData((prev) => ({
      ...prev,
      primaryCrops: [...prev.primaryCrops, target],
    }));
    setNewCropInput("");
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData((prev) => ({
      ...prev,
      primaryCrops: prev.primaryCrops.filter((c) => c !== cropToRemove),
    }));
  };

  const detectGpsLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: parseFloat(pos.coords.latitude.toFixed(4)),
          lon: parseFloat(pos.coords.longitude.toFixed(4)),
        };
        setFormData((prev) => ({ ...prev, geoCoordinates: coords }));
        setIsDetectingGps(false);
      },
      () => {
        setIsDetectingGps(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateFarmProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {saveSuccess && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl animate-in fade-in border ${
            isDarkMode
              ? "bg-[#141414] border-[#22c55e] text-emerald-400"
              : "bg-emerald-50 border-emerald-400 text-emerald-900"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Farm & estate telemetry saved!</p>
            <p className={isDarkMode ? "text-[#a7f3d0]" : "text-emerald-700"}>
              Stored in MongoDB collections in real-time.
            </p>
          </div>
        </div>
      )}

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
                Farm Estate Topography & Acreage Telemetry
              </h3>
              <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
                Controls field telemetry models, micro-irrigation algorithms, and local APMC mandi price indices.
              </p>
            </div>

            <button
              type="button"
              onClick={detectGpsLocation}
              disabled={isDetectingGps}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto ${
                isDarkMode
                  ? "bg-[#141414] border-emerald-500/25 hover:bg-[#1c231f] text-emerald-400"
                  : "bg-emerald-50 border-emerald-300 hover:bg-emerald-100 text-emerald-800"
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 text-[#22c55e] ${isDetectingGps ? "animate-spin" : ""}`} />
              <span>{isDetectingGps ? "Detecting GPS..." : "Auto-Pin GPS Coordinates"}</span>
            </button>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Farm Estate Name */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Farm / Estate Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ganga Green Agro Estate"
                  value={formData.farmName}
                  onChange={(e) => handleInputChange("farmName", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Farm Owner */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Owner / Landholder
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Patel"
                value={formData.ownerName}
                onChange={(e) => handleInputChange("ownerName", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* Total Acreage */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Total Cultivated Acreage (Acres)
              </label>
              <div className="relative">
                <Scale
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.totalAreaAcres}
                  onChange={(e) => handleInputChange("totalAreaAcres", parseFloat(e.target.value) || 0)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Geographic Coordinates */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                GPS Coordinates (Lat / Lon)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lat (e.g. 24.95)"
                  value={formData.geoCoordinates?.lat || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      geoCoordinates: { ...prev.geoCoordinates, lat: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none font-mono transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
                <input
                  type="number"
                  step="0.0001"
                  placeholder="Lon (e.g. 84.01)"
                  value={formData.geoCoordinates?.lon || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      geoCoordinates: { ...prev.geoCoordinates, lon: parseFloat(e.target.value) || 0 },
                    }))
                  }
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none font-mono transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Primary Soil Type */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Predominant Soil Classification
              </label>
              <div className="relative">
                <Layers
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <select
                  value={formData.primarySoilType}
                  onChange={(e) => handleInputChange("primarySoilType", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                >
                  {SOIL_TYPES.map((soil) => (
                    <option key={soil.id} value={soil.name}>
                      {soil.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Water Source & Irrigation */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Water Source & Micro-Irrigation
              </label>
              <div className="relative">
                <Droplets
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. Solar Drip & Tubewell Canal"
                  value={formData.primaryWaterSource}
                  onChange={(e) => handleInputChange("primaryWaterSource", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Primary Mandi Yard */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Linked APMC Mandi Yard
              </label>
              <input
                type="text"
                placeholder="e.g. Sasaram APMC Grain Market"
                value={formData.apmcMandiYard}
                onChange={(e) => handleInputChange("apmcMandiYard", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* District & State */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                District & State
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

          {/* Active Cultivated Crops Tags */}
          <div className="space-y-3 pt-2">
            <label
              className={`block text-xs font-semibold ${
                isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
              }`}
            >
              Primary Crops in Active Rotation
            </label>

            <div className="flex flex-wrap gap-2 items-center">
              {formData.primaryCrops.map((crop, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-colors ${
                    isDarkMode
                      ? "bg-[#141414] border-[#22c55e]/40 text-emerald-400"
                      : "bg-emerald-50 border-emerald-300 text-emerald-800"
                  }`}
                >
                  <Trees className="w-3.5 h-3.5 text-[#22c55e]" />
                  <span>{crop}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCrop(crop)}
                    className="p-0.5 hover:text-rose-500 cursor-pointer transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newCropInput}
                  onChange={(e) => setNewCropInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCrop(newCropInput);
                    }
                  }}
                  placeholder="+ Add crop variety..."
                  className={`border rounded-xl px-3 py-1.5 text-xs outline-none transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-[rgba(34,197,94,0.25)] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleAddCrop(newCropInput)}
                  className={`p-1.5 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    isDarkMode
                      ? "bg-[#141414] border-[#22c55e] text-emerald-400 hover:bg-[#1c231f]"
                      : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Add Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className={`text-[10px] ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
                Quick Add:
              </span>
              {COMMON_CROPS.filter((c) => !formData.primaryCrops.includes(c))
                .slice(0, 5)
                .map((crop, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddCrop(crop)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                      isDarkMode
                        ? "bg-[#0a0d0c] border-[rgba(34,197,94,0.2)] text-neutral-400 hover:text-white hover:border-[#4ade80]"
                        : "bg-slate-100 border-slate-300 text-slate-700 hover:text-emerald-900 hover:border-emerald-400"
                    }`}
                  >
                    + {crop.split(" ")[0]}
                  </button>
                ))}
            </div>
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
              <span>{isSaving ? "Saving to MongoDB..." : "Save Farm Profile"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
