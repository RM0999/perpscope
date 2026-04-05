from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_leaderboard

router = APIRouter()


@router.get("/leaderboard")
async def leaderboard():
    try:
        data = await get_leaderboard()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    leaders = []
    leaderboard_rows = data.get("leaderboardRows", [])
    for i, row in enumerate(leaderboard_rows[:50]):
        leaders.append({
            "rank": i + 1,
            "address": row.get("ethAddress", ""),
            "pnl": float(row.get("accountValue", 0)),
            "roi": float(row.get("roi", 0)) * 100,
            "trades": int(row.get("nTrades", 0)),
        })

    return {"leaders": leaders}
