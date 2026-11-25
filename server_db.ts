import { MongoClient, Db } from "mongodb";
import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt) as unknown as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

// ----------------------------------------------------
// Password hashing (scrypt, async so the event loop is never blocked)
// Format stays "salt:hash" so existing hashes keep working.
// ----------------------------------------------------
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  const key = await scryptAsync(password, salt, 64);
  return `${salt}:${key.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash?: string): Promise<boolean> {
  if (!storedHash || !storedHash.includes(":")) return false;
  try {
    const [salt, key] = storedHash.split(":");
    const keyBuf = Buffer.from(key, "hex");
    const derived = await scryptAsync(password, salt, keyBuf.length || 64);
    return keyBuf.length === derived.length && crypto.timingSafeEqual(keyBuf, derived);
  } catch {
    return false;
  }
}

// ----------------------------------------------------
// Phone helpers (Indian mobile numbers)
// ----------------------------------------------------
/** Returns the 10 digit mobile number or "" when invalid. */
export function phoneKeyOf(phone?: string | null): string {
  let d = String(phone ?? "").replace(/\D/g, "");
  if (d.length === 12 && d.startsWith("91")) d = d.slice(2);
  else if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : "";
}
export const formatPhone = (key: string) => (key ? `+91 ${key}` : "");

// ----------------------------------------------------
// Types
// ----------------------------------------------------
export interface UserDoc {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  phone: string;
  phoneKey?: string;
  role: string;
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
  device: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: Date;
  isCurrent?: boolean;
}

export interface ResetDoc {
  email: string;
  codeHash: string;
  attempts: number;
  createdAt: string;
  expiresAt: Date;
}

export class DuplicateError extends Error {
  field: string;
  constructor(field: string) {
    super(`DUPLICATE_${field}`);
    this.field = field;
  }
}
function toDuplicate(e: any) {
  const key = Object.keys(e?.keyPattern || {})[0] || "email";
  return new DuplicateError(key === "phoneKey" ? "phone" : key);
}

export function sanitizeUserResponse<T extends Record<string, any>>(user: T) {
  const { passwordHash, phoneKey, ...clean } = user;
  return clean as Omit<T, "passwordHash" | "phoneKey">;
}

// ----------------------------------------------------
// Connection state (+ in-memory fallback for local dev only)
// ----------------------------------------------------
let client: MongoClient | null = null;
let db: Db | null = null;
let connected = false;
let connectionError: string | null = null;
let activeUri = "";
let activeDbName = "";

const memUsers = new Map<string, UserDoc>();
const memSettings = new Map<string, UserSettingsDoc>();
const memFarmProfiles = new Map<string, FarmProfileDoc>();
const memAuditLogs: AuditLogDoc[] = [];
const memSessions = new Map<string, UserSessionDoc>();
const memResets = new Map<string, ResetDoc>();
const memFields = new Map<string, any[]>();
const memActivities = new Map<string, any[]>();

export const isDbReady = () => Boolean(db && connected);
export const isDbConfigured = () => Boolean((process.env.MONGODB_URI || "").trim());
const maskUri = (u: string) => (u ? u.replace(/\/\/[^:]+:[^@]+@/, "//***:***@") : "Not Configured");

function cleanValue(v: any): any {
  if (v === null || typeof v !== "object" || v instanceof Date) return v;
  if (Array.isArray(v)) return v.map(cleanValue);
  return sanitizeDoc(v);
}

/** Strips `_id`, undefined values and any key that could be used for Mongo operator injection. */
export function sanitizeDoc<T extends Record<string, any>>(obj: T): Record<string, any> {
  if (!obj || typeof obj !== "object") return obj;
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === "_id" || key.startsWith("$") || key.includes(".")) continue;
    if (value === undefined) continue;
    result[key] = cleanValue(value);
  }
  return result;
}

const strip = <T>(doc: any): T => {
  const { _id, ...rest } = doc;
  return rest as T;
};
const pick = <T>(a: T | undefined, b: T | undefined, d: T): T => (a !== undefined ? a : b !== undefined ? b : d);

async function repairNullIdDocuments(d: Db) {
  const names = ["users", "user_settings", "farm_profiles", "audit_logs", "user_sessions", "farm_fields"];
  for (const name of names) {
    try {
      const coll = d.collection(name);
      const bad = await coll.find({ $or: [{ _id: null }, { _id: { $type: 10 } }] }).toArray();
      if (bad.length) {
        await coll.deleteMany({ $or: [{ _id: null }, { _id: { $type: 10 } }] });
        for (const doc of bad) {
          const clean = sanitizeDoc(strip(doc));
          if (Object.keys(clean).length) await coll.insertOne(clean);
        }
        console.log(`[MongoDB] Repaired ${bad.length} corrupted document(s) in "${name}".`);
      }
    } catch (err: any) {
      console.warn(`[MongoDB] Auto-repair notice for "${name}":`, err?.message || err);
    }
  }
}

async function backfillPhoneKeys(d: Db) {
  try {
    const legacy = await d
      .collection("users")
      .find({ phoneKey: { $exists: false }, phone: { $nin: [null, ""] } })
      .toArray();
    for (const u of legacy) {
      const key = phoneKeyOf(u.phone);
      if (key) await d.collection("users").updateOne({ _id: u._id }, { $set: { phoneKey: key } }).catch(() => { });
    }
  } catch (e: any) {
    console.warn("[MongoDB] phoneKey backfill note:", e?.message || e);
  }
}

async function ensureIndexes(d: Db) {
  const specs: Array<[string, Record<string, 1 | -1>, Record<string, any>?]> = [
    ["users", { id: 1 }, { unique: true }],
    ["users", { email: 1 }, { unique: true }],
    ["users", { phoneKey: 1 }, { unique: true, partialFilterExpression: { phoneKey: { $type: "string" } } }],
    ["user_settings", { userId: 1 }, { unique: true }],
    ["farm_profiles", { userId: 1 }, { unique: true }],
    ["farm_fields", { userId: 1, id: 1 }, { unique: true }],
    ["farm_activities", { userId: 1, timestamp: -1 }],
    ["audit_logs", { userId: 1, timestamp: -1 }],
    ["user_sessions", { id: 1 }, { unique: true }],
    ["user_sessions", { expiresAt: 1 }, { expireAfterSeconds: 0 }],
    ["password_resets", { email: 1 }, { unique: true }],
    ["password_resets", { expiresAt: 1 }, { expireAfterSeconds: 0 }],
  ];
  for (const [coll, keys, opts] of specs) {
    try {
      await d.collection(coll).createIndex(keys, opts || {});
    } catch (err: any) {
      if (err?.code === 85 || err?.code === 86) continue; // same index already exists with other options
      console.warn(`[MongoDB] Index note on ${coll}:`, err?.message || err);
    }
  }
}

export async function initMongoDB(
  uri?: string,
  dbName?: string
): Promise<{ success: boolean; message: string; isConnected: boolean; stats?: any }> {
  const targetUri = (uri || activeUri || process.env.MONGODB_URI || "").trim();
  const targetDbName = (dbName || activeDbName || process.env.MONGODB_DB_NAME || "agri_crop_db").trim();

  if (!targetUri) {
    connected = false;
    connectionError = "MONGODB_URI is not set. Running in temporary in-memory mode (data is lost on restart).";
    return { success: false, isConnected: false, message: connectionError };
  }

  try {
    if (client) {
      await client.close().catch(() => { });
      client = null;
      db = null;
    }
    console.log(`[MongoDB] Connecting to ${maskUri(targetUri)} (DB: ${targetDbName})...`);
    const c = new MongoClient(targetUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
      ignoreUndefined: true,
    });
    await c.connect();
    const d = c.db(targetDbName);
    await d.command({ ping: 1 });

    client = c;
    db = d;
    connected = true;
    connectionError = null;
    activeUri = targetUri;
    activeDbName = targetDbName;

    await repairNullIdDocuments(d);
    await backfillPhoneKeys(d);
    await ensureIndexes(d);

    console.log(`[MongoDB] Connected successfully to database: ${targetDbName}`);
    return {
      success: true,
      isConnected: true,
      message: `Connected successfully to MongoDB Database: "${targetDbName}"`,
      stats: await getDatabaseStats(),
    };
  } catch (error: any) {
    console.error("[MongoDB] Connection Error:", error?.message || error);
    connected = false;
    db = null;
    connectionError = error?.message || "Failed to connect to MongoDB cluster";
    return { success: false, isConnected: false, message: `MongoDB Connection Error: ${connectionError}` };
  }
}

export async function getDatabaseStats() {
  if (db && connected) {
    try {
      const collections = await db.listCollections().toArray();
      const count = (n: string) => db!.collection(n).estimatedDocumentCount();
      return {
        isConnected: true,
        databaseName: activeDbName,
        uriMasked: maskUri(activeUri),
        collections: collections.map((c) => c.name),
        counts: {
          users: await count("users"),
          userSettings: await count("user_settings"),
          farmProfiles: await count("farm_profiles"),
          auditLogs: await count("audit_logs"),
          farmFields: await count("farm_fields"),
        },
        mode: "MongoDB Atlas / Cloud Connected",
        lastPing: new Date().toISOString(),
      };
    } catch (e: any) {
      console.warn("[MongoDB] Failed to get stats:", e?.message);
    }
  }
  let memFieldCount = 0;
  for (const l of memFields.values()) memFieldCount += l.length;
  return {
    isConnected: false,
    databaseName: activeDbName || "agri_crop_db",
    uriMasked: maskUri(activeUri),
    collections: ["users", "user_settings", "farm_profiles", "farm_fields", "audit_logs", "user_sessions"],
    counts: {
      users: memUsers.size,
      userSettings: memSettings.size,
      farmProfiles: memFarmProfiles.size,
      auditLogs: memAuditLogs.length,
      farmFields: memFieldCount,
    },
    mode: "In-Memory Cache (MongoDB not connected - data is NOT persisted)",
    lastPing: new Date().toISOString(),
    connectionError,
  };
}

// ----------------------------------------------------
// Users
// ----------------------------------------------------
export async function getUserById(userId: string): Promise<UserDoc | null> {
  if (!userId) return null;
  if (db) {
    const doc = await db.collection("users").findOne({ id: userId });
    return doc ? strip<UserDoc>(doc) : null;
  }
  return memUsers.get(userId) || null;
}

export async function getUserByEmail(email: string): Promise<UserDoc | null> {
  const e = String(email || "").toLowerCase().trim();
  if (!e) return null;
  if (db) {
    const doc = await db.collection("users").findOne({ email: e });
    return doc ? strip<UserDoc>(doc) : null;
  }
  for (const u of memUsers.values()) if (u.email?.toLowerCase() === e) return u;
  return null;
}

export async function getUserByPhone(phone: string): Promise<UserDoc | null> {
  const key = phoneKeyOf(phone);
  if (!key) return null;
  if (db) {
    const doc = await db.collection("users").findOne({ phoneKey: key });
    return doc ? strip<UserDoc>(doc) : null;
  }
  for (const u of memUsers.values()) if (phoneKeyOf(u.phone) === key) return u;
  return null;
}

export async function getUserByEmailOrPhone(identifier: string): Promise<UserDoc | null> {
  const id = String(identifier || "").trim();
  if (!id) return null;
  return id.includes("@") ? getUserByEmail(id) : getUserByPhone(id);
}

export async function createUser(user: UserDoc): Promise<UserDoc> {
  const key = phoneKeyOf(user.phone);
  const doc: UserDoc = { ...user, email: user.email.toLowerCase().trim(), ...(key ? { phoneKey: key } : {}) };
  if (db) {
    try {
      await db.collection("users").insertOne(sanitizeDoc(doc));
    } catch (e: any) {
      if (e?.code === 11000) throw toDuplicate(e);
      throw e;
    }
  } else {
    if (await getUserByEmail(doc.email)) throw new DuplicateError("email");
    if (key && (await getUserByPhone(key))) throw new DuplicateError("phone");
    memUsers.set(doc.id, doc);
  }
  return doc;
}

/** Merge-updates an EXISTING user. Never inserts and never deletes. */
export async function saveUser(patch: Partial<UserDoc> & { id: string }): Promise<UserDoc> {
  const existing = await getUserById(patch.id);
  if (!existing) throw new Error("USER_NOT_FOUND");
  const defined = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const merged = {
    ...existing,
    ...defined,
    id: existing.id,
    createdAt: existing.createdAt,
    updatedAt: new Date().toISOString(),
  } as UserDoc;
  if (merged.email) merged.email = merged.email.toLowerCase().trim();
  const key = phoneKeyOf(merged.phone);
  if (key) merged.phoneKey = key;
  else delete merged.phoneKey;

  if (db) {
    const update: any = { $set: sanitizeDoc(merged) };
    if (!key) update.$unset = { phoneKey: "" };
    try {
      await db.collection("users").updateOne({ id: merged.id }, update);
    } catch (e: any) {
      if (e?.code === 11000) throw toDuplicate(e);
      throw e;
    }
  } else {
    memUsers.set(merged.id, merged);
  }
  return merged;
}

// ----------------------------------------------------
// Generic one-doc helpers
// ----------------------------------------------------
async function upsertOne(coll: string, filter: any, doc: any) {
  if (!db) return;
  const run = () => db!.collection(coll).updateOne(filter, { $set: sanitizeDoc(doc) }, { upsert: true });
  try {
    await run();
  } catch (e: any) {
    if (e?.code === 11000) await run(); // concurrent upsert race: retry once
    else throw e;
  }
}

// ----------------------------------------------------
// Settings
// ----------------------------------------------------
export async function getUserSettings(userId: string): Promise<UserSettingsDoc | null> {
  if (!userId) return null;
  if (db) {
    const doc = await db.collection("user_settings").findOne({ userId });
    return doc ? strip<UserSettingsDoc>(doc) : null;
  }
  return memSettings.get(userId) || null;
}

export async function saveUserSettings(userId: string, s: Partial<UserSettingsDoc>): Promise<UserSettingsDoc> {
  const ex = await getUserSettings(userId);
  const n = s.notifications || ({} as any);
  const en = ex?.notifications || ({} as any);
  const merged: UserSettingsDoc = {
    userId,
    theme: pick(s.theme, ex?.theme, "light"),
    language: pick(s.language, ex?.language, "en"),
    currency: pick(s.currency, ex?.currency, "₹"),
    unitSystem: pick(s.unitSystem, ex?.unitSystem, "metric"),
    aiModel: pick(s.aiModel, ex?.aiModel, "gemini-2.5-flash"),
    aiTone: pick(s.aiTone, ex?.aiTone, "practical"),
    notifications: {
      sprayAlerts: pick(n.sprayAlerts, en.sprayAlerts, true),
      mandiSpikes: pick(n.mandiSpikes, en.mandiSpikes, true),
      pestWarnings: pick(n.pestWarnings, en.pestWarnings, true),
      weatherExtremes: pick(n.weatherExtremes, en.weatherExtremes, true),
      weeklySummaryEmail: pick(n.weeklySummaryEmail, en.weeklySummaryEmail, false),
      smsAlerts: pick(n.smsAlerts, en.smsAlerts, false),
      whatsAppUpdates: pick(n.whatsAppUpdates, en.whatsAppUpdates, true),
    },
    autoSyncSensors: pick(s.autoSyncSensors, ex?.autoSyncSensors, true),
    dataSharingConsent: pick(s.dataSharingConsent, ex?.dataSharingConsent, false),
    updatedAt: new Date().toISOString(),
  };
  if (db) await upsertOne("user_settings", { userId }, merged);
  else memSettings.set(userId, merged);
  return merged;
}

// ----------------------------------------------------
// Farm profile
// ----------------------------------------------------
export async function getFarmProfile(userId: string): Promise<FarmProfileDoc | null> {
  if (!userId) return null;
  if (db) {
    const doc = await db.collection("farm_profiles").findOne({ userId });
    return doc ? strip<FarmProfileDoc>(doc) : null;
  }
  return memFarmProfiles.get(userId) || null;
}

export async function saveFarmProfile(userId: string, p: Partial<FarmProfileDoc>): Promise<FarmProfileDoc> {
  const ex = await getFarmProfile(userId);
  const merged: FarmProfileDoc = {
    userId,
    farmName: pick(p.farmName, ex?.farmName, ""),
    ownerName: pick(p.ownerName, ex?.ownerName, ""),
    location: pick(p.location, ex?.location, ""),
    district: pick(p.district, ex?.district, ""),
    state: pick(p.state, ex?.state, ""),
    country: pick(p.country, ex?.country, "India"),
    totalAreaAcres: pick(p.totalAreaAcres, ex?.totalAreaAcres, 0),
    primaryWaterSource: pick(p.primaryWaterSource, ex?.primaryWaterSource, ""),
    primarySoilType: pick(p.primarySoilType, ex?.primarySoilType, ""),
    primaryCrops: pick(p.primaryCrops, ex?.primaryCrops, []),
    geoCoordinates: p.geoCoordinates || ex?.geoCoordinates,
    apmcMandiYard: pick(p.apmcMandiYard, ex?.apmcMandiYard, ""),
    irrigationType: pick(p.irrigationType, ex?.irrigationType, ""),
    currency: pick(p.currency, ex?.currency, "₹"),
    updatedAt: new Date().toISOString(),
  };
  if (db) await upsertOne("farm_profiles", { userId }, merged);
  else memFarmProfiles.set(userId, merged);
  return merged;
}

// ----------------------------------------------------
// Audit logs
// ----------------------------------------------------
export async function addAuditLog(
  userId: string,
  action: string,
  category: AuditLogDoc["category"],
  details: string,
  ip = "127.0.0.1",
  userAgent = "Web Browser"
): Promise<AuditLogDoc> {
  const log: AuditLogDoc = {
    id: `log_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
    userId,
    action,
    category,
    details: String(details).slice(0, 500),
    ip,
    userAgent: String(userAgent).slice(0, 300),
    timestamp: new Date().toISOString(),
  };
  if (db) {
    try {
      await db.collection("audit_logs").insertOne(sanitizeDoc(log));
    } catch (e: any) {
      console.error("[MongoDB] Failed to write audit log:", e?.message || e);
    }
  } else {
    memAuditLogs.unshift(log);
    if (memAuditLogs.length > 500) memAuditLogs.pop();
  }
  return log;
}

