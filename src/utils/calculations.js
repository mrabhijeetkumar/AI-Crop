import { SOIL_TYPES } from "../data/soilTypes.js";

export function calculateFertilizerDose(
  areaAcres,
  soilN,
  soilP,
  soilK,
  targetCrop
) {
  const targetN = targetCrop.optimalN;
  const targetP = targetCrop.optimalP;
  const targetK = targetCrop.optimalK;

  // Deficit in kg/ha
  const nDeficit = Math.max(0, targetN - soilN);
  const pDeficit = Math.max(0, targetP - soilP);
  const kDeficit = Math.max(0, targetK - soilK);

  // Conversion: 1 hectare = 2.471 acres, so per acre = per ha / 2.471
  const dapPerAcre = ((pDeficit / 0.46) / 2.471) + 20;
  const nFromDap = dapPerAcre * 0.18;
  const remainingNPerAcre = Math.max(0, (nDeficit / 2.471) - nFromDap) + 25;
  const ureaPerAcre = remainingNPerAcre / 0.46;
  const mopPerAcre = ((kDeficit / 0.60) / 2.471) + 15;
  const zincPerAcre = 5; // standard micro booster

  const totalDap = Math.round(dapPerAcre * areaAcres);
  const totalUrea = Math.round(ureaPerAcre * areaAcres);
  const totalMop = Math.round(mopPerAcre * areaAcres);
  const totalZinc = Math.round(zincPerAcre * areaAcres);

  // Bag units (DAP = 50kg bag, Urea = 45kg bag, MOP = 50kg bag)
  const dapBags = Math.ceil(totalDap / 50);
  const ureaBags = Math.ceil(totalUrea / 45);
  const mopBags = Math.ceil(totalMop / 50);

  // Approx cost: DAP ₹1350/bag, Urea ₹267/bag, MOP ₹1700/bag, Zinc ₹75/kg
  const estCost = (dapBags * 1350) + (ureaBags * 267) + (mopBags * 1700) + (totalZinc * 75);

  return {
    totalDapKg: totalDap,
    totalUreaKg: totalUrea,
    totalMopKg: totalMop,
    totalZincKg: totalZinc,
    dapBags,
    ureaBags,
    mopBags,
    estCost,
  };
}

export function evaluateCropRecommendations(
  crops,
  soilN,
  soilP,
  soilK,
  soilPH,
  soilTypeId,
  waterAvailability,
  selectedSeason
) {
  const scoredCrops = crops.map((crop) => {
    let score = 70;
    const reasons = [];

    // 1. Season match
    if (selectedSeason === "All" || crop.season === selectedSeason || crop.season === "All Seasons") {
      score += 15;
      reasons.push(`Perfect match for ${crop.season} season climate cycle.`);
    } else {
      score -= 30;
      reasons.push(`Off-season crop (typically grown in ${crop.season}).`);
    }

    // 2. Soil Type match
    if (crop.idealSoilTypes.includes(soilTypeId)) {
      score += 12;
      const st = SOIL_TYPES.find((s) => s.id === soilTypeId);
      reasons.push(`High compatibility with ${st?.name || "selected soil"} structure.`);
    } else {
      score -= 8;
      reasons.push(`Requires special soil conditioning for non-ideal soil texture.`);
    }

    // 3. pH suitability
    if (soilPH >= crop.optimalPHMin && soilPH <= crop.optimalPHMax) {
      score += 8;
      reasons.push(`Soil pH (${soilPH}) is within optimal tolerance (${crop.optimalPHMin}-${crop.optimalPHMax}).`);
    } else {
      const phDiff = Math.min(Math.abs(soilPH - crop.optimalPHMin), Math.abs(soilPH - crop.optimalPHMax));
      score -= Math.round(phDiff * 8);
      reasons.push(`pH deviation (${soilPH}) may slightly affect nutrient uptake.`);
    }

    // 4. Water match
    let waterSuitability = "Optimal";
    if (waterAvailability === "Low (Rainfed)") {
      if (crop.waterRequirementMm <= 350) {
        score += 10;
        waterSuitability = "Optimal";
        reasons.push(`Drought-tolerant crop with modest water demand (${crop.waterRequirementMm}mm).`);
      } else if (crop.waterRequirementMm <= 600) {
        score -= 5;
        waterSuitability = "Adequate";
      } else {
        score -= 25;
        waterSuitability = "Deficit";
        reasons.push(`High water requirement (${crop.waterRequirementMm}mm) risky under low water availability.`);
      }
    } else if (waterAvailability === "High (Canal/Drip)") {
      score += 8;
      waterSuitability = "Optimal";
      reasons.push(`Full irrigation support available for peak biomass yield.`);
    } else {
      waterSuitability = "Optimal";
    }

    // 5. NPK Proximity bonus
    const nDiff = Math.abs(crop.optimalN - soilN);
    const pDiff = Math.abs(crop.optimalP - soilP);
    const kDiff = Math.abs(crop.optimalK - soilK);
    const npkTotalDiff = (nDiff + pDiff + kDiff) / 3;
    if (npkTotalDiff < 30) {
      score += 8;
      reasons.push("Existing soil nutrient levels match target uptake curves.");
    }

    const finalScore = Math.max(15, Math.min(99, Math.round(score)));

    // Financial estimations
    const yieldEst = crop.averageYieldQtlPerAcre * (finalScore / 100);
    const grossRevenue = yieldEst * crop.typicalPricePerQtl;
    const approxInputCost = crop.averageYieldQtlPerAcre * 650 + 4000;
    const netProfit = grossRevenue - approxInputCost;

    const fert = calculateFertilizerDose(1, soilN, soilP, soilK, crop);

    let riskFactor = "Low";
    if (finalScore < 60 || waterSuitability === "Deficit") riskFactor = "High";
    else if (finalScore < 80) riskFactor = "Moderate";

    return {
      crop,
      suitabilityScore: finalScore,
      rank: 0,
      expectedYieldQtlPerAcre: Math.round(yieldEst * 10) / 10,
      estimatedGrossRevenuePerAcre: Math.round(grossRevenue),
      estimatedNetProfitPerAcre: Math.round(netProfit),
      waterSuitability,
      soilMatchScore: Math.min(98, Math.max(50, finalScore + 4)),
      climateMatchScore: Math.min(99, Math.max(45, finalScore - 2)),
      riskFactor,
      reasoning: reasons,
      fertilizerNeeds: {
        dapKg: fert.totalDapKg,
        ureaKg: fert.totalUreaKg,
        mopKg: fert.totalMopKg,
        zincKg: fert.totalZincKg,
      },
    };
  });

  return scoredCrops
    .sort((a, b) => b.suitabilityScore - a.suitabilityScore)
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
}

