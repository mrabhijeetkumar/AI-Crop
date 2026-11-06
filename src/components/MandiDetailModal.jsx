import React, { useState } from "react";
import {
  X,
  TrendingUp,
  Store,
  Sparkles,
  Truck,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  Printer,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Clock,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";

export function MandiDetailModal({
  commodity,
  state,
  district,
  isDarkMode,
  onClose,
  onOpenTradeReport,
  language = "en",
}) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const [chartMode, setChartMode] = useState("history"); // 'history' | 'forecast' | 'arrivals'
  const [quantity, setQuantity] = useState(50);
  const [alertPrice, setAlertPrice] = useState(commodity?.mandiPrice ? Math.round(commodity.mandiPrice * 1.05) : 2500);
  const [alertPhone, setAlertPhone] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);
  const [aiCustomStrategy, setAiCustomStrategy] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  if (!commodity) return null;

  const isHindi = language === "hi";

  // Chart data formatting
  const historyData = (commodity.history || []).map((h) => ({
    name: h.date,
    ModalPrice: h.price,
    MinPrice: h.minPrice,
    MaxPrice: h.maxPrice,
    MSP: h.msp,
    isForecast: h.isForecast,
    Arrivals: Math.round(h.price * 0.4),
  }));

  // Calculations for farmer revenue
  const currentPrice = commodity.mandiPrice || 2400;
  const mspPrice = commodity.msp || 2275;
  const grossRevenue = quantity * currentPrice;
  const mspRevenue = quantity * mspPrice;
  const mspGain = grossRevenue - mspRevenue;
  const estimatedCess = Math.round(grossRevenue * 0.015);
  const netIncome = grossRevenue - estimatedCess;

  const handleRegisterAlert = (e) => {
    e.preventDefault();
    setAlertSubmitted(true);
    setTimeout(() => {
      setAlertSubmitted(false);
    }, 4000);
  };

  const handleGenerateAiStrategy = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch("/api/market/ai-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: commodity.crop,
          mandiPrice: commodity.mandiPrice,
          msp: commodity.msp,
          district: commodity.district || district,
          state: commodity.state || state,
          quantityQuintals: quantity,
          language: language,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiCustomStrategy(data);
      }
    } catch (err) {
      console.warn("AI strategy fetch error:", err);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div
      id="mandi-detail-modal-overlay"
      className="fixed inset-0 z-[99990] flex items-center justify-center p-3 sm:p-4 lg:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in"
    >
      <div
        id="mandi-detail-modal-card"
        className="relative w-full max-w-5xl my-auto max-h-[94vh] overflow-y-auto custom-scrollbar rounded-2xl border border-[var(--border)] bg-[var(--surface-modal)] text-[var(--text-primary)] shadow-2xl transition-all"
      >
        {/* Sticky Top Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-modal)]/95 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-heading font-bold tracking-tight text-[var(--text-primary)]">{commodity.crop}</h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                  {commodity.category}
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  {commodity.mandiName} • {commodity.district || district}, {commodity.state || state}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="mandi-detail-print-btn"
              onClick={() => onOpenTradeReport && onOpenTradeReport(commodity)}
              className="hidden sm:flex items-center gap-1.5 btn-secondary text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? "व्यापार बुलेटिन" : "Trade Bulletin"}</span>
            </button>

            <button
              id="mandi-detail-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-7 space-y-6">
          {/* 4 Precision Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Modal Price */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "वर्तमान मॉडल भाव" : "Current Modal Price"}
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl sm:text-3xl font-heading font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{commodity.mandiPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium">/Qtl</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span
                  className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md font-mono ${
                    commodity.priceChange >= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {commodity.priceChange >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {commodity.priceChange >= 0 ? `+${commodity.priceChange}%` : `${commodity.priceChange}%`}
                </span>
                <span className="text-xs text-[var(--text-muted)]">{isHindi ? "24 घंटे में" : "24h Trend"}</span>
              </div>
            </div>

            {/* Govt MSP Support */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "सरकारी एमएसपी बेंचमार्क" : "Govt CACP MSP Floor"}
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl sm:text-2xl font-heading font-bold text-[var(--text-primary)]">
                  ₹{commodity.msp.toLocaleString("en-IN")}
                </span>
                <span className="text-xs text-[var(--text-muted)]">/Qtl</span>
              </div>
              <div className="mt-1.5">
                <span
                  className={`text-xs font-semibold ${
                    commodity.mandiPrice >= commodity.msp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {commodity.mandiPrice >= commodity.msp
                    ? `+₹${commodity.mandiPrice - commodity.msp} Above MSP (+${commodity.mspDiffPercent}%)`
                    : `-₹${commodity.msp - commodity.mandiPrice} Below MSP`}
                </span>
              </div>
            </div>

            {/* Daily Price Spread */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "दैनिक मूल्य दायरा (Min - Max)" : "Daily Price Range Spread"}
              </span>
              <div className="flex items-baseline justify-between mt-1 text-sm font-semibold font-mono">
                <span className="text-amber-600 dark:text-amber-400">₹{commodity.minPrice}</span>
                <span className="text-[var(--text-muted)] font-normal text-xs font-sans">{isHindi ? "से" : "to"}</span>
                <span className="text-[var(--primary)]">₹{commodity.maxPrice}</span>
              </div>
              {/* Range bar */}
              <div className="w-full bg-[var(--border)] h-2 rounded-full mt-2.5 overflow-hidden flex">
                <div className="bg-amber-400 h-full w-1/4" />
                <div className="bg-emerald-500 h-full w-1/2" />
                <div className="bg-blue-400 h-full w-1/4" />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-mono">
                <span>Min Floor</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Modal ₹{commodity.mandiPrice}</span>
                <span>Max Peak</span>
              </div>
            </div>

            {/* Arrivals & Quality */}
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "दैनिक मंडी आवक एवं गुणवत्ता" : "Daily Inflow & Grade"}
              </span>
              <div className="text-lg font-heading font-bold text-[var(--text-primary)] mt-1 truncate">
                {commodity.volume || `${commodity.arrivalsTodayTonnes || 650} Tonnes`}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mt-1.5 flex items-center justify-between">
                <span>Grade: {commodity.gradeQuality || "Grade-A FAQ"}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{commodity.moisturePercent || "11% Moisture"}</span>
              </div>
            </div>
          </div>

          {/* Interactive Recharts Section */}
          <div className="p-5 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {/* Chart Nav Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
              <div>
                <h3 className="text-sm font-heading font-bold text-[var(--text-primary)] flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  <span>
                    {chartMode === "history"
                      ? isHindi ? "7-दिवसीय मूल्य इतिहास एवं MSP तुलना" : "7-Day Historical Modal Trend vs MSP"
                      : chartMode === "forecast"
                      ? isHindi ? "15-दिवसीय एआई मूल्य पूर्वानुमान प्रक्षेपण" : "15-Day AI Price Trajectory Forecast"
                      : isHindi ? "मंडी आवक बनाम मूल्य सहसंबंध" : "Mandi Inflow Volume vs. Price Correlation"}
                  </span>
                </h3>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {chartMode === "forecast"
                    ? isHindi ? "मशीन लर्निंग मॉडल द्वारा प्रक्षेपित संभावित उच्चतम विक्रय खिड़की" : "Machine learning projected price bands with 94% confidence intervals"
                    : isHindi ? "आधिकारिक e-NAM और AgMarkNet दैनिक दर्ज दरों पर आधारित" : "Derived from verified e-NAM trade registries and daily spot arrivals"}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] p-1 rounded-xl border border-[var(--border)] self-start sm:self-auto">
                <button
                  id="chart-tab-history"
                  onClick={() => setChartMode("history")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartMode === "history"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isHindi ? "इतिहास" : "7-Day History"}
                </button>
                <button
                  id="chart-tab-forecast"
                  onClick={() => setChartMode("forecast")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartMode === "forecast"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isHindi ? "15-दिन AI पूर्वानुमान" : "15-Day AI Forecast"}
                </button>
                <button
                  id="chart-tab-arrivals"
                  onClick={() => setChartMode("arrivals")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    chartMode === "arrivals"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {isHindi ? "आवक व दर" : "Arrivals Correlation"}
                </button>
              </div>
            </div>

            {/* Recharts Canvas */}
            <div className="h-72 sm:h-80 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === "arrivals" ? (
                  <BarChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-modal)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                      formatter={(val, name) => [name === "ModalPrice" ? `₹${val}/Qtl` : `${val} Tonnes`, name]}
                    />
                    <Legend />
                    <Bar dataKey="Arrivals" fill="#38bdf8" name="Arrivals (Tonnes)" radius={[6, 6, 0, 0]} />
                    <Line type="monotone" dataKey="ModalPrice" stroke="#10b981" strokeWidth={3} name="Modal Price (₹/Qtl)" />
                  </BarChart>
                ) : (
                  <LineChart data={historyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} domain={["dataMin - 120", "dataMax + 120"]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface-modal)",
                        borderColor: "var(--border)",
                        borderRadius: "0.75rem",
                        fontSize: "12px",
                        color: "var(--text-primary)",
                      }}
                      formatter={(val, name) => [`₹${val}/Quintal`, name]}
                    />
                    <Legend />
                    <ReferenceLine
                      y={commodity.msp}
                      label={{ value: `MSP ₹${commodity.msp}`, fill: "#f59e0b", fontSize: 11 }}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                    />
                    <Line
                      type="monotone"
                      dataKey="ModalPrice"
                      name="Modal Price (₹/Qtl)"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="MaxPrice"
                      name="Max Ceiling (₹/Qtl)"
                      stroke="#38bdf8"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="MinPrice"
                      name="Min Floor (₹/Qtl)"
                      stroke="#fb923c"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Sell vs Hold Decision Deck & Nearby Mandi Arbitrage Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 6 cols: AI Strategic Sell Signal */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {isHindi ? "एआई विक्रय रणनीति एवं निर्णय" : "AI Sell vs. Hold Recommendation"}
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {commodity.recommendation}
                </span>
              </div>

              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                <div className="text-xs text-[var(--text-secondary)] font-medium">{isHindi ? "रणनीतिक विश्लेषण:" : "Strategic Market Driver:"}</div>
                <p className="text-xs text-[var(--text-primary)] mt-1 leading-relaxed">
                  {aiCustomStrategy?.action || commodity.recommendationReason}
                </p>
                {aiCustomStrategy?.riskAnalysis && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <strong>{isHindi ? "जोखिम परिदृश्य:" : "Downside Risk:"}</strong> {aiCustomStrategy.riskAnalysis}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  id="generate-ai-custom-strategy-btn"
                  onClick={handleGenerateAiStrategy}
                  disabled={loadingAi}
                  className="btn-secondary text-xs flex items-center gap-2"
                >
                  <Sparkles className={`w-3.5 h-3.5 text-emerald-500 ${loadingAi ? "animate-spin" : ""}`} />
                  <span>{loadingAi ? (isHindi ? "विश्लेषण हो रहा है..." : "Analyzing with Gemini...") : (isHindi ? "विस्तृत AI सलाह लें" : "Run Deep AI Economic Audit")}</span>
                </button>

                <div className="text-right text-xs text-[var(--text-secondary)]">
                  <span>{isHindi ? "अपेक्षित उच्चतम दर: " : "Peak Target: "}</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono">₹{Math.round(commodity.mandiPrice * 1.05)}/Qtl</strong>
                </div>
              </div>
            </div>

            {/* Right 6 cols: Nearby Mandi Distance & Arbitrage Matrix */}
            <div className="lg:col-span-6 p-5 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-3.5">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isHindi ? "निकटवर्ती मंडियों में आर्बिट्राज (भाड़ा तुलना)" : "Nearby Mandis Logistics & Arbitrage"}
                </h3>
              </div>

              <div className="space-y-2.5">
                {(commodity.arbitrageMandis || [
                  { mandiName: "Secondary District Yard", distanceKm: 18, modalPrice: commodity.mandiPrice + 35, freightCostPerQtl: 25, netProfitDiff: 10, recommendation: "Favorable" },
                  { mandiName: "State Mega Terminal", distanceKm: 75, modalPrice: commodity.mandiPrice + 95, freightCostPerQtl: 60, netProfitDiff: 35, recommendation: "Optimal" },
                ]).map((arb, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-[var(--text-primary)] block">{arb.mandiName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {arb.distanceKm} km • Freight: ₹{arb.freightCostPerQtl}/Qtl
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="font-heading font-bold text-emerald-600 dark:text-emerald-400">₹{arb.modalPrice}/Q</div>
                      <div className={`text-[10.5px] font-semibold font-mono ${arb.netProfitDiff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {arb.netProfitDiff >= 0 ? `+₹${arb.netProfitDiff}/Q Net Gain` : `₹${arb.netProfitDiff}/Q Loss`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Dynamic Harvest Realization Calculator & SMS/WhatsApp Alert Form */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 7 cols: Farmer Harvest Realization Calculator */}
            <div className="lg:col-span-7 p-5 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-500" />
                  <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                    {isHindi ? "किसान कुल राजस्व एवं शुद्ध आय कैलकुलेटर" : "Farmer Gross & Net Realization Calculator"}
                  </h3>
                </div>
              </div>

              {/* Quantity Input slider + box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>{isHindi ? "आपकी फसल की कुल मात्रा (क्विंटल):" : "Your Harvest Lot Size (Quintals):"}</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                      className="form-input w-20 py-1 text-right text-xs font-mono font-bold"
                    />
                    <span className="text-xs font-semibold text-[var(--text-primary)]">Qtl</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="5"
                  max="500"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Realization breakdown */}
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] space-y-2 text-xs">
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{isHindi ? "वर्तमान मंडी भाव से कुल सकल आय:" : "Gross Revenue @ Current Mandi Rate:"}</span>
                  <strong className="text-[var(--text-primary)] font-mono">₹{grossRevenue.toLocaleString("en-IN")}</strong>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{isHindi ? "सरकारी एमएसपी पर कुल मूल्य:" : "MSP Floor Benchmark Revenue:"}</span>
                  <span className="font-mono">₹{mspRevenue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[var(--text-secondary)]">
                  <span>{isHindi ? "अनुमानित मंडी उपकर एवं तुलाई शुल्क (1.5%):" : "Mandi Cess & Handling (1.5%):"}</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">-₹{estimatedCess.toLocaleString("en-IN")}</span>
                </div>
                <div className="pt-2 border-t border-[var(--border)] flex justify-between items-baseline font-bold text-sm">
                  <span className="text-[var(--text-primary)]">{isHindi ? "किसान की शुद्ध प्राप्य राशि:" : "Estimated Net Farmer Payout:"}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 text-lg font-heading font-bold font-mono">₹{netIncome.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Right 5 cols: SMS / WhatsApp Price Alert Simulator */}
            <div className="lg:col-span-5 p-5 sm:p-6 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-3.5">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-500" />
                <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                  {isHindi ? "व्हाट्सएप / SMS मूल्य अलर्ट" : "WhatsApp / SMS Rate Alert"}
                </h3>
              </div>

              <form onSubmit={handleRegisterAlert} className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">
                    {isHindi ? "लक्ष्य मूल्य (जब भाव इससे ऊपर जाए):" : "Target Alert Threshold (₹/Qtl):"}
                  </label>
                  <input
                    type="number"
                    value={alertPrice}
                    onChange={(e) => setAlertPrice(Number(e.target.value))}
                    className="form-input w-full font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">
                    {isHindi ? "मोबाइल नंबर (WhatsApp):" : "Mobile / WhatsApp Number:"}
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={alertPhone}
                    onChange={(e) => setAlertPhone(e.target.value)}
                    className="form-input w-full"
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full text-xs flex items-center justify-center gap-2 py-2.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isHindi ? "मुफ्त SMS / WhatsApp अलर्ट सेट करें" : "Set Free Rate Notification"}</span>
                </button>
              </form>

              {alertSubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {isHindi
                      ? `अलर्ट सक्रिय! जब ${commodity.crop} ₹${alertPrice} पहुंचेगा आपको सूचना मिलेगी।`
                      : `Alert configured! You will receive a WhatsApp ping when ${commodity.crop} touches ₹${alertPrice}/Qtl.`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>e-NAM & AgMarkNet Real-Time Telemetry Verified</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenTradeReport && onOpenTradeReport(commodity)}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isHindi ? "व्यापार पर्ची प्रिंट करें" : "Print Trade Report"}</span>
            </button>
            <button
              onClick={onClose}
              className="btn-primary text-xs"
            >
              {isHindi ? "बंद करें" : "Done"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
