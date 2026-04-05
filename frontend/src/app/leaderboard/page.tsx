"use client";

import { useState, useEffect } from "react";
import { getLeaderboard, type LeaderboardEntry } from "@/lib/api";

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard()
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, []);

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "24px" }}>
        ^ Leaderboard
      </h1>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading leaderboard...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          Connect backend to load leaderboard data
        </p>
      ) : (
        <>
          {/* Podium */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "32px", justifyContent: "center" }}>
            {podium.map((entry, i) => {
              const colors = ["var(--accent-yellow)", "var(--text-secondary)", "#cd7f32"];
              return (
                <div
                  key={entry.address}
                  style={{
                    padding: "20px",
                    background: "var(--bg-card)",
                    border: `1px solid ${colors[i]}`,
                    borderRadius: "4px",
                    textAlign: "center",
                    minWidth: "180px",
                  }}
                >
                  <div style={{ fontSize: "24px", color: colors[i], marginBottom: "8px" }}>
                    #{i + 1}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </div>
                  <div style={{ color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
                    ${entry.pnl.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ranked table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Rank", "Address", "PnL", "ROI", "Volume"].map((h) => (
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
              {rest.map((entry) => (
                <tr key={entry.address} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px" }}>#{entry.rank}</td>
                  <td style={{ padding: "8px", fontSize: "12px" }}>
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </td>
                  <td style={{ padding: "8px", color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                    ${entry.pnl.toLocaleString()}
                  </td>
                  <td style={{ padding: "8px" }}>{entry.roi.toFixed(1)}%</td>
                  <td style={{ padding: "8px" }}>${entry.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
