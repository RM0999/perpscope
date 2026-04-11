from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Optional

from fastapi import APIRouter, Query
from pydantic import BaseModel

router = APIRouter()


class NewsCategory(str, Enum):
    all = "all"
    direct = "direct"
    coin = "coin"
    macro = "macro"


class NewsItem(BaseModel):
    id: str
    title: str
    summary: str
    source: str
    url: str
    category: NewsCategory
    coin: Optional[str] = None
    timestamp: str


def _generate_mock_news() -> list[dict]:
    """Generate realistic mock news items for the MVP.

    In production this would pull from CoinGecko trending, Hyperliquid
    announcements, and crypto news aggregators.
    """
    now = datetime.now(timezone.utc)

    items = [
        # Direct / Hyperliquid-specific
        {
            "id": "hl-001",
            "title": "Hyperliquid launches new pre-launch market for FRIEND token",
            "summary": "Hyperliquid has opened a pre-launch perpetual market for FRIEND with up to 5x leverage. Trading is now live.",
            "source": "Hyperliquid",
            "url": "https://app.hyperliquid.xyz",
            "category": "direct",
            "coin": "FRIEND",
            "timestamp": (now - timedelta(minutes=12)).isoformat(),
        },
        {
            "id": "hl-002",
            "title": "HIP-3 proposal: dynamic funding rate adjustments",
            "summary": "The community is voting on HIP-3, which proposes tighter funding rate bands during low volatility periods to improve capital efficiency.",
            "source": "Hyperliquid Governance",
            "url": "https://app.hyperliquid.xyz",
            "category": "direct",
            "coin": None,
            "timestamp": (now - timedelta(hours=2)).isoformat(),
        },
        {
            "id": "hl-003",
            "title": "Hyperliquid 24h volume surpasses $4.2B",
            "summary": "The exchange recorded its highest single-day volume this quarter, driven by volatility in BTC and ETH perpetuals.",
            "source": "Hyperliquid",
            "url": "https://app.hyperliquid.xyz",
            "category": "direct",
            "coin": None,
            "timestamp": (now - timedelta(hours=6)).isoformat(),
        },
        # Coin-specific
        {
            "id": "coin-001",
            "title": "Bitcoin breaks above $97,000 as ETF inflows surge",
            "summary": "BTC rallied past $97K with over $800M in spot ETF inflows yesterday. Open interest on Hyperliquid BTC-PERP hit a new ATH.",
            "source": "CoinDesk",
            "url": "https://coindesk.com",
            "category": "coin",
            "coin": "BTC",
            "timestamp": (now - timedelta(minutes=35)).isoformat(),
        },
        {
            "id": "coin-002",
            "title": "Ethereum Pectra upgrade confirmed for Q2 2026",
            "summary": "The Ethereum Foundation confirmed the Pectra hard fork activation date. ETH funding rates on major perp DEXs have turned positive.",
            "source": "The Block",
            "url": "https://theblock.co",
            "category": "coin",
            "coin": "ETH",
            "timestamp": (now - timedelta(hours=1, minutes=20)).isoformat(),
        },
        {
            "id": "coin-003",
            "title": "SOL staking yield reaches 8.2% as validator count grows",
            "summary": "Solana staking returns have climbed to 8.2% APY. SOL-PERP open interest on Hyperliquid is up 40% this week.",
            "source": "CoinGecko",
            "url": "https://coingecko.com",
            "category": "coin",
            "coin": "SOL",
            "timestamp": (now - timedelta(hours=3)).isoformat(),
        },
        {
            "id": "coin-004",
            "title": "ARB airdrop season 2 details leaked ahead of official announcement",
            "summary": "On-chain analysts spotted a new distribution contract deployment. ARB-PERP saw a 15% spike in volume on Hyperliquid.",
            "source": "Blockworks",
            "url": "https://blockworks.co",
            "category": "coin",
            "coin": "ARB",
            "timestamp": (now - timedelta(hours=5)).isoformat(),
        },
        # Macro
        {
            "id": "macro-001",
            "title": "Fed holds rates steady, signals potential cut in June",
            "summary": "The FOMC voted unanimously to keep rates at 4.25-4.50%. Chair Powell hinted at easing if inflation data continues to moderate.",
            "source": "Reuters",
            "url": "https://reuters.com",
            "category": "macro",
            "coin": None,
            "timestamp": (now - timedelta(hours=1)).isoformat(),
        },
        {
            "id": "macro-002",
            "title": "EU MiCA regulations go into full enforcement",
            "summary": "The Markets in Crypto-Assets regulation is now fully enforced across all EU member states, impacting stablecoin issuers and exchanges.",
            "source": "Financial Times",
            "url": "https://ft.com",
            "category": "macro",
            "coin": None,
            "timestamp": (now - timedelta(hours=4)).isoformat(),
        },
        {
            "id": "macro-003",
            "title": "Japan pension fund exploring 1% Bitcoin allocation",
            "summary": "Japan's GPIF, the world's largest pension fund, disclosed a research initiative into digital asset allocation strategies.",
            "source": "Bloomberg",
            "url": "https://bloomberg.com",
            "category": "macro",
            "coin": "BTC",
            "timestamp": (now - timedelta(hours=8)).isoformat(),
        },
        {
            "id": "macro-004",
            "title": "US Dollar Index drops to 18-month low",
            "summary": "DXY fell to 98.3, its lowest level since October 2024. Crypto markets have historically rallied during periods of dollar weakness.",
            "source": "CNBC",
            "url": "https://cnbc.com",
            "category": "macro",
            "coin": None,
            "timestamp": (now - timedelta(hours=10)).isoformat(),
        },
    ]

    return items


@router.get("/news", response_model=list[NewsItem])
async def fetch_news(
    category: NewsCategory = Query(default=NewsCategory.all, description="Filter by news category"),
):
    """Fetch crypto news feed, optionally filtered by category."""
    items = _generate_mock_news()

    if category != NewsCategory.all:
        items = [item for item in items if item["category"] == category.value]

    # Sort by timestamp descending (most recent first)
    items.sort(key=lambda x: x["timestamp"], reverse=True)

    return [NewsItem(**item) for item in items]
