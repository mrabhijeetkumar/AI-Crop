from typing import Dict, Any, List

class SoilPredictionEngine:
    @staticmethod
    def analyze(n: float, p: float, k: float, ph: float, oc: float = 0.65, ec: float = 0.45) -> Dict[str, Any]:
        # Health Score computation
        score = 80
        deficiencies = []
        organic_remedies = []
        chemical_dosage = {}
        
        # Nitrogen assessment
        n_status = "Optimal"
        if n < 80:
            n_status = "Low"
            score -= 10
            deficiencies.append("Nitrogen (N) Deficiency: Slow vegetative growth and pale leaf coloration.")
            organic_remedies.append("Apply 3 tonnes of decomposed Farm Yard Manure (FYM) or vermicompost per acre.")
            chemical_dosage["Urea (46% N)"] = "65 - 75 kg / acre in split doses"
        elif n > 160:
            n_status = "High"
            
        # Phosphorus assessment
        p_status = "Optimal"
        if p < 35:
            p_status = "Low"
            score -= 8
            deficiencies.append("Phosphorus (P) Deficiency: Impaired root establishment and poor tillering.")
            organic_remedies.append("Incorporate Phosphate Rich Organic Manure (PROM) @ 100kg/acre.")
            chemical_dosage["Single Super Phosphate (SSP)"] = "75 - 100 kg / acre as basal dose"
            
        # Potassium assessment
        k_status = "Optimal"
        if k < 35:
            k_status = "Low"
            score -= 6
            deficiencies.append("Potassium (K) Deficiency: Weak stems and lower drought resistance.")
            organic_remedies.append("Apply wood ash or bio-potash (Potash Solubilizing Bacteria - PSB).")
            chemical_dosage["MOP (Muriate of Potash)"] = "25 - 35 kg / acre"
            
        # pH category
        ph_cat = "Neutral"
        if ph < 6.0:
            ph_cat = "Acidic"
            deficiencies.append(f"Soil Acidity (pH {ph}): Aluminum toxicity potential and reduced P availability.")
            organic_remedies.append("Agricultural lime (CaCO3) application @ 250kg/acre.")
        elif ph > 7.8:
            ph_cat = "Alkaline / Calcareous"
            deficiencies.append(f"Soil Alkalinity (pH {ph}): Micronutrient (Zinc, Iron) lockup.")
            organic_remedies.append("Agricultural Gypsum application @ 300kg/acre + green manuring with Dhaincha (Sesbania).")

        final_score = max(35, min(98, score))
        health_status = "Excellent" if final_score >= 85 else ("Optimal" if final_score >= 70 else "Needs Attention")

        return {
            "overall_health_score": final_score,
            "health_status": health_status,
            "npk_status": {"N": n_status, "P": p_status, "K": k_status},
            "ph_category": ph_cat,
            "deficiencies": deficiencies if deficiencies else ["No major macronutrient deficiencies detected."],
            "organic_remedies": organic_remedies if organic_remedies else ["Maintain regular green manuring to preserve microbial diversity."],
            "chemical_fertilizer_dosage": chemical_dosage if chemical_dosage else {"Balanced NPK": "Maintain standard 4:2:1 ratio for season"},
            "compatible_crops": ["Wheat", "Rice", "Maize", "Mustard", "Cotton"] if final_score > 60 else ["Barley", "Millet", "Mustard"],
            "next_test_recommended_days": 90
        }
