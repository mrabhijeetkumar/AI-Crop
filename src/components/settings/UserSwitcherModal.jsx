import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, BarChart3, Check, CheckCircle2, Eye, EyeOff, Headphones, LockKeyhole, Mail, MapPin, Phone, Sprout, TrendingUp, User, UserRoundPlus, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { STATE_DISTRICTS_DATA } from "../../data/indianStatesDistricts.js";

const ROLE_OPTIONS = ["Farmer", "Farm Manager", "Agronomist / Agriculture Expert", "Agri Business Owner", "Other"];
const AREA_UNITS = ["Acres", "Hectares", "Bigha"];

const passwordScore = (password) => [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

export function UserSwitcherModal({ isOpen: propIsOpen, onClose: propOnClose }) {
  const { login, signup, isSaving, activeUserModal, closeAuthModal, authModalMode } = useAuth();
  const { isDarkMode } = useTheme();
  const isModalOpen = propIsOpen !== undefined ? propIsOpen : activeUserModal;
  const handleClose = propOnClose || closeAuthModal;
  const [mode, setMode] = useState(authModalMode || "login");
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", role: "Farmer", farmName: "", state: "", district: "", village: "", farmArea: "", farmAreaUnit: "Acres" });
  const districts = useMemo(() => (form.state ? STATE_DISTRICTS_DATA[form.state] || [] : []), [form.state]);
  const strength = passwordScore(form.password);

  useEffect(() => { if (authModalMode) setMode(authModalMode); }, [authModalMode]);
  useEffect(() => { if (isModalOpen) { setStatusMessage(null); setStep(1); document.body.style.overflow = "hidden"; } return () => { document.body.style.overflow = ""; }; }, [isModalOpen]);
  if (!isModalOpen) return null;

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }));
  const changeMode = (nextMode) => { setMode(nextMode); setStep(1); setStatusMessage(null); };
  const validateStepOne = () => {
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email.trim())) return "Enter your full name and a valid email address.";
    if (!/^\+?91\s?[6-9]\d{9}$/.test(form.phone.replace(/[()-]/g, "").trim())) return "Enter a valid Indian mobile number with +91.";
    if (strength < 3) return "Password needs 8 characters, one capital letter and one number.";
    if (form.password !== form.confirmPassword) return "Passwords do not match.";
    return "";
  };
  const nextStep = () => { const error = step === 1 ? validateStepOne() : ""; if (error) { setStatusMessage({ success: false, message: error }); return; } setStatusMessage(null); setStep((current) => Math.min(3, current + 1)); };
  const handleLoginSubmit = async (event) => {
    event.preventDefault(); setStatusMessage(null);
    const result = await login(loginData.email, loginData.password);
    setStatusMessage(result.success ? { success: true, message: "Signed in successfully. Loading your workspace..." } : { success: false, message: result.error || "Unable to sign in. Check your credentials." });
    if (result.success) setTimeout(handleClose, 700);
  };
  const handleSignupSubmit = async (event) => {
    event.preventDefault();
    if (!termsAccepted || !privacyAccepted) { setStatusMessage({ success: false, message: "Please accept the Terms and Privacy Policy to continue." }); return; }
    const result = await signup({ name: form.name.trim(), full_name: form.name.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), role: form.role, farmName: form.farmName.trim(), farm_name: form.farmName.trim(), location: [form.village, form.district, form.state].filter(Boolean).join(", "), state: form.state, district: form.district, village: form.village, farmArea: form.farmArea ? Number(form.farmArea) : null, farmAreaUnit: form.farmAreaUnit, password: form.password });
    setStatusMessage(result.success ? { success: true, message: "Account created. Your private farm workspace is ready." } : { success: false, message: result.error || "Registration failed. Please try again." });
    if (result.success) setTimeout(handleClose, 900);
  };
  const field = ({ id, label, type = "text", value, onChange, placeholder, icon: Icon, required = false, autoComplete }) => <label className="registration-field" htmlFor={id}><span>{Icon && <Icon />} {label}{required && <em>*</em>}</span><input id={id} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} autoComplete={autoComplete} /></label>;

  return (
    <div className="registration-overlay">
      <img className="registration-background-image" src="/images/login-signup-bg.png" alt="" aria-hidden="true" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/images/farmer-hero-hd.jpg"; }} />
      <div className={`registration-modal ${isDarkMode ? "dark" : ""}`} role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <header className="registration-topbar"><div className="registration-brand"><span><Sprout /></span><div><strong>AI Crop Profit</strong><small>Grow Smarter. Farm Better.</small></div></div><button type="button" className="registration-help"><Headphones /> <span>Need help?</span></button><button type="button" className="registration-close" onClick={handleClose} aria-label="Close authentication dialog"><X /></button></header>
        <div className="registration-layout">
          <aside className="registration-aside"><p className="registration-kicker"><Sprout /> Precision Agriculture Platform</p><h2>Grow smarter with <strong>AI-powered</strong> farming.</h2><p>Plan crops, understand your farm and make better decisions from one secure workspace.</p><ul><li><span><Sprout /></span><b>AI Crop<br />Recommendations</b></li><li><span><BarChart3 /></span><b>Smart Farm<br />Management</b></li><li><span><TrendingUp /></span><b>Better Profit<br />Insights</b></li></ul></aside>
          <section className="registration-panel">
            <div className="registration-tabs" role="tablist" aria-label="Authentication mode"><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => changeMode("signup")} role="tab" aria-selected={mode === "signup"}><UserRoundPlus /> Sign Up</button><button type="button" className={mode === "login" ? "active" : ""} onClick={() => changeMode("login")} role="tab" aria-selected={mode === "login"}><ArrowRight /> Log In</button></div>
            {mode === "login" ? <>
              <div className="registration-heading"><p className="registration-kicker">Welcome back</p><h1 id="registration-title">Sign in to your workspace</h1><p>Use your registered account to continue.</p></div>
              {statusMessage && <StatusMessage {...statusMessage} />}
              <form onSubmit={handleLoginSubmit} className="registration-form">
                {field({ id: "loginEmail", label: "Email address", type: "email", value: loginData.email, onChange: (e) => setLoginData({ ...loginData, email: e.target.value }), placeholder: "you@example.com", icon: Mail, required: true, autoComplete: "email" })}
                <label className="registration-field"><span><LockKeyhole /> Password</span><div className="registration-password-wrap"><input type={showPassword ? "text" : "password"} value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} placeholder="Enter your password" required autoComplete="current-password" /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label="Toggle password visibility">{showPassword ? <EyeOff /> : <Eye />}</button></div></label>
                <div className="registration-login-options"><label className="registration-check-label"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /><span>Remember me</span></label><button type="button" className="registration-link-button" onClick={() => setStatusMessage({ success: false, message: "Password recovery needs the configured email reset service before it can be used." })}>Forgot password?</button></div>
                <button className="registration-primary" type="submit" disabled={isSaving}>{isSaving ? "Signing in..." : "Sign in"}<ArrowRight /></button>
              </form><div className="registration-switch">New to AI Crop Profit? <button type="button" onClick={() => changeMode("signup")}>Create an account</button></div>
            </> : <>
              <div className="registration-heading"><p className="registration-kicker">Create your account</p><h1 id="registration-title">Start your farm workspace</h1><p>Complete the essentials now. You can refine your profile later.</p></div>
              <div className="registration-steps" aria-label="Registration progress">{["Account", "Farm profile", "Review"].map((label, index) => <div key={label} className={step >= index + 1 ? "active" : ""}><span>{step > index + 1 ? <Check /> : index + 1}</span><small>{label}</small></div>)}</div>
              {statusMessage && <StatusMessage {...statusMessage} />}
              <form onSubmit={step === 3 ? handleSignupSubmit : (e) => { e.preventDefault(); nextStep(); }} className="registration-form">
                {step === 1 && <div className="registration-grid">{field({ id: "signupName", label: "Full name", value: form.name, onChange: (e) => update("name", e.target.value), placeholder: "Your name", icon: User, required: true, autoComplete: "name" })}{field({ id: "signupEmail", label: "Email address", type: "email", value: form.email, onChange: (e) => update("email", e.target.value), placeholder: "you@example.com", icon: Mail, required: true, autoComplete: "email" })}{field({ id: "signupPhone", label: "Mobile number (+91)", type: "tel", value: form.phone, onChange: (e) => update("phone", e.target.value), placeholder: "+91 9876543210", icon: Phone, required: true, autoComplete: "tel" })}<label className="registration-field"><span><LockKeyhole /> Password<em>*</em></span><div className="registration-password-wrap"><input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="At least 8 characters" required autoComplete="new-password" /><button type="button" onClick={() => setShowPassword((v) => !v)}>{showPassword ? <EyeOff /> : <Eye />}</button></div><div className="password-meter">{[1, 2, 3, 4].map((item) => <i key={item} className={strength >= item ? `score-${strength}` : ""} />)}</div><small>{strength >= 4 ? "Strong password" : strength >= 2 ? "Good password" : "Use 8+ chars, a capital and a number"}</small></label>{field({ id: "signupConfirmPassword", label: "Confirm password", type: showConfirmPassword ? "text" : "password", value: form.confirmPassword, onChange: (e) => update("confirmPassword", e.target.value), placeholder: "Repeat password", icon: LockKeyhole, required: true, autoComplete: "new-password" })}<button type="button" className="registration-eye-secondary" onClick={() => setShowConfirmPassword((v) => !v)}>{showConfirmPassword ? "Hide" : "Show"} confirmation</button></div>}
                {step === 2 && <div className="registration-grid"><label className="registration-field"><span><UserRoundPlus /> Account role<em>*</em></span><select value={form.role} onChange={(e) => update("role", e.target.value)}>{ROLE_OPTIONS.map((option) => <option key={option}>{option}</option>)}</select></label>{field({ id: "signupFarm", label: "Farm name (optional)", value: form.farmName, onChange: (e) => update("farmName", e.target.value), placeholder: "Your farm or estate", icon: Sprout })}<label className="registration-field"><span><MapPin /> State</span><select value={form.state} onChange={(e) => { update("state", e.target.value); update("district", ""); }}><option value="">Select state</option>{Object.keys(STATE_DISTRICTS_DATA).map((state) => <option key={state}>{state}</option>)}</select></label><label className="registration-field"><span><MapPin /> District</span><select value={form.district} onChange={(e) => update("district", e.target.value)} disabled={!form.state}><option value="">Select district</option>{districts.map((district) => <option key={district}>{district}</option>)}</select></label>{field({ id: "signupVillage", label: "Village / city (optional)", value: form.village, onChange: (e) => update("village", e.target.value), placeholder: "Village or city", icon: MapPin })}{field({ id: "signupArea", label: "Farm area (optional)", type: "number", value: form.farmArea, onChange: (e) => update("farmArea", e.target.value), placeholder: "e.g. 12.5", icon: Sprout })}<label className="registration-field"><span>Land area unit</span><select value={form.farmAreaUnit} onChange={(e) => update("farmAreaUnit", e.target.value)}>{AREA_UNITS.map((unit) => <option key={unit}>{unit}</option>)}</select></label></div>}
                {step === 3 && <div className="registration-review">{[["Full name", form.name], ["Email", form.email], ["Mobile", form.phone], ["Role", form.role], ["Farm", form.farmName], ["Location", [form.village, form.district, form.state].filter(Boolean).join(", ")]].filter(([, value]) => value).map(([label, value]) => <div className="registration-review-row" key={label}><span>{label}</span><strong>{value}</strong></div>)}<label className="registration-consent"><input type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} /><span>I agree to the Terms &amp; Conditions.</span></label><label className="registration-consent"><input type="checkbox" checked={privacyAccepted} onChange={(e) => setPrivacyAccepted(e.target.checked)} /><span>I agree to the Privacy Policy and required data storage.</span></label></div>}
                <div className="registration-actions">{step > 1 && <button type="button" className="registration-secondary" onClick={() => setStep((current) => current - 1)}><ArrowLeft /> Back</button>}<button type="submit" className="registration-primary" disabled={isSaving}>{isSaving ? "Creating account..." : step === 3 ? "Create my account" : "Continue"}<ArrowRight /></button></div>
              </form><div className="registration-switch">Already have an account? <button type="button" onClick={() => changeMode("login")}>Sign in</button></div>
            </>}
          </section>
        </div>
      </div>
    </div>
  );
}

function StatusMessage({ success, message }) { return <div className={`registration-status ${success ? "success" : "error"}`}>{success ? <CheckCircle2 /> : <AlertCircle />}<span>{message}</span></div>; }

export default UserSwitcherModal;
