from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_open_orders

router = APIRouter()


class Order(BaseModel):
    coin: str
    side: str
    size: float
    limitPrice: float
    triggerPrice: float | None = None
    orderType: str
    reduceOnly: bool = False


@router.get("/orders/{address}", response_model=list[Order])
async def fetch_orders(address: str):
    try:
        data = await get_open_orders(address)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    orders = []
    for o in data if isinstance(data, list) else []:
        orders.append(
            Order(
                coin=o.get("coin", ""),
                side=o.get("side", ""),
                size=float(o.get("sz", 0)),
                limitPrice=float(o.get("limitPx", 0)),
                triggerPrice=float(tp) if (tp := o.get("triggerPx")) else None,
                orderType=o.get("orderType", ""),
                reduceOnly=bool(o.get("reduceOnly", False)),
            )
        )
    return orders
