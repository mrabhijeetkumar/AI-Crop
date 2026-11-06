"""
Indian Commercial Fertilizer Bag Optimizer & Agronomy Engine
Translates Soil Health Card N-P-K tests into exact 45kg/50kg commercial bags
with land unit normalization and split dosage schedules.
"""

from typing import Dict, Any, List
import math
from app.schemas.ml_schemas import (
    FertilizerCalculationRequest,
    FertilizerPlanResponse,
    FertilizerBagItem
)


# Land unit conversion factors to Standard Acres
LAND_UNIT_TO_ACRES = {
    "acre": 1.0,
    "acres": 1.0,
    "hectare": 2.47105,
    "ha": 2.47105,
    "bigha": 0.625,  # Standard Pucca Bigha (Punjab, Haryana, Western UP)
    "bigha_pucca": 0.625,
    "bigha_kaccha": 0.2083,  # Kaccha Bigha (Central India, Eastern UP, MP)
    "guntha": 0.025,  # Maharashtra, Karnataka, Gujarat (1/40th acre)
    "biswa": 0.05,  # 1/20th Bigha
    "cents": 0.01  # South India (Tamil Nadu, Kerala)
}

# Standard ICAR Recommended Nutrient Targets (kg/ha) for common Indian crops
CROP_RECOMMENDED_NPK_KG_HA = {
    "wheat": {"n": 120.0, "p": 60.0, "k": 40.0, "zinc": 25.0},
    "rice": {"n": 120.0, "p": 60.0, "k": 60.0, "zinc": 25.0},
    "paddy": {"n": 120.0, "p": 60.0, "k": 60.0, "zinc": 25.0},
    "cotton": {"n": 100.0, "p": 50.0, "k": 50.0, "zinc": 20.0},
    "maize": {"n": 120.0, "p": 60.0, "k": 50.0, "zinc": 25.0},
    "mustard": {"n": 80.0, "p": 40.0, "k": 40.0, "zinc": 15.0},
    "sugarcane": {"n": 250.0, "p": 100.0, "k": 120.0, "zinc": 35.0},
    "potato": {"n": 150.0, "p": 100.0, "k": 120.0, "zinc": 25.0},
    "tomato": {"n": 150.0, "p": 80.0, "k": 100.0, "zinc": 20.0},
    "onion": {"n": 100.0, "p": 50.0, "k": 80.0, "zinc": 15.0},
    "chickpea": {"n": 25.0, "p": 50.0, "k": 25.0, "zinc": 15.0},
    "gram": {"n": 25.0, "p": 50.0, "k": 25.0, "zinc": 15.0},
    "soybean": {"n": 30.0, "p": 60.0, "k": 40.0, "zinc": 20.0}
}


