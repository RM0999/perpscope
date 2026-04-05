from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_user_fills

router = APIRouter()


@router.get("/trades/{wallet}")
async def trades(wallet: str):
    try:
        data = await get_user_fills(wallet)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    trades_list = []
    for fill in data[:100]:  # limit to most recent 100
        trades_list.append({
            "time": fill.get("time", ""),
            "coin": fill.get("coin", ""),
            "side": fill.get("side", ""),
            "size": float(fill.get("sz", 0)),
            "price": float(fill.get("px", 0)),
            "fee": float(fill.get("fee", 0)),
            "closedPnl": float(fill.get("closedPnl", 0)),
        })

    return {"wallet": wallet, "trades": trades_list}
