from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_clearinghouse_state

router = APIRouter()


@router.get("/positions/{wallet}")
async def positions(wallet: str):
    try:
        data = await get_clearinghouse_state(wallet)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    asset_positions = data.get("assetPositions", [])
    positions = []
    for ap in asset_positions:
        pos = ap.get("position", {})
        size = float(pos.get("szi", 0))
        if size == 0:
            continue
        entry = float(pos.get("entryPx", 0))
        positions.append({
            "coin": pos.get("coin", ""),
            "size": abs(size),
            "entryPrice": entry,
            "markPrice": entry,  # mark price updated via separate call if needed
            "leverage": int(float(ap.get("position", {}).get("leverage", {}).get("value", 1))),
            "unrealizedPnl": float(pos.get("unrealizedPnl", 0)),
            "side": "long" if size > 0 else "short",
        })

    return {"wallet": wallet, "positions": positions}
