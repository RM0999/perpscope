from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_clearinghouse_state

router = APIRouter()


class Position(BaseModel):
    coin: str
    size: float
    entryPrice: float
    markPrice: float
    leverage: float
    marginMode: str
    unrealizedPnl: float
    liquidationPrice: float | None


@router.get("/positions/{address}", response_model=list[Position])
async def fetch_positions(address: str):
    try:
        data = await get_clearinghouse_state(address)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    positions = []
    for asset in data.get("assetPositions", []):
        pos = asset.get("position", {})
        if float(pos.get("szi", 0)) == 0:
            continue
        positions.append(
            Position(
                coin=pos.get("coin", ""),
                size=float(pos.get("szi", 0)),
                entryPrice=float(pos.get("entryPx", 0)),
                markPrice=float(pos.get("markPx", 0)),
                leverage=float(pos.get("leverage", {}).get("value", 0)),
                marginMode=pos.get("leverage", {}).get("type", "cross"),
                unrealizedPnl=float(pos.get("unrealizedPnl", 0)),
                liquidationPrice=float(liq) if (liq := pos.get("liquidationPx")) else None,
            )
        )
    return positions
