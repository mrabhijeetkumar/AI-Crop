import React, { useMemo, useState, useEffect } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Headphones,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Ruler,
  ShieldCheck,
  Sparkles,
  Sprout,
  TrendingUp,
  User,
  UserPlus,
  LogIn,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { STATE_DISTRICTS_DATA } from "../../data/indianStatesDistricts.js";

const ROLE_OPTIONS = [
  "Farmer",
  "Farm Manager",
  "Agronomist / Agriculture Expert",
  "Agri Business Owner",
  "Agricultural Officer",
  "Other",
];
const AREA_UNITS = ["Acres", "Hectares", "Bigha"];
const CROP_OPTIONS = [
  "Wheat",
  "Rice / Paddy",
  "Mustard / Rapeseed",
  "Bt Cotton",
  "Maize / Corn",
  "Potato",
  "Sugarcane",
  "Chickpea / Gram",
  "Soybean",
  "Green Gram / Moong",
  "Other / Mixed",
];
const FARMING_TYPES = [
  "Precision / Drip Irrigated",
  "Organic / Natural Farming",
  "Conventional / Canal Irrigated",
  "Rainfed / Dryland",
  "Polyhouse / Greenhouse",
];

/* ------------------------------------------------------------------ */
/*  Validation helpers (mirror the server rules)                       */
/* ------------------------------------------------------------------ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeMobile(input) {
  let d = String(input || "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}

function passwordError(pw) {
  if (!pw || pw.length < 8) return "Password must be at least 8 characters long.";
  if (pw.length > 128) return "Password is too long (maximum 128 characters).";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password must include at least one letter and one number.";
  return "";
}

function calculatePasswordStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

/* ------------------------------------------------------------------ */
/*  Small presentational pieces                                        */
/* ------------------------------------------------------------------ */
const INPUT_BASE =
  "w-full h-11 rounded-xl border border-slate-200/90 bg-slate-50/60 hover:bg-white focus:bg-white focus:border-[#15803D] focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all disabled:bg-slate-100 disabled:text-slate-400";
const INPUT_CLS = `${INPUT_BASE} px-3.5`;
const LABEL_CLS = "text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1.5";
const PRIMARY_BTN =
  "w-full h-13 rounded-full bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#22C55E] hover:from-[#166534] hover:to-[#15803D] text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition-all cursor-pointer relative overflow-hidden group active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed";
const SECONDARY_BTN =
  "h-11 px-5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors";
const SMALL_PRIMARY_BTN =
  "h-11 px-6 rounded-full bg-[#15803D] hover:bg-[#16A34A] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors disabled:opacity-60 disabled:cursor-not-allowed";

const LEAF_PATH = "M50 0 C70 30 90 50 100 100 C50 90 30 70 0 50 C30 50 40 30 50 0 Z";

