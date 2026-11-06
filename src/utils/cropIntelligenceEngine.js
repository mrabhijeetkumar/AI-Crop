// Precision Agro-Economic & Suitability Evaluation Engine

export function calculatePrecisionCropSuitability(
  crop,
  soilParams,
  climateParams
) {
  const {
    soilN = 100,
    soilP = 50,
    soilK = 45,
    soilPH = 6.8,
    soilType = "alluvial",
    organicCarbon = 0.65,
    ec = 0.5,
    waterAvailability = "Moderate (Borewell/Sprinkler)",
    season = "Rabi",
    temperature = 25,
    rainfall = 100,
  } = { ...soilParams, ...climateParams };

  let score = 70;
  const strengths = [];
  const advisories = [];

  // ==========================================
  // 1. SOIL CHEMISTRY & NPK MATCH (Weight: 30%)
  // ==========================================
  let soilChemScore = 75;

  // Soil Type Match
  if (crop.idealSoilTypes.includes(soilType)) {
    soilChemScore += 15;
    strengths.push(`Ideal soil texture match (${soilType.replace("_", " ")}).`);
  } else {
    soilChemScore -= 18;
    advisories.push(`Sub-optimal soil texture; requires organic matter conditioning.`);
  }

  // pH Match
  if (soilPH >= crop.optimalPHMin && soilPH <= crop.optimalPHMax) {
    soilChemScore += 10;
    strengths.push(`Optimal pH ${soilPH} ensures maximum nutrient bio-availability.`);
  } else {
    const phDeviation = Math.min(
      Math.abs(soilPH - crop.optimalPHMin),
      Math.abs(soilPH - crop.optimalPHMax)
    );
    soilChemScore -= Math.round(phDeviation * 14);
    if (soilPH < crop.optimalPHMin) {
      advisories.push(`Acidic soil (pH ${soilPH}); apply Agricultural Lime (CaCO3) @ 200 kg/acre.`);
    } else {
      advisories.push(`Alkaline soil (pH ${soilPH}); apply Agricultural Gypsum (CaSO4) @ 250 kg/acre.`);
    }
  }

  // NPK Uptake Proximity
  const nDeficit = Math.max(0, crop.optimalN - soilN);
  const pDeficit = Math.max(0, crop.optimalP - soilP);
  const kDeficit = Math.max(0, crop.optimalK - soilK);

  if (nDeficit < 25 && pDeficit < 15 && kDeficit < 15) {
    soilChemScore += 8;
    strengths.push(`Native soil NPK levels align closely with crop uptake demand.`);
  } else if (nDeficit > 60 || pDeficit > 35) {
    soilChemScore -= 8;
    advisories.push(`High soil NPK deficit; supplementary basal fertilization required.`);
  }

  // Organic Carbon (SOC)
  if (organicCarbon >= (crop.optimalSOC || 0.6)) {
    soilChemScore += 5;
  } else {
    soilChemScore -= 5;
    advisories.push(`Low Organic Carbon (${organicCarbon}%); incorporate 3 tonnes FYM compost/acre.`);
  }

  soilChemScore = Math.max(20, Math.min(99, soilChemScore));

  // ==========================================
  // 2. HYDROLOGICAL & IRRIGATION MATCH (Weight: 25%)
  // ==========================================
  let hydroScore = 75;

  if (waterAvailability.includes("Low") || waterAvailability.includes("Rainfed")) {
    if (crop.waterRequirementMm <= 350) {
      hydroScore += 22;
      strengths.push(`High drought resilience (${crop.waterRequirementMm}mm water requirement).`);
    } else if (crop.waterRequirementMm <= 550) {
      hydroScore -= 5;
      advisories.push(`Moderate water requirement; supplementary rainfed deficit irrigation needed.`);
    } else {
      hydroScore -= 38;
      advisories.push(`Severe water deficit risk (${crop.waterRequirementMm}mm needed vs low rainfed capacity).`);
    }
  } else if (waterAvailability.includes("High") || waterAvailability.includes("Drip")) {
    if (crop.waterRequirementMm >= 500) {
      hydroScore += 18;
      strengths.push(`Canal/drip capacity supports peak biomass transpiration (${crop.waterRequirementMm}mm).`);
    } else {
      hydroScore += 10;
      strengths.push(`Adequate water buffer guarantees high yield stability.`);
    }
  } else {
    // Moderate
    if (crop.waterRequirementMm > 1000) {
      hydroScore -= 18;
      advisories.push(`High water crop (${crop.waterRequirementMm}mm) may strain moderate borewell supply.`);
    } else {
      hydroScore += 12;
    }
  }

  hydroScore = Math.max(15, Math.min(99, hydroScore));

  // ==========================================
  // 3. CLIMATIC & SEASONAL MATCH (Weight: 25%)
  // ==========================================
  let climateScore = 70;

  if (season === "All" || crop.season === season || crop.season === "All Seasons" || crop.season === "Perennial") {
    climateScore += 25;
    strengths.push(`Accurate sowing window alignment for ${crop.season} agro-climatic cycle.`);
  } else {
    climateScore -= 45;
    advisories.push(`Off-season crop; physiological risk if sown during ${season}.`);
  }

  // Temperature sanity
  if (crop.season === "Rabi" && temperature > 34) {
    climateScore -= 15;
    advisories.push(`High temperature (${temperature}°C) poses thermal shock risk to young winter seedlings.`);
  } else if (crop.season === "Kharif" && temperature < 18) {
    climateScore -= 15;
    advisories.push(`Cool temperatures (${temperature}°C) retard Kharif germination rates.`);
  }

  climateScore = Math.max(10, Math.min(99, climateScore));

  // ==========================================
  // 4. ECONOMIC POTENTIAL & MSP (Weight: 20%)
  // ==========================================
  let econScore = 75;
  if (crop.mspPerQtl > 0) {
    econScore += 12;
    strengths.push(`Price protection backed by Government MSP (₹${crop.mspPerQtl}/Qtl).`);
  }
  if (crop.marketDemandTrend?.includes("Bullish")) {
    econScore += 10;
    strengths.push(`Bullish market demand trend with strong industrial/export off-take.`);
  }
  econScore = Math.max(30, Math.min(99, econScore));

  // ==========================================
  // WEIGHTED OVERALL SUITABILITY INDEX
  // ==========================================
  const overallScore = Math.round(
    soilChemScore * 0.30 +
    hydroScore * 0.25 +
    climateScore * 0.25 +
    econScore * 0.20
  );

  // Yield & Financial Estimations
  const suitabilityRatio = Math.max(0.35, overallScore / 100);
  const projectedYield = Math.round(crop.averageYieldQtlPerAcre * (0.65 + suitabilityRatio * 0.45) * 10) / 10;
  const grossRevenue = Math.round(projectedYield * crop.typicalPricePerQtl);
  const inputCost = crop.estInputCostPerAcre || 14000;
  const netProfit = grossRevenue - inputCost;
  const roiPercent = Math.round((netProfit / inputCost) * 100);
  const benefitCostRatio = Math.round((grossRevenue / inputCost) * 100) / 100;

  // Specific Fertilizer Recommendation
  const fertPlan = calculateItemizedFertilizerPlan(crop, soilN, soilP, soilK);

  // Risk Classification
  let riskLevel = "Low";
  let riskColor = "emerald";
  if (overallScore < 50 || (climateScore < 40)) {
    riskLevel = "Critical";
    riskColor = "rose";
  } else if (overallScore < 70 || hydroScore < 50) {
    riskLevel = "Moderate";
    riskColor = "amber";
  }

  return {
    crop,
    overallScore,
    soilChemScore,
    hydroScore,
    climateScore,
    econScore,
    projectedYield,
    grossRevenue,
    inputCost,
    netProfit,
    roiPercent,
    benefitCostRatio,
    riskLevel,
    riskColor,
    strengths: strengths.slice(0, 3),
    advisories: advisories.slice(0, 3),
    fertilizerPlan: fertPlan,
  };
}

