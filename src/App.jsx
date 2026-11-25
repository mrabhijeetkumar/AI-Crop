// src/App.jsx
import React, { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { FarmProvider, useFarm } from "./context/FarmContext.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

import { TopNavbar } from "./components/navigation/TopNavbar.jsx";
import { HeroSection } from "./components/sections/HeroSection.jsx";
import { FarmOverviewKPISection } from "./components/sections/FarmOverviewKPISection.jsx";
import { FarmPerformanceWeatherSection } from "./components/sections/FarmPerformanceWeatherSection.jsx";
import { CropRecommendationsSection } from "./components/sections/CropRecommendationsSection.jsx";
import { CropHealthDiseaseSection } from "./components/sections/CropHealthDiseaseSection.jsx";
import { MandiAndProfitRow } from "./components/sections/MandiAndProfitRow.jsx";
import { DrKrishiAndNewsRow } from "./components/sections/DrKrishiAndNewsRow.jsx";
import { Footer } from "./components/Footer.jsx";

import { CropAgronomyBlueprintModal } from "./components/crop/CropAgronomyBlueprintModal.jsx";
import { SoilHealthCardModal } from "./components/soil/SoilHealthCardModal.jsx";
import { GenerateReportModal } from "./components/reports/GenerateReportModal.jsx";
import { QuickActionModal } from "./components/QuickActionModal.jsx";
import { UserSwitcherModal } from "./components/settings/UserSwitcherModal.jsx";
import { DrKrishiFloatingChatbot } from "./components/advisor/DrKrishiFloatingChatbot.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { OnboardingView } from "./components/auth/OnboardingView.jsx";
import { AuthPage } from "./components/auth/AuthPage.jsx";

import { buildBlueprintEvaluation, buildFertPlan, computeSoilHealthScore } from "./utils/agronomy.js";
import { ArrowLeft, Home, Plus, FlaskConical, BellPlus, RefreshCw } from "lucide-react";

/* Heavy full-page views are code-split → faster first load */
const lazyView = (loader, name) => lazy(() => loader().then((m) => ({ default: m[name] })));
const CropAnalysisView = lazyView(() => import("./components/CropAnalysisView.jsx"), "CropAnalysisView");
const DiseaseDiagnosisView = lazyView(() => import("./components/DiseaseDiagnosisView.jsx"), "DiseaseDiagnosisView");
const SoilHealthView = lazyView(() => import("./components/SoilHealthView.jsx"), "SoilHealthView");
const WeatherAdvisoryView = lazyView(() => import("./components/WeatherAdvisoryView.jsx"), "WeatherAdvisoryView");
const MarketIntelligenceView = lazyView(() => import("./components/MarketIntelligenceView.jsx"), "MarketIntelligenceView");
const ProfitRiskView = lazyView(() => import("./components/ProfitRiskView.jsx"), "ProfitRiskView");
const CropIntelligenceView = lazyView(() => import("./components/CropIntelligenceView.jsx"), "CropIntelligenceView");
const AIAdvisorView = lazyView(() => import("./components/AIAdvisorView.jsx"), "AIAdvisorView");
const FarmFieldsView = lazyView(() => import("./components/FarmFieldsView.jsx"), "FarmFieldsView");
const ReportsView = lazyView(() => import("./components/ReportsView.jsx"), "ReportsView");
const SettingsView = lazyView(() => import("./components/SettingsView.jsx"), "SettingsView");

const TAB_TITLES = {
  crop_analysis: "AI Crop Analysis",
  ai_crop_analysis: "AI Crop Analysis",
  disease_diagnosis: "Leaf Disease Scanner & Diagnosis",
  crop_disease: "Leaf Disease Scanner & Diagnosis",
  soil_health: "Soil Health Laboratory",
  soil: "Soil Health Laboratory",
  weather: "Weather & Agronomic Forecast",
  market_intelligence: "APMC Mandi Intelligence",
  market: "APMC Mandi Intelligence",
  profit_risk: "Profit & Risk Modeler",
  crop_intelligence: "Crop Rotation & Agronomy Studio",
  crops: "Crop Rotation & Agronomy Studio",
  ai_advisor: "Dr. Krishi AI — Farming Assistant",
  dr_krishi: "Dr. Krishi AI — Farming Assistant",
  farm_fields: "My Farm — Land Parcels & Field Telemetry",
  my_farm: "My Farm — Land Parcels & Field Telemetry",
  farm: "My Farm — Land Parcels & Field Telemetry",
  reports: "Reports & Certificates",
  settings: "Farm Profile & Settings",
};

function ViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse min-h-[75vh] w-full" aria-busy="true" aria-label="Loading view">
      <div className="h-10 w-72 rounded-xl bg-slate-200 dark:bg-slate-800" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

/* Greeting + quick actions (also wires up the QuickActionModal, which nothing opened before) */
function DashboardGreeting() {
  const { user } = useAuth();
  const { farmProfile, openQuickAction, refreshAllSensors, syncStatus, lastSyncTime } = useFarm();
  const first = (farmProfile.ownerName || user?.name || "Kisan").split(" ")[0];

  const actions = [
    { label: "Add Plot", icon: Plus, onClick: () => openQuickAction("field") },
    { label: "Log Soil Test", icon: FlaskConical, onClick: () => openQuickAction("soil") },
    { label: "Set Reminder", icon: BellPlus, onClick: () => openQuickAction("task") },
  ];

  return (
    <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-slate-900 dark:text-white">
          Farm Operations · {farmProfile.farmName || "My Farm"}
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {first ? `Welcome back, ${first} · ` : ""}
          {farmProfile.location || "Location not set"}
          {farmProfile.coordinates ? ` (${farmProfile.coordinates})` : ""} ·{" "}
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        {actions.map(({ label, icon: Icon, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="h-10 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-emerald-400 hover:text-[#15803D] flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Icon className="w-4 h-4" /> <span>{label}</span>
          </button>
        ))}
        <button
          type="button"
          onClick={refreshAllSensors}
          title={`Last synced: ${lastSyncTime}`}
          className="h-10 px-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-[#15803D] dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer hover:bg-emerald-100 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${syncStatus === "saving" ? "animate-spin" : ""}`} />
          <span>{syncStatus === "saving" ? "Syncing…" : "Sync sensors"}</span>
        </button>
      </div>
    </section>
  );
}

function MainAppLayout() {
  const { isAuthenticated } = useAuth();
  const { isDarkMode } = useTheme();
  const farm = useFarm();
  const fields = farm.fields || [];
  const farmProfile = farm.farmProfile || {};
  const activeTab = farm.activeTab || "dashboard";
  const setActiveTab = farm.setActiveTab;

  const [, startTransition] = React.useTransition();

  // Preload all view chunks on browser idle so tab switches render with 0ms latency and no scroll jump
  useEffect(() => {
    const preload = () => {
      import("./components/CropAnalysisView.jsx");
      import("./components/DiseaseDiagnosisView.jsx");
      import("./components/SoilHealthView.jsx");
      import("./components/WeatherAdvisoryView.jsx");
      import("./components/MarketIntelligenceView.jsx");
      import("./components/ProfitRiskView.jsx");
      import("./components/CropIntelligenceView.jsx");
      import("./components/AIAdvisorView.jsx");
      import("./components/FarmFieldsView.jsx");
      import("./components/ReportsView.jsx");
      import("./components/SettingsView.jsx");
    };
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(preload);
      } else {
        setTimeout(preload, 1000);
      }
    }
  }, []);

  const [selectedCropForBlueprint, setSelectedCropForBlueprint] = useState(null);
  const [showSoilCardModal, setShowSoilCardModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showUserSwitcherModal, setShowUserSwitcherModal] = useState(false);

  // average soil of the user's real fields
  const avgSoil = useMemo(() => {
    const tests = fields.map((f) => f.soilTest).filter(Boolean);
    if (!tests.length) return undefined;
    const avg = (k) => tests.reduce((s, t) => s + (Number(t[k]) || 0), 0) / tests.length;
    return { nitrogen: avg("nitrogen"), phosphorus: avg("phosphorus"), potassium: avg("potassium") };
  }, [fields]);

  const blueprintEvaluationData = useMemo(
    () => (selectedCropForBlueprint ? buildBlueprintEvaluation(selectedCropForBlueprint, avgSoil) : null),
    [selectedCropForBlueprint, avgSoil]
  );

  // keep the browser tab title meaningful
  useEffect(() => {
    document.title = TAB_TITLES[activeTab] ? `${TAB_TITLES[activeTab]} · AI Crop Profit` : "AI Crop Profit — Smart Farming Dashboard";
  }, [activeTab]);

  const profileReady = Boolean(
    isAuthenticated && farmProfile?.farmName && farmProfile?.location && Number(farmProfile?.totalAreaAcres) > 0
  );

  if (!isAuthenticated) return <AuthPage onAuthSuccess={() => { }} />;
  if (!profileReady) return <OnboardingView />;

  const goDashboard = () => {
    startTransition(() => {
      setActiveTab("dashboard");
    });
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const soilField = fields.find((f) => f.id === farm.selectedFieldId) || fields[0] || null;
  const soilTest = soilField?.soilTest || {};

  const handleOpenSoilModal = () => {
    if (!soilField) {
      farm.addNotification?.({
        title: "Pehle ek field add karein",
        message: "Soil Health Card banane ke liye kam se kam ek plot aur soil test chahiye.",
        type: "info",
        category: "Soil",
      });
      farm.openQuickAction?.("field");
      return;
    }
    setShowSoilCardModal(true);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case "crop_analysis":
      case "ai_crop_analysis":
        return <CropAnalysisView />;
      case "disease_diagnosis":
      case "crop_disease":
        return <DiseaseDiagnosisView />;
      case "soil_health":
      case "soil":
        return <SoilHealthView />;
      case "weather":
        return <WeatherAdvisoryView />;
      case "market_intelligence":
      case "market":
        return <MarketIntelligenceView />;
      case "profit_risk":
        return <ProfitRiskView />;
      case "crop_intelligence":
      case "crops":
        return <CropIntelligenceView />;
      case "ai_advisor":
      case "dr_krishi":
        return <AIAdvisorView />;
      case "farm_fields":
      case "my_farm":
      case "farm":
        return <FarmFieldsView />;
      case "reports":
        return <ReportsView />;
      case "settings":
        return <SettingsView />;
      case "dashboard":
      default:
        return (
          <>
            <HeroSection onOpenCropStudio={() => setActiveTab("crop_analysis")} />
            <DashboardGreeting />
            <FarmOverviewKPISection onOpenFieldModal={() => setActiveTab("farm_fields")} />
            <FarmPerformanceWeatherSection
              onOpenFinancialDetails={() => setActiveTab("profit_risk")}
              onOpenWeatherDetails={() => setActiveTab("weather")}
            />
            <CropRecommendationsSection
              onOpenCropBlueprint={(crop) => setSelectedCropForBlueprint(crop)}
              onOpenFullAnalysis={() => setActiveTab("crop_analysis")}
            />
            <CropHealthDiseaseSection
              onOpenDiseaseReport={() => setActiveTab("reports")}
              onOpenFullScanner={() => setActiveTab("disease_diagnosis")}
            />
            <MandiAndProfitRow
              onOpenProfitDetails={() => setActiveTab("profit_risk")}
              onOpenMarketDetails={() => setActiveTab("market_intelligence")}
            />
            <DrKrishiAndNewsRow
              onOpenAdvisor={() => setActiveTab("ai_advisor")}
              onOpenSchemes={() => setActiveTab("reports")}
            />
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 transition-colors duration-200 selection:bg-[#15803D] selection:text-white overflow-x-clip">
      <TopNavbar
        onOpenCropStudio={() => setActiveTab("crop_intelligence")}
        onOpenSettings={() => setActiveTab("settings")}
        onOpenSoilModal={handleOpenSoilModal}
        onOpenReportsModal={() => setShowReportsModal(true)}
        onOpenUserSwitcher={() => setShowUserSwitcherModal(true)}
      />

      <main className="dashboard-shell flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-7 sm:py-8 space-y-6 sm:space-y-7 lg:space-y-8 overflow-x-clip z-10 min-h-[calc(100vh-140px)]">
        {/* key={activeTab} → an error in one view no longer "sticks" after you navigate away */}
        <ErrorBoundary key={activeTab}>
          {activeTab !== "dashboard" && (
            <div className="w-full flex items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 min-w-0">
                <button onClick={goDashboard} className="hover:text-[#15803D] dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors shrink-0">
                  <Home className="w-3.5 h-3.5" /> <span>Dashboard</span>
                </button>
                <span>/</span>
                <span className="text-[#15803D] dark:text-emerald-400 font-bold truncate">
                  {TAB_TITLES[activeTab] || activeTab.replace(/_/g, " ")}
                </span>
              </nav>
              <button
                onClick={goDashboard}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98] shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Back to Dashboard</span>
              </button>
            </div>
          )}
          <Suspense fallback={<ViewSkeleton />}>{renderActiveView()}</Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <DrKrishiFloatingChatbot />

      <CropAgronomyBlueprintModal
        isOpen={Boolean(selectedCropForBlueprint)}
        onClose={() => setSelectedCropForBlueprint(null)}
        evaluationData={blueprintEvaluationData}
        isDarkMode={isDarkMode}
      />

      {/* Soil card is now built from the user's REAL field data (not hardcoded numbers) */}
      <SoilHealthCardModal
        isOpen={showSoilCardModal && Boolean(soilField)}
        onClose={() => setShowSoilCardModal(false)}
        field={soilField}
        soilData={soilTest}
        targetCrop={{ name: soilField?.currentCrop }}
        fertPlan={buildFertPlan(soilField?.areaAcres || 1, soilTest)}
        soilHealthScore={computeSoilHealthScore(soilTest)}
        farmProfile={farmProfile}
      />

      <GenerateReportModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        onReportCreated={() => {
          setShowReportsModal(false);
          window.dispatchEvent(new Event("farm_data_updated")); // lets ReportsView refetch
          farm.addNotification?.({ title: "Report ready", message: "Aapki nayi farm audit report generate ho gayi.", type: "success", category: "Task", actionTab: "reports" });
        }}
      />

      <UserSwitcherModal isOpen={showUserSwitcherModal} onClose={() => setShowUserSwitcherModal(false)} />
      <QuickActionModal />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LocationProvider>
          <FarmProvider>
            <NotificationProvider>
              <MainAppLayout />
            </NotificationProvider>
          </FarmProvider>
        </LocationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}