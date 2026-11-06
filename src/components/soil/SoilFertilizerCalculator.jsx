import React, { useState } from "react";
import { CROPS_CATALOG } from "../../data/cropsData.js";
import { formatCurrency, getCropEmoji } from "../../utils/formatters.js";
import {
  Calculator,
  Calendar,
  Layers,
  Sparkles,
  Droplets,
  DollarSign,
  PackageCheck,
  CheckCircle2,
  Clock,
  Info,
} from "lucide-react";

export function SoilFertilizerCalculator({
  targetCropId,
  setTargetCropId,
  calcAcres,
  setCalcAcres,
  fertPlan,
  soilN,
  soilP,
  soilK,
}) {
  const [bagPriceMode, setBagPriceMode] = useState(false);
  const [customDapPrice, setCustomDapPrice] = useState(1350);
  const [customUreaPrice, setCustomUreaPrice] = useState(267);
  const [customMopPrice, setCustomMopPrice] = useState(1700);

  const targetCrop = CROPS_CATALOG.find((c) => c.id === targetCropId) || CROPS_CATALOG[0];

  // Dynamic cost calculation with customized or subsidized bag rates
  const currentTotalCost =
    fertPlan.dapBags * customDapPrice +
    fertPlan.ureaBags * customUreaPrice +
    fertPlan.mopBags * customMopPrice +
    fertPlan.totalZincKg * 75;

  return (
    <div className="space-y-6">
      {/* Precision Commercial Fertilizer Bags Card */}
      <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-5">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Exact Fertilizer Bags & Nutrient Dosage
              </h3>
              <p className="text-xs text-slate-500 dark:text-neutral-400">
                Calibrated for <strong>{targetCrop.name}</strong> on <strong>{calcAcres} Acres</strong>
              </p>
            </div>
          </div>

          {/* Controls: Target Crop & Acre Selector */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Target Crop Select */}
            <div className="relative">
              <select
                value={targetCropId}
                onChange={(e) => setTargetCropId(e.target.value)}
                className="bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer pr-7"
              >
                {CROPS_CATALOG.map((c) => (
                  <option key={c.id} value={c.id}>
                    {getCropEmoji(c.name)} {c.name.split("(")[0]}
                  </option>
                ))}
              </select>
            </div>

            {/* Land Unit Selector */}
            <div className="relative">
              <select
                defaultValue="Acre"
                onChange={(e) => {
                  const unit = e.target.value;
                  const unitFactors = {
                    Acre: 1.0,
                    "Bigha (Pucca)": 0.625,
                    "Bigha (Kaccha)": 0.208,
                    Guntha: 0.025,
                    Hectare: 2.471,
                    Biswa: 0.05
                  };
                  // Keep acreage in sync
                  const factor = unitFactors[unit] || 1.0;
                  setCalcAcres(Math.max(0.5, Number((5.0 * factor).toFixed(1))));
                }}
                className="bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2.5 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value="Acre">Unit: Acre</option>
                <option value="Bigha (Pucca)">Unit: Pucca Bigha (0.625 Ac)</option>
                <option value="Bigha (Kaccha)">Unit: Kaccha Bigha (0.21 Ac)</option>
                <option value="Guntha">Unit: Guntha (1/40th Ac)</option>
                <option value="Hectare">Unit: Hectare (2.47 Ac)</option>
                <option value="Biswa">Unit: Biswa (0.05 Ac)</option>
              </select>
            </div>

            {/* Acreage Input */}
            <div className="flex items-center bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-xl px-2 py-1">
              <button
                onClick={() => setCalcAcres(Math.max(0.5, Number((calcAcres - 0.5).toFixed(1))))}
                className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#141414] text-slate-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="0.5"
                max="250"
                step="0.5"
                value={calcAcres}
                onChange={(e) => setCalcAcres(Math.max(0.5, Number(e.target.value)))}
                className="w-14 text-center text-xs font-black text-slate-900 dark:text-white bg-transparent focus:outline-none"
              />
              <button
                onClick={() => setCalcAcres(Number((calcAcres + 0.5).toFixed(1)))}
                className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-[#141414] text-slate-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors cursor-pointer"
              >
                +
              </button>
              <span className="text-[11px] font-bold text-slate-400 dark:text-neutral-400 ml-1.5 pr-1">Acres</span>
            </div>
          </div>
        </div>

        {/* 4 Commercial Fertilizer Bag Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* DAP Bag */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center relative overflow-hidden group hover:border-amber-500/50 transition-all">
            <div className="w-2 h-full bg-amber-500 absolute left-0 top-0" />
            <span className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400 block tracking-wider">
              DAP (18:46:0)
            </span>
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400 my-1 block">
              {fertPlan.dapBags}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white block">
              Bags (50 kg)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {fertPlan.totalDapKg} kg Total Needed
            </span>
          </div>

          {/* Urea Bag */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center relative overflow-hidden group hover:border-emerald-500/50 transition-all">
            <div className="w-2 h-full bg-[#22c55e] absolute left-0 top-0" />
            <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block tracking-wider">
              Urea (46% N)
            </span>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 my-1 block">
              {fertPlan.ureaBags}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white block">
              Bags (45 kg)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {fertPlan.totalUreaKg} kg Total Needed
            </span>
          </div>

          {/* MOP Bag */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center relative overflow-hidden group hover:border-teal-500/50 transition-all">
            <div className="w-2 h-full bg-teal-500 absolute left-0 top-0" />
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 block tracking-wider">
              MOP Potash (60%)
            </span>
            <span className="text-3xl font-black text-teal-600 dark:text-teal-400 my-1 block">
              {fertPlan.mopBags}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white block">
              Bags (50 kg)
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              {fertPlan.totalMopKg} kg Total Needed
            </span>
          </div>

          {/* Zinc Sulphate */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] text-center relative overflow-hidden group hover:border-indigo-500/50 transition-all">
            <div className="w-2 h-full bg-indigo-500 absolute left-0 top-0" />
            <span className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400 block tracking-wider">
              Zinc Sulphate (21%)
            </span>
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400 my-1 block">
              {fertPlan.totalZincKg}
            </span>
            <span className="text-xs font-extrabold text-slate-800 dark:text-white block">
              Kilograms
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
              Micro Nutrient Booster
            </span>
          </div>
        </div>

        {/* Cost & Procurement Summary Row */}
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-slate-800 dark:text-white">
                Estimated Input Procurement Cost:
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Based on standard subsidized rates (DAP ₹{customDapPrice}/bag, Urea ₹{customUreaPrice}/bag, MOP ₹{customMopPrice}/bag)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setBagPriceMode(!bagPriceMode)}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
            >
              {bagPriceMode ? "Hide Price Config" : "Edit Bag Rates"}
            </button>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(currentTotalCost)}
            </span>
          </div>
        </div>

        {/* Custom Price Editor Drawer if open */}
        {bagPriceMode && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#141414] border border-slate-200 dark:border-emerald-500/25 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in duration-150">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                DAP Bag Price (₹)
              </label>
              <input
                type="number"
                value={customDapPrice}
                onChange={(e) => setCustomDapPrice(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                Urea Bag Price (₹)
              </label>
              <input
                type="number"
                value={customUreaPrice}
                onChange={(e) => setCustomUreaPrice(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-neutral-400 block mb-1">
                MOP Potash Bag Price (₹)
              </label>
              <input
                type="number"
                value={customMopPrice}
                onChange={(e) => setCustomMopPrice(Number(e.target.value))}
                className="w-full bg-white dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Recommended 4-Stage Precision Split Application Timeline */}
      <div className="p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#0F0F0F] border border-emerald-200 dark:border-white/[0.08] shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-[#141414] text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-300 dark:border-emerald-500/25">
              <Calendar className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Scientific Fertilizer Application Timeline & Stage Guide
            </h4>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
            Split Dose Prevents 35% Leaching Loss
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {/* Stage 1: Basal */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                1
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Basal Dose (At Sowing)
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <p>
                • <strong>100% of DAP ({fertPlan.dapBags} Bags)</strong>
              </p>
              <p>
                • <strong>100% of MOP ({fertPlan.mopBags} Bags)</strong>
              </p>
              <p>
                • <strong>Full Zinc ({fertPlan.totalZincKg} kg)</strong>
              </p>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-2">
              Drill 4-5 cm below seed level during final plowing.
            </p>
          </div>

          {/* Stage 2: 1st Top-Dress */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                2
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                First Top-Dress (20-25 DAS)
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <p>
                • <strong>50% of Urea ({Math.ceil(fertPlan.ureaBags / 2)} Bags)</strong>
              </p>
              <p>• Apply after 1st light irrigation (CRI stage).</p>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-2">
              Broadcast in the afternoon when soil has active capillary moisture.
            </p>
          </div>

          {/* Stage 3: 2nd Top-Dress */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0a0d0c] border border-slate-200 dark:border-white/[0.08] space-y-2 relative">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                3
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                Second Top-Dress (45-50 DAS)
              </span>
            </div>
            <div className="space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
              <p>
                • <strong>Remaining 50% Urea ({Math.floor(fertPlan.ureaBags / 2)} Bags)</strong>
              </p>
              <p>• Prior to panicle initiation / flowering.</p>
            </div>
            <p className="text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-1.5 mt-2">
              Ensures bold grain filling and prevents early flag leaf yellowing.
            </p>
          </div>
        </div>

        {/* Moisture Prerequisite Banner */}
        <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-[#141414] border border-emerald-200 dark:border-emerald-500/25 flex items-center gap-3 text-xs text-emerald-800 dark:text-[#d1fae5]">
          <Droplets className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Agronomic Best Practice:</strong> Never apply nitrogenous fertilizers (Urea) on dry, cracked soil. Ensure adequate moisture is present or irrigate within 24 hours of application.
          </span>
        </div>
      </div>
    </div>
  );
}
