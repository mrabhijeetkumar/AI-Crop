// src/context/FarmContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { DEFAULT_WEATHER_OVERVIEW } from "../data/weatherData.js";
import { useAuth } from "./AuthContext.jsx";

const FarmContext = createContext(undefined);

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const todayISO = () => new Date().toISOString().split("T")[0];
const uniqueId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
const round1 = (n) => Math.round(n * 10) / 10;
const snapKey = (uid) => `aicrop_snapshot_${uid}`;

function readSnapshot(uid) {
  try {
    const raw = localStorage.getItem(snapKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const welcomeNotification = () => ({
  id: uniqueId("notif"),
  title: "Welcome to AI Crop Profit 🌱",
  message: "Apni pehli field add karein taaki crop, soil aur profit insights personalised ho jayein.",
  type: "info",
  category: "Task",
  timestamp: "Just now",
  read: false,
  actionTab: "farm_fields",
});

// Small demo set – only loaded when the user clicks "Load demo data".
const DEMO_FIELDS = [
  {
    id: "demo_fld_01", name: "Demo Field - Sector 1", areaAcres: 6.5, soilType: "alluvial",
    currentCrop: "Wheat (HD-2967)", variety: "HD-2967 High Yield", growthStage: "Tillering",
    growthProgressPercent: 45, sowingDate: "2026-11-05", expectedHarvestDate: "2027-04-10",
    healthStatus: "Good", irrigationSource: "Tubewell", moisturePercentage: 54, ndviIndex: 0.78,
    lastFertilized: "2026-11-05", lastIrrigated: "2026-11-08", notes: "Demo plot for exploring the dashboard.",
    soilTest: { nitrogen: 105, phosphorus: 52, potassium: 48, ph: 6.8, organicCarbon: 0.74, testDate: "2026-10-28" },
  },
  {
    id: "demo_fld_02", name: "Demo Field - Mustard Block", areaAcres: 4.0, soilType: "sandy_loam",
    currentCrop: "Mustard (Pusa Bold)", variety: "Pusa Bold", growthStage: "Vegetative",
    growthProgressPercent: 30, sowingDate: "2026-10-25", expectedHarvestDate: "2027-03-05",
    healthStatus: "Needs Attention", irrigationSource: "Canal", moisturePercentage: 38, ndviIndex: 0.7,
    lastFertilized: "2026-10-25", lastIrrigated: "2026-11-01", notes: "Moisture dropping – irrigate soon.",
    soilTest: { nitrogen: 88, phosphorus: 40, potassium: 42, ph: 6.6, organicCarbon: 0.62, testDate: "2026-10-20" },
  },
];

export function FarmProvider({ children }) {
  const { user: authUser, farmProfile: authFarmProfile, updateFarmProfile: authUpdateFarmProfile } = useAuth();
  const uid = authUser?.id || null;

  const [activeTab, setActiveTab] = useState(() => localStorage.getItem("aicrop_tab") || "dashboard");
  const [farmProfile, setFarmProfile] = useState({});
  const [fields, setFields] = useState([]);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [activities, setActivities] = useState([]);
  const [diagnosesHistory, setDiagnosesHistory] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [advisorSessions, setAdvisorSessions] = useState([]);
  const [activeAdvisorSessionId, setActiveAdvisorSessionId] = useState(null);
  const [savedPrescriptions, setSavedPrescriptions] = useState([]);

  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced' | 'saving' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date().toLocaleTimeString());
  const [weather, setWeather] = useState(DEFAULT_WEATHER_OVERVIEW);
  const [marketApiKey, setMarketApiKey] = useState(() => {
    try { return localStorage.getItem("aicrop_mandi_key") || ""; } catch { return ""; }
  });
  const [marketData, setMarketData] = useState([]);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem("aicrop_lang") || "en");

  // `hydratedFor` = uid whose data has been loaded. Prevents saving empty state over a real snapshot.
  const [hydratedFor, setHydratedFor] = useState(null);

  // Always-fresh refs (avoid stale closures in async helpers)
  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;
  const uidRef = useRef(uid);
  uidRef.current = uid;
  const profileRef = useRef(farmProfile);
  profileRef.current = farmProfile;
  const prevUidRef = useRef(uid);

  /** fetch wrapper that scopes every request to the logged-in user */
  const api = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(uidRef.current ? { "x-user-id": uidRef.current } : {}),
        ...(options.headers || {}),
      },
    });
  }, []);

  const markSynced = () => {
    setSyncStatus("synced");
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  /* ---------------- notifications ---------------- */
  const addNotification = (notif) => {
    setNotifications((prev) => [
      { ...notif, id: uniqueId("notif"), timestamp: "Just now", read: false },
      ...prev,
    ]);
  };
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const markNotificationAsRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const deleteNotification = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAllNotifications = () => setNotifications([]);

  /* ---------------- hydrate per user ---------------- */
  useEffect(() => {
    if (!uid) {
      setFarmProfile({});
      setFields([]);
      setSelectedFieldId(null);
      setActivities([]);
      setDiagnosesHistory([]);
      setNotifications([]);
      setAdvisorSessions([]);
      setActiveAdvisorSessionId(null);
      setSavedPrescriptions([]);
      setHydratedFor(null);
      prevUidRef.current = null;
      return;
    }

    const snap = readSnapshot(uid);
    setFarmProfile({ ...(authFarmProfile || {}), ...(snap?.farmProfile || {}) });
    setFields(snap?.fields || []);
    setSelectedFieldId(null);
    setActivities(snap?.activities || []);
    setDiagnosesHistory(snap?.diagnosesHistory || []);
    setNotifications(snap?.notifications || [welcomeNotification()]);
    setAdvisorSessions(snap?.advisorSessions || []);
    setActiveAdvisorSessionId(snap?.activeAdvisorSessionId || null);
    setSavedPrescriptions(snap?.savedPrescriptions || []);

    // go back to dashboard only when a *different* user logs in (not on every refresh)
    if (prevUidRef.current && prevUidRef.current !== uid) setActiveTab("dashboard");
    prevUidRef.current = uid;
    setHydratedFor(uid);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  // Keep profile in sync when AuthContext refreshes it (onboarding, settings, server refresh)
  useEffect(() => {
    if (!uid || hydratedFor !== uid || !authFarmProfile) return;
    setFarmProfile((p) => ({
      ...p,
      ...authFarmProfile,
      // once fields exist, the locally-tracked acreage is the source of truth
      totalAreaAcres: fieldsRef.current.length
        ? p.totalAreaAcres
        : authFarmProfile.totalAreaAcres ?? p.totalAreaAcres,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authFarmProfile]);

  /* ---------------- server sync (fields only, scoped by x-user-id) ---------------- */
  useEffect(() => {
    if (!uid || hydratedFor !== uid) return;
    let alive = true;
    (async () => {
      try {
        const res = await api("/api/farm/fields");
        if (!res.ok || !alive) return;
        const data = await res.json();
        if (Array.isArray(data.fields) && data.fields.length > 0) {
          setFields(data.fields);
        } else if (fieldsRef.current.length > 0) {
          // server restarted / empty: push local copy back
          api("/api/farm/fields/bulk-sync", {
            method: "POST",
            body: JSON.stringify({ fields: fieldsRef.current }),
          }).catch(() => { });
        }
        if (alive) markSynced();
      } catch (err) {
        console.warn("Server sync unavailable – using local cache:", err?.message || err);
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid, hydratedFor, api]);

  /* ---------------- persistence ---------------- */
  useEffect(() => {
    if (!uid || hydratedFor !== uid) return;
    try {
      localStorage.setItem(
        snapKey(uid),
        JSON.stringify({
          farmProfile, fields, activities, diagnosesHistory, notifications,
          advisorSessions, activeAdvisorSessionId, savedPrescriptions,
        })
      );
    } catch (e) {
      console.warn("Local snapshot not saved (storage full?)", e?.message);
    }
  }, [uid, hydratedFor, farmProfile, fields, activities, diagnosesHistory, notifications, advisorSessions, activeAdvisorSessionId, savedPrescriptions]);

  useEffect(() => { localStorage.setItem("aicrop_tab", activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem("aicrop_lang", language); }, [language]);

  const updateWeather = (newWeather) => setWeather((prev) => ({ ...prev, ...newWeather }));

  /* ---------------- AI advisor sessions (local-first) ---------------- */
  const createNewAdvisorSession = async (title = "New Consultation", persona = "general", cropContext) => {
    const crop = cropContext || fieldsRef.current[0]?.currentCrop || "your crops";
    const now = new Date().toISOString();
    const session = {
      id: uniqueId("sess"),
      title,
      persona,
      cropContext: crop,
      fieldId: selectedFieldId || fieldsRef.current[0]?.id || null,
      createdAt: now,
      updatedAt: now,
      messages: [
        {
          id: uniqueId("msg"),
          sender: "advisor",
          text: `### 🌾 Namaste! Main Dr. Krishi hoon.\n\nMain **${crop}** ke liye aapke farm (**${profileRef.current.location || "your location"}**) ki madad ke liye taiyaar hoon.\nAaj kis cheez me help chahiye?`,
          timestamp: "Just now",
          source: "dr-krishi",
        },
      ],
    };
    setAdvisorSessions((prev) => [session, ...prev]);
    setActiveAdvisorSessionId(session.id);
    return session;
  };

  const saveAdvisorSession = async (sessionToSave) => {
    setAdvisorSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionToSave.id);
      const next = { ...sessionToSave, updatedAt: new Date().toISOString() };
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = next;
        return copy;
      }
      return [next, ...prev];
    });
  };

  const deleteAdvisorSession = async (sessionId) => {
    setAdvisorSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      setActiveAdvisorSessionId((cur) => (cur === sessionId ? filtered[0]?.id || null : cur));
      return filtered;
    });
  };

  const savePrescription = async (data) => {
    const rec = { ...data, id: data.id || uniqueId("pres"), createdAt: new Date().toISOString() };
    setSavedPrescriptions((prev) => [rec, ...prev]);
    addNotification({
      title: `Prescription Saved: ${rec.title}`,
      message: `Prescription for ${rec.crop} saved to your farm records.`,
      type: "success",
      category: "Task",
    });
    return rec;
  };
  const deletePrescription = async (id) =>
    setSavedPrescriptions((prev) => prev.filter((p) => p.id !== id));

  /* ---------------- farm profile ---------------- */
  const updateFarmProfile = async (updated) => {
    setSyncStatus("saving");
    setFarmProfile((prev) => ({ ...prev, ...updated }));
    try {
      await authUpdateFarmProfile?.(updated); // persists to /api/user/farm-profile
      markSynced();
    } catch {
      setSyncStatus("error");
    }
  };

  const adjustTotalArea = (delta) =>
    setFarmProfile((p) => ({
      ...p,
      totalAreaAcres: Math.max(0, round1((Number(p.totalAreaAcres) || 0) + delta)),
    }));

  const logActivity = (partial) =>
    setActivities((prev) => [
      { id: uniqueId("act"), timestamp: new Date().toISOString(), operator: profileRef.current.ownerName || "Farmer", ...partial },
      ...prev,
    ]);

  /* ---------------- fields ---------------- */
  const addField = async (fieldData) => {
    setSyncStatus("saving");
    const newField = {
      ...fieldData,
      id: fieldData.id || uniqueId("fld"),
      areaAcres: Number(fieldData.areaAcres) || 5.0,
      growthProgressPercent: Number(fieldData.growthProgressPercent) || 30,
      moisturePercentage: Number(fieldData.moisturePercentage) || 50,
      ndviIndex: Number(fieldData.ndviIndex) || 0.8,
    };

    setFields((prev) => [newField, ...prev]);
    adjustTotalArea(newField.areaAcres);
    logActivity({
      fieldId: newField.id,
      fieldName: newField.name,
      crop: newField.currentCrop,
      type: "created",
      title: `Field Mapped: ${newField.name}`,
      description: `Mapped ${newField.areaAcres} acres under ${newField.currentCrop} (${newField.soilType}).`,
    });
    addNotification({
      title: `New Field Mapped: ${newField.name}`,
      message: `Registered ${newField.areaAcres} acres under ${newField.currentCrop}.`,
      type: "success",
      category: "Task",
    });

    try {
      const res = await api("/api/farm/fields", { method: "POST", body: JSON.stringify(newField) });
      if (res.ok) {
        const data = await res.json();
        if (data.field) setFields((prev) => prev.map((f) => (f.id === newField.id ? data.field : f)));
      }
      markSynced();
    } catch {
      markSynced(); // local cache already saved
    }
  };

  const updateField = async (id, updated) => {
    setSyncStatus("saving");
    const before = fieldsRef.current.find((f) => f.id === id);
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, ...updated } : f)));
    if (before && updated.areaAcres !== undefined) {
      const delta = Number(updated.areaAcres) - Number(before.areaAcres || 0);
      if (delta) adjustTotalArea(delta);
    }
    try {
      await api(`/api/farm/fields/${id}`, { method: "PUT", body: JSON.stringify(updated) });
    } catch { /* offline – local copy kept */ }
    markSynced();
  };

  const deleteField = async (id) => {
    setSyncStatus("saving");
    const target = fieldsRef.current.find((f) => f.id === id);
    if (target) {
      adjustTotalArea(-Number(target.areaAcres || 0));
      logActivity({
        fieldId: id,
        fieldName: target.name,
        crop: target.currentCrop,
        type: "scouting",
        title: `Field Plot Deleted: ${target.name}`,
        description: `Unmapped ${target.areaAcres} acres parcel from farm records.`,
      });
      addNotification({
        title: `Field Deleted: ${target.name}`,
        message: `Removed ${target.areaAcres} acres plot.`,
        type: "info",
        category: "Task",
      });
    }
    setFields((prev) => prev.filter((f) => f.id !== id));
    try {
      await api(`/api/farm/fields/${id}`, { method: "DELETE" });
    } catch { /* ignore */ }
    markSynced();
  };

  const irrigateField = async (id) => {
    const target = fieldsRef.current.find((f) => f.id === id);
    if (!target) return;
    setSyncStatus("saving");

    const newMoisture = Math.min(85, (Number(target.moisturePercentage) || 40) + 18);
    const updatedTarget = {
      ...target,
      moisturePercentage: newMoisture,
      lastIrrigated: todayISO(),
      healthStatus: target.healthStatus === "Needs Attention" && newMoisture >= 50 ? "Good" : target.healthStatus,
    };
    setFields((prev) => prev.map((f) => (f.id === id ? updatedTarget : f)));
    logActivity({
      fieldId: id,
      fieldName: target.name,
      crop: target.currentCrop,
      type: "irrigation",
      title: `Precision Irrigation Run: ${target.name}`,
      description: `Moisture raised to ${newMoisture}% H₂O. System cycle complete.`,
    });
    addNotification({
      title: `Irrigation Completed: ${target.name}`,
      message: `Soil moisture normalized to ${newMoisture}% H₂O.`,
      type: "success",
      category: "Soil",
    });

    try {
      await api(`/api/farm/fields/${id}/irrigate`, { method: "POST" });
    } catch { /* ignore */ }
    markSynced();
  };

  const logFieldActivity = async (fieldId, activityData) => {
    setSyncStatus("saving");
    const target = fieldsRef.current.find((f) => f.id === fieldId);
    logActivity({
      fieldId,
      fieldName: target?.name || "Field Plot",
      crop: target?.currentCrop || "Crop",
      type: activityData.type || "scouting",
      title: activityData.title || `Activity logged on ${target?.name || "Plot"}`,
      description: activityData.description || activityData.notes || "Agronomy operation recorded.",
    });
    if (activityData.notes && target) updateField(fieldId, { notes: activityData.notes });
    try {
      await api(`/api/farm/fields/${fieldId}/activity`, { method: "POST", body: JSON.stringify(activityData) });
    } catch { /* ignore */ }
    markSynced();
  };

  const simulateSensors = () =>
    setFields((prev) =>
      prev.map((f) => {
        const m = Math.min(85, Math.max(25, Math.round((Number(f.moisturePercentage) || 50) + (Math.random() * 6 - 3))));
        const n = Math.min(0.95, Math.max(0.4, Number(((Number(f.ndviIndex) || 0.8) + (Math.random() * 0.04 - 0.02)).toFixed(2))));
        return { ...f, moisturePercentage: m, ndviIndex: n };
      })
    );

  const refreshAllSensors = async () => {
    setSyncStatus("saving");
    try {
      const res = await api("/api/farm/fields/telemetry-sync-all", { method: "POST" });
      const data = res.ok ? await res.json() : null;
      // never replace local data with an empty server list
      if (Array.isArray(data?.fields) && data.fields.length > 0) setFields(data.fields);
      else simulateSensors();
      addNotification({
        title: "IoT Telemetry Synced",
        message: "Live soil probes, moisture telemetry & NDVI indices updated.",
        type: "info",
        category: "Task",
      });
    } catch {
      simulateSensors();
    }
    markSynced();
  };

  /* ---------------- diagnoses ---------------- */
  const addDiagnosis = (diag) => {
    setDiagnosesHistory((prev) => [
      { id: uniqueId("diag"), createdAt: new Date().toISOString(), ...diag },
      ...prev,
    ]);
    addNotification({
      title: `AI Diagnosis: ${diag.diseaseName}`,
      message: `Crop: ${diag.cropIdentified} - Severity: ${diag.severity}. Prescription generated.`,
      type: diag.severity === "Critical" || diag.severity === "High" ? "critical" : "warning",
      category: "Disease",
      actionTab: "disease_diagnosis",
    });
  };

  /* ---------------- misc ---------------- */
  const openQuickAction = (type = "field") => {
    setQuickActionType(type);
    setQuickActionOpen(true);
  };

  /** Clears this account's farm data (profile is kept). */
  const resetFarmState = () => {
    setFields([]);
    setSelectedFieldId(null);
    setActivities([]);
    setDiagnosesHistory([]);
    setAdvisorSessions([]);
    setActiveAdvisorSessionId(null);
    setSavedPrescriptions([]);
    setNotifications([]);
    if (uidRef.current) localStorage.removeItem(snapKey(uidRef.current));
  };

  /** Optional: fill the account with two sample plots to explore the UI. */
  const loadDemoData = () => {
    setFields(DEMO_FIELDS);
    setFarmProfile((p) => ({ ...p, totalAreaAcres: DEMO_FIELDS.reduce((s, f) => s + f.areaAcres, 0) }));
    addNotification({ title: "Demo data loaded", message: "2 sample plots added. Delete them anytime.", type: "info", category: "Task" });
  };

  return (
    <FarmContext.Provider
      value={{
        activeTab, setActiveTab,
        farmProfile, updateFarmProfile,
        fields, addField, updateField, deleteField, irrigateField, logFieldActivity, refreshAllSensors,
        activities, syncStatus, lastSyncTime,
        selectedFieldId, setSelectedFieldId,
        diagnosesHistory, addDiagnosis,
        weather, setWeather, updateWeather,
        marketApiKey, setMarketApiKey, marketData, setMarketData,
        notifications, unreadNotificationCount, unreadCount: unreadNotificationCount,
        markNotificationAsRead, markAsRead: markNotificationAsRead,
        markAllNotificationsAsRead, markAllAsRead: markAllNotificationsAsRead,
        deleteNotification, clearAllNotifications, addNotification,
        quickActionOpen, setQuickActionOpen, quickActionType, openQuickAction,
        language, setLanguage,
        advisorSessions, setAdvisorSessions, activeAdvisorSessionId, setActiveAdvisorSessionId,
        savedPrescriptions, setSavedPrescriptions,
        createNewAdvisorSession, saveAdvisorSession, deleteAdvisorSession, savePrescription, deletePrescription,
        resetFarmState, loadDemoData,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) throw new Error("useFarm must be used within a FarmProvider");
  return context;
}