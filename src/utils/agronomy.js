// src/utils/agronomy.js
// Shared agronomy / finance helpers used by dashboard sections and modals.

export const SQ = 2.471; // acres per hectare

/* ------------------------------------------------------------------ */
/*  Formatters                                                         */
/* ------------------------------------------------------------------ */
export const formatINR = (n) =>
  `₹${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

export function formatINRCompact(n) {
  const v = Number(n) || 0;
  const a = Math.abs(v);
  if (a >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (a >= 1e5) return `₹${(v / 1e5).toFixed(1)}L`;
  if (a >= 1e3) return `₹${(v / 1e3).toFixed(0)}K`;
  return `₹${Math.round(v)}`;
}

export const cleanCropName = (name = "") => String(name).split("(")[0].trim();
const round1 = (n) => Math.round(n * 10) / 10;
const clamp = (n, lo = 0, hi = 100) =>
  Math.max(lo, Math.min(hi, Math.round(n)));

export function getCurrentSeason(date = new Date()) {
  const m = date.getMonth() + 1;
  if (m >= 10 || m <= 3) return "Rabi";
  if (m >= 6 && m <= 9) return "Kharif";
  return "Zaid";
}

/* ------------------------------------------------------------------ */
/*  Crop economics (ESTIMATES per acre – update with real mandi data)  */
/* ------------------------------------------------------------------ */
const CROP_ECONOMICS = [
  { match: ["wheat"], profit: 25000, cost: 21500, yield: 22.5 },
  {
    match: ["mustard", "rapeseed", "sarson"],
    profit: 22000,
    cost: 14200,
    yield: 8.5,
  },
  {
    match: ["rice", "paddy", "basmati"],
    profit: 18000,
    cost: 24000,
    yield: 28,
  },
  { match: ["maize", "corn"], profit: 20000, cost: 18000, yield: 26 },
  { match: ["soybean"], profit: 16000, cost: 12000, yield: 9 },
  { match: ["barley"], profit: 15000, cost: 12500, yield: 20 },
  { match: ["potato"], profit: 42000, cost: 33000, yield: 90 },
  { match: ["cotton"], profit: 30000, cost: 20000, yield: 10 },
  { match: ["sugarcane", "cane"], profit: 55000, cost: 45000, yield: 350 },
];
const DEFAULT_ECON = { profit: 18000, cost: 20000, yield: 15 };

export function getCropEconomics(name = "") {
  const n = String(name).toLowerCase();
  return (
    CROP_ECONOMICS.find((c) => c.match.some((m) => n.includes(m))) ||
    DEFAULT_ECON
  );
}

/** Season-level estimate for the whole farm. `sample` = true when no fields exist yet. */
export function farmEconomics(fields = []) {
  const sample = fields.length === 0;
  const list = sample ? [{ areaAcres: 5, currentCrop: "Wheat" }] : fields;
  let revenue = 0;
  let investment = 0;
  list.forEach((f) => {
    const eco = getCropEconomics(f.currentCrop);
    const area = Number(f.areaAcres) || 0;
    revenue += area * (eco.profit + eco.cost);
    investment += area * eco.cost;
  });
  return { revenue, investment, profit: revenue - investment, sample };
}

/* ------------------------------------------------------------------ */
/*  Soil helpers                                                       */
/* ------------------------------------------------------------------ */
export function averageSoil(fields = []) {
  const tests = fields.map((f) => f.soilTest).filter(Boolean);
  const avg = (key, def) =>
    tests.length
      ? round1(
          tests.reduce((s, t) => s + (Number(t[key]) || def), 0) / tests.length,
        )
      : def;
  return {
    nitrogen: avg("nitrogen", 90),
    phosphorus: avg("phosphorus", 45),
    potassium: avg("potassium", 45),
    ph: avg("ph", 6.8),
    organicCarbon: avg("organicCarbon", 0.65),
  };
}

export function computeSoilHealthScore(soil = {}) {
  const n = Number(soil.nitrogen) || 0;
  const p = Number(soil.phosphorus) || 0;
  const k = Number(soil.potassium) || 0;
  const ph = Number(soil.ph) || 6.8;
  const oc = Number(soil.organicCarbon) || 0.5;
  let score = 55;
  score += Math.max(0, 12 - Math.abs(ph - 6.9) * 8); // pH
  score += Math.min(12, (oc / 0.75) * 12); // organic carbon
  score += n >= 80 ? 7 : (n / 80) * 7;
  score += p >= 30 ? 7 : (p / 30) * 7;
  score += k >= 30 ? 7 : (k / 30) * 7;
  return clamp(score, 35, 98);
}

/** Commercial-bag fertilizer plan (Indian bags: DAP 50kg, Urea 45kg, MOP 50kg). */
export function buildFertPlan(areaAcres = 1, soil = {}) {
  const ha = (Number(areaAcres) || 1) / SQ;
  const n = Number(soil.nitrogen) || 80;
  const p = Number(soil.phosphorus) || 25;
  const k = Number(soil.potassium) || 30;

  const defN = Math.max(15, 120 - n) * ha;
  const defP = Math.max(10, 60 - p) * ha;
  const defK = Math.max(10, 40 - k) * ha;

  const dapBags = Math.max(0.5, round1(defP / 23));
  const remN = Math.max(0, defN - dapBags * 9);
  const ureaBags = Math.max(0.5, round1(remN / 20.7));
  const mopBags = Math.max(0.5, round1(defK / 30));
  const totalZincKg = Math.max(2, Math.round((Number(areaAcres) || 1) * 10));

  const totalDapKg = Math.round(dapBags * 50);
  const totalUreaKg = Math.round(ureaBags * 45);
  const totalMopKg = Math.round(mopBags * 50);
  const estCost = Math.round(
    dapBags * 1350 + ureaBags * 266.5 + mopBags * 1700 + totalZincKg * 34,
  );

  return {
    dapBags,
    ureaBags,
    mopBags,
    totalDapKg,
    totalUreaKg,
    totalMopKg,
    totalZincKg,
    estCost,
  };
}

/* ------------------------------------------------------------------ */
/*  Crop profiles for the Agronomy Blueprint modal                     */
/* ------------------------------------------------------------------ */
const GENERIC_STAGES = [
  {
    stageNumber: 1,
    name: "Germination & Establishment",
    dasRange: "0 - 15 DAS",
    waterVolumePercent: 10,
    criticalActions:
      "Ensure uniform seedbed moisture, treat seed with Trichoderma/Carbendazim, gap-fill within 10 days.",
    scoutingAlert: "Check for damping-off and termite patches.",
  },
  {
    stageNumber: 2,
    name: "Early Vegetative Growth",
    dasRange: "15 - 35 DAS",
    waterVolumePercent: 25,
    criticalActions:
      "First irrigation + weeding, apply first nitrogen top-dressing.",
    scoutingAlert: "Look for aphids/jassids on tender leaves.",
  },
  {
    stageNumber: 3,
    name: "Active Vegetative / Tillering",
    dasRange: "35 - 60 DAS",
    waterVolumePercent: 25,
    criticalActions:
      "Second top-dressing, light earthing-up, maintain soil moisture near field capacity.",
    scoutingAlert: "Early leaf spots and rust pustules in humid mornings.",
  },
  {
    stageNumber: 4,
    name: "Flowering & Fruit/Grain Set",
    dasRange: "60 - 90 DAS",
    waterVolumePercent: 25,
    criticalActions:
      "Do not allow moisture stress; foliar micronutrient (Boron/Zinc) if needed.",
    scoutingAlert: "Borers and pod/ear feeders peak now.",
  },
  {
    stageNumber: 5,
    name: "Maturity & Harvest",
    dasRange: "90+ DAS",
    waterVolumePercent: 15,
    criticalActions:
      "Stop irrigation 10-12 days before harvest; harvest at correct moisture.",
    scoutingAlert: "Watch for lodging and bird damage.",
  },
];

const GENERIC_IPM = [
  {
    name: "Sucking Pests (Aphid / Jassid / Whitefly)",
    etl: "10-15 / plant",
    symptoms: "Curling leaves, honeydew, sooty mould.",
    biologicalControl:
      "Neem oil 1500 ppm @ 5 ml/L, yellow sticky traps (10/acre).",
    chemicalOption: "Imidacloprid 17.8% SL @ 50 ml/acre in 150 L water.",
  },
  {
    name: "Fungal Leaf Spots & Blight",
    etl: "5% leaf area",
    symptoms: "Brown/tan lesions with yellow halo.",
    biologicalControl: "Trichoderma viride @ 5 g/L foliar spray.",
    chemicalOption:
      "Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L.",
  },
];

const GENERIC_CROP = {
  emoji: "🌱",
  name: "Crop",
  hindiName: "फसल",
  scientificName: "—",
  season: "Seasonal",
  durationDays: "100-130",
  optimalPHMin: 6.0,
  optimalPHMax: 7.5,
  waterRequirementMm: 450,
  mspPerQtl: 0,
  typicalPricePerQtl: 0,
  marketDemandTrend: "Stable",
  spacingCm: "As per recommended package",
  seedRatePerAcre: "As per variety",
  waterTolerance: "Moderate",
  popularVarieties: ["Certified local high-yield variety"],
  phenologicalStages: GENERIC_STAGES,
  ipmProtocols: GENERIC_IPM,
  economicSummary:
    "Returns depend on variety, input cost and mandi timing. Compare 2-3 nearby APMC rates before selling.",
};

// NOTE: MSP / price values are reference figures – update every season.
const CROP_PROFILES = {
  wheat: {
    emoji: "🌾",
    name: "Wheat",
    hindiName: "गेहूं",
    scientificName: "Triticum aestivum L.",
    season: "Rabi",
    durationDays: "120-140",
    optimalPHMin: 6.0,
    optimalPHMax: 7.5,
    waterRequirementMm: 450,
    mspPerQtl: 2275,
    typicalPricePerQtl: 2380,
    marketDemandTrend: "Stable to Bullish",
    spacingCm: "20-22.5 cm row spacing",
    seedRatePerAcre: "40-45 kg",
    waterTolerance: "Moderate (4-5 irrigations)",
    popularVarieties: ["HD-2967", "HD-3086", "PBW-725", "DBW-187"],
    phenologicalStages: [
      {
        stageNumber: 1,
        name: "Germination",
        dasRange: "0 - 10 DAS",
        waterVolumePercent: 10,
        criticalActions:
          "Sow at 5 cm depth, optimal window 1-25 Nov; treat seed with Carbendazim 2 g/kg.",
        scoutingAlert: "Termite patches and poor emergence.",
      },
      {
        stageNumber: 2,
        name: "Crown Root Initiation (CRI)",
        dasRange: "20 - 25 DAS",
        waterVolumePercent: 25,
        criticalActions:
          "MOST CRITICAL irrigation. Apply 1st Urea split right after watering.",
        scoutingAlert: "Weeds (Phalaris minor) – spray herbicide at 30-35 DAS.",
      },
      {
        stageNumber: 3,
        name: "Tillering",
        dasRange: "40 - 45 DAS",
        waterVolumePercent: 20,
        criticalActions:
          "2nd irrigation + 2nd Urea split. Maintain moisture for productive tillers.",
        scoutingAlert: "Yellow rust stripes on leaves, aphids.",
      },
      {
        stageNumber: 4,
        name: "Flowering / Booting",
        dasRange: "80 - 90 DAS",
        waterVolumePercent: 25,
        criticalActions:
          "Light irrigation only; avoid lodging in windy weather.",
        scoutingAlert: "Terminal heat stress >32°C – spray 1.5% KNO₃.",
      },
      {
        stageNumber: 5,
        name: "Grain Filling",
        dasRange: "100 - 120 DAS",
        waterVolumePercent: 20,
        criticalActions:
          "Last irrigation at milk stage; stop 15 days before harvest.",
        scoutingAlert: "Brown rust and ear-head aphids.",
      },
    ],
    ipmProtocols: [
      {
        name: "Yellow / Stripe Rust",
        etl: "First pustules",
        symptoms: "Bright yellow powdery stripes on upper leaf surface.",
        biologicalControl:
          "Trichoderma viride 5 g/L + Neem oil 5 ml/L preventive.",
        chemicalOption: "Propiconazole 25% EC @ 200 ml in 200 L water/acre.",
      },
      {
        name: "Aphids",
        etl: "10-15 / tiller",
        symptoms: "Colonies on ear-heads, honeydew, shrivelled grain.",
        biologicalControl: "Conserve ladybird beetles; NSKE 5% spray.",
        chemicalOption: "Imidacloprid 17.8% SL @ 50 ml/acre.",
      },
      {
        name: "Weeds (Phalaris minor)",
        etl: "10 plants/m²",
        symptoms: "Narrow-leaf grassy weeds competing in rows.",
        biologicalControl: "Stale seedbed + timely sowing, clean seed.",
        chemicalOption: "Clodinafop 15% WP @ 160 g/acre at 30-35 DAS.",
      },
    ],
    economicSummary:
      "Assured MSP procurement and strong flour-mill demand make wheat a low-risk Rabi anchor crop. Hold part of the harvest 3-4 weeks to capture seasonal price recovery.",
  },
  mustard: {
    emoji: "🌼",
    name: "Mustard",
    hindiName: "सरसों",
    scientificName: "Brassica juncea L.",
    season: "Rabi",
    durationDays: "100-120",
    optimalPHMin: 6.0,
    optimalPHMax: 7.8,
    waterRequirementMm: 250,
    mspPerQtl: 5650,
    typicalPricePerQtl: 5780,
    marketDemandTrend: "Bullish",
    spacingCm: "30 × 10 cm",
    seedRatePerAcre: "1.5-2 kg",
    waterTolerance: "Low (2-3 irrigations)",
    popularVarieties: ["Pusa Bold", "Giriraj", "RH-749"],
    ipmProtocols: [
      {
        name: "Mustard Aphid (Mahu)",
        etl: "10-15 aphids / 10 cm twig",
        symptoms: "Colonies on inflorescence and pods, sooty mould.",
        biologicalControl: "Yellow sticky traps 10/acre; NSKE 5%.",
        chemicalOption:
          "Thiamethoxam 25% WG @ 40-50 g/acre (spray after 3:30 PM to protect bees).",
      },
      {
        name: "Alternaria Blight",
        etl: "5% leaf area",
        symptoms: "Concentric dark spots on leaves and pods.",
        biologicalControl: "Trichoderma seed treatment.",
        chemicalOption: "Mancozeb 75% WP @ 500 g/acre.",
      },
    ],
    economicSummary:
      "Low water need and high oil content give excellent margins; prices usually trade above MSP in Rajasthan/Punjab mandis.",
  },
  rice: {
    emoji: "🌾",
    name: "Rice",
    hindiName: "धान",
    scientificName: "Oryza sativa L.",
    season: "Kharif",
    durationDays: "120-150",
    optimalPHMin: 5.5,
    optimalPHMax: 7.0,
    waterRequirementMm: 1200,
    mspPerQtl: 2300,
    typicalPricePerQtl: 3850,
    marketDemandTrend: "Strong export demand",
    spacingCm: "20 × 15 cm (transplanting)",
    seedRatePerAcre: "8-10 kg (nursery)",
    waterTolerance: "High (puddled / AWD)",
    popularVarieties: ["Pusa Basmati 1121", "PR-126", "Pusa 1509"],
    ipmProtocols: [
      {
        name: "Brown Plant Hopper",
        etl: "10 / hill",
        symptoms: "Hopper-burn patches, yellowing from the base.",
        biologicalControl: "Avoid excess N; drain field 3-4 days.",
        chemicalOption: "Pymetrozine 50% WG @ 120 g/acre.",
      },
      {
        name: "Blast",
        etl: "First lesions",
        symptoms: "Spindle-shaped grey lesions on leaves and neck.",
        biologicalControl: "Pseudomonas fluorescens seed treatment.",
        chemicalOption: "Tricyclazole 75% WP @ 120 g/acre.",
      },
    ],
    economicSummary:
      "Basmati fetches premium export prices; adopt Alternate Wetting & Drying to cut water use by 25-30%.",
  },
};
const CROP_ALIASES = {
  paddy: "rice",
  basmati: "rice",
  rapeseed: "mustard",
  sarson: "mustard",
};

const hasItems = (a) => Array.isArray(a) && a.length > 0;

/** Turns a recommendation card (or any partial crop object) into a full blueprint-ready crop. */
export function normalizeCrop(raw = {}) {
  const key = `${raw.id || ""} ${raw.name || ""}`.toLowerCase();
  const profileKey =
    Object.keys(CROP_PROFILES).find((k) => key.includes(k)) ||
    Object.entries(CROP_ALIASES).find(([alias]) => key.includes(alias))?.[1];
  const profile = CROP_PROFILES[profileKey] || {};

  const clean = Object.fromEntries(
    Object.entries(raw).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );
  const merged = { ...GENERIC_CROP, ...profile, ...clean };

  if (!raw.durationDays && raw.duration) {
    merged.durationDays = String(raw.duration).replace(/\s*days?/i, "");
  }
  merged.popularVarieties = hasItems(raw.popularVarieties)
    ? raw.popularVarieties
    : hasItems(profile.popularVarieties)
      ? profile.popularVarieties
      : raw.variety
        ? String(raw.variety)
            .split("/")
            .map((s) => s.trim())
            .filter(Boolean)
        : GENERIC_CROP.popularVarieties;
  merged.phenologicalStages = hasItems(raw.phenologicalStages)
    ? raw.phenologicalStages
    : profile.phenologicalStages || GENERIC_STAGES;
  merged.ipmProtocols = hasItems(raw.ipmProtocols)
    ? raw.ipmProtocols
    : profile.ipmProtocols || GENERIC_IPM;
  return merged;
}

export function buildBlueprintEvaluation(card, soil) {
  const crop = normalizeCrop(card);
  const eco = getCropEconomics(crop.name);
  const profit = Number(card.expectedProfitPerAcre) || eco.profit;
  const invest = Number(card.estimatedInvestment) || eco.cost;
  const score = Number(card.suitabilityScore) || 85;
  const fert = buildFertPlan(1, soil || {});

  const strengths = [
    `Soil–climate match ${score}%`,
    crop.mspPerQtl > 0 ? "Assured MSP procurement" : "Strong mandi demand",
    card.tag ? `${card.tag} category crop` : "Fits current season window",
  ];
  const advisories = [
    card.aiInsight || "Favorable market opportunity in regional APMC mandis.",
    "Verify seed certification and sowing window before purchase.",
  ];

  return {
    crop,
    overallScore: score,
    soilChemScore: clamp(score - 2),
    hydroScore: clamp(score - 6),
    climateScore: clamp(score),
    econScore: clamp(score - 4),
    projectedYield: Number(card.expectedYieldQtl) || eco.yield,
    grossRevenue: profit + invest,
    inputCost: invest,
    netProfit: profit,
    roiPercent: invest > 0 ? Math.round((profit / invest) * 100) : 0,
    strengths,
    advisories,
    fertilizerPlan: {
      dapBags: fert.dapBags,
      dapKg: fert.totalDapKg,
      ureaBags: fert.ureaBags,
      ureaKg: fert.totalUreaKg,
      mopBags: fert.mopBags,
      mopKg: fert.totalMopKg,
      zincKg: fert.totalZincKg,
      sulphurKg: 8,
      estimatedCost: fert.estCost,
    },
  };
}
