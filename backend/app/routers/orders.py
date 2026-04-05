from fastapi import APIRouter, HTTPException

from app.services.hyperliquid import get_open_orders

router = APIRouter()


@router.get("/orders/{wallet}")
async def orders(wallet: str):
    try:
        data = await get_open_orders(wallet)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    orders_list = []
    for order in data:
        orders_list.append({
            "coin": order.get("coin", ""),
            "side": order.get("side", ""),
            "size": float(order.get("sz", 0)),
            "price": float(order.get("limitPx", 0)),
            "orderType": order.get("orderType", ""),
            "reduceOnly": order.get("reduceOnly", False),
        })

    return {"wallet": wallet, "orders": orders_list}
