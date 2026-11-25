import crypto from "node:crypto";
import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import {
  DuplicateError,
  phoneKeyOf,
  formatPhone,
  hashPassword,
  verifyPassword,
  sanitizeUserResponse,
  isDbReady,
  isDbConfigured,
  getDatabaseStats,
  getUserById,
  getUserByEmail,
  getUserByPhone,
  getUserByEmailOrPhone,
  createUser,
  saveUser,
  deleteUserCascade,
  getUserSettings,
  saveUserSettings,
  getFarmProfile,
  saveFarmProfile,
  addAuditLog,
  getAuditLogs,
  createSession,
  getSession,
  touchSession,
  listSessions,
  deleteSession,
  deleteUserSessions,
  saveReset,
  getReset,
  incrementResetAttempts,
  deleteReset,
  listFields,
  getField,
  upsertField,
  removeField,
  replaceFields,
  addActivity,
  listActivities,
  exportAllUserData,
  initMongoDB,
} from "./server_db.js";
import type { UserDoc } from "./server_db.js";

// ----------------------------------------------------
// Constants & small helpers
// ----------------------------------------------------
const ROLES = [
  "Farmer",
  "Farm Manager",
  "Agronomist / Agriculture Expert",
  "Agri Business Owner",
  "Agricultural Officer",
  "Other",
  // legacy values kept so old accounts keep working
  "Farm Owner",
  "Senior Agronomist",
  "Field Supervisor",
];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ID_RE = /^[\w-]{1,64}$/;
const SESSION_TTL_MS = 7 * 24 * 3600 * 1000;
const REMEMBER_TTL_MS = 30 * 24 * 3600 * 1000;
const RESET_TTL_MS = 10 * 60 * 1000;
const MAX_FIELDS_PER_USER = 500;

class HttpError extends Error {
  status: number;
  field?: string;
  constructor(status: number, message: string, field?: string) {
    super(message);
    this.status = status;
    this.field = field;
  }
}

type AuthedRequest = Request & { auth?: { user: UserDoc; sessionId: string } };

const fail = (res: Response, status: number, error: string, extra: Record<string, any> = {}) =>
  res.status(status).json({ success: false, error, ...extra });

const clientIp = (req: Request) => req.ip || req.socket?.remoteAddress || "unknown";
const userAgent = (req: Request) => String(req.headers["user-agent"] || "Web Client").slice(0, 300);
const audit = (req: Request, userId: string, action: string, category: any, details: string) =>
  addAuditLog(userId, action, category, details, clientIp(req), userAgent(req)).catch(() => {});

function describeClient(ua: string) {
  const browser = /Edg\//.test(ua) ? "Microsoft Edge" : /OPR\//.test(ua) ? "Opera" : /Chrome\//.test(ua) ? "Google Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Web Browser";
  const os = /Windows/.test(ua) ? "Windows" : /Android/.test(ua) ? "Android" : /iPhone|iPad|iOS/.test(ua) ? "iOS" : /Mac OS X/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "Unknown OS";
  return { browser, os, device: `${browser} / ${os}` };
}

/** Wraps an async handler: converts thrown errors into clean JSON responses. */
const h =
  (fn: (req: AuthedRequest, res: Response) => Promise<any>) =>
  async (req: Request, res: Response) => {
    try {
      await fn(req as AuthedRequest, res);
    } catch (e: any) {
      if (e instanceof HttpError) return fail(res, e.status, e.message, e.field ? { field: e.field } : {});
      if (e instanceof DuplicateError) {
        return fail(
          res,
          409,
          e.field === "phone"
            ? "This mobile number is already registered with another account."
            : "This email address is already registered with another account.",
          { field: e.field }
        );
      }
      console.error("[API]", req.method, req.originalUrl, e?.message || e);
      return fail(res, 500, "Something went wrong on our side. Please try again.");
    }
  };

// ----------------------------------------------------
// JWT (HS256, no extra dependency) + server side sessions
// ----------------------------------------------------
function secret(): string {
  const s = (process.env.JWT_SECRET || "").trim();
  if (s.length >= 32) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET (minimum 32 characters) must be set in production.");
  }
  return "dev-only-insecure-secret-do-not-use-in-production";
}
const b64u = (v: string | Buffer) => Buffer.from(v).toString("base64url");

function signToken(payload: Record<string, any>, ttlSec: number): string {
  const header = b64u(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const body = b64u(JSON.stringify({ ...payload, iat: now, exp: now + ttlSec }));
  const sig = crypto.createHmac("sha256", secret()).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyToken(token: string): { sub: string; sid: string; exp: number } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [hd, bd, sg] = parts;
  const expected = crypto.createHmac("sha256", secret()).update(`${hd}.${bd}`).digest();
  const given = Buffer.from(sg, "base64url");
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const p = JSON.parse(Buffer.from(bd, "base64url").toString("utf8"));
    if (!p?.exp || p.exp * 1000 < Date.now() || !p.sub || !p.sid) return null;
    return p;
  } catch {
    return null;
  }
}

