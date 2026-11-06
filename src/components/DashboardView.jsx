import React, { useState, useEffect } from "react";
import {
  Sprout,
  MapPin,
  TrendingUp,
  Activity,
  ArrowUpRight,
  Droplets,
  Wind,
  CloudSun,
  CloudRain,
  Sun,
  ChevronRight,
  ArrowRight,
  Layers,
  Bug,
  Camera,
  Landmark,
  Volume2,
  Check,
  Search,
  Sparkles,
  ShieldCheck,
  ChevronDown,
  BarChart3,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "../context/LocationContext";
import { useFarm } from "../context/FarmContext.jsx";
import { DateRangePicker } from "../components/DateRangePicker";

export const DashboardView = ({
  setActiveTab: propSetActiveTab,
  onOpenQuickAction: propOnOpenQuickAction,
  openQuickAction: propOpenQuickAction,
} = {}) => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { locationName } = useLocation();
  const farmContext = useFarm();

  const setActiveTab = propSetActiveTab || farmContext?.setActiveTab || (() => {});
  const openQuickAction = propOpenQuickAction || propOnOpenQuickAction || farmContext?.openQuickAction || (() => {});
  const onOpenQuickAction = (type = "task") => openQuickAction(type);

  // Industry-grade Workable Date Range State with Dynamic Real-Time Clock
  const [dateRange, setDateRange] = useState(() => {
    const saved = localStorage.getItem("agri_dashboard_date_range");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const s = new Date(parsed.startDate);
        const e = new Date(parsed.endDate);
        if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
          return {
            startDate: s,
            endDate: e,
            label: parsed.label,
            presetKey: parsed.presetKey,
          };
        }
      } catch (e) {
        // fallback
      }
    }
    const today = new Date();
    const last7 = new Date();
    last7.setDate(today.getDate() - 6);
    const startStr = last7.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = today.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return {
      startDate: last7,
      endDate: today,
      label: `${startStr} – ${endStr}`,
      presetKey: "last_7_days",
    };
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [liveWeather, setLiveWeather] = useState(null);
  const [mandiSearchTerm, setMandiSearchTerm] = useState("");

  const handleDateRangeChange = (newRange) => {
    setDateRange(newRange);
    try {
      localStorage.setItem(
        "agri_dashboard_date_range",
        JSON.stringify({
          startDate: newRange.startDate.toISOString(),
          endDate: newRange.endDate.toISOString(),
          label: newRange.label,
          presetKey: newRange.presetKey,
        }),
      );
    } catch (e) {
      console.warn("Could not save date range:", e);
    }
  };

  // Dynamic user name from saved profile in AuthContext
  const userFirstName = user?.name ? user.name.split(" ")[0] : "Farmer";
  const displayLocation =
    locationName || user?.location || "Sasaram, Rohtas, Bihar";

  const fetchDashboard = () => {
    const token = localStorage.getItem("agri_ai_token");
    fetch("/api/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.metrics) {
          setDashboardData(data);
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  };

  const fetchWeather = (loc) => {
    const savedKey = localStorage.getItem("agri_openweather_key") || "";
    fetch(
      `/api/weather?location=${encodeURIComponent(loc)}${savedKey ? `&apiKey=${encodeURIComponent(savedKey)}` : ""}`,
    )
      .then((res) => res.json())
      .then((data) => {
        if (data && data.locationName) {
          setLiveWeather(data);
        }
      })
      .catch((e) => console.warn("Dashboard weather sync warning:", e));
  };

  useEffect(() => {
    fetchDashboard();
    fetchWeather(displayLocation);

    const handleUpdate = () => {
      fetchDashboard();
      fetchWeather(displayLocation);
    };

    window.addEventListener("farm_data_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("farm_data_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [displayLocation]);

  // Dynamic calculation for date span & telemetry
  const daysSpan = Math.max(
    1,
    Math.ceil(
      Math.abs(dateRange.endDate.getTime() - dateRange.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );

  const areaChangeText =
    daysSpan <= 1
      ? "+0.4 ha today"
      : daysSpan <= 7
        ? "+8.4 ha this week"
        : daysSpan <= 31
          ? "+14.2 ha this month"
          : "+36.8 ha this season";

  // Dynamic X-axis timeline dates for Soil Moisture graph
  const chartTimelineDates = (() => {
    const list = [];
    const diff = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    const step = diff / 6;
    for (let i = 0; i < 7; i++) {
      const d = new Date(dateRange.startDate.getTime() + step * i);
      list.push({
        label: d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        isMiddle: i === 3,
      });
    }
    return list;
  })();

  // Dynamic metrics with defaults matching reference screenshot
  const totalFields = dashboardData?.metrics?.totalFields ?? 24;
  const activeFields = dashboardData?.metrics?.activeFields ?? 14;
  const inactiveFields = dashboardData?.metrics?.inactiveFields ?? 10;
  const totalArea = dashboardData?.metrics?.totalArea ?? 125.6;
  const cropsGrowingCount = dashboardData?.metrics?.cropsGrowingCount ?? 6;
  const cropsGrowingSample =
    dashboardData?.metrics?.cropsGrowingSample ?? "Wheat, Corn, Soybean...";
  const aiHealthScore = dashboardData?.metrics?.aiHealthScore ?? 86;
  const healthScoreRating = dashboardData?.metrics?.healthScoreRating ?? "Good";

  const healthBreakdown = dashboardData?.fieldHealthBreakdown ?? {
    excellent: 35,
    good: 40,
    average: 15,
    poor: 10,
  };

  const cropDist =
    dashboardData?.cropDistribution && dashboardData.cropDistribution.length > 0
      ? dashboardData.cropDistribution
      : [
          { crop: "Wheat", area: 45.2, percentage: 36, color: "#eab308" },
          { crop: "Corn", area: 32.8, percentage: 26, color: "#22c55e" },
          { crop: "Soybean", area: 25.6, percentage: 20, color: "#16a34a" },
          { crop: "Barley", area: 12.5, percentage: 10, color: "#3b82f6" },
          { crop: "Other", area: 9.5, percentage: 8, color: "#8d9d92" },
        ];

  const featuredField = dashboardData?.featuredField ?? {
    id: "geork_1",
    name: "Geork Field",
    crop: "Wheat",
    area: 28.4,
    healthScore: 92,
    ndvi: 0.82,
    moisture: 52,
    risk: "Low",
  };

  const soilSummary = dashboardData?.soilSummary ?? {
    nitrogen: "Medium",
    phosphorus: "High",
    potassium: "Medium",
    avgPh: 6.8,
    organicMatterPercent: 2.8,
    organicMatterRating: "Good level",
  };

  // Neumorphic balanced card backdrop
  const glassCardClass =
    "app-card text-[var(--text-primary)] transition-all";

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 w-full">
      {/* Top Header / Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)] flex items-center gap-2">
            <span>Welcome back, {userFirstName}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Here is your live farm intelligence & crop performance dashboard.
          </p>
        </div>

        {/* Date Filter Dynamic Range Picker */}
        <div>
          <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
        </div>
      </div>

      {/* ACROP-Inspired Hero Section & Market Finder */}
      <div className="relative overflow-hidden rounded-[28px] border border-[var(--border)] bg-white dark:bg-[#0F0F0F] p-6 sm:p-8 md:p-10 shadow-sm transition-all">
        <div className="max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>For Farmers, Traders &amp; Buyers</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight leading-[1.12]">
            Mandi prices. Arrivals. <span className="text-emerald-600 dark:text-emerald-400">Crop care.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
            Compare reported prices and quantities across 4,300+ APMCs, explore crop problems by scientific composition, and simulate precision agronomy ROI before your next decision.
          </p>

          {/* ACROP Market Finder Search Box */}
          <div className="pt-2 max-w-2xl">
            <div className="relative flex items-center">
              <Search className="absolute left-4 w-5 h-5 text-slate-400 dark:text-neutral-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Search a commodity, mandi, state or crop problem..."
                value={mandiSearchTerm}
                onChange={(e) => setMandiSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && mandiSearchTerm.trim()) {
                    setActiveTab("market_intelligence");
                  }
                }}
                className="w-full h-14 pl-12 pr-28 rounded-2xl border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-[#141414] focus:ring-2 focus:ring-emerald-500/20 shadow-xs transition-all"
              />
              <button
                type="button"
                onClick={() => setActiveTab("market_intelligence")}
                className="absolute right-2.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Quick Commodity Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-1">
              {[
                { name: "Onion", state: "Maharashtra" },
                { name: "Wheat", state: "Punjab" },
                { name: "Tomato", state: "Karnataka" },
                { name: "Soyabean", state: "Madhya Pradesh" },
                { name: "Cotton", state: "Gujarat" },
                { name: "Maize", state: "Bihar" },
              ].map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveTab("market_intelligence")}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] hover:bg-emerald-500/10 hover:border-emerald-500/30 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="font-bold">{item.name}</span>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500">Mandi reports →</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Coverage Metrics Strip */}
        <div className="mt-8 pt-6 border-t border-slate-200/80 dark:border-white/[0.08] grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              4,337
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
              APMC markets in our coverage
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              483
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
              Commodities tracked live
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              79
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
              Crops in knowledge base
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              34
            </div>
            <div className="text-xs text-slate-500 dark:text-neutral-400 mt-0.5 font-medium">
              States &amp; UTs integrated
            </div>
          </div>
        </div>
      </div>

      {/* What's Your Next Decision Section (ACROP Intent Matrix) */}
      <div className="space-y-4 my-2">
        <div className="px-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            Different work. A shared need for clarity.
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            What’s your next decision?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Decision Card 1 */}
          <div
            onClick={() => setActiveTab("disease_diagnosis")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Make an informed input choice
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Explore crop problems and compare product information by use and chemical composition. Take a clearer question to your dealer or agronomy advisor.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Explore crop &amp; pest guides</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Decision Card 2 */}
          <div
            onClick={() => setActiveTab("market_intelligence")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Plan your mandi visit
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Check reported prices and dates across markets. Consider crop quality, transport and APMC cess charges before loading your tractor or vehicle.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>Find mandi prices &amp; arrivals</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Decision Card 3 */}
          <div
            onClick={() => setActiveTab("reports")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Spend less time looking for reports
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Follow selected crops and mandis with 30-day econometric trend forecasts and real-time mandi price alert schedules.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
              <span>View mandi reports &amp; alerts</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Ask ACROP / Dr. Krishi AI Section */}
      <div className="rounded-[28px] border border-[var(--border)] bg-white dark:bg-[#0F0F0F] p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
              Start with a photo or a question
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Agriculture has questions. Ask Dr. Krishi AI.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-1 max-w-xl">
              Ask in ten Indian languages or English. Upload a leaf photo to screen for pests and diseases, or inquire about current market rates.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("ai_advisor")}
            className="btn-primary text-xs flex items-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Open Full AI Advisor</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Photo Diagnostic Dropzone */}
          <div
            onClick={() => setActiveTab("disease_diagnosis")}
            className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/10 hover:border-emerald-500/60 bg-slate-50/70 dark:bg-white/[0.02] p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Scan Crop Leaf or Describe Symptoms
            </h4>
            <p className="text-xs text-slate-500 dark:text-neutral-400 max-w-xs">
              Upload an image of an affected leaf, stem, or fruit to run deep computer-vision pathology.
            </p>
            <span className="mt-4 px-3 py-1.5 rounded-xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs group-hover:border-emerald-500/40">
              Upload Photo for Diagnosis →
            </span>
          </div>

          {/* Right: Quick Voice / Text Question Box */}
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.02] p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400 mb-3 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Frequently Asked Farmer Questions</span>
              </div>
              <div className="space-y-2">
                {[
                  "Yellow rust treatment schedule for HD-2967 wheat",
                  "Organic remedy for tomato leaf curl virus & whiteflies",
                  "NPK fertilizer dose for 2.5 hectares black soil",
                  "Arrival trends & modal rate for onion in Nashik APMC",
                ].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setActiveTab("ai_advisor")}
                    className="w-full text-left p-2.5 rounded-xl text-xs font-medium border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#141414] hover:border-emerald-500/50 text-slate-700 dark:text-neutral-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate pr-2">“{q}”</span>
                    <ArrowRight className="w-3.5 h-3.5 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-neutral-400">
              <span>Supports Hindi, English, Marathi, Punjabi + 7 more</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 cursor-pointer" onClick={() => setActiveTab("ai_advisor")}>
                Ask voice question →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Banner with Aerial Landscape Background */}
      <div
        className="relative rounded-[22px] overflow-hidden border border-[var(--border)] shadow-md p-4 sm:p-5 md:p-6 bg-cover bg-center min-h-[520px] flex flex-col justify-between"
        style={{
          backgroundImage: `url('/images/dashboard_bg.jpg')`,
        }}
      >
        {/* Balanced backdrop overlay for high legibility */}
        <div
          className={`absolute inset-0 pointer-events-none transition-colors ${
            isDarkMode
              ? "bg-gradient-to-b from-[#000000]/90 via-[#000000]/75 to-[#000000]/95"
              : "bg-gradient-to-b from-slate-50/92 via-slate-50/80 to-slate-50/95"
          }`}
        />

        {/* Top 4 KPI Metric Cards sitting inside the Landscape */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Card 1: Total Fields (Emerald Accent) */}
          <div
            id="dashboard-kpi-total-fields"
            onClick={() => setActiveTab("farm")}
            className={`${glassCardClass} p-4 sm:p-5 cursor-pointer hover:border-[var(--primary)] hover:shadow-md group`}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Total Fields
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-[var(--text-primary)] my-1 tracking-tight">
              {totalFields}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5 font-medium">
              <span className="text-[var(--success)] font-semibold">
                ↑ {activeFields} Active
              </span>
              <span>•</span>
              <span>{inactiveFields} Inactive</span>
            </div>
          </div>

          {/* Card 2: Total Area (Blue Info Accent) */}
          <div
            id="dashboard-kpi-total-area"
            onClick={() => setActiveTab("farm")}
            className={`${glassCardClass} p-4 sm:p-5 cursor-pointer hover:border-[var(--info)] hover:shadow-md group`}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Total Area
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
                {totalArea}
              </span>
              <span className="text-sm font-semibold text-[var(--text-muted)]">
                ha
              </span>
            </div>
            <div className="text-xs text-[var(--info)] mt-1.5 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{areaChangeText}</span>
            </div>
          </div>

          {/* Card 3: Crops Growing (Amber Warning Accent) */}
          <div
            id="dashboard-kpi-crops-growing"
            onClick={() => setActiveTab("crops")}
            className={`${glassCardClass} p-4 sm:p-5 cursor-pointer hover:border-[var(--warning)] hover:shadow-md group`}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                Crops Growing
              </span>
            </div>
            <div className="text-3xl font-bold font-heading text-[var(--text-primary)] my-1 tracking-tight">
              {cropsGrowingCount}
            </div>
            <div
              className="text-xs text-[var(--text-muted)] mt-1.5 truncate font-medium"
              title={cropsGrowingSample}
            >
              {cropsGrowingSample}
            </div>
          </div>

          {/* Card 4: AI Health Score (Primary Accent) */}
          <div
            id="dashboard-kpi-health-score"
            onClick={() => setActiveTab("soil")}
            className={`${glassCardClass} p-4 sm:p-5 cursor-pointer hover:border-[var(--primary)] hover:shadow-md group`}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                AI Health Score
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
                {aiHealthScore}
              </span>
              <span className="text-sm font-semibold text-[var(--text-muted)]">
                /100
              </span>
            </div>
            <div className="mt-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                {healthScoreRating}
              </span>
            </div>
          </div>
        </div>

        {/* Middle Stage: Left (Health Overview) + Center (Landscape with Pins & Featured Field) + Right (Weather & Soil) */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left Column: Field Health Overview (Donut Breakdown) */}
          <div
            id="dashboard-field-health-card"
            className={`lg:col-span-4 p-5 flex flex-col justify-between ${glassCardClass}`}
          >
            <div>
              <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Field Health Overview
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                AI-powered vegetation & soil analysis
              </p>

              <div className="flex items-center gap-5">
                {/* SVG Radial Multi-segmented Donut Gauge */}
                <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
                      strokeWidth="11"
                    />
                    {/* Segment 1: Excellent (35%) - Bright Green */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth="11"
                      strokeDasharray={`${238.7 * 0.35} 238.7`}
                      strokeDashoffset="0"
                    />
                    {/* Segment 2: Good (40%) - Emerald */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#4ade80"
                      strokeWidth="11"
                      strokeDasharray={`${238.7 * 0.4} 238.7`}
                      strokeDashoffset={`${-238.7 * 0.35}`}
                    />
                    {/* Segment 3: Average (15%) - Yellow */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="11"
                      strokeDasharray={`${238.7 * 0.15} 238.7`}
                      strokeDashoffset={`${-238.7 * 0.75}`}
                    />
                    {/* Segment 4: Poor (10%) - Coral Red */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="none"
                      stroke="#f87171"
                      strokeWidth="11"
                      strokeDasharray={`${238.7 * 0.1} 238.7`}
                      strokeDashoffset={`${-238.7 * 0.9}`}
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-bold font-heading text-[var(--text-primary)] leading-none">
                      {aiHealthScore}
                    </span>
                    <span className="text-[11px] text-[var(--primary)] font-semibold mt-0.5">
                      {healthScoreRating}
                    </span>
                  </div>
                </div>

                {/* Breakdown Legend */}
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
                      <span className="text-[var(--text-secondary)]">Excellent</span>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {healthBreakdown.excellent}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" />
                      <span className="text-[var(--text-secondary)]">Good</span>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {healthBreakdown.good}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#fbbf24]" />
                      <span className="text-[var(--text-secondary)]">Average</span>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {healthBreakdown.average}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
                      <span className="text-[var(--text-secondary)]">Poor</span>
                    </div>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {healthBreakdown.poor}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement Footer */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex items-center gap-1.5 text-xs text-[var(--primary)] font-semibold">
              <ArrowUpRight className="w-4 h-4" />
              <span>12% improvement from last week</span>
            </div>
          </div>

          {/* Center Column: Open view of aerial landscape with clean interactive pins & Featured Field card */}
          <div className="lg:col-span-4 relative min-h-[260px] flex flex-col justify-between p-2 pb-3">
            {/* Interactive Field Pins */}
            <div className="relative w-full flex-1 pointer-events-auto">
              {/* Field Pin 1 */}
              <button
                type="button"
                onClick={() => setActiveTab("farm")}
                title="North Plot 1 • Corn • Score: 88"
                className="absolute top-[10%] left-[20%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--surface-strong)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] shadow-md group-hover:scale-110 transition-transform">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-[var(--surface-strong)] text-[var(--text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-[var(--border)] whitespace-nowrap z-30">
                  Plot 1 • Corn (88)
                </div>
              </button>

              {/* Field Pin 2 */}
              <button
                type="button"
                onClick={() => setActiveTab("farm")}
                title="Central High Field • Wheat • Score: 94"
                className="absolute top-[14%] left-[54%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--surface-strong)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] shadow-md group-hover:scale-110 transition-transform">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-[var(--surface-strong)] text-[var(--text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-[var(--border)] whitespace-nowrap z-30">
                  Central • Wheat (94)
                </div>
              </button>

              {/* Field Pin 3 */}
              <button
                type="button"
                onClick={() => setActiveTab("farm")}
                title="East Valley • Soybean • Score: 85"
                className="absolute top-[22%] left-[84%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--surface-strong)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] shadow-md group-hover:scale-110 transition-transform">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-[var(--surface-strong)] text-[var(--text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-[var(--border)] whitespace-nowrap z-30">
                  East Valley (85)
                </div>
              </button>

              {/* Field Pin 4 */}
              <button
                type="button"
                onClick={() => setActiveTab("farm")}
                title="South Orchard • Barley • Score: 89"
                className="absolute top-[48%] left-[28%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--surface-strong)] border-2 border-[var(--primary)] flex items-center justify-center text-[var(--primary)] shadow-md group-hover:scale-110 transition-transform">
                  <Sprout className="w-3.5 h-3.5" />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 hidden group-hover:block bg-[var(--surface-strong)] text-[var(--text-primary)] text-[11px] font-semibold px-2 py-0.5 rounded shadow-lg border border-[var(--border)] whitespace-nowrap z-30">
                  South Orchard (89)
                </div>
              </button>

              {/* Field Pin 5 (Active Highlighted Pin) */}
              <button
                type="button"
                onClick={() => setActiveTab("farm")}
                title="Geork Field • Wheat • Score: 92"
                className="absolute top-[52%] left-[65%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20 focus:outline-none"
              >
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-[var(--primary)] animate-ping opacity-60" />
                  <div className="relative w-8 h-8 rounded-full bg-[var(--primary)] border-2 border-white flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                    <Sprout className="w-4 h-4 text-white" />
                  </div>
                </div>
              </button>
            </div>

            {/* Floating Featured Field Interactive Card */}
            <div className="flex justify-end pt-2">
              <div
                id="featured-field-floating-card"
                onClick={() => setActiveTab("farm")}
                className="p-3.5 rounded-[14px] transition-all hover:scale-[1.02] cursor-pointer group min-w-[220px] bg-[var(--surface)]/95 backdrop-blur-md border border-[var(--border-strong)] shadow-lg"
              >
                <div className="flex items-center justify-between font-bold font-heading text-sm text-[var(--text-primary)]">
                  <span className="group-hover:text-[var(--primary)] transition-colors">
                    {featuredField.name}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[var(--primary)] group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {featuredField.crop} • {featuredField.area} ha
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--primary)] font-semibold mt-2 pt-2 border-t border-[var(--border)]">
                  <span>Health Score: {featuredField.healthScore}/100</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 2 Stacked Cards (Weather Today & Soil Health Summary) */}
          <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
            {/* Weather Today Card */}
            <div
              id="dashboard-weather-card"
              onClick={() => setActiveTab("weather")}
              className={`p-4 cursor-pointer hover:border-[var(--primary)] ${glassCardClass}`}
            >
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                  Weather Today
                </h2>
                <span className="text-xs flex items-center gap-1 font-medium text-[var(--text-secondary)]">
                  <MapPin className="w-3 h-3 text-[var(--primary)]" />
                  <span className="truncate max-w-[150px]">
                    {displayLocation}
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between my-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold font-heading text-[var(--text-primary)]">
                    {liveWeather?.currentTemp
                      ? `${liveWeather.currentTemp}°C`
                      : "24°C"}
                  </span>
                  <span className="text-xs font-semibold text-[var(--primary)]">
                    {liveWeather?.condition || "Clear Sky"}
                  </span>
                </div>
                <div className="relative">
                  <Sun className="w-7 h-7 text-amber-400" />
                  <CloudSun className="w-5 h-5 absolute -bottom-1 -right-1 text-slate-400" />
                </div>
              </div>

              {/* 3 mini stats row */}
              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[var(--border)] text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-[var(--info)]" />
                  <span>
                    Hum{" "}
                    <strong className="text-[var(--text-primary)]">
                      {liveWeather?.humidity ?? 52}%
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span>
                    Wind{" "}
                    <strong className="text-[var(--text-primary)]">
                      {liveWeather?.windSpeed ?? 11} km/h
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Rain{" "}
                    <strong className="text-[var(--text-primary)]">
                      {liveWeather?.rainChance ?? 5}%
                    </strong>
                  </span>
                </div>
              </div>

              {/* 5-day mini forecast bar */}
              <div className="grid grid-cols-5 gap-1 pt-2 text-center text-[11px] text-[var(--text-secondary)]">
                {(liveWeather?.forecast && liveWeather.forecast.length >= 5
                  ? liveWeather.forecast.slice(0, 5)
                  : [
                      {
                        day: "Today",
                        tempMax: 28,
                        tempMin: 18,
                        condition: "Sunny",
                      },
                      {
                        day: "Tomorrow",
                        tempMax: 26,
                        tempMin: 17,
                        condition: "Partly Cloudy",
                      },
                      {
                        day: "Day 3",
                        tempMax: 25,
                        tempMin: 16,
                        condition: "Sunny",
                      },
                      {
                        day: "Day 4",
                        tempMax: 24,
                        tempMin: 15,
                        condition: "Cloudy",
                      },
                      {
                        day: "Day 5",
                        tempMax: 27,
                        tempMin: 18,
                        condition: "Sunny",
                      },
                    ]
                ).map((f, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <span className="opacity-80 font-medium">
                      {f.day.slice(0, 3)}
                    </span>
                    <Sun className="w-3.5 h-3.5 text-amber-400 mx-auto" />
                    <span className="font-semibold text-[10px] text-[var(--text-primary)]">
                      {f.tempMax}°/{f.tempMin}°
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Soil Health Summary Card */}
            <div
              id="dashboard-soil-summary-card"
              onClick={() => setActiveTab("soil")}
              className={`p-4 cursor-pointer hover:border-[var(--primary)] ${glassCardClass}`}
            >
              <h2 className="text-sm font-bold font-heading text-[var(--text-primary)]">
                Soil Health Summary
              </h2>
              <p className="text-xs text-[var(--text-muted)] mb-2.5">
                Average across all active plots
              </p>

              {/* NPK Pills Row */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 font-heading">
                    N
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] text-[var(--text-muted)]">Nitrogen</div>
                    <div className="text-xs font-semibold text-[var(--warning)]">
                      {soilSummary.nitrogen}
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 font-heading">
                    P
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] text-[var(--text-muted)]">Phosphorus</div>
                    <div className="text-xs font-semibold text-[var(--success)]">
                      {soilSummary.phosphorus}
                    </div>
                  </div>
                </div>

                <div className="p-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] font-bold text-xs flex items-center justify-center shrink-0 font-heading">
                    K
                  </div>
                  <div className="leading-tight">
                    <div className="text-[10px] text-[var(--text-muted)]">Potassium</div>
                    <div className="text-xs font-semibold text-[var(--warning)]">
                      {soilSummary.potassium}
                    </div>
                  </div>
                </div>
              </div>

              {/* Soil Organic Matter Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--text-secondary)] font-medium">
                    Soil Organic Matter
                  </span>
                  <span className="font-bold text-[var(--text-primary)] font-heading">
                    {soilSummary.organicMatterPercent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-[var(--surface-strong)] border border-[var(--border)]">
                  <div
                    className="h-full bg-[var(--primary)] rounded-full transition-all"
                    style={{ width: "70%" }}
                  />
                </div>
                <div className="text-[11px] text-[var(--primary)] font-semibold mt-1">
                  {soilSummary.organicMatterRating}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KrishiScan Inspired Precision Agriculture Engines Grid */}
      <div className="space-y-4 my-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
              AI Precision Agriculture Engines
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-0.5">
              Multi-modal decision intelligence, computer vision pathology, and live APMC mandi econometrics
            </p>
          </div>
          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            6 Engines Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: AI crop health screening */}
          <div
            onClick={() => setActiveTab("disease_diagnosis")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                AI crop health screening
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Photograph a crop to screen for possible disease, pests and nutrient deficiencies, with suggested remedies.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Organic remedies & biopesticides</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Grad-CAM visual pathology heatmap</span>
              </div>
            </div>
          </div>

          {/* Card 2: Mandi price intelligence */}
          <div
            onClick={() => setActiveTab("market_intelligence")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                Mandi price intelligence
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Search-grounded mandi and retail prices, with location filters. Confirm real-time rates with your buyer.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Profit AI and APMC retail price insights</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>30-day econometric trend forecast</span>
              </div>
            </div>
          </div>

          {/* Card 3: Government scheme discovery (Featured glowing card) */}
          <div
            onClick={() => setActiveTab("reports")}
            className="krishi-card krishi-card-featured cursor-pointer group relative"
          >
            <div>
              <div className="krishi-icon-box bg-emerald-500/20 border-emerald-500/40 text-emerald-300">
                <Landmark className="w-5 h-5" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                  Government scheme discovery
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Featured
                </span>
              </div>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Upload profile documents or answer questions to explore schemes. Check eligibility on official portals.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Yojana AI and document assistant</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PM-Kisan & KCC subsidy integration</span>
              </div>
            </div>
          </div>

          {/* Card 4: Kisan Didi voice guidance */}
          <div
            onClick={() => setActiveTab("ai_advisor")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                Kisan Didi voice guidance
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Ask farming questions in ten Indian languages or English. Voice AI grounded on authentic ICAR agronomy manuals.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Hindi, English & regional dialect support</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Personalized agronomy prescriptions</span>
              </div>
            </div>
          </div>

          {/* Card 5: Satellite-powered field insights */}
          <div
            onClick={() => setActiveTab("farm")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                Satellite-powered field insights
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Draw or walk field boundaries and view satellite vegetation layers. Multi-spectral NDVI & moisture.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Plot boundary telemetry & acreage</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Canopy stress and vegetation index</span>
              </div>
            </div>
          </div>

          {/* Card 6: AI Crop Suitability & Profit */}
          <div
            onClick={() => setActiveTab("crops")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold font-heading text-[var(--text-primary)] group-hover:text-emerald-400 transition-colors">
                AI Crop Suitability & Profit
              </h3>
              <p className="text-xs sm:text-[13px] text-[var(--text-secondary)] mt-2 leading-relaxed">
                Deep ML matching across 22+ crops evaluating soil NPK, pH, rainfall, and net commercial profit.
              </p>
            </div>
            <div className="mt-5 pt-3.5 border-t border-[var(--border)] space-y-2">
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Simulated NPK & water requirements</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Commercial net profit / acre forecast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: 3 Equal Grid Cards (Upcoming Tasks, Soil Moisture Trend, Crop Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Column 1: Upcoming Tasks */}
        <div
          id="dashboard-upcoming-tasks-card"
          className="app-card p-5 flex flex-col justify-between"
        >
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)] mb-4">
              Upcoming Tasks
            </h2>

            <div className="space-y-3">
              {/* Task 1 */}
              <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--primary)] flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">
                      Irrigation Scheduled
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      Geork Field
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[var(--text-muted)] mb-0.5">
                    Jun 21, 08:00 AM
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-semibold border border-[var(--primary)]/20">
                    Upcoming
                  </span>
                </div>
              </div>

              {/* Task 2 */}
              <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--primary)] flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">
                      Fertilizer Application
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      North Field
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[var(--text-muted)] mb-0.5">
                    Jun 22, 09:30 AM
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-semibold border border-[var(--primary)]/20">
                    Upcoming
                  </span>
                </div>
              </div>

              {/* Task 3 */}
              <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--primary)] flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                    <Bug className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[var(--text-primary)]">
                      Pest Monitoring
                    </div>
                    <div className="text-[11px] text-[var(--text-muted)]">
                      East Field
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] text-[var(--text-muted)] mb-0.5">
                    Jun 23, 10:00 AM
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--primary-soft)] text-[var(--primary)] text-[10px] font-semibold border border-[var(--primary)]/20">
                    Upcoming
                  </span>
                </div>
              </div>
            </div>
          </div>

          <button
            id="dashboard-view-all-tasks-btn"
            onClick={onOpenQuickAction}
            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>View All Tasks</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Column 2: Soil Moisture Trend Curve */}
        <div
          id="dashboard-moisture-trend-card"
          className="app-card p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Soil Moisture Trend
              </h2>
            </div>
            <div className="text-xs text-[var(--text-muted)] mb-2 font-mono">
              % VWC
            </div>

            {/* Precision SVG Curved Graph */}
            <div className="relative h-44 w-full">
              {/* Y-axis grid & labels */}
              <div className="absolute inset-0 flex flex-col justify-between text-[10px] font-mono pointer-events-none text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">100</span>
                  <div className="flex-1 border-b border-[var(--border)]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">75</span>
                  <div className="flex-1 border-b border-[var(--border)]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">50</span>
                  <div className="flex-1 border-b border-[var(--border)]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">25</span>
                  <div className="flex-1 border-b border-[var(--border)]" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-6 text-right">0</span>
                  <div className="flex-1 border-b border-[var(--border)]" />
                </div>
              </div>

              {/* Chart SVG Canvas */}
              <svg
                className="absolute inset-0 w-full h-full pl-8 pr-2"
                viewBox="0 0 320 150"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id="moistureGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#22c55e" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Area fill under spline */}
                <path
                  d="M 15 50 C 45 60, 65 85, 95 92 C 120 95, 140 98, 165 95 L 165 145 L 15 145 Z"
                  fill="url(#moistureGradient)"
                />

                {/* Solid Curved Line */}
                <path
                  d="M 15 50 C 45 60, 65 85, 95 92 C 120 95, 140 98, 165 95"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <circle cx="15" cy="50" r="3.5" fill="#22c55e" />
                <circle cx="65" cy="85" r="3.5" fill="#22c55e" />
                <circle cx="115" cy="95" r="3.5" fill="#22c55e" />
                <circle
                  cx="165"
                  cy="95"
                  r="4.5"
                  fill="#ffffff"
                  stroke="#22c55e"
                  strokeWidth="3"
                />

                {/* Forecast Dashed Line */}
                <path
                  d="M 165 95 C 195 92, 230 75, 265 60 C 285 52, 305 48, 315 45"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  strokeLinecap="round"
                />

                <circle cx="240" cy="70" r="3" fill="#4ade80" />
                <circle cx="315" cy="45" r="3" fill="#4ade80" />
              </svg>

              {/* Floating Pill Callout for 52% */}
              <div className="absolute top-[72px] left-[52%] -translate-x-1/2 px-2.5 py-0.5 rounded-full border border-[var(--primary)] bg-[var(--surface-strong)] text-[var(--text-primary)] font-bold text-xs shadow-md font-heading">
                52%
              </div>
            </div>

            {/* X-axis date labels */}
            <div className="flex justify-between pl-8 pr-2 text-[10px] font-medium mt-1 text-[var(--text-muted)]">
              {chartTimelineDates.map((item, idx) => (
                <span
                  key={idx}
                  className={
                    item.isMiddle
                      ? "font-bold text-[var(--text-primary)]"
                      : ""
                  }
                >
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5 font-semibold">
              <span className="w-4 h-0.5 bg-[#22c55e]" />
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1.5 text-[var(--text-muted)] font-medium">
              <span className="w-4 h-0.5 border-t border-dashed border-[#4ade80]" />
              <span>Forecast</span>
            </div>
          </div>
        </div>

        {/* Column 3: Crop Distribution Donut & Legend */}
        <div
          id="dashboard-crop-distribution-card"
          className="app-card p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Crop Distribution
              </h2>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">
              By planted area percentage
            </p>

            <div className="flex items-center gap-4">
              {/* SVG Donut Chart */}
              <div className="relative w-32 h-32 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke={isDarkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0"}
                    strokeWidth="12"
                  />
                  {/* Segment 1: Wheat (36%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="12"
                    strokeDasharray={`${238.7 * 0.36} 238.7`}
                    strokeDashoffset="0"
                  />
                  {/* Segment 2: Corn (26%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="12"
                    strokeDasharray={`${238.7 * 0.26} 238.7`}
                    strokeDashoffset={`${-238.7 * 0.36}`}
                  />
                  {/* Segment 3: Soybean (20%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#16a34a"
                    strokeWidth="12"
                    strokeDasharray={`${238.7 * 0.2} 238.7`}
                    strokeDashoffset={`${-238.7 * 0.62}`}
                  />
                  {/* Segment 4: Barley (10%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="12"
                    strokeDasharray={`${238.7 * 0.1} 238.7`}
                    strokeDashoffset={`${-238.7 * 0.82}`}
                  />
                  {/* Segment 5: Other (8%) */}
                  <circle
                    cx="50"
                    cy="50"
                    r="38"
                    fill="none"
                    stroke="#8d9d92"
                    strokeWidth="12"
                    strokeDasharray={`${238.7 * 0.08} 238.7`}
                    strokeDashoffset={`${-238.7 * 0.92}`}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-sm font-bold font-heading text-[var(--text-primary)] leading-tight">
                    {totalArea} ha
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">
                    Total Area
                  </span>
                </div>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 flex-1 text-xs">
                {cropDist.map((item) => (
                  <div
                    key={item.crop}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium text-[var(--text-secondary)]">{item.crop}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[var(--text-muted)] mr-1.5 text-[11px]">{item.area} ha</span>
                      <span className="font-semibold text-[var(--text-primary)]">{item.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            id="dashboard-view-crop-details-btn"
            onClick={() => setActiveTab("farm")}
            className="btn-secondary w-full mt-4 flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Precision Agriculture Section (ACROP Model) */}
      <div className="space-y-4 my-2">
        <div className="px-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            ACROP Precision Agriculture · Rooted in your field
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Field measurements. A plan for the next crop decision.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div
            onClick={() => setActiveTab("weather")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <CloudRain className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Anticipate disease pressure
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Combine field microclimate telemetry with crop stage to forecast pathology risk and guide when to inspect your crop before symptoms spread.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>View telemetry &amp; disease risk</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Pillar 2 */}
          <div
            onClick={() => setActiveTab("disease_diagnosis")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Bug className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Focus pest scouting
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Use crop-specific pest-risk guidance to plan field checks and recognize early signs. Avoid blanket chemical spraying and save input costs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Focus pest monitoring</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Pillar 3 */}
          <div
            onClick={() => setActiveTab("soil")}
            className="krishi-card cursor-pointer group"
          >
            <div>
              <div className="krishi-icon-box">
                <Sprout className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                Plan crop nutrition
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-2 leading-relaxed">
                Bring crop-stage requirements, soil readings and laboratory soil-test results together for balanced nutrient-management advice.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Soil nutrient planning</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Before you get started FAQ Section */}
      <div className="rounded-[28px] border border-[var(--border)] bg-white dark:bg-[#0F0F0F] p-6 sm:p-8 md:p-10 shadow-sm space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
            A little more about ACROP &amp; AI Crop Profit
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
            Before you get started.
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Is AI Crop Profit only for checking mandi prices?",
              a: "No. The platform combines crop diagnostics, AI agronomy guidance, soil health laboratory telemetry, live APMC mandi prices, and crop profitability simulation to support farmers, buyers, and traders throughout the season.",
            },
            {
              q: "Where do the mandi prices and market reports come from?",
              a: "All wholesale prices are sourced daily from AgMarknet (Directorate of Marketing & Inspection, Ministry of Agriculture) across 4,300+ APMCs with date, market, variety, and unit specified.",
            },
            {
              q: "What can I ask Dr. Krishi AI?",
              a: "You can ask about mandi prices, organic and chemical crop protection, pests, fungal diseases, fertilizer dosages, or crop suitability comparisons. Include your crop stage and district for the most grounded response.",
            },
            {
              q: "Can I use the platform in Indian regional languages?",
              a: "Yes. The AI advisor and voice assistant support Hindi, Marathi, Punjabi, Gujarati, Kannada, Telugu, Tamil, and English.",
            },
            {
              q: "Do I need an IoT weather station for personalized crop advice?",
              a: "No. The system combines open satellite telemetry, local IMD grid data, and your laboratory soil tests to provide grounded recommendations without requiring an expensive on-farm hardware station.",
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-white/[0.02] p-4.5 transition-all open:bg-white dark:open:bg-[#141414] open:shadow-xs"
            >
              <summary className="font-bold text-sm sm:text-base text-slate-900 dark:text-white cursor-pointer list-none flex items-center justify-between gap-3">
                <span>{faq.q}</span>
                <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200 shrink-0" />
              </summary>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-neutral-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.08] leading-relaxed">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
};