export function computeProfitRiskSimulation(input) {
  const areaAcres = Math.max(0.1, Number(input.areaAcres) || 1);
  const expectedYieldQtlPerAcre = Math.max(0.1, Number(input.expectedYieldQtlPerAcre) || 1);
  const sellingPricePerQtl = Math.max(1, Number(input.sellingPricePerQtl) || 1);

  const totalYield = expectedYieldQtlPerAcre * areaAcres;
  const grossRevenue = totalYield * sellingPricePerQtl;

  const seedCost = (Number(input.seedCostPerAcre) || 0) * areaAcres;
  const fertCost = (Number(input.fertilizerCostPerAcre) || 0) * areaAcres;
  const pestCost = (Number(input.pesticideCostPerAcre) || 0) * areaAcres;
  const laborCost = (Number(input.laborCostPerAcre) || 0) * areaAcres;
  const irrCost = (Number(input.irrigationCostPerAcre) || 0) * areaAcres;
  const machCost = (Number(input.machineryRentalPerAcre) || 0) * areaAcres;
  const transCost = (Number(input.postHarvestTransportPerAcre) || 0) * areaAcres;
  const overheadCost = (Number(input.overheadCostPerAcre) || 0) * areaAcres;

  // Variable costs (depend on area & yield operations)
  const variableCost = seedCost + fertCost + pestCost + laborCost + irrCost + machCost + transCost;
  // Fixed/overhead costs (land lease, management, interest)
  const fixedCost = overheadCost;

  const totalCost = variableCost + fixedCost;
  const netProfit = grossRevenue - totalCost;
  const profitPerAcre = netProfit / areaAcres;
  const costPerAcre = totalCost / areaAcres;
  const grossRevenuePerAcre = grossRevenue / areaAcres;
  const roiPercentage = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const benefitCostRatio = totalCost > 0 ? (grossRevenue / totalCost) : 0;

  // Cost of Production (COP) per Quintal
  const costOfProductionPerQtl = totalYield > 0 ? totalCost / totalYield : 0;
  const profitMarginPerQtl = sellingPricePerQtl - costOfProductionPerQtl;
  const netMarginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

  // Break-even metrics
  const breakEvenYield = sellingPricePerQtl > 0 ? costPerAcre / sellingPricePerQtl : 0;
  const breakEvenPrice = expectedYieldQtlPerAcre > 0 ? costPerAcre / expectedYieldQtlPerAcre : 0;
  const marginOfSafetyPercent = expectedYieldQtlPerAcre > breakEvenYield 
    ? ((expectedYieldQtlPerAcre - breakEvenYield) / expectedYieldQtlPerAcre) * 100 
    : 0;

  // 4-Pillar Risk Engine
  const climateRiskFactor = Number(input.climateRiskFactor) || 8;
  const pestRiskFactor = Number(input.pestRiskFactor) || 12;
  const marketRiskFactor = Number(input.marketRiskFactor) || 15;
  const inputInflationFactor = Number(input.inputInflationFactor) || 10;

  // Climate score (0-25)
  let climateScore = Math.min(25, Math.round(climateRiskFactor * 1.2));
  // Market score (0-25) - higher if price is volatile or close to break-even
  let marketScore = Math.min(25, Math.round(marketRiskFactor * 0.8 + (marginOfSafetyPercent < 20 ? 10 : marginOfSafetyPercent < 40 ? 5 : 0)));
  // Pest score (0-25)
  let pestScore = Math.min(25, Math.round(pestRiskFactor * 0.9));
  // Financial resilience score (0-25) - higher risk if low ROI / low margin
  let financialRiskScore = 5;
  if (roiPercentage < 20) financialRiskScore = 25;
  else if (roiPercentage < 40) financialRiskScore = 18;
  else if (roiPercentage < 70) financialRiskScore = 10;

  const totalRiskScore = Math.min(99, Math.max(5, climateScore + marketScore + pestScore + financialRiskScore));

  let overallRisk = "Low";
  if (totalRiskScore >= 65) overallRisk = "High";
  else if (totalRiskScore >= 38) overallRisk = "Moderate";

  // PMFBY Crop Insurance Estimator (Pradhan Mantri Fasal Bima Yojana)
  // Kharif crops premium = 2% of sum insured, Rabi crops = 1.5%, Commercial/Horticulture = 5%
  const season = input.season || "Rabi";
  let premiumRatePercent = season === "Kharif" ? 2.0 : season === "Commercial" || season === "Horticulture" ? 5.0 : 1.5;
  const sumInsuredPerAcre = Math.round(expectedYieldQtlPerAcre * sellingPricePerQtl * 0.9);
  const totalSumInsured = sumInsuredPerAcre * areaAcres;
  const farmerPremiumPayable = Math.round(totalSumInsured * (premiumRatePercent / 100));
  const govtSubsidyEstimate = Math.round(totalSumInsured * 0.08); // Govt pays 80-85% actuarial premium

  const mitigationStrategies = [
    `Enroll in PMFBY Crop Insurance before cut-off date to protect ₹${totalSumInsured.toLocaleString("en-IN")} aggregate farm capital at a subsidised premium of only ₹${farmerPremiumPayable.toLocaleString("en-IN")}.`,
    `Split nitrogen/NPK applications into 3 calibrated basal & top-dressing stages to curb ₹${Math.round(fertCost * 0.15).toLocaleString("en-IN")} in leaching and volatilization waste.`,
    `Adopt solar-powered micro-drip or sprinkler irrigation to slash seasonal energy and irrigation expenses by up to 35%.`,
    `Use e-NAM / local Mandi price trend trackers to lock in sales when open auction rates climb 6-12% above current baseline.`,
    `Diversify 20-30% of acreage with an intercrop pulse (e.g. Chickpea or Moong) to hedge against monsoonal or market downturns.`,
  ];

  return {
    totalArea: areaAcres,
    totalExpectedYieldQtl: Math.round(totalYield * 10) / 10,
    grossRevenue: Math.round(grossRevenue),
    grossRevenuePerAcre: Math.round(grossRevenuePerAcre),
    totalCost: Math.round(totalCost),
    costPerAcre: Math.round(costPerAcre),
    costOfProductionPerQtl: Math.round(costOfProductionPerQtl * 10) / 10,
    profitMarginPerQtl: Math.round(profitMarginPerQtl * 10) / 10,
    netMarginPercent: Math.round(netMarginPercent * 10) / 10,
    costBreakdown: {
      seeds: Math.round(seedCost),
      fertilizers: Math.round(fertCost),
      pesticides: Math.round(pestCost),
      labor: Math.round(laborCost),
      irrigation: Math.round(irrCost),
      machinery: Math.round(machCost),
      transport: Math.round(transCost),
      overhead: Math.round(overheadCost),
    },
    fixedCost: Math.round(fixedCost),
    variableCost: Math.round(variableCost),
    netProfit: Math.round(netProfit),
    profitPerAcre: Math.round(profitPerAcre),
    roiPercentage: Math.round(roiPercentage * 10) / 10,
    benefitCostRatio: Math.round(benefitCostRatio * 100) / 100,
    breakEvenYieldQtlPerAcre: Math.round(breakEvenYield * 10) / 10,
    breakEvenPricePerQtl: Math.round(breakEvenPrice),
    marginOfSafetyPercent: Math.round(marginOfSafetyPercent * 10) / 10,
    insurance: {
      sumInsuredPerAcre,
      totalSumInsured,
      farmerPremiumPayable,
      premiumRatePercent,
      govtSubsidyEstimate,
    },
    riskAssessment: {
      overallRisk,
      riskScore: totalRiskScore,
      pillars: {
        climateRisk: { score: climateScore, max: 25, label: climateScore > 16 ? "Elevated" : climateScore > 9 ? "Moderate" : "Low" },
        marketRisk: { score: marketScore, max: 25, label: marketScore > 16 ? "Elevated" : marketScore > 9 ? "Moderate" : "Stable" },
        pestRisk: { score: pestScore, max: 25, label: pestScore > 16 ? "Elevated" : pestScore > 9 ? "Moderate" : "Low" },
        financialResilience: { score: 25 - financialRiskScore, max: 25, label: financialRiskScore > 16 ? "Vulnerable" : financialRiskScore > 9 ? "Fair" : "Robust" },
      },
      monsoonSensitivity: climateRiskFactor > 12 ? "Moderate to High" : "Low",
      pestSensitivity: pestRiskFactor > 14 ? "Elevated (Requires preventative bio-sprays)" : "Medium",
      marketPriceVolatility: marketRiskFactor > 15 ? "High (Subject to harvesting season gluts)" : "Moderate",
      mitigationStrategies,
    },
  };
}

export function computeSensitivityMatrix(input) {
  const yieldDeltas = [-0.20, -0.10, 0, 0.10, 0.20]; // -20%, -10%, Base, +10%, +20%
  const priceDeltas = [-0.20, -0.10, 0, 0.10, 0.20];

  const baseYield = Math.max(0.1, Number(input.expectedYieldQtlPerAcre) || 1);
  const basePrice = Math.max(1, Number(input.sellingPricePerQtl) || 1);
  const area = Math.max(0.1, Number(input.areaAcres) || 1);

  // Compute fixed vs yield-dependent cost
  const seed = (Number(input.seedCostPerAcre) || 0);
  const fert = (Number(input.fertilizerCostPerAcre) || 0);
  const pest = (Number(input.pesticideCostPerAcre) || 0);
  const labor = (Number(input.laborCostPerAcre) || 0);
  const irr = (Number(input.irrigationCostPerAcre) || 0);
  const mach = (Number(input.machineryRentalPerAcre) || 0);
  const trans = (Number(input.postHarvestTransportPerAcre) || 0);
  const overhead = (Number(input.overheadCostPerAcre) || 0);

  const baseCostPerAcre = seed + fert + pest + labor + irr + mach + trans + overhead;

  const matrix = priceDeltas.map((pDelta) => {
    const scenarioPrice = Math.round(basePrice * (1 + pDelta));
    const priceLabel = `${pDelta > 0 ? "+" : ""}${Math.round(pDelta * 100)}% (₹${scenarioPrice.toLocaleString("en-IN")})`;

    const rowCells = yieldDeltas.map((yDelta) => {
      const scenarioYield = Number((baseYield * (1 + yDelta)).toFixed(1));
      // Transport & harvesting labor slight variance with yield
      const adjustedCostPerAcre = baseCostPerAcre + (trans * yDelta * 0.5);
      const grossRevenuePerAcre = scenarioYield * scenarioPrice;
      const netProfitPerAcre = Math.round(grossRevenuePerAcre - adjustedCostPerAcre);
      const totalNetProfit = Math.round(netProfitPerAcre * area);
      const roi = adjustedCostPerAcre > 0 ? Math.round((netProfitPerAcre / adjustedCostPerAcre) * 100) : 0;

      let status = "profit_high";
      if (netProfitPerAcre < 0) status = "loss";
      else if (netProfitPerAcre < 15000) status = "profit_low";
      else if (netProfitPerAcre < 35000) status = "profit_medium";

      return {
        yieldDelta: yDelta,
        yieldValue: scenarioYield,
        priceDelta: pDelta,
        priceValue: scenarioPrice,
        netProfitPerAcre,
        totalNetProfit,
        roi,
        status,
        isBase: pDelta === 0 && yDelta === 0,
      };
    });

    return {
      priceDelta: pDelta,
      priceValue: scenarioPrice,
      priceLabel,
      cells: rowCells,
    };
  });

  return {
    yieldDeltas: yieldDeltas.map((y) => ({
      delta: y,
      label: `${y > 0 ? "+" : ""}${Math.round(y * 100)}% (${(baseYield * (1 + y)).toFixed(1)} Q/A)`,
    })),
    matrix,
  };
}

