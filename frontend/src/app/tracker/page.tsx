"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  getPositions,
  getOpenOrders,
  getFills,
  type Position,
  type AccountSummary,
  type Order,
  type Fill,
} from "@/lib/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (address && !autoLoaded) {
      setAutoLoaded(true);
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-refresh every 30s
  useEffect(() => {
    if (!address || !lastUpdated || !autoRefresh) return;
    const interval = setInterval(async () => {
      try {
        const [posResponse, orderData, fillData] = await Promise.all([
          getPositions(address),
          getOpenOrders(address),
          getFills(address, 20),
        ]);
        setPositions(posResponse.positions);
        setAccountSummary(posResponse.accountSummary);
        setOrders(orderData);
        setFills(fillData);
        setLastUpdated(Date.now());
      } catch {
        // Silent fail on auto-refresh
      }
    }, 30_000);
    return () => clearInterval(interval);
  }, [address, lastUpdated, autoRefresh]);

  // Tick the "seconds ago" counter
  useEffect(() => {
    if (!lastUpdated) return;
    setSecondsAgo(0);
    const tick = setInterval(() => setSecondsAgo(Math.floor((Date.now() - lastUpdated) / 1000)), 1000);
    return () => clearInterval(tick);
  }, [lastUpdated]);

  async function handleTrack() {
    if (!address || loading) return;
    setLoading(true);
    setError("");
    try {
      const [posResponse, orderData, fillData] = await Promise.all([
        getPositions(address),
        getOpenOrders(address),
        getFills(address, 20),
      ]);
      setPositions(posResponse.positions);
      setAccountSummary(posResponse.accountSummary);
      setOrders(orderData);
      setFills(fillData);
      setLastUpdated(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
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

      {lastUpdated && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Updated {secondsAgo}s ago
          </span>
          <button
            onClick={() => setAutoRefresh((v) => !v)}
            style={{
              padding: "4px 10px",
              color: autoRefresh ? "var(--accent-green)" : "var(--text-muted)",
              border: `1px solid ${autoRefresh ? "var(--accent-green)" : "var(--border)"}`,
              borderRadius: "4px",
              background: "var(--bg-card)",
              fontFamily: "inherit",
              fontSize: "10px",
              cursor: "pointer",
            }}
          >
            Auto-refresh: {autoRefresh ? "ON" : "OFF"}
          </button>
        </div>
      )}

      {error && (
        <div style={{ padding: "12px", background: "var(--bg-card)", border: "1px solid var(--accent-red)", borderRadius: "4px", marginBottom: "16px" }}>
          <p style={{ color: "var(--accent-red)", fontSize: "12px", margin: 0 }}>{error}</p>
        </div>
      )}

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

      {/* Open Positions */}
      <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
        Open Positions
      </h2>
      {positions.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          {address ? "No open positions" : "Enter a wallet address to track"}
        </p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Dir", "Coin", "Size", "Value", "Entry", "Mark", "Lev", "Mode", "TP", "SL", "Liq", "uPnL", "ROE"].map((h) => (
                  <th key={h} style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {positions.map((p, i) => (
                <tr key={i} style={{
                  borderBottom: "1px solid var(--border)",
                  background: p.unrealizedPnl > 0 ? "rgba(0,255,136,0.03)" : p.unrealizedPnl < 0 ? "rgba(255,68,68,0.03)" : "transparent",
                }}>
                  <td style={{ padding: "8px", color: p.direction === "LONG" ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600, fontSize: "12px" }}>
                    {p.direction}
                  </td>
                  <td style={{ padding: "8px", fontWeight: 600 }}>{p.coin}</td>
                  <td style={{ padding: "8px" }}>{p.size.toFixed(4)}</td>
                  <td style={{ padding: "8px", fontSize: "12px" }}>
                    ${p.positionValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "8px" }}>${p.entryPrice.toFixed(2)}</td>
                  <td style={{ padding: "8px" }}>${p.markPrice.toFixed(2)}</td>
                  <td style={{ padding: "8px" }}>{p.leverage}x</td>
                  <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>{p.marginMode}</td>
                  <td style={{ padding: "8px", color: "var(--accent-green)", fontSize: "12px" }}>
                    {p.takeProfitPrice != null ? `$${p.takeProfitPrice.toFixed(2)}` : "--"}
                  </td>
                  <td style={{ padding: "8px", color: "var(--accent-red)", fontSize: "12px" }}>
                    {p.stopLossPrice != null ? `$${p.stopLossPrice.toFixed(2)}` : "--"}
                  </td>
                  <td style={{ padding: "8px", fontSize: "12px", color: "var(--accent-yellow)" }}>
                    {p.liquidationPrice != null ? `$${p.liquidationPrice.toFixed(2)}` : "--"}
                  </td>
                  <td style={{ padding: "8px", color: p.unrealizedPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
                    ${p.unrealizedPnl.toFixed(2)}
                  </td>
                  <td style={{ padding: "8px", color: p.returnOnEquity >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontSize: "12px" }}>
                    {(p.returnOnEquity * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                {["Coin", "Action", "Size", "Price", "PnL", "Fee", "Time"].map((h) => (
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
                  <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)" }}>${f.fee.toFixed(4)}</td>
                  <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)" }}>{f.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
