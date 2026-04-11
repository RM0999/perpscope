import asyncio

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_clearinghouse_state, get_open_orders

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
    takeProfitPrice: float | None = None
    stopLossPrice: float | None = None


class AccountSummary(BaseModel):
    accountValue: float
    totalMarginUsed: float
    totalNtlPos: float
    withdrawable: float


class PositionsResponse(BaseModel):
    positions: list[Position]
    accountSummary: AccountSummary


def _build_tp_sl_map(orders: list) -> dict[str, dict]:
    """Cross-reference open orders to extract TP/SL per coin."""
    tp_sl: dict[str, dict] = {}
    for order in orders:
        coin = order.get("coin", "")
        if coin not in tp_sl:
            tp_sl[coin] = {"tp": None, "sl": None}
        otype = order.get("orderType", "")
        trigger = order.get("triggerPx", None)
        if "Take Profit" in otype and trigger:
            tp_sl[coin]["tp"] = float(trigger)
        elif "Stop" in otype and order.get("reduceOnly", False) and trigger:
            tp_sl[coin]["sl"] = float(trigger)
    return tp_sl


@router.get("/positions/{address}", response_model=PositionsResponse)
async def fetch_positions(address: str):
    try:
        state, orders = await asyncio.gather(
            get_clearinghouse_state(address),
            get_open_orders(address),
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    tp_sl = _build_tp_sl_map(orders if isinstance(orders, list) else [])

    # Parse account summary from marginSummary
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
    return PositionsResponse(positions=positions, accountSummary=account_summary)
