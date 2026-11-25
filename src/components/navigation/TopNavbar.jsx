import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  Sprout,
  ChevronDown,
  Bell,
  Globe,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  Check,
  Layers,
  X,
  Home,
  Sun,
  Moon,
  ChevronRight,
  MapPinned,
  TrendingUp,
  FlaskConical,
  Droplets,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useFarm } from "../../context/FarmContext.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";

/* ------------------------------------------------------------------ */
/*  Dropdown items – label / subtitle / kis tab par jaye yaha se badlo  */
/*  tone = icon tile ka soft background color                           */
/* ------------------------------------------------------------------ */
const CROP_MENU = [
  { icon: Sprout, title: "Crop Recommendation", sub: "Best crop for your land", tab: "crop_analysis" },
  { icon: TrendingUp, title: "Yield Prediction", sub: "Expected production", tab: "profit_risk" },
  { icon: FlaskConical, title: "Fertilizer Advice", sub: "Right dose, less cost", tab: "soil_health" },
  { icon: Droplets, title: "Irrigation Plan", sub: "Save water smartly", tab: "weather" },
];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", tab: "dashboard" },
  { key: "crop_analysis", label: "AI Crop Analysis", tab: "crop_analysis", dropdown: true },
  { key: "crop_disease", label: "Crop Disease", tab: "disease_diagnosis" },
  { key: "soil_health", label: "Soil Health", tab: "soil_health" },
  { key: "weather", label: "Weather", tab: "weather" },
  { key: "market", label: "Market", tab: "market_intelligence" },
  { key: "profit_risk", label: "Profit & Risk", tab: "profit_risk" },
  { key: "reports", label: "Reports", tab: "reports" },
];

const MOBILE_ITEMS = [
  { label: "Dashboard", tab: "dashboard" },
  { label: "AI Crop Analysis (State & Village)", tab: "crop_analysis" },
  { label: "Crop Disease Detection", tab: "disease_diagnosis" },
  { label: "Soil Health Laboratory", tab: "soil_health" },
  { label: "Weather Forecast", tab: "weather" },
  { label: "Today's Mandi Prices", tab: "market_intelligence" },
  { label: "Profit & Risk Analysis", tab: "profit_risk" },
  { label: "My Farm (GIS Parcels)", tab: "farm_fields" },
  { label: "Reports & Certificates", tab: "reports" },
  { label: "Settings & Profile", tab: "settings" },
];

const LANGS = [
  { code: "en", short: "EN", label: "English" },
  { code: "hi", short: "हिं", label: "हिन्दी (Hindi)" },
  { code: "pa", short: "ਪੰ", label: "ਪੰਜਾਬੀ (Punjabi)" },
];

