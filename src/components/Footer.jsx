import React from "react";
import {
  Sprout,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 transition-colors duration-200 mt-12">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* ================= LEFT: BRAND & TAGLINE ================= */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-emerald-950/60 border border-green-200/80 dark:border-emerald-800 flex items-center justify-center text-[#15803D] dark:text-emerald-400 shadow-xs">
              <Sprout className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-[17px] font-bold font-heading tracking-tight block text-slate-900 dark:text-white">
                AI Crop <span className="text-[#15803D]">Profit</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                Smart Farming, Higher Profit.
              </span>
            </div>
          </div>

          {/* ================= CENTER: CLEAN LINKS ROW ================= */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <a href="#hero" className="hover:text-[#15803D] transition-colors">
              About Us
            </a>
            <span className="text-slate-300">•</span>
            <a href="#hero" className="hover:text-[#15803D] transition-colors">
              Privacy Policy
            </a>
            <span className="text-slate-300">•</span>
            <a href="#hero" className="hover:text-[#15803D] transition-colors">
              Terms & Conditions
            </a>
            <span className="text-slate-300">•</span>
            <a href="#hero" className="hover:text-[#15803D] transition-colors">
              Contact Us
            </a>
          </div>

          {/* ================= RIGHT: SOCIAL ICONS & PILL BADGE ================= */}
          <div className="flex items-center gap-3.5">
            {/* Social Icons matching screenshot */}
            <div className="flex items-center gap-2">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#15803D] transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#15803D] transition-colors"
                title="X (Twitter)"
              >
                <Twitter className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#15803D] transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4 fill-current" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-[#15803D] transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4 fill-current" />
              </a>
            </div>

            {/* Light Green Pill Badge matching screenshot */}
            <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <span>Together for a Green Tomorrow</span>
              <span>🌿</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
