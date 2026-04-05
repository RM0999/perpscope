import asyncio
import json
import time as _time

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response
from pydantic import BaseModel

from app.services.hyperliquid import (
    get_clearinghouse_state,
    get_open_orders,
    get_user_fills,
    get_leaderboard,
)
from app.routers.positions import _build_tp_sl_map, AccountSummary, Position

router = APIRouter()

# Simple in-memory cache
_cache: dict[str, tuple[float, list]] = {}
CACHE_TTL = 60  # seconds


class WalletSnapshot(BaseModel):
    address: str
    displayName: str | None = None
    accountSummary: AccountSummary
    positions: list[Position]
    recentFills: list[dict]


async def _fetch_wallet(address: str, semaphore: asyncio.Semaphore) -> WalletSnapshot | None:
    """Fetch full data for a single wallet."""
    async with semaphore:
        try:
            state, orders, fills = await asyncio.gather(
                get_clearinghouse_state(address),
                get_open_orders(address),
                get_user_fills(address),
            )
        except Exception:
            return None

    tp_sl = _build_tp_sl_map(orders if isinstance(orders, list) else [])

    margin = state.get("marginSummary", {})
    account_summary = AccountSummary(
        accountValue=float(margin.get("accountValue", 0)),
        totalMarginUsed=float(margin.get("totalMarginUsed", 0)),
        totalNtlPos=float(margin.get("totalNtlPos", 0)),
        withdrawable=float(margin.get("withdrawable", 0)),
    )

    positions = []
    for asset in state.get("assetPositions", []):
        pos = asset.get("position", {})
        if float(pos.get("szi", 0)) == 0:
            continue
        coin = pos.get("coin", "")
        coin_tp_sl = tp_sl.get(coin, {})
        positions.append(
            Position(
                coin=coin,
                size=float(pos.get("szi", 0)),
                entryPrice=float(pos.get("entryPx", 0)),
                markPrice=float(pos.get("markPx", 0)),
                leverage=float(pos.get("leverage", {}).get("value", 0)),
                marginMode=pos.get("leverage", {}).get("type", "cross"),
                unrealizedPnl=float(pos.get("unrealizedPnl", 0)),
                liquidationPrice=float(liq) if (liq := pos.get("liquidationPx")) else None,
                takeProfitPrice=coin_tp_sl.get("tp"),
                stopLossPrice=coin_tp_sl.get("sl"),
            )
        )

    recent_fills = []
    for fill in (fills if isinstance(fills, list) else [])[:10]:
        recent_fills.append({
            "coin": fill.get("coin", ""),
            "side": fill.get("side", ""),
            "dir": fill.get("dir", None),
            "size": fill.get("sz", "0"),
            "price": fill.get("px", "0"),
            "closedPnl": fill.get("closedPnl", "0"),
            "time": fill.get("time", ""),
        })

    return WalletSnapshot(
        address=address,
        accountSummary=account_summary,
        positions=positions,
        recentFills=recent_fills,
    )


@router.get("/export/top-traders")
async def export_top_traders(
    count: int = Query(default=20, le=50),
    download: bool = Query(default=False),
):
    """Fetch full data for top N leaderboard wallets."""
    cache_key = f"top-traders-{count}"
    now = _time.time()

    # Check cache
    if cache_key in _cache:
        cached_time, cached_data = _cache[cache_key]
        if now - cached_time < CACHE_TTL:
            if download:
                return Response(
                    content=json.dumps(cached_data, indent=2),
                    media_type="application/json",
                    headers={"Content-Disposition": "attachment; filename=perpscope_data.json"},
                )
            return cached_data

    # Fetch leaderboard
    try:
        lb_data = await get_leaderboard()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Leaderboard error: {e}")

    rows = lb_data if isinstance(lb_data, list) else lb_data.get("leaderboardRows", [])
    addresses = []
    names = {}
    for row in rows[:count]:
        addr = row.get("ethAddress", row.get("address", ""))
        if addr:
            addresses.append(addr)
            names[addr] = row.get("displayName", None)

    # Fetch all wallets concurrently with rate limiting
    semaphore = asyncio.Semaphore(10)
    results = await asyncio.gather(
        *[_fetch_wallet(addr, semaphore) for addr in addresses]
    )

    snapshots = []
    for snap in results:
        if snap is not None:
            snap.displayName = names.get(snap.address)
            snapshots.append(snap.model_dump())

    # Update cache
    _cache[cache_key] = (now, snapshots)

    if download:
        return Response(
            content=json.dumps(snapshots, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=perpscope_data.json"},
        )
    return snapshots
