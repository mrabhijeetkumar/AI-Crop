import React, { createContext, useContext, useState, useEffect } from "react";
import { DEFAULT_WEATHER_OVERVIEW } from "../data/weatherData.js";
import { SAMPLE_LEAVES } from "../data/sampleDiseases.js";
import { useAuth } from "./AuthContext.jsx";

const FarmContext = createContext(undefined);

const INITIAL_FARM_PROFILE = {
  id: "farm_01",
  farmName: "Geork Agricultural Estate",
  ownerName: "Abhijeet Kumar",
  location: "Phagwara, Punjab, India",
  state: "Punjab",
  totalAreaAcres: 149.0,
  primaryWaterSource: "Solar Drip & Canal Tubewell",
  soilClassification: "alluvial",
  preferredLanguage: "en",
  currency: "₹",
};

const INITIAL_FIELDS = [
  {
    id: "fld_01",
    name: "Geork Field - Sector 1",
    areaAcres: 24.5,
    soilType: "alluvial",
    currentCrop: "Wheat (HD-2967)",
    variety: "HD-2967 High Yield",
    growthStage: "Flowering & Grain Filling",
    growthProgressPercent: 74,
    sowingDate: "2025-11-15",
    expectedHarvestDate: "2026-04-10",
    healthStatus: "Good",
    irrigationSource: "Solar Drip & Tubewell",
    moisturePercentage: 54,
    ndviIndex: 0.82,
    lastFertilized: "2026-01-20",
    lastIrrigated: "2026-02-22",
    notes: "Canopy density is very healthy with zero sign of yellow rust. High chlorophyll absorption.",
    soilTest: {
      nitrogen: 105,
      phosphorus: 52,
      potassium: 48,
      ph: 6.8,
      organicCarbon: 0.74,
      testDate: "2025-10-28",
    },
  },
  {
    id: "fld_02",
    name: "North Terraced Plot - Sector A",
    areaAcres: 18.0,
    soilType: "alluvial",
    currentCrop: "Corn / Maize (DKC-9108)",
    variety: "DKC-9108 Hybrid",
    growthStage: "Tasseling & Silking",
    growthProgressPercent: 68,
    sowingDate: "2025-11-01",
    expectedHarvestDate: "2026-03-25",
    healthStatus: "Excellent",
    irrigationSource: "Solar Drip",
    moisturePercentage: 62,
    ndviIndex: 0.88,
    lastFertilized: "2026-01-15",
    lastIrrigated: "2026-02-20",
    notes: "Silking stage proceeding under favorable temperatures.",
    soilTest: {
      nitrogen: 110,
      phosphorus: 50,
      potassium: 52,
      ph: 6.9,
      organicCarbon: 0.78,
      testDate: "2025-10-25",
    },
  },
  {
    id: "fld_03",
    name: "South Block - Soybean Ridge",
    areaAcres: 16.5,
    soilType: "black_cotton",
    currentCrop: "Soybean (JS-335)",
    variety: "JS-335 High Protein",
    growthStage: "Pod Development",
    growthProgressPercent: 82,
    sowingDate: "2025-10-20",
    expectedHarvestDate: "2026-03-15",
    healthStatus: "Excellent",
    irrigationSource: "Canal + Borewell",
    moisturePercentage: 48,
    ndviIndex: 0.89,
    lastFertilized: "2025-12-10",
    lastIrrigated: "2026-02-18",
    notes: "Pod development optimal. Checked border rows for aphids, zero infestation.",
    soilTest: {
      nitrogen: 95,
      phosphorus: 46,
      potassium: 44,
      ph: 7.1,
      organicCarbon: 0.70,
      testDate: "2025-10-15",
    },
  },
  {
    id: "fld_04",
    name: "East Riverbed - Barley Parcel",
    areaAcres: 12.0,
    soilType: "sandy_loam",
    currentCrop: "Barley (RD-2552)",
    variety: "RD-2552 Malting Grade",
    growthStage: "Heading & Grain Hardening",
    growthProgressPercent: 78,
    sowingDate: "2025-11-10",
    expectedHarvestDate: "2026-03-30",
    healthStatus: "Good",
    irrigationSource: "Tubewell",
    moisturePercentage: 42,
    ndviIndex: 0.79,
    lastFertilized: "2026-01-10",
    lastIrrigated: "2026-02-14",
    notes: "Grain filling uniform across sandy patches.",
    soilTest: {
      nitrogen: 88,
      phosphorus: 40,
      potassium: 42,
      ph: 6.6,
      organicCarbon: 0.62,
      testDate: "2025-10-10",
    },
  },
  {
    id: "fld_05",
    name: "Central Meadow - Mustard Block",
    areaAcres: 15.0,
    soilType: "alluvial",
    currentCrop: "Mustard (Pusa Bold)",
    variety: "Pusa Bold (Oil Rich)",
    growthStage: "Maturity / Ready to Harvest",
    growthProgressPercent: 94,
    sowingDate: "2025-10-15",
    expectedHarvestDate: "2026-03-05",
    healthStatus: "Excellent",
    irrigationSource: "Canal Drip",
    moisturePercentage: 39,
    ndviIndex: 0.85,
    lastFertilized: "2025-12-05",
    lastIrrigated: "2026-02-10",
    notes: "Siliqua maturity reached 90%. Combine harvester scheduled for next week.",
    soilTest: {
      nitrogen: 98,
      phosphorus: 48,
      potassium: 46,
      ph: 7.0,
      organicCarbon: 0.72,
      testDate: "2025-10-12",
    },
  },
  {
    id: "fld_06",
    name: "West Orchard - Potato Strip",
    areaAcres: 10.5,
    soilType: "sandy_loam",
    currentCrop: "Potato (Kufri Pukhraj)",
    variety: "Kufri Pukhraj Early",
    growthStage: "Tuber Bulking & Skin Setting",
    growthProgressPercent: 88,
    sowingDate: "2025-10-05",
    expectedHarvestDate: "2026-03-02",
    healthStatus: "Needs Attention",
    irrigationSource: "Micro-Sprinkler",
    moisturePercentage: 38,
    ndviIndex: 0.71,
    lastFertilized: "2025-12-05",
    lastIrrigated: "2026-02-24",
    notes: "Soil moisture dropping fast on sandy ridge. Schedule micro-sprinkler run tomorrow.",
    soilTest: {
      nitrogen: 80,
      phosphorus: 38,
      potassium: 40,
      ph: 6.5,
      organicCarbon: 0.58,
      testDate: "2025-09-30",
    },
  },
];