function Field({ icon: Icon, label, required, htmlFor, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={LABEL_CLS}>
        {Icon && <Icon className="w-3.5 h-3.5 text-[#15803D]" />}
        <span>{label}</span>
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function PasswordInput({ id, name, value, onChange, placeholder, autoComplete, show, onToggle }) {
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        maxLength={128}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`${INPUT_BASE} pl-3.5 pr-10`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
        aria-label={show ? "Hide password" : "Show password"}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function SubmitSpinner({ busy, idle, busyText }) {
  return busy ? (
    <>
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>{busyText}</span>
    </>
  ) : (
    idle
  );
}

const MODAL_CONTENT = {
  help: {
    title: "AI Crop Profit Agronomy Desk",
    body: null,
  },
  terms: {
    title: "Terms & Conditions",
    body: [
      "AI Crop Profit gives advisory information for farming decisions. Always verify chemical doses and market prices locally before acting.",
      "You are responsible for keeping your password confidential and for the accuracy of the details you enter.",
      "You can delete your account and all stored farm data at any time from Settings.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "We store your account details, farm profile, fields and settings in our database so they are available on every device you sign in from.",
      "Passwords are stored only as salted hashes. We never see or store your plain password.",
      "You can export or permanently delete your data from Settings whenever you want.",
    ],
  },
};

/* ================================================================== */
export function AuthPage({ initialMode = "signup", onAuthSuccess }) {
  const { login, signup, forgotPassword, resetPassword, isSaving } = useAuth();

  const [mode, setMode] = useState(initialMode); // "signup" | "login" | "forgot_password"
  const [step, setStep] = useState(1); // signup: 1 Account | 2 Farm | 3 Review
  const [submitting, setSubmitting] = useState(false);
  const busy = submitting || isSaving;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Signup
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "Farmer",
    farmName: "",
    state: "",
    district: "",
    village: "",
    farmArea: "",
    farmAreaUnit: "Acres",
    primaryCrop: "Wheat",
    farmingType: "Precision / Drip Irrigated",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Forgot password
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newResetPassword, setNewResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [devCode, setDevCode] = useState("");
  const [resendIn, setResendIn] = useState(0);

  const [modal, setModal] = useState(null); // null | "help" | "terms" | "privacy"
  const [statusMessage, setStatusMessage] = useState(null);

  const districts = useMemo(
    () => (form.state ? STATE_DISTRICTS_DATA[form.state] || [] : []),
    [form.state]
  );
  const passwordStrength = useMemo(() => calculatePasswordStrength(form.password), [form.password]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const showError = (message) => setStatusMessage({ success: false, message });
  const showSuccess = (message) => setStatusMessage({ success: true, message });

  const switchMode = (newMode) => {
    setMode(newMode);
    setStep(1);
    setForgotStep(1);
    setStatusMessage(null);
  };

  /* ---------------- Signup ---------------- */
  const validateStepOne = () => {
    if (form.name.trim().length < 2) return "Please enter your full name.";
    if (!EMAIL_RE.test(form.email.trim())) return "Please enter a valid email address.";
    if (!normalizeMobile(form.phone)) return "Please enter a valid 10-digit Indian mobile number (+91).";
    const pwErr = passwordError(form.password);
    if (pwErr) return pwErr;
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    if (!termsAccepted) return "Please accept the Terms & Conditions and Privacy Policy to continue.";
    return "";
  };

  const handleNextStep = () => {
    setStatusMessage(null);
    if (step === 1) {
      const error = validateStepOne();
      if (error) return showError(error);
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setStatusMessage(null);

    const error = validateStepOne();
    if (error) {
      setStep(1);
      return showError(error);
    }

    setSubmitting(true);
    try {
      const area = form.farmArea ? Number(form.farmArea) : 0;
      const result = await signup({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.trim(),
        password: form.password,
        termsAccepted: true,
        role: form.role,
        farmName: form.farmName.trim(),
        state: form.state,
        district: form.district,
        village: form.village.trim(),
        farmArea: Number.isFinite(area) && area > 0 ? area : 0,
        farmAreaUnit: form.farmAreaUnit,
        primaryCrop: form.primaryCrop,
        farmingType: form.farmingType,
      });

      if (result.success) {
        showSuccess("Account created successfully! Preparing your farm workspace...");
        if (onAuthSuccess) setTimeout(onAuthSuccess, 800);
      } else {
        if (result.field) setStep(1);
        showError(result.error || "Registration could not be completed. Please check your details.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Login ---------------- */
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    setStatusMessage(null);

    const identifier = loginIdentifier.trim();
    if (!identifier) return showError("Please enter your email or mobile number.");
    if (!loginPassword) return showError("Please enter your password.");

    setSubmitting(true);
    try {
      const result = await login(identifier, loginPassword, rememberMe);
      if (result.success) {
        showSuccess("Signed in successfully. Launching your farm workspace...");
        if (onAuthSuccess) setTimeout(onAuthSuccess, 600);
      } else {
        showError(result.error || "Unable to sign in. Please verify your credentials.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Forgot / reset password ---------------- */
  const handleRequestResetCode = async (e) => {
    e?.preventDefault();
    if (busy) return;
    const email = forgotEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) return showError("Please enter a valid registered email address.");

    setSubmitting(true);
    try {
      const res = await forgotPassword(email);
      if (res.success) {
        setForgotStep(2);
        setDevCode(res.devCode || "");
        setResendIn(30);
        showSuccess(res.message || "If an account exists with this email, a verification code has been sent.");
      } else {
        showError(res.error || "Failed to process request.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (busy) return;
    if (!/^\d{6}$/.test(resetCode.trim())) return showError("Please enter the 6-digit verification code.");
    const pwErr = passwordError(newResetPassword);
    if (pwErr) return showError(pwErr);
    if (newResetPassword !== confirmResetPassword) return showError("Passwords do not match.");

    setSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail.trim().toLowerCase(), resetCode.trim(), newResetPassword);
      if (res.success) {
        const email = forgotEmail.trim().toLowerCase();
        setMode("login");
        setLoginIdentifier(email);
        setLoginPassword("");
        setForgotStep(1);
        setResetCode("");
        setNewResetPassword("");
        setConfirmResetPassword("");
        setDevCode("");
        showSuccess("Password reset successful! Please sign in with your new password.");
      } else {
        showError(res.error || "Password reset failed. Invalid or expired code.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const modalInfo = modal ? MODAL_CONTENT[modal] : null;

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans bg-slate-900 flex flex-col justify-between selection:bg-[#15803D] selection:text-white">
      {/* Background photo */}
      <div
        className="fixed inset-0 pointer-events-none select-none z-0"
        style={{
          backgroundImage: "url('/images/smart-farming-sunrise.png')",
          backgroundSize: "cover",
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
        }}
        aria-hidden="true"
      />
      {/* Soft overlay */}
      <div
        className="fixed inset-0 pointer-events-none select-none z-1"
        style={{
          background:
            "linear-gradient(135deg, rgba(240, 253, 244, 0.94) 0%, rgba(240, 253, 244, 0.72) 35%, rgba(240, 253, 244, 0.35) 65%, rgba(255, 255, 255, 0.1) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Decorative leaves */}
      {[
        "top-6 left-12 w-16 h-16 opacity-75 blur-[1px] text-emerald-600 rotate-[-25deg]",
        "top-36 left-48 w-8 h-8 opacity-80 text-emerald-500 rotate-45",
        "top-24 right-1/2 w-10 h-10 opacity-75 blur-[0.5px] text-emerald-600 rotate-[-50deg]",
      ].map((cls) => (
        <div key={cls} className={`fixed pointer-events-none select-none z-2 hidden lg:block ${cls}`} aria-hidden="true">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
            <path d={LEAF_PATH} />
          </svg>
        </div>
      ))}

      {/* Header */}
      <header className="relative w-full flex items-center justify-between px-6 sm:px-10 lg:px-16 pt-5 pb-3 z-20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100/90 flex items-center justify-center text-[#15803D] border border-emerald-200/90 shadow-2xs">
            <Sprout className="w-6 h-6 stroke-[2.3]" />
          </div>
          <div>
            <span className="font-extrabold font-heading text-xl sm:text-[22px] text-slate-900 tracking-tight block leading-none">
              AI Crop Profit
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 font-medium block mt-1">Grow Smarter. Farm Better.</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setModal("help")}
          className="bg-white/90 hover:bg-white text-slate-700 text-xs font-semibold px-4 py-2 rounded-full border border-slate-200/90 shadow-2xs flex items-center gap-2 transition-all cursor-pointer hover:shadow-xs active:scale-98"
        >
          <Headphones className="w-4 h-4 text-[#15803D]" />
          <span>Need Help?</span>
        </button>
      </header>

      {/* Main */}
      <main className="relative z-20 flex-1 w-full max-w-[1520px] mx-auto px-6 sm:px-10 lg:px-16 py-4 lg:py-6 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
        {/* Hero */}
        <div className="w-full lg:w-[48%] flex flex-col justify-center text-left py-2 sm:py-6 lg:py-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200/90 text-[11px] font-bold text-[#15803D] uppercase tracking-wider mb-5 shadow-2xs w-fit">
            <Sprout className="w-4 h-4 stroke-[2.3]" />
            <span>Precision Agriculture Platform</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black font-heading text-slate-900 leading-[1.08] tracking-tight mb-4">
            Grow smarter with <br />
            <span className="text-[#16A34A] relative inline-block">
              AI-powered
              <svg
                className="absolute left-0 -bottom-2 w-full h-3 text-[#16A34A]/80 pointer-events-none"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M3 8.5C65 2.5 140 2.5 197 8.5" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>{" "}
            farming.
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-[480px] mb-8">
            Plan crops, understand your farm and make better decisions from one secure workspace.
          </p>

          <div className="grid grid-cols-3 gap-3.5 sm:gap-4 max-w-[500px]">
            {[
              { icon: Sprout, a: "AI Crop", b: "Recommendations" },
              { icon: BarChart3, a: "Smart Farm", b: "Management" },
              { icon: TrendingUp, a: "Better Profit", b: "Insights" },
            ].map(({ icon: Icon, a, b }) => (
              <div
                key={a}
                className="bg-white/85 backdrop-blur-md rounded-2xl p-4 text-center border border-white/90 shadow-2xs hover:shadow-xs hover:-translate-y-0.5 transition-all flex flex-col items-center justify-center gap-2.5"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803D] flex items-center justify-center border border-emerald-100">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h4 className="text-xs sm:text-[13px] font-bold text-slate-800 leading-tight">
                  {a} <br />
                  {b}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Auth card */}
        <div className="w-full lg:w-[52%] flex justify-center lg:justify-end pb-8 lg:pb-0">
          <div className="w-full max-w-[620px] bg-white/95 backdrop-blur-xl rounded-[32px] p-6 sm:p-9 lg:p-10 border border-white/90 shadow-2xl relative transition-all">
            {mode !== "forgot_password" && (
              <div
                className="bg-slate-100/90 p-1.5 rounded-full flex items-center max-w-[340px] mx-auto mb-6 border border-slate-200/80 shadow-inner"
                role="tablist"
                aria-label="Authentication Type"
              >
                {[
                  { key: "signup", label: "Sign Up", icon: UserPlus },
                  { key: "login", label: "Log In", icon: LogIn },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => switchMode(key)}
                    className={`flex-1 py-2 sm:py-2.5 px-4 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${mode === key ? "bg-[#15803D] text-white shadow-md" : "text-slate-600 hover:text-slate-900"
                      }`}
                    role="tab"
                    aria-selected={mode === key}
                  >
                    <Icon className="w-4 h-4 stroke-[2.3]" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            )}

            {statusMessage && (
              <div
                role="alert"
                className={`mb-5 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in duration-200 ${statusMessage.success
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
              >
                {statusMessage.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{statusMessage.message}</span>
              </div>
            )}

            {/* ================= SIGN UP ================= */}
            {mode === "signup" && (
              <div>
                <div className="mb-5 text-left">
                  <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block mb-1">
                    CREATE YOUR ACCOUNT
                  </span>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold font-heading text-slate-900 tracking-tight leading-tight mb-1">
                    Start your farm workspace
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Complete the essentials now. You can refine your profile later.
                  </p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between max-w-[420px] mb-6">
                  {["Account", "Farm Profile", "Review"].map((label, i) => {
                    const n = i + 1;
                    const active = step >= n;
                    return (
                      <React.Fragment key={label}>
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${active ? "bg-[#15803D] text-white" : "bg-slate-100 text-slate-400"
                              }`}
                          >
                            {step > n ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : n}
                          </div>
                          <span className={`text-xs font-bold ${active ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
                        </div>
                        {n < 3 && <div className={`h-0.5 flex-1 mx-2 ${step > n ? "bg-[#15803D]" : "bg-slate-200"}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Step 1 */}
                {step === 1 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNextStep();
                    }}
                    className="space-y-4 text-left"
                    noValidate
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field icon={User} label="Full Name" required htmlFor="su-name">
                        <input
                          id="su-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          maxLength={80}
                          value={form.name}
                          onChange={(e) => updateForm("name", e.target.value)}
                          placeholder="Your name"
                          className={INPUT_CLS}
                        />
                      </Field>
                      <Field icon={Mail} label="Email Address" required htmlFor="su-email">
                        <input
                          id="su-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          maxLength={254}
                          value={form.email}
                          onChange={(e) => updateForm("email", e.target.value)}
                          placeholder="you@example.com"
                          className={INPUT_CLS}
                        />
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field icon={Phone} label="Mobile Number (+91)" required htmlFor="su-phone">
                        <input
                          id="su-phone"
                          name="phone"
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          required
                          maxLength={16}
                          value={form.phone}
                          onChange={(e) => updateForm("phone", e.target.value.replace(/[^\d+\s-]/g, ""))}
                          placeholder="+91 9876543210"
                          className={INPUT_CLS}
                        />
                      </Field>

                      <div>
                        <Field icon={LockKeyhole} label="Password" required htmlFor="su-password">
                          <PasswordInput
                            id="su-password"
                            name="password"
                            value={form.password}
                            onChange={(e) => updateForm("password", e.target.value)}
                            placeholder="Letters + numbers, 8+ chars"
                            autoComplete="new-password"
                            show={showPassword}
                            onToggle={() => setShowPassword((s) => !s)}
                          />
                        </Field>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <div className="flex items-center gap-1 flex-1">
                            {[1, 2, 3, 4].map((seg) => (
                              <div
                                key={seg}
                                className={`h-1 flex-1 rounded-full transition-all ${passwordStrength >= seg
                                    ? passwordStrength >= 4
                                      ? "bg-[#15803D]"
                                      : passwordStrength >= 3
                                        ? "bg-emerald-500"
                                        : passwordStrength >= 2
                                          ? "bg-amber-500"
                                          : "bg-rose-500"
                                    : "bg-slate-200"
                                  }`}
                              />
                            ))}
                          </div>
                          <span
                            className={`text-[10px] font-bold ${passwordStrength >= 4
                                ? "text-[#15803D]"
                                : passwordStrength >= 2
                                  ? "text-amber-600"
                                  : "text-slate-400"
                              }`}
                          >
                            {!form.password ? "" : passwordStrength >= 4 ? "Strong ✓" : passwordStrength >= 2 ? "Good" : "Weak"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Field icon={LockKeyhole} label="Confirm Password" required htmlFor="su-confirm">
                      <PasswordInput
                        id="su-confirm"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={(e) => updateForm("confirmPassword", e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword((s) => !s)}
                      />
                    </Field>

                    <div className="pt-1 flex items-start gap-2.5 text-xs text-slate-600">
                      <input
                        id="su-terms"
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 rounded text-[#15803D] focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="leading-tight">
                        <label htmlFor="su-terms" className="cursor-pointer select-none">
                          I agree to the{" "}
                        </label>
                        <button type="button" onClick={() => setModal("terms")} className="text-[#15803D] font-bold underline cursor-pointer">
                          Terms and Conditions
                        </button>{" "}
                        and{" "}
                        <button type="button" onClick={() => setModal("privacy")} className="text-[#15803D] font-bold underline cursor-pointer">
                          Privacy Policy
                        </button>
                      </span>
                    </div>

                    <button type="submit" disabled={busy} className={`${PRIMARY_BTN} mt-4`}>
                      <span>Continue</span>
                      <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                    </button>

                    <div className="text-center pt-3 text-xs text-slate-500">
                      Already have an account?{" "}
                      <button type="button" onClick={() => switchMode("login")} className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1">
                        Sign in
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleNextStep();
                    }}
                    className="space-y-4 text-left"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field icon={Sprout} label="Farm Name (optional)" htmlFor="su-farm">
                        <input
                          id="su-farm"
                          type="text"
                          maxLength={120}
                          value={form.farmName}
                          onChange={(e) => updateForm("farmName", e.target.value)}
                          placeholder="e.g. Green Valley Farm"
                          className={INPUT_CLS}
                        />
                      </Field>
                      <Field icon={User} label="Account Role" htmlFor="su-role">
                        <select id="su-role" value={form.role} onChange={(e) => updateForm("role", e.target.value)} className={`${INPUT_CLS} cursor-pointer`}>
                          {ROLE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field icon={MapPin} label="State" htmlFor="su-state">
                        <select
                          id="su-state"
                          value={form.state}
                          onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value, district: "" }))}
                          className={`${INPUT_CLS} cursor-pointer`}
                        >
                          <option value="">Select State</option>
                          {Object.keys(STATE_DISTRICTS_DATA).map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field icon={MapPin} label="District" htmlFor="su-district">
                        <select
                          id="su-district"
                          value={form.district}
                          onChange={(e) => updateForm("district", e.target.value)}
                          disabled={!form.state}
                          className={`${INPUT_CLS} cursor-pointer`}
                        >
                          <option value="">{form.state ? "Select District" : "Select State first"}</option>
                          {districts.map((dst) => (
                            <option key={dst} value={dst}>
                              {dst}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <Field icon={MapPin} label="Village / City" htmlFor="su-village">
                        <input
                          id="su-village"
                          type="text"
                          maxLength={80}
                          value={form.village}
                          onChange={(e) => updateForm("village", e.target.value)}
                          placeholder="e.g. Phagwara"
                          className={INPUT_CLS}
                        />
                      </Field>
                      <Field icon={Ruler} label="Total Area" htmlFor="su-area">
                        <input
                          id="su-area"
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="100000"
                          value={form.farmArea}
                          onChange={(e) => updateForm("farmArea", e.target.value)}
                          placeholder="e.g. 5.5"
                          className={INPUT_CLS}
                        />
                      </Field>
                      <Field label="Unit" htmlFor="su-unit">
                        <select id="su-unit" value={form.farmAreaUnit} onChange={(e) => updateForm("farmAreaUnit", e.target.value)} className={`${INPUT_CLS} cursor-pointer`}>
                          {AREA_UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <Field icon={Sprout} label="Primary Crop" htmlFor="su-crop">
                        <select id="su-crop" value={form.primaryCrop} onChange={(e) => updateForm("primaryCrop", e.target.value)} className={`${INPUT_CLS} cursor-pointer`}>
                          {CROP_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field icon={ShieldCheck} label="Farming Type" htmlFor="su-type">
                        <select id="su-type" value={form.farmingType} onChange={(e) => updateForm("farmingType", e.target.value)} className={`${INPUT_CLS} cursor-pointer`}>
                          {FARMING_TYPES.map((ft) => (
                            <option key={ft} value={ft}>
                              {ft}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3">
                      <button type="button" onClick={() => setStep(1)} className={SECONDARY_BTN}>
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setStep(3)} className="text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-2 cursor-pointer transition-colors">
                          Skip for now
                        </button>
                        <button type="submit" className={SMALL_PRIMARY_BTN}>
                          <span>Continue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <form onSubmit={handleSignupSubmit} className="space-y-4 text-left">
                    {[
                      {
                        title: "Account Information",
                        editStep: 1,
                        rows: [
                          ["Name", form.name],
                          ["Email", form.email],
                          ["Mobile", form.phone],
                          ["Role", form.role],
                        ],
                      },
                      {
                        title: "Farm Information",
                        editStep: 2,
                        rows: [
                          ["Farm Name", form.farmName || `${form.name.trim()}'s Farm`],
                          ["Location", [form.village, form.district, form.state].filter(Boolean).join(", ") || "Not provided"],
                          ["Area", form.farmArea ? `${form.farmArea} ${form.farmAreaUnit}` : "Not provided"],
                          ["Primary Crop", form.primaryCrop],
                        ],
                      },
                    ].map((card) => (
                      <div key={card.title} className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <span className="text-xs font-bold text-slate-800">{card.title}</span>
                          <button type="button" onClick={() => setStep(card.editStep)} className="text-xs font-bold text-[#15803D] hover:underline cursor-pointer">
                            Edit
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {card.rows.map(([k, v]) => (
                            <div key={k} className="min-w-0">
                              <span className="text-slate-400 block">{k}:</span>
                              <span className="font-semibold text-slate-800 break-words">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button type="button" onClick={() => setStep(2)} className={SECONDARY_BTN}>
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                      <button
                        type="submit"
                        disabled={busy}
                        className="flex-1 h-12 rounded-full bg-gradient-to-r from-[#15803D] to-[#16A34A] hover:from-[#166534] hover:to-[#15803D] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 cursor-pointer transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <SubmitSpinner busy={busy} busyText="Creating Account..." idle={<><span>Create Account</span><CheckCircle2 className="w-4 h-4" /></>} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ================= LOGIN ================= */}
            {mode === "login" && (
              <div className="text-left">
                <div className="mb-5">
                  <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block mb-1">WELCOME BACK</span>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold font-heading text-slate-900 tracking-tight leading-tight mb-1">
                    Sign in to your farm workspace
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    Access your live field telemetry, AI crop blueprints, and APMC market intelligence.
                  </p>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
                  <Field icon={Mail} label="Email Address or Mobile Number" required htmlFor="li-id">
                    <input
                      id="li-id"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      maxLength={254}
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="you@example.com or +91 9876543210"
                      className={INPUT_CLS}
                    />
                  </Field>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label htmlFor="li-password" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <LockKeyhole className="w-3.5 h-3.5 text-[#15803D]" />
                        <span>Password</span>
                        <span className="text-rose-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(loginIdentifier.includes("@") ? loginIdentifier.trim() : "");
                          switchMode("forgot_password");
                        }}
                        className="text-xs font-semibold text-[#15803D] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <PasswordInput
                      id="li-password"
                      name="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      show={showPassword}
                      onToggle={() => setShowPassword((s) => !s)}
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 select-none pt-1">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-[#15803D] focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Keep me signed in on this device</span>
                  </label>

                  <button type="submit" disabled={busy} className={`${PRIMARY_BTN} mt-2`}>
                    <SubmitSpinner busy={busy} busyText="Signing In..." idle={<><span>Sign In</span><ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" /></>} />
                  </button>

                  <div className="text-center pt-3 text-xs text-slate-500">
                    New to AI Crop Profit?{" "}
                    <button type="button" onClick={() => switchMode("signup")} className="text-[#15803D] font-bold hover:underline cursor-pointer ml-1">
                      Create an account
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= FORGOT PASSWORD ================= */}
            {mode === "forgot_password" && (
              <div className="text-left">
                <div className="mb-5">
                  <span className="text-[11px] font-bold text-[#15803D] uppercase tracking-wider block mb-1">ACCOUNT RECOVERY</span>
                  <h2 className="text-2xl sm:text-[28px] font-extrabold font-heading text-slate-900 tracking-tight leading-tight mb-1">
                    Reset your password
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">
                    {forgotStep === 1
                      ? "Enter your registered email to receive a 6-digit verification code."
                      : `Enter the code sent to ${forgotEmail.trim()} and choose a new password.`}
                  </p>
                </div>

                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestResetCode} className="space-y-4" noValidate>
                    <Field icon={Mail} label="Registered Email Address" required htmlFor="fp-email">
                      <input
                        id="fp-email"
                        type="email"
                        autoComplete="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={INPUT_CLS}
                      />
                    </Field>
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button type="button" onClick={() => switchMode("login")} className={SECONDARY_BTN}>
                        <ArrowLeft className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button type="submit" disabled={busy} className={`flex-1 ${SMALL_PRIMARY_BTN}`}>
                        <SubmitSpinner busy={busy} busyText="Sending..." idle={<><span>Send Code</span><ArrowRight className="w-4 h-4" /></>} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleResetPasswordSubmit} className="space-y-4" noValidate>
                    {devCode && (
                      <div className="text-[11px] bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2">
                        Developer mode: email service is not configured, so your code is <b className="font-mono tracking-widest">{devCode}</b>
                      </div>
                    )}
                    <Field icon={Sparkles} label="6-Digit Verification Code" required htmlFor="fp-code">
                      <input
                        id="fp-code"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className={`${INPUT_CLS} font-mono tracking-widest text-center`}
                      />
                    </Field>
                    <Field icon={LockKeyhole} label="New Password" required htmlFor="fp-new">
                      <PasswordInput
                        id="fp-new"
                        name="newPassword"
                        value={newResetPassword}
                        onChange={(e) => setNewResetPassword(e.target.value)}
                        placeholder="Letters + numbers, 8+ chars"
                        autoComplete="new-password"
                        show={showPassword}
                        onToggle={() => setShowPassword((s) => !s)}
                      />
                    </Field>
                    <Field icon={LockKeyhole} label="Confirm New Password" required htmlFor="fp-confirm">
                      <PasswordInput
                        id="fp-confirm"
                        name="confirmNewPassword"
                        value={confirmResetPassword}
                        onChange={(e) => setConfirmResetPassword(e.target.value)}
                        placeholder="Repeat new password"
                        autoComplete="new-password"
                        show={showConfirmPassword}
                        onToggle={() => setShowConfirmPassword((s) => !s)}
                      />
                    </Field>

                    <div className="flex items-center justify-between text-xs">
                      <button type="button" onClick={() => setForgotStep(1)} className="font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
                        Change email
                      </button>
                      <button
                        type="button"
                        disabled={resendIn > 0 || busy}
                        onClick={() => handleRequestResetCode()}
                        className="font-semibold text-[#15803D] hover:underline cursor-pointer disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed"
                      >
                        {resendIn > 0 ? `Resend code in ${resendIn}s` : "Resend code"}
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-2">
                      <button type="button" onClick={() => switchMode("login")} className={SECONDARY_BTN}>
                        <ArrowLeft className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                      <button type="submit" disabled={busy} className={`flex-1 ${SMALL_PRIMARY_BTN}`}>
                        <SubmitSpinner busy={busy} busyText="Resetting..." idle={<><span>Reset Password</span><CheckCircle2 className="w-4 h-4" /></>} />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full px-6 py-4 text-center text-xs text-slate-700 font-medium bg-white/40 backdrop-blur-xs border-t border-white/60">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <span>© {new Date().getFullYear()} AI Crop Profit • Precision Agriculture Workspace</span>
          <div className="flex items-center gap-4">
            <button type="button" onClick={() => setModal("help")} className="hover:text-[#15803D] cursor-pointer transition-colors">
              Support &amp; Agronomy Desk
            </button>
            <span>•</span>
            <button type="button" onClick={() => setModal("privacy")} className="hover:text-[#15803D] cursor-pointer transition-colors">
              Privacy &amp; Data Security
            </button>
          </div>
        </div>
      </footer>

      {/* Modal (help / terms / privacy) */}
      {modalInfo && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setModal(null)}
              className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#15803D] flex items-center justify-center mb-4">
              {modal === "help" ? <Headphones className="w-6 h-6 stroke-[2.3]" /> : <ShieldCheck className="w-6 h-6 stroke-[2.3]" />}
            </div>

            <h3 className="text-xl font-bold font-heading text-slate-900 mb-3">{modalInfo.title}</h3>

            {modal === "help" ? (
              <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 mb-5">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold">Email: support@aicrop.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#15803D]" />
                  <span className="font-semibold">Toll-Free Helpline: 1800-419-AGRI (+91)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sprout className="w-4 h-4 text-[#15803D]" />
                  <span>Hours: Mon–Sat, 7:00 AM – 8:00 PM IST</span>
                </div>
              </div>
            ) : (
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed mb-5 list-disc pl-4">
                {modalInfo.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={() => setModal(null)}
              className="w-full py-2.5 rounded-full bg-[#15803D] hover:bg-[#16A34A] text-white font-bold text-xs cursor-pointer transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuthPage;