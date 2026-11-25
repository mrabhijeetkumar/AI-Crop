import React, { useState } from "react";
import {
  Leaf,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  Droplets,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FlaskConical,
} from "lucide-react";

export function SoilRemediationPlanner({ soilPH, organicCarbon, soilType, calcAcres }) {
  const [selectedGreenCrop, setSelectedGreenCrop] = useState("dhaincha");

  // Dynamic green manure calculations
  const greenManureStats = {
    dhaincha: {
      name: "Dhaincha (Sesbania aculeata)",
      seedRateKgPerAcre: 20,
      biomassTonnesPerAcre: 9.5,
      nFixedKgPerAcre: 35,
      decompositionDays: "45 - 50 Days (incorporate at pre-flowering)",
      tolerance: "High waterlogging & sodicity tolerance (pH up to 9.0)",
    },
    sunnhemp: {
      name: "Sunnhemp (Crotalaria juncea)",
      seedRateKgPerAcre: 15,
      biomassTonnesPerAcre: 8.0,
      nFixedKgPerAcre: 32,
      decompositionDays: "40 - 45 Days (incorporate before fibrous stem)",
      tolerance: "Excellent for sandy loam & well-drained alluvial soil",
    },
    cowpea: {
      name: "Cowpea / Lobia (Vigna unguiculata)",
      seedRateKgPerAcre: 12,
      biomassTonnesPerAcre: 6.5,
      nFixedKgPerAcre: 28,
      decompositionDays: "50 - 55 Days",
      tolerance: "Dual purpose (green manure + tender vegetable pods)",
    },
  };

  const currentGreen = greenManureStats[selectedGreenCrop];
  const totalSeedsKg = Math.round(currentGreen.seedRateKgPerAcre * calcAcres);
  const totalBiomassTonnes = (currentGreen.biomassTonnesPerAcre * calcAcres).toFixed(1);
  const totalNFixedKg = Math.round(currentGreen.nFixedKgPerAcre * calcAcres);

  // pH Reclamation Calculation
  const isAlkaline = soilPH > 7.6;
  const isAcidic = soilPH < 6.2;
  const gypsumReclamationKg = isAlkaline ? Math.round(150 * (soilPH - 7.5) * calcAcres) : 0;
  const limeReclamationKg = isAcidic ? Math.round(120 * (6.5 - soilPH) * calcAcres) : 0;

  return (
    <div className="space-y-6">
      {/* 1. Green Manuring & Carbon Sequestration Calculator */}
      <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Green Manuring & Organic Carbon Restoration Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Natural bio-nitrogen fixation & humus replenishment for <strong>{calcAcres} Acres</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedGreenCrop}
              onChange={(e) => setSelectedGreenCrop(e.target.value)}
              className="bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="dhaincha">🌱 Dhaincha (Sesbania)</option>
              <option value="sunnhemp">🌿 Sunnhemp (Sanai)</option>
              <option value="cowpea">🫘 Green Cowpea / Lobia</option>
            </select>
          </div>
        </div>

        {/* 3 Calculated Metrics Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Certified Seed</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 my-1 block">
              {totalSeedsKg} kg
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              @{currentGreen.seedRateKgPerAcre} kg/acre seed rate
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Fresh Green Biomass</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 my-1 block">
              {totalBiomassTonnes} Tonnes
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              In-situ buried before Kharif season
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Free Atmospheric N Fixed</span>
            <span className="text-2xl font-black text-teal-600 dark:text-teal-400 my-1 block">
              +{totalNFixedKg} kg N
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Equivalent to ~{Math.round(totalNFixedKg / 0.46 / 45)} Bags Urea saved
            </span>
          </div>
        </div>

        {/* Step-by-Step Incorporation Protocol */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2 text-xs">
          <span className="font-bold text-slate-800 dark:text-white block">
            Agronomic Field Execution Procedure:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <span>
                Broadcast seeds with first summer monsoon shower or pre-irrigation in May/June.
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <span>
                Incorporate crop into soil with disc harrow / rotavator at 45-50 days (before stems become woody).
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Chemical pH & Salinity Neutralization Matrix */}
      <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
            <FlaskConical className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            pH Neutralization & Chemical Amendments
          </h4>
        </div>

        {isAlkaline ? (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-[#0a0d0c] border border-amber-300 dark:border-amber-500/30 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Alkaline / Calcareous Soil Detected (pH {soilPH.toFixed(1)})</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Apply <strong>Agricultural Gypsum (CaSO₄·2H₂O) @ {Math.round(gypsumReclamationKg / calcAcres)} kg/acre (Total: {gypsumReclamationKg} kg)</strong>. Gypsum exchanges excess sodium (Na⁺) on clay micelles with calcium (Ca²⁺), restoring soil permeability and aeration.
            </p>
          </div>
        ) : isAcidic ? (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-[#0a0d0c] border border-rose-300 dark:border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Acidic Soil Detected (pH {soilPH.toFixed(1)})</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              Apply <strong>Agricultural Calcitic Lime (CaCO₃) @ {Math.round(limeReclamationKg / calcAcres)} kg/acre (Total: {limeReclamationKg} kg)</strong> before plowing to buffer soil acidity and neutralize aluminum toxicity.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-[#0a0d0c] border border-emerald-300 dark:border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Optimal Soil Reaction (pH {soilPH.toFixed(1)}):</strong> Your soil is in the prime neutral buffer zone (6.5 - 7.5). No chemical reclamation required. All 16 essential plant nutrients remain soluble.
            </p>
          </div>
        )}
      </div>

      {/* 3. Bio-Fertilizers & Microbial Inoculants Suite */}
      <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Recommended Micro-Biological Inoculants & Bio-Stimulants
            </h4>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Zero Chemical Residue
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
              1. Azotobacter / Azospirillum
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Free-living nitrogen fixer for wheat, corn, mustard, and sugarcane. Apply @ 2 kg/acre mixed with compost.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
            <span className="font-bold text-amber-700 dark:text-amber-400 block">
              2. PSB (Phosphorus Solubilizer)
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Secretes organic acids to dissolve locked insoluble tricalcium phosphates in soil into plant-absorbable H₂PO₄⁻.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
            <span className="font-bold text-teal-700 dark:text-teal-400 block">
              3. VAM / Mycorrhiza
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Symbiotic fungal hyphae network expands active root surface area by 400%, boosting drought tolerance.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-1.5">
            <span className="font-bold text-indigo-700 dark:text-indigo-400 block">
              4. Trichoderma viride
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Bio-fungicide antagonist protecting roots against Rhizoctonia, Fusarium wilt, and collar rot pathogens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
