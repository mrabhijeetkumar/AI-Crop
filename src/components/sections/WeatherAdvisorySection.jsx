import React, { useState } from "react";
import {
  CloudSun,
  Sun,
  CloudRain,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Compass,
  Search,
} from "lucide-react";
import { useLocation } from "../../context/LocationContext";
import { SEVEN_DAY_FORECAST, DEFAULT_WEATHER_OVERVIEW } from "../../data/weatherData.js";

export function WeatherAdvisorySection() {
  const { locationName, setLocation } = useLocation();
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedDay, setSelectedDay] = useState(SEVEN_DAY_FORECAST[0]);

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    if (searchLocation.trim()) {
      if (setLocation) setLocation(searchLocation.trim());
      setSearchLocation("");
    }
  };

  return (
    <section id="weather-advisory" className="w-full scroll-mt-24">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800 mb-2">
              <CloudSun className="w-3.5 h-3.5" />
              <span>IMD Agromet Radar & OpenWeather Grounding</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Weather Advisory & 7-Day Micro-Forecast
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Precision agro-meteorology: Spray windows, soil moisture balance, frost warnings and irrigation scheduling.
            </p>
          </div>

          {/* Location Search Bar */}
          <form onSubmit={handleLocationSubmit} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Change city / district..."
                className="h-10 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 w-48 sm:w-56"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-3.5 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Update
            </button>
          </form>
        </div>

        {/* Weather Alerts Notification Banner */}
        <div className="my-5 p-4 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Agro-Meteorological Advisory: </span>
              Dry sunny conditions will persist across Punjab and Haryana for the next 72 hours. Ideal time for wheat crown-root irrigation and herbicide application.
            </div>
          </div>
          <span className="shrink-0 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/60 rounded-md font-semibold text-[11px] text-amber-800 dark:text-amber-300">
            Active Notice
          </span>
        </div>

        {/* 7-Day Forecast Cards Carousel/Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {SEVEN_DAY_FORECAST.map((forecast, idx) => {
            const isSelected = selectedDay.day === forecast.day;

            return (
              <div
                key={forecast.day}
                onClick={() => setSelectedDay(forecast)}
                className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-green-50 dark:bg-emerald-950/60 border-green-300 dark:border-emerald-700 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-750 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <div>
                  <div className={`text-xs font-bold ${isSelected ? "text-[#15803D] dark:text-emerald-400" : "text-slate-700 dark:text-slate-300"}`}>
                    {forecast.day}
                  </div>
                  <div className="text-[10px] text-slate-400">{forecast.date}</div>
                </div>

                <div className="my-2.5 flex items-center justify-center">
                  {forecast.precipitationProb > 30 ? (
                    <CloudRain className="w-6 h-6 text-blue-500" />
                  ) : forecast.precipitationProb > 15 ? (
                    <CloudSun className="w-6 h-6 text-amber-500" />
                  ) : (
                    <Sun className="w-6 h-6 text-amber-500" />
                  )}
                </div>

                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {Math.round(forecast.tempMax)}° <span className="text-[11px] font-normal text-slate-400">/ {Math.round(forecast.tempMin)}°</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-500" />
                    <span>{forecast.precipitationProb}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3 Actionable Agronomic Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Pillar 1: Irrigation Schedule */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>Irrigation Advisory</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Soil moisture is currently at <strong>28%</strong>. No tubewell pumping needed for the next 48 hours. Next scheduled irrigation on Day 4 for wheat field parcels.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Electricity & Water Saved</span>
            </div>
          </div>

          {/* Pillar 2: Sowing & Planting Advisory */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
              <Calendar className="w-4 h-4 text-[#15803D]" />
              <span>Sowing & Field Preparation</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Soil temperature at 10cm depth is <strong>19.2°C</strong>. Highly suitable for timely sowing of Wheat (HD-2967 / PBW-725) and Gram (Chana) with zero-till seed drill.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Optimal Sowing Window</span>
            </div>
          </div>

          {/* Pillar 3: Spraying & Chemical Application */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750">
            <div className="flex items-center gap-2 mb-2 font-bold text-sm text-slate-900 dark:text-white">
              <Wind className="w-4 h-4 text-teal-500" />
              <span>Foliar Spray Suitability</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Wind velocity is gentle (<strong>11 km/h NW</strong>) with high solar radiation. Safe window for weedicide spraying (Clodinafop-propargyl) between 10:00 AM and 3:30 PM.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Low Drift Risk (Favorable)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WeatherAdvisorySection;

