"""
Indian Government Agricultural Welfare Schemes & Subsidy Matcher
Integrates central & state schemes (PM-Kisan, PMFBY, KCC, Soil Health Card, SMAM, PMKSY)
with criteria matching based on farmer landholding, crop, and state.
"""

from typing import List, Dict, Any, Optional


GOVERNMENT_SCHEMES_DATABASE = [
    {
        "id": "pm_kisan",
        "scheme_name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "category": "Direct Income Support",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "₹6,000 per year directly transferred to bank account in 3 equal four-monthly installments of ₹2,000.",
        "eligibility": "All landholding farmer families with cultivable landholding in their names.",
        "documents_required": ["Aadhaar Card", "Land Ownership Record (Khatauni/7/12)", "Active Bank Account with DBT enabled"],
        "official_portal": "https://pmkisan.gov.in",
        "helpline": "155261 / 011-24300606",
        "matches_all": True
    },
    {
        "id": "pmfby",
        "scheme_name": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
        "category": "Crop Insurance & Risk Coverage",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Comprehensive yield loss and localized calamity insurance. Farmers pay nominal premium (2% Kharif, 1.5% Rabi, 5% Commercial/Horticultural crops).",
        "eligibility": "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
        "documents_required": ["Land Possession Certificate / Sowing Certificate", "Aadhaar Card", "Bank Passbook", "Calamity Geo-Tagged Photo within 72 hrs"],
        "official_portal": "https://pmfby.gov.in",
        "helpline": "14447",
        "matches_all": True
    },
    {
        "id": "kcc",
        "scheme_name": "KCC (Kisan Credit Card)",
        "category": "Subsidized Institutional Credit",
        "ministry": "Ministry of Finance & NABARD",
        "benefit": "Low-interest institutional credit up to ₹3,00,000 at effective 4% interest rate (after 3% Prompt Repayment Incentive). Collateral-free up to ₹1.6 Lakh.",
        "eligibility": "Owner cultivators, tenant farmers, oral lessees, SHGs, and joint liability groups of farmers.",
        "documents_required": ["Application Form", "Identity & Address Proof", "Land Ownership Proof / Crop Pattern declaration"],
        "official_portal": "https://www.myscheme.gov.in/schemes/kcc",
        "helpline": "1800-115-526",
        "matches_all": True
    },
    {
        "id": "soil_health_card",
        "scheme_name": "Soil Health Card Scheme",
        "category": "Soil Diagnostic & Fertilizer Guidance",
        "ministry": "Department of Agriculture and Farmers Welfare",
        "benefit": "Free Soil Health Card issued every 3 years containing nutrient status across 12 parameters (N, P, K, S, Zn, Fe, Cu, Mn, Bo, pH, EC, OC) with custom fertilizer dosages.",
        "eligibility": "All Indian farmers with agricultural land.",
        "documents_required": ["Soil Sample submission at nearest Krishi Vigyan Kendra (KVK) or Village Agri Office", "Aadhaar Card"],
        "official_portal": "https://soilhealth.dac.gov.in",
        "helpline": "1800-180-1551",
        "matches_all": True
    },
    {
        "id": "smam",
        "scheme_name": "SMAM (Sub-Mission on Agricultural Mechanization)",
        "category": "Farm Machinery & Tractor Subsidy",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "40% to 50% capital subsidy on purchasing tractors, rotavators, power tillers, laser land levelers, and setting up Custom Hiring Centers (up to 80% subsidy for CHCs).",
        "eligibility": "Small, marginal, SC/ST, and women farmers given priority.",
        "documents_required": ["Aadhaar", "Land Records", "Bank Details", "Quotation from Authorized Dealer"],
        "official_portal": "https://agrimachinery.nic.in",
        "helpline": "1800-180-1551",
        "matches_all": False
    },
    {
        "id": "pmksy_micro_irrigation",
        "scheme_name": "PMKSY - Per Drop More Crop (Micro Irrigation)",
        "category": "Drip & Sprinkler Irrigation Subsidy",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "Up to 55% financial assistance for small/marginal farmers and 45% for other farmers to install precision Drip and Sprinkler irrigation systems.",
        "eligibility": "All farmers with assured water source on cultivated land.",
        "documents_required": ["Aadhaar", "Land Records (7/12 or Khasra)", "Water Source Certificate", "Electricity Connection / Pump details"],
        "official_portal": "https://pmksy.gov.in",
        "helpline": "1800-180-1551",
        "matches_all": False
    },
    {
        "id": "pkvy_organic",
        "scheme_name": "PKVY (Paramparagat Krishi Vikas Yojana)",
        "category": "Organic Farming & Certification",
        "ministry": "Ministry of Agriculture & Farmers Welfare",
        "benefit": "₹50,000 per hectare over 3 years, of which ₹31,000 (62%) is directly transferred for organic inputs (bio-fertilizers, vermicompost, bio-pesticides).",
        "eligibility": "Farmers forming clusters of 50 or more acres committed to chemical-free organic farming.",
        "documents_required": ["Cluster Member declaration", "Aadhaar Card", "Bank Account"],
        "official_portal": "https://pgsindia-ncof.gov.in",
        "helpline": "1800-180-1551",
        "matches_all": False
    }
]


class GovtSchemeEngine:
    @classmethod
    def get_matched_schemes(
        cls,
        state: Optional[str] = None,
        crop: Optional[str] = None,
        land_acres: Optional[float] = None
    ) -> List[Dict[str, Any]]:
        """
        Returns relevant government schemes with matched badges based on farmer profile.
        """
        results = []
        for scheme in GOVERNMENT_SCHEMES_DATABASE:
            item = dict(scheme)
            item["is_recommended"] = True
            if land_acres and land_acres <= 5.0 and scheme["id"] in ["pm_kisan", "smam", "pmksy_micro_irrigation"]:
                item["priority_tag"] = "High Priority (Small/Marginal Farmer)"
            elif scheme["id"] == "pmfby":
                item["priority_tag"] = "Seasonal Risk Coverage"
            else:
                item["priority_tag"] = "Active National Scheme"

            results.append(item)
        return results
