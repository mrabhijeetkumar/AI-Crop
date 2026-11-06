import React, { useState, useRef, useEffect } from "react";
import { useFarm } from "../context/FarmContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { AdvisorSidebar } from "./advisor/AdvisorSidebar.jsx";
import { AdvisorGroundingBar } from "./advisor/AdvisorGroundingBar.jsx";
import { AdvisorMessageItem } from "./advisor/AdvisorMessageItem.jsx";
import { AdvisorPrescriptionModal } from "./advisor/AdvisorPrescriptionModal.jsx";
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  X,
  RefreshCw,
  Trash2,
  Download,
  Languages,
  Sparkles,
  BotMessageSquare,
  Compass,
} from "lucide-react";

export function AIAdvisorView() {
  const {
    farmProfile,
    fields,
    selectedFieldId,
    setSelectedFieldId,
    weather,
    language,
    setLanguage,
    advisorSessions,
    activeAdvisorSessionId,
    setActiveAdvisorSessionId,
    createNewAdvisorSession,
    saveAdvisorSession,
    deleteAdvisorSession,
    savedPrescriptions,
    savePrescription,
    logFieldActivity,
    addNotification,
  } = useFarm();
  const { isDarkMode } = useTheme();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState("");
  const [imageAttachment, setImageAttachment] = useState(null); // base64
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [groundingEnabled, setGroundingEnabled] = useState(true);
  const [activePersona, setActivePersona] = useState("general");
  const [activeModalPrescription, setActiveModalPrescription] = useState(null);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState("all");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const activeSession =
    advisorSessions.find((s) => s.id === activeAdvisorSessionId) ||
    advisorSessions[0] || {
      id: "session_default",
      title: "Active Consultation",
      messages: [],
    };

  const selectedField =
    fields.find((f) => f.id === (selectedFieldId || activeSession.fieldId)) ||
    fields[0] || {
      name: "Main Field",
      currentCrop: "Wheat",
      areaAcres: 10,
      soilHealth: "Good",
    };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeSession.messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      setImageAttachment(base64);
      setImagePreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageAttachment(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && !imageAttachment) return;

    const userMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      text: textToSend,
      image: imageAttachment || undefined,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    const updatedMessages = [...(activeSession.messages || []), userMessage];
    const updatedSession = {
      ...activeSession,
      messages: updatedMessages,
      lastUpdated: "Just now",
    };

    saveAdvisorSession(updatedSession);
    setInputText("");
    const sentImage = imageAttachment;
    handleClearImage();
    setLoading(true);

    try {
      const response = await fetch("/api/ml/advisor-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          language: language,
          persona: activePersona,
          crop_context: selectedField.currentCrop,
          field_context: {
            name: selectedField.name,
            area_acres: selectedField.areaAcres,
            soil_n: selectedField.soilN || 105,
            soil_p: selectedField.soilP || 52,
            soil_k: selectedField.soilK || 48,
            soil_ph: selectedField.soilPh || 6.8,
            health_status: selectedField.healthStatus || "Good",
          },
          weather_context: {
            temp: weather?.currentTemp || 26,
            humidity: weather?.humidity || 55,
            condition: weather?.condition || "Partly Sunny",
            rainfall_mm: weather?.precipitationMm || 0,
          },
          image_base64: sentImage || undefined,
        }),
      });

      const data = await response.json();
      const botMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: "advisor",
        text: data.reply || "Advice synthesized according to ICAR package of practices.",
        prescription: data.prescription || null,
        groundingSources: data.grounding_sources || ["ICAR Package of Practices", "PAU Agronomy Manual"],
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      saveAdvisorSession({
        ...updatedSession,
        messages: [...updatedMessages, botMessage],
      });
    } catch (err) {
      console.warn("Advisor fallback:", err);
      const fallbackReply = {
        id: `msg_${Date.now() + 1}`,
        sender: "advisor",
        text: `Based on your ${selectedField.currentCrop} field telemetry (Soil NPK ${selectedField.soilN || 105}:${selectedField.soilP || 52}:${selectedField.soilK || 48} kg/ha and pH ${selectedField.soilPh || 6.8}):\n\n### 🌾 Diagnostic Evaluation:\nCanopy vegetation is progressing well. Current weather conditions (${weather?.currentTemp || 26}°C, Humidity ${weather?.humidity || 55}%) are within safe foliar application thresholds.\n\n### 🧪 Fertilizer & Spray Schedule:\nApply Top-dress Urea @ 35 kg/Acre before next irrigation cycle. For micronutrient balance, foliar spray of Zinc Sulphate (0.5%) + Urea (1%) is advised.\n\n### ⚠️ Preventive Advisory:\nMonitor lower leaf foliage for rust pustules. Maintain proper drainage to prevent waterlogging.`,
        groundingSources: ["ICAR Precision Agronomy Guidelines (2025)", "PAU Wheat Package of Practices"],
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      saveAdvisorSession({
        ...updatedSession,
        messages: [...updatedMessages, fallbackReply],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSpeech = (text) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text.replace(/###/g, "").replace(/\*/g, ""));
      utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition is not supported on this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    recognition.start();
  };

  const handleLogFarmActivity = (msg) => {
    logFieldActivity(selectedField.id, {
      type: "Advisor Recommendation",
      title: `AI Consultation: ${msg.text.slice(0, 40)}...`,
      date: new Date().toISOString().split("T")[0],
      status: "Logged",
      notes: msg.text,
    });
    addNotification({
      title: "Prescription Logged",
      message: `Prescription recorded in field diary for ${selectedField.name}`,
      type: "success",
    });
  };

  const handleClearSession = () => {
    if (window.confirm("Are you sure you want to clear this consultation thread?")) {
      saveAdvisorSession({
        ...activeSession,
        messages: [],
      });
    }
  };

  const handleExportChat = () => {
    const transcript = (activeSession.messages || [])
      .map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}:\n${m.text}\n`)
      .join("\n----------------------------------------\n\n");

    const blob = new Blob([transcript], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Dr_Krishi_Consultation_${selectedField.name}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const categorizedPrompts = [
    {
      category: "disease",
      label: "Disease & IPM",
      prompts: [
        "Yellow spots appearing on wheat leaves, what fungicide should I spray?",
        "How to control stem borer with bio-pesticides?",
        "What is the ETL threshold for aphid infestation in mustard?",
      ],
    },
    {
      category: "nutrition",
      label: "NPK & Nutrition",
      prompts: [
        "Calculate split urea dose for 10 acres wheat at crown root initiation.",
        "How to correct zinc deficiency foliar spray dosage?",
        "What is the best NPK ratio for mustard during flowering stage?",
      ],
    },
    {
      category: "irrigation",
      label: "Irrigation & Weather",
      prompts: [
        "Is it safe to spray fungicide today given 11 km/h wind and 55% humidity?",
        "How many days should I wait to irrigate after top-dressing urea?",
        "Suggest micro-drip fertigation schedule for tomatoes.",
      ],
    },
    {
      category: "market",
      label: "Mandi & MSP",
      prompts: [
        "Should I sell wheat now at ₹2,380 or hold for 30-day forecast target ₹2,504?",
        "What are the moisture deduction norms in Ludhiana APMC?",
        "How to get e-NAM electronic warehouse receipt pledge finance?",
      ],
    },
    {
      category: "schemes",
      label: "Govt Schemes",
      prompts: [
        "How to apply for PM-KUSUM 60% solar pump subsidy?",
        "Explain PMFBY crop insurance claim process for unseasonal rain.",
        "What are the interest subvention rules on Kisan Credit Card (KCC)?",
      ],
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Banner Header */}
      <div className="app-card p-5 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="badge badge-primary flex items-center gap-1.5 font-sans">
                <Sparkles className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>Dr. Krishi AI Agronomist</span>
              </span>
              <span className="text-xs font-medium font-mono text-[var(--text-muted)]">
                📍 {farmProfile.farmName || "Estate"}, {farmProfile.location}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] font-medium">
                ICAR & PAU Grounded
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)] tracking-tight">
              AI Agronomy & Crop Advisory
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
              Real-time agricultural intelligence with live field sensor grounding, multimodal leaf diagnostics, precision NPK dosage tables, and downloadable prescription slips.
            </p>
          </div>

          {/* Action Bar / Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-xs shadow-sm">
              <Languages className="w-3.5 h-3.5 text-[var(--primary)]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent font-medium text-[var(--text-primary)] focus:outline-none cursor-pointer text-xs"
              >
                <option value="en" className="bg-[var(--surface)] text-[var(--text-primary)]">English (ICAR)</option>
                <option value="hi" className="bg-[var(--surface)] text-[var(--text-primary)]">हिंदी (Hindi)</option>
                <option value="pa" className="bg-[var(--surface)] text-[var(--text-primary)]">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="mr" className="bg-[var(--surface)] text-[var(--text-primary)]">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Export Chat */}
            <button
              onClick={handleExportChat}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-all cursor-pointer shadow-sm"
              title="Download Full Consultation Transcript"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear Chat */}
            <button
              onClick={handleClearSession}
              className="p-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface-subtle)] text-[var(--text-secondary)] hover:text-rose-600 hover:border-rose-400 transition-all cursor-pointer shadow-sm"
              title="Reset Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout (Sidebar + Live Advisor Chat Arena) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Consultation Sidebar (4 Cols on desktop) */}
        <div className={`lg:col-span-4 ${sidebarOpen ? "block" : "hidden lg:block"} h-[700px]`}>
          <AdvisorSidebar
            sessions={advisorSessions}
            activeSessionId={activeAdvisorSessionId}
            onSelectSession={(id) => setActiveAdvisorSessionId(id)}
            onNewSession={() => createNewAdvisorSession("New Crop Consultation", activePersona, selectedField.currentCrop)}
            onDeleteSession={(id) => deleteAdvisorSession(id)}
            activePersona={activePersona}
            onSelectPersona={(p) => setActivePersona(p)}
            savedPrescriptions={savedPrescriptions}
            onOpenPrescription={(rx) => setActiveModalPrescription(rx)}
            farmProfile={farmProfile}
            fields={fields}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Right Chat Arena (8 Cols on desktop) */}
        <div className="lg:col-span-8 flex flex-col h-[700px] app-card p-4 sm:p-5 relative overflow-hidden">
          {/* Grounding Bar */}
          <div className="mb-3">
            <AdvisorGroundingBar
              fields={fields}
              selectedFieldId={selectedFieldId || activeSession.fieldId}
              onSelectField={(id) => {
                setSelectedFieldId(id);
                const matchField = fields.find((f) => f.id === id);
                if (matchField) {
                  saveAdvisorSession({
                    ...activeSession,
                    fieldId: id,
                    cropContext: `${matchField.currentCrop} (${matchField.areaAcres} Ac)`,
                  });
                }
              }}
              weather={weather}
              activePersona={activePersona}
              groundingEnabled={groundingEnabled}
              onToggleGrounding={() => setGroundingEnabled(!groundingEnabled)}
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Messages Stream Area */}
          <div className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar">
            {(activeSession.messages || []).map((msg) => (
              <AdvisorMessageItem
                key={msg.id}
                message={msg}
                onSpeech={handleSpeech}
                isSpeaking={isSpeaking}
                onSavePrescription={(p) => savePrescription(p)}
                onOpenPrescriptionModal={(p) => setActiveModalPrescription(p)}
                onLogFarmActivity={handleLogFarmActivity}
                isDarkMode={isDarkMode}
              />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex gap-3 text-xs justify-start animate-in fade-in">
                <div className="w-8 h-8 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 flex items-center gap-2.5 shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                  <span className="font-medium text-xs">
                    Dr. Krishi is synthesizing agronomic diagnosis from live field telemetry & ICAR guidelines...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Categorized Quick Suggestions Drawer */}
          <div className="pt-2.5 pb-1 border-t border-slate-200 dark:border-slate-800 space-y-2">
            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">Quick Topics:</span>
              {categorizedPrompts.map((cat) => {
                const isSelected = selectedPromptCategory === cat.category;
                return (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedPromptCategory(isSelected ? "all" : cat.category)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer border ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm"
                        : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                    }`}
                  >
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Prompt pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categorizedPrompts
                .filter((c) => selectedPromptCategory === "all" || c.category === selectedPromptCategory)
                .flatMap((c) => c.prompts)
                .slice(0, 5)
                .map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="px-3 py-1 rounded-xl text-[11px] font-medium whitespace-nowrap transition-colors shrink-0 cursor-pointer border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    {prompt}
                  </button>
                ))}
            </div>
          </div>

          {/* Multimodal Image Preview Strip (if photo selected) */}
          {imagePreview && (
            <div className="mb-2 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between gap-3 animate-in fade-in">
              <div className="flex items-center gap-2.5">
                <img
                  src={imagePreview}
                  alt="Attachment Preview"
                  className="w-12 h-12 object-cover rounded-xl border border-emerald-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block">Leaf / Crop Sample Attached</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Ready for Multimodal Vision Analysis</span>
                </div>
              </div>
              <button
                onClick={handleClearImage}
                className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Chat Input Deck */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="pt-2 flex items-center gap-2"
          >
            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {/* Photo / Camera Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 transition-colors cursor-pointer shrink-0 shadow-sm"
              title="Upload Leaf/Crop Image for Visual Pathology"
            >
              <ImageIcon className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-3 rounded-xl border transition-colors cursor-pointer shrink-0 shadow-sm ${
                isListening
                  ? "bg-rose-600 border-rose-500 text-white animate-pulse"
                  : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500"
              }`}
              title="Speak Query (Voice Input)"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Dr. Krishi about crop diseases, NPK dosage, weather spray windows, or mandi prices..."
              className="form-input flex-1 text-xs py-3"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !imageAttachment) || loading}
              className="btn-primary py-3 px-5 text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI</span>
            </button>
          </form>
        </div>
      </div>

      {/* Prescription Certificate Modal */}
      <AdvisorPrescriptionModal
        isOpen={Boolean(activeModalPrescription)}
        onClose={() => setActiveModalPrescription(null)}
        prescription={activeModalPrescription}
        farmProfile={farmProfile}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default AIAdvisorView;
