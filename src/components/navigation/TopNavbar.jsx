import React, { useState, useEffect, useRef } from "react";
import {
  Sprout,
  ChevronDown,
  Bell,
  Globe,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  Check,
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  CloudSun,
  Store,
  DollarSign,
  Bot,
  FileText,
  ExternalLink,
  Menu,
  X,
  Home,
  ScanEye,
  FlaskConical,
  Sun,
  Moon,
  ChevronRight,
  MapPinned,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useFarm } from "../../context/FarmContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

export function TopNavbar({
  onOpenCropStudio,
  onOpenSettings,
  onOpenSoilModal,
  onOpenReportsModal,
  onOpenUserSwitcher,
}) {
  const { user, logout } = useAuth();
  const farm = useFarm();
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount = 0 } = useNotifications();
  const farmProfile = farm?.farmProfile || {};
  const farmFields = farm?.fields || [];
  const profileName = farmProfile.ownerName || user?.name || "Farmer";
  const profileLocation = farmProfile.location || user?.location || "Farm location not set";
  const farmArea = farmProfile.totalAreaAcres || user?.totalLandArea;

  const activeTab = farm?.activeTab || "dashboard";
  const setActiveTab = farm?.setActiveTab || (() => {});

  const [cropAiOpen, setCropAiOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cropAiRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropAiRef.current && !cropAiRef.current.contains(e.target)) setCropAiOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setCropAiOpen(false);
        setLangOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const navigateToTab = (tabKey, scrollTargetId = null) => {
    setCropAiOpen(false);
    setMobileMenuOpen(false);

    if (scrollTargetId) {
      if (activeTab !== "dashboard") {
        setActiveTab("dashboard");
        setTimeout(() => {
          const el = document.getElementById(scrollTargetId);
          if (el) {
            const topOffset = 80;
            const elementPosition = el.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - topOffset;
            window.scrollTo({ top: offsetPosition, behavior: "smooth" });
          }
        }, 80);
      } else {
        const el = document.getElementById(scrollTargetId);
        if (el) {
          const topOffset = 80;
          const elementPosition = el.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - topOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    } else {
      setActiveTab(tabKey);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isNavActive = (key) => {
    if (key === "dashboard") return activeTab === "dashboard";
    if (key === "crop_analysis") return activeTab === "crop_analysis" || activeTab === "ai_crop_analysis";
    if (key === "crop_disease") return activeTab === "disease_diagnosis" || activeTab === "crop_disease";
    if (key === "soil_health") return activeTab === "soil_health" || activeTab === "soil";
    if (key === "weather") return activeTab === "weather";
    if (key === "market") return activeTab === "market_intelligence" || activeTab === "market";
    if (key === "profit_risk") return activeTab === "profit_risk";
    if (key === "reports") return activeTab === "reports";
    return false;
  };

  return (
    <header className="premium-navbar sticky top-0 z-50 h-[78px] w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="premium-navbar-inner max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">
        {/* ================= LEFT: LOGO & TAGLINE ================= */}
        <div
          onClick={() => navigateToTab("dashboard")}
          className="premium-brand flex items-center gap-3 cursor-pointer select-none group shrink-0"
          title="AI Crop Profit — Smart Farming, Higher Profit"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-emerald-950/60 border border-green-200/80 dark:border-emerald-800 flex items-center justify-center text-[#15803D] dark:text-emerald-400 shadow-xs transition-transform duration-200 group-hover:scale-105">
            <Sprout className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="leading-tight">
            <span className="text-[18px] font-bold font-heading tracking-tight block text-slate-900 dark:text-white">
              AI Crop <span className="text-[#15803D] dark:text-emerald-400">Profit</span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block tracking-normal">
              Smart Farming, Higher Profit.
            </span>
          </div>
        </div>

        {/* ================= CENTER: MAIN NAVIGATION LINKS ================= */}
        <nav className="premium-nav hidden xl:flex items-center gap-2.5 text-[13px] font-medium text-slate-600 dark:text-slate-300" aria-label="Primary navigation">
          {/* 1. Dashboard Active Pill */}
          <button
            onClick={() => navigateToTab("dashboard")}
            className={`premium-nav-link ${isNavActive("dashboard") ? "premium-nav-active" : ""} px-4 py-1.5 rounded-full transition-all cursor-pointer font-semibold ${
              isNavActive("dashboard")
                ? "bg-[#15803D] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Dashboard
          </button>

          {/* 2. AI Crop Analysis Dropdown */}
          <div ref={cropAiRef} className="premium-nav-dropdown relative">
            <div className="inline-flex rounded-full">
              <button
                onClick={() => navigateToTab("crop_analysis")}
                className={`premium-nav-link ${isNavActive("crop_analysis") ? "premium-nav-active" : ""} flex items-center gap-1 pl-3.5 pr-1.5 py-1.5 rounded-l-full transition-all cursor-pointer ${
                  isNavActive("crop_analysis")
                    ? "bg-[#15803D] text-white font-semibold shadow-xs"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <span>AI Crop Analysis</span>
              </button>
              <button
                onClick={() => setCropAiOpen((prev) => !prev)}
                className={`premium-nav-chevron px-2 py-1.5 rounded-r-full transition-all cursor-pointer border-l border-white/20 ${
                  isNavActive("crop_analysis")
                    ? "bg-[#15803D] text-white"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                }`}
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${cropAiOpen ? "rotate-180" : ""}`} />
              </button>
            </div>

            {cropAiOpen && (
              <div className="premium-nav-dropdown-menu absolute left-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  AI Crop Intelligence Tools
                </div>
                <button
                  onClick={() => navigateToTab("crop_analysis")}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-emerald-950/40 hover:text-[#15803D] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#15803D] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">State &amp; Village AI Form</div>
                    <div className="text-[10px] text-slate-400">NPK Lab Sliders &amp; Climate Model</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateToTab("dashboard", "crop-recommendations")}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-green-50 dark:hover:bg-emerald-950/40 hover:text-[#15803D] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-green-50 text-[#15803D] flex items-center justify-center shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Quick Dashboard Recommendations</div>
                    <div className="text-[10px] text-slate-400">Scrolls to overview cards</div>
                  </div>
                </button>

                <button
                  onClick={() => navigateToTab("crop_intelligence")}
                  className="w-full text-left px-3.5 py-2 text-xs text-[#15803D] font-semibold hover:bg-green-50 dark:hover:bg-emerald-950/40 flex items-center justify-between cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-2"
                >
                  <span>Open Crop Rotation &amp; Studio</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* 3. Crop Disease */}
          <button
            onClick={() => navigateToTab("disease_diagnosis")}
            className={`premium-nav-link ${isNavActive("crop_disease") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("crop_disease")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Crop Disease
          </button>

          {/* 4. Soil Health */}
          <button
            onClick={() => navigateToTab("soil_health")}
            className={`premium-nav-link ${isNavActive("soil_health") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("soil_health")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Soil Health
          </button>

          {/* 5. Weather */}
          <button
            onClick={() => navigateToTab("weather")}
            className={`premium-nav-link ${isNavActive("weather") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("weather")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Weather
          </button>

          {/* 6. Market */}
          <button
            onClick={() => navigateToTab("market_intelligence")}
            className={`premium-nav-link ${isNavActive("market") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("market")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Market
          </button>

          {/* 7. Profit & Risk */}
          <button
            onClick={() => navigateToTab("profit_risk")}
            className={`premium-nav-link ${isNavActive("profit_risk") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("profit_risk")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Profit &amp; Risk
          </button>

          {/* 8. Reports */}
          <button
            onClick={() => navigateToTab("reports")}
            className={`premium-nav-link ${isNavActive("reports") ? "premium-nav-active" : ""} px-3 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              isNavActive("reports")
                ? "bg-[#15803D] text-white font-semibold shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            Reports
          </button>
        </nav>

        {/* ================= RIGHT CONTROLS ================= */}
        <div className="premium-navbar-actions flex items-center gap-2.5">
          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="premium-icon-button w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications with Red Count Badge */}
          <div className="relative">
            <button
              onClick={() => navigateToTab("dashboard", "hero")}
              className="premium-icon-button w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              title={`${unreadCount || 2} New Farm Alerts`}
              aria-label={`${unreadCount || 2} unread farm alerts`}
            >
              <Bell className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              {unreadCount || 2}
            </span>
          </div>

          {/* Language Selector: Globe + EN ▾ */}
          <div ref={langRef} className="relative">
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="premium-language-selector flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
              aria-haspopup="menu"
              aria-expanded={langOpen}
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs">
                <button
                  onClick={() => setLangOpen(false)}
                  className="w-full px-3 py-1.5 text-left font-semibold text-[#15803D] bg-green-50"
                >
                  English
                </button>
                <button
                  onClick={() => setLangOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  हिन्दी (Hindi)
                </button>
                <button
                  onClick={() => setLangOpen(false)}
                  className="w-full px-3 py-1.5 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  ਪੰਜਾਬੀ (Punjabi)
                </button>
              </div>
            )}
          </div>

          {/* User Circular Profile Avatar & Menu */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setProfileOpen((prev) => !prev)}
              className="premium-profile-button w-9 h-9 rounded-full overflow-hidden border-2 border-emerald-500 ring-2 ring-emerald-500/20 cursor-pointer transition-transform hover:scale-105"
              aria-label="Open farmer profile menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <img
                src="/images/farmer-hero.jpg"
                alt="Satnam Singh Farmer Profile"
                className="w-full h-full object-cover object-top"
              />
            </button>

            {profileOpen && (
              <div className="premium-profile-menu absolute right-0 mt-3 w-[min(380px,calc(100vw-1.5rem))] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="premium-profile-header px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src="/images/farmer-hero.jpg"
                    alt=""
                    className="premium-profile-header-avatar"
                  />
                  <div className="min-w-0">
                    <div className="premium-profile-name">{profileName}</div>
                    <div className="premium-profile-meta flex items-center gap-1.5"><MapPinned className="w-3.5 h-3.5" /> {profileLocation}</div>
                    <div className="premium-profile-status"><span /> Farmer account</div>
                  </div>
                </div>

                <div className="premium-profile-stats px-4 py-3">
                  {farmArea ? (
                    <div className="premium-profile-stat">
                      <Layers className="text-emerald-600 dark:text-emerald-400" />
                      <div><span>Farm area</span><strong>{farmArea} acres</strong></div>
                    </div>
                  ) : null}
                  {farmFields.length > 0 ? (
                    <div className="premium-profile-stat">
                      <Home className="text-emerald-600 dark:text-emerald-400" />
                      <div><span>Land parcels</span><strong>{farmFields.length} registered</strong></div>
                    </div>
                  ) : null}
                </div>

                <div className="premium-profile-section">
                  <div className="premium-profile-section-label">Farm management</div>
                  <button onClick={() => { setProfileOpen(false); navigateToTab("farm_fields"); }} className="premium-profile-menu-item">
                    <span className="premium-profile-menu-icon"><MapPinned /></span>
                    <span className="premium-profile-menu-copy"><strong>My Farm &amp; Land Parcels</strong></span>
                    <ChevronRight className="premium-profile-menu-arrow" />
                  </button>
                  <button onClick={() => { setProfileOpen(false); navigateToTab("crop_intelligence"); }} className="premium-profile-menu-item">
                    <span className="premium-profile-menu-icon"><Sprout /></span>
                    <span className="premium-profile-menu-copy"><strong>Crop Intelligence Studio</strong></span>
                    <ChevronRight className="premium-profile-menu-arrow" />
                  </button>
                </div>

                <div className="premium-profile-section premium-profile-account-section">
                  <div className="premium-profile-section-label">Account</div>
                  <button onClick={() => { setProfileOpen(false); navigateToTab("settings"); }} className="premium-profile-menu-item">
                    <span className="premium-profile-menu-icon"><SettingsIcon /></span>
                    <span className="premium-profile-menu-copy"><strong>Farm Profile &amp; Settings</strong></span>
                    <ChevronRight className="premium-profile-menu-arrow" />
                  </button>
                  <button onClick={() => { setProfileOpen(false); if (onOpenUserSwitcher) onOpenUserSwitcher(); }} className="premium-profile-menu-item">
                    <span className="premium-profile-menu-icon"><UserIcon /></span>
                    <span className="premium-profile-menu-copy"><strong>Switch Farmer Account</strong></span>
                    <ChevronRight className="premium-profile-menu-arrow" />
                  </button>
                </div>

                <button type="button" onClick={() => { setProfileOpen(false); logout(); }} className="premium-profile-signout">
                  <LogOut /><span>Sign out</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="premium-mobile-toggle xl:hidden w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="premium-mobile-menu xl:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 space-y-1.5 text-xs font-semibold animate-in slide-in-from-top-2">
          {[
            { label: "Dashboard", tab: "dashboard" },
            { label: "AI Crop Analysis (State & Village)", tab: "crop_analysis" },
            { label: "Crop Disease Detection", tab: "disease_diagnosis" },
            { label: "Soil Health Laboratory", tab: "soil_health" },
            { label: "Weather Forecast", tab: "weather" },
            { label: "Today's Mandi Prices", tab: "market_intelligence" },
            { label: "Profit & Risk Analysis", tab: "profit_risk" },
            { label: "My Farm (GIS Parcels)", tab: "farm_fields" },
            { label: "Reports & Certificates", tab: "reports" },
            { label: "Settings & Profile", tab: "settings" },
          ].map((item) => (
            <button
              key={item.tab}
              onClick={() => navigateToTab(item.tab)}
              className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between cursor-pointer ${
                activeTab === item.tab
                  ? "bg-[#15803D] text-white"
                  : "hover:bg-green-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
              }`}
            >
              <span>{item.label}</span>
              {activeTab === item.tab && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

export default TopNavbar;
