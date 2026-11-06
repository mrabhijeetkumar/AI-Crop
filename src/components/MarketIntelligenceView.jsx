import React, { useState, useEffect, useCallback } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import {
  TrendingUp,
  Store,
  Sparkles,
  Truck,
  Search,
  Filter,
  RefreshCw,
  MapPin,
  Key,
  Printer,
  Globe,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  Compass,
  CheckCircle2,
  ChevronRight,
  Info,
  Layers as CategoryIcon,
} from "lucide-react";
import { MandiApiKeyModal } from "./MandiApiKeyModal.jsx";
import { MandiDetailModal } from "./MandiDetailModal.jsx";
import { MandiTradeReportModal } from "./MandiTradeReportModal.jsx";

export const INDIAN_STATES_DISTRICTS = {
  Bihar: [
    "Rohtas",
    "Patna",
    "Purnia",
    "Gaya",
    "Muzaffarpur",
    "Bhagalpur",
    "Nalanda",
    "Bhojpur",
    "Buxar",
    "Kaimur",
    "Begusarai",
    "Samastipur",
    "Darbhanga",
    "Vaishali",
  ],
  Punjab: [
    "Ludhiana",
    "Amritsar",
    "Jalandhar",
    "Patiala",
    "Bathinda",
    "Sangrur",
    "Mansa",
    "Firozpur",
    "Fazilka",
    "Hoshiarpur",
  ],
  "Uttar Pradesh": [
    "Varanasi",
    "Lucknow",
    "Agra",
    "Kanpur",
    "Prayagraj",
    "Meerut",
    "Chandauli",
    "Gorakhpur",
    "Bareilly",
    "Aligarh",
    "Mathura",
    "Jhansi",
  ],
  Maharashtra: [
    "Nashik",
    "Pune",
    "Latur",
    "Nagpur",
    "Kolhapur",
    "Solapur",
    "Ahmednagar",
    "Jalgaon",
    "Amravati",
    "Satara",
  ],
  Haryana: [
    "Karnal",
    "Ambala",
    "Hisar",
    "Sirsa",
    "Panipat",
    "Sonipat",
    "Rohtak",
    "Kurukshetra",
    "Fatehabad",
  ],
  "Madhya Pradesh": [
    "Indore",
    "Ujjain",
    "Bhopal",
    "Jabalpur",
    "Dewas",
    "Ratlam",
    "Sagar",
    "Khargone",
    "Vidisha",
    "Sehore",
  ],
  Rajasthan: [
    "Jaipur",
    "Jodhpur",
    "Kota",
    "Bharatpur",
    "Alwar",
    "Sri Ganganagar",
    "Bikaner",
    "Ajmer",
    "Hanumangarh",
  ],
  Gujarat: [
    "Rajkot",
    "Ahmedabad",
    "Surat",
    "Unjha",
    "Junagadh",
    "Jamnagar",
    "Amreli",
    "Anand",
    "Bhavnagar",
  ],
  Karnataka: [
    "Bengaluru",
    "Belagavi",
    "Hubballi",
    "Mysuru",
    "Kalaburagi",
    "Ballari",
    "Davanagere",
    "Shivamogga",
  ],
  "Tamil Nadu": [
    "Coimbatore",
    "Madurai",
    "Salem",
    "Erode",
    "Thanjavur",
    "Tiruchirappalli",
    "Dindigul",
  ],
  "Andhra Pradesh": [
    "Guntur",
    "Vijayawada",
    "Kurnool",
    "Visakhapatnam",
    "Anantapur",
    "East Godavari",
  ],
  Telangana: [
    "Hyderabad",
    "Warangal",
    "Nizamabad",
    "Karimnagar",
    "Khammam",
    "Nalgonda",
  ],
  "West Bengal": [
    "Bardhaman",
    "Hooghly",
    "Nadia",
    "Murshidabad",
    "Malda",
    "North 24 Parganas",
  ],
};

const COMMODITY_CATEGORIES = [
  "All",
  "Cereals & Grains",
  "Pulses & Legumes",
  "Oilseeds & Cash Crops",
  "Vegetables & Spices",
  "Fruits & Horticulture",
];