export function calculateItemizedFertilizerPlan(crop, soilN, soilP, soilK) {
  // Conversions per Acre (1 ha = 2.471 acres)
  const nDeficitPerAcre = Math.max(0, (crop.optimalN - soilN) / 2.471);
  const pDeficitPerAcre = Math.max(0, (crop.optimalP - soilP) / 2.471);
  const kDeficitPerAcre = Math.max(0, (crop.optimalK - soilK) / 2.471);

  // DAP has 46% P2O5 and 18% N
  const dapKg = Math.round((pDeficitPerAcre / 0.46) + 25);
  const nSuppliedByDap = dapKg * 0.18;
  const remainingN = Math.max(0, nDeficitPerAcre - nSuppliedByDap) + 20;

  // Urea has 46% N
  const ureaKg = Math.round(remainingN / 0.46);

  // MOP has 60% K2O
  const mopKg = Math.round((kDeficitPerAcre / 0.60) + 15);

  const zincKg = 10;
  const sulphurKg = crop.category === "Oilseed" ? 15 : 8;

  const dapBags = Math.ceil(dapKg / 50);
  const ureaBags = Math.ceil(ureaKg / 45);
  const mopBags = Math.ceil(mopKg / 50);

  const estimatedCost =
    dapBags * 1350 +
    ureaBags * 267 +
    mopBags * 1700 +
    zincKg * 75 +
    sulphurKg * 60;

  return {
    dapKg,
    dapBags,
    ureaKg,
    ureaBags,
    mopKg,
    mopBags,
    zincKg,
    sulphurKg,
    estimatedCost,
  };
}

