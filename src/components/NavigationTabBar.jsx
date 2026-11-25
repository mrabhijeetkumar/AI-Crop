import React from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { getTranslation } from "../data/translations.js";
import {
  LayoutDashboard,
  Sprout,
  ScanEye,
  Layers,
  CloudSun,
  TrendingUp,
  Calculator,
  BotMessageSquare,
  Map,
  FileText,
} from "lucide-react";

export function NavigationTabBar() {
  const { activeTab, setActiveTab, fields, diagnosesHistory, language } = useFarm();
  const t = getTranslation(language);

  const navItems = [
    {
      id: "dashboard",
      label: t.navOverview,
      icon: LayoutDashboard,
    },
    {
      id: "crop_intelligence",
      label: t.navCropIntelligence,
      icon: Sprout,
      badge: "AI 98%",
      badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "disease_diagnosis",
      label: t.navLeafScanner,
      icon: ScanEye,
      badge: `${diagnosesHistory.length || 2} logs`,
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "soil_health",
      label: t.navSoilHealth,
      icon: Layers,
    },
    {
      id: "weather_advisory",
      label: t.navWeather,
      icon: CloudSun,
    },
    {
      id: "market_intelligence",
      label: t.navMandi,
      icon: TrendingUp,
      badge: t.live,
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/30",
    },
    {
      id: "profit_risk",
      label: t.navProfitRisk,
      icon: Calculator,
    },
    {
      id: "ai_advisor",
      label: t.navAdvisor,
      icon: BotMessageSquare,
      badge: "AI",
      badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "farm_fields",
      label: t.navFields,
      icon: Map,
      badge: `${fields.length}`,
      badgeColor: "bg-slate-700 text-slate-300 border-slate-600",
    },
    {
      id: "reports",
      label: t.navReports,
      icon: FileText,
    },
  ];

  return (
    <div className="bg-[var(--surface-header)]/90 backdrop-blur-md border-b border-[var(--border)] sticky top-[68px] z-30 shadow-sm transition-colors">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-14 flex items-center justify-between gap-2 overflow-x-auto py-2 scrollbar-none no-scrollbar">
        <div className="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white shadow-md shadow-emerald-600/20 font-bold scale-[1.02]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--surface-card)] hover:bg-[var(--surface-hover)] border border-[var(--border)] shadow-sm hover:shadow"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-white" : "text-[var(--primary)]"
                  }`}
                />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                      isActive
                        ? "bg-white/20 text-white border-white/30"
                        : "bg-[var(--primary-soft)] text-[var(--primary)] border-[var(--primary)]/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
