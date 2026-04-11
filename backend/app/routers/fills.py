from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.services.hyperliquid import get_user_fills

router = APIRouter()


class Fill(BaseModel):
    coin: str
    side: str
    dir: str | None = None
    size: float
    price: float
    time: str
    fee: float
    closedPnl: float


@router.get("/fills/{address}", response_model=list[Fill])
async def fetch_fills(address: str, limit: int = Query(default=200, le=2000)):
    try:
        data = await get_user_fills(address)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    fills = []
    for fill in (data if isinstance(data, list) else [])[:limit]:
        fills.append(
            Fill(
                coin=fill.get("coin", ""),
                side=fill.get("side", ""),
                dir=fill.get("dir", None),
                size=float(fill.get("sz", 0)),
                price=float(fill.get("px", 0)),
                time=str(fill.get("time", "")),
                fee=float(fill.get("fee", 0)),
                closedPnl=float(fill.get("closedPnl", 0)),
            )
        )
    return fills
