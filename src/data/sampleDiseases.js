export const SAMPLE_LEAVES = [
  {
    id: "sample_wheat_rust",
    name: "Wheat Stripe / Yellow Rust",
    crop: "Wheat",
    thumbnailEmoji: "🌾",
    description: "Linear yellow-orange powdery pustules along leaf veins with yellowing chlorosis.",
    accentColor: "#eab308",
    diagnosisData: {
      id: "diag_wheat_rust",
      timestamp: "Just now",
      sampleName: "Wheat Leaf with Stripe Rust",
      cropIdentified: "Wheat (Triticum aestivum)",
      diseaseName: "Yellow / Stripe Rust (Puccinia striiformis)",
      pathogenType: "Fungal",
      severity: "High",
      confidenceScore: 96,
      symptomsObserved: [
        "Continuous linear stripes of bright yellow-orange urediniospores on upper leaf blade",
        "Interveinal chlorosis and rapid moisture loss in flag leaf",
        "Early leaf desiccation reducing photosynthetic area by >45%"
      ],
      rootCause: "Cool temperatures (10°C - 18°C) paired with heavy morning dew and canopy humidity >85%.",
      immediateActions: [
        "Isolate heavily affected boundary rows to check windward spread",
        "Avoid any excess Nitrogen top-dressing immediately (excess N promotes succulent fungal growth)",
        "Schedule foliar fungicide spray within 24-48 hours before dawn dew sets"
      ],
      organicRemedy: "Spray Cow Urine + Neem Oil decoction (10:1 ratio) or Trichoderma viride foliar spray @ 5g/L water.",
      chemicalTreatment: "Propiconazole 25% EC (Tilt) @ 200 ml in 200 liters of water per acre OR Tebuconazole 25.9% EC @ 200 ml/acre.",
      preventionTips: [
        "Adopt rust-resistant wheat varieties (e.g. PBW-725, HD-3086, DBW-187, DBW-303)",
        "Observe recommended sowing window (1st to 15th November)",
        "Scout field borders weekly during December-February"
      ],
      affectedYieldEstimate: "25% - 40% reduction in grain test-weight if untreated"
    }
  },
  {
    id: "sample_tomato_blight",
    name: "Tomato Early Blight",
    crop: "Tomato",
    thumbnailEmoji: "🍅",
    description: "Dark brown concentric target-like rings on older leaves with yellow halo.",
    accentColor: "#ef4444",
    diagnosisData: {
      id: "diag_tomato_blight",
      timestamp: "Just now",
      sampleName: "Tomato Leaf with Early Blight",
      cropIdentified: "Tomato (Solanum lycopersicum)",
      diseaseName: "Early Blight (Alternaria solani)",
      pathogenType: "Fungal",
      severity: "Moderate",
      confidenceScore: 94,
      symptomsObserved: [
        "Concentric 'bullseye' target-like dark brown to black circular lesions",
        "Progressive upward defoliation starting from lower ground-touching leaves",
        "Stem collar lesions near ground level"
      ],
      rootCause: "Warm humid weather (24°C - 29°C), splash dispersal from soil during irrigation.",
      immediateActions: [
        "Prune and burn lower 15cm leaves touching the soil surface",
        "Switch overhead sprinkler irrigation to root-zone drip line",
        "Apply protective copper or strobilurin based foliar spray"
      ],
      organicRemedy: "Spray 0.5% Baking Soda solution + Horticultural Neem oil @ 5ml/L or Pseudomonas fluorescens @ 5g/L.",
      chemicalTreatment: "Mancozeb 75% WP @ 2.5 g/L OR Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L.",
      preventionTips: [
        "Stake plants and mulch soil with silver-black plastic sheet or straw",
        "Follow a 3-year crop rotation avoiding Solanaceae crops (potato, brinjal)",
        "Ensure 60cm row spacing for good air circulation"
      ],
      affectedYieldEstimate: "15% - 25% fruit loss due to sunscald and leaf drop"
    }
  },
  {
    id: "sample_cotton_clcuv",
    name: "Cotton Leaf Curl Disease",
    crop: "Cotton",
    thumbnailEmoji: "🌱",
    description: "Upward/downward leaf curling, thickened dark veins and enation on underleaf.",
    accentColor: "#10b981",
    diagnosisData: {
      id: "diag_cotton_clcuv",
      timestamp: "Just now",
      sampleName: "Cotton Leaf with Leaf Curl",
      cropIdentified: "Cotton (Gossypium hirsutum)",
      diseaseName: "Cotton Leaf Curl Virus (CLCuD / CLCuV)",
      pathogenType: "Viral",
      severity: "Critical",
      confidenceScore: 95,
      symptomsObserved: [
        "Upward cupping and curling of young apical leaves",
        "Thickening of primary and secondary veins (dark green netting effect)",
        "Cup-shaped leaf-like enation outgrowth on the underside of major veins",
        "Stunted internode elongation and flower bud drop"
      ],
      rootCause: "Transmitted by Whitefly vector (Bemisia tabaci); favored by high temperature and dry spells.",
      immediateActions: [
        "Target the whitefly vector immediately with systemic insecticides",
        "Eradicate alternate weed hosts (Kangi buti, Peeli buti, Congress grass) from bunds",
        "Foliar spray with 2% Potassium Nitrate (13:0:45) to build plant cellular vigor"
      ],
      organicRemedy: "Spray 5% Neem Seed Kernel Extract (NSKE) or Beauveria bassiana bio-pesticide @ 5g/L.",
      chemicalTreatment: "Afidopyropen 50 g/L (Sefina) @ 400 ml/acre OR Pyriproxyfen 10% + Clothianidin @ 400ml/acre to control whitefly nymphs and adults.",
      preventionTips: [
        "Install 20 yellow sticky traps per acre along border rows",
        "Avoid growing susceptible deshi/non-certified hybrid varieties",
        "Avoid sowing adjacent to Okra / Guara crops which host whitefly colonies"
      ],
      affectedYieldEstimate: "35% - 50% loss in boll formation if infested before 60 DAS"
    }
  },
  {
    id: "sample_healthy_wheat",
    name: "Healthy Wheat Canopy",
    crop: "Wheat",
    thumbnailEmoji: "🌿",
    description: "Vibrant deep green foliage, erect flag leaf, zero chlorosis or spots.",
    accentColor: "#22c55e",
    diagnosisData: {
      id: "diag_healthy_wheat",
      timestamp: "Just now",
      sampleName: "Healthy Wheat Field Sample",
      cropIdentified: "Wheat (Triticum aestivum)",
      diseaseName: "Healthy Crop - No Active Pathogen Detected",
      pathogenType: "None (Healthy)",
      severity: "Healthy",
      confidenceScore: 98,
      symptomsObserved: [
        "Uniform dark emerald green pigmentation (Chlorophyll Index: 48.2 SPAD)",
        "Optimal turgidity in leaf blade with clean cuticle surface",
        "No fungal sporulation, necrotic spots, or insect piercing wounds"
      ],
      rootCause: "Well-balanced basal NPK nutrition, optimal soil moisture (52%), and sound crop care.",
      immediateActions: [
        "Maintain scheduled irrigation at flowering / earhead emergence stage",
        "Apply 1% Urea or 19:19:19 foliar spray to maximize grain filling weight"
      ],
      organicRemedy: "Apply Panchagavya @ 3% or Jeevamrutha through irrigation water for sustained microbial vitality.",
      chemicalTreatment: "No chemical fungicide required. Preventative scouting recommended.",
      preventionTips: [
        "Keep scouting weekly as temperatures rise in late spring",
        "Ensure field drainage channels are clear of standing water"
      ],
      affectedYieldEstimate: "0% yield loss - On track for bumper harvest (>22 qtl/acre)"
    }
  },
  {
    id: "sample_potato_late_blight",
    name: "Potato Late Blight",
    crop: "Potato",
    thumbnailEmoji: "🥔",
    description: "Water-soaked irregular dark lesions with white mildew on lower leaf surface.",
    accentColor: "#8b5cf6",
    diagnosisData: {
      id: "diag_potato_blight",
      timestamp: "Just now",
      sampleName: "Potato Foliage with Late Blight",
      cropIdentified: "Potato (Solanum tuberosum)",
      diseaseName: "Late Blight (Phytophthora infestans)",
      pathogenType: "Fungal",
      severity: "Critical",
      confidenceScore: 97,
      symptomsObserved: [
        "Water-soaked dark purplish-black necrotic blotches expanding rapidly across leaflets",
        "Delicate white cottony fungal growth on the underside of infected leaves during foggy mornings",
        "Foul odor emitting from rotting foliage in dense canopy"
      ],
      rootCause: "Dense fog/overcast weather with relative humidity >90% and temperature between 12°C-22°C for 48+ hours.",
      immediateActions: [
        "Stop sprinkler irrigation immediately to arrest fungal sporangia spread",
        "Spray systemic curative fungicide with full canopy coverage within 12 hours",
        "Perform dehaulming (cut foliage) if crop is near maturity to protect underground tubers"
      ],
      organicRemedy: "Bordeaux mixture 1% spray as preventative shield before foggy weather windows.",
      chemicalTreatment: "Dimethomorph 50% WP @ 1g/L + Mancozeb @ 2g/L OR Cymoxanil 8% + Mancozeb 64% WP @ 2.5g/L water.",
      preventionTips: [
        "Plant certified disease-free seed tubers treated with Trichoderma",
        "High earthing-up ridging prevents sporangia from washing down into tuber beds",
        "Utilize Late Blight forecasting alerts during winter months"
      ],
      affectedYieldEstimate: "50% - 80% total crop collapse if unmanaged in 5-7 days"
    }
  }
];
