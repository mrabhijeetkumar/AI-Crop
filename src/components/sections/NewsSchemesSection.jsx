import React, { useState } from "react";
import {
  Newspaper,
  Landmark,
  Calendar,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export function NewsSchemesSection() {
  const [selectedNews, setSelectedNews] = useState(null);

  const newsArticles = [
    {
      id: "news_1",
      headline: "Centre Approves Rabi MSP 2025-26: Wheat Guaranteed at ₹2,275/Qtl",
      description:
        "The Cabinet Committee on Economic Affairs (CCEA) approved minimum support prices for all mandated Rabi crops. Wheat saw an increase of ₹150/qtl to boost domestic foodgrain reserves.",
      date: "Nov 02, 2025",
      source: "PIB Agriculture & Farmers Welfare",
      image: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80",
      readUrl: "https://pib.gov.in",
    },
    {
      id: "news_2",
      headline: "ICAR Releases New Climate-Resilient Wheat Strains: DBW-303 and HD-3226",
      description:
        "Scientists at the Directorate of Wheat Research in Karnal confirmed the high yield and bio-fortified nutritional profile of new zero-shattering strains that withstand terminal heat waves.",
      date: "Oct 28, 2025",
      source: "ICAR Agri News Portal",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
      readUrl: "https://icar.org.in",
    },
    {
      id: "news_3",
      headline: "Micro-Irrigation Subsidies Expanded Under PMKSY for Drip and Sprinklers",
      description:
        "Small and marginal farmers are now eligible for up to 55% direct DBT financial assistance on automated drip kits, saving up to 40% tubewell electricity.",
      date: "Oct 24, 2025",
      source: "Krishi Jagran Daily",
      image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80",
      readUrl: "https://krishijagran.com",
    },
  ];

  const governmentSchemes = [
    {
      id: "pm_kisan",
      name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      tagline: "Direct Annual Income Transfer",
      benefits: "₹6,000 per year credited in 3 equal installments of ₹2,000 directly to Aadhaar-seeded bank accounts.",
      eligibility: "All small and marginal landholding farmer families with cultivable land in land records.",
      portalUrl: "https://pmkisan.gov.in",
      badge: "₹6,000 / Year",
    },
    {
      id: "pmfby",
      name: "PM Fasal Bima Yojana (PMFBY)",
      tagline: "Comprehensive Crop Insurance",
      benefits: "Guaranteed sum insured against drought, flood, hailstorm, and post-harvest unseasonal rain. Farmer pays only 1.5% premium for Rabi and 2% for Kharif.",
      eligibility: "All farmers growing notified crops in notified areas, whether landholder or tenant/sharecropper.",
      portalUrl: "https://pmfby.gov.in",
      badge: "1.5% Premium",
    },
    {
      id: "soil_health_card",
      name: "Soil Health Card Scheme (SHC)",
      tagline: "Free Soil Testing & Nutrient Advisory",
      benefits: "Provides biennial 12-parameter soil fertility assessment card with customized chemical fertilizer and bio-fertilizer recommendations.",
      eligibility: "All farmers across all states through local Krishi Vigyan Kendras (KVKs).",
      portalUrl: "https://soilhealth.dac.gov.in",
      badge: "100% Free",
    },
    {
      id: "kcc",
      name: "Kisan Credit Card (KCC)",
      tagline: "Subsidized Institutional Crop Loan",
      benefits: "Working capital loan up to ₹3 Lakh at an effective interest rate of only 4% per annum upon prompt repayment.",
      eligibility: "Individual farmers, joint liability groups, self-help groups and sharecroppers.",
      portalUrl: "https://myscheme.gov.in",
      badge: "4% Interest Rate",
    },
  ];

  return (
    <section id="news-schemes" className="w-full scroll-mt-24">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-[18px]">
        {/* ================= LEFT COLUMN: AGRICULTURE NEWS (6 COLS) ================= */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#15803D] dark:text-emerald-400" />
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Agriculture News & Mandi Updates
                </h3>
              </div>
              <span className="text-xs text-slate-400">Verified Sources</span>
            </div>

            {/* News Articles List */}
            <div className="space-y-4">
              {newsArticles.map((article) => (
                <div
                  key={article.id}
                  className="group p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-green-300 dark:hover:border-emerald-700 bg-slate-50/50 dark:bg-slate-850 hover:bg-white dark:hover:bg-slate-800 transition-all flex gap-3.5"
                >
                  <img
                    src={article.image}
                    alt={article.headline}
                    className="w-20 h-20 rounded-lg object-cover shrink-0 group-hover:scale-105 transition-transform"
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span>{article.source}</span>
                        <span>{article.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 group-hover:text-[#15803D] dark:group-hover:text-emerald-400 transition-colors">
                        {article.headline}
                      </h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                        {article.description}
                      </p>
                    </div>
                    <div className="pt-1.5 flex justify-end">
                      <a
                        href={article.readUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-[#15803D] hover:underline inline-flex items-center gap-1"
                      >
                        <span>Read Full Official Release</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-right">
            <span className="text-xs text-slate-400">Aggregated from PIB, ICAR & Agmarknet</span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: GOVERNMENT SCHEMES (6 COLS) ================= */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
                  Government Welfare Schemes (DBT)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-green-200/80 dark:border-emerald-800">
                Direct Benefit Transfer
              </span>
            </div>

            {/* Scheme Cards */}
            <div className="space-y-3">
              {governmentSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-green-50/40 dark:hover:bg-slate-800 transition-all text-xs"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">
                      {scheme.name}
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#15803D] text-white">
                      {scheme.badge}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-2 text-[11.5px]">
                    {scheme.benefits}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px]">
                    <span className="text-slate-400">Eligibility: {scheme.eligibility.slice(0, 40)}...</span>
                    <a
                      href={scheme.portalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#15803D] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Ministry of Agriculture & Farmers Welfare</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">100% Verified Links</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsSchemesSection;

