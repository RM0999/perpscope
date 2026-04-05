"use client";

import { useState } from "react";
import { getPositions, type Position } from "@/lib/api";

export default function TrackerPage() {
  const [address, setAddress] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleTrack() {
    if (!address) return;
    setLoading(true);
    try {
      const data = await getPositions(address);
      setPositions(data);
    } catch (err) {
      console.error("Failed to fetch positions:", err);
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

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Positions panel */}
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
                  {["Coin", "Size", "Entry", "Mark", "Lev", "uPnL"].map((h) => (
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
                    <td style={{ padding: "8px", color: p.unrealizedPnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      ${p.unrealizedPnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* News feed panel */}
        <div style={{ flex: 1, borderLeft: "1px solid var(--border)", paddingLeft: "24px" }}>
          <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
            News Feed
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            News feed integration coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
