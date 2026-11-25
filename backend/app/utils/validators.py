import re

def is_valid_email(email: str) -> bool:
    regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    return bool(re.match(regex, email))

def is_valid_phone(phone: str) -> bool:
    cleaned = re.sub(r"[^\d+]", "", phone)
    return len(cleaned) >= 10

def validate_npk(nitrogen: float, phosphorus: float, potassium: float, ph: float) -> tuple[bool, str]:
    if not (0 <= nitrogen <= 400):
        return False, "Nitrogen (N) must be between 0 and 400 kg/ha"
    if not (0 <= phosphorus <= 250):
        return False, "Phosphorus (P) must be between 0 and 250 kg/ha"
    if not (0 <= potassium <= 400):
        return False, "Potassium (K) must be between 0 and 400 kg/ha"
    if not (3.0 <= ph <= 10.0):
        return False, "pH must be between 3.0 and 10.0"
    return True, "Valid"
