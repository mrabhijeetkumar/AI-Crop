from typing import Optional
from fastapi import APIRouter, Query, Body
from app.services.market_service import MarketService

router = APIRouter(prefix="/market", tags=["Market Intelligence"])

@router.get("")
@router.get("/")
async def get_market_data(
    state: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    crop: Optional[str] = Query(None),
    apiKey: Optional[str] = Query(None)
):
    return await MarketService.get_commodities(
        state=state,
        district=district,
        category=category,
        crop=crop
    )

@router.get("/overview")
async def get_market_overview(
    mandi: str = Query("Sasaram APMC Mandi"),
    state: str = Query("Bihar")
):
    return await MarketService.get_market_overview(mandi=mandi, state=state)

@router.post("/ai-strategy")
async def get_market_ai_strategy(body: dict = Body(...)):
    return await MarketService.generate_ai_strategy(body)