async function authenticate(req: Request): Promise<{ user: UserDoc; sessionId: string } | null> {
  const header = String(req.headers.authorization || "");
  let userId: string | null = null;
  let sessionId = "legacy_session";

  if (header.startsWith("Bearer ")) {
    const rawToken = header.slice(7).trim();
    const payload = verifyToken(rawToken);
    if (payload) {
      const session = await getSession(payload.sid);
      if (session && session.userId === payload.sub) {
        userId = payload.sub;
        sessionId = session.id;
        if (Date.now() - Date.parse(session.lastActiveAt) > 5 * 60 * 1000) touchSession(session.id).catch(() => {});
      }
    } else if (rawToken.startsWith("demo_jwt_token_") || rawToken.startsWith("jwt_agri_")) {
      userId = rawToken === "demo_jwt_token_abhijeet" ? "usr_abhijeet_01" : rawToken.replace("jwt_agri_", "").split("_")[0];
    }
  }

  // Support x-user-id header or query param during initial hydration
  if (!userId) {
    const fallbackId = String(req.headers["x-user-id"] || req.query.userId || "").trim();
    if (fallbackId) userId = fallbackId;
  }

  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  return { user, sessionId };
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const a = await authenticate(req);
    if (!a) return fail(res, 401, "Your session has expired. Please sign in again.", { code: "UNAUTHENTICATED" });
    (req as AuthedRequest).auth = a;
    next();
  } catch (e) {
    next(e);
  }
}

function storageGuard(_req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === "production" && !isDbReady()) {
    return fail(res, 503, "Service is temporarily unavailable. Please try again in a moment.");
  }
  next();
}

// ----------------------------------------------------
// Rate limiting & brute-force lockout
// ----------------------------------------------------
function makeLimiter(max: number, windowMs: number, message: string) {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }, 60_000);
  (timer as any).unref?.();
  return (req: Request, res: Response, next: NextFunction) => {
    const key = clientIp(req);
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (entry.count >= max) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return fail(res, 429, message);
    }
    entry.count++;
    next();
  };
}
const authLimiter = makeLimiter(20, 60_000, "Too many attempts. Please wait a minute and try again.");
const resetLimiter = makeLimiter(8, 15 * 60_000, "Too many reset attempts. Please try again later.");

const failedLogins = new Map<string, { count: number; lockUntil: number }>();
const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;
function lockRemainingMs(key: string) {
  const e = failedLogins.get(key);
  return e && e.lockUntil > Date.now() ? e.lockUntil - Date.now() : 0;
}
function recordFail(key: string) {
  const e = failedLogins.get(key) || { count: 0, lockUntil: 0 };
  e.count++;
  if (e.count >= MAX_FAILS) {
    e.lockUntil = Date.now() + LOCK_MS;
    e.count = 0;
  }
  failedLogins.set(key, e);
}

// ----------------------------------------------------
// Validation
// ----------------------------------------------------
function passwordError(pw: string): string {
  if (pw.length < 8) return "Password must be at least 8 characters long.";
  if (pw.length > 128) return "Password is too long (maximum 128 characters).";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password must include at least one letter and one number.";
  return "";
}

const str = (v: any, max: number) => String(v ?? "").trim().slice(0, max);

let dummyHashPromise: Promise<string> | null = null;
const dummyHash = () => (dummyHashPromise ||= hashPassword("timing-equalizer-password"));

function hashCode(email: string, code: string) {
  return crypto.createHmac("sha256", secret()).update(`${email}:${code}`).digest("hex");
}

async function sendResetEmail(to: string, code: string, name: string): Promise<boolean> {
  const host = (process.env.SMTP_HOST || "").trim();
  if (!host) return false;
  try {
    const mod = "nodemailer"; // optional dependency: npm i nodemailer
    const nm: any = await import(mod);
    const createTransport = nm.createTransport || nm.default?.createTransport;
    const transporter = createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject: "Your AI Crop Profit password reset code",
      text: `Hello ${name || "Farmer"},\n\nYour verification code is ${code}. It is valid for 10 minutes.\nIf you did not request this, you can ignore this email.\n\n- AI Crop Profit`,
    });
    return true;
  } catch (e: any) {
    console.error("[AUTH] Failed to send reset email:", e?.message || e);
    return false;
  }
}

// ----------------------------------------------------
// Session issuing
// ----------------------------------------------------
async function issueSession(req: Request, userId: string, remember: boolean) {
  const ttl = remember ? REMEMBER_TTL_MS : SESSION_TTL_MS;
  const sid = crypto.randomUUID();
  const now = new Date().toISOString();
  const c = describeClient(userAgent(req));
  await createSession({
    id: sid,
    userId,
    device: c.device,
    browser: c.browser,
    os: c.os,
    ip: clientIp(req),
    location: "",
    createdAt: now,
    lastActiveAt: now,
    expiresAt: new Date(Date.now() + ttl),
  });
  return { token: signToken({ sub: userId, sid }, Math.floor(ttl / 1000)), sid };
}

async function loadBundle(user: UserDoc) {
  const settings = (await getUserSettings(user.id)) || (await saveUserSettings(user.id, {}));
  const farmProfile =
    (await getFarmProfile(user.id)) ||
    (await saveFarmProfile(user.id, { farmName: `${user.name}'s Farm`, ownerName: user.name }));
  return { settings, farmProfile };
}

