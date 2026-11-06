import React from "react";
import {
  BotMessageSquare,
  Plus,
  MessageSquare,
  Bookmark,
  Trash2,
  Sparkles,
  Stethoscope,
  FlaskConical,
  TrendingUp,
  Landmark,
  ShieldCheck,
  ChevronRight,
  Sprout,
  CheckCircle2,
} from "lucide-react";

export function AdvisorSidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  activePersona = "general",
  onSelectPersona,
  savedPrescriptions = [],
  onOpenPrescription,
  farmProfile,
  fields = [],
  isDarkMode = true,
}) {
  const [activeTab, setActiveTab] = React.useState("sessions"); // 'sessions' | 'prescriptions' | 'personas'

  const personas = [
    {
      id: "general",
      title: "Dr. Krishi (Lead Agronomist)",
      role: "All-Round Agricultural Scientist",
      icon: BotMessageSquare,
      color: "emerald",
      badge: "ICAR Grounded",
      desc: "Complete crop lifecycles, seasonal planning & general agronomy.",
    },
    {
      id: "pathology",
      title: "Plant Pathology & Pest Doctor",
      role: "IPM & Crop Protection",
      icon: Stethoscope,
      color: "teal",
      badge: "Curative Rx",
      desc: "Instant disease diagnostics, ETL thresholds & chemical active ingredients.",
    },
    {
      id: "soil_nutrition",
      title: "Soil Chemistry & Nutritionist",
      role: "Fertilizer & NPK Dynamics",
      icon: FlaskConical,
      color: "green",
      badge: "NPK Precision",
      desc: "Split urea doses, DAP, MOP, micro-nutrients & fertigation.",
    },
    {
      id: "market",
      title: "Agri-Economist & Mandi Guru",
      role: "APMC Trading & Monetization",
      icon: TrendingUp,
      color: "lime",
      badge: "Price Max",
      desc: "e-NAM arbitrage, MSP benchmarks, moisture deduction rules.",
    },
    {
      id: "schemes",
      title: "Kisan Yojna & Subsidy Guide",
      role: "Govt Schemes Specialist",
      icon: Landmark,
      color: "amber",
      badge: "Direct Benefit",
      desc: "PM-KISAN status, KCC 4% loans, PMFBY claims & Solar pump 60% subsidy.",
    },
  ];

  return (
    <div className="flex flex-col h-full app-card overflow-hidden">
      {/* Top Action Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
        <button
          onClick={onNewSession}
          className="btn-primary w-full py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New AI Consultation</span>
        </button>

        {/* Tab Selector */}
        <div className="grid grid-cols-3 p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px]">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "sessions"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <MessageSquare className="w-3 h-3" />
            <span>Chats ({sessions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("personas")}
            className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "personas"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>Doctors</span>
          </button>
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`py-1.5 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "prescriptions"
                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Bookmark className="w-3 h-3" />
            <span>Rx ({savedPrescriptions.length})</span>
          </button>
        </div>
      </div>

      {/* Main List Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {/* SESSIONS TAB */}
        {activeTab === "sessions" && (
          <div className="space-y-1.5">
            {sessions.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-blue-500/40" />
                <p>No active consultations.</p>
                <p className="text-[11px] mt-1 text-[var(--primary)]">Start a new query above.</p>
              </div>
            ) : (
              sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => onSelectSession(sess.id)}
                    className={`group relative p-3 rounded-2xl border transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-sm ring-1 ring-blue-500/30"
                        : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                            }`}
                          />
                          <span className="text-[10px] uppercase font-bold tracking-wider text-blue-700 dark:text-blue-400">
                            {sess.cropContext || "General Consultation"}
                          </span>
                        </div>
                        <h4
                          className={`text-xs font-semibold truncate ${
                            isActive
                              ? "text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                          }`}
                        >
                          {sess.title || "Crop Advisory Discussion"}
                        </h4>
                        <p className="text-[10px] mt-1 truncate text-slate-500 dark:text-slate-400">
                          {sess.messages?.[sess.messages.length - 1]?.text?.replace(/[#*`_]/g, "") || "No messages yet"}
                        </p>
                      </div>

                      {sessions.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(sess.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all cursor-pointer shrink-0 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10"
                          title="Delete Session"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* PERSONAS TAB */}
        {activeTab === "personas" && (
          <div className="space-y-2">
            <p className="text-[11px] px-1 font-medium text-slate-500 dark:text-slate-400">
              Select specialized AI Doctor for tailored reasoning:
            </p>
            {personas.map((p) => {
              const isSelected = activePersona === p.id;
              const Icon = p.icon;
              return (
                <div
                  key={p.id}
                  onClick={() => onSelectPersona(p.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm"
                      : "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{p.title}</h4>
                        <span className="badge badge-emerald text-[9px] px-1.5 py-0.2">
                          {p.badge}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug text-slate-600 dark:text-slate-400">{p.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PRESCRIPTIONS TAB */}
        {activeTab === "prescriptions" && (
          <div className="space-y-2">
            {savedPrescriptions.length === 0 ? (
              <div className="text-center py-8 px-4 text-xs text-slate-500 dark:text-slate-400">
                <Bookmark className="w-8 h-8 mx-auto mb-2 text-emerald-500/40" />
                <p>No saved prescriptions yet.</p>
                <p className="text-[11px] mt-1 text-emerald-600 dark:text-emerald-400">Bookmark treatment cards from chat to save them here.</p>
              </div>
            ) : (
              savedPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  onClick={() => onOpenPrescription(rx)}
                  className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-emerald-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="badge badge-emerald text-[10px] font-bold px-2 py-0.5">
                          {rx.crop}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {new Date(rx.createdAt || Date.now()).toLocaleDateString([], { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold truncate text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {rx.title}
                      </h4>
                      <p className="text-[11px] line-clamp-2 mt-1 text-slate-600 dark:text-slate-400">
                        {rx.chemicalRemedy || rx.diagnosis}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 mt-1 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Grounding Info Footer */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 text-[11px] space-y-1.5">
        <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-500" />
            <span className="font-semibold truncate max-w-[120px] text-slate-900 dark:text-white">
              {farmProfile?.farmName || "Active Farm"}
            </span>
          </div>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            {farmProfile?.totalAreaAcres || 149} Acres
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          <span>Real-time Gemini 3.7 Grounding</span>
        </div>
      </div>
    </div>
  );
}

export default AdvisorSidebar;
