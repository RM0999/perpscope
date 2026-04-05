import httpx

HYPERLIQUID_API = "https://api.hyperliquid.xyz/info"


async def post_info(payload: dict) -> dict:
    """Send a POST request to the Hyperliquid info endpoint."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(HYPERLIQUID_API, json=payload, timeout=10.0)
        resp.raise_for_status()
        return resp.json()


async def get_clearinghouse_state(address: str) -> dict:
    """Fetch wallet positions via clearinghouseState."""
    return await post_info({"type": "clearinghouseState", "user": address})


async def get_open_orders(address: str) -> list:
    """Fetch open orders (TP/SL levels) via frontendOpenOrders."""
    return await post_info({"type": "frontendOpenOrders", "user": address})


async def get_user_fills(address: str) -> list:
    """Fetch trade history via userFills."""
    return await post_info({"type": "userFills", "user": address})


async def get_leaderboard() -> list:
    """Fetch top traders from leaderboard."""
    return await post_info({"type": "leaderboard"})


async def get_vault_summaries() -> list:
    """Fetch vault leader addresses."""
    return await post_info({"type": "vaultSummaries"})
