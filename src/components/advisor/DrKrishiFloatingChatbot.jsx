// src/components/advisor/DrKrishiFloatingChatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import { Send, X, Minus, Sparkles, RefreshCw, Copy, Check, Sprout, BookmarkPlus } from "lucide-react";
import { useFarm } from "../../context/FarmContext.jsx";
import { RichText } from "./RichText.jsx";
import { askDrKrishi, buildFarmContext, prescriptionToRecord, OFFLINE_REPLY } from "../../utils/advisorApi.js";

const AVATAR = "/images/dr-krishi-avatar-portrait.png";
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

const SUGGESTIONS = [
  { icon: "🌾", text: "Which crop gives highest profit?" },
  { icon: "💰", text: "How to increase wheat yield?" },
  { icon: "🧪", text: "Recommended NPK fertilizer dose?" },
  { icon: "🛡️", text: "How to prevent leaf rust disease?" },
];

function BotAvatar({ className = "w-6 h-6" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={`${className} rounded-full overflow-hidden border border-emerald-500/40 shrink-0 bg-emerald-700 flex items-center justify-center`}>
      {failed ? (
        <Sprout className="w-3/5 h-3/5 text-white" />
      ) : (
        <img src={AVATAR} alt="Dr. Krishi" onError={() => setFailed(true)} className="w-full h-full object-cover object-center" />
      )}
    </div>
  );
}

