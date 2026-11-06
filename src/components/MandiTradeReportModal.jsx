import React from "react";
import {
  Printer,
  X,
  TrendingUp,
  Store,
  ShieldCheck,
  Calendar,
  Layers,
  MapPin,
  FileText,
  DollarSign,
  Truck,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export function MandiTradeReportModal({
  commodity,
  state,
  district,
  isDarkMode,
  onClose,
  language = "en",
}) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  if (!commodity) return null;

  const handlePrint = () => {
    window.print();
  };

  const bulletinId = `MANDI-AGRI-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const currentDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const currentTime = new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isHindi = language === "hi";
  const defaultQuantityQtl = 50;
  const grossIncome = defaultQuantityQtl * commodity.mandiPrice;
  const mspIncome = defaultQuantityQtl * commodity.msp;
  const mspDelta = grossIncome - mspIncome;
  const mandiCess = Math.round(grossIncome * 0.015);
  const netEstimatedRealization = grossIncome - mandiCess;

  return (
    <div
      id="mandi-trade-report-modal-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain print:p-0 print:bg-white print:static"
    >
      <div
        id="mandi-trade-report-content"
        className="relative w-full max-w-4xl my-auto max-h-[92vh] overflow-y-auto custom-scrollbar rounded-2xl border border-[var(--border)] bg-[var(--surface-modal)] text-[var(--text-primary)] shadow-2xl transition-all print:max-h-none print:shadow-none print:border-none print:rounded-none print:w-full"
      >
        {/* Top Action Bar (Hidden during Print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-modal)]/95 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-heading font-bold text-[var(--text-primary)]">
                {isHindi ? "आधिकारिक मंडी भाव एवं व्यापार पर्ची" : "Official Mandi Rate & Trade Advisory Slip"}
              </h2>
              <span className="text-xs text-[var(--text-secondary)]">
                {isHindi ? "राष्ट्रीय ई-नाम / एगमार्कनेट टेलीमेट्री बुलेटिन" : "National e-NAM / AgMarkNet Telemetry Bulletin"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="print-mandi-bulletin-btn"
              onClick={handlePrint}
              className="btn-primary text-xs flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>{isHindi ? "प्रिंट / PDF डाउनलोड" : "Print / Export PDF"}</span>
            </button>
            <button
              id="close-mandi-bulletin-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Bulletin Document Area */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6 print:text-black">
          {/* Header Banner */}
          <div className="border-b border-[var(--border)] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono">
                    {commodity.source || "e-NAM National APMC"}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium">
                    {isHindi ? "सत्यापित कृषि उपज मंडी" : "Verified APMC Yard"}
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-heading font-bold tracking-tight text-[var(--text-primary)] mt-1">
                  {commodity.mandiName}
                </h1>
                <p className="text-xs text-[var(--text-secondary)] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span>
                    {commodity.district || district}, {commodity.state || state} (India)
                  </span>
                </p>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-[var(--border)] sm:pl-5 space-y-0.5 text-xs">
              <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                ID: {bulletinId}
              </div>
              <div className="text-[var(--text-primary)] font-medium print:text-black">
                {currentDate} • {currentTime}
              </div>
              <div className="text-[10px] text-[var(--text-muted)]">
                Agri-Intelligence Trade Index v4.2
              </div>
            </div>
          </div>

          {/* Commodity Core Summary Deck */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "फसल एवं किस्म" : "Commodity & Variety"}
              </span>
              <div className="text-base font-heading font-bold text-[var(--text-primary)] mt-0.5 truncate">{commodity.crop}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold font-mono">{commodity.category}</span>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "वर्तमान मॉडल भाव" : "Current Modal Price"}
              </span>
              <div className="text-2xl font-heading font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                ₹{commodity.mandiPrice.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-[var(--text-muted)] font-sans">/Qtl</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                {commodity.priceChange >= 0 ? `+${commodity.priceChange}% (24h)` : `${commodity.priceChange}% (24h)`}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "सरकारी एमएसपी दर" : "Official CACP MSP"}
              </span>
              <div className="text-lg font-heading font-bold text-[var(--text-primary)] mt-0.5">
                ₹{commodity.msp.toLocaleString("en-IN")}
                <span className="text-xs font-normal text-[var(--text-muted)] font-sans">/Qtl</span>
              </div>
              <div className={`text-[10px] font-semibold mt-0.5 ${commodity.mandiPrice >= commodity.msp ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                {commodity.mandiPrice >= commodity.msp
                  ? `+₹${commodity.mandiPrice - commodity.msp} Above MSP (+${commodity.mspDiffPercent}%)`
                  : `-₹${commodity.msp - commodity.mandiPrice} Below MSP`}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
              <span className="text-xs text-[var(--text-secondary)] font-medium block">
                {isHindi ? "एआई ट्रेडिंग सिग्नल" : "AI Trade Signal"}
              </span>
              <div className="inline-block mt-1 px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono">
                {commodity.recommendation}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1 truncate">
                {commodity.gradeQuality || "Grade-A FAQ"}
              </div>
            </div>
          </div>

          {/* AI Decision Strategy & Agronomic Driver */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)]">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-primary)]">
                {isHindi ? "एआई बाजार रणनीति एवं आपूर्ति विश्लेषण" : "AI Market Strategy & Supply Analysis"}
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-primary)] print:text-slate-800">
              {commodity.recommendationReason}
            </p>
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>{isHindi ? "दैनिक मंडी आवक:" : "Daily Arrivals:"}</span>
                <strong className="text-[var(--text-primary)] print:text-black font-mono">{commodity.volume}</strong>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>{isHindi ? "नमी का स्तर:" : "Moisture Content:"}</span>
                <strong className="text-[var(--text-primary)] print:text-black font-mono">{commodity.moisturePercent || "11.2%"}</strong>
              </div>
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <span>{isHindi ? "दैनिक फैलाव (Min - Max):" : "Daily Spread:"}</span>
                <strong className="text-[var(--text-primary)] print:text-black font-mono">
                  ₹{commodity.minPrice} - ₹{commodity.maxPrice}/Qtl
                </strong>
              </div>
            </div>
          </div>

          {/* Harvest Commercial Realization Calculator Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
              <span>{isHindi ? "अनुमानित राजस्व एवं मंडी प्राप्ति (50 क्विंटल लॉट)" : "Commercial Realization Assessment (50 Quintal Batch)"}</span>
            </h3>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="text-xs font-semibold border-b border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)]">
                  <tr>
                    <th className="p-3">{isHindi ? "विवरण / पैरामीटर" : "Parameter Description"}</th>
                    <th className="p-3 text-right">{isHindi ? "एमएसपी बेंचमार्क" : "Govt MSP Floor"}</th>
                    <th className="p-3 text-right">{isHindi ? "वर्तमान मंडी भाव" : "Current APMC Mandi"}</th>
                    <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">{isHindi ? "अतिरिक्त लाभ / घाटा" : "Net Delta"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                  <tr>
                    <td className="p-3 font-medium">{isHindi ? "प्रति क्विंटल दर" : "Price Per Quintal"}</td>
                    <td className="p-3 text-right font-mono">₹{commodity.msp}/Qtl</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">₹{commodity.mandiPrice}/Qtl</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {commodity.mandiPrice >= commodity.msp ? `+₹${commodity.mandiPrice - commodity.msp}` : `-₹${commodity.msp - commodity.mandiPrice}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">{isHindi ? "कुल सकल आय (50 क्विंटल)" : "Gross Realization (50 Qtl)"}</td>
                    <td className="p-3 text-right font-mono">₹{mspIncome.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-bold text-[var(--text-primary)] print:text-black font-mono">₹{grossIncome.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                      {mspDelta >= 0 ? `+₹${mspDelta.toLocaleString("en-IN")}` : `-₹${Math.abs(mspDelta).toLocaleString("en-IN")}`}
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">{isHindi ? "अनुमानित मंडी उपकर एवं शुल्क (1.5%)" : "Mandi Cess & Handling (1.5%)"}</td>
                    <td className="p-3 text-right font-mono">₹{Math.round(mspIncome * 0.015).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right font-mono">₹{mandiCess.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right text-[var(--text-muted)]">-</td>
                  </tr>
                  <tr className="bg-[var(--surface-subtle)] font-bold">
                    <td className="p-3 text-[var(--text-primary)] print:text-black">{isHindi ? "किसान की शुद्ध प्राप्य राशि" : "Estimated Net Farmer Payout"}</td>
                    <td className="p-3 text-right font-mono">₹{(mspIncome - Math.round(mspIncome * 0.015)).toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm font-mono">₹{netEstimatedRealization.toLocaleString("en-IN")}</td>
                    <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                      {mspDelta >= 0 ? `+₹${mspDelta.toLocaleString("en-IN")}` : `-₹${Math.abs(mspDelta).toLocaleString("en-IN")}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Nearby Mandis Transport Arbitrage Matrix */}
          {commodity.arbitrageMandis && commodity.arbitrageMandis.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-heading font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{isHindi ? "निकटवर्ती मंडियों में आर्बिट्राज एवं परिवहन तुलना" : "Inter-Mandi Distance & Freight Arbitrage Matrix"}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {commodity.arbitrageMandis.map((arb, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold truncate">{arb.mandiName}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{arb.distanceKm} km</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[var(--text-secondary)] text-xs">{isHindi ? "मॉडल दर:" : "Modal Rate:"}</span>
                      <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">₹{arb.modalPrice}/Q</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{isHindi ? "भाड़ा लागत:" : "Freight Cost:"}</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">₹{arb.freightCostPerQtl}/Qtl</span>
                    </div>
                    <div className="pt-1.5 border-t border-[var(--border)] flex items-center justify-between text-xs">
                      <span className="text-[var(--text-secondary)]">{isHindi ? "शुद्ध लाभ अंतर:" : "Net Gain:"}</span>
                      <span className={`font-bold font-mono ${arb.netProfitDiff >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                        {arb.netProfitDiff >= 0 ? `+₹${arb.netProfitDiff}/Qtl` : `₹${arb.netProfitDiff}/Qtl`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Footnote and Seal */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-[var(--text-primary)] print:text-black">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>e-NAM & AgMarkNet Digital Compliance Verified</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                {isHindi
                  ? "यह रिपोर्ट राष्ट्रीय कृषि बाजार (e-NAM) और CACP न्यूनतम समर्थन मूल्य दिशा-निर्देशों के आधार पर तैयार की गई है।"
                  : "This advisory bulletin is formulated in compliance with e-NAM trade standards and CACP statutory MSP floors."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-center">
                <div className="w-16 h-10 border border-dashed border-emerald-500/40 rounded flex items-center justify-center text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                  SEAL & SIGN
                </div>
                <span className="text-[9px] text-[var(--text-muted)]">Chief Agro-Economist</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