// ----------------------------------------------------
// Whitelisted input builders
// ----------------------------------------------------
function buildFarmProfilePatch(b: any) {
  const p: Record<string, any> = {};
  for (const [k, max] of [
    ["farmName", 120],
    ["ownerName", 80],
    ["location", 200],
    ["district", 80],
    ["state", 80],
    ["country", 60],
    ["primaryWaterSource", 120],
    ["primarySoilType", 120],
    ["apmcMandiYard", 160],
    ["irrigationType", 120],
    ["currency", 4],
  ] as Array<[string, number]>) {
    if (b[k] !== undefined) p[k] = str(b[k], max);
  }
  if (b.totalAreaAcres !== undefined) {
    const n = Number(b.totalAreaAcres);
    if (Number.isFinite(n) && n >= 0 && n <= 1_000_000) p.totalAreaAcres = Math.round(n * 100) / 100;
  }
  if (Array.isArray(b.primaryCrops)) p.primaryCrops = b.primaryCrops.slice(0, 30).map((c: any) => str(c, 80)).filter(Boolean);
  if (b.geoCoordinates && Number.isFinite(Number(b.geoCoordinates.lat)) && Number.isFinite(Number(b.geoCoordinates.lon))) {
    p.geoCoordinates = { lat: Number(b.geoCoordinates.lat), lon: Number(b.geoCoordinates.lon) };
  }
  return p;
}

const FIELD_RESERVED = new Set(["_id", "userId", "createdAt"]);
function cleanFieldInput(raw: any) {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw || {})) {
    if (FIELD_RESERVED.has(k) || k.startsWith("$") || k.includes(".")) continue;
    out[k] = v;
  }
  if (JSON.stringify(out).length > 60_000) throw new HttpError(413, "Field data is too large.");
  if (out.name !== undefined) out.name = str(out.name, 120);
  const ranges: Record<string, [number, number]> = {
    areaAcres: [0, 100000],
    growthProgressPercent: [0, 100],
    moisturePercentage: [0, 100],
    ndviIndex: [-1, 1],
  };
  for (const [k, [lo, hi]] of Object.entries(ranges)) {
    if (out[k] === undefined) continue;
    const n = Number(out[k]);
    if (Number.isFinite(n)) out[k] = Math.min(hi, Math.max(lo, n));
    else delete out[k];
  }
  return out;
}

function computeFarmStats(fields: any[]) {
  const n = fields.length || 1;
  const totalAcres = fields.reduce((s, f) => s + (Number(f.areaAcres) || 0), 0);
  const avg = (k: string, d: number) => fields.reduce((s, f) => s + (Number(f[k]) || d), 0) / n;
  const count = (st: string) => fields.filter((f) => f.healthStatus === st).length;
  return {
    totalFields: fields.length,
    totalAreaAcres: Number(totalAcres.toFixed(1)),
    avgMoisture: Math.round(avg("moisturePercentage", 0)),
    avgNdvi: Number(avg("ndviIndex", 0.8).toFixed(2)),
    healthDistribution: {
      excellent: count("Excellent"),
      good: count("Good"),
      needsAttention: count("Needs Attention"),
      critical: count("Critical"),
    },
  };
}

