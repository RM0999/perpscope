"use client";

import { useState, useEffect } from "react";
import { getLeaderboard, getVaults, type LeaderboardEntry, type Vault } from "@/lib/api";

type Tab = "traders" | "vaults";

export default function LeaderboardPage() {
  const [tab, setTab] = useState<Tab>("traders");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (tab === "traders") {
      getLeaderboard()
        .then(setEntries)
        .catch(() => setEntries([]))
        .finally(() => setLoading(false));
    } else {
      getVaults()
        .then(setVaults)
        .catch(() => setVaults([]))
        .finally(() => setLoading(false));
    }
  }, [tab]);

  function copyAddress(addr: string) {
    navigator.clipboard.writeText(addr).then(() => {
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 1500);
    });
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "24px" }}>
        ^ Leaderboard
      </h1>

      {/* Tab switcher */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {(["traders", "vaults"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              background: tab === t ? "var(--accent-green)" : "var(--bg-card)",
              color: tab === t ? "var(--bg-primary)" : "var(--text-secondary)",
              border: `1px solid ${tab === t ? "var(--accent-green)" : "var(--border)"}`,
              borderRadius: "4px",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: tab === t ? 600 : 400,
              textTransform: "uppercase",
              letterSpacing: "1px",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      ) : tab === "traders" ? (
        entries.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>
            Connect backend to load leaderboard data
          </p>
        ) : (
          <>
            {/* Podium */}
            <div style={{ display: "flex", gap: "16px", marginBottom: "32px", justifyContent: "center" }}>
              {podium.map((entry, i) => {
                const colors = ["var(--accent-yellow)", "var(--text-secondary)", "#cd7f32"];
                const isFirst = i === 0;
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
                      boxShadow: isFirst ? `0 0 20px ${colors[0]}40, 0 0 40px ${colors[0]}20` : "none",
                      position: "relative",
                    }}
                  >
                    <div style={{ fontSize: "24px", color: colors[i], marginBottom: "8px" }}>
                      #{i + 1}
                    </div>
                    <div
                      onClick={() => copyAddress(entry.address)}
                      style={{
                        fontSize: "12px",
                        color: "var(--text-secondary)",
                        marginBottom: "4px",
                        cursor: "pointer",
                      }}
                      title="Click to copy address"
                    >
                      {copiedAddr === entry.address
                        ? "Copied!"
                        : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </div>
                    <div style={{ color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
                      ${entry.pnl.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                      {entry.roi.toFixed(1)}% ROI
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
                    <td
                      style={{ padding: "8px", fontSize: "12px", cursor: "pointer" }}
                      onClick={() => copyAddress(entry.address)}
                      title="Click to copy"
                    >
                      {copiedAddr === entry.address
                        ? "Copied!"
                        : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
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
        )
      ) : vaults.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          Connect backend to load vault data
        </p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Vault", "Leader", "TVL", "PnL", "APR"].map((h) => (
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
            {vaults.map((v) => (
              <tr key={v.leaderAddress} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "8px", fontWeight: 600 }}>{v.name}</td>
                <td
                  style={{ padding: "8px", fontSize: "12px", cursor: "pointer", color: "var(--text-secondary)" }}
                  onClick={() => copyAddress(v.leaderAddress)}
                  title="Click to copy"
                >
                  {copiedAddr === v.leaderAddress
                    ? "Copied!"
                    : `${v.leaderAddress.slice(0, 6)}...${v.leaderAddress.slice(-4)}`}
                </td>
                <td style={{ padding: "8px" }}>${v.tvl.toLocaleString()}</td>
                <td style={{ padding: "8px", color: v.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  ${v.pnl.toLocaleString()}
                </td>
                <td style={{ padding: "8px", color: "var(--accent-purple)" }}>
                  {v.apr.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