export async function getAuditLogs(userId: string, limit = 50): Promise<AuditLogDoc[]> {
  if (db) {
    const docs = await db.collection("audit_logs").find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray();
    return docs.map((d) => strip<AuditLogDoc>(d));
  }
  return memAuditLogs.filter((l) => l.userId === userId).slice(0, limit);
}

// ----------------------------------------------------
// Sessions (server-side, revocable)
// ----------------------------------------------------
export async function createSession(s: UserSessionDoc) {
  if (db) await db.collection("user_sessions").insertOne(sanitizeDoc(s));
  else memSessions.set(s.id, s);
}

export async function getSession(id: string): Promise<UserSessionDoc | null> {
  if (!id) return null;
  let s: UserSessionDoc | null = null;
  if (db) {
    const doc = await db.collection("user_sessions").findOne({ id });
    s = doc ? strip<UserSessionDoc>(doc) : null;
  } else {
    s = memSessions.get(id) || null;
  }
  if (s && new Date(s.expiresAt).getTime() < Date.now()) return null;
  return s;
}

export async function touchSession(id: string) {
  const now = new Date().toISOString();
  if (db) await db.collection("user_sessions").updateOne({ id }, { $set: { lastActiveAt: now } });
  else {
    const s = memSessions.get(id);
    if (s) s.lastActiveAt = now;
  }
}