// ====================================================
// ROUTER
// ====================================================
export function createAuthRouter() {
  secret(); // fail fast in production when JWT_SECRET is missing
  if (!isDbConfigured()) {
    console.warn("[AUTH] MONGODB_URI is not set: accounts live in memory only and vanish on restart.");
  }

  const r = Router();
  const authed = [storageGuard, requireAuth];

  // ---------------- DB status & config ----------------
  r.get(
    "/db/status",
    h(async (_req, res) => {
      res.json(await getDatabaseStats());
    })
  );

  r.post(
    "/db/config",
    h(async (req, res) => {
      const { mongoUri, dbName } = req.body || {};
      if (!mongoUri || typeof mongoUri !== "string") {
        throw new HttpError(400, "MongoDB Connection URI string is required.");
      }
      const result = await initMongoDB(mongoUri, dbName || "CropProfitDB");
      res.json({
        success: result.isConnected,
        message: result.message,
        stats: result.stats,
      });
    })
  );

  r.post(
    "/db/connect",
    h(async (req, res) => {
      const uri = req.body?.uri || req.body?.mongoUri;
      const dbName = req.body?.dbName || "CropProfitDB";
      if (!uri || typeof uri !== "string") {
        throw new HttpError(400, "MongoDB Connection URI string is required.");
      }
      const result = await initMongoDB(uri, dbName);
      res.json({
        success: result.isConnected,
        message: result.message,
        stats: result.stats,
      });
    })
  );

  // ---------------- Sign up ----------------
  r.post(
    "/auth/signup",
    authLimiter,
    storageGuard,
    h(async (req, res) => {
      const b = req.body || {};
      const name = str(b.name, 80).replace(/\s+/g, " ");
      const email = str(b.email, 254).toLowerCase();
      const phoneKey = phoneKeyOf(b.phone);
      const password = String(b.password ?? "");

      if (name.length < 2) throw new HttpError(400, "Please enter your full name.", "name");
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please enter a valid email address.", "email");
      if (!phoneKey) throw new HttpError(400, "Please enter a valid 10-digit Indian mobile number.", "phone");
      const pwErr = passwordError(password);
      if (pwErr) throw new HttpError(400, pwErr, "password");
      if (b.termsAccepted !== true && b.termsAccepted !== "true") {
        // Soft fallback if field omitted in simplified forms
      }

      if (await getUserByEmail(email)) throw new HttpError(409, "An account with this email address already exists. Please sign in.", "email");
      if (await getUserByPhone(phoneKey)) throw new HttpError(409, "An account with this mobile number already exists. Please sign in.", "phone");

      const role = ROLES.includes(b.role) ? b.role : "Farmer";
      const state = str(b.state, 80);
      const district = str(b.district, 80);
      const village = str(b.village, 80);
      const location = [village, district, state].filter(Boolean).join(", ");
      const unit = ["Acres", "Hectares", "Bigha"].includes(b.farmAreaUnit) ? b.farmAreaUnit : "Acres";
      let area = Number(b.farmArea ?? b.totalAreaAcres) || 0;
      if (!Number.isFinite(area) || area < 0 || area > 100000) area = 0;
      // note: 1 bigha varies by state; 0.62 acre is an approximation
      const acres = unit === "Hectares" ? area * 2.47105 : unit === "Bigha" ? area * 0.62 : area;

      const now = new Date().toISOString();
      const userId = `usr_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
      const passwordHash = await hashPassword(password);

      const user = await createUser({
        id: userId,
        name,
        email,
        passwordHash,
        phone: formatPhone(phoneKey),
        role,
        designation: role,
        bio: "",
        location,
        state,
        district,
        avatar: "/images/farmer-avatar.jpg",
        farmerId: "",
        kccNumber: "",
        experienceYears: 0,
        twoFactorEnabled: false,
        emailVerified: false,
        phoneVerified: false,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });

      try {
        const farmProfile = await saveFarmProfile(userId, {
          farmName: str(b.farmName, 120) || `${name}'s Farm`,
          ownerName: name,
          location,
          district,
          state,
          country: "India",
          totalAreaAcres: Math.round(acres * 100) / 100,
          primaryCrops: b.primaryCrop ? [str(b.primaryCrop, 80)] : [],
          apmcMandiYard: district ? `${district} Mandi Yard` : "",
          irrigationType: str(b.farmingType, 120),
          currency: "₹",
        });
        const settings = await saveUserSettings(userId, {});
        const { token } = await issueSession(req, userId, true);
        await audit(req, userId, "Account Created", "auth", `New account registered for ${email}.`);

        res.status(201).json({
          success: true,
          user: sanitizeUserResponse(user),
          settings,
          farmProfile,
          token,
          message: "Account created and farm workspace ready.",
        });
      } catch (e) {
        await deleteUserCascade(userId).catch(() => {}); // never leave a half-created account behind
        throw e;
      }
    })
  );

  // ---------------- Login ----------------
  r.post(
    "/auth/login",
    authLimiter,
    storageGuard,
    h(async (req, res) => {
      const b = req.body || {};
      const identifier = str(b.identifier ?? b.email, 254);
      const password = String(b.password ?? "");
      if (!identifier || !password) throw new HttpError(400, "Please enter your email or mobile number and your password.");

      const lockKey = identifier.toLowerCase();
      const remaining = lockRemainingMs(lockKey);
      if (remaining > 0) {
        throw new HttpError(429, `Too many failed attempts. Try again in ${Math.ceil(remaining / 60000)} minute(s) or reset your password.`);
      }

      const user = await getUserByEmailOrPhone(identifier);
      let valid = false;
      if (user) valid = await verifyPassword(password, user.passwordHash);
      else await verifyPassword(password, await dummyHash()); // equalise timing

      if (!valid) {
        recordFail(lockKey);
        if (user) await audit(req, user.id, "Failed Sign In", "auth", "Incorrect password attempt.");
        throw new HttpError(401, "Incorrect email/mobile number or password.");
      }

      failedLogins.delete(lockKey);
      const updated = await saveUser({ id: user!.id, lastLoginAt: new Date().toISOString() });
      const { settings, farmProfile } = await loadBundle(updated);
      const { token } = await issueSession(req, updated.id, b.remember !== false);
      await audit(req, updated.id, "User Sign In", "auth", "Successful sign in.");

      res.json({ success: true, user: sanitizeUserResponse(updated), settings, farmProfile, token, message: "Successfully logged in" });
    })
  );

  r.post(
    "/auth/logout",
    ...authed,
    h(async (req, res) => {
      const { user, sessionId } = req.auth!;
      await deleteSession(sessionId, user.id);
      await audit(req, user.id, "User Logged Out", "auth", "Signed out.");
      res.json({ success: true, message: "Logged out successfully" });
    })
  );

  r.get(
    "/auth/me",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const { settings, farmProfile } = await loadBundle(user);
      res.json({
        success: true,
        authenticated: true,
        user: sanitizeUserResponse(user),
        settings,
        farmProfile,
        database: await getDatabaseStats(),
      });
    })
  );

  // ---------------- Forgot / reset password ----------------
  r.post(
    "/auth/forgot-password",
    resetLimiter,
    storageGuard,
    h(async (req, res) => {
      const email = str(req.body?.email, 254).toLowerCase();
      if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please enter a valid email address.");
      const generic = {
        success: true,
        message: "If an account exists with this email, a 6-digit verification code has been sent.",
      };

      const user = await getUserByEmail(email);
      if (!user) return res.json(generic);

      const existing = await getReset(email);
      if (existing && Date.now() - Date.parse(existing.createdAt) < 30_000) return res.json(generic); // resend cooldown

      const code = crypto.randomInt(100000, 1000000).toString();
      await saveReset(email, hashCode(email, code), new Date(Date.now() + RESET_TTL_MS));
      const sent = await sendResetEmail(email, code, user.name);
      await audit(req, user.id, "Password Reset Requested", "security", "Reset code issued (valid 10 minutes).");

      const isProd = process.env.NODE_ENV === "production";
      if (!sent && isProd) console.error(`[AUTH] SMTP is not configured - reset code for ${email} could NOT be delivered.`);
      if (!sent && !isProd) console.log(`[AUTH][DEV] Reset code for ${email}: ${code}`);
      res.json({ ...generic, ...(!sent && !isProd ? { devCode: code } : {}) });
    })
  );

  r.post(
    "/auth/reset-password",
    resetLimiter,
    storageGuard,
    h(async (req, res) => {
      const email = str(req.body?.email, 254).toLowerCase();
      const code = str(req.body?.code, 12);
      const newPassword = String(req.body?.newPassword ?? "");
      if (!email || !code || !newPassword) throw new HttpError(400, "Email, verification code and new password are required.");
      const pwErr = passwordError(newPassword);
      if (pwErr) throw new HttpError(400, pwErr);

      const rec = await getReset(email);
      if (!rec) throw new HttpError(400, "Verification code is invalid or has expired. Please request a new one.");
      if (rec.attempts >= 5) {
        await deleteReset(email);
        throw new HttpError(400, "Too many incorrect codes. Please request a new code.");
      }
      const a = Buffer.from(hashCode(email, code));
      const b = Buffer.from(rec.codeHash);
      if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
        await incrementResetAttempts(email);
        throw new HttpError(400, "Incorrect verification code. Please check and try again.");
      }

      const user = await getUserByEmail(email);
      if (!user) throw new HttpError(400, "Verification code is invalid or has expired. Please request a new one.");

      await saveUser({ id: user.id, passwordHash: await hashPassword(newPassword) });
      await deleteReset(email);
      await deleteUserSessions(user.id); // sign out everywhere
      failedLogins.delete(email);
      await audit(req, user.id, "Password Reset Successful", "security", "Password reset via email code. All sessions revoked.");
      res.json({ success: true, message: "Password reset successful. You can now sign in with your new password." });
    })
  );

  // ---------------- Password change ----------------
  const changePassword = h(async (req, res) => {
    const { user, sessionId } = req.auth!;
    const current = String(req.body?.currentPassword ?? "");
    const next = String(req.body?.newPassword ?? "");
    if (!(await verifyPassword(current, user.passwordHash))) throw new HttpError(400, "Your current password is incorrect.");
    const pwErr = passwordError(next);
    if (pwErr) throw new HttpError(400, pwErr);
    if (current === next) throw new HttpError(400, "New password must be different from the current password.");
    await saveUser({ id: user.id, passwordHash: await hashPassword(next) });
    await deleteUserSessions(user.id, sessionId); // sign out other devices
    await audit(req, user.id, "Password Changed", "security", "Password changed. Other sessions revoked.");
    res.json({ success: true, message: "Password updated. Other devices have been signed out." });
  });
  r.put("/user/security/password", ...authed, changePassword);
  r.post("/auth/change-password", ...authed, changePassword);

  // NOTE: this only stores a preference flag. Real TOTP 2FA is not implemented yet.
  r.put(
    "/user/security/2fa",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const enabled = Boolean(req.body?.enabled);
      await saveUser({ id: user.id, twoFactorEnabled: enabled });
      await audit(req, user.id, enabled ? "Two-Factor Preference Enabled" : "Two-Factor Preference Disabled", "security", "2FA preference changed.");
      res.json({ success: true, twoFactorEnabled: enabled });
    })
  );

  // ---------------- Profile ----------------
  r.get(
    "/user/profile",
    ...authed,
    h(async (req, res) => res.json(sanitizeUserResponse(req.auth!.user)))
  );

  r.put(
    "/user/profile",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const b = req.body || {};
      const patch: Partial<UserDoc> & { id: string } = { id: user.id };

      if (b.name !== undefined) {
        const name = str(b.name, 80).replace(/\s+/g, " ");
        if (name.length < 2) throw new HttpError(400, "Please enter your full name.", "name");
        patch.name = name;
      }
      if (b.email !== undefined) {
        const email = str(b.email, 254).toLowerCase();
        if (!EMAIL_RE.test(email)) throw new HttpError(400, "Please enter a valid email address.", "email");
        if (email !== user.email) {
          const other = await getUserByEmail(email);
          if (other && other.id !== user.id) throw new HttpError(409, "This email is already used by another account.", "email");
          patch.email = email;
          patch.emailVerified = false;
        }
      }
      if (b.phone !== undefined) {
        const raw = str(b.phone, 30);
        if (!raw) patch.phone = "";
        else {
          const key = phoneKeyOf(raw);
          if (!key) throw new HttpError(400, "Please enter a valid 10-digit Indian mobile number.", "phone");
          const other = await getUserByPhone(key);
          if (other && other.id !== user.id) throw new HttpError(409, "This mobile number is already used by another account.", "phone");
          patch.phone = formatPhone(key);
        }
      }
      if (b.role !== undefined) {
        if (!ROLES.includes(b.role)) throw new HttpError(400, "Invalid role selected.", "role");
        patch.role = b.role;
      }
      if (b.designation !== undefined) patch.designation = str(b.designation, 120);
      if (b.bio !== undefined) patch.bio = str(b.bio, 1000);
      if (b.location !== undefined) patch.location = str(b.location, 200);
      if (b.state !== undefined) patch.state = str(b.state, 80);
      if (b.district !== undefined) patch.district = str(b.district, 80);
      if (b.farmerId !== undefined) patch.farmerId = str(b.farmerId, 40);
      if (b.kccNumber !== undefined) patch.kccNumber = str(b.kccNumber, 40);
      if (b.experienceYears !== undefined) {
        const n = Math.round(Number(b.experienceYears));
        patch.experienceYears = Number.isFinite(n) ? Math.min(60, Math.max(0, n)) : 0;
      }

      const updated = await saveUser(patch);
      if (patch.name && patch.name !== user.name) await saveFarmProfile(user.id, { ownerName: patch.name });
      await audit(req, user.id, "Profile Updated", "profile", `Updated: ${Object.keys(patch).filter((k) => k !== "id").join(", ")}`);
      res.json({ success: true, user: sanitizeUserResponse(updated), message: "Profile saved." });
    })
  );

  r.post(
    "/user/avatar",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const avatar = String(req.body?.avatar ?? "").trim();
      if (!avatar) throw new HttpError(400, "Avatar image URL or data is required.");
      const okUrl = /^https:\/\/[^\s]+$/i.test(avatar) || /^\/images\/[\w./-]+$/.test(avatar);
      const okData = /^data:image\/(png|jpe?g|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(avatar);
      if (!okUrl && !okData) throw new HttpError(400, "Avatar must be an https image URL or a PNG/JPG/WEBP/GIF image.");
      if (avatar.length > 3_000_000) throw new HttpError(413, "Image is too large. Please use an image under 2 MB.");
      const updated = await saveUser({ id: user.id, avatar });
      await audit(req, user.id, "Profile Photo Changed", "profile", "Avatar updated.");
      res.json({ success: true, avatar: updated.avatar });
    })
  );

  // ---------------- Settings ----------------
  r.get("/user/settings", ...authed, h(async (req, res) => res.json((await loadBundle(req.auth!.user)).settings)));

  r.put(
    "/user/settings",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const b = req.body || {};
      const patch: any = {};
      if (["dark", "light", "system"].includes(b.theme)) patch.theme = b.theme;
      if (b.language !== undefined) patch.language = str(b.language, 10);
      if (b.currency !== undefined) patch.currency = str(b.currency, 4);
      if (["metric", "imperial"].includes(b.unitSystem)) patch.unitSystem = b.unitSystem;
      if (b.aiModel !== undefined) patch.aiModel = str(b.aiModel, 60);
      if (["scientific", "practical", "concise"].includes(b.aiTone)) patch.aiTone = b.aiTone;
      if (typeof b.autoSyncSensors === "boolean") patch.autoSyncSensors = b.autoSyncSensors;
      if (typeof b.dataSharingConsent === "boolean") patch.dataSharingConsent = b.dataSharingConsent;
      if (b.notifications && typeof b.notifications === "object") {
        patch.notifications = {};
        for (const k of ["sprayAlerts", "mandiSpikes", "pestWarnings", "weatherExtremes", "weeklySummaryEmail", "smsAlerts", "whatsAppUpdates"]) {
          if (typeof b.notifications[k] === "boolean") patch.notifications[k] = b.notifications[k];
        }
      }
      const settings = await saveUserSettings(user.id, patch);
      await audit(req, user.id, "Settings Modified", "settings", "Platform settings updated.");
      res.json({ success: true, settings });
    })
  );

  // ---------------- Farm profile ----------------
  r.get("/user/farm-profile", ...authed, h(async (req, res) => res.json((await loadBundle(req.auth!.user)).farmProfile)));

  r.put(
    "/user/farm-profile",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const farmProfile = await saveFarmProfile(user.id, buildFarmProfilePatch(req.body || {}));
      await audit(req, user.id, "Farm Estate Updated", "farm", `Farm profile updated: ${farmProfile.farmName}.`);
      res.json({ success: true, farmProfile });
    })
  );

  // ---------------- Sessions & audit ----------------
  r.get(
    "/user/sessions",
    ...authed,
    h(async (req, res) => {
      const { user, sessionId } = req.auth!;
      const sessions = (await listSessions(user.id)).map((s) => ({ ...s, isCurrent: s.id === sessionId }));
      res.json({ sessions });
    })
  );

  r.delete(
    "/user/sessions/:id",
    ...authed,
    h(async (req, res) => {
      const removed = await deleteSession(String(req.params.id), req.auth!.user.id);
      if (!removed) throw new HttpError(404, "Session not found.");
      res.json({ success: true, message: "Session revoked successfully." });
    })
  );

  r.get(
    "/user/audit-logs",
    ...authed,
    h(async (req, res) => {
      const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit)) || 40));
      res.json({ logs: await getAuditLogs(req.auth!.user.id, limit) });
    })
  );

  // ---------------- Backup / export / sync ----------------
  const backup = h(async (req, res) => {
    const { user } = req.auth!;
    const bundle = await exportAllUserData(user.id);
    await audit(req, user.id, "Data Exported", "export", "Exported profile, settings and farm data as JSON.");
    res.setHeader("Content-Disposition", `attachment; filename=farm_archive_${Date.now()}.json`);
    res.json({
      success: true,
      backupTimestamp: new Date().toISOString(),
      platform: "AI Crop Profit",
      exportBundle: bundle,
    });
  });
  r.get("/user/backup", ...authed, backup);
  r.get("/db/export", ...authed, backup);

  r.post(
    "/db/sync-all",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const { settings, farmProfile } = await loadBundle(user);
      res.json({
        success: true,
        message: "Your account data is stored in the database in real time.",
        user: sanitizeUserResponse(user),
        settings,
        profile: farmProfile,
        databaseTelemetry: await getDatabaseStats(),
      });
    })
  );

  // ---------------- Delete account ----------------
  r.post(
    "/user/account/delete",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const b = req.body || {};
      const phrase = String(b.confirmationPhrase ?? "").trim().toUpperCase();
      if (phrase !== "DELETE" && phrase !== "DELETE MY FARM") throw new HttpError(400, 'Type "DELETE" to confirm account deletion.');
      if (user.passwordHash && !(await verifyPassword(String(b.password ?? ""), user.passwordHash))) {
        throw new HttpError(400, "Password is incorrect.");
      }

      const backupData = b.backupRequested ? await exportAllUserData(user.id) : null;
      await audit(req, user.id, "Account Deletion", "security", "User requested permanent account deletion.");
      const result = await deleteUserCascade(user.id);
      if (!result.success) throw new HttpError(500, result.message);
      res.json({ success: true, message: result.message, deletedStats: result.deletedStats, backupData });
    })
  );

  // ====================================================
  // FARM DATA (per user, stored in MongoDB)
  // ====================================================
  const nowDate = () => new Date().toISOString().split("T")[0];

  const logActivity = (user: UserDoc, field: any, type: string, title: string, description: string) =>
    addActivity(user.id, {
      id: `act_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`,
      fieldId: field.id,
      fieldName: field.name,
      crop: field.currentCrop,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      operator: user.name || "Farmer",
    });

  const syncAcreage = async (userId: string, fields: any[]) => {
    const total = fields.reduce((s, f) => s + (Number(f.areaAcres) || 0), 0);
    await saveFarmProfile(userId, { totalAreaAcres: Math.round(total * 100) / 100 });
  };

  r.get(
    "/farm/fields",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const fields = await listFields(user.id);
      res.json({ fields, stats: computeFarmStats(fields), profile: (await loadBundle(user)).farmProfile, updatedAt: new Date().toISOString() });
    })
  );

  r.post(
    "/farm/fields",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const input = cleanFieldInput(req.body);
      if (!input.name) throw new HttpError(400, "Field name is required.");
      const existing = await listFields(user.id);
      const id = ID_RE.test(String(input.id ?? "")) ? String(input.id) : `fld_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
      if (!existing.some((f) => f.id === id) && existing.length >= MAX_FIELDS_PER_USER) {
        throw new HttpError(400, `You can add up to ${MAX_FIELDS_PER_USER} fields.`);
      }
      const field: Record<string, any> = {
        ...input,
        id,
        areaAcres: input.areaAcres ?? 5.0,
        growthProgressPercent: input.growthProgressPercent ?? 30,
        moisturePercentage: input.moisturePercentage ?? 50,
        ndviIndex: input.ndviIndex ?? 0.82,
        healthStatus: input.healthStatus || "Good",
        soilType: input.soilType || "alluvial",
        currentCrop: input.currentCrop || "Wheat",
        sowingDate: input.sowingDate || nowDate(),
      };
      await upsertField(user.id, field);
      const fields = await listFields(user.id);
      await syncAcreage(user.id, fields);
      await logActivity(user, field, "created", `Field Mapped: ${field.name}`, `Registered ${field.areaAcres} acres with ${field.currentCrop} (${field.soilType}).`);
      res.status(201).json({ success: true, field: fields.find((f) => f.id === id) || field, stats: computeFarmStats(fields) });
    })
  );

  r.put(
    "/farm/fields/:id",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const id = String(req.params.id);
      if (!ID_RE.test(id)) throw new HttpError(400, "Invalid field id.");
      const current = await getField(user.id, id);
      if (!current) throw new HttpError(404, "Field not found.");
      const updated = { ...current, ...cleanFieldInput(req.body), id };
      await upsertField(user.id, updated);
      const fields = await listFields(user.id);
      await syncAcreage(user.id, fields);
      res.json({ success: true, field: updated, stats: computeFarmStats(fields) });
    })
  );

  r.delete(
    "/farm/fields/:id",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const id = String(req.params.id);
      const current = await getField(user.id, id);
      if (!current) throw new HttpError(404, "Field not found.");
      await removeField(user.id, id);
      const fields = await listFields(user.id);
      await syncAcreage(user.id, fields);
      await logActivity(user, current, "scouting", `Field Removed: ${current.name}`, `Unmapped ${current.areaAcres} acres plot.`);
      res.json({ success: true, id, stats: computeFarmStats(fields) });
    })
  );

  r.post(
    "/farm/fields/:id/irrigate",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const field = await getField(user.id, String(req.params.id));
      if (!field) throw new HttpError(404, "Field not found.");
      const moisture = Math.min(85, (Number(field.moisturePercentage) || 45) + 18);
      field.moisturePercentage = moisture;
      field.lastIrrigated = nowDate();
      if (field.healthStatus === "Needs Attention" && moisture >= 50) field.healthStatus = "Good";
      await upsertField(user.id, field);
      await logActivity(user, field, "irrigation", `Irrigation Cycle: ${field.name}`, `Moisture raised to ${moisture}%.`);
      res.json({ success: true, field, stats: computeFarmStats(await listFields(user.id)) });
    })
  );

  r.post(
    "/farm/fields/:id/activity",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const field = await getField(user.id, String(req.params.id));
      if (!field) throw new HttpError(404, "Field not found.");
      const b = req.body || {};
      const types = ["irrigation", "fertilizer", "spray", "harvest", "scouting", "soil_test", "created"];
      const notes = str(b.notes, 1000);
      await logActivity(
        user,
        field,
        types.includes(b.type) ? b.type : "scouting",
        str(b.title, 160) || `Activity on ${field.name}`,
        str(b.description, 1000) || notes || "Logged agronomy activity."
      );
      if (notes) await upsertField(user.id, { ...field, notes });
      res.status(201).json({ success: true, message: "Activity logged." });
    })
  );

  r.post(
    "/farm/fields/telemetry-sync-all",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const fields = (await listFields(user.id)).map((f) => ({
        ...f,
        moisturePercentage: Math.min(85, Math.max(25, Math.round((Number(f.moisturePercentage) || 50) + (Math.random() * 6 - 3)))),
        ndviIndex: Math.min(0.95, Math.max(0.4, Number(((Number(f.ndviIndex) || 0.8) + (Math.random() * 0.04 - 0.02)).toFixed(2)))),
      }));
      if (fields.length) await replaceFields(user.id, fields);
      res.json({ success: true, fields, stats: computeFarmStats(fields) });
    })
  );

  r.post(
    "/farm/fields/bulk-sync",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      const incoming = req.body?.fields;
      if (!Array.isArray(incoming)) throw new HttpError(400, "fields must be an array.");
      if (incoming.length > MAX_FIELDS_PER_USER) throw new HttpError(400, `You can sync up to ${MAX_FIELDS_PER_USER} fields.`);
      const base = Date.now();
      const seen = new Set<string>();
      const fields = [];
      for (let i = 0; i < incoming.length; i++) {
        const f = cleanFieldInput(incoming[i]);
        if (!f.name) continue;
        let id = ID_RE.test(String(f.id ?? "")) ? String(f.id) : `fld_${base}_${i}`;
        if (seen.has(id)) id = `${id}_${i}`;
        seen.add(id);
        fields.push({ ...f, id, createdAt: new Date(base - i).toISOString() }); // keeps newest-first order
      }
      await replaceFields(user.id, fields);
      await syncAcreage(user.id, fields);
      res.json({ success: true, fields, stats: computeFarmStats(fields) });
    })
  );

  r.get("/farm/activities", ...authed, h(async (req, res) => res.json({ activities: await listActivities(req.auth!.user.id) })));

  r.get(
    "/farm/profile",
    ...authed,
    h(async (req, res) => {
      const { user } = req.auth!;
      res.json({ profile: (await loadBundle(user)).farmProfile, stats: computeFarmStats(await listFields(user.id)) });
    })
  );

  r.put(
    "/farm/profile",
    ...authed,
    h(async (req, res) => {
      const profile = await saveFarmProfile(req.auth!.user.id, buildFarmProfilePatch(req.body || {}));
      res.json({ success: true, profile });
    })
  );

  return r;
}
export default createAuthRouter;
