export const DEFAULT_WEATHER_OVERVIEW = {
  currentTemp: 24.5,
  feelsLike: 25.2,
  condition: "Partly Sunny & Mild",
  humidity: 58,
  windSpeedKmh: 11.2,
  windDirection: "NW (North-West)",
  precipitationChance: 15,
  uvIndex: 5.4,
  solarRadiation: 680, // W/m2
  soilTemp: 21.0,
  soilMoistureLevel: 54, // %
  evapotranspirationMm: 3.8,
  spraySuitability: "Favorable",
  irrigationAdvised: false,
  advisoryMessage: "Ideal microclimate window for foliar nutrient sprays and field weeding. No irrigation required today due to adequate soil moisture (54%)."
};

export const SEVEN_DAY_FORECAST = [
  {
    day: "Today",
    date: "29 Aug",
    tempMax: 29.5,
    tempMin: 18.2,
    condition: "Clear & Sunny",
    precipitationMm: 0.0,
    precipitationProb: 10,
    humidity: 58,
    windSpeedKmh: 11.2,
    sprayCondition: "Good",
    farmingAdvisory: "Optimal for foliar sprays (Urea/Micronutrients). Good solar radiation for photosynthesis."
  },
  {
    day: "Tomorrow",
    date: "30 Aug",
    tempMax: 28.0,
    tempMin: 19.0,
    condition: "Partly Cloudy",
    precipitationMm: 1.5,
    precipitationProb: 25,
    humidity: 64,
    windSpeedKmh: 14.0,
    sprayCondition: "Good",
    farmingAdvisory: "Safe to carry out inter-cultivation and mechanical hoeing in row crops."
  },
  {
    day: "Day 3",
    date: "31 Aug",
    tempMax: 26.5,
    tempMin: 17.5,
    condition: "Scattered Showers",
    precipitationMm: 14.0,
    precipitationProb: 75,
    humidity: 78,
    windSpeedKmh: 18.5,
    sprayCondition: "Poor",
    farmingAdvisory: "Moderate showers anticipated (14mm). Postpone pesticide/fertilizer broadcasting to prevent runoff."
  },
  {
    day: "Day 4",
    date: "01 Sep",
    tempMax: 25.0,
    tempMin: 16.8,
    condition: "Overcast with Drizzle",
    precipitationMm: 6.0,
    precipitationProb: 60,
    humidity: 82,
    windSpeedKmh: 12.0,
    sprayCondition: "Poor",
    farmingAdvisory: "High humidity alert (>80%). Inspect low-lying wheat and mustard for early fungal spore germination."
  },
  {
    day: "Day 5",
    date: "02 Sep",
    tempMax: 27.2,
    tempMin: 17.0,
    condition: "Clearing & Pleasant",
    precipitationMm: 0.0,
    precipitationProb: 15,
    humidity: 62,
    windSpeedKmh: 9.8,
    sprayCondition: "Good",
    farmingAdvisory: "Skies clearing up. Field moisture is replenished; check field drainage channels."
  },
  {
    day: "Day 6",
    date: "03 Sep",
    tempMax: 29.0,
    tempMin: 18.5,
    condition: "Bright & Sunny",
    precipitationMm: 0.0,
    precipitationProb: 5,
    humidity: 52,
    windSpeedKmh: 10.5,
    sprayCondition: "Good",
    farmingAdvisory: "Excellent window for crop protective sprays and vegetative booster applications."
  },
  {
    day: "Day 7",
    date: "04 Sep",
    tempMax: 30.5,
    tempMin: 19.2,
    condition: "Warm & Dry",
    precipitationMm: 0.0,
    precipitationProb: 5,
    humidity: 48,
    windSpeedKmh: 12.0,
    sprayCondition: "Moderate",
    farmingAdvisory: "Higher daytime evapotranspiration (4.8mm). Monitor light sandy loam fields for soil moisture depletion."
  }
];
