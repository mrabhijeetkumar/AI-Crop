import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import {
  CreditCard,
  Building2,
  FileCheck,
  ShieldAlert,
  Coins,
  TrendingUp,
  Save,
  CheckCircle2,
  RefreshCw,
  Landmark,
  BadgePercent,
  FileBadge,
  Sparkles,
  ExternalLink,
  Database
} from "lucide-react";

export function FinancialSchemesSection() {
  const { user, updateUser, isSaving } = useAuth();
  const { isDarkMode } = useTheme();

  const [formData, setFormData] = useState({
    kccBankName: user?.kccBankName || "State Bank of India (SBI)",
    kccAccountNumber: user?.kccNumber || "",
    kccCreditLimit: user?.kccCreditLimit || "4,50,000",
    kccInterestRate: user?.kccInterestRate || "4.0% (Subvented)",
    pmKisanId: user?.farmerId || "",
    pmfbyPolicyNumber: user?.pmfbyPolicyNumber || "PMFBY-2025-WHEAT-89210",
    pmfbyInsuredAmount: user?.pmfbyInsuredAmount || "6,80,000",
    annualTurnover: user?.annualTurnover || "18,50,000",
    dbtStatus: user?.dbtStatus || "Aadhaar Linked & Verified (NPCI Active)",
    panNumber: user?.panNumber || "",
    linkedApmcMandi: user?.linkedApmcMandi || "Sasaram APMC Market Yard",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        kccBankName: user.kccBankName || "State Bank of India (SBI)",
        kccAccountNumber: user.kccNumber || "",
        kccCreditLimit: user.kccCreditLimit || "4,50,000",
        kccInterestRate: user.kccInterestRate || "4.0% (Subvented)",
        pmKisanId: user.farmerId || "",
        pmfbyPolicyNumber: user.pmfbyPolicyNumber || "PMFBY-2025-WHEAT-89210",
        pmfbyInsuredAmount: user.pmfbyInsuredAmount || "6,80,000",
        annualTurnover: user.annualTurnover || "18,50,000",
        dbtStatus: user.dbtStatus || "Aadhaar Linked & Verified (NPCI Active)",
        panNumber: user.panNumber || "",
        linkedApmcMandi: user.linkedApmcMandi || "Sasaram APMC Market Yard",
      });
    }
  }, [user]);

  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateUser(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {saveSuccess && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl animate-in fade-in border ${
            isDarkMode
              ? "bg-[#141414] border-[#22c55e] text-emerald-400"
              : "bg-emerald-50 border-emerald-400 text-emerald-900"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-[#22c55e] shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Financial & Govt Schemes details saved!</p>
            <p className={isDarkMode ? "text-[#a7f3d0]" : "text-emerald-700"}>
              Synchronized with your MongoDB records in real-time.
            </p>
          </div>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className={`border rounded-3xl p-5 shadow-xl flex items-center gap-4 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-[#22c55e] shrink-0 ${
              isDarkMode ? "bg-[#141414] border-[#22c55e]/40" : "bg-emerald-50 border-emerald-300"
            }`}
          >
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider block ${
                isDarkMode ? "text-neutral-400" : "text-emerald-800"
              }`}
            >
              KCC Sanction Limit
            </span>
            <p className="text-xl font-black">₹ {formData.kccCreditLimit}</p>
            <span
              className={`text-[10px] font-medium flex items-center gap-1 mt-0.5 ${
                isDarkMode ? "text-emerald-400" : "text-emerald-700"
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse"></span>
              {formData.kccBankName.split("(")[0]}
            </span>
          </div>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-xl flex items-center gap-4 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-sky-500 shrink-0 ${
              isDarkMode ? "bg-[#141414] border-[#22c55e]/40" : "bg-sky-50 border-sky-200"
            }`}
          >
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              PMFBY Crop Cover
            </span>
            <p className="text-xl font-black">₹ {formData.pmfbyInsuredAmount}</p>
            <span className="text-[10px] text-sky-600 font-medium mt-0.5 block">
              100% Rabi 2025 Insured
            </span>
          </div>
        </div>

        <div
          className={`border rounded-3xl p-5 shadow-xl flex items-center gap-4 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-amber-500 shrink-0 ${
              isDarkMode ? "bg-[#141414] border-[#22c55e]/40" : "bg-amber-50 border-amber-200"
            }`}
          >
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-[11px] font-semibold uppercase tracking-wider block ${
                isDarkMode ? "text-neutral-400" : "text-slate-600"
              }`}
            >
              Direct Benefit (DBT)
            </span>
            <p className="text-sm font-bold mt-1">{formData.dbtStatus.split("(")[0]}</p>
            <span className="text-[10px] text-amber-600 font-medium block mt-0.5">
              PM-KISAN ₹6,000/yr Active
            </span>
          </div>
        </div>
      </div>

      {/* Main Financial Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`border rounded-3xl p-6 sm:p-7 shadow-xl space-y-6 transition-colors ${
            isDarkMode
              ? "bg-[#0F0F0F] border-white/[0.08] text-white"
              : "bg-white border-emerald-200 text-slate-900 shadow-emerald-950/10"
          }`}
        >
          <div
            className={`pb-4 border-b ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <h3 className="text-lg font-bold tracking-tight">
              Institutional Credit & Government Scheme Linkages
            </h3>
            <p className={`text-xs mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}>
              Registered institutional details for automatic DBT subsidy tracing and PMFBY claim disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* KCC Bank Name */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Kisan Credit Card (KCC) Bank Name
              </label>
              <div className="relative">
                <Landmark
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. State Bank of India (SBI)"
                  value={formData.kccBankName}
                  onChange={(e) => handleInputChange("kccBankName", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* KCC Account Number */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                KCC Account Number
              </label>
              <input
                type="text"
                placeholder="e.g. KCC-SBIN-89304721"
                value={formData.kccAccountNumber}
                onChange={(e) => handleInputChange("kccAccountNumber", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-mono transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* KCC Credit Limit */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Approved Credit Limit (₹)
              </label>
              <input
                type="text"
                placeholder="e.g. 4,50,000"
                value={formData.kccCreditLimit}
                onChange={(e) => handleInputChange("kccCreditLimit", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-medium transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* PM-KISAN UID */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                PM-KISAN Farmer Registration ID
              </label>
              <div className="relative">
                <FileBadge
                  className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                    isDarkMode ? "text-neutral-400" : "text-emerald-600"
                  }`}
                />
                <input
                  type="text"
                  placeholder="e.g. PMK-BR-2024-889412"
                  value={formData.pmKisanId}
                  onChange={(e) => handleInputChange("pmKisanId", e.target.value)}
                  className={`w-full border rounded-xl pl-10 pr-3.5 py-2.5 text-xs outline-none font-mono transition-colors ${
                    isDarkMode
                      ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                      : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* PMFBY Crop Policy */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                PMFBY Crop Insurance Policy Number
              </label>
              <input
                type="text"
                placeholder="e.g. PMFBY-2025-WHEAT-89210"
                value={formData.pmfbyPolicyNumber}
                onChange={(e) => handleInputChange("pmfbyPolicyNumber", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-mono transition-colors ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>

            {/* Permanent Account Number (PAN) */}
            <div>
              <label
                className={`block text-xs font-semibold mb-1.5 ${
                  isDarkMode ? "text-[#d1fae5]" : "text-slate-700"
                }`}
              >
                Tax / PAN Identifier
              </label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                value={formData.panNumber}
                onChange={(e) => handleInputChange("panNumber", e.target.value)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none font-mono transition-colors uppercase ${
                  isDarkMode
                    ? "bg-[#0a0d0c] border-white/[0.08] text-white focus:border-[#4ade80]"
                    : "bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600 focus:bg-white"
                }`}
              />
            </div>
          </div>

          {/* Save Action Button */}
          <div
            className={`flex items-center justify-between pt-4 border-t ${
              isDarkMode ? "border-white/[0.08]" : "border-emerald-100"
            }`}
          >
            <div
              className={`flex items-center gap-2 text-xs ${
                isDarkMode ? "text-neutral-400" : "text-emerald-700 font-medium"
              }`}
            >
              <Database className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Real-time MongoDB synchronization enabled</span>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/20 transition-transform active:scale-98 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{isSaving ? "Saving to MongoDB..." : "Save Financial Schemes"}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
