import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
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
  LocateFixed,
  Heart,
  History,
  Map,
  Bell,
  BellOff,
  Navigation,
  Sprout,
  Star,
  Check,
  Radio,
  Share2,
  AlertCircle,
  Clock,
  Zap,
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

/* =========================================================================
   CROP ADVISORY INTELLIGENCE MATRIX (Science-Backed Rules for 8 Indian Crops)
   ========================================================================= */
const CROP_ADVISORY_RULES = {
  Wheat: {
    stages: "Crown Root Initiation (CRI) / Tillering",
    optimalTemp: "18°C – 25°C",
    heatThreshold: 32,
    frostThreshold: 4,
    waterNeed: "Critical at CRI (21-25 DAS) & Flowering",
    kc: 1.15,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (temp > 32)
        return "High Heat Stress Alert: Temperatures above 32°C accelerate tiller mortality and reduce spikelet count. Apply light evening irrigation or potassium nitrate (1%) foliar spray to induce thermo-tolerance.";
      if (temp < 4)
        return "Frost Hazard: Ground temperatures under 4°C can injure young crown roots. Apply light night irrigation to buffer soil temperature above freezing.";
      if (rainChance > 50 || rainMm >= 4)
        return `Rain Imminent (${rainMm}mm expected): Postpone split urea top-dressing to eliminate nitrogen leaching loss. Ensure field drainage channels are clear.`;
      if (wind > 18)
        return `High Wind Velocity (${wind} km/h): Avoid tractor or drone foliar spraying due to spray drift. Postpone flood irrigation to prevent root lodging.`;
      return "Optimal Vegetative Conditions: Crown root elongation and tillering active. Excellent window for weed control (Clodinafop-propargyl) and zinc sulphate micronutrient spray.";
    },
  },
  Rice: {
    stages: "Vegetative Tillering / Panicle Initiation",
    optimalTemp: "24°C – 34°C",
    heatThreshold: 38,
    frostThreshold: 12,
    waterNeed: "Standing water 2–5 cm required",
    kc: 1.2,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (rainChance > 60 || rainMm >= 10)
        return `Heavy Precipitation Anticipated (${rainMm}mm): Open drainage sluice gates to prevent submergence of young tillers. Withhold chemical broadcast.`;
      if (temp > 37)
        return "Heat Inversion: Daytime temperature above 37°C can reduce pollen viability during panicle emergence. Maintain 5cm continuous standing water to cool the canopy.";
      if (wind > 20)
        return "Wind Alert: Hold drone/mist-blower spraying. High winds cause droplet drift and mechanical friction among leaves.";
      return "Prime Tillering Environment: Soil moisture is favorable. Maintain 3-5cm water depth. Scout for stem borer and leaf folder along border rows.";
    },
  },
  Maize: {
    stages: "Knee-High / Tasseling Stage",
    optimalTemp: "21°C – 30°C",
    heatThreshold: 35,
    frostThreshold: 8,
    waterNeed: "Moderate; zero tolerance for standing water",
    kc: 1.15,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (rainChance > 45 || rainMm >= 6)
        return `Waterlogging Warning (${rainMm}mm forecast): Maize roots suffer anoxia within 24h of standing water. Open furrow drains immediately. Hold urea application.`;
      if (wind > 16)
        return `Gusty Winds (${wind} km/h): Tall maize canopy is susceptible to root lodging. Avoid heavy flood irrigation during windy periods.`;
      if (temp > 35)
        return "Tasseling Heat Alert: Temperatures exceeding 35°C dehydrate silks and reduce grain filling. Maintain adequate root-zone moisture.";
      return "Optimal Growth Phase: Rapid biomass accumulation. Safe window for foliar application of Emamectin Benzoate against Fall Armyworm (FAW) if scouting indicates damage.";
    },
  },
  Cotton: {
    stages: "Square Formation / Early Boll Development",
    optimalTemp: "25°C – 35°C",
    heatThreshold: 40,
    frostThreshold: 12,
    waterNeed: "Moderate; avoid moisture fluctuations",
    kc: 1.1,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (rainChance > 40 || rainMm >= 5)
        return `Rain Risk (${rainMm}mm): Extended cloudiness and moisture cause square and young boll shedding. Maintain soil drainage and avoid excess nitrogen.`;
      if (wind < 14 && rainChance < 20)
        return `Optimal Foliar Spray Window: Ideal conditions for sucking pest management (Flonicamid/Neem oil) and 1% Boron foliar spray for boll retention.`;
      return "Stable Microclimate: Monitor delta traps for pink bollworm and whitefly. Maintain clean weeding around border ridges.";
    },
  },
  Mustard: {
    stages: "Flowering / Siliqua (Pod) Formation",
    optimalTemp: "15°C – 24°C",
    heatThreshold: 28,
    frostThreshold: 3,
    waterNeed: "Low to Medium; critical at flowering",
    kc: 1.05,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (temp < 4)
        return "Severe Ground Frost Warning: Mustard flowers abort rapidly under frost (<4°C). Create protective evening smoke mulching and give light sprinkler irrigation.";
      if (temp > 28)
        return "Thermal Acceleration: Temperatures above 28°C shorten the siliqua filling duration and reduce oil content. Apply light irrigation to cool root zone.";
      if (rainChance > 35)
        return "High Relative Humidity: Warm and humid overcast weather favors mustard aphid (Lipaphis erysimi) and Alternaria blight. Scout crop canopy regularly.";
      return "Peak Pollination Window: Honeybees and wild pollinators active between 09:00 AM – 03:00 PM. Never spray systemic insecticides during daylight hours.";
    },
  },
  Sugarcane: {
    stages: "Tillering / Grand Growth Phase",
    optimalTemp: "28°C – 38°C",
    heatThreshold: 42,
    frostThreshold: 6,
    waterNeed: "High; regular irrigation every 8-10 days",
    kc: 1.25,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (wind > 24)
        return `Severe Lodging Hazard (${wind} km/h): Tall cane stalks risk lodging. Perform trash wrapping and earthing up; avoid heavy irrigation right before wind peaks.`;
      if (eto > 4.8)
        return `High Evaporative Demand (${eto} mm/day): Canes require deep soil moisture replenishment. Schedule drip or furrow irrigation cycle.`;
      return "Active Internode Elongation: Solar radiation supports sugar synthesis. Excellent window for fertilizer earthing-up and trash mulching between cane rows.";
    },
  },
  Pulses: {
    stages: "Branching / Flowering / Pod Filling",
    optimalTemp: "18°C – 28°C",
    heatThreshold: 32,
    frostThreshold: 5,
    waterNeed: "Low; excess moisture causes vascular wilt",
    kc: 0.95,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (rainChance > 35 || rainMm >= 4)
        return `Excess Moisture Alert: Pulse crops (Gram/Lentil) cannot tolerate waterlogging. High risk of collar rot and Fusarium wilt. Ensure field furrows drain freely.`;
      if (temp < 5)
        return "Cold Snap Alert: Pod setting impaired by sharp temperature drops. Apply light irrigation to maintain ground thermal inertia.";
      return "Healthy Nodulation Active: Rhizobium bacteria performing peak nitrogen fixation. Safe window for 2% DAP or micronutrient foliar spray.";
    },
  },
  Potato: {
    stages: "Tuber Initiation & Rapid Bulking",
    optimalTemp: "16°C – 22°C (Night < 18°C)",
    heatThreshold: 26,
    frostThreshold: 2,
    waterNeed: "Consistently moist soil (65-75% field capacity)",
    kc: 1.15,
    getAdvisory: (temp, rainChance, wind, eto, rainMm) => {
      if (temp > 25)
        return "Night Temperature Alert: Tuberization slows dramatically if night temperatures exceed 20°C. Keep ridges cool with light sprinkler moisture.";
      if (temp < 3)
        return "Freezing Frost Warning: Foliage dies back under frost. Irrigate field immediately before nightfall to raise thermal buffer.";
      if (rainChance > 45 || rainMm >= 3)
        return "Late Blight (Phytophthora) Hazard: High humidity coupled with rain triggers devastating late blight. Apply prophylactic Mancozeb/Cymoxanil spray.";
      return "Optimal Tuber Bulking: Excellent soil and air conditions. Maintain uniform earthing-up so developing tubers are not exposed to sunlight (greening).";
    },
  },
};

