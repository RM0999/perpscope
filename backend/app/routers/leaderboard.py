from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_leaderboard

router = APIRouter()


class LeaderboardEntry(BaseModel):
    rank: int
    address: str
    pnl: float
    roi: float
    volume: float


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def fetch_leaderboard():
    try:
        data = await get_leaderboard()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    entries = []
    leaders = data if isinstance(data, list) else data.get("leaderboardRows", [])
    for i, row in enumerate(leaders):
        entries.append(
            LeaderboardEntry(
                rank=i + 1,
                address=row.get("ethAddress", row.get("address", "")),
                pnl=float(row.get("accountValue", row.get("pnl", 0))),
                roi=float(row.get("roi", 0)) * 100,
                volume=float(row.get("volume", 0)),
            )
        )
    return entries
