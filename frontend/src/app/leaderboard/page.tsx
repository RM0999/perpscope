"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getLeaderboard, getVaults, downloadTopTraders, type LeaderboardEntry, type Vault } from "@/lib/api";

type Tab = "traders" | "vaults";

export default function LeaderboardPage() {
  const router = useRouter();
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

  function copyAddress(addr: string, e: React.MouseEvent) {
    e.stopPropagation();
    navigator.clipboard.writeText(addr).then(() => {
      setCopiedAddr(addr);
      setTimeout(() => setCopiedAddr(null), 1500);
    });
  }

  function trackWallet(address: string) {
    router.push(`/tracker?address=${encodeURIComponent(address)}`);
  }

  function formatPnl(val: number | null | undefined): string {
    if (val == null) return "--";
    return `$${val >= 0 ? "+" : ""}${val.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "var(--accent-green)" }}>^ Leaderboard</h1>
        <button
          onClick={() => downloadTopTraders(20)}
          style={{
            padding: "8px 16px",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "11px",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Export JSON
        </button>
      </div>

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
          <p style={{ color: "var(--text-muted)" }}>Connect backend to load leaderboard data</p>
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
                    onClick={() => trackWallet(entry.address)}
                    style={{
                      padding: "20px",
                      background: "var(--bg-card)",
                      border: `1px solid ${colors[i]}`,
                      borderRadius: "4px",
                      textAlign: "center",
                      minWidth: "180px",
                      boxShadow: isFirst ? `0 0 20px ${colors[0]}40, 0 0 40px ${colors[0]}20` : "none",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: "24px", color: colors[i], marginBottom: "8px" }}>
                      #{i + 1}
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--text-primary)", marginBottom: "2px", fontWeight: 600 }}>
                      {entry.displayName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </div>
                    <div
                      onClick={(e) => copyAddress(entry.address, e)}
                      style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "8px", cursor: "pointer" }}
                      title="Click to copy address"
                    >
                      {copiedAddr === entry.address ? "Copied!" : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </div>
                    <div style={{ color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600, marginBottom: "4px" }}>
                      ${entry.pnl.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                      {entry.roi.toFixed(1)}% ROI
                    </div>
                    {entry.accountValue > 0 && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                        Acct: ${entry.accountValue.toLocaleString()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Ranked table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Rank", "Trader", "Acct Value", "PnL", "Day PnL", "Week PnL", "ROI", "Volume"].map((h) => (
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
                {rest.map((entry) => {
                  const wp = entry.windowPerformances;
                  return (
                    <tr
                      key={entry.address}
                      onClick={() => trackWallet(entry.address)}
                      style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                    >
                      <td style={{ padding: "8px" }}>#{entry.rank}</td>
                      <td style={{ padding: "8px" }}>
                        <div style={{ fontSize: "12px", fontWeight: entry.displayName ? 600 : 400 }}>
                          {entry.displayName || `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                        </div>
                        {entry.displayName && (
                          <div
                            onClick={(e) => copyAddress(entry.address, e)}
                            style={{ fontSize: "10px", color: "var(--text-muted)", cursor: "pointer" }}
                            title="Click to copy"
                          >
                            {copiedAddr === entry.address ? "Copied!" : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                          </div>
                        )}
                        {!entry.displayName && (
                          <span
                            onClick={(e) => copyAddress(entry.address, e)}
                            style={{ display: "none" }}
                          />
                        )}
                      </td>
                      <td style={{ padding: "8px", fontSize: "12px" }}>
                        ${entry.accountValue.toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        ${entry.pnl.toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", fontSize: "12px", color: (wp?.day ?? 0) >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {formatPnl(wp?.day)}
                      </td>
                      <td style={{ padding: "8px", fontSize: "12px", color: (wp?.week ?? 0) >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                        {formatPnl(wp?.week)}
                      </td>
                      <td style={{ padding: "8px" }}>{entry.roi.toFixed(1)}%</td>
                      <td style={{ padding: "8px" }}>${entry.volume.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )
      ) : vaults.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Connect backend to load vault data</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              {["Vault", "Leader", "TVL", "PnL", "APR"].map((h) => (
                <th key={h} style={{ padding: "8px", textAlign: "left", color: "var(--text-muted)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vaults.map((v) => (
              <tr
                key={v.leaderAddress}
                onClick={() => trackWallet(v.leaderAddress)}
                style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
              >
                <td style={{ padding: "8px", fontWeight: 600 }}>{v.name}</td>
                <td
                  style={{ padding: "8px", fontSize: "12px", color: "var(--text-secondary)" }}
                  onClick={(e) => copyAddress(v.leaderAddress, e)}
                  title="Click to copy"
                >
                  {copiedAddr === v.leaderAddress ? "Copied!" : `${v.leaderAddress.slice(0, 6)}...${v.leaderAddress.slice(-4)}`}
                </td>
                <td style={{ padding: "8px" }}>${v.tvl.toLocaleString()}</td>
                <td style={{ padding: "8px", color: v.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                  ${v.pnl.toLocaleString()}
                </td>
                <td style={{ padding: "8px", color: "var(--accent-purple)" }}>{v.apr.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
