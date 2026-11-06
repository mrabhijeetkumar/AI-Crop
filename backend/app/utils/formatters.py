from datetime import datetime

def format_currency(amount: float, currency: str = "₹") -> str:
    return f"{currency}{amount:,.2f}"

def format_area(acres: float, unit: str = "Acres") -> str:
    if unit.lower() == "hectares":
        return f"{acres * 0.404686:.2f} ha"
    return f"{acres:.2f} Acres"

def format_date(dt: datetime, fmt: str = "%d %b %Y") -> str:
    if not dt:
        return ""
    return dt.strftime(fmt)
