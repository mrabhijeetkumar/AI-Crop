import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize with null or saved authenticated session
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_settings");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [farmProfile, setFarmProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("agri_farm_profile");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("agri_ai_token") || null;
  });

  const [dbTelemetry, setDbTelemetry] = useState({
    isConnected: true,
    databaseName: "agri_crop_db",
    uriMasked: "Real-Time Cloud Persistence Ready",
    collections: ["users", "user_settings", "farm_profiles", "audit_logs", "user_sessions"],
    counts: { users: 1, userSettings: 1, farmProfiles: 1, auditLogs: 5, farmFields: 6 },
    mode: "Realtime Cloud Database Sync",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(new Date().toLocaleTimeString());
  
  // Auth Modal State for Switching / Creating Accounts
  const [activeUserModal, setActiveUserModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'signup'

  const openAuthModal = useCallback((mode = "login") => {
    setAuthModalMode(mode);
    setActiveUserModal(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setActiveUserModal(false);
  }, []);

  // Sync state to local storage when changed
  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem("agri_user", JSON.stringify(user));
        localStorage.setItem("agri_user_id", user.id);
      } else {
        localStorage.removeItem("agri_user");
        localStorage.removeItem("agri_user_id");
      }

      if (settings) {
        localStorage.setItem("agri_settings", JSON.stringify(settings));
      } else {
        localStorage.removeItem("agri_settings");
      }

      if (farmProfile) {
        localStorage.setItem("agri_farm_profile", JSON.stringify(farmProfile));
      } else {
        localStorage.removeItem("agri_farm_profile");
      }

      if (token) {
        localStorage.setItem("agri_ai_token", token);
      } else {
        localStorage.removeItem("agri_ai_token");
      }
    } catch (e) {
      console.warn("Storage sync note:", e);
    }
  }, [user, settings, farmProfile, token]);

  // Fetch verified user state from MongoDB on mount or user change
  const refreshUserAuth = useCallback(async () => {
    const activeUserId = user?.id || localStorage.getItem("agri_user_id");
    if (!activeUserId) {
      // If no active user, check DB status only
      try {
        const dbRes = await fetch("/api/db/status");
        if (dbRes.ok) {
          const dbData = await dbRes.json();
          setDbTelemetry(dbData);
        }
      } catch (e) {
        // quiet
      }
      return;
    }

    try {
      const res = await fetch(`/api/auth/me?userId=${activeUserId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
        if (data.settings) setSettings(data.settings);
        if (data.farmProfile) setFarmProfile(data.farmProfile);
        if (data.database) setDbTelemetry(data.database);
        if (data.token && !token) setToken(data.token);
      } else if (res.status === 404) {
        // User was deleted on server
        setUser(null);
        setSettings(null);
        setFarmProfile(null);
        setToken(null);
      }
    } catch (e) {
      console.warn("Real-time auth sync fetch note:", e);
    }
  }, [user?.id, token]);

  useEffect(() => {
    refreshUserAuth();
  }, [refreshUserAuth]);

  // ----------------------------------------------------
  // Realtime Actions with Automatic MongoDB Persistence
  // ----------------------------------------------------

  const updateUser = async (updatedFields) => {
    setIsSaving(true);
    const userId = user?.id || `usr_${Date.now()}`;
    const newUserData = {
      ...(user || {}),
      ...updatedFields,
      id: userId,
      updatedAt: new Date().toISOString(),
    };
    setUser(newUserData);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserData),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.user) setUser(result.user);
        setLastSavedTime(new Date().toLocaleTimeString());
        return { success: true, user: result.user || newUserData };
      }
      return { success: false, error: "Failed to update profile in database" };
    } catch (err) {
      console.error("Save user error:", err);
      return { success: false, error: err?.message || "Network error" };
    } finally {
      setIsSaving(false);
    }
  };

  const updateProfile = async (payload) => {
    return await updateUser(payload);
  };

  const updateAvatar = async (avatarUrlOrBase64) => {
    setIsSaving(true);
    setUser((prev) => (prev ? { ...prev, avatar: avatarUrlOrBase64 } : null));

    if (!user?.id) {
      setIsSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, avatar: avatarUrlOrBase64 }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.avatar) {
          setUser((prev) => (prev ? { ...prev, avatar: data.avatar } : null));
        }
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Save avatar error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSettings = async (updatedSettingsFields) => {
    setIsSaving(true);
    const userId = user?.id || "usr_guest";
    const newSettings = {
      ...(settings || {}),
      ...updatedSettingsFields,
      userId,
      updatedAt: new Date().toISOString(),
    };
    setSettings(newSettings);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newSettings, userId }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.settings) setSettings(result.settings);
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updateFarmProfile = async (updatedFarmFields) => {
    setIsSaving(true);
    const userId = user?.id || "usr_guest";
    const newFarm = {
      ...(farmProfile || {}),
      ...updatedFarmFields,
      userId,
      updatedAt: new Date().toISOString(),
    };
    setFarmProfile(newFarm);

    try {
      const res = await fetch("/api/user/farm-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newFarm, userId }),
      });
      if (res.ok) {
        const result = await res.json();
        if (result.farmProfile) setFarmProfile(result.farmProfile);
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error("Save farm profile error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    if (!user?.id) return { success: false, error: "Please sign in first" };
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/security/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      });
      const data = await res.json();
      setLastSavedTime(new Date().toLocaleTimeString());
      return data;
    } catch (err) {
      return { success: false, error: "Network error updating credentials" };
    } finally {
      setIsSaving(false);
    }
  };

  const toggle2FA = async (enabled) => {
    if (!user?.id) return { success: false, error: "Please sign in first" };
    setIsSaving(true);
    try {
      const res = await fetch("/api/user/security/2fa", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setUser((prev) => (prev ? { ...prev, twoFactorEnabled: Boolean(enabled) } : null));
      }
      setLastSavedTime(new Date().toLocaleTimeString());
      return data;
    } catch (err) {
      return { success: false, error: "Network error updating 2FA" };
    } finally {
      setIsSaving(false);
    }
  };

  const connectMongoDB = async (mongoUri, dbName) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/db/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mongoUri, dbName }),
      });
      const data = await res.json();
      if (data.stats) {
        setDbTelemetry(data.stats);
      }
      refreshUserAuth();
      return data;
    } catch (err) {
      return { success: false, message: "Failed to connect to MongoDB endpoint." };
    } finally {
      setIsSaving(false);
    }
  };

  const syncAllToMongoDB = async () => {
    if (!user?.id) return { success: false, message: "No active user session to sync" };
    setIsSaving(true);
    try {
      const res = await fetch("/api/db/sync-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await res.json();
      if (data.databaseTelemetry) {
        setDbTelemetry(data.databaseTelemetry);
      }
      setLastSavedTime(new Date().toLocaleTimeString());
      return data;
    } catch (err) {
      return { success: false, message: "Sync failed" };
    } finally {
      setIsSaving(false);
    }
  };

  const refreshDbStatus = async () => {
    try {
      const res = await fetch("/api/db/status");
      if (res.ok) {
        const stats = await res.json();
        setDbTelemetry(stats);
      }
    } catch (err) {
      console.warn("DB status check note:", err);
    }
  };

  const login = async (email, password) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: (email || "").trim(), password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.settings) setSettings(data.settings);
        if (data.farmProfile) setFarmProfile(data.farmProfile);
        if (data.token) setToken(data.token);
      }
      return { ...data, error: data.error || data.detail };
    } catch (err) {
      return { success: false, error: "Login failed" };
    } finally {
      setIsSaving(false);
    }
  };

  const signup = async (formData) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        if (data.settings) setSettings(data.settings);
        if (data.farmProfile) setFarmProfile(data.farmProfile);
        if (data.token) setToken(data.token);
      }
      return { ...data, error: data.error || data.detail };
    } catch (err) {
      return { success: false, error: "Registration failed" };
    } finally {
      setIsSaving(false);
    }
  };

  const wipeAllLocalStorage = () => {
    const keysToPurge = [
      "agri_user",
      "agri_user_id",
      "agri_settings",
      "agri_farm_profile",
      "agri_ai_token",
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
    keysToPurge.forEach((k) => localStorage.removeItem(k));
  };

  const logout = async () => {
    const currentUserId = user?.id;
    try {
      if (currentUserId) {
        await fetch("/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: currentUserId }),
        });
      }
    } catch (e) {
      // quiet
    }
    setUser(null);
    setSettings(null);
    setFarmProfile(null);
    setToken(null);
    wipeAllLocalStorage();
  };

  const downloadBackup = async (targetUserId) => {
    const uid = targetUserId || user?.id || "usr_abhijeet_01";
    try {
      const res = await fetch(`/api/user/backup?userId=${uid}`);
      if (!res.ok) throw new Error("Failed to download backup");
      const data = await res.json();
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `smart_agriculture_farm_backup_${uid}_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      return { success: true, data };
    } catch (err) {
      console.error("Backup export error:", err);
      return { success: false, error: "Failed to download farm data archive" };
    }
  };

  const deleteAccount = async (options = {}) => {
    const targetUserId = options.userId || user?.id;
    if (!targetUserId) return { success: false, error: "No active user ID found to delete." };

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          userId: targetUserId,
          confirmationPhrase: options.confirmationPhrase || "DELETE",
          backupRequested: options.backupRequested || false,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser(null);
        setSettings(null);
        setFarmProfile(null);
        setToken(null);
        wipeAllLocalStorage();
        return {
          success: true,
          message: data.message || "Account permanently wiped from MongoDB.",
          deletedStats: data.deletedStats,
        };
      }
      return { success: false, error: data.error || data.message || "Failed to delete account" };
    } catch (err) {
      console.error("Account deletion network error:", err);
      // Fallback try with DELETE method
      try {
        const delRes = await fetch(`/api/user/account?userId=${targetUserId}`, { method: "DELETE" });
        const delData = await delRes.json();
        if (delRes.ok && delData.success) {
          setUser(null);
          setSettings(null);
          setFarmProfile(null);
          setToken(null);
          wipeAllLocalStorage();
          return { success: true, message: delData.message };
        }
      } catch (fallbackErr) {
        // silence
      }
      return { success: false, error: "Network error occurred while contacting MongoDB server." };
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
        isAuthenticated: Boolean(user && user.id),
        activeUserModal,
        setActiveUserModal,
        authModalMode,
        openAuthModal,
        closeAuthModal,
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
