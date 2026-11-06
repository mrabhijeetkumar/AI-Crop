import React, { useState } from "react";
import { ArrowRight, Play, Sprout } from "lucide-react";

export function HeroSection({ onOpenCropStudio }) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      aria-label="Precision Agriculture Hero"
      className="relative w-full min-h-[380px] lg:h-[395px] rounded-[22px] overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-xs bg-[#F8FAFC] dark:bg-slate-900 flex flex-col lg:flex-row items-stretch"
    >
      {/* ================= 1. LEFT TEXT SECTION (45%) ================= */}
      <div className="w-full lg:w-[46%] xl:w-[44%] p-7 sm:p-9 lg:p-11 xl:p-12 flex flex-col justify-center text-left z-10 relative bg-gradient-to-br from-[#F0FDF4] via-[#FAFDF9] to-[#F8FAFC] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
        {/* Subtle Category Pill */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800 text-[10.5px] font-bold text-[#15803D] dark:text-emerald-400 tracking-wider uppercase mb-3.5 shadow-2xs w-fit">
          <Sprout className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>PRECISION AGRICULTURE PLATFORM</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-[38px] xl:text-[42px] font-extrabold font-heading text-[#0F172A] dark:text-white leading-[1.14] tracking-tight mb-3">
          Smart Farming. Better Decisions. <br className="hidden sm:inline" />
          <span className="text-[#15803D] dark:text-emerald-400">
            Higher Profit.
          </span>
        </h1>

        {/* Short Subtitle */}
        <p className="text-sm sm:text-[15px] text-[#64748B] dark:text-slate-300 font-normal leading-relaxed max-w-[460px] mb-6">
          Your intelligent farming companion to optimize crop selection, monitor farm health and maximize agricultural profitability.
        </p>

        {/* Modern 44-48px CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3.5">
          {/* Primary CTA */}
          <button
            onClick={() => {
              if (onOpenCropStudio) onOpenCropStudio();
              else scrollTo("crop-recommendations");
            }}
            className="h-11 sm:h-12 px-6 sm:px-7 rounded-full bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-all duration-150 cursor-pointer group active:scale-[0.98]"
          >
            <span>Explore AI Features</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Secondary CTA: Watch Demo */}
          <button
            onClick={() => setShowDemoModal(true)}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-full border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-800 hover:bg-white text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 shadow-2xs transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400 flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Watch Demo</span>
          </button>
        </div>
      </div>

      {/* ================= 2. RIGHT IMAGE SECTION (55%) ================= */}
      <div className="w-full lg:w-[54%] xl:w-[56%] relative min-h-[260px] sm:min-h-[320px] lg:min-h-full overflow-hidden flex-1 bg-emerald-50 dark:bg-slate-900">
        {/* Crisp Natural Farmer Photography */}
        <img
          src="/images/farmer-hero-hd.jpg"
          alt="Indian farmer using smartphone in lush agricultural field"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover object-[78%_top] sm:object-[82%_top] lg:object-[86%_top] pointer-events-none select-none"
        />

        {/* Soft edge blend on left boundary (desktop only, doesn't touch the farmer) */}
        <div
          className="hidden lg:block absolute inset-y-0 left-0 w-28 pointer-events-none z-5"
          style={{
            background:
              "linear-gradient(90deg, #F8FAFC 0%, rgba(248, 250, 252, 0.85) 35%, rgba(248, 250, 252, 0.3) 70%, transparent 100%)",
          }}
        />
        <div
          className="hidden lg:dark:block absolute inset-y-0 left-0 w-28 pointer-events-none z-5"
          style={{
            background:
              "linear-gradient(90deg, #0F172A 0%, rgba(15, 23, 42, 0.85) 35%, rgba(15, 23, 42, 0.3) 70%, transparent 100%)",
          }}
        />

        {/* Mobile top edge blend */}
        <div
          className="lg:hidden absolute inset-x-0 top-0 h-10 pointer-events-none z-5"
          style={{
            background:
              "linear-gradient(180deg, #F8FAFC 0%, transparent 100%)",
          }}
        />
        <div
          className="lg:hidden dark:block hidden absolute inset-x-0 top-0 h-10 pointer-events-none z-5"
          style={{
            background:
              "linear-gradient(180deg, #0F172A 0%, transparent 100%)",
          }}
        />
      </div>

      {/* ================= 5. DEMO MODAL ================= */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-5 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-[#15803D]" />
                <span>AI Crop Profit — Quick Platform Tour</span>
              </h3>
              <button
                onClick={() => setShowDemoModal(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="py-4 text-center">
              <div className="aspect-video rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center p-4">
                <Sprout className="w-10 h-10 text-[#15803D] mb-2 animate-bounce" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1">
                  100% Grounded Smart Precision Agriculture
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
                  1. Real-time satellite &amp; soil health audit.<br />
                  2. APMC mandi wholesale rate projections.<br />
                  3. Precision leaf disease diagnosis in &lt; 45ms.
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  scrollTo("crop-recommendations");
                }}
                className="px-4 py-1.5 rounded-full bg-[#15803D] text-white font-semibold text-xs cursor-pointer hover:bg-[#16A34A] transition-colors"
              >
                Explore Recommendations
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default HeroSection;
