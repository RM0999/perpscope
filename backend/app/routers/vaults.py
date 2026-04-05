from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.hyperliquid import get_vault_summaries

router = APIRouter()


class Vault(BaseModel):
    name: str
    vaultAddress: str
    leaderAddress: str
    tvl: float
    totalPnl: float
    apr: Optional[float] = None
    followerCount: Optional[int] = None


@router.get("/vaults", response_model=list[Vault])
async def fetch_vaults():
    """Fetch vault summaries from Hyperliquid and return parsed results."""
    try:
        data = await get_vault_summaries()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Hyperliquid API error: {e}")

    vaults = []
    entries = data if isinstance(data, list) else []
    for v in entries:
        summary = v.get("summary", v) if isinstance(v, dict) else {}
        try:
            vaults.append(
                Vault(
                    name=summary.get("name", "Unknown"),
                    vaultAddress=summary.get("vaultAddress", v.get("vaultAddress", "")),
                    leaderAddress=summary.get("leader", summary.get("leaderAddress", "")),
                    tvl=float(summary.get("tvl", 0)),
                    totalPnl=float(summary.get("allTimePnl", summary.get("totalPnl", 0))),
                    apr=float(apr) if (apr := summary.get("apr")) is not None else None,
                    followerCount=int(fc) if (fc := summary.get("followerCount")) is not None else None,
                )
            )
        except (ValueError, TypeError):
            continue

    # Sort by TVL descending
    vaults.sort(key=lambda v: v.tvl, reverse=True)
    return vaults