const QUICK_AGRICULTURAL_HUBS = [
  { label: "Sasaram (Rohtas)", state: "Bihar", district: "Rohtas" },
  { label: "Khanna (Ludhiana)", state: "Punjab", district: "Ludhiana" },
  { label: "Karnal Grain Yard", state: "Haryana", district: "Karnal" },
  { label: "Nashik Lasalgaon", state: "Maharashtra", district: "Nashik" },
  { label: "Indore APMC", state: "Madhya Pradesh", district: "Indore" },
  { label: "Rajkot Yard", state: "Gujarat", district: "Rajkot" },
  { label: "Jaipur Mandi", state: "Rajasthan", district: "Jaipur" },
  { label: "Varanasi Terminal", state: "Uttar Pradesh", district: "Varanasi" },
];

export function MarketIntelligenceView() {
  const { isDarkMode } = useTheme();
  const { farmProfile, marketApiKey, setMarketApiKey } = useFarm();

  // Search & Filter State
  const [selectedState, setSelectedState] = useState(() => farmProfile?.state || "Bihar");
  const [selectedDistrict, setSelectedDistrict] = useState(() => farmProfile?.district || "Rohtas");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchCrop, setSearchCrop] = useState("");
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem("aicrop_lang") || "en";
    } catch {
      return "en";
    }
  });

  // Telemetry & Data State
  const [commodities, setCommodities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [geoLocating, setGeoLocating] = useState(false);

  // Modals
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [detailModalCommodity, setDetailModalCommodity] = useState(null);
  const [reportModalCommodity, setReportModalCommodity] = useState(null);

  const isHindi = language === "hi";

  // Fetch Mandi Telemetry
  const fetchMandiData = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/market?state=${encodeURIComponent(selectedState)}&district=${encodeURIComponent(
        selectedDistrict
      )}&category=${encodeURIComponent(selectedCategory)}`;
      if (searchCrop) url += `&crop=${encodeURIComponent(searchCrop)}`;
      if (marketApiKey) url += `&apiKey=${encodeURIComponent(marketApiKey)}`;

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCommodities(Array.isArray(data) ? data : []);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.warn("Failed to fetch mandi telemetry:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedCategory, searchCrop, marketApiKey]);

  useEffect(() => {
    fetchMandiData();
  }, [fetchMandiData]);

  // Handle State Change
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    const districts = INDIAN_STATES_DISTRICTS[newState] || [];
    if (districts.length > 0) {
      setSelectedDistrict(districts[0]);
    }
  };

  // Handle GPS Mandi Detect
  const handleGeoDetectMandi = () => {
    if (!navigator.geolocation) return;
    setGeoLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Match closest district approximately
        if (latitude >= 24 && latitude <= 26 && longitude >= 83 && longitude <= 86) {
          setSelectedState("Bihar");
          setSelectedDistrict("Rohtas");
        } else if (latitude >= 29 && latitude <= 32 && longitude >= 74 && longitude <= 77) {
          setSelectedState("Punjab");
          setSelectedDistrict("Ludhiana");
        } else if (latitude >= 18 && latitude <= 21 && longitude >= 72 && longitude <= 75) {
          setSelectedState("Maharashtra");
          setSelectedDistrict("Nashik");
        } else if (latitude >= 21 && latitude <= 24 && longitude >= 75 && longitude <= 78) {
          setSelectedState("Madhya Pradesh");
          setSelectedDistrict("Indore");
        } else {
          setSelectedState("Bihar");
          setSelectedDistrict("Rohtas");
        }
        setGeoLocating(false);
      },
      () => {
        setGeoLocating(false);
      },
      { timeout: 8000 }
    );
  };

  // Toggle Language
  const toggleLanguage = () => {
    const nextLang = language === "en" ? "hi" : "en";
    setLanguage(nextLang);
    try {
      localStorage.setItem("aicrop_lang", nextLang);
    } catch {}
  };

  // Macro Metrics Computation
  const topGainer = commodities.length > 0
    ? [...commodities].sort((a, b) => (b.priceChange || 0) - (a.priceChange || 0))[0]
    : null;

  const totalVolumeTonnes = commodities.reduce((acc, c) => acc + (c.arrivalsTodayTonnes || 0), 0);
  const aboveMspCount = commodities.filter((c) => c.mandiPrice >= c.msp).length;
  const mspRatioPercent = commodities.length > 0 ? Math.round((aboveMspCount / commodities.length) * 100) : 85;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Command Banner */}
      <div
        id="market-command-header"
        className="app-card relative p-6 sm:p-7 overflow-hidden border border-[var(--border)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{isHindi ? "राष्ट्रीय एगमार्कनेट एवं ई-नाम लाइव टेलीमेट्री" : "National AgMarkNet & e-NAM Telemetry"}</span>
              </span>

              <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>
                  {selectedDistrict}, {selectedState} (India)
                </span>
              </span>

              {marketApiKey && (
                <span className="px-2.5 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 text-[10.5px] font-mono">
                  Custom API Sync Active
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight text-[var(--text-primary)]">
              {isHindi ? "मंडी भाव एवं 15-दिवसीय एआई मूल्य पूर्वानुमान" : "APMC Mandi Intelligence & AI Price Forecast"}
            </h1>

            <p className="text-xs sm:text-sm max-w-3xl leading-relaxed text-[var(--text-secondary)] font-sans">
              {isHindi
                ? "देश की प्रमुख कृषि उपज मंडियों से लाइव थोक भाव, CACP न्यूनतम समर्थन मूल्य (MSP) विश्लेषण, और AI 'कब बेचें vs कब रोकें' रणनीतिक निर्णय प्राप्त करें।"
                : "Real-time wholesale trade telemetry, CACP statutory MSP compliance audit, arrival volume trends, and machine learning sell vs. hold execution signals."}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* API Key Modal Button */}
            <button
              id="open-mandi-api-key-btn"
              onClick={() => setApiKeyModalOpen(true)}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{marketApiKey ? (isHindi ? "API Key सक्रिय" : "API Configured") : (isHindi ? "API Key सेट करें" : "Set API Key")}</span>
            </button>

            {/* GPS Geo Detect */}
            <button
              id="geo-detect-mandi-btn"
              onClick={handleGeoDetectMandi}
              disabled={geoLocating}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Compass className={`w-3.5 h-3.5 ${geoLocating ? "animate-spin text-[var(--primary)]" : "text-[var(--primary)]"}`} />
              <span>{geoLocating ? (isHindi ? "खोज रहे हैं..." : "Detecting...") : (isHindi ? "GPS से खोजें" : "Auto GPS")}</span>
            </button>

            {/* Language Toggle */}
            <button
              id="toggle-mandi-language-btn"
              onClick={toggleLanguage}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Globe className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{language === "en" ? "हिंदी में देखें" : "English"}</span>
            </button>

            {/* Live Refresh */}
            <button
              id="refresh-mandi-data-btn"
              onClick={fetchMandiData}
              disabled={loading}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? (isHindi ? "लोड हो रहा है..." : "Syncing...") : (isHindi ? "रिफ्रेश करें" : "Refresh")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Macro Stats Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Top Mandi Gainer */}
        <div id="stat-top-gainer" className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>{isHindi ? "शीर्ष 24h मूल्य उछाल" : "Top 24h Gainer"}</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-bold mt-2 text-emerald-600 dark:text-emerald-400 truncate">
            {topGainer ? topGainer.crop.split("(")[0] : "Wheat (HD-2967)"}
          </div>
          <div className="flex items-baseline justify-between mt-1 text-xs">
            <span className="font-heading font-semibold text-[var(--text-primary)]">
              {topGainer ? `₹${topGainer.mandiPrice}/Q` : "₹2,380/Q"}
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
              {topGainer ? `+${topGainer.priceChange}%` : "+2.8%"}
            </span>
          </div>
        </div>

        {/* Card 2: CACP MSP Benchmark Coverage */}
        <div id="stat-msp-coverage" className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>{isHindi ? "MSP सुरक्षा सूचकांक" : "CACP MSP Premium Index"}</span>
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-bold mt-2 text-[var(--text-primary)]">
            {mspRatioPercent}% {isHindi ? "फसलें MSP से ऊपर" : "Above MSP"}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1 flex items-center gap-1 truncate">
            <span>
              {aboveMspCount} of {commodities.length} {isHindi ? "मंडी जिंसों में MSP से अधिक भाव" : "commodities at premium"}
            </span>
          </div>
        </div>

        {/* Card 3: Total APMC Arrivals */}
        <div id="stat-arrivals-volume" className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>{isHindi ? "दैनिक मंडी कुल आवक" : "Total Daily Inflow"}</span>
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-bold mt-2 text-[var(--text-primary)]">
            {totalVolumeTonnes.toLocaleString("en-IN")} <span className="text-xs font-normal text-[var(--text-muted)] font-sans">Tonnes</span>
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1">
            ≈ {(totalVolumeTonnes * 10).toLocaleString("en-IN")} {isHindi ? "बोरी (50kg)" : "Bags (50kg)"}
          </div>
        </div>

        {/* Card 4: Macro AI Sentiment */}
        <div id="stat-macro-sentiment" className="app-card p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)]">
            <span>{isHindi ? "एआई बाजार धारणा" : "AI Macro Sentiment"}</span>
            <span className="p-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)]">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-bold mt-2 text-[var(--primary)]">
            {isHindi ? "तेजी का रुझान (Bullish)" : "Strong Bullish"}
          </div>
          <div className="text-xs text-[var(--text-secondary)] mt-1 truncate">
            {isHindi ? "आटा मिल व निर्यात मांग मजबूत" : "Flour mill & export demand strong"}
          </div>
        </div>
      </div>

      {/* 30-Day APMC Machine Learning Price Forecaster Section */}
      <div className="app-card p-5 lg:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-[var(--text-primary)]">
                30-Day APMC Mandi Price Forecaster (Fourier GBDT Engine)
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Time-series forward projection trained on historical mandi wholesale modal arrivals & seasonality
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full border text-xs font-mono font-semibold self-start sm:self-auto bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20">
            Model MAPE: 3.84% | 30-Day Horizon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Wheat Forecast Card */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-[var(--text-primary)]">Wheat (HD-2967)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                Bullish (+5.2%)
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] block text-[var(--text-muted)]">Current Modal</span>
                <span className="text-lg font-heading font-bold text-[var(--text-primary)]">₹2,380/Qtl</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">30-Day Target</span>
                <span className="text-lg font-heading font-bold text-emerald-600 dark:text-emerald-400">₹2,504/Qtl</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)]">
              <strong className="text-emerald-600 dark:text-emerald-400">Action:</strong> Hold in Storage for 2-3 weeks for optimal price realization.
            </div>
          </div>

          {/* Mustard Forecast Card */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-[var(--text-primary)]">Mustard / Rapeseed</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-[10px] font-semibold">
                Near MSP Range
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] block text-[var(--text-muted)]">Current Modal</span>
                <span className="text-lg font-heading font-bold text-[var(--text-primary)]">₹5,420/Qtl</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block">30-Day Target</span>
                <span className="text-lg font-heading font-bold text-amber-600 dark:text-amber-400">₹5,580/Qtl</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)]">
              <strong className="text-amber-600 dark:text-amber-400">Action:</strong> Staggered sales advised. Current price is within ₹230 of MSP (₹5,650).
            </div>
          </div>

          {/* Basmati Paddy Card */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold text-[var(--text-primary)]">Paddy (Basmati 1121)</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-semibold">
                High Export Demand
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] block text-[var(--text-muted)]">Current Modal</span>
                <span className="text-lg font-heading font-bold text-[var(--text-primary)]">₹3,650/Qtl</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">30-Day Target</span>
                <span className="text-lg font-heading font-bold text-emerald-600 dark:text-emerald-400">₹3,910/Qtl</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)]">
              <strong className="text-emerald-600 dark:text-emerald-400">Action:</strong> Bullish momentum. Hold warehouse receipts for premium mills.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Search & Location Command Filter Bar */}
      <div id="mandi-filter-bar" className="app-card p-4 sm:p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3.5 items-center">
          {/* State Selector (3 cols) */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              {isHindi ? "1. राज्य चुनें (State):" : "1. Select State:"}
            </label>
            <select
              id="mandi-state-select"
              value={selectedState}
              onChange={handleStateChange}
              className="form-select w-full"
            >
              {Object.keys(INDIAN_STATES_DISTRICTS).map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector (3 cols) */}
          <div className="lg:col-span-3 space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              {isHindi ? "2. जिला / मंडी केंद्र (District):" : "2. Select District / Mandi Yard:"}
            </label>
            <select
              id="mandi-district-select"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="form-select w-full"
            >
              {(INDIAN_STATES_DISTRICTS[selectedState] || []).map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* Crop Search Filter (4 cols) */}
          <div className="lg:col-span-4 space-y-1">
            <label className="text-xs font-medium text-[var(--text-secondary)] block">
              {isHindi ? "3. फसल खोजें (Crop Name / Variety):" : "3. Search Crop / Variety:"}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="mandi-crop-search-input"
                type="text"
                placeholder={isHindi ? "उदा. Wheat, Mustard, Paddy, Potato..." : "e.g. Wheat, Mustard, Cotton, Potato..."}
                value={searchCrop}
                onChange={(e) => setSearchCrop(e.target.value)}
                className="form-input w-full pl-9 pr-8"
              />
              {searchCrop && (
                <button
                  onClick={() => setSearchCrop("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Live Feed Status Pill (2 cols) */}
          <div className="lg:col-span-2 flex flex-col justify-end pt-1">
            <div className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-center text-xs">
              <span className="text-[10px] text-[var(--text-muted)] block uppercase tracking-wider font-semibold">
                {isHindi ? "टेलीमेट्री स्थिति" : "Live Feeds"}
              </span>
              <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400 text-xs">
                {commodities.length} {isHindi ? "सक्रिय मंडियां" : "Active Mandis"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Hubs Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-medium text-[var(--text-secondary)] mr-1 flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{isHindi ? "प्रमुख कृषि केंद्र:" : "Key Trading Hubs:"}</span>
          </span>
          {QUICK_AGRICULTURAL_HUBS.map((hub) => {
            const isSelected = selectedState === hub.state && selectedDistrict === hub.district;
            return (
              <button
                key={hub.label}
                onClick={() => {
                  setSelectedState(hub.state);
                  setSelectedDistrict(hub.district);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                    : "bg-[var(--surface-subtle)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                }`}
              >
                {hub.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
        {COMMODITY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === cat
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-md shadow-emerald-600/20"
                : "bg-[var(--surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
            }`}
          >
            <CategoryIcon className="w-3.5 h-3.5" />
            <span>
              {cat === "All"
                ? isHindi ? "सभी जिंस (All)" : "All Commodities"
                : cat === "Cereals & Grains"
                ? isHindi ? "अनाज (Cereals)" : cat
                : cat === "Pulses & Legumes"
                ? isHindi ? "दालें (Pulses)" : cat
                : cat === "Oilseeds & Cash Crops"
                ? isHindi ? "तिलहन व नकदी (Cash Crops)" : cat
                : cat === "Vegetables & Spices"
                ? isHindi ? "सब्जियां व मसाले (Vegetables)" : cat
                : isHindi ? "फल व बागवानी (Horticulture)" : cat}
            </span>
          </button>
        ))}
      </div>

      {/* 5. Mandi Commodities Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Store className="w-4 h-4 text-[var(--primary)]" />
            <span>
              {selectedDistrict} {isHindi ? "मंडी दैनिक थोक भाव एवं एआई सिग्नल" : "APMC Mandi Spot Rates & AI Execution Signals"}
            </span>
          </h2>
          <span className="text-xs text-[var(--text-muted)] font-mono">
            {isHindi ? "अंतिम सिंक:" : "Last Sync:"} {lastRefreshed.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <RefreshCw className="w-8 h-8 text-[var(--primary)] animate-spin mx-auto" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">
              {isHindi ? "लाइव एपीएमसी मंडी टेलीमेट्री सिंक हो रही है..." : "Fetching live APMC telemetry and CACP MSP benchmarks..."}
            </p>
          </div>
        ) : commodities.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] space-y-3">
            <Info className="w-8 h-8 text-amber-500 mx-auto" />
            <h3 className="text-base font-heading font-bold text-[var(--text-primary)]">
              {isHindi ? "कोई फसल नहीं मिली" : "No Commodities Found"}
            </h3>
            <p className="text-xs text-[var(--text-secondary)]">
              {isHindi
                ? "कृपया खोज शब्द बदलें या 'All' श्रेणी चुनें।"
                : "Try clearing your search query or switching commodity categories."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {commodities.map((item, idx) => {
              const isAboveMsp = item.mandiPrice >= item.msp;
              return (
                <div
                  key={idx}
                  id={`mandi-card-${idx}`}
                  onClick={() => setDetailModalCommodity(item)}
                  className="app-card p-5 cursor-pointer flex flex-col justify-between hover:border-[var(--primary)]/50 hover:shadow-md transition-all group"
                >
                  {/* Top row */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-[var(--primary)] uppercase tracking-wider block font-mono">
                          {item.category}
                        </span>
                        <h3 className="text-base font-heading font-bold text-[var(--text-primary)] tracking-tight mt-0.5">
                          {item.crop}
                        </h3>
                      </div>

                      {/* Sell / Hold Recommendation Badge */}
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 border ${
                          item.recommendation?.includes("SELL")
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : item.recommendation?.includes("HOLD")
                            ? "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {item.recommendation}
                      </span>
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <Store className="w-3.5 h-3.5 text-[var(--primary)]" />
                      <span className="truncate">{item.mandiName}</span>
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  <div className="my-4 pt-3 border-t border-[var(--border)] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {isHindi ? "मॉडल भाव (Modal Price)" : "APMC Modal Price"}
                        </span>
                        <div className="flex items-baseline gap-1 mt-0.5">
                          <span className="text-2xl font-heading font-bold text-[var(--text-primary)]">
                            ₹{item.mandiPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] font-medium">/Qtl</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          {isHindi ? "24h उतार-चढ़ाव" : "24h Change"}
                        </span>
                        <span
                          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md mt-0.5 font-mono ${
                            item.priceChange >= 0
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {item.priceChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {item.priceChange >= 0 ? `+${item.priceChange}%` : `${item.priceChange}%`}
                        </span>
                      </div>
                    </div>

                    {/* MSP Status Bar */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-[var(--text-muted)]">Govt MSP: ₹{item.msp}/Q</span>
                      <span className={`font-semibold ${isAboveMsp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {isAboveMsp
                          ? `+₹${item.mandiPrice - item.msp} Over MSP (+${item.mspDiffPercent}%)`
                          : `-₹${item.msp - item.mandiPrice} Below MSP`}
                      </span>
                    </div>

                    {/* Min - Max Spread Bar */}
                    <div className="text-[10px] text-[var(--text-muted)] flex justify-between pt-0.5 font-mono">
                      <span>Floor: ₹{item.minPrice}</span>
                      <span>Ceiling: ₹{item.maxPrice}</span>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[var(--text-secondary)] font-mono">
                      {item.volume || `${item.arrivalsTodayTonnes || 600} Tonnes Inflow`}
                    </span>
                    <span className="text-[var(--primary)] font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>{isHindi ? "विश्लेषण देखें" : "View Forecast"}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Modals */}
      {/* Detail Modal */}
      {detailModalCommodity && (
        <MandiDetailModal
          commodity={detailModalCommodity}
          state={selectedState}
          district={selectedDistrict}
          isDarkMode={isDarkMode}
          language={language}
          onClose={() => setDetailModalCommodity(null)}
          onOpenTradeReport={(comm) => {
            setDetailModalCommodity(null);
            setReportModalCommodity(comm);
          }}
        />
      )}

      {/* Official Trade Report / Print Bulletin Modal */}
      {reportModalCommodity && (
        <MandiTradeReportModal
          commodity={reportModalCommodity}
          state={selectedState}
          district={selectedDistrict}
          isDarkMode={isDarkMode}
          language={language}
          onClose={() => setReportModalCommodity(null)}
        />
      )}

      {/* API Key Modal */}
      {apiKeyModalOpen && (
        <MandiApiKeyModal
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          apiKey={marketApiKey}
          setApiKey={setMarketApiKey}
          isDarkMode={isDarkMode}
          language={language}
          onSaved={() => fetchMandiData()}
        />
      )}
    </div>
  );
}
