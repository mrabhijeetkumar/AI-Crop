import React, { useState } from "react";
import {
  BotMessageSquare,
  User,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Share2,
  Bookmark,
  FileText,
  Activity,
  AlertTriangle,
  FlaskConical,
  Sprout,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export function AdvisorMessageItem({
  message,
  onSpeech,
  isSpeaking,
  onSavePrescription,
  onOpenPrescriptionModal,
  onLogFarmActivity,
  isDarkMode = true,
}) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loggedActivity, setLoggedActivity] = useState(false);

  const isAdvisor = message.sender === "advisor";

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBookmark = () => {
    if (message.prescription) {
      onSavePrescription(message.prescription);
    } else {
      // Auto-extract prescription from text
      const mockPres = {
        title: "Agronomic Consultation Note",
        crop: "Farm Crop",
        diagnosis: message.text.slice(0, 120) + "...",
        chemicalRemedy: "As recommended in consultation transcript",
        dosage: "Standard application",
        organicRemedy: "Organic bio-control practice",
        precaution: "Follow safe spraying interval and protective gear.",
        estimatedCost: "₹350 - ₹500 / Acre",
      };
      onSavePrescription(mockPres);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleWhatsApp = () => {
    const cleanText = message.text.replace(/###/g, "").slice(0, 1000);
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
      `🌾 *Dr. Krishi Advisory Note:*\n\n${cleanText}`
    )}`;
    window.open(url, "_blank");
  };

  const handleLogActivity = () => {
    if (onLogFarmActivity) {
      onLogFarmActivity(message);
      setLoggedActivity(true);
      setTimeout(() => setLoggedActivity(false), 3000);
    }
  };

  // Helper to format text with rich agronomical badges and sections
  const renderFormattedText = (rawText) => {
    if (!rawText) return null;
    const lines = rawText.split("\n");

    return lines.map((line, idx) => {
      // Heading 3 (###)
      if (line.startsWith("### ")) {
        const title = line.replace("### ", "").trim();
        let icon = <Sprout className="w-4 h-4 text-emerald-500" />;
        if (title.includes("Chemical") || title.includes("🧪")) icon = <FlaskConical className="w-4 h-4 text-sky-500" />;
        if (title.includes("Organic") || title.includes("🌿")) icon = <Sprout className="w-4 h-4 text-emerald-500" />;
        if (title.includes("Safety") || title.includes("Precaution") || title.includes("⚠️"))
          icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;

        return (
          <div
            key={idx}
            className="my-3 pt-2 pb-1 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs font-bold tracking-wide text-slate-900 dark:text-white"
          >
            {icon}
            <span className="text-emerald-700 dark:text-emerald-400 font-heading">{title}</span>
          </div>
        );
      }

      // Horizontal rules
      if (line.trim() === "---") {
        return <hr key={idx} className="my-2.5 border-slate-200 dark:border-slate-800" />;
      }

      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("• ")) {
        const content = line.replace(/^[-•]\s*/, "");
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs leading-relaxed pl-1 text-slate-700 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formatBold(content) }} />
          </div>
        );
      }

      // Numbered lists (1. , 2. )
      if (/^\d+\.\s/.test(line.trim())) {
        const match = line.trim().match(/^(\d+)\.\s*(.*)/);
        if (match) {
          return (
            <div key={idx} className="flex items-start gap-2 my-1.5 text-xs leading-relaxed pl-1 text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-md font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                {match[1]}
              </span>
              <span dangerouslySetInnerHTML={{ __html: formatBold(match[2]) }} />
            </div>
          );
        }
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      // Standard text line
      return (
        <p
          key={idx}
          className="text-xs leading-relaxed my-0.5 text-slate-700 dark:text-slate-300"
          dangerouslySetInnerHTML={{ __html: formatBold(line) }}
        />
      );
    });
  };

  const escapeHtml = (unsafe) => {
    return (unsafe || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const formatBold = (str) => {
    const safe = escapeHtml(str);
    return safe
      .replace(/\*\*(.*?)\*\*/g, `<strong class="font-bold text-slate-900 dark:text-white">$1</strong>`)
      .replace(/\*(.*?)\*/g, `<em class="text-emerald-700 dark:text-emerald-400 font-medium">$1</em>`)
      .replace(/`([^`]+)`/g, `<code class="px-1.5 py-0.5 rounded font-mono text-[11px] border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-emerald-700 dark:text-emerald-400">$1</code>`);
  };

  return (
    <div
      className={`flex gap-3 text-xs leading-relaxed animate-in fade-in duration-150 ${
        isAdvisor ? "justify-start" : "justify-end"
      }`}
    >
      {/* Advisor Avatar */}
      {isAdvisor && (
        <div className="w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm">
          <BotMessageSquare className="w-4 h-4" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`max-w-[92%] sm:max-w-[80%] rounded-2xl p-4 transition-all ${
          isAdvisor
            ? "app-card border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none shadow-sm"
            : "bg-emerald-600 dark:bg-emerald-500 text-white font-medium rounded-br-none shadow-sm shadow-emerald-950/20"
        }`}
      >
        {/* Top Header inside bubble */}
        <div
          className={`flex items-center justify-between gap-2 border-b pb-1.5 mb-2 ${
            isAdvisor
              ? "border-slate-200 dark:border-slate-800"
              : "border-white/20 text-white"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className={`font-bold text-[11px] ${
              isAdvisor
                ? "text-emerald-700 dark:text-emerald-400 font-heading"
                : "text-white"
            }`}>
              {isAdvisor ? "Dr. Krishi (Senior AI Agronomist)" : "Farmer Query"}
            </span>
            {isAdvisor && message.source && (
              <span className="badge badge-emerald text-[9px] px-1.5 py-0.2">
                {message.source}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-mono ${
            isAdvisor
              ? "text-slate-400 dark:text-slate-500"
              : "text-white/80"
          }`}>
            {message.timestamp}
          </span>
        </div>

        {/* Multimodal Image Attachment Preview */}
        {message.imageUrl && (
          <div className="mb-3 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 max-w-sm">
            <img
              src={message.imageUrl}
              alt="Crop Sample"
              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
            />
            <div className="p-1.5 text-[10px] flex items-center gap-1 bg-slate-900 text-emerald-400">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Diagnosed with Multimodal Vision Grounding</span>
            </div>
          </div>
        )}

        {/* Rendered Text Body */}
        <div className="space-y-1">{isAdvisor ? renderFormattedText(message.text) : message.text}</div>

        {/* Prescription Card Box (if attached) */}
        {message.prescription && (
          <div className="mt-3.5 p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-heading">
                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                <span>Prescription Generated: {message.prescription.targetProblem}</span>
              </span>
              <button
                onClick={() => onOpenPrescriptionModal(message.prescription)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors cursor-pointer"
              >
                View Certificate
              </button>
            </div>
            <div className="text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Chemical Formulation:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{message.prescription.chemicalSpray}</span>
              </div>
              <div className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
                <span className="block text-[10px] text-slate-500 dark:text-slate-400">Dosage / Acre:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">{message.prescription.dosagePerAcre}</span>
              </div>
            </div>
          </div>
        )}

        {/* Message Action Toolbar (Only for Advisor) */}
        {isAdvisor && (
          <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1">
              <button
                onClick={() => onSpeech(message.text)}
                className="p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                title={isSpeaking ? "Stop Speech" : "Read Aloud"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isSpeaking ? "Stop" : "Listen"}</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Copy Text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </button>

              <button
                onClick={handleBookmark}
                className="p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Bookmark Prescription"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{saved ? "Saved" : "Save Rx"}</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleLogActivity}
                className="p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Log as Field Activity in Farm Journal"
              >
                <Activity className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{loggedActivity ? "Logged!" : "Log Activity"}</span>
              </button>

              <button
                onClick={handleWhatsApp}
                className="p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                title="Share on WhatsApp"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAdvisor && (
        <div className="w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 mt-0.5">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

export default AdvisorMessageItem;