export async function listSessions(userId: string): Promise<UserSessionDoc[]> {
  if (db) {
    const docs = await db.collection("user_sessions").find({ userId, expiresAt: { $gt: new Date() } }).sort({ lastActiveAt: -1 }).toArray();
    return docs.map((d) => strip<UserSessionDoc>(d));
  }
  return [...memSessions.values()].filter((s) => s.userId === userId && new Date(s.expiresAt).getTime() > Date.now());
}

export async function deleteSession(id: string, userId?: string): Promise<boolean> {
  if (db) {
    const r = await db.collection("user_sessions").deleteOne(userId ? { id, userId } : { id });
    return (r.deletedCount || 0) > 0;
  }
  const s = memSessions.get(id);
  if (!s || (userId && s.userId !== userId)) return false;
  return memSessions.delete(id);
}

export async function deleteUserSessions(userId: string, exceptId?: string) {
  if (db) {
    await db.collection("user_sessions").deleteMany(exceptId ? { userId, id: { $ne: exceptId } } : { userId });
  } else {
    for (const [k, s] of memSessions) if (s.userId === userId && k !== exceptId) memSessions.delete(k);
  }
}

// ----------------------------------------------------
// Password reset requests (hashed code, TTL, attempt counter)
// ----------------------------------------------------
export async function saveReset(email: string, codeHash: string, expiresAt: Date) {
  const doc: ResetDoc = { email, codeHash, attempts: 0, createdAt: new Date().toISOString(), expiresAt };
  if (db) await upsertOne("password_resets", { email }, doc);
  else memResets.set(email, doc);
}