export function DrKrishiFloatingChatbot({ isOpen: controlledIsOpen, onToggle: controlledOnToggle }) {
  const { farmProfile = {}, fields = [], weather = {}, savePrescription } = useFarm();
  const activeCrop = fields[0]?.currentCrop || "Wheat (HD-2967)";
  const locationName = farmProfile.location || farmProfile.district || "your farm";

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const setOpen = (v) => (controlledOnToggle ? controlledOnToggle(v) : setInternalOpen(v));

  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [savedIds, setSavedIds] = useState({});

  const welcome = () => ({
    id: `welcome_${Date.now()}`,
    sender: "bot",
    text: `Namaste ${farmProfile.ownerName ? farmProfile.ownerName.split(" ")[0] : ""}! Main **Dr. Krishi AI** hoon. Fasal, khad, bimari ya mandi bhav – kuch bhi poochhiye.`,
    timestamp: nowTime(),
  });
  const [messages, setMessages] = useState(() => [welcome()]);

  const endRef = useRef(null);
  const inputRef = useRef(null);
  const loadingRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    if (isOpen && !isMinimized) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, isOpen, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized) setTimeout(() => inputRef.current?.focus(), 150);
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleSend = async (textToSend) => {
    const query = (textToSend ?? input).trim();
    if (!query || loadingRef.current) return;

    const userMsg = { id: `user_${Date.now()}`, sender: "user", text: query, timestamp: nowTime() };
    const history = [...messagesRef.current, userMsg];
    setMessages(history);
    setInput("");
    loadingRef.current = true;
    setLoading(true);

    let botMsg;
    try {
      const { text, prescription } = await askDrKrishi({
        message: query,
        farmContext: buildFarmContext({ farmProfile, fields, weather, crop: activeCrop }),
        history,
      });
      botMsg = { id: `bot_${Date.now()}`, sender: "bot", text, prescription, timestamp: nowTime() };
    } catch (err) {
      console.warn("Dr. Krishi request failed:", err?.message || err);
      botMsg = { id: `bot_${Date.now()}`, sender: "bot", text: OFFLINE_REPLY, timestamp: nowTime() };
    }
    setMessages((prev) => [...prev, botMsg]);
    loadingRef.current = false;
    setLoading(false);
  };

  // Always point to the latest closure (the window event listener is registered only once)
  const sendRef = useRef(handleSend);
  sendRef.current = handleSend;

  useEffect(() => {
    const onOpen = (e) => {
      setOpen(true);
      setIsMinimized(false);
      if (e.detail?.prompt) setTimeout(() => sendRef.current?.(e.detail.prompt), 60);
    };
    window.addEventListener("open-dr-krishi", onOpen);
    return () => window.removeEventListener("open-dr-krishi", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const copy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch { /* clipboard blocked */ }
  };

  const savePres = async (msg) => {
    await savePrescription?.(prescriptionToRecord(msg.prescription, activeCrop));
    setSavedIds((s) => ({ ...s, [msg.id]: true }));
  };

  const panelPos = "right-4 bottom-24 sm:right-[28px] sm:bottom-[104px]";

  return (
    <>
      {isOpen && (
        <div
          role="dialog"
          aria-label="Dr. Krishi AI Chatbot"
          className={`fixed z-50 transition-all duration-300 ease-out flex flex-col overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-slate-900/20 dark:shadow-black/60 ${panelPos} ${isMinimized
              ? "h-14 w-[320px] rounded-2xl"
              : "w-[380px] h-[560px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-130px)] rounded-[20px]"
            }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#15803D] via-[#16A34A] to-[#22C55E] text-white px-4 py-3.5 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2.5">
              <BotAvatar className="w-9 h-9" />
              <div>
                <div className="flex items-center gap-1.5 leading-tight">
                  <h3 className="text-sm font-bold font-heading">Dr. Krishi AI</h3>
                  <span className="inline-flex items-center gap-1 px-1.5 rounded-full bg-white/20 text-[9.5px] font-semibold text-emerald-50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Online
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100">AI Farming Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized((p) => !p)} className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer" title={isMinimized ? "Expand" : "Minimize"}>
                <Minus className="w-4 h-4 stroke-[2.5]" />
              </button>
              <button onClick={() => setOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center cursor-pointer" title="Close">
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/60 dark:bg-slate-950/40 text-xs">
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-medium min-w-0">
                    <Sprout className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                    <span className="truncate">Synced with {locationName} • {activeCrop}</span>
                  </span>
                  <span className="text-[10px] font-bold shrink-0">24/7 AI</span>
                </div>

                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div key={msg.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"} group`}>
                      <div className="flex items-end gap-1.5 max-w-[92%]">
                        {!isUser && <BotAvatar className="w-6 h-6 mb-0.5" />}
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed break-words shadow-2xs relative ${isUser
                              ? "bg-[#15803D] text-white rounded-tr-sm"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-sm"
                            }`}
                        >
                          {isUser ? <div className="whitespace-pre-wrap">{msg.text}</div> : <RichText text={msg.text} />}

                          {!isUser && (
                            <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 opacity-80">
                              <button onClick={() => copy(msg.id, msg.text)} className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer">
                                {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                {copiedId === msg.id ? "Copied" : "Copy"}
                              </button>
                              {msg.prescription && (
                                <button
                                  onClick={() => savePres(msg)}
                                  disabled={savedIds[msg.id]}
                                  className="inline-flex items-center gap-1 text-[10px] text-[#15803D] hover:underline disabled:opacity-60 cursor-pointer"
                                >
                                  <BookmarkPlus className="w-3 h-3" />
                                  {savedIds[msg.id] ? "Saved" : "Save prescription"}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="text-[9.5px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-end gap-1.5 max-w-[85%]">
                    <BotAvatar className="w-6 h-6 mb-0.5" />
                    <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-2xs">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                      <span className="text-[11px] ml-1 font-medium text-slate-400">Thinking…</span>
                    </div>
                  </div>
                )}
                <div ref={endRef} />
              </div>

              {messages.length <= 2 && (
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s.text}
                      onClick={() => handleSend(s.text)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-[#15803D] hover:border-emerald-300 text-[11px] font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                    >
                      {s.icon} {s.text}
                    </button>
                  ))}
                </div>
              )}

              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800 shrink-0">
                <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask Dr. Krishi anything…"
                    disabled={loading}
                    className="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading}
                    className="h-10 w-10 rounded-xl bg-[#15803D] hover:bg-[#16A34A] text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer disabled:opacity-40"
                    title="Send"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 px-1">
                  <span>AI advice – spray/dose se pehle label &amp; KVK se confirm karein</span>
                  <button onClick={() => setMessages([welcome()])} className="hover:text-rose-500 transition-colors cursor-pointer">
                    Clear chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Floating launcher */}
      <div className="fixed right-5 bottom-5 sm:right-[28px] sm:bottom-[28px] z-50 group">
        {!isOpen && (
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900/95 text-white text-xs font-semibold whitespace-nowrap shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 hidden sm:flex items-center gap-1.5" aria-hidden="true">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> <span>Ask Dr. Krishi AI</span>
          </div>
        )}
        <button
          onClick={() => { setOpen(!isOpen); setIsMinimized(false); }}
          aria-label={isOpen ? "Close Dr. Krishi AI Chat" : "Ask Dr. Krishi AI"}
          aria-expanded={isOpen}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-[#15803D] via-[#16A34A] to-[#22C55E] p-[3px] border-2 border-white/95 dark:border-slate-800 shadow-xl shadow-emerald-700/35 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center cursor-pointer select-none ring-4 ring-emerald-500/20"
        >
          <div className="w-full h-full rounded-full overflow-hidden relative bg-emerald-800 flex items-center justify-center">
            {isOpen ? (
              <X className="w-6 h-6 sm:w-7 sm:h-7 text-white stroke-[2.5]" />
            ) : (
              <BotAvatar className="w-full h-full border-0" />
            )}
          </div>
          {!isOpen && (
            <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 flex items-center justify-center z-10" title="Online">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
            </span>
          )}
        </button>
      </div>
    </>
  );
}

export default DrKrishiFloatingChatbot;