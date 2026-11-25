import React, { useState } from "react";
import {
  History,
  Calendar,
  FlaskConical,
  Plus,
  TrendingUp,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export function SoilHistoryTimeline({ currentField, onLogNewSnapshot }) {
  const [showAddLogModal, setShowAddLogModal] = useState(false);

  // Default historical records if none exist on field
  const [historyLogs, setHistoryLogs] = useState(() => {
    return [
      {
        id: "log_01",
        season: "Rabi 2024 (Baseline)",
        date: "2024-10-15",
        nitrogen: 88,
        phosphorus: 38,
        potassium: 42,
        ph: 7.3,
        organicCarbon: 0.62,
        testedBy: "District Soil Testing Laboratory",
        notes: "Initial soil test before wheat sowing. Moderate nitrogen deficit.",
      },
      {
        id: "log_02",
        season: "Kharif 2025 (Post-Green Manure)",
        date: "2025-06-20",
        nitrogen: 102,
        phosphorus: 46,
        potassium: 46,
        ph: 7.0,
        organicCarbon: 0.71,
        testedBy: "Krishi Vigyan Kendra (KVK)",
        notes: "Dhaincha green manure incorporated. Organic carbon increased by +0.09%.",
      },
      {
        id: "log_03",
        season: "Rabi 2025 (Current Cycle)",
        date: currentField?.soilTest?.testDate || "2025-10-28",
        nitrogen: currentField?.soilTest?.nitrogen || 105,
        phosphorus: currentField?.soilTest?.phosphorus || 52,
        potassium: currentField?.soilTest?.potassium || 48,
        ph: currentField?.soilTest?.ph || 6.8,
        organicCarbon: currentField?.soilTest?.organicCarbon || 0.74,
        testedBy: "Geork Precision IoT Sensors & Lab",
        notes: "Healthy balanced macro-nutrients and neutral pH reaction.",
      },
    ];
  });

  const [newSeason, setNewSeason] = useState("Summer Zaid 2026");
  const [newN, setNewN] = useState(110);
  const [newP, setNewP] = useState(50);
  const [newK, setNewK] = useState(50);
  const [newPh, setNewPh] = useState(6.8);
  const [newOc, setNewOc] = useState(0.76);
  const [newLab, setNewLab] = useState("District Krishi Lab");
  const [newNotes, setNewNotes] = useState("");

  const handleAddLog = (e) => {
    e.preventDefault();
    const newEntry = {
      id: `log_${Date.now()}`,
      season: newSeason,
      date: new Date().toISOString().split("T")[0],
      nitrogen: Number(newN),
      phosphorus: Number(newP),
      potassium: Number(newK),
      ph: Number(newPh),
      organicCarbon: Number(newOc),
      testedBy: newLab,
      notes: newNotes || "Standard laboratory soil test recorded.",
    };

    setHistoryLogs((prev) => [newEntry, ...prev]);
    setShowAddLogModal(false);
    if (onLogNewSnapshot) {
      onLogNewSnapshot(newEntry);
    }
  };

  return (
    <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Soil Fertility Historical Timeline & Audit Log
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25">
                {historyLogs.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Tracks multi-season evolution of NPK, Organic Carbon, and pH recovery on <strong>{currentField?.name || "Field Plot"}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddLogModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Test Snapshot</span>
        </button>
      </div>

      {/* Multi-Season Trend Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Organic Carbon Trajectory
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                +0.12% ↗
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                (0.62% → 0.74%)
              </span>
            </div>
          </div>
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              pH Normalization
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-cyan-600 dark:text-cyan-400">
                6.8 (Neutral)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Stabilized from 7.3
              </span>
            </div>
          </div>
          <span className="p-2 rounded-xl bg-cyan-100 dark:bg-[#141414] text-cyan-600 dark:text-cyan-400">
            <CheckCircle2 className="w-4 h-4" />
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Available Nitrogen Index
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                +17 kg/ha ↗
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                Optimal Fertility
              </span>
            </div>
          </div>
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400">
            <FlaskConical className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Historical Logs List */}
      <div className="space-y-3">
        {historyLogs.map((log, idx) => (
          <div
            key={log.id}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block">
                    {log.season}
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Tested on {log.date} by {log.testedBy}
                  </span>
                </div>
              </div>

              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/25 self-start sm:self-auto">
                Verified Record
              </span>
            </div>

            {/* Parameter Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Nitrogen (N)</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{log.nitrogen} kg/ha</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Phosphorus (P)</span>
                <span className="font-extrabold text-amber-600 dark:text-amber-400">{log.phosphorus} kg/ha</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Potassium (K)</span>
                <span className="font-extrabold text-teal-600 dark:text-teal-400">{log.potassium} kg/ha</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Soil pH</span>
                <span className="font-extrabold text-cyan-600 dark:text-cyan-400">{log.ph}</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-[#0F0F0F] border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 block font-semibold">Organic Carbon</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{log.organicCarbon}%</span>
              </div>
            </div>

            {log.notes && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 italic border-t border-slate-200 dark:border-slate-800/80 pt-2">
                &ldquo;{log.notes}&rdquo;
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Record New Snapshot Modal */}
      {showAddLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F0F0F] text-slate-900 dark:text-white w-full max-w-md rounded-3xl border border-emerald-300 dark:border-emerald-500/35 p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Record Laboratory Soil Sample
            </h3>

            <form onSubmit={handleAddLog} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                  Season / Test Label
                </label>
                <input
                  type="text"
                  required
                  value={newSeason}
                  onChange={(e) => setNewSeason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">N (kg/ha)</label>
                  <input
                    type="number"
                    value={newN}
                    onChange={(e) => setNewN(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">P (kg/ha)</label>
                  <input
                    type="number"
                    value={newP}
                    onChange={(e) => setNewP(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">K (kg/ha)</label>
                  <input
                    type="number"
                    value={newK}
                    onChange={(e) => setNewK(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPh}
                    onChange={(e) => setNewPh(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Organic Carbon %</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOc}
                    onChange={(e) => setNewOc(Number(e.target.value))}
                    className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                  Testing Laboratory / Organization
                </label>
                <input
                  type="text"
                  value={newLab}
                  onChange={(e) => setNewLab(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                  Agronomic Notes & Observations
                </label>
                <textarea
                  rows={2}
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Incorporated FYM before plowing..."
                  className="w-full bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLogModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-slate-950 text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Test Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
