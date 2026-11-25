import React, { useEffect, useState } from "react";
import { ArrowRight, Play, Sprout } from "lucide-react";

export function HeroSection({ onOpenCropStudio }) {
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Modal open hone par body scrollbar hide/show se page width jump karta tha,
  // jiski wajah se right-side scroll line blink karti thi. Width preserve karke
  // scroll lock karne se layout stable rehta hai.
  useEffect(() => {
    if (!showDemoModal) return undefined;

    const body = document.body;
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      body.style.paddingRight = `${scrollBarWidth}px`;
    }

    const closeOnEscape = (event) => {
      if (event.key === "Escape") setShowDemoModal(false);
    };
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [showDemoModal]);

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
      className="relative isolate w-full min-h-[500px] lg:h-[500px] rounded-[22px] overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-[0_18px_45px_-30px_rgba(15,23,42,.6)] bg-[#F0FDF4] dark:bg-slate-900"
      style={{ scrollbarGutter: "stable" }}
    >
      {/* ================= 1. FULL BLEED PHOTO + FEATHERED FOG ================= */}
      <img
        src="/images/farmer-hero-bg.png"
        alt="Indian farmer using smartphone in lush agricultural field"
        fetchPriority="high"
        loading="eager"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
      />
      <div
        className="absolute inset-0 hidden pointer-events-none z-[1] lg:block"
        style={{
          background: `linear-gradient(90deg,
            rgba(240,253,244,.99) 0%,
            rgba(240,253,244,.97) 18%,
            rgba(240,253,244,.86) 30%,
            rgba(240,253,244,.60) 42%,
            rgba(240,253,244,.25) 55%,
            rgba(240,253,244,.06) 67%,
            transparent 79%),
            linear-gradient(180deg, rgba(255,255,255,.10), transparent 32%, rgba(15,23,42,.08) 100%)`,
        }}
      />
      <div className="absolute inset-0 z-[1] hidden dark:block pointer-events-none bg-[linear-gradient(90deg,rgba(2,6,23,.98)_0%,rgba(2,6,23,.94)_24%,rgba(2,6,23,.70)_42%,rgba(2,6,23,.28)_60%,transparent_80%)]" />
      <div className="absolute inset-0 z-[1] pointer-events-none lg:hidden bg-[linear-gradient(180deg,rgba(240,253,244,.98)_0%,rgba(240,253,244,.92)_48%,rgba(240,253,244,.45)_78%,rgba(240,253,244,.10)_100%)] dark:bg-[linear-gradient(180deg,rgba(2,6,23,.98)_0%,rgba(2,6,23,.90)_52%,rgba(2,6,23,.42)_82%,rgba(2,6,23,.12)_100%)]" />

      {/* ================= 2. TEXT CONTENT ================= */}
      <div className="relative z-10 flex min-h-[500px] w-full lg:w-[57%] flex-col justify-center p-7 text-left sm:p-9 lg:p-12 xl:p-14">
        {/* Subtle Category Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-xs font-semibold text-[#15803D] dark:text-emerald-400 mb-3.5 w-fit">
          <Sprout className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Precision Agriculture Platform</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-[36px] sm:text-[42px] lg:text-[46px] xl:text-[52px] font-bold font-heading text-[#0F172A] dark:text-white leading-[1.08] tracking-[-0.035em] mb-4">
          <span className="block">Smart Farming.</span>
          <span className="block">Better Decisions.</span>
          <span className="block text-[#15803D] dark:text-emerald-400">
            Higher Profit.
          </span>
        </h1>

        {/* Short Subtitle */}
        <p className="text-sm sm:text-[15px] text-[#475569] dark:text-slate-300 font-normal leading-[1.65] max-w-[500px] mb-7">
          Your intelligent farming companion to optimize crop selection, monitor
          farm health, and maximize agricultural profitability.
        </p>

        {/* Modern Restrained CTA Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Primary CTA */}
          <button
            onClick={() => {
              if (onOpenCropStudio) onOpenCropStudio();
              else scrollTo("crop-recommendations");
            }}
            className="h-11 sm:h-12 px-6 sm:px-7 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-150 cursor-pointer group active:scale-[0.98]"
          >
            <span>Explore AI Features</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Secondary CTA: Watch Demo */}
          <button
            onClick={() => setShowDemoModal(true)}
            className="h-11 sm:h-12 px-5 sm:px-6 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/95 dark:bg-slate-800 hover:bg-white text-slate-700 dark:text-slate-200 font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <div className="w-5 h-5 rounded-md bg-emerald-50 dark:bg-emerald-950 text-[#15803D] dark:text-emerald-400 flex items-center justify-center">
              <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
            </div>
            <span>Watch Demo</span>
          </button>
        </div>
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
                  1. Real-time satellite &amp; soil health audit.
                  <br />
                  2. APMC mandi wholesale rate projections.
                  <br />
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
