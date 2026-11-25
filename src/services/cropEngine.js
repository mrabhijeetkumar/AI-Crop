// Precision Agronomy & Crop Recommendation Machine Learning Simulation Engine
// Based on ICAR (Indian Council of Agricultural Research) agronomic indices & NPK physiological response models

export const INDIAN_CROPS_DATABASE = [
  {
    crop: "wheat",
    cropDisplayName: "Wheat (HD-2967 / HD-3086)",
    scientificName: "Triticum aestivum L.",
    growingSeason: "Rabi",
    category: "Cereal Grain",
    idealN: 120,
    idealP: 60,
    idealK: 40,
    minPh: 6.0,
    maxPh: 7.5,
    minTemp: 12,
    maxTemp: 28,
    minHumidity: 40,
    maxHumidity: 75,
    minRainfall: 50,
    maxRainfall: 150,
    waterReqMm: 450,
    durationDays: "120 - 135 days",
    baseYieldTons: 5.2,
    marketPrice: 2350, // ₹ per quintal
    cultivationCostPerHa: 38000,
    riskLevel: "Low",
    suitableSoils: ["Alluvial", "Loamy", "Black (Regur)", "Clay"],
    aiInsight: "Exceptionally high synergy with your soil NPK balance and cool Rabi thermal window. Proven lodging resistance and guaranteed MSP procurement.",
    organicRemedy: "Apply 2.5 tonnes FYM + 250 kg Neem Cake per hectare during tillage to fortify rhizosphere microbial activity.",
    chemicalSchedule: "Basal: 55kg DAP + 20kg MOP per acre. Top-dress Urea @ 45kg/acre at CRI stage (21 DAS) and tillering stage (45 DAS).",
  },
  {
    crop: "paddy",
    cropDisplayName: "Rice / Paddy (Basmati Pusa 1121)",
    scientificName: "Oryza sativa L.",
    growingSeason: "Kharif",
    category: "Cereal Grain",
    idealN: 130,
    idealP: 50,
    idealK: 50,
    minPh: 5.5,
    maxPh: 7.2,
    minTemp: 22,
    maxTemp: 38,
    minHumidity: 70,
    maxHumidity: 95,
    minRainfall: 150,
    maxRainfall: 350,
    waterReqMm: 1200,
    durationDays: "130 - 145 days",
    baseYieldTons: 6.5,
    marketPrice: 2420,
    cultivationCostPerHa: 46000,
    riskLevel: "Moderate",
    suitableSoils: ["Clay", "Alluvial", "Loamy"],
    aiInsight: "Thrives in warm, humid climates with strong water retention. Excellent market demand across domestic APMCs and export channels.",
    organicRemedy: "Green manuring with Dhaincha (Sesbania) incorporated 45 days before puddling adds 60-80 kg natural Nitrogen per hectare.",
    chemicalSchedule: "Basal: 50kg DAP + 35kg MOP + 10kg Zinc Sulphate at puddling. Top-dress 40kg Urea at active tillering.",
  },
  {
    crop: "mustard",
    cropDisplayName: "Mustard / Rapeseed (Pusa Bold)",
    scientificName: "Brassica juncea L.",
    growingSeason: "Rabi",
    category: "Oilseed",
    idealN: 80,
    idealP: 40,
    idealK: 30,
    minPh: 6.0,
    maxPh: 7.8,
    minTemp: 10,
    maxTemp: 26,
    minHumidity: 45,
    maxHumidity: 75,
    minRainfall: 30,
    maxRainfall: 100,
    waterReqMm: 280,
    durationDays: "105 - 120 days",
    baseYieldTons: 2.4,
    marketPrice: 5650,
    cultivationCostPerHa: 26000,
    riskLevel: "Low",
    suitableSoils: ["Loamy", "Alluvial", "Sandy", "Red"],
    aiInsight: "Outstanding profit margin with extremely low water requirement. Ideal crop for rotation in light to medium textured loams.",
    organicRemedy: "Soil incorporation of Trichoderma viride @ 5kg/ha mixed with 100kg compost to protect against Alternaria and White Rust.",
    chemicalSchedule: "Basal: 35kg DAP + 15kg MOP + 15kg Bentonite Sulphur (vital for oil content). Top-dress 35kg Urea at flowering.",
  },
  {
    crop: "maize",
    cropDisplayName: "Maize / Hybrid Corn (DKC-9108)",
    scientificName: "Zea mays L.",
    growingSeason: "Kharif",
    category: "Cereal Grain",
    idealN: 120,
    idealP: 60,
    idealK: 50,
    minPh: 5.8,
    maxPh: 7.5,
    minTemp: 18,
    maxTemp: 34,
    minHumidity: 55,
    maxHumidity: 85,
    minRainfall: 70,
    maxRainfall: 200,
    waterReqMm: 550,
    durationDays: "95 - 110 days",
    baseYieldTons: 7.0,
    marketPrice: 2225,
    cultivationCostPerHa: 34000,
    riskLevel: "Low",
    suitableSoils: ["Loamy", "Alluvial", "Red", "Black (Regur)"],
    aiInsight: "High photosynthetic efficiency with strong industrial silage and poultry feed demand. Rapid vegetative turnover.",
    organicRemedy: "Intercropping with Cowpea or Moong to suppress weeds and naturally enrich soil nitrogen pool.",
    chemicalSchedule: "Basal: 45kg DAP + 25kg MOP + 10kg Zinc. Split Urea into 3 applications at knee-high and tasseling stages.",
  },
  {
    crop: "cotton",
    cropDisplayName: "Bt Cotton (RCH-659 Hybrid)",
    scientificName: "Gossypium hirsutum L.",
    growingSeason: "Kharif",
    category: "Commercial Fiber",
    idealN: 150,
    idealP: 60,
    idealK: 60,
    minPh: 6.5,
    maxPh: 8.2,
    minTemp: 21,
    maxTemp: 37,
    minHumidity: 50,
    maxHumidity: 80,
    minRainfall: 60,
    maxRainfall: 180,
    waterReqMm: 700,
    durationDays: "150 - 170 days",
    baseYieldTons: 2.8,
    marketPrice: 7120,
    cultivationCostPerHa: 52000,
    riskLevel: "Moderate",
    suitableSoils: ["Black (Regur)", "Alluvial", "Loamy"],
    aiInsight: "High commercial return on well-drained soils. Deep taproot system maximizes subsoil moisture extraction.",
    organicRemedy: "Install 10 Pheromone traps per hectare to monitor and mass-trap Pink Bollworm moths.",
    chemicalSchedule: "Basal: 50kg DAP + 40kg MOP. Top-dress Urea in 4 split doses coordinated with vegetative branching and boll bursting.",
  },
  {
    crop: "chickpea",
    cropDisplayName: "Chickpea / Gram (JG-14 / Pusa-362)",
    scientificName: "Cicer arietinum L.",
    growingSeason: "Rabi",
    category: "Pulse / Legume",
    idealN: 25,
    idealP: 50,
    idealK: 30,
    minPh: 6.0,
    maxPh: 7.8,
    minTemp: 10,
    maxTemp: 27,
    minHumidity: 35,
    maxHumidity: 65,
    minRainfall: 20,
    maxRainfall: 80,
    waterReqMm: 250,
    durationDays: "100 - 115 days",
    baseYieldTons: 2.1,
    marketPrice: 5440,
    cultivationCostPerHa: 24000,
    riskLevel: "Low",
    suitableSoils: ["Loamy", "Alluvial", "Sandy", "Black (Regur)"],
    aiInsight: "Fixes atmospheric nitrogen through symbiotic root nodules, drastically lowering future fertilizer costs for succeeding crops.",
    organicRemedy: "Seed bio-priming with Rhizobium culture + PSB (Phosphorus Solubilizing Bacteria) @ 25g/kg seed.",
    chemicalSchedule: "Basal: 40kg DAP + 15kg MOP. Zero top-dress urea required due to active biological nitrogen fixation.",
  },
  {
    crop: "soybean",
    cropDisplayName: "Soybean (JS-335 / JS-9560)",
    scientificName: "Glycine max L.",
    growingSeason: "Kharif",
    category: "Oilseed & Protein",
    idealN: 30,
    idealP: 60,
    idealK: 40,
    minPh: 6.0,
    maxPh: 7.5,
    minTemp: 20,
    maxTemp: 35,
    minHumidity: 60,
    maxHumidity: 85,
    minRainfall: 80,
    maxRainfall: 220,
    waterReqMm: 500,
    durationDays: "95 - 105 days",
    baseYieldTons: 2.6,
    marketPrice: 4600,
    cultivationCostPerHa: 28000,
    riskLevel: "Low",
    suitableSoils: ["Black (Regur)", "Alluvial", "Loamy"],
    aiInsight: "Excellent short-duration cash crop with high oil and protein value. Leaves substantial residual nitrogen in the soil.",
    organicRemedy: "Foliar spray of 5% Neem Seed Kernel Extract (NSKE) at early pod formation to prevent Spodoptera caterpillars.",
    chemicalSchedule: "Basal: 50kg Single Super Phosphate (SSP) + 20kg MOP. Single basal application is sufficient.",
  },
  {
    crop: "potato",
    cropDisplayName: "Potato (Kufri Pukhraj / Jyoti)",
    scientificName: "Solanum tuberosum L.",
    growingSeason: "Rabi",
    category: "Tuber / Vegetable",
    idealN: 150,
    idealP: 80,
    idealK: 120,
    minPh: 5.2,
    maxPh: 6.8,
    minTemp: 14,
    maxTemp: 25,
    minHumidity: 50,
    maxHumidity: 80,
    minRainfall: 40,
    maxRainfall: 120,
    waterReqMm: 400,
    durationDays: "85 - 100 days",
    baseYieldTons: 24.0,
    marketPrice: 1450,
    cultivationCostPerHa: 85000,
    riskLevel: "Moderate",
    suitableSoils: ["Sandy", "Loamy", "Alluvial"],
    aiInsight: "Extremely high gross revenue per hectare with rapid 90-day turnaround. Excellent fit for well-drained sandy loam ridges.",
    organicRemedy: "Tuber treatment with Trichoderma harzianum @ 5g/L water before planting to eliminate Black Scurf and Dry Rot.",
    chemicalSchedule: "Basal: 60kg DAP + 50kg MOP + 40kg Urea. Top-dress 45kg Urea at first earthing up (30 DAS).",
  },
  {
    crop: "sugarcane",
    cropDisplayName: "Sugarcane (Co-0238 Wonder Cane)",
    scientificName: "Saccharum officinarum L.",
    growingSeason: "Zaid",
    category: "Commercial Sugar",
    idealN: 180,
    idealP: 70,
    idealK: 80,
    minPh: 6.2,
    maxPh: 7.8,
    minTemp: 20,
    maxTemp: 38,
    minHumidity: 55,
    maxHumidity: 90,
    minRainfall: 100,
    maxRainfall: 300,
    waterReqMm: 1600,
    durationDays: "300 - 365 days",
    baseYieldTons: 85.0,
    marketPrice: 380, // ₹ per quintal (SAP / FRP)
    cultivationCostPerHa: 95000,
    riskLevel: "Low",
    suitableSoils: ["Alluvial", "Black (Regur)", "Loamy", "Clay"],
    aiInsight: "Assured factory gate purchase via sugar mill quotas with massive biomass tonnage per hectare.",
    organicRemedy: "Trash mulching between cane rows preserves 40% soil moisture and builds deep organic humus.",
    chemicalSchedule: "Basal: 75kg DAP + 50kg MOP. Top-dress 120kg Urea in 3 equal splits during tillering and monsoon growth.",
  },
  {
    crop: "moong",
    cropDisplayName: "Green Gram / Moong (IPM 205-7 Virat)",
    scientificName: "Vigna radiata L.",
    growingSeason: "Zaid",
    category: "Short-Duration Pulse",
    idealN: 20,
    idealP: 40,
    idealK: 25,
    minPh: 6.2,
    maxPh: 7.6,
    minTemp: 25,
    maxTemp: 40,
    minHumidity: 40,
    maxHumidity: 70,
    minRainfall: 10,
    maxRainfall: 60,
    waterReqMm: 200,
    durationDays: "55 - 65 days",
    baseYieldTons: 1.4,
    marketPrice: 8550,
    cultivationCostPerHa: 18000,
    riskLevel: "Low",
    suitableSoils: ["Loamy", "Alluvial", "Sandy", "Red"],
    aiInsight: "Ultra-fast 60-day summer crop that utilizes vacant land between Rabi harvest and Kharif transplanting, delivering pure bonus profits.",
    organicRemedy: "Spray Yellow Sticky traps to control Whitefly vectors that transmit Yellow Mosaic Virus.",
    chemicalSchedule: "Basal: 30kg DAP + 10kg MOP at sowing. Minimal input requirements.",
  },
];