export async function getReset(email: string): Promise<ResetDoc | null> {
  let r: ResetDoc | null = null;
  if (db) {
    const doc = await db.collection("password_resets").findOne({ email });
    r = doc ? strip<ResetDoc>(doc) : null;
  } else r = memResets.get(email) || null;
  if (r && new Date(r.expiresAt).getTime() < Date.now()) return null;
  return r;
}

export async function incrementResetAttempts(email: string) {
  if (db) await db.collection("password_resets").updateOne({ email }, { $inc: { attempts: 1 } });
  else {
    const r = memResets.get(email);
    if (r) r.attempts++;
  }
}

export async function deleteReset(email: string) {
  if (db) await db.collection("password_resets").deleteOne({ email });
  else memResets.delete(email);
}

// ----------------------------------------------------
// Farm fields & activities (PER USER)
// ----------------------------------------------------
const toPublic = (d: any) => {
  const { _id, userId, ...rest } = d;
  return rest;
};

export async function listFields(userId: string): Promise<any[]> {
  if (db) {
    const docs = await db.collection("farm_fields").find({ userId }).sort({ createdAt: -1 }).toArray();
    return docs.map(toPublic);
  }
  return [...(memFields.get(userId) || [])];
}

export async function getField(userId: string, id: string): Promise<any | null> {
  if (db) {
    const doc = await db.collection("farm_fields").findOne({ userId, id });
    return doc ? toPublic(doc) : null;
  }
  return (memFields.get(userId) || []).find((f) => f.id === id) || null;
}

