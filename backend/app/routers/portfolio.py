from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_user_fills

router = APIRouter()


@router.get("/portfolio/{wallet}")
async def portfolio(wallet: str):
    try:
        fills = await get_user_fills(wallet)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    trades = []
    total_pnl = 0.0
    wins = 0
    losses = 0
    win_amounts = []
    loss_amounts = []

    for fill in fills[:200]:
        pnl = float(fill.get("closedPnl", 0))
        total_pnl += pnl
        if pnl > 0:
            wins += 1
            win_amounts.append(pnl)
        elif pnl < 0:
            losses += 1
            loss_amounts.append(pnl)

        trades.append({
            "time": fill.get("time", ""),
            "coin": fill.get("coin", ""),
            "side": fill.get("side", ""),
            "size": float(fill.get("sz", 0)),
            "price": float(fill.get("px", 0)),
            "pnl": pnl,
        })

    total_trades = wins + losses
    stats = {
        "totalPnl": total_pnl,
        "winRate": (wins / total_trades * 100) if total_trades > 0 else 0,
        "totalTrades": total_trades,
        "avgWin": (sum(win_amounts) / len(win_amounts)) if win_amounts else 0,
        "avgLoss": (sum(loss_amounts) / len(loss_amounts)) if loss_amounts else 0,
        "bestTrade": max(win_amounts) if win_amounts else 0,
        "worstTrade": min(loss_amounts) if loss_amounts else 0,
    }

    return {"wallet": wallet, "trades": trades, "stats": stats}