const QUICK_CITIES = [
  "Sasaram, Rohtas, Bihar",
  "Patna, Bihar",
  "Ludhiana, Punjab",
  "Karnal, Haryana",
  "Nashik, Maharashtra",
  "Indore, Madhya Pradesh",
  "Jaipur, Rajasthan",
  "Varanasi, Uttar Pradesh",
  "Bathinda, Punjab",
  "Delhi NCR",
];

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
  const [weatherError, setWeatherError] = useState("");
  const [gpsStatus, setGpsStatus] = useState("idle"); // 'idle' | 'detecting' | 'geocoding' | 'success' | 'error'
  const [gpsErrorMsg, setGpsErrorMsg] = useState("");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [activeLocation, setActiveLocation] = useState(globalLocation || "Sasaram, Rohtas, Bihar");
  const [activeCoords, setActiveCoords] = useState(globalCoords || null);

  // Persistence (recent + favorites + notifications)
  const [recentLocations, setRecentLocations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agri_weather_recent") || "[]");
    } catch {
      return [];
    }
  });
  const [favoriteLocations, setFavoriteLocations] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("agri_weather_favorites") || "[]");
    } catch {
      return [
        { locationName: "Sasaram, Rohtas, Bihar", coordinates: { lat: 24.95, lon: 84.02 } },
        { locationName: "Ludhiana, Punjab", coordinates: { lat: 30.9, lon: 75.85 } },
      ];
    }
  });
  const [alertsEnabled, setAlertsEnabled] = useState(() => {
    return localStorage.getItem("agri_weather_alerts") !== "false";
  });

  // Crop & Unit Controls
  const [selectedCrop, setSelectedCrop] = useState(() => {
    return farmProfile?.primaryCrops?.[0] || "Wheat";
  });
  const [tempUnit, setTempUnit] = useState("C"); // 'C' | 'F'
  const [forecastRange, setForecastRange] = useState("7"); // '7' | '14'
  const [activeChartMetric, setActiveChartMetric] = useState("thermal"); // 'thermal' | 'rain' | 'wind' | 'humidity'
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);

  // Map & Radar Simulator
  const [radarLayer, setRadarLayer] = useState("rain"); // 'rain' | 'temp' | 'wind'
  const [radarPlaying, setRadarPlaying] = useState(true);
  const [radarStep, setRadarStep] = useState(2);

  // Key & Feedback
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem("agri_openweather_key") || "");
  const [tempApiKey, setTempApiKey] = useState(userApiKey);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showApiKeyPlain, setShowApiKeyPlain] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState("");
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());

  const requestSeq = useRef(0);

  // Remember recently searched location
  const rememberLocation = useCallback((location) => {
    if (!location?.locationName) return;
    setRecentLocations((prev) => {
      const next = [
        location,
        ...prev.filter((item) => item.locationName !== location.locationName),
      ].slice(0, 6);
      try {
        localStorage.setItem("agri_weather_recent", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((locObj) => {
    if (!locObj?.locationName) return;
    setFavoriteLocations((prev) => {
      const exists = prev.some((item) => item.locationName === locObj.locationName);
      const next = exists
        ? prev.filter((item) => item.locationName !== locObj.locationName)
        : [locObj, ...prev].slice(0, 8);
      try {
        localStorage.setItem("agri_weather_favorites", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const isFavorite = useMemo(() => {
    return favoriteLocations.some((item) => item.locationName === activeLocation);
  }, [favoriteLocations, activeLocation]);

  // Autocomplete location search
  useEffect(() => {
    const query = searchQuery.trim();
    if (query.length < 2) {
      setSuggestions([]);
      return undefined;
    }
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/weather/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setSuggestions(Array.isArray(data.results) ? data.results : []);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchQuery]);

  // Sync global location change
  useEffect(() => {
    if (globalLocation && globalLocation !== activeLocation) {
      setActiveLocation(globalLocation);
      fetchWeatherForLocation(globalLocation, undefined, globalCoords);
    }
  }, [globalLocation, globalCoords]);

  // Core weather fetch handler
  const fetchWeatherForLocation = useCallback(
    (location, apiKeyOverride, coords) => {
      if (!location?.trim()) return;

      const sequence = ++requestSeq.current;
      setLoading(true);
      setSearchFeedback("");
      setWeatherError("");

      const keyToUse = apiKeyOverride !== undefined ? apiKeyOverride : userApiKey;
      let url = `/api/weather?location=${encodeURIComponent(location.trim())}`;
      if (coords?.lat != null && coords?.lon != null) {
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
          if (sequence !== requestSeq.current) return;
          if (data?.locationName) {
            setWeather(data);
            setActiveLocation(data.locationName);
            setActiveCoords(data.coordinates || coords || null);
            setLocationManually(data.locationName, data.coordinates || coords);
            rememberLocation({ locationName: data.locationName, coordinates: data.coordinates || coords });
            setLastUpdated(new Date().toLocaleTimeString());
            setSearchFeedback(`Live weather telemetry synced for ${data.locationName}`);
            window.setTimeout(() => setSearchFeedback(""), 4500);
          }
          setLoading(false);
        })
        .catch((err) => {
          if (sequence !== requestSeq.current) return;
          console.warn("Weather fetch failed:", err);
          setWeatherError("Live weather data is unavailable right now. Check your connection and retry.");
          setLoading(false);
        });
    },
    [userApiKey, rememberLocation, setLocationManually]
  );

  // Initial load
  useEffect(() => {
    fetchWeatherForLocation(activeLocation);
  }, []);

  // Radar simulator animation ticker
  useEffect(() => {
    if (!radarPlaying) return;
    const interval = setInterval(() => {
      setRadarStep((prev) => (prev + 1) % 6);
    }, 1600);
    return () => clearInterval(interval);
  }, [radarPlaying]);

  // Real browser geolocation detection
  const handleUseCurrentLocation = async () => {
    setGpsStatus("detecting");
    setGpsErrorMsg("");
    setWeatherError("");

    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsErrorMsg("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lon = Number(position.coords.longitude.toFixed(4));
        const detectedCoords = { lat, lon };

        setGpsStatus("geocoding");

        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          let locName = "";
          if (res.ok) {
            const data = await res.json();
            const city = data.locality || data.city || data.localityInfo?.administrative?.[2]?.name || "Local Field";
            const district = data.localityInfo?.administrative?.find((e) => e.description === "district")?.name || "";
            const state = data.principalSubdivision || "";
            locName = [city, district && district !== city ? district : "", state].filter(Boolean).join(", ");
          }

          if (!locName) {
            locName = `Lat ${lat}, Lon ${lon}`;
          }

          setActiveLocation(locName);
          setActiveCoords(detectedCoords);
          setLocationManually(locName, detectedCoords);
          rememberLocation({ locationName: locName, coordinates: detectedCoords });
          setGpsStatus("success");
          fetchWeatherForLocation(locName, undefined, detectedCoords);

          window.setTimeout(() => setGpsStatus("idle"), 4000);
        } catch (err) {
          console.warn("Reverse geocode failed:", err);
          const fallback = `GPS Coordinates (${lat}, ${lon})`;
          setActiveLocation(fallback);
          setActiveCoords(detectedCoords);
          fetchWeatherForLocation(fallback, undefined, detectedCoords);
          setGpsStatus("success");
          window.setTimeout(() => setGpsStatus("idle"), 4000);
        }
      },
      (error) => {
        setGpsStatus("error");
        let msg = "Could not retrieve GPS coordinates.";
        if (error.code === 1) {
          msg = "Location permission denied. Please allow location access in your browser or search your village/district above.";
        } else if (error.code === 2) {
          msg = "GPS location is currently unavailable. Please check device location services.";
        } else if (error.code === 3) {
          msg = "GPS request timed out. Please try again or select from quick switch cities.";
        }
        setGpsErrorMsg(msg);
      },
      { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
    );
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const loc = searchQuery.trim();
    if (!loc) return;

    const selected = suggestions[0];
    if (selected) {
      selectLocation(selected);
    } else {
      setActiveLocation(loc);
      fetchWeatherForLocation(loc);
      setLocationManually(loc);
    }
    setSearchQuery("");
    setSuggestions([]);
  };

  const selectLocation = (location) => {
    const coordinates = { lat: Number(location.latitude), lon: Number(location.longitude) };
    const label = location.locationName || location.name;
    setActiveLocation(label);
    setActiveCoords(coordinates);
    setLocationManually(label, coordinates);
    rememberLocation({ locationName: label, coordinates });
    setSearchQuery("");
    setSuggestions([]);
    fetchWeatherForLocation(label, undefined, coordinates);
  };

  const convertTemp = (celsius) => {
    if (celsius == null) return "--";
    if (tempUnit === "F") {
      return Math.round((celsius * 9) / 5 + 32);
    }
    return Math.round(celsius);
  };

  const toggleAlerts = () => {
    setAlertsEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("agri_weather_alerts", next ? "true" : "false");
      return next;
    });
  };

  // Fallback data structure if offline or server loading
  const fallbackForecast = useMemo(() => {
    const conditions = [
      { condition: "Partly Cloudy", iconType: "cloud-sun", rainChance: 15, tempMax: 29, tempMin: 18, precipitationMm: 0.0, windSpeed: 11, humidity: 56, sprayCondition: "Optimal", evapotranspirationMm: 3.8, farmingAdvisory: "Optimal window for foliar nutrient sprays (Urea/Micronutrients) and weed scouting." },
      { condition: "Sunny & Clear", iconType: "sun", rainChance: 10, tempMax: 30, tempMin: 19, precipitationMm: 0.0, windSpeed: 12, humidity: 52, sprayCondition: "Optimal", evapotranspirationMm: 4.1, farmingAdvisory: "Safe to carry out inter-cultivation, rotary hoeing, and light weeding." },
      { condition: "Sunny", iconType: "sun", rainChance: 5, tempMax: 31, tempMin: 20, precipitationMm: 0.0, windSpeed: 10, humidity: 50, sprayCondition: "Optimal", evapotranspirationMm: 4.4, farmingAdvisory: "High photosynthetic radiation. Inspect soil moisture before planned top-dressing." },
      { condition: "Cloudy Spells", iconType: "cloud", rainChance: 35, tempMax: 28, tempMin: 19, precipitationMm: 1.5, windSpeed: 14, humidity: 65, sprayCondition: "Caution", evapotranspirationMm: 3.2, farmingAdvisory: "Passing cloud cover. Complete foliar spraying early in the morning before 09:30 AM." },
      { condition: "Rain Showers", iconType: "rain", rainChance: 75, tempMax: 25, tempMin: 18, precipitationMm: 14.0, windSpeed: 18, humidity: 82, sprayCondition: "Poor", evapotranspirationMm: 2.1, farmingAdvisory: "Precipitation anticipated (14mm). Postpone broadcast fertilizer top-dressing to eliminate runoff." },
      { condition: "Partly Cloudy", iconType: "cloud-sun", rainChance: 25, tempMax: 27, tempMin: 18, precipitationMm: 0.5, windSpeed: 13, humidity: 68, sprayCondition: "Optimal", evapotranspirationMm: 3.5, farmingAdvisory: "Skies clearing. Inspect field drainage outlets and check for standing water." },
      { condition: "Sunny & Bright", iconType: "sun", rainChance: 10, tempMax: 29, tempMin: 19, precipitationMm: 0.0, windSpeed: 11, humidity: 54, sprayCondition: "Optimal", evapotranspirationMm: 4.0, farmingAdvisory: "Excellent window for crop protective fungicides and foliar growth stimulants." },
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
    cloudCover: 25,
    visibilityKm: 10.0,
    sunrise: "05:35 AM",
    sunset: "06:45 PM",
    isLiveApi: false,
    provider: "Open-Meteo Realtime Global Agro Station",
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
    : fallbackForecast.slice(0, 7);

  const selectedDay = forecastDays[selectedDayIdx] || forecastDays[0] || fallbackForecast[0];

  // Cumulative rain over next 3 days
  const cumulativeRainNext3Days = useMemo(() => {
    return (w.forecast || []).slice(0, 3).reduce((acc, curr) => acc + (Number(curr.precipitationMm) || 0), 0);
  }, [w.forecast]);

  // Dynamic Smart Irrigation Calculation
  const irrigationEvaluation = useMemo(() => {
    const cropRule = CROP_ADVISORY_RULES[selectedCrop] || CROP_ADVISORY_RULES.Wheat;
    const et0 = Number(w.evapotranspirationMm) || 3.8;
    const cropWaterDemandMm = Number((et0 * cropRule.kc).toFixed(1));

    if (cumulativeRainNext3Days >= 12 || w.rainChance >= 65) {
      return {
        status: "POSTPONE IRRIGATION",
        badgeColor: "bg-blue-500/15 text-blue-500 border-blue-500/30",
        urgency: "Rainfall Expected",
        details: `Forecasted precipitation (${cumulativeRainNext3Days.toFixed(1)}mm over next 72 hours) will fully replenish root-zone soil capacity. Pause tubewell and solar pumps to save electricity and prevent root waterlogging.`,
        action: "Pause pump operations for 48–72 hours",
      };
    } else if (et0 >= 4.5 && (w.soilMoistureLevel == null || w.soilMoistureLevel < 45)) {
      return {
        status: "CRITICAL IRRIGATION NEEDED",
        badgeColor: "bg-amber-500/15 text-amber-500 border-amber-500/30",
        urgency: "High Water Stress",
        details: `High reference evapotranspiration (${et0} mm/day) has created a moisture deficit. Daily crop water consumption for ${selectedCrop} is ~${cropWaterDemandMm} mm/day. Apply water in early morning or evening.`,
        action: "Schedule irrigation within next 24 hours",
      };
    }
    return {
      status: "STANDARD IRRIGATION SCHEDULE",
      badgeColor: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
      urgency: "Moisture Stable",
      details: `Soil moisture level is adequate (${w.soilMoistureLevel != null ? `${w.soilMoistureLevel}%` : "Normal"}). Continue baseline drip or canal irrigation as per scheduled rotation without over-watering.`,
      action: "Maintain regular 5-7 day cycle",
    };
  }, [selectedCrop, cumulativeRainNext3Days, w.evapotranspirationMm, w.rainChance, w.soilMoistureLevel]);

  // Smart Spray Windows Engine
  const sprayEvaluation = useMemo(() => {
    const wind = w.windSpeed || 10;
    const temp = w.currentTemp || 28;
    const rain = w.rainChance || 10;
    const hum = w.humidity || 55;

    const unsuitableReasons = [];
    if (wind > 15) {
      unsuitableReasons.push(`Wind speed (${wind} km/h) exceeds safe threshold (15 km/h) — chemical drift will damage non-target canopy.`);
    }
    if (rain > 30) {
      unsuitableReasons.push(`Rain probability (${rain}%) is elevated — chemical wash-off will occur before foliar absorption.`);
    }
    if (temp > 33) {
      unsuitableReasons.push(`Ambient temperature (${temp}°C) causes rapid droplet volatilization and thermal evaporation.`);
    }
    if (hum < 40) {
      unsuitableReasons.push(`Relative humidity (${hum}%) is too low — fine spray droplets evaporate before reaching target weeds/pests.`);
    }

    const isSuitableNow = unsuitableReasons.length === 0;

    return {
      isSuitableNow,
      currentRating: isSuitableNow ? "OPTIMAL WINDOW" : unsuitableReasons.length === 1 ? "MARGINAL / CAUTION" : "UNSUITABLE FOR SPRAYING",
      morningWindow: "06:00 AM – 09:30 AM (Gentle wind <10 km/h, high humidity for uptake)",
      eveningWindow: "04:30 PM – 07:00 PM (Low thermal turbulence, safe canopy absorption)",
      unsuitableReasons,
    };
  }, [w.windSpeed, w.currentTemp, w.rainChance, w.humidity]);

  // Weather Risk Intelligence Cards
  const riskAlerts = useMemo(() => {
    const alerts = [];
    const temp = w.currentTemp || 28;
    const rainSum = cumulativeRainNext3Days;
    const wind = w.windSpeed || 10;
    const hum = w.humidity || 55;

    if (rainSum >= 20 || w.rainChance >= 70) {
      alerts.push({
        type: "heavy_rain",
        severity: "critical",
        title: "Heavy Rainfall & Waterlogging Alert",
        desc: `Heavy precipitation anticipated (${rainSum.toFixed(1)}mm over 72h). Clear drainage outlets in low-lying plots to avoid root asphyxiation in pulses and maize.`,
      });
    }

    if (temp >= 35) {
      alerts.push({
        type: "heat_stress",
        severity: "warning",
        title: "Extreme Heat Stress Warning",
        desc: `Ambient temperatures reaching ${temp}°C. Flowering stage crops (wheat, mustard) risk pollen desiccation. Maintain light sprinkler or drip moisture.`,
      });
    }

    if (temp <= 5) {
      alerts.push({
        type: "frost",
        severity: "critical",
        title: "Cold Wave & Frost Risk Warning",
        desc: `Temperatures dipping down to ${temp}°C. High danger of frost injury to mustard pods, potato vines, and tomato seedlings. Prepare night mulch/irrigation.`,
      });
    }

    if (wind >= 22) {
      alerts.push({
        type: "high_wind",
        severity: "warning",
        title: "High Wind & Crop Lodging Alert",
        desc: `Wind velocity reaching ${wind} km/h with gusts up to ${w.windGusts || wind * 1.3} km/h. Tall crops (sugarcane, sweet corn, mature wheat) are vulnerable to lodging.`,
      });
    }

    if (hum >= 78 && temp >= 20 && temp <= 29) {
      alerts.push({
        type: "pest_disease",
        severity: "warning",
        title: "Fungal Spore & Blight Germination Risk",
        desc: `Persistent high humidity (${hum}%) combined with warm temperature creates an optimal spore incubation environment for Rust, Powdery Mildew, and Late Blight.`,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        type: "favorable",
        severity: "info",
        title: "Favorable Agricultural Atmosphere",
        desc: "All microclimatic parameters are within the standard physiological tolerance range for regional Kharif/Rabi crops.",
      });
    }

    return alerts;
  }, [w.currentTemp, cumulativeRainNext3Days, w.rainChance, w.windSpeed, w.windGusts, w.humidity]);

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
    <div className="min-h-full space-y-6 pb-20 w-full animate-in fade-in duration-200">
      {/* 1. TOP HEADER & GPS DETECTION BANNER */}
      <section className="app-card p-6 lg:p-7 relative overflow-hidden border border-[var(--border)]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary)]/20 shadow-2xs">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--primary)]" />
                {w.isLiveApi ? "🛰️ Real-Time Agro Satellite" : "⚡ Agro Microclimate Telemetry"}
              </span>

              <span className="text-xs font-semibold px-3 py-1 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                <span className="truncate max-w-[280px]">{activeLocation}</span>
                {activeCoords && (
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    ({activeCoords.lat}°, {activeCoords.lon}°)
                  </span>
                )}
              </span>

              <button
                type="button"
                onClick={() => toggleFavorite({ locationName: activeLocation, coordinates: activeCoords })}
                title={isFavorite ? "Remove from favorites" : "Save location as favorite"}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${
                  isFavorite
                    ? "bg-rose-500/15 border-rose-500/40 text-rose-500"
                    : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)] hover:text-rose-500"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500" : ""}`} />
              </button>

              <span className="text-xs text-[var(--text-muted)] font-medium">
                Updated: {lastUpdated}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-[var(--text-primary)]">
              Weather &amp; Agronomic Intelligence Studio
            </h1>

            <p className="mt-1 max-w-3xl text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)]">
              Hyper-local agricultural microclimate station monitoring Penman-Monteith ET0, root-zone soil temperature, foliar spray windows, and multi-day crop precipitation risks.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Unit Toggle */}
            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-strong)] p-0.5 shadow-2xs">
              <button
                onClick={() => setTempUnit("C")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                  tempUnit === "C"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                °C
              </button>
              <button
                onClick={() => setTempUnit("F")}
                className={`px-3 py-1 text-xs font-bold rounded-full transition-colors cursor-pointer ${
                  tempUnit === "F"
                    ? "bg-[var(--primary)] text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                °F
              </button>
            </div>

            {/* Use My Current Location GPS Button */}
            <button
              onClick={handleUseCurrentLocation}
              disabled={gpsStatus === "detecting" || gpsStatus === "geocoding"}
              className="btn-secondary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-3.5 font-semibold active:scale-[0.98] transition-all"
            >
              <LocateFixed className={`w-3.5 h-3.5 text-[var(--primary)] ${gpsStatus === "detecting" ? "animate-spin" : ""}`} />
              <span>
                {gpsStatus === "detecting"
                  ? "Detecting GPS..."
                  : gpsStatus === "geocoding"
                  ? "Resolving City..."
                  : "Use My Location"}
              </span>
            </button>

            {/* Notification Preference Toggle */}
            <button
              onClick={toggleAlerts}
              title={alertsEnabled ? "Weather alerts are active" : "Weather alerts are muted"}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                alertsEnabled
                  ? "bg-[var(--primary-soft)] border-[var(--primary)]/30 text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-muted)]"
              }`}
            >
              {alertsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </button>

            <button
              onClick={() => fetchWeatherForLocation(activeLocation, undefined, activeCoords)}
              className="btn-primary text-xs flex items-center gap-1.5 cursor-pointer py-2 px-4 font-semibold active:scale-[0.98] transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync Weather</span>
            </button>
          </div>
        </div>

        {/* GPS Error or Feedback Banner */}
        {gpsErrorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong>GPS Location Notice:</strong> {gpsErrorMsg}
            </div>
            <button onClick={() => setGpsErrorMsg("")} className="text-amber-500 hover:text-amber-700 cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {searchFeedback && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{searchFeedback}</span>
          </div>
        )}
      </section>

      {/* 2. ADVANCED LOCATION SEARCH & SAVED PILLS */}
      <section className="app-card p-4 sm:p-5 space-y-3.5 border border-[var(--border)]">
        <form onSubmit={handleSearchSubmit} className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by city, village, district, state or Indian PIN code (e.g. 821115, Sasaram, Ludhiana)..."
              className="form-input pl-10 text-xs sm:text-sm py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] w-full"
            />
            {searching && (
              <RefreshCw className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--primary)] animate-spin" />
            )}
          </div>
          <button type="submit" className="btn-primary text-xs sm:text-sm px-5 py-2.5 font-semibold cursor-pointer rounded-xl">
            Search
          </button>

          {/* Autocomplete Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden divide-y divide-[var(--border)]">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectLocation(item)}
                  className="w-full px-4 py-3 text-left hover:bg-[var(--surface-hover)] flex items-center justify-between text-xs transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-[var(--primary)] shrink-0" />
                    <div>
                      <span className="font-bold text-[var(--text-primary)] block text-sm">{item.name}</span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {[item.district, item.state, item.country].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--surface-strong)] text-[var(--text-muted)] border border-[var(--border)] shrink-0">
                    {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </form>

        {/* Saved Favorites & Recent Searches */}
        <div className="flex flex-col gap-2 pt-1 border-t border-[var(--border)] text-xs">
          {favoriteLocations.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Favorites:
              </span>
              {favoriteLocations.map((fav, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveLocation(fav.locationName);
                    setActiveCoords(fav.coordinates || null);
                    fetchWeatherForLocation(fav.locationName, undefined, fav.coordinates);
                  }}
                  className={`px-2.5 py-1 rounded-full border text-[11px] whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                    activeLocation === fav.locationName
                      ? "bg-[var(--primary)] text-white font-bold border-[var(--primary)] shadow-xs"
                      : "bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                  }`}
                >
                  <span>{fav.locationName.split(",")[0]}</span>
                </button>
              ))}
            </div>
          )}

          {recentLocations.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-[var(--text-muted)] shrink-0 flex items-center gap-1">
                <History className="w-3.5 h-3.5 text-[var(--primary)]" /> Recent:
              </span>
              {recentLocations.map((rec, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setActiveLocation(rec.locationName);
                    setActiveCoords(rec.coordinates || null);
                    fetchWeatherForLocation(rec.locationName, undefined, rec.coordinates);
                  }}
                  className="px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--primary)] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {rec.locationName.split(",")[0]}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setRecentLocations([]);
                  localStorage.removeItem("agri_weather_recent");
                }}
                className="text-[10px] text-[var(--text-muted)] hover:text-red-500 cursor-pointer ml-1 underline"
              >
                Clear
              </button>
            </div>
          )}

          {/* Quick-Switch Hub */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            <span className="text-[11px] text-[var(--text-muted)] font-medium shrink-0">Agri Hubs:</span>
            {QUICK_CITIES.map((city) => (
              <button
                key={city}
                onClick={() => {
                  setActiveLocation(city);
                  fetchWeatherForLocation(city);
                }}
                className={`px-2.5 py-0.5 rounded-full border text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                  activeLocation.toLowerCase().includes(city.split(",")[0].toLowerCase())
                    ? "bg-[var(--primary)] text-white font-bold border-[var(--primary)] shadow-xs"
                    : "bg-[var(--surface-strong)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--primary)]"
                }`}
              >
                {city.split(",")[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. REAL-TIME MICROCLIMATE HERO & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main Temperature & Microclimate Card */}
        <div className="lg:col-span-5 app-card p-6 flex flex-col justify-between border border-[var(--border)] relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[var(--primary)] animate-pulse" />
                Live Farm Microclimate
              </span>
              <span className="text-xs font-extrabold text-[var(--primary)] px-2.5 py-0.5 rounded-full bg-[var(--primary-soft)] border border-[var(--primary)]/20">
                {w.condition}
              </span>
            </div>

            <div className="flex items-center justify-between my-5">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-extrabold font-heading text-[var(--text-primary)] tracking-tight">
                  {convertTemp(w.currentTemp)}°
                </span>
                <div className="space-y-0.5">
                  <span className="text-sm font-bold text-[var(--text-primary)] block">
                    {tempUnit === "C" ? "Celsius" : "Fahrenheit"}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text-muted)] block">
                    Feels like {convertTemp(w.feelsLike)}°{tempUnit}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-3xl bg-[var(--surface-strong)] border border-[var(--border)] shadow-sm">
                {getIcon(w.iconType, "w-12 h-12")}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {w.description}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 pt-4 mt-4 border-t border-[var(--border)] text-xs">
            <div className="p-2.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Relative Humidity</span>
              <span className="font-extrabold text-[var(--info)] text-sm font-heading">{w.humidity}%</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Wind Speed</span>
              <span className="font-extrabold text-[var(--primary)] text-sm font-heading">{w.windSpeed} km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-center">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Precipitation Today</span>
              <span className="font-extrabold text-sky-400 text-sm font-heading">{w.precipitationMm} mm</span>
            </div>
          </div>
        </div>

        {/* 6 Advanced Agricultural Metrics */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5">
          {/* Solar Radiation */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Solar Radiation</span>
              <Sun className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-extrabold font-heading text-[var(--text-primary)]">
              {w.solarRadiation != null ? `${w.solarRadiation} W/m²` : "Data unavailable"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              UV Index: {w.uvIndex != null ? `${w.uvIndex} (${w.uvIndex > 7 ? 'Very High' : w.uvIndex > 5 ? 'Moderate' : 'Low'})` : "N/A"}
            </span>
          </div>

          {/* Reference Evapotranspiration */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Evapotranspiration</span>
              <Droplets className="w-4 h-4 text-[var(--info)]" />
            </div>
            <div className="text-xl font-extrabold font-heading text-[var(--info)]">
              {w.evapotranspirationMm != null ? `${w.evapotranspirationMm} mm/day` : "Data unavailable"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              FAO-56 Penman-Monteith ET0
            </span>
          </div>

          {/* Soil Probe Temperature */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Soil Temp (0-7cm)</span>
              <Thermometer className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="text-xl font-extrabold font-heading text-[var(--text-primary)]">
              {w.soilTemp != null ? `${convertTemp(w.soilTemp)}°${tempUnit}` : "Data unavailable"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              Moisture: {w.soilMoistureLevel != null ? `${w.soilMoistureLevel}% Saturation` : "Root zone normal"}
            </span>
          </div>

          {/* Atmospheric Pressure */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Atm. Pressure</span>
              <Gauge className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-extrabold font-heading text-[var(--text-primary)]">
              {w.pressure != null ? `${w.pressure} hPa` : "Data unavailable"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              Barometric {w.pressure > 1010 ? "Stable High" : "Low Pressure Trough"}
            </span>
          </div>

          {/* Wind Direction & Gusts */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Wind &amp; Gusts</span>
              <Compass className="w-4 h-4 text-[var(--primary)]" />
            </div>
            <div className="text-base font-extrabold font-heading text-[var(--text-primary)] truncate">
              {w.windDirection || "N/A"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              Peak gusts: {w.windGusts || Math.round((w.windSpeed || 10) * 1.3)} km/h
            </span>
          </div>

          {/* Photoperiod / Daylight Window */}
          <div className="app-card p-4 space-y-1.5 border border-[var(--border)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">Daylight Window</span>
              <Sunrise className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xs font-extrabold font-heading text-[var(--text-primary)] mt-1">
              {w.sunrise || "05:40 AM"} – {w.sunset || "06:40 PM"}
            </div>
            <span className="text-[10px] text-[var(--text-muted)] block font-medium">
              Cloud cover: {w.cloudCover != null ? `${w.cloudCover}%` : "Clear sky"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. AI AGRONOMIC ADVISORY SUITE (Key Differentiating Feature) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Core Agro-Intelligence Engine
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-[var(--text-primary)]">
              AI Agricultural Advisory &amp; Risk Intelligence
            </h2>
          </div>

          {/* Crop Selector for Specific Advisory */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[var(--text-muted)] flex items-center gap-1">
              <Sprout className="w-3.5 h-3.5 text-[var(--primary)]" /> Target Crop:
            </span>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-xs font-bold py-1.5 px-3 rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] cursor-pointer"
            >
              {Object.keys(CROP_ADVISORY_RULES).map((crop) => (
                <option key={crop} value={crop}>
                  {crop}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 3 Core Advisory Pillars: Smart Irrigation + Smart Spray + Crop Specific */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* A. Smart Irrigation Advisory */}
          <div className="app-card p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-sky-500" />
                  <h3 className="text-sm font-bold font-heading text-[var(--text-primary)]">Smart Irrigation Advisory</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${irrigationEvaluation.badgeColor}`}>
                  {irrigationEvaluation.urgency}
                </span>
              </div>

              <div className="mt-3">
                <span className="text-xs font-extrabold block text-[var(--text-primary)] mb-1">
                  {irrigationEvaluation.status}
                </span>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {irrigationEvaluation.details}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-xs text-[var(--text-secondary)]">
              <strong className="text-[var(--text-primary)] block text-[11px] mb-0.5">Recommended Action:</strong>
              {irrigationEvaluation.action}
            </div>
          </div>

          {/* B. Smart Spray Advisory */}
          <div className="app-card p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="text-sm font-bold font-heading text-[var(--text-primary)]">Foliar Spray Advisory</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  sprayEvaluation.isSuitableNow
                    ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-500 border-amber-500/30"
                }`}>
                  {sprayEvaluation.currentRating}
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <strong className="text-[var(--text-primary)] block text-[11px]">Recommended Spray Windows:</strong>
                  <span className="text-[var(--text-secondary)] block mt-0.5">☀️ {sprayEvaluation.morningWindow}</span>
                  <span className="text-[var(--text-secondary)] block">🌅 {sprayEvaluation.eveningWindow}</span>
                </div>

                {sprayEvaluation.unsuitableReasons.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400">
                    <strong>Current Spray Caution:</strong> {sprayEvaluation.unsuitableReasons[0]}
                  </div>
                )}
              </div>
            </div>

            <div className="text-[11px] text-[var(--text-muted)] border-t border-[var(--border)] pt-2.5">
              Wind: {w.windSpeed} km/h (Limit: 15 km/h) • Rain Chance: {w.rainChance}%
            </div>
          </div>

          {/* C. Crop-Specific Weather Advisory */}
          <div className="app-card p-6 border border-[var(--border)] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <Sprout className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-sm font-bold font-heading text-[var(--text-primary)]">{selectedCrop} Specific Advisory</h3>
                </div>
                <span className="text-[10px] font-bold text-[var(--text-muted)]">
                  Stage: {CROP_ADVISORY_RULES[selectedCrop]?.stages.split("/")[0]}
                </span>
              </div>

              <div className="mt-3 text-xs leading-relaxed text-[var(--text-secondary)]">
                {CROP_ADVISORY_RULES[selectedCrop]?.getAdvisory(
                  w.currentTemp || 28,
                  w.rainChance || 10,
                  w.windSpeed || 10,
                  w.evapotranspirationMm || 3.8,
                  w.precipitationMm || 0
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--surface-strong)] border border-[var(--border)] text-[11px] text-[var(--text-muted)] space-y-0.5">
              <div><strong>Optimal Temp:</strong> {CROP_ADVISORY_RULES[selectedCrop]?.optimalTemp}</div>
              <div><strong>Water Criticality:</strong> {CROP_ADVISORY_RULES[selectedCrop]?.waterNeed}</div>
            </div>
          </div>
        </div>

        {/* Weather Risk Intelligence Row */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            Field Vulnerability &amp; Risk Intelligence
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {riskAlerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.severity === "critical"
                    ? "bg-rose-500/10 border-rose-500/25 text-rose-500"
                    : alert.severity === "warning"
                    ? "bg-amber-500/10 border-amber-500/25 text-amber-500"
                    : "bg-emerald-500/10 border-emerald-500/25 text-emerald-500"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {alert.severity === "critical" ? (
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                  ) : alert.severity === "warning" ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  )}
                  <strong className="text-xs font-heading font-bold text-[var(--text-primary)]">
                    {alert.title}
                  </strong>
                </div>
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                  {alert.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. 24-HOUR HOURLY FORECAST & DIURNAL CHARTS */}
      <section className="app-card p-6 space-y-4 border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold font-heading text-[var(--text-primary)]">
              24-Hour Diurnal Weather Progression
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Hourly microclimate curves for spray scheduling and night transpiration monitoring
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--border)]">
            <button
              onClick={() => setActiveChartMetric("thermal")}
              className={`px-3 py-1 text-xs font-bold rounded-full cursor-pointer transition-colors ${
                activeChartMetric === "thermal"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Temperature
            </button>
            <button
              onClick={() => setActiveChartMetric("rain")}
              className={`px-3 py-1 text-xs font-bold rounded-full cursor-pointer transition-colors ${
                activeChartMetric === "rain"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Rain Probability
            </button>
            <button
              onClick={() => setActiveChartMetric("wind")}
              className={`px-3 py-1 text-xs font-bold rounded-full cursor-pointer transition-colors ${
                activeChartMetric === "wind"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              Wind Speed
            </button>
          </div>
        </div>

        <div className="h-60 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {activeChartMetric === "thermal" ? (
              <AreaChart data={w.hourlyForecast}>
                <defs>
                  <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#15803d" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} unit="°" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                    borderColor: isDarkMode ? "#1e293b" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
                    color: isDarkMode ? "#ffffff" : "#0f172a",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                />
                <Area type="monotone" dataKey="temp" stroke="#15803d" strokeWidth={2.5} fill="url(#tempGrad)" name="Temp (°C)" />
              </AreaChart>
            ) : activeChartMetric === "rain" ? (
              <BarChart data={w.hourlyForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "#e2e8f0"} />
                <XAxis dataKey="time" stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} unit="%" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                    borderColor: isDarkMode ? "#1e293b" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
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
                <XAxis dataKey="time" stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} fontWeight={500} />
                <YAxis stroke={isDarkMode ? "#64748b" : "#94a3b8"} fontSize={11} unit=" km/h" fontWeight={500} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#0f172a" : "#ffffff",
                    borderColor: isDarkMode ? "#1e293b" : "#e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
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

        {/* 24h Hourly Scrollable Cards Strip */}
        <div className="flex gap-2.5 overflow-x-auto pb-2 pt-2 scrollbar-none">
          {w.hourlyForecast?.slice(0, 12).map((hour, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] min-w-[85px] text-center space-y-1 shrink-0"
            >
              <span className="text-[11px] font-bold text-[var(--text-muted)] block">{hour.time}</span>
              <div className="flex justify-center my-1">{getIcon(hour.iconType, "w-6 h-6")}</div>
              <span className="text-sm font-extrabold font-heading text-[var(--text-primary)] block">
                {convertTemp(hour.temp)}°
              </span>
              <span className="text-[10px] text-sky-400 font-bold block">💧 {hour.rainChance}%</span>
              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full inline-block mt-1 ${
                hour.spray === "Optimal"
                  ? "bg-emerald-500/15 text-emerald-500"
                  : hour.spray === "Caution"
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-rose-500/15 text-rose-500"
              }`}>
                {hour.spray}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. MULTI-DAY FORECAST (7 vs 14 Days) */}
      <section className="app-card p-6 space-y-4 border border-[var(--border)]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold font-heading text-[var(--text-primary)]">
              Multi-Day Agro-Meteorological Forecast
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Click any day to inspect detailed agricultural conditions and soil moisture balances
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--border)]">
            <button
              onClick={() => setForecastRange("7")}
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                forecastRange === "7"
                  ? "bg-[var(--primary)] text-white shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setForecastRange("14")}
              className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                forecastRange === "14"
                  ? "bg-[var(--primary)] text-white shadow-xs"
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
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-center space-y-2 ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--surface-strong)] ring-2 ring-[var(--primary)]/20 shadow-md scale-[1.02]"
                    : "border-[var(--border)] bg-[var(--surface-strong)] hover:border-[var(--primary)]/60"
                }`}
              >
                <span className="text-xs font-bold block text-[var(--text-primary)]">{day.day}</span>
                <span className="text-[10px] text-[var(--text-muted)] block">{day.date}</span>

                <div className="flex justify-center my-1.5">{getIcon(day.iconType, "w-7 h-7")}</div>

                <div className="flex items-center justify-center gap-1.5 text-xs font-heading font-extrabold">
                  <span className="text-[var(--text-primary)]">{convertTemp(day.tempMax)}°</span>
                  <span className="text-[var(--text-muted)] font-normal">{convertTemp(day.tempMin)}°</span>
                </div>

                <div className="text-[10px] font-bold text-sky-400">
                  💧 {day.rainChance}% ({day.precipitationMm}mm)
                </div>

                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full inline-block ${
                  day.sprayCondition === "Good" || day.sprayCondition === "Optimal"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : day.sprayCondition === "Moderate" || day.sprayCondition === "Caution"
                    ? "bg-amber-500/15 text-amber-500"
                    : "bg-rose-500/15 text-rose-500"
                }`}>
                  Spray: {day.sprayCondition}
                </span>
              </div>
            );
          })}
        </div>

        {/* Selected Day Deep Dive Drawer */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--surface-strong)] border border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
            <div>
              <h4 className="text-sm font-extrabold font-heading text-[var(--text-primary)]">
                {selectedDay.day} ({selectedDay.date}) Agro-Meteorological Breakdown
              </h4>
              <span className="text-xs text-[var(--text-muted)]">
                Expected Condition: {selectedDay.condition}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm font-extrabold font-heading text-[var(--text-primary)]">
                Max {convertTemp(selectedDay.tempMax)}° / Min {convertTemp(selectedDay.tempMin)}°{tempUnit}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Spray Safety</span>
              <span className="font-extrabold text-[var(--primary)] text-sm">{selectedDay.sprayCondition}</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Precipitation Expected</span>
              <span className="font-extrabold text-sky-400 text-sm">{selectedDay.precipitationMm} mm</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Evapotranspiration</span>
              <span className="font-extrabold text-[var(--info)] text-sm">{selectedDay.evapotranspirationMm} mm</span>
            </div>
            <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <span className="text-[10px] font-semibold text-[var(--text-muted)] block">Max Wind Speed</span>
              <span className="font-extrabold text-amber-500 text-sm">{selectedDay.windSpeed} km/h</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <strong className="text-[var(--text-primary)] block text-[11px] mb-0.5">Field Agronomy Guidance:</strong>
            {selectedDay.farmingAdvisory}
          </div>
        </div>
      </section>

      {/* 7. INTERACTIVE WEATHER MAP & RADAR SIMULATOR */}
      <section className="app-card p-6 space-y-4 border border-[var(--border)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-0.5">
              <Map className="w-3.5 h-3.5" />
              Regional Satellite &amp; Radar
            </div>
            <h3 className="text-base font-extrabold font-heading text-[var(--text-primary)]">
              Interactive Radar &amp; Weather Layers
            </h3>
          </div>

          {/* Layer toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-[var(--surface-strong)] p-1 rounded-full border border-[var(--border)]">
              <button
                onClick={() => setRadarLayer("rain")}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  radarLayer === "rain"
                    ? "bg-sky-500 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Rain Radar
              </button>
              <button
                onClick={() => setRadarLayer("temp")}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  radarLayer === "temp"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Thermal Heatmap
              </button>
              <button
                onClick={() => setRadarLayer("wind")}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  radarLayer === "wind"
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                Wind Streamlines
              </button>
            </div>

            <button
              onClick={() => setRadarPlaying((p) => !p)}
              className="p-2 rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--text-primary)] hover:text-[var(--primary)] cursor-pointer"
            >
              {radarPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative h-72 sm:h-80 rounded-2xl overflow-hidden border border-[var(--border)] bg-slate-900 flex items-center justify-center">
          {/* Background Map Grid Simulation */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 50%, rgba(21, 128, 61, 0.4) 0%, transparent 70%), linear-gradient(#1e293b 1px, transparent 1px), linear-gradient(90deg, #1e293b 1px, transparent 1px)",
              backgroundSize: "100% 100%, 32px 32px, 32px 32px",
            }}
          />

          {/* Animated Weather Radar Rings */}
          <div
            className="absolute w-64 h-64 rounded-full border border-sky-400/20 animate-ping pointer-events-none"
            style={{ animationDuration: "3s" }}
          />

          {/* Center Location Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)]/20 border-2 border-[var(--primary)] flex items-center justify-center animate-pulse">
                <MapPin className="w-5 h-5 text-[var(--primary)]" />
              </div>
            </div>
            <div className="mt-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700 text-white text-xs font-bold shadow-lg flex items-center gap-1.5">
              <span>{activeLocation}</span>
              <span className="text-[10px] text-emerald-400 font-mono">
                {convertTemp(w.currentTemp)}°
              </span>
            </div>
          </div>

          {/* Radar Step Indicator */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-slate-950/75 backdrop-blur-md border border-slate-800 text-[10px] text-slate-300 font-mono">
            Layer: {radarLayer.toUpperCase()} • Step {radarStep + 1}/6 • Live Doppler Simulation
          </div>
        </div>
      </section>

      {/* 8. OPENWEATHER API KEY MODAL */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto overscroll-contain">
          <div className="w-full max-w-md my-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150 text-[var(--text-primary)]">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-extrabold font-heading text-[var(--text-primary)]">OpenWeather API Key</h3>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="btn-ghost p-1.5 rounded-full cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <p className="text-[var(--text-secondary)] leading-relaxed">
                Connect your OpenWeather API key to enable direct live radar layers and satellite agro-meteorology.
              </p>

              <div>
                <label className="font-semibold block mb-1 text-[var(--text-secondary)]">API Key</label>
                <div className="relative">
                  <input
                    type={showApiKeyPlain ? "text" : "password"}
                    value={tempApiKey}
                    onChange={(e) => setTempApiKey(e.target.value)}
                    placeholder="Enter OpenWeatherMap API Key..."
                    className="form-input text-xs py-2.5 pr-10 font-mono rounded-xl border border-[var(--border)] bg-[var(--surface-strong)] w-full"
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
                onClick={() => {
                  localStorage.removeItem("agri_openweather_key");
                  setUserApiKey("");
                  setTempApiKey("");
                  setShowKeyModal(false);
                  fetchWeatherForLocation(activeLocation, "");
                }}
                className="btn-ghost text-xs py-2 px-3 text-red-500 cursor-pointer"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKeyModal(false)}
                  className="btn-secondary text-xs py-2 px-3.5 cursor-pointer rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const cleanKey = tempApiKey.trim();
                    localStorage.setItem("agri_openweather_key", cleanKey);
                    setUserApiKey(cleanKey);
                    setShowKeyModal(false);
                    fetchWeatherForLocation(activeLocation, cleanKey);
                  }}
                  className="btn-primary text-xs py-2 px-4 font-semibold cursor-pointer rounded-xl"
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
