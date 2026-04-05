"use client";

import { useState } from "react";
import { getFills, type Fill } from "@/lib/api";

export default function PortfolioPage() {
  const [address, setAddress] = useState("");
  const [fills, setFills] = useState<Fill[]>([]);
  const [loading, setLoading] = useState(false);

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

  const totalPnl = fills.reduce((sum, f) => sum + f.closedPnl, 0);
  const wins = fills.filter((f) => f.closedPnl > 0).length;
  const losses = fills.filter((f) => f.closedPnl < 0).length;

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
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "Total PnL", value: `$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" },
            { label: "Trades", value: fills.length.toString(), color: "var(--text-primary)" },
            { label: "Wins", value: wins.toString(), color: "var(--accent-green)" },
            { label: "Losses", value: losses.toString(), color: "var(--accent-red)" },
            { label: "Win Rate", value: fills.length > 0 ? `${((wins / fills.length) * 100).toFixed(1)}%` : "—", color: "var(--accent-yellow)" },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                padding: "16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                flex: 1,
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
      )}

      {/* PnL curve placeholder */}
      <div style={{ padding: "40px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", textAlign: "center", marginBottom: "24px" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          PnL curve chart — chart library integration pending
        </p>
      </div>

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
            {fills.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{f.coin}</td>
                <td style={{ padding: "8px", color: f.side === "B" ? "var(--accent-green)" : "var(--accent-red)" }}>
                  {f.side === "B" ? "BUY" : "SELL"}
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
