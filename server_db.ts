import { MongoClient, Db, Collection } from "mongodb";

export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone: string;
  role: "Farm Owner" | "Farm Manager" | "Senior Agronomist" | "Field Supervisor" | "Agricultural Officer";
  designation: string;
  bio: string;
  location: string;
  state: string;
  district: string;
  avatar: string;
  farmerId: string;
  kccNumber: string;
  experienceYears: number;
  twoFactorEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
}

export interface UserSettingsDoc {
  userId: string;
  theme: "dark" | "light" | "system";
  language: string;
  currency: string;
  unitSystem: "metric" | "imperial";
  aiModel: string;
  aiTone: "scientific" | "practical" | "concise";
  notifications: {
    sprayAlerts: boolean;
    mandiSpikes: boolean;
    pestWarnings: boolean;
    weatherExtremes: boolean;
    weeklySummaryEmail: boolean;
    smsAlerts: boolean;
    whatsAppUpdates: boolean;
  };
  autoSyncSensors: boolean;
  dataSharingConsent: boolean;
  updatedAt: string;
}

export interface FarmProfileDoc {
  userId: string;
  farmName: string;
  ownerName: string;
  location: string;
  district: string;
  state: string;
  country: string;
  totalAreaAcres: number;
  primaryWaterSource: string;
  primarySoilType: string;
  primaryCrops: string[];
  geoCoordinates?: { lat: number; lon: number };
  apmcMandiYard: string;
  irrigationType: string;
  currency: string;
  updatedAt: string;
}

export interface AuditLogDoc {
  id: string;
  userId: string;
  action: string;
  category: "auth" | "profile" | "settings" | "farm" | "security" | "export";
  details: string;
  ip: string;
  userAgent: string;
  timestamp: string;
}

export interface UserSessionDoc {
  id: string;
  userId: string;
  token: string;
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent?: boolean;
}

// Initial In-Memory Fallback and Active State
let currentClient: MongoClient | null = null;
let currentDb: Db | null = null;
let isConnected = false;
let connectionError: string | null = null;
let activeMongoUri: string = process.env.MONGODB_URI || "";
let activeDbName: string = process.env.MONGODB_DB_NAME || "agri_crop_db";

// In-memory collections (mirrors MongoDB collections when DB is disconnected)
const memUsers: Map<string, UserDoc> = new Map();
const memSettings: Map<string, UserSettingsDoc> = new Map();
const memFarmProfiles: Map<string, FarmProfileDoc> = new Map();
const memAuditLogs: AuditLogDoc[] = [];
const memSessions: Map<string, UserSessionDoc> = new Map();

// Default demo user seeding
const DEFAULT_USER_ID = "usr_abhijeet_01";

