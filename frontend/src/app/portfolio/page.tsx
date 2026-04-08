"use client";

import { useState, useMemo } from "react";
import { getFills, type Fill } from "@/lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type TimeRange = "7D" | "30D" | "All";

export default function PortfolioPage() {
  const [address, setAddress] = useState("");
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>("All");

  async function handleLoad() {
    if (!address) return;
    setLoading(true);
    try {
      const data = await getFills(address);
      setFills(data);
    } catch (err) {
      console.error("Failed to load fills:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter fills by time range
  const filteredFills = useMemo(() => {
    if (timeRange === "All") return fills;
    const now = Date.now();
    const days = timeRange === "7D" ? 7 : 30;
    const cutoff = now - days * 86400000;
    return fills.filter((f) => f.rawTime >= cutoff);
  }, [fills, timeRange]);

  // Compute stats
  const totalPnl = filteredFills.reduce((sum, f) => sum + f.closedPnl, 0);
  const wins = filteredFills.filter((f) => f.closedPnl > 0);
  const losses = filteredFills.filter((f) => f.closedPnl < 0);
  const winCount = wins.length;
  const lossCount = losses.length;
  const totalFees = filteredFills.reduce((sum, f) => sum + f.fee, 0);

  const avgTradeSize = filteredFills.length > 0
    ? filteredFills.reduce((sum, f) => sum + f.size * f.price, 0) / filteredFills.length
    : 0;

  const largestWin = wins.length > 0
    ? Math.max(...wins.map((f) => f.closedPnl))
    : 0;

  const largestLoss = losses.length > 0
    ? Math.min(...losses.map((f) => f.closedPnl))
    : 0;

  const grossProfit = wins.reduce((sum, f) => sum + f.closedPnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, f) => sum + f.closedPnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  // Chart data: cumulative PnL over time
  const chartData = useMemo(() => {
    if (filteredFills.length === 0) return [];
    // Sort by time ascending
    const sorted = [...filteredFills].sort((a, b) => a.rawTime - b.rawTime);
    let cumulative = 0;
    return sorted.map((f) => {
      cumulative += f.closedPnl;
      return {
        time: f.rawTime > 0 ? new Date(f.rawTime).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : f.time,
        pnl: Number(cumulative.toFixed(2)),
      };
    });
  }, [filteredFills]);

  const stats = [
    { label: "Total PnL", value: `$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
    { label: "Trades", value: filteredFills.length.toString(), color: "var(--text-primary)" },
    { label: "Wins", value: winCount.toString(), color: "var(--accent-green)" },
    { label: "Losses", value: lossCount.toString(), color: "var(--accent-red)" },
    { label: "Win Rate", value: filteredFills.length > 0 ? `${((winCount / filteredFills.length) * 100).toFixed(1)}%` : "--", color: "var(--accent-yellow)" },
  ];

  const extraStats = [
    { label: "Avg Trade Size", value: `$${avgTradeSize.toFixed(2)}`, color: "var(--text-primary)" },
    { label: "Largest Win", value: `$${largestWin.toFixed(2)}`, color: "var(--accent-green)" },
    { label: "Largest Loss", value: `$${largestLoss.toFixed(2)}`, color: "var(--accent-red)" },
    { label: "Profit Factor", value: profitFactor === Infinity ? "INF" : profitFactor.toFixed(2), color: "var(--accent-purple)" },
    { label: "Total Fees", value: `$${totalFees.toFixed(2)}`, color: "var(--text-muted)" },
  ];

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        % Portfolio
      </h1>

      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="0x... wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLoad()}
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
          onClick={handleLoad}
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
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* Stats row */}
      {fills.length > 0 && (
        <>
          <div style={{ display: "flex", gap: "12px", marginBottom: "12px", flexWrap: "wrap" }}>
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "14px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  flex: "1 1 0",
                  minWidth: "120px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
            {extraStats.map((s) => (
              <div
                key={s.label}
                style={{
                  padding: "14px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  flex: "1 1 0",
                  minWidth: "120px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
                  {s.label}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: s.color }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* PnL Chart */}
      {fills.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>
              Cumulative PnL
            </h2>
            <div style={{ display: "flex", gap: "6px" }}>
              {(["7D", "30D", "All"] as TimeRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  style={{
                    padding: "4px 12px",
                    background: timeRange === r ? "var(--accent-green)" : "var(--bg-card)",
                    color: timeRange === r ? "var(--bg-primary)" : "var(--text-secondary)",
                    border: `1px solid ${timeRange === r ? "var(--accent-green)" : "var(--border)"}`,
                    borderRadius: "4px",
                    fontFamily: "inherit",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: timeRange === r ? 600 : 400,
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              padding: "16px",
              height: "300px",
            }}
          >
            {chartData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)", fontSize: "12px" }}>
                No data for selected time range
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <defs>
                    <linearGradient id="pnlGreenGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="pnlRedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff4444" stopOpacity={0} />
                      <stop offset="95%" stopColor="#ff4444" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#222222" strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fill: "#555555", fontSize: 10 }}
                    axisLine={{ stroke: "#222222" }}
                    tickLine={{ stroke: "#222222" }}
                  />
                  <YAxis
                    tick={{ fill: "#555555", fontSize: 10 }}
                    axisLine={{ stroke: "#222222" }}
                    tickLine={{ stroke: "#222222" }}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#161616",
                      border: "1px solid #222222",
                      borderRadius: "4px",
                      fontFamily: "inherit",
                      fontSize: "12px",
                    }}
                    labelStyle={{ color: "#888888" }}
                    itemStyle={{ color: "#e0e0e0" }}
                    formatter={(value) => [`$${Number(value).toFixed(2)}`, "PnL"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="pnl"
                    stroke={totalPnl >= 0 ? "#00ff88" : "#ff4444"}
                    strokeWidth={2}
                    fill={totalPnl >= 0 ? "url(#pnlGreenGrad)" : "url(#pnlRedGrad)"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}

      {/* Trade history */}
      <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
        Trade History
      </h2>
      {fills.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          {address ? "No trade history found" : "Enter a wallet address to load history"}
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Coin", "Side", "Size", "Price", "PnL", "Fee", "Time"].map((h) => (
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
            {filteredFills.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{f.coin}</td>
                <td style={{ padding: "8px", color: f.side === "B" || f.side === "buy" ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {f.side === "B" || f.side === "buy" ? "BUY" : "SELL"}
                </td>
                <td style={{ padding: "8px" }}>{f.size}</td>
                <td style={{ padding: "8px" }}>${f.price.toFixed(2)}</td>
                <td style={{ padding: "8px", color: f.closedPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  ${f.closedPnl.toFixed(2)}
                </td>
                <td style={{ padding: "8px" }}>${f.fee.toFixed(4)}</td>
                <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)" }}>{f.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