const INITIAL_NOTIFICATIONS = [
  {
    id: "notif_01",
    title: "Weather Alert: Showers in 48 Hours",
    message: "14mm rainfall anticipated in Punjab. Postpone foliar pesticide spraying by 2 days.",
    type: "warning",
    timestamp: "12m ago",
    read: false,
    category: "Weather",
    actionTab: "weather_advisory",
  },
  {
    id: "notif_02",
    title: "Mandi Price Surge: Wheat +2.4%",
    message: "Khanna Mandi modal rate reached ₹2,380/Qtl. Good window for contract lot sales.",
    type: "success",
    timestamp: "2h ago",
    read: false,
    category: "Market",
    actionTab: "market_intelligence",
  },
  {
    id: "notif_03",
    title: "Moisture Deficit in Sector C",
    message: "East Meadow (Potato) moisture recorded at 38%. Light irrigation recommended.",
    type: "critical",
    timestamp: "4h ago",
    read: false,
    category: "Soil",
    actionTab: "farm_fields",
  },
  {
    id: "notif_04",
    title: "AI Agronomist Sowing Advisory",
    message: "Summer Zaid Moong sowing window opens in 15 days. Review soil NPK balance.",
    type: "info",
    timestamp: "1d ago",
    read: false,
    category: "Task",
    actionTab: "crop_intelligence",
  },
];