export const CROP_ROTATION_PRESETS = [
  {
    id: "punjab_gangetic_classic",
    name: "North-West Intensive Green Matrix",
    region: "Punjab, Haryana, Western UP",
    targetSoil: "Alluvial Loam",
    seasons: {
      kharif: {
        cropId: "paddy",
        cropName: "Paddy (Rice / Basmati)",
        duration: "125 Days",
        profitEst: 42000,
        nitrogenContribution: -25,
        role: "Staple Grain Cash Base",
      },
      rabi: {
        cropId: "wheat",
        cropName: "Wheat (DBW-187 / HD-2967)",
        duration: "135 Days",
        profitEst: 36700,
        nitrogenContribution: -20,
        role: "MSP Assured Winter Staple",
      },
      zaid: {
        cropId: "chickpea",
        cropName: "Moong / Green Gram (Catch Crop)",
        duration: "65 Days",
        profitEst: 22500,
        nitrogenContribution: +35,
        role: "Biological Nitrogen Fixer & Carbon Restorer",
      },
    },
    totalAnnualProfit: 101200,
    soilHealthScore: 92,
    nitrogenBalanceKgPerAcre: -10,
    pestCycleBreakEffect: "94% - Green gram summer plowing breaks nematode and stem borer dormancy.",
    description: "The premier sustainable high-intensity rotation: Moong incorporated in summer restores 35 kg N and enriches organic carbon for high-yield Kharif Rice.",
  },
  {
    id: "deccan_cotton_soy_matrix",
    name: "Deccan Cotton-Soybean-Mustard System",
    region: "Maharashtra, MP, Central Gujarat",
    targetSoil: "Black Cotton (Regur)",
    seasons: {
      kharif: {
        cropId: "cotton",
        cropName: "Bt Cotton (BG-II)",
        duration: "165 Days",
        profitEst: 58800,
        nitrogenContribution: -30,
        role: "High Value Fiber Cash Crop",
      },
      rabi: {
        cropId: "chickpea",
        cropName: "Chickpea / Desi Chana",
        duration: "110 Days",
        profitEst: 40300,
        nitrogenContribution: +28,
        role: "Drought-Resilient Nitrogen Fixer",
      },
      zaid: {
        cropId: "pearl_millet",
        cropName: "Summer Pearl Millet (Bajra Fodder)",
        duration: "70 Days",
        profitEst: 18500,
        nitrogenContribution: -5,
        role: "Livestock Fodder & Erosion Control",
      },
    },
    totalAnnualProfit: 117600,
    soilHealthScore: 88,
    nitrogenBalanceKgPerAcre: -7,
    pestCycleBreakEffect: "90% - Deep rooting cotton alternated with chickpea eliminates root rot build-up.",
    description: "Ideal for deep black clays; Chickpea replenishes soil reserves exhausted by Cotton while producing high MSP returns.",
  },
  {
    id: "arid_oilseed_millet_system",
    name: "Western Low-Water Oilseed Resilience Matrix",
    region: "Rajasthan, North Gujarat, South Haryana",
    targetSoil: "Sandy Loam / Light Alluvial",
    seasons: {
      kharif: {
        cropId: "pearl_millet",
        cropName: "Pearl Millet / Bajra",
        duration: "85 Days",
        profitEst: 26500,
        nitrogenContribution: -15,
        role: "Extreme Heat & Drought Resilient Grain",
      },
      rabi: {
        cropId: "mustard",
        cropName: "Mustard / Sarson (RH-749)",
        duration: "115 Days",
        profitEst: 45500,
        nitrogenContribution: -12,
        role: "High Oil % Cash Champion",
      },
      zaid: {
        cropId: "chickpea",
        cropName: "Cluster Bean / Guar (Summer)",
        duration: "80 Days",
        profitEst: 21000,
        nitrogenContribution: +30,
        role: "Industrial Gum Cash & Legume Enrichment",
      },
    },
    totalAnnualProfit: 93000,
    soilHealthScore: 95,
    nitrogenBalanceKgPerAcre: +3,
    pestCycleBreakEffect: "96% - Mustard glucosinolate bio-fumigants sterilize soil-borne pathogens.",
    description: "Consumes only 550mm total annual water across 3 crops, making it completely resilient to groundwater depletion.",
  },
  {
    id: "horticulture_potato_maize_system",
    name: "High-Frequency Precision Agri-Business System",
    region: "Punjab, Western UP, Karnataka, Bihar",
    targetSoil: "Sandy Loam & Alluvial",
    seasons: {
      kharif: {
        cropId: "maize",
        cropName: "Hybrid Maize (DKC-9108)",
        duration: "100 Days",
        profitEst: 45900,
        nitrogenContribution: -25,
        role: "High Tonnage Feed & Starch Cash",
      },
      rabi: {
        cropId: "potato",
        cropName: "Potato (Kufri Pukhraj / Chipsona)",
        duration: "95 Days",
        profitEst: 99700,
        nitrogenContribution: -35,
        role: "Maximum Gross Revenue Yield Engine",
      },
      zaid: {
        cropId: "tomato",
        cropName: "Spring Tomato / Summer Moong",
        duration: "75 Days",
        profitEst: 54000,
        nitrogenContribution: +15,
        role: "High Daily Cashflow & Nitrogen Top-up",
      },
    },
    totalAnnualProfit: 199600,
    soilHealthScore: 84,
    nitrogenBalanceKgPerAcre: -45,
    pestCycleBreakEffect: "82% - Requires heavy organic manure top-dressing between potato and spring crop.",
    description: "Highest gross turnover potential (>₹1.9 Lakh/acre); tailored for progressive farmers with assured irrigation and cold storage access.",
  },
];
