CROP_TYPES = [
    "Wheat", "Rice (Paddy)", "Maize", "Cotton", "Sugarcane", 
    "Soybean", "Groundnut", "Mustard", "Chickpea (Gram)", "Potato", 
    "Tomato", "Onion", "Barley", "Millet (Bajra)", "Sorghum (Jowar)"
]

SOIL_TYPES = [
    "Alluvial Soil", "Black Cotton Soil", "Red & Yellow Soil", 
    "Laterite Soil", "Sandy Loam Soil", "Clay Soil", "Saline Soil"
]

CROP_GROWTH_STAGES = [
    "Sowing", "Germination", "Vegetative", "Flowering", 
    "Grain Formation", "Maturing", "Harvest Ready", "Harvested"
]

TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"]
TASK_STATUSES = ["Pending", "In Progress", "Completed", "Cancelled"]

DEFAULT_NPK_RANGES = {
    "Wheat": {"N": (80, 120), "P": (40, 60), "K": (40, 60), "pH": (6.0, 7.5)},
    "Rice (Paddy)": {"N": (100, 150), "P": (50, 70), "K": (50, 70), "pH": (5.5, 7.0)},
    "Cotton": {"N": (90, 140), "P": (45, 65), "K": (45, 65), "pH": (6.5, 8.0)},
    "Maize": {"N": (100, 130), "P": (50, 60), "K": (40, 50), "pH": (5.8, 7.2)},
    "Sugarcane": {"N": (150, 250), "P": (60, 90), "K": (80, 120), "pH": (6.0, 7.5)},
    "Soybean": {"N": (20, 40), "P": (60, 80), "K": (40, 60), "pH": (6.0, 7.0)},
    "Tomato": {"N": (100, 150), "P": (60, 80), "K": (80, 120), "pH": (6.0, 6.8)},
    "Potato": {"N": (120, 180), "P": (80, 100), "K": (100, 150), "pH": (5.0, 6.5)},
    "Mustard": {"N": (60, 90), "P": (30, 45), "K": (20, 30), "pH": (6.0, 7.5)}
}
