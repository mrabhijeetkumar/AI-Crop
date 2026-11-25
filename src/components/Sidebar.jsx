import React from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext";
import {
  LayoutGrid,
  Sparkles,
  Home,
  FlaskConical,
  Cloud,
  TrendingUp,
  Percent,
  Sprout,
  MessageSquare,
  FileText,
  Settings,
  ArrowRight,
  ScanEye,
  X
} from "lucide-react";

export function Sidebar({ isOpen, onClose, mobileOpen, setMobileOpen, onCloseMobile }) {
  const { activeTab, setActiveTab } = useFarm();
  const { isDarkMode } = useTheme();

  const isExpanded = isOpen !== undefined ? isOpen : mobileOpen;

  const handleClose = () => {
    if (onClose) onClose();
    if (setMobileOpen) setMobileOpen(false);
    if (onCloseMobile) onCloseMobile();
  };

  // Keyboard shortcut (Escape to close) + Lock body scroll when open
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isExpanded) {
        handleClose();
      }
    };
    if (isExpanded) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isExpanded]);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutGrid,
    },
    {
      id: "ai_crop_analysis",
      label: "AI Crop Analysis",
      icon: Sparkles,
    },
    {
      id: "disease_diagnosis",
      label: "Leaf Disease Scanner",
      icon: ScanEye,
    },
    {
      id: "my_farm",
      label: "My Farm",
      icon: Home,
    },
    {
      id: "soil_health",
      label: "Soil Health",
      icon: FlaskConical,
    },
    {
      id: "weather",
      label: "Weather",
      icon: Cloud,
    },
    {
      id: "market_intelligence",
      label: "Market Intelligence",
      icon: TrendingUp,
    },
    {
      id: "profit_risk",
      label: "Profit & Risk",
      icon: Percent,
    },
    {
      id: "crop_intelligence",
      label: "Crop Intelligence",
      icon: Sprout,
    },
    {
      id: "ai_advisor",
      label: "AI Advisor",
      icon: MessageSquare,
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
    },
  ];

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    handleClose();
  };

  return (
    <>
      {/* Drawer Blurred Backdrop Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm z-50 transition-opacity duration-300 animate-in fade-in"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-[60] w-[280px] sm:w-[310px] max-h-screen bg-[var(--surface-modal)] border-r border-[var(--border)] flex flex-col justify-between p-4 transition-transform duration-300 ease-out overflow-y-auto overscroll-contain select-none shadow-2xl ${
          isExpanded ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-3">
          {/* Top Branding Header */}
          <div className="shrink-0 mb-1">
            <div className="flex items-center justify-between px-1 py-1">
              <div
                className="flex items-center gap-2.5 cursor-pointer select-none group"
                onClick={() => handleTabClick("dashboard")}
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--primary-soft)] border border-[var(--border-strong)] flex items-center justify-center text-[var(--primary)] shrink-0 transition-transform group-hover:scale-105">
                  <Sprout className="w-5 h-5" />
                </div>
                <div className="leading-none">
                  <span className="text-[16px] font-bold font-heading tracking-tight block text-[var(--text-primary)]">
                    AI Crop <span className="text-[var(--primary)]">Profit</span>
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)] font-medium">
                    Precision Agro Platform
                  </span>
                </div>
              </div>

              {/* Cut / Close Button */}
              <button
                id="sidebar-close-btn"
                onClick={handleClose}
                className="w-9 h-9 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-white hover:bg-rose-500/20 hover:border-rose-500/40 flex items-center justify-center transition-all cursor-pointer shadow-sm group shrink-0"
                aria-label="Close Sidebar"
                title="Close Menu (Esc)"
              >
                <X className="w-4.5 h-4.5 transition-transform group-hover:rotate-90 group-hover:text-rose-400" />
              </button>
            </div>
          </div>

          {/* Navigation Menu List */}
          <nav className="space-y-1 flex-1 py-1" aria-label="Main Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isTabActive =
                activeTab === item.id ||
                (item.id === "my_farm" && activeTab === "farm_fields") ||
                (item.id === "weather" && activeTab === "weather_advisory") ||
                (item.id === "crop_intelligence" && activeTab === "crops") ||
                (item.id === "soil_health" && activeTab === "soil");

              return (
                <button
                  key={item.id}
                  id={`sidebar-tab-${item.id}`}
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left cursor-pointer ${
                    isTabActive
                      ? 'bg-[var(--primary-soft)] text-[var(--primary)] font-semibold border-l-[3px] border-[var(--primary)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]'
                  }`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                      isTabActive
                        ? 'text-[var(--primary)] stroke-[2.2]'
                        : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom AI Assistant Card */}
        <div className="pt-3 shrink-0 mt-auto">
          <div className="p-3.5 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] transition-all">
            <div className="flex items-center gap-2 mb-1 font-semibold text-[13px] text-[var(--text-primary)]">
              <div className="w-5 h-5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] flex items-center justify-center text-[11px]">
                🤖
              </div>
              <span>AI Farm Advisor</span>
            </div>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)] mb-3">
              Ask Dr. Krishi about crop health, soil NPK, and real-time mandi prices.
            </p>
            <button
              id="sidebar-ask-assistant-btn"
              onClick={() => handleTabClick("ai_advisor")}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-[10px] bg-[var(--primary)] text-white font-semibold text-[12px] hover:bg-[var(--primary-hover)] transition-all cursor-pointer shadow-md hover:shadow-lg"
            >
              <span>Ask AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}