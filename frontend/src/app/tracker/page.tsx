"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getPositions,
  getOpenOrders,
  getFills,
  getNews,
  type Position,
  type AccountSummary,
  type Order,
  type Fill,
  type NewsItem,
} from "@/lib/api";

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const categoryColors: Record<string, string> = {
  direct: "var(--accent-green)",
  coin: "var(--accent-blue)",
  macro: "var(--accent-yellow)",
};

const dirColors: Record<string, string> = {
  "Open Long": "var(--accent-green)",
  "Close Short": "var(--accent-green)",
  "Open Short": "var(--accent-red)",
  "Close Long": "var(--accent-red)",
};

export default function TrackerPage() {
  return (
    <Suspense fallback={<div style={{ color: "var(--text-muted)" }}>Loading...</div>}>
      <TrackerContent />
    </Suspense>
  );
}

function TrackerContent() {
  const searchParams = useSearchParams();
  const [address, setAddress] = useState(searchParams.get("address") || "");
  const [positions, setPositions] = useState<Position[]>([]);
  const [accountSummary, setAccountSummary] = useState<AccountSummary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [fills, setFills] = useState<Fill[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsError, setNewsError] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);

  const fetchNews = useCallback(async () => {
    setNewsLoading(true);
    setNewsError("");
    try {
      const data = await getNews();
      setNews(data);
    } catch {
      setNewsError("Failed to load news");
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 30000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  useEffect(() => {
    if (address && !autoLoaded) {
      setAutoLoaded(true);
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleTrack() {
    if (!address) return;
    setLoading(true);
    try {
      const [posResponse, orderData, fillData] = await Promise.all([
        getPositions(address),
        getOpenOrders(address),
        getFills(address, 15),
      ]);
      setPositions(posResponse.positions);
      setAccountSummary(posResponse.accountSummary);
      setOrders(orderData);
      setFills(fillData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        $ Tracker
      </h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="0x... wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          style={{
            flex: 1,
            padding: "10px 12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            fontSize: "13px",
            outline: "none",
          }}
        />
        <button
          onClick={handleTrack}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "var(--accent-green)",
            color: "var(--bg-primary)",
            border: "none",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {loading ? "Loading..." : "Track"}
        </button>
      </div>

      {/* Account Summary */}
      {accountSummary && (
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Account Value", value: `$${accountSummary.accountValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "var(--accent-green)" },
            { label: "Margin Used", value: `$${accountSummary.totalMarginUsed.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "var(--accent-yellow)" },
            { label: "Total Notional", value: `$${accountSummary.totalNtlPos.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "var(--accent-blue)" },
            { label: "Withdrawable", value: `$${accountSummary.withdrawable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "var(--accent-purple)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "12px 16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                flex: 1,
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "10px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                {s.label}
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: s.color }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Left panel: Positions + Orders + Trades */}
        <div style={{ flex: 2 }}>
          <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            Open Positions
          </h2>
          {positions.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
              {address ? "No open positions" : "Enter a wallet address to track"}
            </p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Coin", "Size", "Entry", "Mark", "Lev", "TP", "SL", "uPnL"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px",
                        textAlign: "left",
                        color: "var(--text-muted)",
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "1px",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map((p, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "8px", fontWeight: 600 }}>{p.coin}</td>
                    <td style={{ padding: "8px", color: p.size > 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {p.size > 0 ? "+" : ""}{p.size.toFixed(4)}
                    </td>
                    <td style={{ padding: "8px" }}>${p.entryPrice.toFixed(2)}</td>
                    <td style={{ padding: "8px" }}>${p.markPrice.toFixed(2)}</td>
                    <td style={{ padding: "8px" }}>{p.leverage}x</td>
                    <td style={{ padding: "8px", color: "var(--accent-green)", fontSize: "12px" }}>
                      {p.takeProfitPrice != null ? `$${p.takeProfitPrice.toFixed(2)}` : "--"}
                    </td>
                    <td style={{ padding: "8px", color: "var(--accent-red)", fontSize: "12px" }}>
                      {p.stopLossPrice != null ? `$${p.stopLossPrice.toFixed(2)}` : "--"}
                    </td>
                    <td style={{ padding: "8px", color: p.unrealizedPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      ${p.unrealizedPnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Open Orders */}
          {address && (
            <div style={{ marginTop: "32px" }}>
              <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Open Orders
              </h2>
              {orders.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>No open orders</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)" }}>
                      {["Coin", "Side", "Size", "Price", "Trigger", "Type"].map((h) => (
                        <th key={h} style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "8px", fontWeight: 600 }}>{o.coin}</td>
                        <td style={{ padding: "8px", color: o.side === "B" ? "var(--accent-green)" : "var(--accent-red)" }}>
                          {o.side === "B" ? "BUY" : "SELL"}
                        </td>
                        <td style={{ padding: "8px" }}>{o.size}</td>
                        <td style={{ padding: "8px" }}>${o.limitPrice.toFixed(2)}</td>
                        <td style={{ padding: "8px" }}>
                          {o.triggerPrice != null ? `$${o.triggerPrice.toFixed(2)}` : "--"}
                        </td>
                        <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>
                          {o.orderType}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Recent Trades */}
          {address && fills.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Recent Trades
              </h2>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)" }}>
                    {["Coin", "Direction", "Size", "Price", "PnL", "Time"].map((h) => (
                      <th key={h} style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fills.map((f, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "8px", fontWeight: 600 }}>{f.coin}</td>
                      <td style={{ padding: "8px", color: dirColors[f.dir || ""] || "var(--text-secondary)", fontSize: "12px" }}>
                        {f.dir || (f.side === "B" ? "BUY" : "SELL")}
                      </td>
                      <td style={{ padding: "8px" }}>{f.size}</td>
                      <td style={{ padding: "8px" }}>${f.price.toFixed(2)}</td>
                      <td style={{ padding: "8px", color: f.closedPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {f.closedPnl !== 0 ? `$${f.closedPnl.toFixed(2)}` : ""}
                      </td>
                      <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)" }}>{f.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right panel: News feed */}
        <div style={{ flex: 1, borderLeft: "1px solid var(--border)", paddingLeft: "24px" }}>
          <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            News Feed
          </h2>
          {newsLoading && news.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Loading news...</p>
          ) : newsError && news.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{newsError}</p>
          ) : news.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>No news available</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "600px", overflowY: "auto" }}>
              {news.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px",
                    background: "var(--bg-card)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                  }}
                >
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
                    <span
                      style={{
                        padding: "2px 6px",
                        borderRadius: "2px",
                        fontSize: "10px",
                        fontWeight: 600,
                        color: "var(--bg-primary)",
                        background: categoryColors[item.category] || "var(--text-muted)",
                      }}
                    >
                      {item.category.toUpperCase()}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>
                      {item.source}
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto" }}>
                      {timeAgo(item.timestamp)}
                    </span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "var(--text-primary)",
                      fontSize: "12px",
                      textDecoration: "none",
                      lineHeight: "1.4",
                    }}
                  >
                    {item.title}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