export function computeBreakEvenCurve(input) {
  const baseYield = Math.max(0.1, Number(input.expectedYieldQtlPerAcre) || 1);
  const price = Math.max(1, Number(input.sellingPricePerQtl) || 1);
  const area = Math.max(0.1, Number(input.areaAcres) || 1);

  const seed = (Number(input.seedCostPerAcre) || 0) * area;
  const fert = (Number(input.fertilizerCostPerAcre) || 0) * area;
  const pest = (Number(input.pesticideCostPerAcre) || 0) * area;
  const labor = (Number(input.laborCostPerAcre) || 0) * area;
  const irr = (Number(input.irrigationCostPerAcre) || 0) * area;
  const mach = (Number(input.machineryRentalPerAcre) || 0) * area;
  const trans = (Number(input.postHarvestTransportPerAcre) || 0) * area;
  const overhead = (Number(input.overheadCostPerAcre) || 0) * area;

  const fixedCost = overhead + seed + fert * 0.6;
  const baseTotalCost = seed + fert + pest + labor + irr + mach + trans + overhead;

  const points = [];
  const steps = 11; // 0% to 150%
  const maxMultiplier = 1.5;

  for (let i = 0; i <= steps; i++) {
    const pct = (i / steps) * maxMultiplier;
    const yieldPerAcre = Number((baseYield * pct).toFixed(1));
    const totalYield = yieldPerAcre * area;
    const revenue = Math.round(totalYield * price);
    
    // Variable cost scales slightly with harvest yield (transport, handling)
    const variablePortion = (baseTotalCost - fixedCost) * (0.7 + 0.3 * pct);
    const cost = Math.round(fixedCost + variablePortion);
    const profit = Math.round(revenue - cost);

    points.push({
      yieldPct: Math.round(pct * 100),
      yieldPerAcre,
      totalYield: Math.round(totalYield),
      revenue,
      cost,
      profit,
      isBase: Math.abs(pct - 1.0) < 0.05,
    });
  }

  return points;
}

