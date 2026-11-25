import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function DateRangePicker({ value, onChange }) {
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [customStart, setCustomStart] = useState(() => {
    return value?.startDate ? value.startDate.toISOString().split("T")[0] : "";
  });
  const [customEnd, setCustomEnd] = useState(() => {
    return value?.endDate ? value.endDate.toISOString().split("T")[0] : "";
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const presets = [
    {
      key: "today",
      label: "Today (Aug 31, 2026)",
      subText: "Current Day",
      getRange: () => {
        const today = new Date();
        return {
          startDate: today,
          endDate: today,
          label: `Today, ${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          presetKey: "today",
        };
      },
    },
    {
      key: "last_7_days",
      label: "Last 7 Days",
      subText: "Aug 25 – Aug 31, 2026",
      getRange: () => {
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 6);
        const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return {
          startDate: start,
          endDate: today,
          label: `${startStr} – ${endStr}`,
          presetKey: "last_7_days",
        };
      },
    },
    {
      key: "last_30_days",
      label: "Last 30 Days",
      subText: "Monthly Overview",
      getRange: () => {
        const today = new Date();
        const start = new Date();
        start.setDate(today.getDate() - 29);
        const startStr = start.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        const endStr = today.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
        return {
          startDate: start,
          endDate: today,
          label: `${startStr} – ${endStr}`,
          presetKey: "last_30_days",
        };
      },
    },
    {
      key: "rabi_season",
      label: "Rabi Season 2026",
      subText: "Nov 2025 – Apr 2026",
      getRange: () => {
        return {
          startDate: new Date("2025-11-01"),
          endDate: new Date("2026-04-30"),
          label: "Rabi Season (Nov 25 – Apr 26)",
          presetKey: "rabi_season",
        };
      },
    },
  ];

  const handleSelectPreset = (preset) => {
    const newRange = preset.getRange();
    onChange(newRange);
    setIsOpen(false);
  };

  const handleApplyCustom = (e) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    const s = new Date(customStart);
    const eDate = new Date(customEnd);
    if (isNaN(s.getTime()) || isNaN(eDate.getTime())) return;

    const startStr = s.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const endStr = eDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    onChange({
      startDate: s,
      endDate: eDate,
      label: `${startStr} – ${endStr}`,
      presetKey: "custom",
    });
    setIsOpen(false);
  };

  const displayLabel = value?.label || "Aug 25 – Aug 31, 2026";

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        id="date-window-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="px-3.5 py-1.5 rounded-[10px] flex items-center gap-2.5 text-xs transition-all cursor-pointer bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-primary)] shadow-sm"
      >
        <div className="p-1 rounded-[6px] flex items-center justify-center bg-[var(--primary-soft)] text-[var(--primary)]">
          <Calendar className="w-3.5 h-3.5" />
        </div>
        <div className="text-left">
          <p className="font-semibold leading-tight truncate max-w-[160px] sm:max-w-[200px]">
            {displayLabel}
          </p>
          <p className="text-[10px] leading-none text-[var(--text-muted)] mt-0.5">
            {value?.presetKey === "today"
              ? "1 day window"
              : value?.presetKey === "rabi_season"
                ? "Full season"
                : "Dynamic range"}
          </p>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 ml-0.5 text-[var(--text-muted)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-[14px] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)]">
          <div className="text-[10.5px] font-bold uppercase tracking-wider px-2 pb-1.5 mb-1 border-b border-[var(--border)] text-[var(--primary)]">
            Date Presets
          </div>

          <div className="space-y-1">
            {presets.map((preset) => {
              const isSelected = value?.presetKey === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => handleSelectPreset(preset)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-[8px] text-xs flex items-center justify-between transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-[var(--primary)] text-white dark:text-[#0b1c12] font-bold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div>
                    <div className="font-medium">{preset.label}</div>
                    <div
                      className={`text-[10px] ${
                        isSelected ? "opacity-90" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {preset.subText}
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 stroke-[2.5]" />}
                </button>
              );
            })}
          </div>

          {/* Custom Date Form */}
          <div className="mt-2.5 pt-2.5 border-t border-[var(--border)]">
            <div className="text-[10.5px] font-bold uppercase tracking-wider px-1 pb-1 text-[var(--text-muted)]">
              Custom Range
            </div>
            <form onSubmit={handleApplyCustom} className="space-y-2 mt-1">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">Start</label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">End</label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-[6px] border border-[var(--border)] bg-[var(--bg-1)] text-[var(--text-primary)] outline-none focus:border-[var(--primary)]"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-1.5 mt-1 rounded-[8px] bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white dark:text-[#0b1c12] font-semibold text-xs transition-colors cursor-pointer"
              >
                Apply Range
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
