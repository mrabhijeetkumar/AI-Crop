// src/utils/advisorApi.js
// Single place that talks to the Dr. Krishi backend.
// NOTE: the server exposes POST /api/gemini/advisor  (returns { reply, prescription?, source }).
// The old code called /api/advisor/chat and /api/ml/advisor-chat which DO NOT EXIST,
// so the chatbot always showed the canned fallback text.

export function getCurrentLanguage() {
  try {
    return localStorage.getItem("ac_lang") || "en";
  } catch {
    return "en";
  }
}

export function buildFarmContext({
  farmProfile = {},
  fields = [],
  weather = {},
  crop,
} = {}) {
  const f = fields[0];
  const soil = f?.soilTest || {};
  return {
    farmName: farmProfile.farmName,
    location: farmProfile.location,
    acres: farmProfile.totalAreaAcres,
    selectedCrop:
      crop || f?.currentCrop || farmProfile.primaryCrops?.[0] || "Wheat",
    soilType: farmProfile.primarySoilType || f?.soilType,
    soilPh: soil.ph,
    soilN: soil.nitrogen,
    soilP: soil.phosphorus,
    soilK: soil.potassium,
    weatherTemp:
      weather?.currentTemp != null ? `${weather.currentTemp}°C` : undefined,
    weatherHumidity:
      weather?.humidity != null ? `${weather.humidity}%` : undefined,
    weatherRain:
      weather?.rainChance != null ? `${weather.rainChance}%` : undefined,
    weatherWind:
      weather?.windSpeed != null ? `${weather.windSpeed} km/h` : undefined,
  };
}

export async function askDrKrishi({
  message,
  farmContext = {},
  language,
  persona = "general",
  history = [],
  imageBase64,
  mimeType,
  signal,
}) {
  const res = await fetch("/api/gemini/advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      message,
      farmContext,
      persona,
      language: language || getCurrentLanguage(),
      conversationHistory: history.slice(-5).map((m) => ({
        sender: m.sender === "user" ? "user" : "advisor",
        text: m.text,
      })),
      imageBase64,
      mimeType,
    }),
  });
  if (!res.ok) throw new Error(`Advisor request failed (${res.status})`);
  const data = await res.json();
  if (!data.reply) throw new Error("Empty advisor reply");
  return {
    text: data.reply,
    prescription: data.prescription || null,
    source: data.source || "",
  };
}

export const OFFLINE_REPLY =
  "⚠️ Abhi server se connect nahi ho paa raha. Tab tak ye general tips follow karein:\n\n" +
  "- Soil moisture check karke hi irrigation karein.\n" +
  "- Fertilizer ko 2-3 doses me split karein.\n" +
  "- Spray hamesha subah ya shaam, kam hawa me karein.\n\n" +
  "Thodi der baad dobara try karein.";

/** Maps the advisor's prescription object to the shape saved in FarmContext. */
export function prescriptionToRecord(p = {}, fallbackCrop = "Crop") {
  return {
    title: p.targetProblem
      ? `${p.targetProblem} Protocol`
      : `${p.crop || fallbackCrop} Prescription`,
    crop: p.crop || fallbackCrop,
    category: /fert|npk|nutri/i.test(p.targetProblem || "")
      ? "Fertilizer & NPK"
      : "Pest & Disease",
    diagnosis: p.targetProblem || "Agronomic treatment",
    chemicalRemedy: p.chemicalSpray || "—",
    dosage: p.dosagePerAcre || "As per ICAR recommendation",
    organicRemedy: p.organicAlternative || "—",
    applicationStage: "Current growth stage",
    precaution: p.safetyPrecautions || "Wear protective gear during spray.",
    estimatedCost: p.economicCostPerAcre || "—",
  };
}
