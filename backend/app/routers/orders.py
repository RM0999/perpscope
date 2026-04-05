from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_open_orders

router = APIRouter()


@router.get("/orders/{address}")
async def fetch_orders(address: str):
    try:
        data = await get_open_orders(address)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    return data if isinstance(data, list) else []
