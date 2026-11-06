import React, { useEffect, useState } from "react";
import { FarmProvider, useFarm } from "./context/FarmContext.jsx";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { LocationProvider } from "./context/LocationContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

// Navigation & One-Page Dashboard Sections (Light Theme Default, Modern SaaS)
import { TopNavbar } from "./components/navigation/TopNavbar.jsx";
import { HeroSection } from "./components/sections/HeroSection.jsx";
import { FarmOverviewKPISection } from "./components/sections/FarmOverviewKPISection.jsx";
import { FarmPerformanceWeatherSection } from "./components/sections/FarmPerformanceWeatherSection.jsx";
import { CropRecommendationsSection } from "./components/sections/CropRecommendationsSection.jsx";
import { CropHealthDiseaseSection } from "./components/sections/CropHealthDiseaseSection.jsx";
import { SoilHealthSection } from "./components/sections/SoilHealthSection.jsx";
import { MandiAndProfitRow } from "./components/sections/MandiAndProfitRow.jsx";
import { FarmOperationsTelemetrySection } from "./components/sections/FarmOperationsTelemetrySection.jsx";
import { DrKrishiAndNewsRow } from "./components/sections/DrKrishiAndNewsRow.jsx";
import { NewsSchemesSection } from "./components/sections/NewsSchemesSection.jsx";
import { ReportsSection } from "./components/sections/ReportsSection.jsx";
import { Footer } from "./components/Footer.jsx";

// Full Comprehensive Working Feature Views (State, District, Village, Soil Lab, Scanner, GIS, etc.)
import { CropAnalysisView } from "./components/CropAnalysisView.jsx";
import { DiseaseDiagnosisView } from "./components/DiseaseDiagnosisView.jsx";
import { SoilHealthView } from "./components/SoilHealthView.jsx";
import { WeatherAdvisoryView } from "./components/WeatherAdvisoryView.jsx";
import { MarketIntelligenceView } from "./components/MarketIntelligenceView.jsx";
import { ProfitRiskView } from "./components/ProfitRiskView.jsx";
import { CropIntelligenceView } from "./components/CropIntelligenceView.jsx";
import { AIAdvisorView } from "./components/AIAdvisorView.jsx";
import { FarmFieldsView } from "./components/FarmFieldsView.jsx";
import { ReportsView } from "./components/ReportsView.jsx";
import { SettingsView } from "./components/SettingsView.jsx";

// Interactive Deep Feature Modals
import { CropAgronomyBlueprintModal } from "./components/crop/CropAgronomyBlueprintModal.jsx";
import { SoilHealthCardModal } from "./components/soil/SoilHealthCardModal.jsx";
import { GenerateReportModal } from "./components/reports/GenerateReportModal.jsx";
import { QuickActionModal } from "./components/QuickActionModal.jsx";
import { UserSwitcherModal } from "./components/settings/UserSwitcherModal.jsx";
import { DrKrishiFloatingChatbot } from "./components/advisor/DrKrishiFloatingChatbot.jsx";
import { ErrorBoundary } from "./components/ErrorBoundary.jsx";
import { OnboardingView } from "./components/auth/OnboardingView.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import { ArrowLeft, Home, Sparkles } from "lucide-react";

function AuthEntryView({ onOpenAuth }) {
  return (
    <main className="auth-entry-shell">
      <div className="auth-entry-brand"><Sparkles /><span>AI Crop Profit</span></div>
      <section className="auth-entry-card">
        <div className="auth-entry-mark"><Sparkles /></div>
        <p className="auth-entry-eyebrow">Precision agriculture workspace</p>
        <h1>Smart farming starts with your account.</h1>
        <p>Sign in to access your private farm dashboard, or create an account to begin with your own data.</p>
        <div className="auth-entry-actions">
          <button type="button" onClick={() => onOpenAuth("login")}>Sign in</button>
          <button type="button" onClick={() => onOpenAuth("signup")}>Create account</button>
        </div>
        <span className="auth-entry-note">Your farm data stays connected to your account.</span>
      </section>
    </main>
  );
}