export async function upsertField(userId: string, field: any) {
  if (db) {
    const { createdAt, ...rest } = field;
    await db.collection("farm_fields").updateOne(
      { userId, id: field.id },
      { $set: sanitizeDoc({ ...rest, userId }), $setOnInsert: { createdAt: createdAt || new Date().toISOString() } },
      { upsert: true }
    );
  } else {
    const list = memFields.get(userId) || [];
    const i = list.findIndex((f) => f.id === field.id);
    if (i >= 0) list[i] = { ...list[i], ...field };
    else list.unshift({ createdAt: new Date().toISOString(), ...field });
    memFields.set(userId, list);
  }
}

export async function removeField(userId: string, id: string): Promise<boolean> {
  if (db) {
    const r = await db.collection("farm_fields").deleteOne({ userId, id });
    return (r.deletedCount || 0) > 0;
  }
  const list = memFields.get(userId) || [];
  const next = list.filter((f) => f.id !== id);
  memFields.set(userId, next);
  return next.length !== list.length;
}

export async function replaceFields(userId: string, fields: any[]) {
  if (db) {
    const col = db.collection("farm_fields");
    await col.deleteMany({ userId });
    if (fields.length) await col.insertMany(fields.map((f) => sanitizeDoc({ ...f, userId })));
  } else {
    memFields.set(userId, fields.map((f) => ({ ...f })));
  }
}