export function runCropRecommendationEngine(input) {
  const {
    nitrogen = 90,
    phosphorus = 45,
    potassium = 45,
    ph = 6.8,
    temperature = 28,
    humidity = 65,
    rainfall = 100,
    soilType = "Loamy",
    season = "Rabi",
    landArea = 1,
    budget = 0,
  } = input || {};

  const nVal = Number(nitrogen) || 90;
  const pVal = Number(phosphorus) || 45;
  const kVal = Number(potassium) || 45;
  const phVal = Number(ph) || 6.8;
  const tempVal = Number(temperature) || 28;
  const humVal = Number(humidity) || 65;
  const rainVal = Number(rainfall) || 100;
  const areaVal = Math.max(0.1, Number(landArea) || 1);

  const evaluated = INDIAN_CROPS_DATABASE.map((crop) => {
    // 1. Soil Nutrient Suitability (NPK and pH match)
    const nDiff = Math.abs(crop.idealN - nVal) / (crop.idealN || 1);
    const pDiff = Math.abs(crop.idealP - pVal) / (crop.idealP || 1);
    const kDiff = Math.abs(crop.idealK - kVal) / (crop.idealK || 1);
    const npkError = (nDiff * 0.4 + pDiff * 0.35 + kDiff * 0.25);
    const npkScore = Math.max(20, Math.min(100, 100 - npkError * 48));

    let phScore = 95;
    if (phVal < crop.minPh) {
      phScore = Math.max(30, 95 - (crop.minPh - phVal) * 35);
    } else if (phVal > crop.maxPh) {
      phScore = Math.max(30, 95 - (phVal - crop.maxPh) * 35);
    }
    const soilSuitability = Math.round(npkScore * 0.7 + phScore * 0.3);

    // 2. Temperature & Thermal Window Compatibility
    let tempScore = 95;
    if (tempVal < crop.minTemp) {
      tempScore = Math.max(25, 95 - (crop.minTemp - tempVal) * 8);
    } else if (tempVal > crop.maxTemp) {
      tempScore = Math.max(25, 95 - (tempVal - crop.maxTemp) * 8);
    }
    const temperatureCompatibility = Math.round(tempScore);

    // 3. Humidity Compatibility
    let humScore = 92;
    if (humVal < crop.minHumidity) {
      humScore = Math.max(30, 92 - (crop.minHumidity - humVal) * 2.2);
    } else if (humVal > crop.maxHumidity) {
      humScore = Math.max(30, 92 - (humVal - crop.maxHumidity) * 2.2);
    }
    const humidityCompatibility = Math.round(humScore);

    // 4. Rainfall & Moisture Compatibility
    let rainScore = 92;
    if (rainVal < crop.minRainfall) {
      rainScore = Math.max(35, 92 - (crop.minRainfall - rainVal) * 0.45);
    } else if (rainVal > crop.maxRainfall) {
      rainScore = Math.max(35, 92 - (rainVal - crop.maxRainfall) * 0.35);
    }
    const rainfallCompatibility = Math.round(rainScore);

    // 5. Market Opportunity
    const marketOpportunity = Math.min(99, Math.max(70, Math.round(78 + (crop.marketPrice / 150))));

    // 6. Season Weight
    let seasonBonus = 0;
    if (!season || season === crop.growingSeason || crop.growingSeason === "Zaid" && (season === "Zaid" || season === "Kharif")) {
      seasonBonus = 12;
    } else {
      seasonBonus = -22;
    }

    // 7. Soil Type Match
    const soilMatch = crop.suitableSoils.some((s) => s.toLowerCase().includes((soilType || "").toLowerCase()))
      ? 8
      : -10;

    // Overall Suitability Score (0 - 100)
    let totalScore =
      soilSuitability * 0.35 +
      temperatureCompatibility * 0.20 +
      rainfallCompatibility * 0.20 +
      humidityCompatibility * 0.10 +
      marketOpportunity * 0.15 +
      seasonBonus +
      soilMatch;

    const suitabilityScore = Math.max(38, Math.min(98, Math.round(totalScore)));
    const modelConfidence = Math.min(99, Math.max(86, Math.round(suitabilityScore * 0.95 + 4)));

    // Yield and Economics calculation
    const yieldMultiplier = suitabilityScore / 100;
    const expectedYield = Math.round(crop.baseYieldTons * yieldMultiplier * 10) / 10;
    const grossRevenue = (expectedYield * 10) * crop.marketPrice; // 1 ton = 10 quintals
    const expectedProfit = Math.round(grossRevenue - crop.cultivationCostPerHa);

    return {
      crop: crop.crop,
      cropDisplayName: crop.cropDisplayName,
      scientificName: crop.scientificName,
      growingSeason: crop.growingSeason,
      category: crop.category,
      suitabilityScore,
      modelConfidence,
      expectedProfit: Math.max(12000, expectedProfit),
      expectedYield,
      durationDays: crop.durationDays,
      marketPrice: crop.marketPrice,
      cultivationCost: crop.cultivationCostPerHa,
      riskLevel: crop.riskLevel,
      aiInsight: crop.aiInsight,
      soilSuitability: Math.min(99, Math.max(45, soilSuitability)),
      rainfallCompatibility: Math.min(99, Math.max(45, rainfallCompatibility)),
      temperatureCompatibility: Math.min(99, Math.max(45, temperatureCompatibility)),
      humidityCompatibility: Math.min(99, Math.max(45, humidityCompatibility)),
      marketOpportunity: Math.min(99, Math.max(65, marketOpportunity)),
      organicRemedy: crop.organicRemedy,
      chemicalSchedule: crop.chemicalSchedule,
    };
  });

  return evaluated.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