/* ------------------------------------------------------------------ */
/*  CSS – premium-* classes par depend nahi karta                       */
/*  NOTE: entrance animations 'backwards' fill use karti hain taaki     */
/*  hover (lift / slide) animation ke baad bhi kaam kare.               */
/* ------------------------------------------------------------------ */
const NAV_CSS = `
.ac-nav,.ac-drawer,.ac-overlay{--ease:cubic-bezier(.22,1,.36,1);--g:#15803D;--gl:#e8f5ec;--muted:#64748b}
.dark .ac-nav,.dark .ac-drawer,.dark .ac-overlay{--gl:#13261b;--muted:#94a3b8}
.ac-nav{position:sticky;top:0;z-index:50;width:100%;height:78px;
  background:rgba(255,255,255,.9);backdrop-filter:blur(18px) saturate(170%);-webkit-backdrop-filter:blur(18px) saturate(170%);
  border-bottom:1px solid rgba(226,232,240,.8);
  transition:height .35s var(--ease),background .35s,box-shadow .35s,border-color .35s}
.dark .ac-nav{background:rgba(15,23,42,.9);border-color:#1e293b}
.ac-nav.scrolled{height:64px;background:rgba(255,255,255,.8);box-shadow:0 14px 34px -16px rgba(15,23,42,.3)}
.dark .ac-nav.scrolled{background:rgba(15,23,42,.8)}
.ac-nav *,.ac-drawer *{box-sizing:border-box}
.ac-inner{max-width:1440px;height:100%;margin:0 auto;padding:0 14px;display:flex;align-items:center;justify-content:space-between;gap:14px}
@media (min-width:641px){.ac-inner{padding:0 24px}}
@media (min-width:1280px){.ac-inner{padding:0 20px}}
@media (min-width:1440px){.ac-inner{padding:0 32px;gap:18px}}

/* keyboard focus (accessibility) */
.ac-link:focus-visible,.ac-chev:focus-visible,.ac-ibtn:focus-visible,.ac-lang:focus-visible,
.ac-avatar:focus-visible,.ac-mi:focus-visible,.ac-lopt:focus-visible,.ac-drow:focus-visible,.ac-brand:focus-visible{
  outline:2px solid #22c55e;outline-offset:2px}

/* ---------- brand ---------- */
.ac-brand{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none;flex-shrink:0;transition:opacity .2s}
.ac-brand:hover{opacity:.95}
.ac-logo{position:relative;overflow:hidden;width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
  background:#f0fdf4;color:var(--g);
  border:1px solid #bbf7d0;box-shadow:0 2px 6px -1px rgba(21,128,61,.15);
  transition:transform .25s var(--ease),width .3s var(--ease),height .3s var(--ease),box-shadow .25s}
.dark .ac-logo{background:#062314;color:#34d399;border-color:rgba(52,211,153,.3)}
.ac-brand:hover .ac-logo{transform:scale(1.03);box-shadow:0 4px 12px -2px rgba(21,128,61,.25)}
.scrolled .ac-logo{width:38px;height:38px}
.ac-logo svg{display:block;width:100%;height:100%}
.ac-bt{line-height:1.15;min-width:0}
.ac-bt b{display:block;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:22px;font-weight:700;letter-spacing:-.6px;line-height:1;white-space:nowrap;color:#0f172a;transition:color .3s}
.ac-bt b span{font-size:inherit;font-weight:800;color:#15803D;margin-left:4px;letter-spacing:-.6px}
.dark .ac-bt b{color:#f8fafc}
.dark .ac-bt b span{color:#22c55e}
.ac-tag{display:block;margin-top:4px;font-family:"Inter",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:12px;font-weight:500;line-height:1.2;color:#64748b;letter-spacing:-.1px;overflow:hidden;max-height:16px;opacity:1;white-space:nowrap;transition:max-height .25s,opacity .25s,margin .25s}
.dark .ac-tag{color:#94a3b8}
.scrolled .ac-tag{max-height:0;opacity:0;margin-top:0}
@media (min-width:768px){.ac-bt b{font-size:24px}}
@media (min-width:1440px){.ac-logo{width:46px;height:46px}.scrolled .ac-logo{width:40px;height:40px}.ac-bt b{font-size:26px}.ac-tag{font-size:12.5px}}

/* ---------- links ---------- */
.ac-links{position:relative;display:none;align-items:center;gap:0}
.ac-burger{display:grid}
@media (min-width:1280px){.ac-links{display:flex}.ac-burger{display:none!important}}
@media (min-width:1440px){.ac-links{gap:2px}}
.ac-pill,.ac-hpill{position:absolute;left:0;top:0;border-radius:999px;pointer-events:none;z-index:0}
.ac-pill{overflow:hidden;background:#15803D;
  box-shadow:0 4px 14px -3px rgba(21,128,61,.5),inset 0 1px 0 rgba(255,255,255,.2)}
.ac-hpill{background:var(--gl)}
.ac-link{position:relative;z-index:1;overflow:hidden;padding:9px 10px;border-radius:999px;border:0;background:transparent;cursor:pointer;
  font-family:inherit;font-size:13px;font-weight:600;color:#334155;white-space:nowrap;transition:color .3s,transform .3s var(--ease)}
.dark .ac-link{color:#cbd5e1}
.ac-link:hover{color:var(--g)}
.dark .ac-link:hover{color:#34d399}
.ac-link:active{transform:scale(.95)}
.ac-link.on,.ac-link.on:hover{color:#fff}
@media (min-width:1440px){.ac-link{font-size:14px;font-weight:700;padding:10px 13px}}
@media (min-width:1700px){.ac-link{font-size:15px;padding:11px 17px}}

.ac-dd{position:relative;z-index:1;display:flex;align-items:center;border-radius:999px}
.ac-dd .ac-link{padding-right:4px}
.ac-chev{position:relative;z-index:1;padding:9px 10px 9px 2px;border:0;background:transparent;cursor:pointer;border-radius:999px;color:#475569;transition:color .3s;display:grid;place-items:center}
.dark .ac-chev{color:#cbd5e1}
.ac-chev:hover{color:var(--g)}
.ac-chev.on,.ac-chev.on:hover{color:#fff}
.ac-chev svg{width:16px;height:16px;transition:transform .35s var(--ease)}
.ac-chev.open svg{transform:rotate(180deg)}

/* ---------- popup base (open / close dono animate hote hain) ---------- */
.ac-pop{opacity:0;visibility:hidden;transform:translateY(-10px) scale(.96);transform-origin:top right;pointer-events:none;
  transition:opacity .3s,transform .4s var(--ease),visibility 0s .4s}
.ac-pop.left{transform-origin:top left}
.ac-pop.open{opacity:1;visibility:visible;transform:none;pointer-events:auto;transition:opacity .3s,transform .4s var(--ease),visibility 0s}
.ac-pop.open .ac-ri{animation:ac-row .45s var(--ease) var(--d,0s) backwards}

/* ---------- AI Crop dropdown ---------- */
.ac-menu{position:absolute;top:calc(100% + 14px);left:0;width:322px;padding:8px;border-radius:22px;z-index:60;
  background:rgba(255,255,255,.97);border:1px solid #e6eaf0;box-shadow:0 28px 64px -18px rgba(15,23,42,.35)}
.dark .ac-menu{background:rgba(15,23,42,.97);border-color:#1e293b;box-shadow:0 28px 64px -18px rgba(0,0,0,.75)}
.ac-menu::before{content:"";position:absolute;left:0;right:0;top:-16px;height:16px}
.ac-menu::after{content:"";position:absolute;top:-7px;left:34px;width:12px;height:12px;background:#fff;
  border-left:1px solid #e6eaf0;border-top:1px solid #e6eaf0;border-radius:3px 0 0 0;transform:rotate(45deg)}
.dark .ac-menu::after{background:#0f172a;border-color:#1e293b}
.ac-mh{padding:8px 12px 6px;font-size:11px;font-weight:800;letter-spacing:.09em;text-transform:uppercase;color:var(--muted)}
.ac-mi{position:relative;display:flex;align-items:center;gap:14px;width:100%;padding:10px 12px;border:0;border-radius:14px;background:transparent;
  text-align:left;cursor:pointer;font-family:inherit;transition:background .25s,transform .35s var(--ease)}
.ac-mi:hover{background:var(--gl);transform:translateX(4px)}
.ac-ico{flex-shrink:0;width:38px;height:38px;border-radius:10px;display:grid;place-items:center;background:var(--gl);color:var(--g);transition:background .2s,color .2s}
.ac-mi:hover .ac-ico{background:#dcfce7;color:#15803D}
.dark .ac-mi:hover .ac-ico{background:#062314;color:#22c55e}
.ac-mi b{display:block;font-size:14px;font-weight:600;color:#0f172a;line-height:1.25}
.dark .ac-mi b{color:#fff}
.ac-mi small{display:block;margin-top:2px;font-size:12px;font-weight:500;color:var(--muted)}
.ac-mi .ac-arr{margin-left:auto;width:15px;height:15px;flex-shrink:0;color:var(--g);opacity:0;transform:translateX(-4px);transition:opacity .2s,transform .2s var(--ease)}
.dark .ac-mi .ac-arr{color:#34d399}
.ac-mi:hover .ac-arr{opacity:1;transform:none}
.ac-mf{display:flex;align-items:center;justify-content:center;gap:6px;width:calc(100% - 8px);margin:6px 4px 2px;padding:10px 12px;border:0;border-radius:10px;
  background:#15803D;color:#fff;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;
  box-shadow:0 2px 6px -1px rgba(21,128,61,.4);transition:background .2s,transform .15s var(--ease)}
.ac-mf:hover{background:#16a34a;transform:translateY(-1px)}
.ac-mf:active{transform:scale(.98)}
.ac-mf svg{width:15px;height:15px;transition:transform .2s var(--ease)}
.ac-mf:hover svg{transform:translateX(2px)}

/* ---------- right side ---------- */
.ac-actions{display:flex;align-items:center;gap:8px}
@media (min-width:1440px){.ac-actions{gap:12px}}
.ac-wrap{position:relative}
.ac-ibtn{position:relative;width:40px;height:40px;border-radius:50%;border:1px solid #e2e8f0;background:#ffffff;color:#334155;display:grid;place-items:center;cursor:pointer;
  transition:background .2s,color .2s,border-color .2s}
.dark .ac-ibtn{background:#1e293b;border-color:#334155;color:#e2e8f0}
.ac-ibtn:hover{background:var(--gl);color:var(--g);border-color:#bbf7d0}
.dark .ac-ibtn:hover{color:#34d399;border-color:#059669}
.ac-ibtn:active{transform:scale(.95)}
.ac-ibtn svg{width:18px;height:18px}
@media (min-width:1440px){.ac-ibtn{width:42px;height:42px}}

.ac-theme{overflow:hidden}
.ac-theme svg{position:absolute;transition:transform .4s var(--ease),opacity .3s}
.ac-theme .sun{transform:rotate(-90deg) scale(0);opacity:0;color:#fbbf24}
.ac-theme .moon{transform:none;opacity:1}
.ac-theme.is-dark .sun{transform:none;opacity:1}
.ac-theme.is-dark .moon{transform:rotate(90deg) scale(0);opacity:0}

.ac-bell svg{transform-origin:50% 10%}
.ac-badge{position:absolute;top:-2px;right:-2px;pointer-events:none}
.ac-badge b{position:relative;display:grid;place-items:center;min-width:18px;height:18px;padding:0 4px;border-radius:9px;background:#ef4444;color:#fff;font-size:10.5px;font-weight:700;border:2px solid #fff}
.dark .ac-badge b{border-color:#0f172a}

.ac-lang{display:flex;align-items:center;gap:7px;height:40px;padding:0 13px;border:1px solid #e2e8f0;border-radius:999px;background:#ffffff;color:#334155;font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;
  transition:background .2s,border-color .2s}
.dark .ac-lang{background:#1e293b;border-color:#334155;color:#e2e8f0}
.ac-lang:hover,.ac-lang.open{background:var(--gl);border-color:#bbf7d0}
.ac-lang:active{transform:scale(.97)}
.ac-lang svg{width:16px;height:16px;transition:transform .3s var(--ease)}
.ac-lang.open .globe{transform:rotate(180deg)}
.ac-lang .cv{width:13px;height:13px;color:#94a3b8}
.ac-lang.open .cv{transform:rotate(180deg)}
@media (min-width:1440px){.ac-lang{height:42px;font-size:13.5px}}

.ac-lmenu{position:absolute;right:0;top:calc(100% + 12px);min-width:176px;padding:6px;border-radius:16px;z-index:60;
  background:rgba(255,255,255,.97);border:1px solid #e6eaf0;box-shadow:0 16px 36px -12px rgba(15,23,42,.2)}
.dark .ac-lmenu{background:rgba(15,23,42,.97);border-color:#1e293b;box-shadow:0 16px 36px -12px rgba(0,0,0,.6)}
.ac-lopt{display:flex;align-items:center;justify-content:space-between;width:100%;padding:9px 12px;border:0;border-radius:10px;background:transparent;
  font-family:inherit;font-size:13px;font-weight:600;color:#334155;cursor:pointer;transition:background .2s}
.dark .ac-lopt{color:#e2e8f0}
.ac-lopt:hover{background:var(--gl)}
.ac-lopt.sel{color:var(--g);background:var(--gl)}
.dark .ac-lopt.sel{color:#34d399}
.ac-lopt svg{width:15px;height:15px}

.ac-avatar{position:relative;width:42px;height:42px;padding:0;border:2px solid #22c55e;border-radius:50%;background:none;cursor:pointer;transition:transform .2s var(--ease),border-color .2s}
.ac-avatar:hover{transform:scale(1.04);border-color:#15803D}
.ac-avatar:active{transform:scale(.96)}
.ac-avatar .fc{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;background:#fff;display:flex;align-items:center;justify-content:center}
.dark .ac-avatar .fc{background:#0f172a}
.ac-avatar .dot{position:absolute;right:-1px;bottom:-1px;width:11px;height:11px;border-radius:50%;background:#22c55e;border:2px solid #fff;z-index:2}
.dark .ac-avatar .dot{border-color:#0f172a}
@media (min-width:1440px){.ac-avatar{width:44px;height:44px}}
.ac-avatar .dot{position:absolute;right:0;bottom:0;width:12px;height:12px;border-radius:50%;background:#22c55e;border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(21,128,61,0.25);z-index:2}
.dark .ac-avatar .dot{border-color:#0f172a}
@media (min-width:1440px){.ac-avatar{width:48px;height:48px}}

/* ---------- hamburger (3 lines -> X) ---------- */
.ac-burger i{display:block;width:20px;height:2px;margin:3px 0;border-radius:2px;background:currentColor;transition:transform .4s var(--ease),opacity .3s}
.ac-burger.on i:nth-child(1){transform:translateY(5px) rotate(45deg)}
.ac-burger.on i:nth-child(2){opacity:0}
.ac-burger.on i:nth-child(3){transform:translateY(-5px) rotate(-45deg)}

/* ---------- mobile drawer (right side slide-in) ---------- */
.ac-overlay{position:fixed;inset:0;z-index:70;background:rgba(2,6,23,.5);backdrop-filter:blur(3px);opacity:0;visibility:hidden;transition:opacity .4s,visibility 0s .4s}
.ac-overlay.open{opacity:1;visibility:visible;transition:opacity .4s,visibility 0s}
.ac-drawer{position:fixed;top:0;right:0;z-index:80;height:100vh;height:100dvh;width:min(330px,86vw);padding:18px 16px 24px;overflow-y:auto;
  background:#fff;box-shadow:-24px 0 60px rgba(0,0,0,.22);transform:translateX(105%);transition:transform .5s var(--ease)}
.dark .ac-drawer{background:#0f172a}
.ac-drawer.open{transform:none}
.ac-dhead{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:2px 6px 12px;border-bottom:1px solid #e6eaf0}
.dark .ac-dhead{border-color:#1e293b}
.ac-dhead span{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.ac-ucard{display:flex;align-items:center;gap:12px;margin-bottom:12px;padding:12px;border-radius:16px;
  background:linear-gradient(135deg,var(--gl),transparent);border:1px solid #dcefe2}
.dark .ac-ucard{border-color:rgba(52,211,153,.18)}
.ac-ucard .av{width:44px;height:44px;flex-shrink:0;border-radius:50%;overflow:hidden;border:2px solid #22c55e}
.ac-ucard strong{display:block;font-size:14px;font-weight:700;color:#0f172a;line-height:1.25}
.dark .ac-ucard strong{color:#fff}
.ac-ucard small{display:block;margin-top:2px;font-size:12px;font-weight:500;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:190px}
.ac-drow{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 14px;margin-bottom:4px;border:0;border-radius:14px;background:transparent;
  text-align:left;font-family:inherit;font-size:14.5px;font-weight:600;color:#334155;cursor:pointer;transition:background .25s,transform .25s var(--ease)}
.dark .ac-drow{color:#e2e8f0}
.ac-drow:hover{background:var(--gl);transform:translateX(4px)}
.ac-drow:active{transform:scale(.98)}
.ac-drow.on{background:linear-gradient(135deg,#1fa955,#15803D);color:#fff;box-shadow:0 10px 20px -12px rgba(21,128,61,.9)}
.ac-drawer.open .ac-drow,.ac-drawer.open .ac-ucard{animation:ac-row .45s var(--ease) var(--d,0s) backwards}

/* ---------- progress ---------- */
.ac-progress{position:absolute;left:0;right:0;bottom:-1px;height:2.5px;overflow:hidden;pointer-events:none;z-index:55}
.ac-progress div{height:100%;width:100%;transform-origin:left;transform:scaleX(0);opacity:0;background:linear-gradient(90deg,#15803D,#22C55E,#86EFAC);border-radius:0 2px 2px 0;will-change:transform,opacity;transition:none}

/* ---------- ripple ---------- */
.ac-rip{position:absolute;border-radius:50%;background:rgba(21,128,61,.28);transform:scale(0);animation:ac-rip .6s linear;pointer-events:none}
.ac-rip.lt{background:rgba(255,255,255,.45)}

/* ---------- entrance ---------- */
.ac-in{opacity:1}

@keyframes ac-drop{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:none}}
@keyframes ac-item{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}
@keyframes ac-row{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:none}}
@keyframes ac-rip{to{transform:scale(4);opacity:0}}

@media (max-width:640px){.ac-tag{display:none}.ac-bt b{font-size:20px;letter-spacing:-.5px}.ac-bt b span{letter-spacing:-.5px;margin-left:3px}.ac-lang span{display:none}.ac-lang{padding:0 10px}.ac-ibtn{width:36px;height:36px}.ac-avatar{width:38px;height:38px}}
@media (prefers-reduced-motion:reduce){*{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;

/* Bulletproof Avatar: Instant initials fallback + smooth image loading without broken image icons or truncated text */
function Avatar({ src, name, className = "" }) {
  const [currentSrc, setCurrentSrc] = useState(src || "/images/farmer-avatar.jpg");
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const validSrc = src || "/images/farmer-avatar.jpg";
    setCurrentSrc(validSrc);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  const initials = (name || "Farmer")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "F";

  const handleError = () => {
    if (currentSrc !== "/images/farmer-avatar.jpg") {
      setCurrentSrc("/images/farmer-avatar.jpg");
    } else {
      setFailed(true);
    }
  };

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "inherit",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #16a34a 0%, #15803d 60%, #14532d 100%)",
        color: "#ffffff",
        fontWeight: 700,
        fontSize: "0.85rem",
        letterSpacing: "0.02em",
        userSelect: "none",
      }}
      aria-label={name}
    >
      <span aria-hidden="true">{initials}</span>

      {!failed && currentSrc && (
        <img
          src={currentSrc}
          alt=""
          loading="eager"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={handleError}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            borderRadius: "inherit",
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.25s ease-in-out",
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  );
}

/* Click par ripple effect (HTML demo jaisa) */
function ripple(e) {
  if (e.detail === 0) return; // keyboard click par skip
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  const d = Math.max(r.width, r.height);
  const s = document.createElement("span");
  s.className = "ac-rip" + (el.classList.contains("on") ? " lt" : "");
  s.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
  el.appendChild(s);
  setTimeout(() => s.remove(), 650);
}

/* Hover-open sirf mouse wali devices par (touch par tap se hi khulega) */
const canHover = () =>
  typeof window !== "undefined" &&
  !!window.matchMedia &&
  window.matchMedia("(hover: hover) and (pointer: fine)").matches;

export function TopNavbar({
  onOpenCropStudio,
  onOpenSettings,
  onOpenSoilModal,
  onOpenReportsModal,
  onOpenUserSwitcher,
}) {
  const { user, logout } = useAuth();
  const farm = useFarm();
  const { isDarkMode, toggleTheme } = useTheme();
  const { unreadCount = 0 } = useNotifications();

  const farmProfile = farm?.farmProfile || {};
  const farmFields = farm?.fields || [];
  const profileName = farmProfile.ownerName || user?.name || "Farmer";
  const profileLocation = farmProfile.location || user?.location || "Farm location not set";
  const farmArea = farmProfile.totalAreaAcres || user?.totalLandArea || 149;
  const avatarSrc = user?.avatar || farmProfile.avatar || "/images/farmer-avatar.jpg";

  const activeTab = farm?.activeTab || "dashboard";
  const setActiveTab = farm?.setActiveTab || (() => { });

  const [cropAiOpen, setCropAiOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* selected language (abhi local state + localStorage; i18n baad me jod sakte ho) */
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("ac_lang");
      return LANGS.some((l) => l.code === saved) ? saved : "en";
    } catch {
      return "en";
    }
  });
  const currentLang = LANGS.find((l) => l.code === lang) || LANGS[0];

  const cropAiRef = useRef(null);
  const langRef = useRef(null);
  const profileRef = useRef(null);
  const progressRef = useRef(null);
  const navRef = useRef(null);
  const itemRefs = useRef({});
  const hoverTimer = useRef(null);

  const [pill, setPill] = useState(null);
  const [hover, setHover] = useState(null);
  const [hoverOn, setHoverOn] = useState(false);
  const [hoverGlide, setHoverGlide] = useState(false);
  const [pillAnimated, setPillAnimated] = useState(false);

  /* ---------------- outside click + Escape ---------------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cropAiRef.current && !cropAiRef.current.contains(e.target)) setCropAiOpen(false);
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setCropAiOpen(false);
        setLangOpen(false);
        setProfileOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  /* ---------------- scroll: shrink + progress bar ---------------- */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 12);
        if (progressRef.current) {
          const max = document.documentElement.scrollHeight - window.innerHeight;
          if (max > 20 && y > 15) {
            const ratio = Math.min(1, Math.max(0, y / max));
            progressRef.current.style.transform = `scaleX(${ratio})`;
            progressRef.current.style.opacity = "1";
          } else {
            progressRef.current.style.transform = "scaleX(0)";
            progressRef.current.style.opacity = "0";
          }
        }
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Reset scroll progress and state on tab change immediately */
  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.transform = "scaleX(0)";
      progressRef.current.style.opacity = "0";
    }
    setScrolled(false);
  }, [activeTab]);

  /* mobile drawer khula ho to page scroll lock */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileMenuOpen]);

  /* ---------------- navigation ---------------- */
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const topOffset = 80;
    const y = el.getBoundingClientRect().top + window.pageYOffset - topOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  const navigateToTab = (tabKey, scrollTargetId = null) => {
    setCropAiOpen(false);
    setMobileMenuOpen(false);

    if (scrollTargetId) {
      if (activeTab !== "dashboard") {
        React.startTransition(() => {
          setActiveTab("dashboard");
        });
        setTimeout(() => scrollToId(scrollTargetId), 80);
      } else {
        scrollToId(scrollTargetId);
      }
    } else {
      React.startTransition(() => {
        setActiveTab(tabKey);
      });
      if (window.scrollY > 0) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const isNavActive = (key) => {
    if (key === "dashboard") return activeTab === "dashboard";
    if (key === "crop_analysis") return activeTab === "crop_analysis" || activeTab === "ai_crop_analysis";
    if (key === "crop_disease") return activeTab === "disease_diagnosis" || activeTab === "crop_disease";
    if (key === "soil_health") return activeTab === "soil_health" || activeTab === "soil";
    if (key === "weather") return activeTab === "weather";
    if (key === "market") return activeTab === "market_intelligence" || activeTab === "market";
    if (key === "profit_risk") return activeTab === "profit_risk";
    if (key === "reports") return activeTab === "reports";
    return false;
  };

  /* ---------------- dropdown / popup helpers ---------------- */
  const openCropMenu = () => {
    if (!canHover()) return;
    clearTimeout(hoverTimer.current);
    setLangOpen(false);
    setProfileOpen(false);
    setCropAiOpen(true);
  };
  const closeCropMenu = () => {
    if (!canHover()) return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setCropAiOpen(false), 170);
  };

  const toggleCropMenu = () => {
    setLangOpen(false);
    setProfileOpen(false);
    setCropAiOpen((p) => !p);
  };
  const toggleLang = () => {
    setCropAiOpen(false);
    setProfileOpen(false);
    setLangOpen((p) => !p);
  };
  const toggleProfile = () => {
    setCropAiOpen(false);
    setLangOpen(false);
    setProfileOpen((p) => !p);
  };

  const selectLang = (code) => {
    setLang(code);
    setLangOpen(false);
    try {
      localStorage.setItem("ac_lang", code);
    } catch {
      /* storage blocked – ignore */
    }
    document.documentElement.lang = code;
    window.dispatchEvent(new CustomEvent("ac:language-change", { detail: { lang: code } }));
  };

  /* ---------------- sliding pill ---------------- */
  const activeKey = NAV_ITEMS.find((i) => isNavActive(i.key))?.key || null;

  const measure = useCallback((key) => {
    const el = itemRefs.current[key];
    if (!el) return null;
    return { key, x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight };
  }, []);

  const syncPill = useCallback(() => {
    const next = activeKey ? measure(activeKey) : null;
    setPill((prev) => {
      if (prev && next && prev.key === next.key && prev.x === next.x && prev.y === next.y && prev.w === next.w && prev.h === next.h) {
        return prev;
      }
      return next;
    });
  }, [activeKey, measure]);

  useLayoutEffect(() => {
    syncPill();
    const id = requestAnimationFrame(() => setPillAnimated(true));
    return () => cancelAnimationFrame(id);
  }, [syncPill]);

  useEffect(() => {
    const onResize = () => {
      syncPill();
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
    };
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready) document.fonts.ready.then(syncPill);
    return () => window.removeEventListener("resize", onResize);
  }, [syncPill]);

  /* nav ka size badle (font load, zoom, layout) to pill apne aap sahi jagah aaye */
  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !navRef.current) return;
    const ro = new ResizeObserver(() => syncPill());
    ro.observe(navRef.current);
    return () => ro.disconnect();
  }, [syncPill]);

  /* hover pill: pehli baar seedha sahi jagah dikhe, uske baad items ke beech glide kare */
  useEffect(() => {
    if (!hover || hoverGlide) return;
    const id = requestAnimationFrame(() => setHoverGlide(true));
    return () => cancelAnimationFrame(id);
  }, [hover, hoverGlide]);

  const showHover = (key) => {
    setHover(measure(key));
    setHoverOn(true);
  };

  const unread = unreadCount || 2;
  const unreadLabel = unread > 9 ? "9+" : unread;
  const showHoverPill = hoverOn && hover && hover.key !== activeKey;

  return (
    <header className={`ac-nav ${scrolled ? "scrolled" : ""}`}>
      <style>{NAV_CSS}</style>

      <div className="ac-inner">
        {/* ================= LEFT: LOGO ================= */}
        <div
          className="ac-brand"
          role="link"
          tabIndex={0}
          onClick={() => navigateToTab("dashboard")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigateToTab("dashboard");
            }
          }}
          title="AI Crop Profit — Smart Farming, Higher Profit"
        >
          <div className="ac-logo" aria-hidden="true">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#F0FDF4" />
              <path d="M8 27.5C12.5 25.5 17 25.5 20 26.5C23 27.5 25.5 27.5 28 26" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.35" />
              <path d="M18 26.5V13" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M18 18.5C14.5 18.5 10 16 10.5 11C15 11 17.5 15 18 18.5Z" fill="#22C55E" />
              <path d="M18 15C21.5 15 26 12.5 25.5 7.5C21 7.5 18.5 11.5 18 15Z" fill="#15803D" />
              <circle cx="18" cy="11" r="1.25" fill="#86EFAC" />
            </svg>
          </div>
          <div className="ac-bt">
            <b>
              AI Crop<span>Profit</span>
            </b>
            <span className="ac-tag">Smart Farming, Higher Profit</span>
          </div>
        </div>

        {/* ================= CENTER: NAV LINKS ================= */}
        <nav
          ref={navRef}
          className="ac-links"
          aria-label="Primary navigation"
          onMouseLeave={() => setHoverOn(false)}
        >
          <span
            aria-hidden
            className="ac-hpill"
            style={{
              width: hover?.w || 0,
              height: hover?.h || 0,
              opacity: showHoverPill ? 1 : 0,
              transform: `translate(${hover?.x || 0}px, ${hover?.y || 0}px)`,
              transition: hoverGlide
                ? "transform .4s cubic-bezier(.22,1,.36,1), width .4s cubic-bezier(.22,1,.36,1), height .4s cubic-bezier(.22,1,.36,1), opacity .25s"
                : "opacity .25s",
            }}
          />

          <span
            aria-hidden
            className="ac-pill"
            style={{
              width: pill?.w || 0,
              height: pill?.h || 0,
              opacity: pill ? 1 : 0,
              transform: `translate(${pill?.x || 0}px, ${pill?.y || 0}px)`,
              transition: pillAnimated
                ? "transform .55s cubic-bezier(.22,1,.36,1), width .55s cubic-bezier(.22,1,.36,1), height .55s cubic-bezier(.22,1,.36,1), opacity .3s"
                : "none",
            }}
          />

          {NAV_ITEMS.map((item, i) => {
            const delay = { animationDelay: `${0.12 + i * 0.05}s` };
            const on = isNavActive(item.key);

            if (item.dropdown) {
              return (
                <div
                  key={item.key}
                  ref={(el) => {
                    cropAiRef.current = el;
                    itemRefs.current[item.key] = el;
                  }}
                  className="ac-dd ac-in"
                  style={delay}
                  onMouseEnter={() => {
                    showHover(item.key);
                    openCropMenu();
                  }}
                  onMouseLeave={closeCropMenu}
                >
                  <button
                    type="button"
                    className={`ac-link ${on ? "on" : ""}`}
                    aria-current={on ? "page" : undefined}
                    onClick={(e) => {
                      ripple(e);
                      navigateToTab("crop_analysis");
                    }}
                  >
                    {item.label}
                  </button>
                  <button
                    type="button"
                    className={`ac-chev ${on ? "on" : ""} ${cropAiOpen ? "open" : ""}`}
                    onClick={toggleCropMenu}
                    aria-haspopup="menu"
                    aria-expanded={cropAiOpen}
                    aria-label="Open AI crop tools menu"
                  >
                    <ChevronDown />
                  </button>

                  <div className={`ac-menu ac-pop left ${cropAiOpen ? "open" : ""}`} role="menu">
                    <div className="ac-mh ac-ri" style={{ "--d": "0s" }}>AI crop tools</div>
                    {CROP_MENU.map((m, idx) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.title}
                          type="button"
                          role="menuitem"
                          tabIndex={cropAiOpen ? 0 : -1}
                          className="ac-mi ac-ri"
                          style={{ "--d": `${0.05 + idx * 0.05}s` }}
                          onClick={() => navigateToTab(m.tab, m.scroll)}
                        >
                          <span className="ac-ico">
                            <Icon className="w-4 h-4 stroke-[2.2]" />
                          </span>
                          <span>
                            <b>{m.title}</b>
                            <small>{m.sub}</small>
                          </span>
                          <ChevronRight className="ac-arr" />
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      tabIndex={cropAiOpen ? 0 : -1}
                      className="ac-mf ac-ri"
                      style={{ "--d": ".28s" }}
                      onClick={() => navigateToTab("crop_analysis")}
                    >
                      Open AI Crop Analysis <ChevronRight />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                ref={(el) => (itemRefs.current[item.key] = el)}
                className={`ac-link ac-in ${on ? "on" : ""}`}
                style={delay}
                aria-current={on ? "page" : undefined}
                onClick={(e) => {
                  ripple(e);
                  navigateToTab(item.tab);
                }}
                onMouseEnter={() => showHover(item.key)}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ================= RIGHT CONTROLS ================= */}
        <div className="ac-actions">
          {/* Theme */}
          <button
            type="button"
            className={`ac-ibtn ac-theme ac-in ${isDarkMode ? "is-dark" : ""}`}
            style={{ animationDelay: ".55s" }}
            onClick={toggleTheme}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <Sun className="sun" />
            <Moon className="moon" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            className="ac-ibtn ac-bell ac-in"
            style={{ animationDelay: ".6s" }}
            onClick={() => navigateToTab("dashboard", "hero")}
            title={`${unread} New Farm Alerts`}
            aria-label={`${unread} unread farm alerts`}
          >
            <Bell />
            <span className="ac-badge" key={unread}>
              <i />
              <b>{unreadLabel}</b>
            </span>
          </button>

          {/* Language */}
          <div ref={langRef} className="ac-wrap ac-in" style={{ animationDelay: ".65s" }}>
            <button
              type="button"
              className={`ac-lang ${langOpen ? "open" : ""}`}
              onClick={toggleLang}
              aria-haspopup="menu"
              aria-expanded={langOpen}
              aria-label={`Language: ${currentLang.label}`}
            >
              <Globe className="globe" />
              <span>{currentLang.short}</span>
              <ChevronDown className="cv" />
            </button>

            <div className={`ac-lmenu ac-pop ${langOpen ? "open" : ""}`} role="menu">
              {LANGS.map((l, i) => (
                <button
                  key={l.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={l.code === lang}
                  tabIndex={langOpen ? 0 : -1}
                  className={`ac-lopt ac-ri ${l.code === lang ? "sel" : ""}`}
                  style={{ "--d": `${0.04 + i * 0.05}s` }}
                  onClick={() => selectLang(l.code)}
                >
                  <span>{l.label}</span>
                  {l.code === lang && <Check />}
                </button>
              ))}
            </div>
          </div>

          {/* Profile */}
          <div ref={profileRef} className="ac-wrap ac-in" style={{ animationDelay: ".7s" }}>
            <button
              type="button"
              className="ac-avatar"
              onClick={toggleProfile}
              aria-label="Open farmer profile menu"
              aria-haspopup="menu"
              aria-expanded={profileOpen}
            >
              <span className="ring" aria-hidden />
              <span className="fc">
                <Avatar src={avatarSrc} name={profileName} />
              </span>
              <span className="dot" aria-hidden />
            </button>

            <div
              className={`premium-profile-menu ac-pop ${profileOpen ? "open" : ""} absolute right-0 mt-3 w-[min(380px,calc(100vw-1.5rem))] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs`}
            >
              <div className="premium-profile-header px-4 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="premium-profile-header-avatar shrink-0 overflow-hidden">
                  <Avatar src={avatarSrc} name={profileName} />
                </div>
                <div className="min-w-0">
                  <div className="premium-profile-name">{profileName}</div>
                  <div className="premium-profile-meta flex items-center gap-1.5">
                    <MapPinned className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{profileLocation}</span>
                  </div>
                  <div className="premium-profile-status"><span /> Verified Farmer Account</div>
                </div>
              </div>

              <div className="premium-profile-stats px-4 py-3">
                <div className="premium-profile-stat">
                  <Layers className="text-emerald-600 dark:text-emerald-400" />
                  <div><span>Farm area</span><strong>{farmArea} acres</strong></div>
                </div>
                <div className="premium-profile-stat">
                  <Home className="text-emerald-600 dark:text-emerald-400" />
                  <div><span>Land parcels</span><strong>{farmFields.length > 0 ? farmFields.length : 6} registered</strong></div>
                </div>
              </div>

              <div className="premium-profile-section">
                <div className="premium-profile-section-label">Farm management</div>
                <button
                  onClick={() => { setProfileOpen(false); navigateToTab("farm_fields"); }}
                  className="ac-ri premium-profile-menu-item"
                  style={{ "--d": ".05s" }}
                >
                  <span className="premium-profile-menu-icon"><MapPinned /></span>
                  <span className="premium-profile-menu-copy"><strong>My Farm &amp; Land Parcels</strong></span>
                  <ChevronRight className="premium-profile-menu-arrow" />
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigateToTab("crop_intelligence"); }}
                  className="ac-ri premium-profile-menu-item"
                  style={{ "--d": ".1s" }}
                >
                  <span className="premium-profile-menu-icon"><Sprout /></span>
                  <span className="premium-profile-menu-copy"><strong>Crop Intelligence Studio</strong></span>
                  <ChevronRight className="premium-profile-menu-arrow" />
                </button>
              </div>

              <div className="premium-profile-section premium-profile-account-section">
                <div className="premium-profile-section-label">Account</div>
                <button
                  onClick={() => { setProfileOpen(false); navigateToTab("settings"); }}
                  className="ac-ri premium-profile-menu-item"
                  style={{ "--d": ".15s" }}
                >
                  <span className="premium-profile-menu-icon"><SettingsIcon /></span>
                  <span className="premium-profile-menu-copy"><strong>Farm Profile &amp; Settings</strong></span>
                  <ChevronRight className="premium-profile-menu-arrow" />
                </button>
                <button
                  onClick={() => { setProfileOpen(false); if (onOpenUserSwitcher) onOpenUserSwitcher(); }}
                  className="ac-ri premium-profile-menu-item"
                  style={{ "--d": ".2s" }}
                >
                  <span className="premium-profile-menu-icon"><UserIcon /></span>
                  <span className="premium-profile-menu-copy"><strong>Switch Farmer Account</strong></span>
                  <ChevronRight className="premium-profile-menu-arrow" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setProfileOpen(false); logout(); }}
                className="ac-ri premium-profile-signout"
                style={{ "--d": ".25s" }}
              >
                <LogOut /><span>Sign out</span>
              </button>
            </div>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className={`ac-ibtn ac-burger ${mobileMenuOpen ? "on" : ""}`}
            onClick={() => setMobileMenuOpen((p) => !p)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            <div>
              <i />
              <i />
              <i />
            </div>
          </button>
        </div>
      </div>

      {/* Scroll progress */}
      <div className="ac-progress">
        <div ref={progressRef} />
      </div>

      {/* Mobile drawer + overlay (portal: header ke backdrop-filter se bahar) */}
      {typeof document !== "undefined" &&
        createPortal(
          <>
            <div
              className={`ac-overlay ${mobileMenuOpen ? "open" : ""}`}
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside className={`ac-drawer ${mobileMenuOpen ? "open" : ""}`} aria-hidden={!mobileMenuOpen}>
              <div className="ac-dhead">
                <span>Menu</span>
                <button
                  type="button"
                  className="ac-ibtn"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                >
                  <X />
                </button>
              </div>

              <div className="ac-ucard" style={{ "--d": ".05s" }}>
                <div className="av">
                  <Avatar src={avatarSrc} name={profileName} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <strong>{profileName}</strong>
                  <small>{profileLocation}</small>
                </div>
              </div>

              {MOBILE_ITEMS.map((item, i) => (
                <button
                  key={item.tab}
                  type="button"
                  tabIndex={mobileMenuOpen ? 0 : -1}
                  className={`ac-drow ${activeTab === item.tab ? "on" : ""}`}
                  style={{ "--d": `${0.1 + i * 0.045}s` }}
                  onClick={(e) => {
                    ripple(e);
                    navigateToTab(item.tab);
                  }}
                >
                  <span>{item.label}</span>
                  {activeTab === item.tab && <Check size={16} />}
                </button>
              ))}
            </aside>
          </>,
          document.body
        )}
    </header>
  );
}

export default TopNavbar;
