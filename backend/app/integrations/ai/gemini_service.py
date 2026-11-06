import os
import logging
from app.config.settings import settings
from app.integrations.ai.prompts import AGRI_ADVISOR_SYSTEM_PROMPT

logger = logging.getLogger("aicrop.gemini")

class GeminiService:
    @staticmethod
    async def generate_advisor_response(query: str, farm_context: dict = None, language: str = "en") -> str:
        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
        
        context_str = ""
        if farm_context:
            context_str = f"\n[User Farm Context: Location={farm_context.get('location', 'India')}, Active Crop={farm_context.get('current_crop', 'Wheat')}, Soil={farm_context.get('soil_type', 'Alluvial')}]\n"

        full_prompt = f"{AGRI_ADVISOR_SYSTEM_PROMPT}\n{context_str}\nFarmer Query ({language}): {query}"

        if api_key:
            try:
                # Use Google GenAI SDK if key is configured
                from google import genai
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model="gemini-2.5-flash",
                    contents=full_prompt,
                )
                if response and response.text:
                    return response.text
            except Exception as e:
                logger.warning(f"Gemini API invocation error: {e}. Falling back to domain rule advisor engine.")

        # High quality fallback domain agriculture expert responses
        q_lower = query.lower()
        if "yellow" in q_lower or "leaf" in q_lower or "disease" in q_lower:
            return (
                "### 🌾 Crop Health Diagnosis: Potential Nitrogen Deficiency or Fungal Rust\n\n"
                "**Observations:**\n"
                "- Yellowing of lower leaves typically signals **Nitrogen (N) deficiency** or water-logged root stress.\n"
                "- If yellow spots are powdery or rust-colored on upper blades, inspect for **Yellow Stripe Rust**.\n\n"
                "**Actionable Recommendations:**\n"
                "1. **Foliar Spray:** Apply 2% Urea solution (20g Urea per liter of clean water) or soluble Zinc Sulphate (0.5%).\n"
                "2. **Fungicide Precaution:** If fungal pustules are visible, apply Propiconazole 25% EC @ 1ml/liter.\n"
                "3. **Irrigation Control:** Pause flood irrigation for 48 hours to aerate the root zone.\n"
                "4. **Soil Test:** Check soil pH to ensure micronutrient uptake is not locked."
            )
        elif "fertilizer" in q_lower or "npk" in q_lower or "urea" in q_lower:
            return (
                "### 🧪 Balanced NPK & Fertilizer Plan\n\n"
                "**Standard Nutrient Schedule (Per Acre):**\n"
                "- **Basal Dose (at Sowing):** 50kg DAP (Di-Ammonium Phosphate) + 25kg MOP (Muriate of Potash) + 10kg Zinc Sulphate (21%).\n"
                "- **First Top Dressing (21-25 Days after Sowing):** 35kg Neem Coated Urea after first irrigation.\n"
                "- **Second Top Dressing (Booting/Flowering Stage):** 30kg Urea with bio-stimulant spray.\n\n"
                "**Pro-Tip:** Always incorporate organic compost or farmyard manure (FYM) @ 3-4 tonnes/acre prior to land preparation to enhance soil carbon."
            )
        elif "pest" in q_lower or "insect" in q_lower or "spray" in q_lower:
            return (
                "### 🐛 Integrated Pest Management (IPM) Advisory\n\n"
                "**Immediate Steps:**\n"
                "1. **Scouting:** Check underside of 20 random leaves across the field.\n"
                "2. **Organic/Biological Option:** Spray Neem Oil (Azadirachtin 10000 ppm) @ 3ml/L water for sucking pests (aphids, thrips, whiteflies).\n"
                "3. **Chemical Intervention:** For high threshold infestation, spray Thiamethoxam 25% WG @ 0.5g/L or Emamectin Benzoate 5% SG @ 0.5g/L.\n"
                "4. **Weather Watch:** Never spray when wind speed exceeds 12 km/h or if rain is predicted within 6 hours."
            )
        else:
            return (
                f"### 🚜 AI Crop Advisor Guidance\n\n"
                f"Thank you for your question regarding **'{query}'**.\n\n"
                "**General Best Practices:**\n"
                "- **Soil Moisture:** Maintain optimal 40-50% field capacity before top-dressing nutrients.\n"
                "- **Micro-climate:** Monitor morning dew levels and daytime temperatures.\n"
                "- **Market Timing:** Check current Mandi rates in the Market tab before scheduling harvest dates.\n\n"
                "Feel free to ask for specific advice on dosage, disease identification, or weather-adjusted farming plans!"
            )
