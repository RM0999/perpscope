"use client";

import { useState } from "react";

const WALLETS = [
  { label: "HyperWhale", address: "0x1a2b...f8e9" },
  { label: "DeltaMaster", address: "0x3c4d...a1b2" },
  { label: "LevKing", address: "0x5e6f...c3d4" },
];

const STATS = [
  { label: "Total PnL", value: "+$124,830", color: "text-accent-green" },
  { label: "Open Positions", value: "7", color: "text-text-primary" },
  { label: "Win Rate", value: "68.4%", color: "text-accent-yellow" },
  { label: "24h Volume", value: "$2.4M", color: "text-accent-blue" },
];

const POSITIONS = [
  {
    side: "LONG",
    pair: "BTC-PERP",
    size: "$48,200",
    leverage: "10x",
    marginMode: "Cross",
    pnl: "+$3,241.50",
    pnlPositive: true,
  },
  {
    side: "SHORT",
    pair: "ETH-PERP",
    size: "$22,100",
    leverage: "5x",
    marginMode: "Isolated",
    pnl: "-$812.30",
    pnlPositive: false,
  },
  {
    side: "LONG",
    pair: "SOL-PERP",
    size: "$15,600",
    leverage: "20x",
    marginMode: "Cross",
    pnl: "+$1,087.20",
    pnlPositive: true,
  },
  {
    side: "LONG",
    pair: "DOGE-PERP",
    size: "$8,400",
    leverage: "3x",
    marginMode: "Isolated",
    pnl: "+$156.80",
    pnlPositive: true,
  },
  {
    side: "SHORT",
    pair: "ARB-PERP",
    size: "$12,300",
    leverage: "7x",
    marginMode: "Cross",
    pnl: "-$421.60",
    pnlPositive: false,
  },
  {
    side: "LONG",
    pair: "AVAX-PERP",
    size: "$6,800",
    leverage: "15x",
    marginMode: "Isolated",
    pnl: "+$892.40",
    pnlPositive: true,
  },
  {
    side: "SHORT",
    pair: "LINK-PERP",
    size: "$9,500",
    leverage: "4x",
    marginMode: "Cross",
    pnl: "+$234.10",
    pnlPositive: true,
  },
];

const NEWS_ITEMS = [
  {
    time: "2m ago",
    tag: "DIRECT",
    text: "HyperWhale opened 10x LONG on BTC-PERP worth $48.2K",
    tagColor: "text-accent-green",
  },
  {
    time: "8m ago",
    tag: "COIN",
    text: "BTC breaks $68K resistance, funding rates spike to 0.03%",
    tagColor: "text-accent-blue",
  },
  {
    time: "15m ago",
    tag: "MACRO",
    text: "Fed minutes hint at rate pause — risk assets rally",
    tagColor: "text-accent-yellow",
  },
  {
    time: "22m ago",
    tag: "DIRECT",
    text: "DeltaMaster closed ETH-PERP short at -$812 loss",
    tagColor: "text-accent-green",
  },
  {
    time: "31m ago",
    tag: "COIN",
    text: "SOL TVL hits new ATH, DEX volume surges 40%",
    tagColor: "text-accent-blue",
  },
  {
    time: "45m ago",
    tag: "MACRO",
    text: "US CPI data release in 2 hours — volatility expected",
    tagColor: "text-accent-yellow",
  },
  {
    time: "1h ago",
    tag: "DIRECT",
    text: "LevKing adds to AVAX-PERP position, now 15x leveraged",
    tagColor: "text-accent-green",
  },
  {
    time: "1h ago",
    tag: "COIN",
    text: "ARB token unlock schedule — 1.1B tokens over next month",
    tagColor: "text-accent-blue",
  },
];

type NewsFilter = "ALL" | "DIRECT" | "COIN" | "MACRO";

export default function TrackerPage() {
  const [newsFilter, setNewsFilter] = useState<NewsFilter>("ALL");
  const [activeWallet, setActiveWallet] = useState(0);

  const filteredNews =
    newsFilter === "ALL"
      ? NEWS_ITEMS
      : NEWS_ITEMS.filter((n) => n.tag === newsFilter);

  return (
    <div className="flex gap-5 h-[calc(100vh-105px)]">
      {/* Left Column — Positions */}
      <div className="flex-1 flex flex-col min-w-0 overflow-auto">
        {/* Wallet Chips */}
        <div className="flex items-center gap-2 mb-4">
          {WALLETS.map((w, i) => (
            <button
              key={w.address}
              onClick={() => setActiveWallet(i)}
              className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                activeWallet === i
                  ? "bg-accent-green/10 border-accent-green text-accent-green"
                  : "bg-bg-card border-border text-text-secondary hover:border-text-muted"
              }`}
            >
              {w.label}
              <span className="ml-1.5 text-text-muted">{w.address}</span>
            </button>
          ))}
          <button className="px-3 py-1.5 rounded text-xs border border-dashed border-border text-text-muted hover:border-text-secondary hover:text-text-secondary transition-colors">
            + Add
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="bg-bg-card border border-border rounded px-4 py-3"
            >
              <div className="text-[10px] text-text-muted uppercase tracking-widest mb-1">
                {s.label}
              </div>
              <div className={`text-lg font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Positions Table */}
        <div className="bg-bg-card border border-border rounded flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["SIDE", "PAIR", "SIZE", "LEV", "MARGIN", "PNL"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[10px] text-text-muted uppercase tracking-widest font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {POSITIONS.map((p, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-bg-hover/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold ${
                        p.side === "LONG"
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {p.side}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-primary font-semibold text-xs">
                    {p.pair}
                  </td>
                  <td className="px-4 py-3 text-text-primary text-xs">
                    {p.size}
                  </td>
                  <td className="px-4 py-3 text-accent-yellow text-xs font-medium">
                    {p.leverage}
                  </td>
                  <td className="px-4 py-3 text-text-secondary text-xs">
                    {p.marginMode}
                  </td>
                  <td
                    className={`px-4 py-3 text-xs font-semibold ${
                      p.pnlPositive ? "text-accent-green" : "text-accent-red"
                    }`}
                  >
                    {p.pnl}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Column — News Feed */}
      <div className="w-[220px] flex-shrink-0 flex flex-col border-l border-border pl-4">
        <div className="text-[10px] text-text-muted uppercase tracking-widest font-medium mb-3">
          Live Feed
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-3">
          {(["ALL", "DIRECT", "COIN", "MACRO"] as NewsFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setNewsFilter(f)}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${
                newsFilter === f
                  ? "bg-accent-green/15 text-accent-green"
                  : "text-text-muted hover:text-text-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* News Items */}
        <div className="flex-1 overflow-auto space-y-2">
          {filteredNews.map((item, i) => (
            <div
              key={i}
              className="bg-bg-card border border-border rounded px-3 py-2"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[9px] font-bold ${item.tagColor}`}>
                  {item.tag}
                </span>
                <span className="text-[9px] text-text-muted">{item.time}</span>
              </div>
              <p className="text-[11px] text-text-secondary leading-snug">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