export async function addActivity(userId: string, act: any) {
  if (db) await db.collection("farm_activities").insertOne(sanitizeDoc({ ...act, userId }));
  else {
    const list = memActivities.get(userId) || [];
    list.unshift(act);
    memActivities.set(userId, list.slice(0, 500));
  }
}

export async function listActivities(userId: string, limit = 200): Promise<any[]> {
  if (db) {
    const docs = await db.collection("farm_activities").find({ userId }).sort({ timestamp: -1 }).limit(limit).toArray();
    return docs.map(toPublic);
  }
  return (memActivities.get(userId) || []).slice(0, limit);
}

// ----------------------------------------------------
// Export & cascade delete
// ----------------------------------------------------
export async function exportAllUserData(userId: string) {
  const user = await getUserById(userId);
  return {
    exportDate: new Date().toISOString(),
    exportVersion: "3.0",
    user: user ? sanitizeUserResponse(user) : null,
    settings: await getUserSettings(userId),
    farmProfile: await getFarmProfile(userId),
    fields: await listFields(userId),
    activities: await listActivities(userId, 500),
    auditLogs: await getAuditLogs(userId, 200),
  };
}

export interface DeletionResult {
  success: boolean;
  message: string;
  userId: string;
  deletedStats: Record<string, number>;
}

