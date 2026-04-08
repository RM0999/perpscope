"use client";

import { useState } from "react";

type NewsCategory = "all" | "direct" | "coin" | "macro";

const categoryColors: Record<string, string> = {
  direct: "var(--accent-green)",
  coin: "var(--accent-blue)",
  macro: "var(--accent-yellow)",
};

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: NewsCategory;
  url: string;
  minutesAgo: number;
}

function timeAgoStr(minutes: number): string {
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
}

// Static news data — replace with a real news API when available
const NEWS_ITEMS: NewsItem[] = [
  { id: "1", title: "Hyperliquid launches new pre-launch market for FRIEND token", summary: "Hyperliquid has opened a pre-launch perpetual market for FRIEND with up to 5x leverage. Trading is now live.", source: "Hyperliquid", category: "direct", url: "#", minutesAgo: 12 },
  { id: "2", title: "Bitcoin breaks above $97,000 as ETF inflows surge", summary: "BTC rallied past $97K with over $800M in spot ETF inflows yesterday. Open interest on Hyperliquid BTC-PERP hit a new ATH.", source: "CoinDesk", category: "coin", url: "#", minutesAgo: 35 },
  { id: "3", title: "Fed holds rates steady, signals potential cut in June", summary: "The FOMC voted unanimously to keep rates at 4.25-4.50%. Chair Powell hinted at easing if inflation data continues to moderate.", source: "Reuters", category: "macro", url: "#", minutesAgo: 60 },
  { id: "4", title: "Ethereum Pectra upgrade confirmed for Q2 2026", summary: "The Ethereum Foundation confirmed the Pectra hard fork activation date. ETH funding rates on major perp DEXs have turned positive.", source: "The Block", category: "coin", url: "#", minutesAgo: 80 },
  { id: "5", title: "HIP-3 proposal: dynamic funding rate adjustments", summary: "The community is voting on HIP-3, which proposes tighter funding rate bands during low volatility periods to improve capital efficiency.", source: "Hyperliquid Governance", category: "direct", url: "#", minutesAgo: 120 },
  { id: "6", title: "SOL staking yield reaches 8.2% as validator count grows", summary: "Solana staking returns have climbed to 8.2% APY. SOL-PERP open interest on Hyperliquid is up 40% this week.", source: "CoinGecko", category: "coin", url: "#", minutesAgo: 180 },
  { id: "7", title: "EU MiCA regulations go into full enforcement", summary: "The Markets in Crypto-Assets regulation is now fully enforced across all EU member states, impacting stablecoin issuers and exchanges.", source: "Financial Times", category: "macro", url: "#", minutesAgo: 240 },
  { id: "8", title: "ARB airdrop season 2 details leaked ahead of official announcement", summary: "On-chain analysts spotted a new distribution contract deployment. ARB-PERP saw a 15% spike in volume on Hyperliquid.", source: "Blockworks", category: "coin", url: "#", minutesAgo: 300 },
  { id: "9", title: "Hyperliquid 24h volume surpasses $4.2B", summary: "The exchange recorded its highest single-day volume this quarter, driven by volatility in BTC and ETH perpetuals.", source: "Hyperliquid", category: "direct", url: "#", minutesAgo: 360 },
  { id: "10", title: "Japan pension fund exploring 1% Bitcoin allocation", summary: "Japan's GPIF, the world's largest pension fund, disclosed a research initiative into digital asset allocation strategies.", source: "Bloomberg", category: "macro", url: "#", minutesAgo: 480 },
  { id: "11", title: "US Dollar Index drops to 18-month low", summary: "DXY fell to 98.3, its lowest level since October 2024. Crypto markets have historically rallied during periods of dollar weakness.", source: "CNBC", category: "macro", url: "#", minutesAgo: 600 },
];

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("all");
  const [search, setSearch] = useState("");

  const categories: { key: NewsCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "direct", label: "Direct" },
    { key: "coin", label: "Coin" },
    { key: "macro", label: "Macro" },
  ];

  const filtered = NEWS_ITEMS.filter((item) => {
    if (category !== "all" && item.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return item.title.toLowerCase().includes(q) || item.summary.toLowerCase().includes(q) || item.source.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}># News</h1>

      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 12px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", color: "var(--text-primary)", fontFamily: "inherit", fontSize: "13px", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            style={{
              padding: "6px 14px",
              background: category === c.key ? "var(--accent-green)" : "var(--bg-card)",
              color: category === c.key ? "var(--bg-primary)" : "var(--text-secondary)",
              border: `1px solid ${category === c.key ? "var(--accent-green)" : "var(--border)"}`,
              borderRadius: "4px",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: category === c.key ? 600 : 400,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px", margin: 0 }}>
            {search ? "No news matching your search" : "No news available"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((item) => (
            <div key={item.id} style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "10px", fontWeight: 600, color: "var(--bg-primary)", background: categoryColors[item.category] || "var(--text-muted)" }}>
                  {item.category.toUpperCase()}
                </span>
                <span style={{ padding: "2px 8px", borderRadius: "2px", fontSize: "10px", color: "var(--text-secondary)", background: "var(--bg-hover)", border: "1px solid var(--border)" }}>
                  {item.source}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto" }}>
                  {timeAgoStr(item.minutesAgo)}
                </span>
              </div>
              <div style={{ color: "var(--text-primary)", fontSize: "14px", fontWeight: 600, lineHeight: "1.4", marginBottom: "6px" }}>
                {item.title}
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
                {item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