class IndianFertilizerOptimizer:
    @classmethod
    def calculate_plan(cls, req: FertilizerCalculationRequest) -> FertilizerPlanResponse:
        # 1. Normalize Land Area to Standard Acres
        unit_key = req.land_unit.strip().lower().replace(" ", "_")
        conversion_factor = LAND_UNIT_TO_ACRES.get(unit_key, 1.0)
        area_acres = req.area_value * conversion_factor
        area_ha = area_acres / 2.47105

        # 2. Get Target Crop Requirements
        crop_key = req.crop_name.strip().lower()
        targets = CROP_RECOMMENDED_NPK_KG_HA.get(crop_key, {"n": 100.0, "p": 50.0, "k": 40.0, "zinc": 20.0})

        # 3. Calculate Elemental Deficits per Hectare & Total Farm Deficit (kg)
        deficit_n_per_ha = max(10.0, targets["n"] - req.soil_n)
        deficit_p_per_ha = max(5.0, targets["p"] - req.soil_p)
        deficit_k_per_ha = max(5.0, targets["k"] - req.soil_k)

        total_def_n_kg = round(deficit_n_per_ha * area_ha, 2)
        total_def_p_kg = round(deficit_p_per_ha * area_ha, 2)
        total_def_k_kg = round(deficit_k_per_ha * area_ha, 2)

        # 4. Commercial Fertilizer Chemistry & Bag Allocation
        # A) DAP (Di-Ammonium Phosphate 18:46:0) in 50kg bag
        # 1 bag (50kg) DAP gives 23kg P2O5 and 9kg Nitrogen
        dap_bags_raw = total_def_p_kg / 23.0
        dap_bags = max(0.5, round(dap_bags_raw, 1))
        dap_weight_kg = dap_bags * 50
        n_from_dap_kg = dap_bags * 9.0

        # B) Neem Coated Urea (46:0:0) in 45kg bag
        # 1 bag (45kg) Urea gives 20.7kg Nitrogen
        remaining_n_kg = max(0.0, total_def_n_kg - n_from_dap_kg)
        urea_bags_raw = remaining_n_kg / 20.7
        urea_bags = max(0.5, round(urea_bags_raw, 1))
        urea_weight_kg = urea_bags * 45

        # C) MOP (Muriate of Potash 0:0:60) in 50kg bag
        # 1 bag (50kg) MOP gives 30kg K2O
        mop_bags_raw = total_def_k_kg / 30.0
        mop_bags = max(0.5, round(mop_bags_raw, 1))
        mop_weight_kg = mop_bags * 50

        # D) Zinc Sulphate (21% Zn) 25kg bag
        zinc_bags = max(0.2, round((targets.get("zinc", 20.0) * area_ha) / 25.0, 1))
        zinc_weight_kg = zinc_bags * 25

        # 5. Pricing (Govt Subsidized Average Market Rates)
        cost_dap = dap_bags * 1350.0
        cost_urea = urea_bags * 266.50
        cost_mop = mop_bags * 1700.0
        cost_zinc = zinc_bags * 850.0
        total_cost = round(cost_dap + cost_urea + cost_mop + cost_zinc, 2)

        # 6. Build Split Application Schedule
        recommended_bags: List[FertilizerBagItem] = []

        # DAP - 100% Basal
        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="DAP (Di-Ammonium Phosphate 18:46:0)",
            total_bags_required=dap_bags,
            bag_size_kg=50,
            total_weight_kg=dap_weight_kg,
            estimated_cost_inr=round(cost_dap, 2),
            stage="Basal Dose (At Sowing)",
            application_guide="Apply 100% DAP during final land preparation or place 5cm below seed furrow for vigorous root establishment."
        ))

        # MOP - 100% Basal
        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="MOP (Muriate of Potash 0:0:60)",
            total_bags_required=mop_bags,
            bag_size_kg=50,
            total_weight_kg=mop_weight_kg,
            estimated_cost_inr=round(cost_mop, 2),
            stage="Basal Dose (At Sowing)",
            application_guide="Broadcast 100% MOP at sowing to strengthen stem rigidity and enhance moisture stress tolerance."
        ))

        # Urea - 3-Way Split (33% Basal, 33% Tillering, 34% Panicle Initiation)
        urea_split_1 = round(urea_bags * 0.33, 1)
        urea_split_2 = round(urea_bags * 0.33, 1)
        urea_split_3 = round(urea_bags - (urea_split_1 + urea_split_2), 1)

        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="Neem Coated Urea (46% N) - Basal Split",
            total_bags_required=urea_split_1,
            bag_size_kg=45,
            total_weight_kg=round(urea_split_1 * 45, 1),
            estimated_cost_inr=round(urea_split_1 * 266.50, 2),
            stage="Basal Dose (1/3rd Sowing)",
            application_guide="Mix with basal dose to provide early vegetative nitrogen boost without burning seedlings."
        ))

        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="Neem Coated Urea (46% N) - 1st Top Dressing",
            total_bags_required=urea_split_2,
            bag_size_kg=45,
            total_weight_kg=round(urea_split_2 * 45, 1),
            estimated_cost_inr=round(urea_split_2 * 266.50, 2),
            stage="1st Top Dressing (21-30 DAS)",
            application_guide="Broadcast immediately after first irrigation at active tillering/branching stage."
        ))

        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="Neem Coated Urea (46% N) - 2nd Top Dressing",
            total_bags_required=urea_split_3,
            bag_size_kg=45,
            total_weight_kg=round(urea_split_3 * 45, 1),
            estimated_cost_inr=round(urea_split_3 * 266.50, 2),
            stage="2nd Top Dressing (45-55 DAS)",
            application_guide="Apply during panicle initiation / pre-flowering stage under moist soil conditions."
        ))

        # Zinc Sulphate
        recommended_bags.append(FertilizerBagItem(
            fertilizer_name="Zinc Sulphate Monohydrate (21% Zn)",
            total_bags_required=zinc_bags,
            bag_size_kg=25,
            total_weight_kg=zinc_weight_kg,
            estimated_cost_inr=round(cost_zinc, 2),
            stage="Basal Dose (At Sowing)",
            application_guide="Broadcast separately at sowing. Do NOT mix directly with DAP in the same bucket to prevent Zinc Phosphate precipitation."
        ))

        organic_remedies = [
            "Incorporate 2-3 Tonnes/Acre well-decomposed Farm Yard Manure (FYM) or Vermicompost during land preparation.",
            "Seed treatment with Azotobacter & PSB (Phosphorus Solubilizing Bacteria) bio-fertilizer cultures (250g / 10kg seed).",
            "Apply Neem Cake (100 kg/Acre) to retard nitrification and act as a natural soil nematicide.",
            "Foliar spray of 19:19:19 (NPK) @ 1.0% (10g/Litre) at active vegetative stage for rapid nutrient absorption."
        ]

        precautions = [
            "Never mix Zinc Sulphate directly with DAP/SSP during application to avoid insoluble zinc phosphate formation.",
            "Apply Urea top-dressing strictly in the afternoon when leaf moisture has evaporated to prevent foliage scorch.",
            "Ensure adequate field moisture before applying chemical fertilizers for optimal root absorption."
        ]

        return FertilizerPlanResponse(
            crop_name=req.crop_name.capitalize(),
            normalized_area_acres=round(area_acres, 2),
            elemental_deficit_kg={
                "N_deficit_kg": total_def_n_kg,
                "P2O5_deficit_kg": total_def_p_kg,
                "K2O_deficit_kg": total_def_k_kg
            },
            recommended_bags=recommended_bags,
            total_estimated_fertilizer_cost_inr=total_cost,
            organic_remedies=organic_remedies,
            precautions=precautions
        )