export async function deleteUserCascade(userId: string): Promise<DeletionResult> {
  const stats: Record<string, number> = {
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
  if (!userId) return { success: false, message: "User ID is required for deletion.", userId: "", deletedStats: stats };

  const target = await getUserById(userId);
  const email = target?.email;

  // memory stores
  if (memUsers.delete(userId)) stats.users++;
  memSettings.delete(userId);
  memFarmProfiles.delete(userId);
  memFields.delete(userId);
  memActivities.delete(userId);
  if (email) memResets.delete(email);
  for (const [k, s] of memSessions) if (s.userId === userId) memSessions.delete(k);
  for (let i = memAuditLogs.length - 1; i >= 0; i--) if (memAuditLogs[i].userId === userId) memAuditLogs.splice(i, 1);

  if (db) {
    try {
      const del = async (coll: string, filter: any) => (await db!.collection(coll).deleteMany(filter)).deletedCount || 0;
      stats.users = await del("users", { id: userId });
      stats.userSettings = await del("user_settings", { userId });
      stats.farmProfiles = (await del("farm_profiles", { userId })) + (await del("farms", { $or: [{ userId }, { ownerId: userId }] }));
      stats.farmFields = (await del("farm_fields", { userId })) + (await del("fields", { userId }));
      stats.soilTests = await del("soil_tests", { userId });
      stats.cropRecords = (await del("crop_records", { userId })) + (await del("reports", { userId })) + (await del("analyses", { userId }));
      stats.sessions = await del("user_sessions", { userId });
      stats.auditLogs = await del("audit_logs", { userId });
      stats.conversations =
        (await del("ai_conversations", { userId })) +
        (await del("chatMessages", { userId })) +
        (await del("notifications", { userId })) +
        (await del("tasks", { userId })) +
        (await del("farm_activities", { userId }));
      if (email) await del("password_resets", { email });
    } catch (e: any) {
      console.error("[MongoDB] Cascade delete failed:", e);
      return { success: false, message: `Database error during account deletion: ${e?.message || e}`, userId, deletedStats: stats };
    }
  }

  stats.totalDocuments = Object.entries(stats).reduce((sum, [k, v]) => (k === "totalDocuments" ? sum : sum + v), 0);
  return {
    success: true,
    message: "Your account and all associated farm data have been permanently deleted.",
    userId,
    deletedStats: stats,
  };
}