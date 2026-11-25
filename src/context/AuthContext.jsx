import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const AuthContext = createContext(null);

const KEYS = {
  user: "agri_user",
  userId: "agri_user_id",
  settings: "agri_settings",
  farm: "agri_farm_profile",
  token: "agri_ai_token",
};

const NETWORK_ERROR = "Network error. Please check your internet connection and try again.";

/* ------------------------------------------------------------------ */
/*  Storage helpers: "Remember me" => localStorage, otherwise          */
/*  sessionStorage (cleared when the browser is closed).               */
/* ------------------------------------------------------------------ */
function safeGet(key) {
  try {
    return sessionStorage.getItem(key) ?? localStorage.getItem(key);
  } catch {
    return null;
  }
}

function readJSON(key) {
  try {
    const raw = safeGet(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeKey(key, value, remember) {
  try {
    const main = remember ? localStorage : sessionStorage;
    const other = remember ? sessionStorage : localStorage;
    other.removeItem(key);
    if (value === null || value === undefined) main.removeItem(key);
    else main.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
}

function removeFromBoth(keys) {
  keys.forEach((k) => {
    try { localStorage.removeItem(k); } catch { /* ignore */ }
    try { sessionStorage.removeItem(k); } catch { /* ignore */ }
  });
}

const LEGACY_LOCAL_KEYS = [
  "aicrop_farm_profile",
  "aicrop_fields",
  "aicrop_activities",
  "aicrop_tab",
  "aicrop_advisor_sessions",
  "aicrop_diagnoses",
  "aicrop_market_api_key",
  "aicrop_prescriptions",
  "aicrop_notifications",
];

function wipeLocalData({ includeSnapshots = false } = {}) {
  removeFromBoth([...Object.values(KEYS), ...LEGACY_LOCAL_KEYS]);
  if (includeSnapshots) {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("aicrop_snapshot_"))
        .forEach((k) => localStorage.removeItem(k));
    } catch { /* ignore */ }
  }
}

/* ------------------------------------------------------------------ */
/*  Tiny fetch wrapper: always returns { ok, status, data }            */
/* ------------------------------------------------------------------ */
async function request(url, { method = "GET", body, token } = {}) {
  try {
    const headers = {};
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    let data = {};
    try { data = await res.json(); } catch { data = {}; }
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { success: false, error: NETWORK_ERROR } };
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => safeGet(KEYS.token));
  const [user, setUser] = useState(() => (safeGet(KEYS.token) ? readJSON(KEYS.user) : null));
  const [settings, setSettings] = useState(() => (safeGet(KEYS.token) ? readJSON(KEYS.settings) : null));
  const [farmProfile, setFarmProfile] = useState(() => (safeGet(KEYS.token) ? readJSON(KEYS.farm) : null));

  const [dbTelemetry, setDbTelemetry] = useState({
    isConnected: false,
    databaseName: "",
    uriMasked: "Checking connection...",
    collections: [],
    counts: { users: 0, userSettings: 0, farmProfiles: 0, auditLogs: 0, farmFields: 0 },
    mode: "Checking database connection...",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(() => new Date().toLocaleTimeString());

  // Auth modal (switch / create account)
  const [activeUserModal, setActiveUserModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login");
  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setActiveUserModal(true);
  }, []);
  const closeAuthModal = useCallback(() => setActiveUserModal(false), []);

  const tokenRef = useRef(token);
  tokenRef.current = token;
  const rememberRef = useRef(
    (() => {
      try { return !sessionStorage.getItem(KEYS.token); } catch { return true; }
    })()
  );

  const touchSaved = () => setLastSavedTime(new Date().toLocaleTimeString());

  const clearSession = useCallback(() => {
    setUser(null);
    setSettings(null);
    setFarmProfile(null);
    setToken(null);
  }, []);

  // Keep browser storage in sync with state
  useEffect(() => {
    const remember = rememberRef.current;
    writeKey(KEYS.token, token, remember);
    writeKey(KEYS.user, token ? user : null, remember);
    writeKey(KEYS.userId, token && user ? user.id : null, remember);
    writeKey(KEYS.settings, token ? settings : null, remember);
    writeKey(KEYS.farm, token ? farmProfile : null, remember);
  }, [token, user, settings, farmProfile]);

  /** Authenticated request. Logs the user out automatically when the server says the session is invalid. */
  const call = useCallback(
    async (url, opts = {}) => {
      const sent = tokenRef.current;
      const result = await request(url, { ...opts, token: sent });
      if (result.status === 401 && sent && sent === tokenRef.current) clearSession();
      return result;
    },
    [clearSession]
  );

  /** Raw authenticated fetch for other components (adds the Bearer token). */
  const authFetch = useCallback(
    async (url, options = {}) => {
      const sent = tokenRef.current;
      const headers = { ...(options.headers || {}), ...(sent ? { Authorization: `Bearer ${sent}` } : {}) };
      const res = await fetch(url, { ...options, headers });
      if (res.status === 401 && sent && sent === tokenRef.current) clearSession();
      return res;
    },
    [clearSession]
  );

  const applyAuth = (data, remember) => {
    rememberRef.current = remember;
    setUser(data.user);
    setSettings(data.settings || null);
    setFarmProfile(data.farmProfile || null);
    setToken(data.token);
  };

  /* ---------------- verify session with server ---------------- */
  const refreshUserAuth = useCallback(async () => {
    if (!tokenRef.current) {
      const res = await request("/api/db/status");
      if (res.ok) setDbTelemetry((prev) => ({ ...prev, ...res.data }));
      return;
    }
    const res = await call("/api/auth/me");
    if (res.ok && res.data.user) {
      setUser(res.data.user);
      if (res.data.settings) setSettings(res.data.settings);
      if (res.data.farmProfile) setFarmProfile(res.data.farmProfile);
      if (res.data.database) setDbTelemetry(res.data.database);
    }
  }, [call]);

  useEffect(() => {
    refreshUserAuth();
  }, [token, refreshUserAuth]);

  /* ---------------- sign up / login / logout ---------------- */
  const signup = async (formData) => {
    setIsSaving(true);
    try {
      const res = await request("/api/auth/signup", { method: "POST", body: formData });
      if (res.ok && res.data.success && res.data.user && res.data.token) {
        applyAuth(res.data, true);
        return res.data;
      }
      return { success: false, error: res.data.error || "Registration failed. Please try again.", field: res.data.field };
    } finally {
      setIsSaving(false);
    }
  };

  const login = async (identifier, password, remember = true) => {
    setIsSaving(true);
    try {
      const res = await request("/api/auth/login", {
        method: "POST",
        body: { identifier: String(identifier || "").trim(), password, remember },
      });
      if (res.ok && res.data.success && res.data.user && res.data.token) {
        applyAuth(res.data, remember);
        return res.data;
      }
      return { success: false, error: res.data.error || "Unable to sign in. Please try again." };
    } finally {
      setIsSaving(false);
    }
  };

  const forgotPassword = async (email) => {
    const res = await request("/api/auth/forgot-password", { method: "POST", body: { email: String(email || "").trim() } });
    return res.ok ? res.data : { success: false, error: res.data.error || "Could not process the request." };
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await request("/api/auth/reset-password", {
      method: "POST",
      body: { email: String(email || "").trim(), code: String(code || "").trim(), newPassword },
    });
    return res.ok ? res.data : { success: false, error: res.data.error || "Password reset failed." };
  };

  const logout = async () => {
    if (tokenRef.current) await call("/api/auth/logout", { method: "POST" }); // best effort
    clearSession();
    wipeLocalData();
  };

  /* ---------------- profile / settings (server first) ---------------- */
  const updateUser = async (fields) => {
    setIsSaving(true);
    try {
      const res = await call("/api/user/profile", { method: "PUT", body: { ...fields, id: user?.id } });
      if (res.ok && res.data.user) {
        setUser(res.data.user);
        touchSaved();
        return { success: true, user: res.data.user };
      }
      return { success: false, error: res.data.error || "Failed to update profile." };
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = (payload) => updateUser(payload);

  const updateAvatar = async (avatarUrlOrBase64) => {
    const previous = user?.avatar || "";
    setIsSaving(true);
    setUser((prev) => (prev ? { ...prev, avatar: avatarUrlOrBase64 } : prev)); // optimistic
    try {
      const res = await call("/api/user/avatar", { method: "POST", body: { userId: user?.id, avatar: avatarUrlOrBase64 } });
      if (res.ok && res.data.success) {
        setUser((prev) => (prev ? { ...prev, avatar: res.data.avatar || "" } : prev));
        touchSaved();
        return { success: true };
      }
      setUser((prev) => (prev ? { ...prev, avatar: previous } : prev)); // rollback
      return { success: false, error: res.data.error || "Failed to save photo." };
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = async (fields) => {
    const previous = settings;
    setIsSaving(true);
    setSettings((prev) => ({ ...(prev || {}), ...fields })); // optimistic
    try {
      const res = await call("/api/user/settings", { method: "PUT", body: fields });
      if (res.ok && res.data.settings) {
        setSettings(res.data.settings);
        touchSaved();
        return { success: true };
      }
      setSettings(previous);
      return { success: false, error: res.data.error || "Failed to save settings." };
    } finally {
      setIsSaving(false);
    }
  };

  const updateFarmProfile = async (fields) => {
    const previous = farmProfile;
    setIsSaving(true);
    setFarmProfile((prev) => ({ ...(prev || {}), ...fields })); // optimistic
    try {
      const res = await call("/api/user/farm-profile", { method: "PUT", body: fields });
      if (res.ok && res.data.farmProfile) {
        setFarmProfile(res.data.farmProfile);
        touchSaved();
        return { success: true };
      }
      setFarmProfile(previous);
      return { success: false, error: res.data.error || "Failed to save farm profile." };
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- security ---------------- */
  const updatePassword = async (currentPassword, newPassword) => {
    setIsSaving(true);
    try {
      const res = await call("/api/user/security/password", { method: "PUT", body: { currentPassword, newPassword } });
      if (res.ok) touchSaved();
      return res.ok ? res.data : { success: false, error: res.data.error || "Could not update password." };
    } finally {
      setIsSaving(false);
    }
  };

  const toggle2FA = async (enabled) => {
    setIsSaving(true);
    try {
      const res = await call("/api/user/security/2fa", { method: "PUT", body: { enabled } });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, twoFactorEnabled: Boolean(enabled) } : prev));
        touchSaved();
        return res.data;
      }
      return { success: false, error: res.data.error || "Could not update 2FA." };
    } finally {
      setIsSaving(false);
    }
  };

  /* ---------------- database ---------------- */
  // The Mongo connection string now lives only in the server .env (MONGODB_URI).
  // Letting the browser re-point the database was a security hole, so the endpoint was removed.
  const connectMongoDB = async () => ({
    success: false,
    message: "The database is configured on the server using MONGODB_URI in the .env file.",
  });

  const syncAllToMongoDB = async () => {
    const res = await call("/api/db/sync-all", { method: "POST", body: {} });
    if (res.ok && res.data.databaseTelemetry) {
      setDbTelemetry(res.data.databaseTelemetry);
      touchSaved();
      return res.data;
    }
    return { success: false, message: res.data.error || "Sync failed" };
  };

  const refreshDbStatus = async () => {
    const res = await call("/api/db/status");
    if (res.ok) setDbTelemetry((prev) => ({ ...prev, ...res.data }));
  };

  const downloadBackup = async () => {
    const res = await call("/api/user/backup");
    if (!res.ok) return { success: false, error: res.data.error || "Failed to download farm data archive" };
    try {
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ai_crop_profit_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, data: res.data };
    } catch {
      return { success: false, error: "Failed to save the backup file." };
    }
  };

  /** options: { password, confirmationPhrase, backupRequested } */
  const deleteAccount = async (options = {}) => {
    if (!tokenRef.current) return { success: false, error: "Please sign in first." };
    setIsSaving(true);
    try {
      const res = await call("/api/user/account/delete", {
        method: "POST",
        body: {
          password: options.password || "",
          confirmationPhrase: options.confirmationPhrase || "",
          backupRequested: Boolean(options.backupRequested),
        },
      });
      if (res.ok && res.data.success) {
        clearSession();
        wipeLocalData({ includeSnapshots: true });
        return { success: true, message: res.data.message, deletedStats: res.data.deletedStats, backupData: res.data.backupData };
      }
      return { success: false, error: res.data.error || "Failed to delete account." };
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        farmProfile,
        token,
        dbTelemetry,
        isSaving,
        lastSavedTime,
        isAuthenticated: Boolean(user && user.id && token),
        activeUserModal,
        setActiveUserModal,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        authFetch,
        updateUser,
        updateProfile,
        updateAvatar,
        updateSettings,
        updateFarmProfile,
        updatePassword,
        toggle2FA,
        connectMongoDB,
        syncAllToMongoDB,
        refreshDbStatus,
        refreshUserAuth,
        login,
        signup,
        forgotPassword,
        resetPassword,
        logout,
        downloadBackup,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
