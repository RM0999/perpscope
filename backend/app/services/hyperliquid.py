import httpx

API_URL = "https://api.hyperliquid.xyz/info"


async def _post(payload: dict) -> dict:
    async with httpx.AsyncClient() as client:
        resp = await client.post(API_URL, json=payload, timeout=10.0)
        resp.raise_for_status()
        return resp.json()


async def get_clearinghouse_state(wallet: str) -> dict:
    return await _post({"type": "clearinghouseState", "user": wallet})


async def get_open_orders(wallet: str) -> list:
    return await _post({"type": "frontendOpenOrders", "user": wallet})


async def get_user_fills(wallet: str) -> list:
    return await _post({"type": "userFills", "user": wallet})


async def get_leaderboard() -> dict:
    return await _post({"type": "leaderboard"})


async def get_vault_summaries() -> list:
    return await _post({"type": "vaultSummaries"})