export function compareCropsEconomics(crops, areaAcres = 10, currentSeason = "All") {
  return crops.map((crop) => {
    const yieldPerAcre = crop.averageYieldQtlPerAcre || 15;
    const pricePerQtl = crop.typicalPricePerQtl || 2200;
    const totalYield = yieldPerAcre * areaAcres;
    const grossRevenue = totalYield * pricePerQtl;

    // Approximate cost models by crop category
    let seedCost = 1600;
    let fertCost = 3500;
    let pestCost = 1200;
    let laborCost = 4200;
    let machCost = 3000;
    let irrCost = 1000;

    if (crop.category === "Vegetable") {
      seedCost = 3800;
      fertCost = 5500;
      pestCost = 3200;
      laborCost = 8500;
      machCost = 3500;
      irrCost = 2200;
    } else if (crop.category === "Cash Crop") {
      seedCost = 2800;
      fertCost = 4800;
      pestCost = 2600;
      laborCost = 6500;
      machCost = 3800;
      irrCost = 1800;
    } else if (crop.category === "Oilseed" || crop.category === "Pulse") {
      seedCost = 1400;
      fertCost = 2400;
      pestCost = 900;
      laborCost = 3400;
      machCost = 2600;
      irrCost = 800;
    }

    const costPerAcre = seedCost + fertCost + pestCost + laborCost + machCost + irrCost + 800;
    const totalCost = costPerAcre * areaAcres;
    const netProfit = grossRevenue - totalCost;
    const profitPerAcre = netProfit / areaAcres;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const breakEvenYield = pricePerQtl > 0 ? costPerAcre / pricePerQtl : 0;
    const waterProfitRatio = crop.waterRequirementMm > 0 ? (profitPerAcre / crop.waterRequirementMm) : 0;

    return {
      crop,
      grossRevenue: Math.round(grossRevenue),
      totalCost: Math.round(totalCost),
      costPerAcre: Math.round(costPerAcre),
      netProfit: Math.round(netProfit),
      profitPerAcre: Math.round(profitPerAcre),
      roi: Math.round(roi * 10) / 10,
      breakEvenYield: Math.round(breakEvenYield * 10) / 10,
      waterProfitRatio: Math.round(waterProfitRatio * 10) / 10,
      isRabi: crop.season === "Rabi",
      isKharif: crop.season === "Kharif",
    };
  }).sort((a, b) => b.profitPerAcre - a.profitPerAcre);
}

