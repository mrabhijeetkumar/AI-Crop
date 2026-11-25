/**
 * Centralized Crop Image & Identity Mapping for AI Crop Profit
 * Maps standard Indian crop IDs, botanical terms, and aliases to high-definition photographic assets.
 */

export const CROP_IMAGE_MAP = {
  // Primary Cereal & Cash Crops
  wheat: "/images/crop-wheat.jpg",
  rice: "/images/crop-rice.jpg",
  paddy: "/images/crop-rice.jpg",
  mustard: "/images/crop-mustard.jpg",
  rapeseed: "/images/crop-mustard.jpg",
  cotton: "/images/crop-cotton.jpg",
  maize: "/images/crop-maize.jpg",
  corn: "/images/crop-maize.jpg",
  potato: "/images/crop-potato.jpg",
  sugarcane: "/images/crop-sugarcane.jpg",
  chickpea: "/images/crop-chickpea.jpg",
  gram: "/images/crop-chickpea.jpg",
  chana: "/images/crop-chickpea.jpg",
  soybean: "/images/crop-soybean.jpg",
  soya: "/images/crop-soybean.jpg",
};

/**
 * Resolves a crop identifier or crop object to a verified image asset path.
 *
 * @param {string|object} crop - Crop ID string, display name, or recommendation object
 * @param {string} [fallback="/images/crop-wheat.jpg"] - Graceful fallback image
 * @returns {string} Public asset URL
 */
export function getCropImage(crop, fallback = "/images/crop-wheat.jpg") {
  if (!crop) return fallback;

  // 1. If crop object already contains a valid image path string
  if (typeof crop === "object") {
    if (crop.image && typeof crop.image === "string" && crop.image.startsWith("/")) {
      return crop.image;
    }
  }

  // 2. Extract potential string tokens
  const rawId = typeof crop === "object" ? crop.crop || crop.id || crop.name || crop.cropDisplayName || "" : crop;
  const str = String(rawId).toLowerCase().trim();

  if (!str) return fallback;

  // Direct key lookup
  if (CROP_IMAGE_MAP[str]) {
    return CROP_IMAGE_MAP[str];
  }

  // Substring / alias matching
  if (str.includes("wheat") || str.includes("gehu")) return CROP_IMAGE_MAP.wheat;
  if (str.includes("rice") || str.includes("paddy") || str.includes("dhan") || str.includes("basmati")) return CROP_IMAGE_MAP.rice;
  if (str.includes("mustard") || str.includes("sarson") || str.includes("rapeseed")) return CROP_IMAGE_MAP.mustard;
  if (str.includes("cotton") || str.includes("kapas")) return CROP_IMAGE_MAP.cotton;
  if (str.includes("maize") || str.includes("corn") || str.includes("makka")) return CROP_IMAGE_MAP.maize;
  if (str.includes("potato") || str.includes("aloo")) return CROP_IMAGE_MAP.potato;
  if (str.includes("sugar") || str.includes("ganna")) return CROP_IMAGE_MAP.sugarcane;
  if (str.includes("chickpea") || str.includes("gram") || str.includes("chana")) return CROP_IMAGE_MAP.chickpea;
  if (str.includes("soy") || str.includes("soya")) return CROP_IMAGE_MAP.soybean;
  if (str.includes("tomato") || str.includes("tamatar")) return CROP_IMAGE_MAP.tomato;
  if (str.includes("moong") || str.includes("mung")) return CROP_IMAGE_MAP.moong;

  return fallback;
}

/**
 * Returns a clean, user-friendly short name for badge and tab display.
 *
 * @param {string|object} crop
 * @returns {string}
 */
export function getCropShortName(crop) {
  if (!crop) return "Crop";
  const name = typeof crop === "object" ? crop.cropDisplayName || crop.crop || crop.name || "Crop" : crop;
  return String(name).split("/")[0].split("(")[0].trim();
}