const defaultUser: UserDoc = {
  id: DEFAULT_USER_ID,
  name: "Abhijeet Kumar",
  email: "mrabhijeetkumar01@gmail.com",
  phone: "+91 98765 43210",
  role: "Farm Manager",
  designation: "Head of Agronomy & Precision Farming",
  bio: "Lead Agronomist managing 149 acres across Punjab & Bihar with focus on Wheat (HD-2967), Mustard, and solar drip irrigation systems.",
  location: "Sasaram, Rohtas, Bihar, India",
  state: "Bihar",
  district: "Rohtas",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop",
  farmerId: "PMK-BR-2024-889412",
  kccNumber: "KCC-SBIN-89304721",
  experienceYears: 12,
  twoFactorEnabled: false,
  emailVerified: true,
  phoneVerified: true,
  createdAt: "2025-01-10T08:00:00.000Z",
  updatedAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

const defaultSettings: UserSettingsDoc = {
  userId: DEFAULT_USER_ID,
  theme: "dark",
  language: "en",
  currency: "₹",
  unitSystem: "metric",
  aiModel: "gemini-2.5-flash",
  aiTone: "scientific",
  notifications: {
    sprayAlerts: true,
    mandiSpikes: true,
    pestWarnings: true,
    weatherExtremes: true,
    weeklySummaryEmail: false,
    smsAlerts: true,
    whatsAppUpdates: true,
  },
  autoSyncSensors: true,
  dataSharingConsent: true,
  updatedAt: new Date().toISOString(),
};

const defaultFarmProfile: FarmProfileDoc = {
  userId: DEFAULT_USER_ID,
  farmName: "Geork Agricultural Estate",
  ownerName: "Abhijeet Kumar",
  location: "Phagwara, Punjab, India",
  district: "Kapurthala",
  state: "Punjab",
  country: "India",
  totalAreaAcres: 149,
  primaryWaterSource: "Solar Micro-Drip & Tubewell Canal",
  primarySoilType: "Alluvial Sandy Loam",
  primaryCrops: ["Wheat (HD-2967)", "Mustard (Pusa Bold)", "Maize (DKC-9108)", "Soybean (JS-335)"],
  geoCoordinates: { lat: 31.22, lon: 75.77 },
  apmcMandiYard: "Khanna APMC Grain Market (Asia's Largest)",
  irrigationType: "Solar Drip & Sprinkler Network",
  currency: "₹",
  updatedAt: new Date().toISOString(),
};

// Seed in-memory initially
memUsers.set(DEFAULT_USER_ID, defaultUser);
memSettings.set(DEFAULT_USER_ID, defaultSettings);
memFarmProfiles.set(DEFAULT_USER_ID, defaultFarmProfile);
memSessions.set("sess_current_abhijeet", {
  id: "sess_current_abhijeet",
  userId: DEFAULT_USER_ID,
  token: "demo_jwt_token_abhijeet",
  device: "Chrome / Desktop (MacOS)",
  browser: "Google Chrome v131",
  os: "macOS Sonoma",
  ip: "103.24.120.45",
  location: "Sasaram, Bihar, India",
  createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  lastActiveAt: new Date().toISOString(),
  isCurrent: true,
});

memAuditLogs.push({
  id: `log_init_${Date.now()}`,
  userId: DEFAULT_USER_ID,
  action: "System Initialized",
  category: "auth",
  details: "Agronomy platform loaded with real-time state engine & MongoDB sync connector.",
  ip: "127.0.0.1",
  userAgent: "Server Engine",
  timestamp: new Date().toISOString(),
});

/**
 * Sanitize documents before saving to MongoDB:
 * - Strips any `_id` properties so MongoDB manages ObjectId creation cleanly
 * - Strips `undefined` values so BSON driver does not serialize them to `null`
 */
export function sanitizeDoc<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "_id") continue;
    if (value === undefined) continue;
    if (value !== null && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = sanitizeDoc(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/**
 * Automatically repairs any legacy corrupted documents that had _id: null in collections
 */
export async function repairNullIdDocuments(db: Db) {
  const collectionsToFix = ["users", "user_settings", "farm_profiles", "audit_logs", "user_sessions", "farm_fields"];
  for (const collName of collectionsToFix) {
    try {
      const coll = db.collection(collName);
      const docsWithNullId = await coll.find({ $or: [{ _id: null }, { _id: { $type: 10 } }] }).toArray();
      if (docsWithNullId && docsWithNullId.length > 0) {
        console.log(`[MongoDB] Found ${docsWithNullId.length} document(s) with corrupted _id: null in "${collName}". Repairing...`);
        await coll.deleteMany({ $or: [{ _id: null }, { _id: { $type: 10 } }] });
        for (const doc of docsWithNullId) {
          const { _id, ...rest } = doc;
          const cleanDoc = sanitizeDoc(rest);
          if (Object.keys(cleanDoc).length > 0) {
            await coll.insertOne(cleanDoc);
          }
        }
        console.log(`[MongoDB] Successfully repaired corrupted documents in "${collName}".`);
      }
    } catch (err: any) {
      console.warn(`[MongoDB] Auto-repair notice for "${collName}":`, err?.message || err);
    }
  }
}

/**
 * Initialize MongoDB connection
 */
export async function initMongoDB(uri?: string, dbName?: string): Promise<{ success: boolean; message: string; isConnected: boolean; stats?: any }> {
  const targetUri = (uri || activeMongoUri || process.env.MONGODB_URI || "").trim();
  const targetDbName = (dbName || activeDbName || process.env.MONGODB_DB_NAME || "agri_crop_db").trim();

  if (!targetUri) {
    isConnected = false;
    connectionError = "No MongoDB URI provided. Running in high-performance in-memory persistence mode.";
    return {
      success: false,
      isConnected: false,
      message: connectionError,
    };
  }

  try {
    if (currentClient) {
      try {
        await currentClient.close();
      } catch (e) {
        // ignore close error
      }
      currentClient = null;
      currentDb = null;
    }

    console.log(`[MongoDB] Connecting to ${targetUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")} (DB: ${targetDbName})...`);

    const client = new MongoClient(targetUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      ignoreUndefined: true,
    });

    await client.connect();
    const db = client.db(targetDbName);

    // Ping to verify
    await db.command({ ping: 1 });

    currentClient = client;
    currentDb = db;
    isConnected = true;
    connectionError = null;
    activeMongoUri = targetUri;
    activeDbName = targetDbName;

    console.log(`[MongoDB] Connected successfully to database: ${targetDbName}`);

    // Automatically repair any corrupted documents with _id: null from legacy writes
    await repairNullIdDocuments(db);

    // Create indexes safely with conflict resolution
    const ensureIndex = async (collectionName: string, keySpec: Record<string, 1 | -1>, options: any = {}) => {
      try {
        const coll = db.collection(collectionName);
        const existingIndexes = await coll.listIndexes().toArray().catch(() => []);
        const keyNames = Object.keys(keySpec);
        const alreadyExists = existingIndexes.some((idx: any) => {
          if (!idx.key) return false;
          const idxKeys = Object.keys(idx.key);
          return keyNames.length === idxKeys.length && keyNames.every((k) => idx.key[k] === keySpec[k]);
        });

        if (!alreadyExists) {
          await coll.createIndex(keySpec, options);
        }
      } catch (err: any) {
        // Silently ignore if already indexed or options clash (code 85/86)
        if (err?.code === 85 || err?.code === 86 || err?.message?.includes("existing index")) {
          return;
        }
        console.warn(`[MongoDB] Notice on index for ${collectionName}:`, err?.message || err);
      }
    };

    try {
      await ensureIndex("users", { email: 1 }, { unique: true });
      await ensureIndex("users", { id: 1 }, { unique: true });
      await ensureIndex("user_settings", { userId: 1 }, { unique: true });
      await ensureIndex("farm_profiles", { userId: 1 }, { unique: true });
      await ensureIndex("audit_logs", { timestamp: -1 });
    } catch (idxErr) {
      // safe fallback
    }

    // Seed default user to MongoDB if empty
    const usersCount = await db.collection("users").countDocuments();
    if (usersCount === 0) {
      await db.collection("users").insertOne(sanitizeDoc(defaultUser));
      await db.collection("user_settings").insertOne(sanitizeDoc(defaultSettings));
      await db.collection("farm_profiles").insertOne(sanitizeDoc(defaultFarmProfile));
      console.log("[MongoDB] Seeded default farm manager profile to MongoDB.");
    } else {
      // Sync from MongoDB into in-memory cache for speed
      const user = await db.collection("users").findOne({ id: DEFAULT_USER_ID });
      if (user) {
        const { _id, ...cleanUser } = user;
        memUsers.set(DEFAULT_USER_ID, cleanUser as any);
      }
      const settings = await db.collection("user_settings").findOne({ userId: DEFAULT_USER_ID });
      if (settings) {
        const { _id, ...cleanSettings } = settings;
        memSettings.set(DEFAULT_USER_ID, cleanSettings as any);
      }
      const profile = await db.collection("farm_profiles").findOne({ userId: DEFAULT_USER_ID });
      if (profile) {
        const { _id, ...cleanProfile } = profile;
        memFarmProfiles.set(DEFAULT_USER_ID, cleanProfile as any);
      }
    }

    const stats = await getDatabaseStats();

    return {
      success: true,
      isConnected: true,
      message: `Connected successfully to MongoDB Database: "${targetDbName}"`,
      stats,
    };
  } catch (error: any) {
    console.error("[MongoDB] Connection Error:", error?.message || error);
    isConnected = false;
    connectionError = error?.message || "Failed to connect to MongoDB cluster";
    return {
      success: false,
      isConnected: false,
      message: `MongoDB Connection Error: ${connectionError}`,
    };
  }
}

/**
 * Get Database Telemetry & Collection Stats
 */
export async function getDatabaseStats() {
  if (currentDb && isConnected) {
    try {
      const collections = await currentDb.listCollections().toArray();
      const usersCount = await currentDb.collection("users").countDocuments();
      const settingsCount = await currentDb.collection("user_settings").countDocuments();
      const farmProfilesCount = await currentDb.collection("farm_profiles").countDocuments();
      const logsCount = await currentDb.collection("audit_logs").countDocuments();
      const fieldsCount = await currentDb.collection("farm_fields").countDocuments();

      return {
        isConnected: true,
        databaseName: activeDbName,
        uriMasked: activeMongoUri ? activeMongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") : "Not Set",
        collections: collections.map((c) => c.name),
        counts: {
          users: usersCount,
          userSettings: settingsCount,
          farmProfiles: farmProfilesCount,
          auditLogs: logsCount,
          farmFields: fieldsCount,
        },
        mode: "MongoDB Atlas / Cloud Connected",
        lastPing: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn("[MongoDB] Failed to get stats:", e?.message);
    }
  }

  return {
    isConnected: false,
    databaseName: activeDbName || "agri_crop_db",
    uriMasked: activeMongoUri ? activeMongoUri.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") : "Not Configured (Ready for your Mongo URI)",
    collections: ["users", "user_settings", "farm_profiles", "audit_logs", "user_sessions"],
    counts: {
      users: memUsers.size,
      userSettings: memSettings.size,
      farmProfiles: memFarmProfiles.size,
      auditLogs: memAuditLogs.length,
      farmFields: 6,
    },
    mode: "In-Memory Realtime Cache (Awaiting MongoDB URI)",
    lastPing: new Date().toISOString(),
    connectionError,
  };
}

// ----------------------------------------------------
// Realtime User CRUD & Operations
// ----------------------------------------------------

export async function getUserById(userId: string): Promise<UserDoc | null> {
  if (!userId) return null;
  if (currentDb && isConnected) {
    try {
      const doc = await currentDb.collection("users").findOne({ id: userId });
      if (doc) {
        const { _id, ...cleanDoc } = doc;
        return cleanDoc as unknown as UserDoc;
      }
    } catch (e) {
      console.warn("[MongoDB] getUserById fallback to memory:", e);
    }
  }
  return memUsers.get(userId) || null;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  if (!email) return null;
  if (currentDb && isConnected) {
    try {
      const doc = await currentDb.collection("users").findOne({ email: email.toLowerCase().trim() });
      if (doc) {
        const { _id, ...cleanDoc } = doc;
        return cleanDoc as unknown as UserDoc;
      }
    } catch (e) {
      console.warn("[MongoDB] getUserByEmail fallback to memory:", e);
    }
  }
  for (const u of memUsers.values()) {
    if (u.email.toLowerCase() === email.toLowerCase().trim()) return u;
  }
  return null;
}

export async function saveUser(user: Partial<UserDoc> & { id: string }): Promise<UserDoc> {
  const existing = await getUserById(user.id);
  const merged: UserDoc = {
    id: user.id,
    name: user.name !== undefined ? user.name : (existing?.name || ""),
    email: user.email !== undefined ? user.email : (existing?.email || ""),
    phone: user.phone !== undefined ? user.phone : (existing?.phone || ""),
    role: user.role !== undefined ? user.role : (existing?.role || "Farm Manager"),
    designation: user.designation !== undefined ? user.designation : (existing?.designation || ""),
    bio: user.bio !== undefined ? user.bio : (existing?.bio || ""),
    location: user.location !== undefined ? user.location : (existing?.location || ""),
    state: user.state !== undefined ? user.state : (existing?.state || ""),
    district: user.district !== undefined ? user.district : (existing?.district || ""),
    avatar: user.avatar !== undefined ? user.avatar : (existing?.avatar || ""),
    farmerId: user.farmerId !== undefined ? user.farmerId : (existing?.farmerId || `PMK-${Date.now().toString().slice(-6)}`),
    kccNumber: user.kccNumber !== undefined ? user.kccNumber : (existing?.kccNumber || ""),
    experienceYears: user.experienceYears !== undefined ? user.experienceYears : (existing?.experienceYears ?? 0),
    twoFactorEnabled: user.twoFactorEnabled !== undefined ? user.twoFactorEnabled : (existing?.twoFactorEnabled ?? false),
    emailVerified: user.emailVerified !== undefined ? user.emailVerified : (existing?.emailVerified ?? false),
    phoneVerified: user.phoneVerified !== undefined ? user.phoneVerified : (existing?.phoneVerified ?? false),
    createdAt: existing?.createdAt || user.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: user.lastLoginAt || existing?.lastLoginAt || new Date().toISOString(),
  };

  memUsers.set(merged.id, merged);

  if (currentDb && isConnected) {
    try {
      const cleanData = sanitizeDoc(merged);
      await currentDb.collection("users").updateOne(
        { id: merged.id },
        { $set: cleanData },
        { upsert: true }
      );
    } catch (e: any) {
      console.error("[MongoDB] Failed to update user:", e);
      // Auto-recover if duplicate null _id or legacy index conflict
      if (e?.message?.includes("E11000") || e?.message?.includes("duplicate key")) {
        try {
          await currentDb.collection("users").deleteMany({ _id: null });
          const cleanData = sanitizeDoc(merged);
          await currentDb.collection("users").deleteOne({ id: merged.id });
          await currentDb.collection("users").insertOne(cleanData);
          console.log("[MongoDB] Auto-recovered user update after resolving duplicate key index conflict.");
        } catch (retryErr) {
          console.error("[MongoDB] Retry update user failed:", retryErr);
        }
      }
    }
  }

  return merged;
}

export interface DeletionResult {
  success: boolean;
  message: string;
  userId: string;
  deletedStats: {
    users: number;
    userSettings: number;
    farmProfiles: number;
    farmFields: number;
    soilTests: number;
    cropRecords: number;
    auditLogs: number;
    sessions: number;
    conversations: number;
    totalDocuments: number;
  };
}

/**
 * Permanently and safely deletes user account and all associated documents from MongoDB across all collections.
 * Also purges in-memory stores and active sessions.
 */
export async function deleteUser(userId: string): Promise<boolean> {
  const result = await deleteUserCascade(userId);
  return result.success;
}

export async function deleteUserCascade(userId: string): Promise<DeletionResult> {
  const stats = {
    users: 0,
    userSettings: 0,
    farmProfiles: 0,
    farmFields: 0,
    soilTests: 0,
    cropRecords: 0,
    auditLogs: 0,
    sessions: 0,
    conversations: 0,
    totalDocuments: 0,
  };

  if (!userId) {
    return {
      success: false,
      message: "User ID is required for deletion.",
      userId: "",
      deletedStats: stats,
    };
  }

  // 1. Purge from In-Memory Stores
  const targetUser = memUsers.get(userId);
  const userEmail = targetUser?.email;

  memUsers.delete(userId);
  memSettings.delete(userId);
  memFarmProfiles.delete(userId);

  // Clear in-memory sessions
  for (const [key, s] of memSessions.entries()) {
    if (s.userId === userId) {
      memSessions.delete(key);
      stats.sessions++;
    }
  }

  // Clear in-memory audit logs
  let removedLogsCount = 0;
  for (let i = memAuditLogs.length - 1; i >= 0; i--) {
    if (memAuditLogs[i].userId === userId) {
      memAuditLogs.splice(i, 1);
      removedLogsCount++;
    }
  }
  stats.auditLogs += removedLogsCount;

  // 2. Cascade Purge from MongoDB
  if (currentDb && isConnected) {
    try {
      // Collections to wipe with userId / id / email selectors
      const userQueries = [{ id: userId }];
      if (userEmail) userQueries.push({ email: userEmail } as any);

      // A. Users collection
      const uRes = await currentDb.collection("users").deleteMany({ $or: userQueries });
      stats.users = uRes.deletedCount || 0;

      // B. User Settings collection
      const sRes = await currentDb.collection("user_settings").deleteMany({
        $or: [{ userId }, { id: userId }],
      });
      stats.userSettings = sRes.deletedCount || 0;

      // C. Farm Profiles & Farms collections
      const fRes = await currentDb.collection("farm_profiles").deleteMany({
        $or: [{ userId }, { id: userId }],
      });
      const f2Res = await currentDb.collection("farms").deleteMany({
        $or: [{ userId }, { id: userId }, { ownerId: userId }],
      });
      stats.farmProfiles = (fRes.deletedCount || 0) + (f2Res.deletedCount || 0);

      // D. Farm Fields collections
      const fldRes = await currentDb.collection("farm_fields").deleteMany({
        $or: [{ userId }, { farmId: userId }],
      });
      const fld2Res = await currentDb.collection("fields").deleteMany({
        $or: [{ userId }, { farmId: userId }],
      });
      stats.farmFields = (fldRes.deletedCount || 0) + (fld2Res.deletedCount || 0);

      // E. Soil Tests & Telemetry collection
      const stRes = await currentDb.collection("soil_tests").deleteMany({
        $or: [{ userId }, { farmId: userId }],
      });
      stats.soilTests = stRes.deletedCount || 0;

      // F. Crop Records, Reports & Analyses collections
      const crRes = await currentDb.collection("crop_records").deleteMany({
        $or: [{ userId }],
      });
      const repRes = await currentDb.collection("reports").deleteMany({
        $or: [{ userId }],
      });
      const anaRes = await currentDb.collection("analyses").deleteMany({
        $or: [{ userId }],
      });
      stats.cropRecords = (crRes.deletedCount || 0) + (repRes.deletedCount || 0) + (anaRes.deletedCount || 0);

      // G. User Sessions collection
      const sessRes = await currentDb.collection("user_sessions").deleteMany({
        $or: [{ userId }],
      });
      stats.sessions += sessRes.deletedCount || 0;

      // H. Audit Logs collection
      const alRes = await currentDb.collection("audit_logs").deleteMany({
        $or: [{ userId }],
      });
      stats.auditLogs += alRes.deletedCount || 0;

      // I. AI Conversations, Chat Messages & Notifications collection
      const aiRes = await currentDb.collection("ai_conversations").deleteMany({
        $or: [{ userId }],
      });
      const chatRes = await currentDb.collection("chatMessages").deleteMany({
        $or: [{ userId }, { sessionId: userId }],
      });
      const notifRes = await currentDb.collection("notifications").deleteMany({
        $or: [{ userId }],
      });
      const taskRes = await currentDb.collection("tasks").deleteMany({
        $or: [{ userId }],
      });
      stats.conversations =
        (aiRes.deletedCount || 0) +
        (chatRes.deletedCount || 0) +
        (notifRes.deletedCount || 0) +
        (taskRes.deletedCount || 0);

      stats.totalDocuments =
        stats.users +
        stats.userSettings +
        stats.farmProfiles +
        stats.farmFields +
        stats.soilTests +
        stats.cropRecords +
        stats.auditLogs +
        stats.sessions +
        stats.conversations;

      console.log(`[MongoDB] Cascade deleted user "${userId}" from all collections: ${stats.totalDocuments} total documents removed.`);
    } catch (e: any) {
      console.error("[MongoDB] Failed to cascade delete user records:", e);
      return {
        success: false,
        message: `Database error during account deletion: ${e?.message || e}`,
        userId,
        deletedStats: stats,
      };
    }
  }

  return {
    success: true,
    message: `Account "${userId}" and all associated farm telemetry, settings, and database documents have been permanently removed.`,
    userId,
    deletedStats: stats,
  };
}

export async function getUserSettings(userId: string): Promise<UserSettingsDoc | null> {
  if (!userId) return null;
  if (currentDb && isConnected) {
    try {
      const doc = await currentDb.collection("user_settings").findOne({ userId });
      if (doc) {
        const { _id, ...cleanDoc } = doc;
        return cleanDoc as unknown as UserSettingsDoc;
      }
    } catch (e) {
      console.warn("[MongoDB] getUserSettings fallback to memory:", e);
    }
  }
  return memSettings.get(userId) || null;
}

export async function saveUserSettings(userId: string, settings: Partial<UserSettingsDoc>): Promise<UserSettingsDoc> {
  const existing = await getUserSettings(userId);
  const merged: UserSettingsDoc = {
    userId,
    theme: settings.theme || existing?.theme || "dark",
    language: settings.language || existing?.language || "en",
    currency: settings.currency || existing?.currency || "₹",
    unitSystem: settings.unitSystem || existing?.unitSystem || "metric",
    aiModel: settings.aiModel || existing?.aiModel || "gemini-2.5-flash",
    aiTone: settings.aiTone || existing?.aiTone || "scientific",
    notifications: {
      sprayAlerts: settings.notifications?.sprayAlerts ?? existing?.notifications?.sprayAlerts ?? true,
      mandiSpikes: settings.notifications?.mandiSpikes ?? existing?.notifications?.mandiSpikes ?? true,
      pestWarnings: settings.notifications?.pestWarnings ?? existing?.notifications?.pestWarnings ?? true,
      weatherExtremes: settings.notifications?.weatherExtremes ?? existing?.notifications?.weatherExtremes ?? true,
      weeklySummaryEmail: settings.notifications?.weeklySummaryEmail ?? existing?.notifications?.weeklySummaryEmail ?? false,
      smsAlerts: settings.notifications?.smsAlerts ?? existing?.notifications?.smsAlerts ?? true,
      whatsAppUpdates: settings.notifications?.whatsAppUpdates ?? existing?.notifications?.whatsAppUpdates ?? true,
    },
    autoSyncSensors: settings.autoSyncSensors ?? existing?.autoSyncSensors ?? true,
    dataSharingConsent: settings.dataSharingConsent ?? existing?.dataSharingConsent ?? true,
    updatedAt: new Date().toISOString(),
  };

  memSettings.set(userId, merged);

  if (currentDb && isConnected) {
    try {
      const cleanData = sanitizeDoc(merged);
      await currentDb.collection("user_settings").updateOne(
        { userId },
        { $set: cleanData },
        { upsert: true }
      );
    } catch (e: any) {
      console.error("[MongoDB] Failed to save settings:", e);
      if (e?.message?.includes("E11000") || e?.message?.includes("duplicate key")) {
        try {
          await currentDb.collection("user_settings").deleteMany({ _id: null });
          const cleanData = sanitizeDoc(merged);
          await currentDb.collection("user_settings").deleteOne({ userId });
          await currentDb.collection("user_settings").insertOne(cleanData);
          console.log("[MongoDB] Auto-recovered settings update after resolving duplicate key index conflict.");
        } catch (retryErr) {
          console.error("[MongoDB] Retry save settings failed:", retryErr);
        }
      }
    }
  }

  return merged;
}

export async function getFarmProfile(userId: string): Promise<FarmProfileDoc | null> {
  if (!userId) return null;
  if (currentDb && isConnected) {
    try {
      const doc = await currentDb.collection("farm_profiles").findOne({ userId });
      if (doc) {
        const { _id, ...cleanDoc } = doc;
        return cleanDoc as unknown as FarmProfileDoc;
      }
    } catch (e) {
      console.warn("[MongoDB] getFarmProfile fallback to memory:", e);
    }
  }
  return memFarmProfiles.get(userId) || null;
}

export async function saveFarmProfile(userId: string, profile: Partial<FarmProfileDoc>): Promise<FarmProfileDoc> {
  const existing = await getFarmProfile(userId);
  const merged: FarmProfileDoc = {
    userId,
    farmName: profile.farmName || existing?.farmName || "",
    ownerName: profile.ownerName || existing?.ownerName || "",
    location: profile.location || existing?.location || "",
    district: profile.district || existing?.district || "",
    state: profile.state || existing?.state || "",
    country: profile.country || existing?.country || "India",
    totalAreaAcres: profile.totalAreaAcres !== undefined ? profile.totalAreaAcres : (existing?.totalAreaAcres ?? 0),
    primaryWaterSource: profile.primaryWaterSource || existing?.primaryWaterSource || "",
    primarySoilType: profile.primarySoilType || existing?.primarySoilType || "",
    primaryCrops: profile.primaryCrops || existing?.primaryCrops || [],
    geoCoordinates: profile.geoCoordinates || existing?.geoCoordinates,
    apmcMandiYard: profile.apmcMandiYard || existing?.apmcMandiYard || "",
    irrigationType: profile.irrigationType || existing?.irrigationType || "",
    currency: profile.currency || existing?.currency || "₹",
    updatedAt: new Date().toISOString(),
  };

  memFarmProfiles.set(userId, merged);

  if (currentDb && isConnected) {
    try {
      const cleanData = sanitizeDoc(merged);
      await currentDb.collection("farm_profiles").updateOne(
        { userId },
        { $set: cleanData },
        { upsert: true }
      );
    } catch (e: any) {
      console.error("[MongoDB] Failed to save farm profile:", e);
      if (e?.message?.includes("E11000") || e?.message?.includes("duplicate key")) {
        try {
          await currentDb.collection("farm_profiles").deleteMany({ _id: null });
          const cleanData = sanitizeDoc(merged);
          await currentDb.collection("farm_profiles").deleteOne({ userId });
          await currentDb.collection("farm_profiles").insertOne(cleanData);
          console.log("[MongoDB] Auto-recovered farm profile update after resolving duplicate key index conflict.");
        } catch (retryErr) {
          console.error("[MongoDB] Retry save farm profile failed:", retryErr);
        }
      }
    }
  }

  return merged;
}

export async function addAuditLog(
  userId: string,
  action: string,
  category: AuditLogDoc["category"],
  details: string,
  ip: string = "127.0.0.1",
  userAgent: string = "Web Browser"
): Promise<AuditLogDoc> {
  const log: AuditLogDoc = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    action,
    category,
    details,
    ip,
    userAgent,
    timestamp: new Date().toISOString(),
  };

  memAuditLogs.unshift(log);
  if (memAuditLogs.length > 200) memAuditLogs.pop();

  if (currentDb && isConnected) {
    try {
      const cleanLog = sanitizeDoc(log);
      await currentDb.collection("audit_logs").insertOne(cleanLog);
    } catch (e: any) {
      console.error("[MongoDB] Failed to write audit log:", e);
      if (e?.message?.includes("E11000") || e?.message?.includes("duplicate key")) {
        try {
          await currentDb.collection("audit_logs").deleteMany({ _id: null });
          await currentDb.collection("audit_logs").insertOne(sanitizeDoc(log));
        } catch (retryErr) {
          console.error("[MongoDB] Retry write audit log failed:", retryErr);
        }
      }
    }
  }

  return log;
}

export async function getAuditLogs(userId?: string, limit: number = 50): Promise<AuditLogDoc[]> {
  if (currentDb && isConnected) {
    try {
      const query = userId ? { userId } : {};
      const docs = await currentDb.collection("audit_logs").find(query).sort({ timestamp: -1 }).limit(limit).toArray();
      if (docs && docs.length > 0) {
        return docs.map((d) => {
          const { _id, ...clean } = d;
          return clean as unknown as AuditLogDoc;
        });
      }
    } catch (e) {
      console.warn("[MongoDB] getAuditLogs fallback:", e);
    }
  }
  const filtered = userId ? memAuditLogs.filter((l) => l.userId === userId) : memAuditLogs;
  return filtered.slice(0, limit);
}

export async function getUserSessions(userId: string): Promise<UserSessionDoc[]> {
  const list: UserSessionDoc[] = [];
  for (const s of memSessions.values()) {
    if (s.userId === userId) list.push(s);
  }
  return list;
}

export async function revokeUserSession(sessionId: string): Promise<boolean> {
  memSessions.delete(sessionId);
  return true;
}

// Export all user data for GDPR / Backup
export async function exportAllUserData(userId: string) {
  const user = await getUserById(userId);
  const settings = await getUserSettings(userId);
  const farmProfile = await getFarmProfile(userId);
  const auditLogs = await getAuditLogs(userId, 100);
  const sessions = await getUserSessions(userId);
  const dbStats = await getDatabaseStats();

  return {
    exportDate: new Date().toISOString(),
    exportVersion: "2.5-enterprise",
    user,
    settings,
    farmProfile,
    auditLogs,
    sessions,
    databaseTelemetry: dbStats,
  };
}

// Try initial connection on module load if process.env.MONGODB_URI exists
if (process.env.MONGODB_URI) {
  initMongoDB(process.env.MONGODB_URI, process.env.MONGODB_DB_NAME).catch((err) => {
    console.warn("[MongoDB] Auto-connect on start deferred:", err?.message || err);
  });
}
