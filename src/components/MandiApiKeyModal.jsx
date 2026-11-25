import React, { useState } from "react";
import { Key, X, CheckCircle2, AlertCircle, ExternalLink, Shield, RefreshCw, Eye, EyeOff } from "lucide-react";

export function MandiApiKeyModal({
  isOpen,
  onClose,
  apiKey,
  setApiKey,
  isDarkMode,
  language = "en",
  onSaved,
}) {
  const [tempKey, setTempKey] = useState(apiKey || "");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isHindi = language === "hi";

  const handleSave = () => {
    const cleanKey = tempKey.trim();
    setApiKey(cleanKey);
    try {
      if (cleanKey) {
        localStorage.setItem("aicrop_mandi_key", cleanKey);
      } else {
        localStorage.removeItem("aicrop_mandi_key");
      }
    } catch (e) {
      console.warn("Could not save to localStorage:", e);
    }
    if (onSaved) onSaved(cleanKey);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!tempKey.trim()) {
      setTestResult({
        success: false,
        message: isHindi ? "कृपया पहले API Key दर्ज करें।" : "Please enter an API key first.",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch(`/api/market?state=Bihar&district=Rohtas&apiKey=${encodeURIComponent(tempKey.trim())}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTestResult({
            success: true,
            message: isHindi
              ? `सफलता! ${data.length} लाइव APMC रिकॉर्ड सफलतापूर्वक प्राप्त हुए।`
              : `Success! ${data.length} live APMC commodity records retrieved.`,
          });
        } else {
          setTestResult({
            success: true,
            message: isHindi
              ? "API Key सक्रिय है और कनेक्शन स्थापित हो गया है।"
              : "API Key is valid and endpoint connected successfully.",
          });
        }
      } else {
        setTestResult({
          success: false,
          message: isHindi ? "API सर्वर से त्रुटि प्राप्त हुई। कुंजी की जांच करें।" : "Server returned an error. Please verify your API Key.",
        });
      }
    } catch (e) {
      setTestResult({
        success: false,
        message: isHindi ? "कनेक्शन परीक्षण विफल रहा।" : "Connection test failed. Check network.",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    setTempKey("");
    setApiKey("");
    try {
      localStorage.removeItem("aicrop_mandi_key");
    } catch {}
    setTestResult({
      success: true,
      message: isHindi ? "API Key हटा दी गई है। अब मानक डेटा का उपयोग होगा।" : "API Key cleared. Defaulting to built-in telemetry.",
    });
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto overscroll-contain animate-in fade-in">
      <div
        className="w-full max-w-lg my-auto rounded-2xl border border-[var(--border)] bg-[var(--surface-modal)] text-[var(--text-primary)] shadow-2xl overflow-hidden transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-modal)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-heading font-bold text-[var(--text-primary)]">
                {isHindi ? "मंडी / e-NAM API कुंजी कॉन्फ़िगरेशन" : "Mandi / e-NAM API Key Setup"}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {isHindi ? "लाइव सरकारी डेटा (Data.gov.in / Agmarknet)" : "Live Government Data (Data.gov.in / Agmarknet)"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[var(--text-secondary)] block">
              {isHindi ? "Data.gov.in / Agmarknet API Key:" : "Data.gov.in / Agmarknet API Key:"}
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={tempKey}
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="e.g. 579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b"
                className="form-input w-full pr-12 font-mono text-xs"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isHindi
                ? "यह कुंजी सीधे सरकारी एपीआई से लाइव मंडी आवक और दैनिक भाव लाने के लिए सुरक्षित रूप से उपयोग की जाती है।"
                : "This key enables high-frequency live telemetry directly from official Government APMC mandi feeds."}
            </p>
          </div>

          {/* Test connection results */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                testResult.success
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Guide for obtaining API Key */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs space-y-2">
            <div className="flex items-center gap-2 font-heading font-bold text-[var(--text-primary)]">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>{isHindi ? "मुफ्त सरकारी API Key कैसे प्राप्त करें?" : "How to get a Free Government API Key?"}</span>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--text-secondary)] pl-1">
              <li>{isHindi ? "data.gov.in पर जाएं और निशुल्क खाता बनाएं" : "Visit data.gov.in and create a free developer account"}</li>
              <li>{isHindi ? "My Account -> API Keys में जाकर नई Key जनरेट करें" : "Navigate to My Account -> API Keys and generate a token"}</li>
              <li>{isHindi ? "उस कुंजी को कॉपी करके यहां पेस्ट करें" : "Copy the generated key and paste it above"}</li>
            </ol>
            <a
              href="https://data.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-semibold pt-1"
            >
              <span>{isHindi ? "Data.gov.in पोर्टल खोलें" : "Open Data.gov.in Portal"}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--border)] bg-[var(--surface-subtle)]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="btn-secondary text-xs flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin text-emerald-500" : ""}`} />
              <span>{testing ? (isHindi ? "जांच हो रही है..." : "Testing...") : (isHindi ? "परीक्षण करें" : "Test Key")}</span>
            </button>
            {tempKey && (
              <button
                onClick={handleClear}
                className="text-xs text-rose-500 hover:text-rose-600 font-semibold px-2 py-1"
              >
                {isHindi ? "हटाएं" : "Clear"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="btn-ghost text-xs"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              onClick={handleSave}
              className="btn-primary text-xs"
            >
              {isHindi ? "सहेजें और लागू करें" : "Save & Apply"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
