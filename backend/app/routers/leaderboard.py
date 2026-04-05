from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_leaderboard

router = APIRouter()


class WindowPerformance(BaseModel):
    day: float | None = None
    week: float | None = None
    month: float | None = None
    allTime: float | None = None


class LeaderboardEntry(BaseModel):
    rank: int
    address: str
    displayName: str | None = None
    accountValue: float = 0
    pnl: float
    roi: float
    volume: float
    windowPerformances: WindowPerformance | None = None


def _parse_window_performances(perfs: list) -> WindowPerformance:
    """Parse windowPerformances array into structured object."""
    result: dict[str, float | None] = {}
    for perf in perfs:
        if not isinstance(perf, list) or len(perf) < 2:
            continue
        window = perf[0]
        pnl_data = perf[1] if isinstance(perf[1], dict) else {}
        pnl_val = pnl_data.get("pnl", None)
        if pnl_val is not None:
            pnl_val = float(pnl_val)
        if window == "day":
            result["day"] = pnl_val
        elif window == "week":
            result["week"] = pnl_val
        elif window == "month":
            result["month"] = pnl_val
        elif window == "allTime":
            result["allTime"] = pnl_val
    return WindowPerformance(**result)


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
async def fetch_leaderboard():
    try:
        data = await get_leaderboard()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    entries = []
    leaders = data if isinstance(data, list) else data.get("leaderboardRows", [])
    for i, row in enumerate(leaders):
        window_perfs = row.get("windowPerformances", [])
        entries.append(
            LeaderboardEntry(
                rank=i + 1,
                address=row.get("ethAddress", row.get("address", "")),
                displayName=row.get("displayName", None),
                accountValue=float(row.get("accountValue", 0)),
                pnl=float(row.get("accountValue", row.get("pnl", 0))),
                roi=float(row.get("roi", 0)) * 100,
                volume=float(row.get("volume", 0)),
                windowPerformances=_parse_window_performances(window_perfs) if window_perfs else None,
            )
        )
    return entries
