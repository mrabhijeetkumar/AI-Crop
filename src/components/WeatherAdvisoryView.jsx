import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudLightning,
  CloudRain,
  CloudSun,
  Compass,
  Droplets,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Sun,
  Sunrise,
  Sunset,
  Wind,
  X,
  Printer,
  Download,
  Calendar,
  Layers,
  Thermometer,
  Activity,
  ChevronRight,
  Info,
  Gauge,
  Umbrella,
  Flame,
  Play,
  Pause,
  ArrowUpRight,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import { useLocation } from "../context/LocationContext";
import { useFarm } from "../context/FarmContext";

export function WeatherAdvisoryView() {
  const { isDarkMode } = useTheme();
  const {
    locationName: globalLocation,
    coordinates: globalCoords,
    requestCurrentLocation,
    setLocationManually,
  } = useLocation();
  const { farmProfile } = useFarm();

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLocation, setActiveLocation] = useState(
    globalLocation || "Sasaram, Rohtas, Bihar"
  );
  const [userApiKey, setUserApiKey] = useState(
    () => localStorage.getItem("agri_openweather_key") || ""
  );
  const [tempApiKey, setTempApiKey] = useState(userApiKey);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showApiKeyPlain, setShowApiKeyPlain] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState("");
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());

  // Unit preferences (°C vs °F)
  const [tempUnit, setTempUnit] = useState("C"); // 'C' | 'F'
  // Forecast view range (7 days vs 14 days)
  const [forecastRange, setForecastRange] = useState("7"); // '7' | '14'
  // Hourly chart active tab
  const [activeChartMetric, setActiveChartMetric] = useState("thermal"); // 'thermal' | 'rain' | 'wind' | 'eto'
  // Selected forecast day for granular inspection
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  // Language toggle for advisory
  const [advisoryLang, setAdvisoryLang] = useState("en"); // 'en' | 'hi'
  // Printable certificate modal
  const [showPrintModal, setShowPrintModal] = useState(false);
  // Radar simulator state
  const [radarLayer, setRadarLayer] = useState("rain"); // 'rain' | 'clouds' | 'wind' | 'temp'
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarStep, setRadarStep] = useState(3);

  // Sync global location change
  useEffect(() => {
    if (globalLocation && globalLocation !== activeLocation) {
      setActiveLocation(globalLocation);
      fetchWeatherForLocation(globalLocation);
    }
  }, [globalLocation]);

  // Weather fetch handler
  const fetchWeatherForLocation = useCallback((location, apiKeyOverride, coords) => {
    if (!location?.trim()) return;

    setLoading(true);
    setSearchFeedback("");

    const keyToUse = apiKeyOverride !== undefined ? apiKeyOverride : userApiKey;
    let url = `/api/weather?location=${encodeURIComponent(location.trim())}`;
    if (coords?.lat && coords?.lon) {
      url += `&lat=${coords.lat}&lon=${coords.lon}`;
    }
    if (keyToUse) {
      url += `&apiKey=${encodeURIComponent(keyToUse)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data?.locationName) {
          setWeather(data);
          setActiveLocation(data.locationName);
          setLastUpdated(new Date().toLocaleTimeString());
          setSearchFeedback(`Live weather telemetry synced for ${data.locationName}`);
          window.setTimeout(() => setSearchFeedback(""), 4500);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Weather fetch fallback:", err);
        setSearchFeedback(`Using synthesized agro-meteorology for "${location}"`);
        window.setTimeout(() => setSearchFeedback(""), 4000);
        setLoading(false);
      });
  }, [userApiKey]);

  useEffect(() => {
    fetchWeatherForLocation(activeLocation);
  }, []);

  // Radar animation ticker
  useEffect(() => {
    if (!radarPlaying) return;
    const interval = setInterval(() => {
      setRadarStep((prev) => (prev + 1) % 6);
    }, 1800);
    return () => clearInterval(interval);
  }, [radarPlaying]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const loc = searchQuery.trim();
    if (!loc) return;

    fetchWeatherForLocation(loc);
    setLocationManually(loc);
    setSearchQuery("");
  };

  const handleUseCurrentGps = async () => {
    setLoading(true);
    const result = await requestCurrentLocation(true);

    if (result.success && result.locationName) {
      setActiveLocation(result.locationName);
      fetchWeatherForLocation(result.locationName, undefined, result.coordinates);
    } else {
      fetchWeatherForLocation(activeLocation);
    }

    setLoading(false);
  };

  const handleSaveApiKey = () => {
    const cleanKey = tempApiKey.trim();
    localStorage.setItem("agri_openweather_key", cleanKey);
    setUserApiKey(cleanKey);
    setShowKeyModal(false);
    fetchWeatherForLocation(activeLocation, cleanKey);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem("agri_openweather_key");
    setUserApiKey("");
    setTempApiKey("");
    setShowKeyModal(false);
    fetchWeatherForLocation(activeLocation, "");
  };

  const convertTemp = (celsius) => {
    if (tempUnit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const quickCities = [
    "Sasaram, Rohtas",
    "Patna, Bihar",
    "Ludhiana, Punjab",
    "Karnal, Haryana",
    "Nashik, Maharashtra",
    "Indore, MP",
    "Jaipur, Rajasthan",
    "Varanasi, UP",
    "Bathinda, Punjab",
    "Delhi NCR",
  ];

  // Fallback data structure
  const fallbackForecast = useMemo(() => {
    const conditions = [
      { condition: "Partly Cloudy", iconType: "cloud-sun", rainChance: 15, tempMax: 29, tempMin: 18, precipitationMm: 0.0, windSpeed: 11, humidity: 56, sprayCondition: "Good", evapotranspirationMm: 3.8, farmingAdvisory: "Optimal window for foliar nutrient sprays (Urea/Micronutrients) and weed scouting." },
      { condition: "Sunny & Clear", iconType: "sun", rainChance: 10, tempMax: 30, tempMin: 19, precipitationMm: 0.0, windSpeed: 12, humidity: 52, sprayCondition: "Good", evapotranspirationMm: 4.1, farmingAdvisory: "Safe to carry out inter-cultivation, rotary hoeing, and light weeding." },
      { condition: "Sunny", iconType: "sun", rainChance: 5, tempMax: 31, tempMin: 20, precipitationMm: 0.0, windSpeed: 10, humidity: 50, sprayCondition: "Good", evapotranspirationMm: 4.4, farmingAdvisory: "High photosynthetic radiation. Inspect soil moisture before planned top-dressing." },
      { condition: "Cloudy Spells", iconType: "cloud", rainChance: 35, tempMax: 28, tempMin: 19, precipitationMm: 1.5, windSpeed: 14, humidity: 65, sprayCondition: "Moderate", evapotranspirationMm: 3.2, farmingAdvisory: "Passing cloud cover. Complete aerial spraying early in the morning before 09:30 AM." },
      { condition: "Rain Showers", iconType: "rain", rainChance: 75, tempMax: 25, tempMin: 18, precipitationMm: 14.0, windSpeed: 18, humidity: 82, sprayCondition: "Poor", evapotranspirationMm: 2.1, farmingAdvisory: "Precipitation anticipated (14mm). Postpone broadcast fertilizer top-dressing to eliminate runoff." },
      { condition: "Partly Cloudy", iconType: "cloud-sun", rainChance: 25, tempMax: 27, tempMin: 18, precipitationMm: 0.5, windSpeed: 13, humidity: 68, sprayCondition: "Good", evapotranspirationMm: 3.5, farmingAdvisory: "Skies clearing. Inspect field drainage outlets and check for standing water." },
      { condition: "Sunny & Bright", iconType: "sun", rainChance: 10, tempMax: 29, tempMin: 19, precipitationMm: 0.0, windSpeed: 11, humidity: 54, sprayCondition: "Good", evapotranspirationMm: 4.0, farmingAdvisory: "Excellent window for crop protective fungicides and foliar growth stimulants." },
    ];

    const today = new Date();
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return conditions.map((item, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index);

      return {
        day: index === 0 ? "Today" : index === 1 ? "Tomorrow" : dayNames[date.getDay()],
        date: `${date.getDate()} ${monthNames[date.getMonth()]}`,
        ...item,
      };
    });
  }, []);

  const fallbackWeather = {
    locationName: activeLocation,
    coordinates: globalCoords || { lat: 24.95, lon: 84.02 },
    currentTemp: 28,
    feelsLike: 29,
    condition: "Partly Sunny",
    description: "Optimal agricultural microclimate across farm sectors",
    iconType: "cloud-sun",
    humidity: 55,
    windSpeed: 11,
    windDirection: "NW (290°)",
    windGusts: 15,
    pressure: 1012,
    rainChance: 15,
    precipitationMm: 0.0,
    uvIndex: 6,
    solarRadiation: 680,
    evapotranspirationMm: 3.8,
    soilTemp: 22,
    soilMoistureLevel: 54,
    sunrise: "05:35 AM",
    sunset: "06:45 PM",
    isLiveApi: false,
    provider: "Agro Weather Synthesizer",
    hourlyForecast: [
      { time: "06:00", temp: 21, feelsLike: 21, condition: "Clear", rainChance: 5, precipitationMm: 0, windSpeed: 7, humidity: 72, uvIndex: 0, evapotranspiration: 0.1, spray: "Optimal", iconType: "sun" },
      { time: "09:00", temp: 25, feelsLike: 26, condition: "Sunny", rainChance: 5, precipitationMm: 0, windSpeed: 9, humidity: 62, uvIndex: 4, evapotranspiration: 0.4, spray: "Optimal", iconType: "sun" },
      { time: "12:00", temp: 29, feelsLike: 30, condition: "Partly Cloudy", rainChance: 15, precipitationMm: 0, windSpeed: 12, humidity: 50, uvIndex: 7, evapotranspiration: 0.6, spray: "Caution", iconType: "cloud-sun" },
      { time: "15:00", temp: 30, feelsLike: 31, condition: "Partly Cloudy", rainChance: 20, precipitationMm: 0.1, windSpeed: 14, humidity: 48, uvIndex: 5, evapotranspiration: 0.5, spray: "Caution", iconType: "cloud-sun" },
      { time: "18:00", temp: 26, feelsLike: 27, condition: "Clear", rainChance: 10, precipitationMm: 0, windSpeed: 9, humidity: 58, uvIndex: 1, evapotranspiration: 0.2, spray: "Optimal", iconType: "sun" },
      { time: "21:00", temp: 23, feelsLike: 24, condition: "Clear", rainChance: 5, precipitationMm: 0, windSpeed: 6, humidity: 68, uvIndex: 0, evapotranspiration: 0.05, spray: "Optimal", iconType: "sun" },
    ],
    forecast: fallbackForecast,
    advisory: {
      title: "Stable agricultural climate for scheduled farm operations.",
      severity: "info",
      description: "Ideal atmospheric window for soil moisture absorption and tractor spraying.",
      actions: [
        "Foliar Spray: Safe window between 06:30 AM – 10:30 AM (Wind 11 km/h under 15 km/h limit).",
        "Irrigation: Soil moisture is adequate (54%). Tube well pumping can be paused for next 2 days.",
        "Fertilizer: Atmospheric pressure 1012 hPa provides stable condition for urea top-dressing.",
        "Pest Scouting: Inspect border rows for aphid or jassid colonies during morning hours.",
      ],
      sprayCondition: "Optimal",
      irrigationAdvice: "Proceed",
      diseaseRisk: "Low / Standard",
    },
  };

  const w = weather || fallbackWeather;
  const forecastDays = Array.isArray(w.forecast)
    ? forecastRange === "14"
      ? w.forecast.slice(0, 14)
      : w.forecast.slice(0, 7)
    : [];

  const selectedDay = forecastDays[selectedDayIdx] || forecastDays[0] || fallbackForecast[0];

  const getIcon = (type, className = "w-6 h-6") => {
    switch (type) {
      case "rain":
        return <CloudRain className={`${className} text-sky-400`} />;
      case "thunder":
        return <CloudLightning className={`${className} text-amber-400`} />;
      case "cloud":
        return <Cloud className={`${className} text-slate-400`} />;
      case "cloud-sun":
        return <CloudSun className={`${className} text-amber-400`} />;
      case "fog":
        return <Cloud className={`${className} text-slate-400`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

  return (
    <div className="min-h-full space-y-6 pb-16 w-full animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <section className="app-card p-6 lg:p-7">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
                {w.isLiveApi ? "🛰️ Live Agro-Meteorology" : "⚡ Agro-Model Synthesizer"}
              </span>
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-secondary)]">
                📍 {activeLocation}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-medium">
                Synced: {lastUpdated}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-[var(--text-primary)]">
              Weather Intelligence &amp; Spray Advisory
            </h1>

            <p className="mt-1 max-w-2xl text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              Hyper-local microclimate station monitoring soil temperature, FAO-56 evapotranspiration, foliar spray windows, and real-time precipitation risk.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Unit toggle */}
            <div className="inline-flex rounded-[8px] border border-[var(--border)] bg-[var(--surface-strong)] p-0.5">
              <button
                onClick={() => setTempUnit("C")}
                className={`px-2.5 py-1 text-xs font-bold rounded-[6px] transition-colors cursor-pointer ${
                  tempUnit === "C"
                    ? "bg-[var(--primary)] text-slate-950 shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setTempUnit("F")}
                className={`px-2.5 py-1 text-xs font-bold rounded-[6px] transition-colors cursor-pointer ${
                  tempUnit === "F"
                    ? "bg-[var(--primary)] text-slate-950 shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                °F
              </button>
            </div>

            <button
              onClick={handleUseCurrentGps}
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
            >
              <MapPin className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>GPS Sync</span>
            </button>

            <button
              onClick={() => setShowKeyModal(true)}
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-500" />
              <span>API Key</span>
            </button>

            <button
              onClick={() => fetchWeatherForLocation(activeLocation)}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3.5 font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Search & Quick City Pills */}
      <section className="app-card p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search district, city or agricultural pin code..."
              className="form-input pl-10 text-xs py-2"
            />
          </div>
          <button type="submit" className="btn-primary text-xs px-4 py-2 font-semibold cursor-pointer">
            Search
          </button>
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">Quick Switch:</span>
          {quickCities.map((city) => (
            <button
              key={city}
              onClick={() => {
                setActiveLocation(city);
                fetchWeatherForLocation(city);
              }}
              className={`px-2.5 py-1 rounded-[6px] border text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                activeLocation.toLowerCase().includes(city.split(",")[0].toLowerCase())
                  ? "bg-[var(--primary)] text-slate-950 font-bold border-[var(--primary)] shadow-sm"
                  : "bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
              }`}
            >
              {city}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Microclimate Telemetry Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Temperature & Weather Card */}
        <div className="lg:col-span-5 app-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Current Microclimate
              </span>
              <span className="text-xs font-bold text-[var(--primary)]">
                {w.condition}
              </span>
            </div>

            <div className="flex items-center justify-between my-4">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold font-heading text-[var(--text-primary)]">
                  {convertTemp(w.currentTemp)}°
                </span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  Feels like {convertTemp(w.feelsLike)}°{tempUnit}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[var(--surface-strong)] border border-[var(--border)]">
                {getIcon(w.iconType, "w-10 h-10")}
              </div>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {w.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 mt-4 border-t border-[var(--border)] text-xs">
            <div className="p-2 rounded-[8px] bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Humidity</span>
              <span className="font-bold text-[var(--info)] font-heading">{w.humidity}%</span>
            </div>
            <div className="p-2 rounded-[8px] bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Wind</span>
              <span className="font-bold text-[var(--primary)] font-heading">{w.windSpeed} km/h</span>
            </div>
            <div className="p-2 rounded-[8px] bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] text-[var(--text-muted)] block">Precipitation</span>
              <span className="font-bold text-sky-400 font-heading">{w.rainChance}%</span>
            </div>
          </div>
        </div>

        {/* Diagnostic Telemetry Sub-grid */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Solar Radiation</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold font-heading text-[var(--text-primary)]">{w.solarRadiation} W/m²</div>
            <span className="text-[10px] text-[var(--text-muted)] block">UV Index: {w.uvIndex} (Moderate)</span>
          </div>

          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Evapotranspiration</span>
              <Droplets className="w-4 h-4 text-[var(--info)]" />
            </div>
            <div className="text-xl font-bold font-heading text-[var(--info)]">{w.evapotranspirationMm} mm/day</div>
            <span className="text-[10px] text-[var(--text-muted)] block">FAO-56 Penman-Monteith</span>
          </div>

          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Soil Probe Temp</span>
              <Thermometer className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="text-xl font-bold font-heading text-[var(--text-primary)]">{convertTemp(w.soilTemp)}°{tempUnit}</div>
            <span className="text-[10px] text-[var(--text-muted)] block">10cm Root Rhizosphere</span>
          </div>

          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Atm. Pressure</span>
              <Gauge className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold font-heading text-[var(--text-primary)]">{w.pressure} hPa</div>
            <span className="text-[10px] text-[var(--text-muted)] block">Barometric Stability</span>
          </div>

          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Wind Direction</span>
              <Wind className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="text-base font-bold font-heading text-[var(--text-primary)]">{w.windDirection}</div>
            <span className="text-[10px] text-[var(--text-muted)] block">Gusts up to {w.windGusts} km/h</span>
          </div>

          <div className="app-card p-4 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase text-[var(--text-muted)]">Daylight Window</span>
              <Sunrise className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-bold font-heading text-[var(--text-primary)] mt-1">{w.sunrise} – {w.sunset}</div>
            <span className="text-[10px] text-[var(--text-muted)] block">Photoperiod: 13.1 Hrs</span>
          </div>
        </div>
      </div>

      {/* 4. Forecast Strip (7 or 14 Days) */}
      <section className="app-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Multi-Day Agro-Meteorological Forecast
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Click any day to inspect microclimate telemetry &amp; spray advisories
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-[8px] border border-[var(--border)]">
            <button
              onClick={() => setForecastRange("7")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold cursor-pointer ${
                forecastRange === "7"
                  ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setForecastRange("14")}
              className={`px-2.5 py-1 rounded-[6px] text-xs font-semibold cursor-pointer ${
                forecastRange === "14"
                  ? "bg-[var(--primary)] text-slate-950 font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              14 Days
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {forecastDays.map((day, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className={`p-3.5 rounded-[12px] border transition-all cursor-pointer text-center space-y-2 ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--surface-strong)] ring-2 ring-[var(--primary)]/20 shadow-md"
                    : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="text-xs font-semibold block text-[var(--text-primary)]">{day.day}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">{day.date}</span>

                <div className="flex justify-center my-1">
                  {getIcon(day.iconType, "w-7 h-7")}
                </div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-heading font-bold">
                  <span className="text-[var(--text-primary)]">{convertTemp(day.tempMax)}°</span>
                  <span className="text-[var(--text-muted)] font-normal">{convertTemp(day.tempMin)}°</span>
                </div>

                <div className="text-[10px] font-semibold text-sky-400">
                  💧 {day.rainChance}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. 24-Hour Agro-Meteorological Graph */}
      <section className="app-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
              24-Hour Diurnal Weather Progression
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Detailed diurnal curve for spray timing and irrigation scheduling
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-[8px] border border-[var(--border)]">
            <button
              onClick={() => setActiveChartMetric("thermal")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] cursor-pointer ${
                activeChartMetric === "thermal"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveChartMetric("rain")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] cursor-pointer ${
                activeChartMetric === "rain"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Rainfall &amp; Hum
            </button>
            <button
              onClick={() => setActiveChartMetric("wind")}
              className={`px-2.5 py-1 text-xs font-semibold rounded-[6px] cursor-pointer ${
                activeChartMetric === "wind"
                  ? "bg-[var(--primary)] text-white font-bold shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Wind Speed
            </button>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartMetric === "thermal" ? (
              <AreaChart data={w.hourlyForecast}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} unit="°" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0F0F0F" : "#ffffff",
                    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 20px rgba(0,0,0,0.08)",
                    color: isDarkMode ? "#ffffff" : "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#10b981" strokeWidth={2.5} fill="url(#tempGrad)" name="Temp (°C)" />
              </AreaChart>
            ) : activeChartMetric === "rain" ? (
              <BarChart data={w.hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} unit="%" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0F0F0F" : "#ffffff",
                    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 20px rgba(0,0,0,0.08)",
                    color: isDarkMode ? "#ffffff" : "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="rainChance" fill="#0284c7" radius={[6, 6, 0, 0]} name="Rain Probability (%)" />
              </BarChart>
            ) : (
              <LineChart data={w.hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#6b7280" : "#94a3b8"} fontSize={11} unit=" km/h" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0F0F0F" : "#ffffff",
                    borderColor: isDarkMode ? "rgba(255,255,255,0.1)" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: isDarkMode ? "0 8px 24px rgba(0,0,0,0.6)" : "0 8px 20px rgba(0,0,0,0.08)",
                    color: isDarkMode ? "#ffffff" : "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Line type="monotone" dataKey="windSpeed" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} name="Wind (km/h)" />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </section>

      {/* 6. Agronomic Spray Advisory & Actionable Checklist */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-6 app-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                Foliar Spray &amp; Field Operations Advisory
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20">
              {w.advisory?.sprayCondition || "Optimal"}
            </span>
          </div>

          <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
            {w.advisory?.title}
          </p>

          <div className="space-y-2 pt-1">
            {w.advisory?.actions?.map((action, idx) => (
              <div
                key={idx}
                className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] flex items-start gap-2.5 text-xs text-[var(--text-secondary)]"
              >
                <span className="w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 bg-[var(--primary-soft)] text-[var(--primary)] mt-0.5">
                  {idx + 1}
                </span>
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Deep Dive */}
        <div className="lg:col-span-6 app-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <div>
              <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">
                {selectedDay.day} ({selectedDay.date}) Deep Dive
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Agronomic condition breakdown
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getIcon(selectedDay.iconType, "w-6 h-6")}
              <span className="text-sm font-bold font-heading text-[var(--text-primary)]">
                {convertTemp(selectedDay.tempMax)}° / {convertTemp(selectedDay.tempMin)}°
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Spray Safety</span>
              <span className="font-bold text-[var(--success)] font-heading">{selectedDay.sprayCondition}</span>
            </div>
            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Precipitation</span>
              <span className="font-bold text-[var(--info)] font-heading">{selectedDay.precipitationMm} mm</span>
            </div>
            <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Evapotranspiration</span>
              <span className="font-bold text-amber-500 font-heading">{selectedDay.evapotranspirationMm} mm</span>
            </div>
          </div>

          <div className="p-3.5 rounded-[10px] border border-[var(--border)] bg-[var(--surface-strong)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] block mb-1">Field Advisory:</strong>
            {selectedDay.farmingAdvisory}
          </div>
        </div>
      </section>

      {/* OpenWeather API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-md my-auto rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-bold font-heading text-[var(--text-primary)]">OpenWeather API Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="btn-ghost p-1.5 rounded-[8px] cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Connect your OpenWeather API key to fetch real-time live satellite telemetry and multi-day agro-meteorological forecasts.
              </p>

              <div>
                <label className="font-semibold block mb-1 text-[var(--text-secondary)]">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKeyPlain ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter OpenWeatherMap API Key..."
                    className="form-input text-xs py-2 pr-10 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKeyPlain((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showApiKeyPlain ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
              <button
                onClick={handleClearApiKey}
                className="btn-ghost text-xs py-2 px-3 text-red-500 cursor-pointer"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="btn-secondary text-xs py-2 px-3.5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="btn-primary text-xs py-2 px-4 font-semibold cursor-pointer"
                >
                  Save API Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