function MainAppLayout() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const { isDarkMode } = useTheme();
  const farm = useFarm();
  const fields = farm?.fields || [];
  const farmProfile = farm?.farmProfile || {};
  const activeTab = farm?.activeTab || "dashboard";
  const setActiveTab = farm?.setActiveTab || (() => {});

  // Deep Modal Workspaces State
  const [selectedCropForBlueprint, setSelectedCropForBlueprint] = useState(null);
  const [showSoilCardModal, setShowSoilCardModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showUserSwitcherModal, setShowUserSwitcherModal] = useState(false);

  const profileReady = Boolean(
    isAuthenticated &&
      farmProfile?.farmName &&
      farmProfile?.location &&
      Number(farmProfile?.totalAreaAcres) > 0
  );

  useEffect(() => {
    if (!isAuthenticated) openAuthModal("login");
  }, [isAuthenticated, openAuthModal]);

  if (!isAuthenticated) {
    return (
      <>
        <AuthEntryView onOpenAuth={openAuthModal} />
        <UserSwitcherModal isOpen={true} onClose={() => {}} />
      </>
    );
  }

  if (!profileReady) return <OnboardingView />;

  // Tab Title Mapping for Breadcrumbs
  const tabTitles = {
    crop_analysis: "AI Crop Analysis (State, District & Village Lab Form)",
    ai_crop_analysis: "AI Crop Analysis (State, District & Village Lab Form)",
    disease_diagnosis: "Leaf Disease Scanner & Diagnosis",
    crop_disease: "Leaf Disease Scanner & Diagnosis",
    soil_health: "Soil Health Laboratory & Remediation",
    soil: "Soil Health Laboratory & Remediation",
    weather: "Weather Telemetry & Agronomic Forecast",
    market_intelligence: "APMC Mandi Intelligence & Wholesale Rates",
    market: "APMC Mandi Intelligence & Wholesale Rates",
    profit_risk: "Profitability & Financial Risk Modeler",
    crop_intelligence: "Crop Rotation & Agronomy Studio",
    crops: "Crop Rotation & Agronomy Studio",
    ai_advisor: "Dr. Krishi AI — Expert Farming Assistant",
    dr_krishi: "Dr. Krishi AI — Expert Farming Assistant",
    farm_fields: "My Farm — GIS Land Parcels & Field Telemetry",
    my_farm: "My Farm — GIS Land Parcels & Field Telemetry",
    farm: "My Farm — GIS Land Parcels & Field Telemetry",
    reports: "Agronomic Reports & Official Certificates",
    settings: "Farm Profile, Location & System Settings",
  };

  // Prepare Blueprint Evaluation Data
  const blueprintEvaluationData = selectedCropForBlueprint
    ? {
        crop: selectedCropForBlueprint,
        overallScore: selectedCropForBlueprint.suitabilityScore || 94,
        soilChemScore: 92,
        hydroScore: 88,
        climateScore: 94,
        econScore: 90,
        projectedYield: selectedCropForBlueprint.expectedYieldQtl || 22.5,
        grossRevenue:
          (selectedCropForBlueprint.expectedProfitPerAcre || 25000) +
          (selectedCropForBlueprint.estimatedInvestment || 20000),
        inputCost: selectedCropForBlueprint.estimatedInvestment || 21500,
        netProfit: selectedCropForBlueprint.expectedProfitPerAcre || 25000,
        roiPercent: 245,
        strengths: [
          "Assured MSP Procurement",
          "High Disease Resistance",
          "Optimal Soil Nutrient Match",
        ],
        advisories: [
          "Favorable market opportunity in regional APMC mandis.",
        ],
      }
    : null;

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
            {/* Row 1: Hero Section with Panoramic Farmer Photography */}
            <HeroSection
              onOpenCropStudio={() => setActiveTab("crop_analysis")}
            />

            {/* Row 2: 4 KPI Cards */}
            <FarmOverviewKPISection
              onOpenFieldModal={() => setActiveTab("farm_fields")}
            />

            {/* Row 3: Farm Performance + Weather Today (Two-Column) */}
            <FarmPerformanceWeatherSection
              onOpenFinancialDetails={() => setActiveTab("profit_risk")}
              onOpenWeatherDetails={() => setActiveTab("weather")}
            />

            {/* Row 4: AI Crop Recommendations WITH State, District, Village Selector */}
            <CropRecommendationsSection
              onOpenCropBlueprint={(crop) => setSelectedCropForBlueprint(crop)}
              onOpenFullAnalysis={() => setActiveTab("crop_analysis")}
            />

            {/* Row 5: Crop Health Overview + AI Disease Detection (Two-Column) */}
            <CropHealthDiseaseSection
              onOpenDiseaseReport={() => setActiveTab("reports")}
              onOpenFullScanner={() => setActiveTab("disease_diagnosis")}
            />

            {/* Row 6: Today's Mandi Prices + Profit & Risk Analysis (Two-Column) */}
            <MandiAndProfitRow
              onOpenProfitDetails={() => setActiveTab("profit_risk")}
              onOpenMarketDetails={() => setActiveTab("market_intelligence")}
            />

            {/* Row 7: Meet Dr. Krishi AI + Latest News & Schemes (Two-Column) */}
            <DrKrishiAndNewsRow
              onOpenAdvisor={() => setActiveTab("ai_advisor")}
              onOpenSchemes={() => setActiveTab("settings")}
            />
          </>
        );
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col font-sans bg-[#F8FAFC] dark:bg-slate-950 text-[#0F172A] dark:text-slate-100 transition-colors duration-200 selection:bg-[#15803D] selection:text-white overflow-x-clip">
      {/* ================= 1. STICKY TOP NAVBAR ================= */}
      <TopNavbar
        onOpenCropStudio={() => setActiveTab("crop_intelligence")}
        onOpenSettings={() => setActiveTab("settings")}
        onOpenSoilModal={() => setShowSoilCardModal(true)}
        onOpenReportsModal={() => setShowReportsModal(true)}
        onOpenUserSwitcher={() => setShowUserSwitcherModal(true)}
      />

      {/* ================= 2. MAIN VIEWPORT CONTAINER ================= */}
      <main className="dashboard-shell flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-7 sm:py-8 space-y-6 sm:space-y-7 lg:space-y-8 overflow-x-clip z-10">
        <ErrorBoundary>
          {/* Sub-view Breadcrumb & Return to Dashboard Header */}
          {activeTab !== "dashboard" && (
            <div className="w-full flex items-center justify-between pb-3 mb-2 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <button
                  onClick={() => {
                    setActiveTab("dashboard");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-[#15803D] dark:hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Dashboard</span>
                </button>
                <span>/</span>
                <span className="text-[#15803D] dark:text-emerald-400 font-bold">
                  {tabTitles[activeTab] || activeTab.replace(/_/g, " ")}
                </span>
              </div>
              <button
                onClick={() => {
                  setActiveTab("dashboard");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200/80 dark:border-emerald-800 flex items-center gap-1.5 cursor-pointer transition-all active:scale-[0.98]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </button>
            </div>
          )}

          {/* Active View Render */}
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      {/* ================= 3. CLEAN FOOTER ================= */}
      <Footer />

      {/* ================= 4. DR. KRISHI FLOATING CHATBOT WIDGET ================= */}
      <DrKrishiFloatingChatbot />

      {/* ================= 5. WORKING MODAL WORKSPACES ================= */}
      {/* A. Crop Agronomy Blueprint Modal */}
      <CropAgronomyBlueprintModal
        isOpen={Boolean(selectedCropForBlueprint)}
        onClose={() => setSelectedCropForBlueprint(null)}
        evaluationData={blueprintEvaluationData}
        isDarkMode={isDarkMode}
      />

      {/* B. Official Soil Health Card Modal */}
      <SoilHealthCardModal
        isOpen={showSoilCardModal}
        onClose={() => setShowSoilCardModal(false)}
        field={fields[0] || null}
        soilData={{
          ph: 6.8,
          nitrogen: 245,
          phosphorus: 18.5,
          potassium: 210,
          organicCarbon: 0.68,
          soilTexture: "Alluvial Loam",
        }}
        targetCrop="Wheat (HD-2967)"
        fertPlan={{
          basalDose: "1 Bag DAP (50kg) + 20kg MOP + 10kg Zinc Sulphate (21%) at final tillage",
          firstSplit: "45kg Urea at 1st irrigation (21-25 days)",
          secondSplit: "40kg Urea at tillering (40-45 days)",
        }}
        soilHealthScore={92}
        farmProfile={farmProfile}
      />

      {/* C. Reports Modal */}
      <GenerateReportModal
        isOpen={showReportsModal}
        onClose={() => setShowReportsModal(false)}
        onReportCreated={() => setShowReportsModal(false)}
      />

      {/* D. User Switcher Modal */}
      <UserSwitcherModal
        isOpen={showUserSwitcherModal}
        onClose={() => setShowUserSwitcherModal(false)}
      />

      {/* E. Quick Action Modal */}
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
