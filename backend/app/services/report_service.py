from typing import List, Dict, Any

class ReportService:
    @staticmethod
    async def get_reports_summary(user_id: str) -> List[Dict[str, Any]]:
        return [
            {
                "id": "rep_101",
                "title": "Rabi Season 2025-26 Crop Performance & Yield Audit",
                "report_type": "Seasonal Performance",
                "date_generated": "20 Feb 2026",
                "summary": "Covers Wheat (Sector A) and Mustard (Field B) comprehensive vegetative health, soil nutrition uptake, and projected harvesting profit margins.",
                "highlights": [
                    "Total Cultivated Land: 29.0 Acres",
                    "Average NDVI Foliage Density: 0.81 (Healthy)",
                    "Projected Gross Farm Revenue: ₹11,24,000",
                    "Net Estimated Profit: ₹7,85,000 (70% Margin)"
                ],
                "download_url": "/api/v1/reports/rep_101/download"
            },
            {
                "id": "rep_102",
                "title": "Soil Organic Matter & Macronutrient Audit Report",
                "report_type": "Soil Health",
                "date_generated": "10 Jan 2026",
                "summary": "Laboratory and sensor analysis across North, South, and East field blocks. Highlights nitrogen depletion trends and optimal bio-compost requirements.",
                "highlights": [
                    "Overall Soil Health Index: 86/100",
                    "Average Organic Carbon: 0.72%",
                    "Soil pH status: 6.8 (Neutral)",
                    "Phosphorus & Potash reserve: Optimal"
                ],
                "download_url": "/api/v1/reports/rep_102/download"
            },
            {
                "id": "rep_103",
                "title": "Integrated Pest & Disease Risk Assessment",
                "report_type": "Pest & Disease",
                "date_generated": "01 Feb 2026",
                "summary": "Weather-correlated biological risk matrix identifying aphid and blight vulnerabilities with recommended non-chemical preventive measures.",
                "highlights": [
                    "Yellow Rust Vulnerability: Low (< 12%)",
                    "Aphid Threshold: Moderate (Preventive Spray scheduled)",
                    "Chemical Cost Savings via Precision Spraying: ₹14,200"
                ],
                "download_url": "/api/v1/reports/rep_103/download"
            }
        ]