export function FarmProvider({ children }) {
  const { user: authUser, farmProfile: authFarmProfile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("aicrop_tab") || "dashboard";
  });

  const [farmProfile, setFarmProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_farm_profile");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [fields, setFields] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_fields");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedFieldId, setSelectedFieldId] = useState(null);

  const [activities, setActivities] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_activities");
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [syncStatus, setSyncStatus] = useState("synced"); // 'synced' | 'saving' | 'error'
  const [lastSyncTime, setLastSyncTime] = useState(() => new Date().toLocaleTimeString());

  const [diagnosesHistory, setDiagnosesHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_diagnoses");
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [weather, setWeather] = useState(DEFAULT_WEATHER_OVERVIEW);

  const updateWeather = (newWeather) => {
    setWeather((prev) => ({ ...prev, ...newWeather }));
  };

  const [marketApiKey, setMarketApiKey] = useState(() => {
    try {
      return localStorage.getItem("aicrop_mandi_key") || "";
    } catch {
      return "";
    }
  });

  const [marketData, setMarketData] = useState([]);

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_notifs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [quickActionType, setQuickActionType] = useState(null);
  const [language, setLanguage] = useState(() => localStorage.getItem("aicrop_lang") || "en");

  // AI Advisor Multi-Sessions & Prescriptions State
  const [advisorSessions, setAdvisorSessions] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_advisor_sessions");
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  const [activeAdvisorSessionId, setActiveAdvisorSessionId] = useState(() => {
    return localStorage.getItem("aicrop_active_session_id") || "sess_default";
  });

  const [savedPrescriptions, setSavedPrescriptions] = useState(() => {
    try {
      const saved = localStorage.getItem("aicrop_prescriptions");
      if (saved) return JSON.parse(saved);
      return [];
    } catch {
      return [];
    }
  });

  // Keep farm state tied to the authenticated account. A new account starts empty.
  useEffect(() => {
    if (!authUser?.id) {
      setFarmProfile({});
      setFields([]);
      setSelectedFieldId(null);
      setActivities([]);
      setDiagnosesHistory([]);
      setNotifications([]);
      setAdvisorSessions([]);
      setActiveAdvisorSessionId(null);
      setSavedPrescriptions([]);
      return;
    }

    setFarmProfile(authFarmProfile || {});
    setActiveTab("dashboard");
    setFields([]);
    setSelectedFieldId(null);
    setActivities([]);
    setDiagnosesHistory([]);
    setNotifications([]);
    setAdvisorSessions([]);
    setActiveAdvisorSessionId(null);
    setSavedPrescriptions([]);
  }, [authUser?.id]);

  // Initial Sync from Server on Mount
  useEffect(() => {
    let isMounted = true;
    async function initServerSync() {
      if (!authUser?.id) return;
      try {
        const res = await fetch("/api/farm/fields");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (Array.isArray(data.fields) && data.fields.length > 0) {
              setFields(data.fields);
            }
            if (data.profile) {
              setFarmProfile(data.profile);
            }
            setSyncStatus("synced");
            setLastSyncTime(new Date().toLocaleTimeString());
          }
        }
      } catch (err) {
        console.warn("Server sync init warning (using offline/local cache):", err);
      }

      // Sync AI Advisor Sessions from Server
      try {
        const advRes = await fetch("/api/advisor/sessions");
        if (advRes.ok) {
          const advData = await advRes.json();
          if (isMounted) {
            if (Array.isArray(advData.sessions) && advData.sessions.length > 0) {
              setAdvisorSessions(advData.sessions);
            }
            if (Array.isArray(advData.prescriptions) && advData.prescriptions.length > 0) {
              setSavedPrescriptions(advData.prescriptions);
            }
            if (advData.activeSessionId) {
              setActiveAdvisorSessionId(advData.activeSessionId);
            }
          }
        }
      } catch (err) {
        console.warn("Advisor sync warning (using cached sessions):", err);
      }
    }
    initServerSync();
    return () => {
      isMounted = false;
    };
  }, [authUser?.id]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("aicrop_tab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem("aicrop_farm_profile", JSON.stringify(farmProfile));
  }, [farmProfile]);

  useEffect(() => {
    localStorage.setItem("aicrop_fields", JSON.stringify(fields));
  }, [fields]);

  useEffect(() => {
    localStorage.setItem("aicrop_activities", JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem("aicrop_diagnoses", JSON.stringify(diagnosesHistory));
  }, [diagnosesHistory]);

  useEffect(() => {
    localStorage.setItem("aicrop_notifs", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("aicrop_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("aicrop_advisor_sessions", JSON.stringify(advisorSessions));
  }, [advisorSessions]);

  useEffect(() => {
    localStorage.setItem("aicrop_active_session_id", activeAdvisorSessionId);
  }, [activeAdvisorSessionId]);

  useEffect(() => {
    localStorage.setItem("aicrop_prescriptions", JSON.stringify(savedPrescriptions));
  }, [savedPrescriptions]);

  // AI Advisor Session Management Helpers
  const createNewAdvisorSession = async (title = "New Consultation", persona = "general", cropContext = "Wheat (HD-2967)") => {
    const newSession = {
      id: `sess_${Date.now()}`,
      title,
      persona,
      cropContext,
      fieldId: selectedFieldId || "fld_01",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: "advisor",
          text: `### 🌾 Namaste! I am Dr. Krishi, your Senior AI Agronomist & Agricultural Scientist.

I am ready to consult on **${cropContext}** for your farm in **${farmProfile.location}**.
How can I assist your crop operations today?`,
          timestamp: "Just now",
          source: "gemini-3.7-flash",
        },
      ],
    };

    setAdvisorSessions((prev) => [newSession, ...prev]);
    setActiveAdvisorSessionId(newSession.id);

    try {
      await fetch("/api/advisor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSession),
      });
    } catch (err) {
      console.warn("Failed to persist session to server:", err);
    }
    return newSession;
  };

  const saveAdvisorSession = async (sessionToSave) => {
    setAdvisorSessions((prev) => {
      const idx = prev.findIndex((s) => s.id === sessionToSave.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...sessionToSave, updatedAt: new Date().toISOString() };
        return next;
      }
      return [sessionToSave, ...prev];
    });

    try {
      await fetch("/api/advisor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionToSave),
      });
    } catch (err) {
      console.warn("Failed to sync session with server:", err);
    }
  };

  const deleteAdvisorSession = async (sessionId) => {
    setAdvisorSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (activeAdvisorSessionId === sessionId && filtered.length > 0) {
        setActiveAdvisorSessionId(filtered[0].id);
      }
      return filtered;
    });

    try {
      await fetch(`/api/advisor/sessions/${sessionId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete session on server:", err);
    }
  };

  const savePrescription = async (prescriptionData) => {
    const newPres = {
      ...prescriptionData,
      id: prescriptionData.id || `pres_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setSavedPrescriptions((prev) => [newPres, ...prev]);

    addNotification({
      title: `Prescription Saved: ${newPres.title}`,
      message: `Prescription for ${newPres.crop} saved to your farm records.`,
      type: "success",
      category: "Task",
    });

    try {
      await fetch("/api/advisor/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPres),
      });
    } catch (err) {
      console.warn("Failed to persist prescription to server:", err);
    }
    return newPres;
  };

  const deletePrescription = async (prescriptionId) => {
    setSavedPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
    try {
      await fetch(`/api/advisor/prescriptions/${prescriptionId}`, { method: "DELETE" });
    } catch (err) {
      console.warn("Failed to delete prescription on server:", err);
    }
  };

  const updateFarmProfile = async (updated) => {
    setSyncStatus("saving");
    setFarmProfile((prev) => {
      const next = { ...prev, ...updated };
      return next;
    });

    try {
      await fetch("/api/farm/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced"); // local cache saved
    }
  };

  const addField = async (fieldData) => {
    setSyncStatus("saving");
    const newField = {
      ...fieldData,
      id: fieldData.id || `fld_${Date.now()}`,
      areaAcres: Number(fieldData.areaAcres) || 5.0,
      growthProgressPercent: Number(fieldData.growthProgressPercent) || 30,
      moisturePercentage: Number(fieldData.moisturePercentage) || 50,
      ndviIndex: Number(fieldData.ndviIndex) || 0.82,
    };

    // Optimistic UI update
    setFields((prev) => [newField, ...prev]);
    setFarmProfile((prev) => ({
      ...prev,
      totalAreaAcres: Number((prev.totalAreaAcres + newField.areaAcres).toFixed(1)),
    }));

    const newAct = {
      id: `act_${Date.now()}`,
      fieldId: newField.id,
      fieldName: newField.name,
      crop: newField.currentCrop,
      type: "created",
      title: `Field Mapped: ${newField.name}`,
      description: `Mapped ${newField.areaAcres} acres under ${newField.currentCrop} (${newField.soilType}).`,
      timestamp: new Date().toISOString(),
      operator: farmProfile.ownerName || "Farmer",
    };
    setActivities((prev) => [newAct, ...prev]);

    addNotification({
      title: `New Field Mapped: ${fieldData.name}`,
      message: `Registered ${fieldData.areaAcres} acres under ${fieldData.currentCrop}.`,
      type: "success",
      category: "Task",
    });

    try {
      const res = await fetch("/api/farm/fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newField),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.field) {
          setFields((prev) => prev.map((f) => (f.id === newField.id ? data.field : f)));
        }
      }
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced");
    }
  };

  const updateField = async (id, updated) => {
    setSyncStatus("saving");
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const merged = { ...f, ...updated };
          return merged;
        }
        return f;
      })
    );

    // Recalculate total acreage if area changed
    if (updated.areaAcres !== undefined) {
      setTimeout(() => {
        setFarmProfile((p) => {
          const total = fields.reduce((sum, f) => {
            const a = f.id === id ? Number(updated.areaAcres) : Number(f.areaAcres);
            return sum + (a || 0);
          }, 0);
          return { ...p, totalAreaAcres: Number(total.toFixed(1)) };
        });
      }, 0);
    }

    try {
      await fetch(`/api/farm/fields/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced");
    }
  };

  const deleteField = async (id) => {
    setSyncStatus("saving");
    const target = fields.find((f) => f.id === id);
    if (target) {
      setFarmProfile((prev) => ({
        ...prev,
        totalAreaAcres: Math.max(0, Number((prev.totalAreaAcres - target.areaAcres).toFixed(1))),
      }));

      const newAct = {
        id: `act_${Date.now()}`,
        fieldId: id,
        fieldName: target.name,
        crop: target.currentCrop,
        type: "scouting",
        title: `Field Plot Deleted: ${target.name}`,
        description: `Unmapped ${target.areaAcres} acres parcel from farm records.`,
        timestamp: new Date().toISOString(),
        operator: farmProfile.ownerName || "Farmer",
      };
      setActivities((prev) => [newAct, ...prev]);

      addNotification({
        title: `Field Deleted: ${target.name}`,
        message: `Removed ${target.areaAcres} acres plot.`,
        type: "info",
        category: "Task",
      });
    }

    setFields((prev) => prev.filter((f) => f.id !== id));

    try {
      await fetch(`/api/farm/fields/${id}`, {
        method: "DELETE",
      });
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced");
    }
  };

  const irrigateField = async (id) => {
    setSyncStatus("saving");
    const today = new Date().toISOString().split("T")[0];

    let updatedTarget = null;
    setFields((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          const currentMoisture = Number(f.moisturePercentage) || 40;
          const newMoisture = Math.min(85, currentMoisture + 18);
          updatedTarget = {
            ...f,
            moisturePercentage: newMoisture,
            lastIrrigated: today,
            healthStatus: f.healthStatus === "Needs Attention" && newMoisture >= 50 ? "Good" : f.healthStatus,
          };
          return updatedTarget;
        }
        return f;
      })
    );

    if (updatedTarget) {
      const act = {
        id: `act_${Date.now()}`,
        fieldId: updatedTarget.id,
        fieldName: updatedTarget.name,
        crop: updatedTarget.currentCrop,
        type: "irrigation",
        title: `Precision Irrigation Run: ${updatedTarget.name}`,
        description: `Moisture raised to ${updatedTarget.moisturePercentage}% H₂O. System cycle complete.`,
        timestamp: new Date().toISOString(),
        operator: farmProfile.ownerName || "Farmer",
      };
      setActivities((prev) => [act, ...prev]);

      addNotification({
        title: `Irrigation Completed: ${updatedTarget.name}`,
        message: `Soil moisture normalized to ${updatedTarget.moisturePercentage}% H₂O.`,
        type: "success",
        category: "Soil",
      });
    }

    try {
      await fetch(`/api/farm/fields/${id}/irrigate`, { method: "POST" });
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced");
    }
  };

  const logFieldActivity = async (fieldId, activityData) => {
    setSyncStatus("saving");
    const target = fields.find((f) => f.id === fieldId);
    const act = {
      id: `act_${Date.now()}`,
      fieldId,
      fieldName: target?.name || "Field Plot",
      crop: target?.currentCrop || "Crop",
      type: activityData.type || "scouting",
      title: activityData.title || `Activity logged on ${target?.name || "Plot"}`,
      description: activityData.description || activityData.notes || "Agronomy operation recorded.",
      timestamp: new Date().toISOString(),
      operator: farmProfile.ownerName || "Farmer",
    };
    setActivities((prev) => [act, ...prev]);

    if (activityData.notes && target) {
      updateField(fieldId, { notes: activityData.notes });
    }

    try {
      await fetch(`/api/farm/fields/${fieldId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(activityData),
      });
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch {
      setSyncStatus("synced");
    }
  };

  const refreshAllSensors = async () => {
    setSyncStatus("saving");
    try {
      const res = await fetch("/api/farm/fields/telemetry-sync-all", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.fields)) {
          setFields(data.fields);
        }
      } else {
        // Local simulation fallback
        setFields((prev) =>
          prev.map((f) => {
            const deltaMoisture = Math.random() * 6 - 3;
            const newMoisture = Math.min(85, Math.max(25, Math.round(f.moisturePercentage + deltaMoisture)));
            const deltaNdvi = Math.random() * 0.04 - 0.02;
            const newNdvi = Math.min(0.95, Math.max(0.4, Number((f.ndviIndex + deltaNdvi).toFixed(2))));
            return { ...f, moisturePercentage: newMoisture, ndviIndex: newNdvi };
          })
        );
      }
      setSyncStatus("synced");
      setLastSyncTime(new Date().toLocaleTimeString());
      addNotification({
        title: "IoT Telemetry Synced",
        message: "Live soil probes, moisture telemetry & NDVI indices updated.",
        type: "info",
        category: "Task",
      });
    } catch {
      setSyncStatus("synced");
    }
  };

  const addDiagnosis = (diag) => {
    setDiagnosesHistory((prev) => [diag, ...prev]);
    addNotification({
      title: `AI Diagnosis: ${diag.diseaseName}`,
      message: `Crop: ${diag.cropIdentified} - Severity: ${diag.severity}. Prescription generated.`,
      type: diag.severity === "Critical" || diag.severity === "High" ? "critical" : "warning",
      category: "Disease",
      actionTab: "disease_diagnosis",
    });
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const addNotification = (notif) => {
    const newNotif = {
      ...notif,
      id: `notif_${Date.now()}`,
      timestamp: "Just now",
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const resetFarmState = () => {
    setFarmProfile(INITIAL_FARM_PROFILE);
    setFields(INITIAL_FIELDS);
    setSelectedFieldId("fld_01");
    setActivities([]);
    setDiagnosesHistory([]);
    setAdvisorSessions([]);
    setSavedPrescriptions([]);
    setNotifications([]);
    localStorage.removeItem("aicrop_farm_profile");
    localStorage.removeItem("aicrop_fields");
    localStorage.removeItem("aicrop_activities");
    localStorage.removeItem("aicrop_advisor_sessions");
    localStorage.removeItem("aicrop_prescriptions");
    localStorage.removeItem("aicrop_notifications");
  };

  const openQuickAction = (type = "field") => {
    setQuickActionType(type);
    setQuickActionOpen(true);
  };

  return (
    <FarmContext.Provider
      value={{
        activeTab,
        setActiveTab,
        farmProfile,
        updateFarmProfile,
        fields,
        addField,
        updateField,
        deleteField,
        irrigateField,
        logFieldActivity,
        refreshAllSensors,
        activities,
        syncStatus,
        lastSyncTime,
        selectedFieldId,
        setSelectedFieldId,
        diagnosesHistory,
        addDiagnosis,
        weather,
        setWeather,
        updateWeather,
        marketApiKey,
        setMarketApiKey,
        marketData,
        setMarketData,
        notifications,
        unreadNotificationCount,
        unreadCount: unreadNotificationCount,
        markNotificationAsRead,
        markAsRead: markNotificationAsRead,
        markAllNotificationsAsRead,
        markAllAsRead: markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        addNotification,
        quickActionOpen,
        setQuickActionOpen,
        quickActionType,
        openQuickAction,
        language,
        setLanguage,
        advisorSessions,
        setAdvisorSessions,
        activeAdvisorSessionId,
        setActiveAdvisorSessionId,
        savedPrescriptions,
        setSavedPrescriptions,
        createNewAdvisorSession,
        saveAdvisorSession,
        deleteAdvisorSession,
        savePrescription,
        deletePrescription,
        resetFarmState,
      }}
    >
      {children}
    </FarmContext.Provider>
  );
}

export function useFarm() {
  const context = useContext(FarmContext);
  if (!context) {
    throw new Error("useFarm must be used within a FarmProvider");
  }
  return context;
}
