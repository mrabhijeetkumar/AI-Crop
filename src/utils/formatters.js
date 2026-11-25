export function formatCurrency(amount, currency = "₹") {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return `${currency}0`;
  const num = Number(amount);
  return `${currency}${num.toLocaleString("en-IN")}`;
}

export function formatNumber(val, decimals = 1) {
  if (val === undefined || val === null || isNaN(Number(val))) return "0";
  return Number(val).toFixed(decimals);
}

export function formatDate(dateString) {
  if (!dateString) return "";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return dateString;
  }
}

export function getCropEmoji(cropName) {
  const lower = (cropName || "").toLowerCase();
  if (lower.includes("wheat")) return "🌾";
  if (lower.includes("paddy") || lower.includes("rice")) return "🍚";
  if (lower.includes("mustard")) return "🌼";
  if (lower.includes("cotton")) return "🌱";
  if (lower.includes("maize") || lower.includes("corn")) return "🌽";
  if (lower.includes("potato")) return "🥔";
  if (lower.includes("tomato")) return "🍅";
  if (lower.includes("soybean")) return "🫘";
  if (lower.includes("sugarcane")) return "🎋";
  if (lower.includes("chickpea") || lower.includes("gram")) return "🥣";
  if (lower.includes("onion")) return "🧅";
  if (lower.includes("groundnut") || lower.includes("peanut")) return "🥜";
  return "🌿";
}

export function getSeverityBadgeClass(severity) {
  switch (severity?.toLowerCase()) {
    case "healthy":
      return "bg-emerald-950 text-emerald-300 border-emerald-500/30";
    case "low":
      return "bg-blue-950 text-blue-300 border-blue-500/30";
    case "moderate":
      return "bg-amber-950 text-amber-300 border-amber-500/30";
    case "high":
    case "critical":
      return "bg-rose-950 text-rose-300 border-rose-500/30";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
}
