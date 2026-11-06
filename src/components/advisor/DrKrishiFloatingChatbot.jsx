import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  X,
  Minus,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  Sprout,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";

export function DrKrishiFloatingChatbot({ isOpen: controlledIsOpen, onToggle: controlledOnToggle }) {
  const farm = useFarm();
  const { isDarkMode } = useTheme();
  const farmProfile = farm?.farmProfile || {};
  const fields = farm?.fields || [];
  const weather = farm?.weather || {};
  const activeCrop = fields[0]?.currentCrop || farmProfile?.currentCrop || "Wheat (HD-2967)";
  const locationName = farmProfile?.location || farmProfile?.district || "Phagwara, Punjab";

  // Internal open state if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnToggle !== undefined ? controlledOnToggle : setInternalIsOpen;

  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Initial welcome message
  const [messages, setMessages] = useState([
    {
      id: "welcome_01",
      sender: "bot",
      text: "Namaste! I'm Dr. Krishi AI. How can I help you with your farming today?",
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading, isOpen, isMinimized]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // Listen for custom open event (e.g. from dashboard card or quick questions)
  useEffect(() => {
    const handleOpenChatbot = (e) => {
      setInternalIsOpen(true);
      setIsMinimized(false);
      if (e.detail?.prompt) {
        handleSendMessage(e.detail.prompt);
      }
    };
    window.addEventListener("open-dr-krishi", handleOpenChatbot);
    return () => window.removeEventListener("open-dr-krishi", handleOpenChatbot);
  }, []);

  const quickSuggestions = [
    "🌾 Which crop gives highest profit?",
    "💰 How to increase wheat yield?",
    "🧪 Recommended NPK fertilizer dose?",
    "🛡️ How to prevent leaf rust disease?",
  ];

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      // 1. Try primary advisor endpoint
      let replyText = "";
      try {
        const res = await fetch("/api/advisor/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: query,
            query: query,
            crop: activeCrop,
            location: locationName,
            language: farmProfile?.preferredLanguage || "en",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyText = data.response || data.reply || data.answer || "";
        }
      } catch (err) {
        console.warn("Primary advisor endpoint fallback, trying ml endpoint:", err);
      }

      // 2. If primary returned empty, try /api/ml/advisor-chat
      if (!replyText) {
        try {
          const mlRes = await fetch("/api/ml/advisor-chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: query,
              crop_context: activeCrop,
              field_context: {
                name: fields[0]?.name || "Main Field",
                area_acres: farmProfile?.totalAreaAcres || 5.5,
              },
              weather_context: {
                temp: weather?.currentTemp || 28,
                humidity: weather?.humidity || 65,
              },
            }),
          });
          if (mlRes.ok) {
            const mlData = await mlRes.json();
            replyText = mlData.reply || mlData.response || "";
          }
        } catch (mlErr) {
          console.warn("ML advisor endpoint fallback:", mlErr);
        }
      }

      // 3. Grounded Agricultural Domain Fallback if network/offline
      if (!replyText) {
        replyText = generateGroundedAgronomyResponse(query, activeCrop, locationName);
      }

      const botMsg = {
        id: `bot_${Date.now()}`,
        sender: "bot",
        text: replyText,
        timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: "bot",
          text: generateGroundedAgronomyResponse(query, activeCrop, locationName),
          timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateGroundedAgronomyResponse = (q, crop, loc) => {
    const qLower = q.toLowerCase();
    if (qLower.includes("crop") || qLower.includes("profit") || qLower.includes("best") || qLower.includes("highest")) {
      return `🌾 **Top Crop Recommendation for ${loc}:**\n\n• **Wheat (HD-2967 / HD-3086):** Expected profit **₹25,000 / acre** with 120-140 days duration and assured MSP procurement.\n• **Mustard (Pusa Bold):** Expected profit **₹22,000 / acre** with low water requirement (100-120 days).\n\n💡 *Tip: Sowing within the optimal window increases yield by up to 18%.*`;
    }
    if (qLower.includes("yield") || qLower.includes("increase") || qLower.includes("fertilizer") || qLower.includes("npk")) {
      return `🧪 **Agronomic Yield & Fertilizer Protocol:**\n\n1. **Basal Dose:** Apply 50 kg DAP + 20 kg MOP per acre at final tillage.\n2. **Nitrogen Splits:** Apply Urea in 2 splits (45 kg at 1st irrigation @ 21-25 days; 40 kg at tillering).\n3. **Micronutrient:** Spray Zinc Sulphate (21%) @ 10 kg/acre if leaf chlorosis appears.\n\n💧 *Maintain optimal soil moisture during crown root initiation (CRI).*`;
    }
    if (qLower.includes("disease") || qLower.includes("leaf") || qLower.includes("rust") || qLower.includes("pest")) {
      return `🛡️ **Plant Protection & Disease Management:**\n\n• **Yellow / Brown Rust:** If yellow pustules appear on leaves, spray Propiconazole 25% EC @ 200 ml in 200 liters of water per acre.\n• **Aphids / Sucking Pests:** Spray Imidacloprid 17.8% SL @ 50 ml/acre.\n• **Preventive:** Ensure adequate row aeration and avoid excessive evening irrigation.`;
    }
    if (qLower.includes("mandi") || qLower.includes("price") || qLower.includes("market") || qLower.includes("rate")) {
      return `📈 **APMC Mandi Intelligence:**\n\n• **Wheat:** ₹2,425 / qtl in Ludhiana & Karnal (+2.1% trend above MSP).\n• **Mustard:** ₹6,200 / qtl in Jaipur Mandi (+1.5% premium).\n• **Rice:** ₹3,100 / qtl in regional wholesale yards.\n\n💰 *Advice: Hold 40% harvest stock for 3-4 weeks post-harvest to capture seasonal price peaks.*`;
    }
    return `🌱 **Dr. Krishi Advisory for ${crop}:**\n\nYour crop conditions are looking healthy. Maintain proper irrigation cycles, monitor for early foliar symptoms, and test soil organic carbon annually to sustain high soil fertility and maximize farm profits.\n\nFeel free to ask about specific fertilizers, pest treatments, or mandi wholesale prices!`;
  };

  return (
    <>
      {/* ================= 1. FLOATING CHAT PANEL ================= */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Dr. Krishi AI Chatbot"
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/60 ${
            isMinimized
              ? "h-14 w-[320px] rounded-2xl right-4 bottom-24 sm:right-[28px] sm:bottom-[104px]"
              : "w-[380px] h-[520px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-130px)] rounded-[20px] right-4 bottom-24 sm:right-[28px] sm:bottom-[104px]"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#22C55E] text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none shadow-xs">
            <div className="flex items-center gap-2.5">
              {/* Bot Avatar */}
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/40 shadow-xs shrink-0 bg-slate-900">
                <img
                  src="/images/dr-krishi-avatar-portrait.png"
                  alt="Dr. Krishi AI"
                  className="w-full h-full object-cover object-center"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-emerald-800" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <h3 className="text-sm font-bold font-heading tracking-tight text-white">
                    Dr. Krishi AI
                  </h3>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-white/20 text-[9.5px] font-semibold text-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-normal">
                  AI Farming Assistant
                </p>
              </div>
            </div>

            {/* Action buttons (Minimize & Close) */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title={isMinimized ? "Expand Chat" : "Minimize Chat"}
              >
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Chat Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
                {/* Welcome Card & Context Badge */}
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Sprout className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    Synced with {locationName} • {activeCrop}
                  </span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">24/7 AI</span>
                </div>

                {/* Messages List */}
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"} group`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[88%]">
                        {!isUser && (
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 mb-0.5 bg-slate-900 shadow-2xs">
                            <img
                              src="/images/dr-krishi-avatar-portrait.png"
                              alt="Dr. Krishi"
                              className="w-full h-full object-cover object-center"
                            />
                          </div>
                        )}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-2xs relative ${
                            isUser
                              ? "bg-[#15803D] text-white rounded-tr-xs"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
                          }`}
                        >
                          <div className="whitespace-pre-wrap font-normal">
                            {msg.text}
                          </div>

                          {!isUser && (
                            <button
                              onClick={() => handleCopyMessage(msg.id, msg.text)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 transition-opacity"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                      <span className="text-[9.5px] text-slate-400 mt-1 px-1">
                        {msg.timestamp}
                      </span>
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-500/40 shrink-0 mb-0.5 bg-slate-900 shadow-2xs">
                      <img
                        src="/images/dr-krishi-avatar-portrait.png"
                        alt="Dr. Krishi"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 flex items-center gap-1.5 shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                      <span className="text-[11px] ml-1 font-medium text-slate-400">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none no-scrollbar">
                  {quickSuggestions.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt.replace(/^[^\s]+\s/, ""))}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#15803D] hover:border-emerald-300 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer shadow-2xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask Dr. Krishi anything..."
                    disabled={loading}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D] shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || loading}
                    className="h-10 w-10 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                    title="Send Message"
                  >
                    {loading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </form>

                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
                  <span>Grounded in ICAR &amp; PAU agronomy</span>
                  <button
                    onClick={() =>
                      setMessages([
                        {
                          id: `welcome_${Date.now()}`,
                          sender: "bot",
                          text: "Namaste! I'm Dr. Krishi AI. How can I help you with your farming today?",
                          timestamp: new Date().toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          }),
                        },
                      ])
                    }
                    className="hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Clear chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= 2. CIRCULAR FLOATING CHATBOT BUTTON ================= */}
      <div className="fixed right-5 bottom-5 sm:right-[28px] sm:bottom-[28px] z-50 group">
        {/* Hover Tooltip (Shown on hover when closed) */}
        {!isOpen && (
          <div
            className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0 hidden sm:flex items-center gap-1.5"
            aria-hidden="true"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ask Dr. Krishi AI</span>
            <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 bg-slate-900/95 rotate-45" />
          </div>
        )}

        {/* Circular Floating Button: 64px on desktop, 56px on mobile */}
        <button
          onClick={() => {
            setIsOpen((prev) => !prev);
            setIsMinimized(false);
          }}
          aria-label={isOpen ? "Close Dr. Krishi AI Chat" : "Ask Dr. Krishi AI"}
          aria-expanded={isOpen}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#15803D] via-[#16A34A] to-[#22C55E] p-[3px] border-2 border-white/95 dark:border-slate-800 shadow-xl shadow-emerald-700/35 hover:shadow-2xl hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300 ease-out flex items-center justify-center cursor-pointer select-none ring-4 ring-emerald-500/20 group/btn`}
        >
          {/* Inner Circular Avatar Container */}
          <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-900 flex items-center justify-center shadow-inner">
            <img
              src="/images/dr-krishi-avatar-portrait.png"
              alt="Dr. Krishi AI Assistant"
              className={`w-full h-full object-cover object-center transition-transform duration-300 group-hover/btn:scale-110 ${
                isOpen ? "opacity-35 blur-[1px]" : "opacity-100"
              }`}
            />

            {/* When open: smooth crisp X icon overlay */}
            {isOpen && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-950/70 text-white animate-in fade-in duration-150">
                <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Small Green Online Status Indicator */}
          {!isOpen && (
            <span
              className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center shadow-xs z-10"
              title="Online"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export default DrKrishiFloatingChatbot;

