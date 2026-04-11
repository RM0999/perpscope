"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchWalletSummaries, type LeaderboardEntry } from "@/lib/api";

// Known whale/top trader addresses to pre-populate
const DEFAULT_WALLETS = [
  "0xb83de012dba672c76a7dbbbf3e459cb59d7d6e36",
  "0x6940C181b764e5e3D76b14F15ed7263fB457F0c8",
  "0xDBF2EB41a1BD52b4Aa31Ec569559Fc3512e0E2Da",
  "0x4a09AFA8b46Cd50A1b8aC49BF0B8fB30ea2264CF",
  "0x1bF631fD0d5D4dc2b8254e4108dA521Ab97a88Eb",
  "0xecb63caa47c7c4e77f60f1ce858cf28dc2b82b00",
];

const STORAGE_KEY = "perpscope_watchlist";

function loadWatchlist(): string[] {
  if (typeof window === "undefined") return DEFAULT_WALLETS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return DEFAULT_WALLETS;
}

function saveWatchlist(wallets: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets)); } catch { /* ignore */ }
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<string[]>(loadWatchlist);
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [addInput, setAddInput] = useState("");
  const [copiedAddr, setCopiedAddr] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (wallets.length === 0) { setEntries([]); setLoading(false); return; }
    setLoading(true);
    try {
      const data = await fetchWalletSummaries(wallets);
      setEntries(data);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [wallets]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function addWallet() {
    const addr = addInput.trim();
    if (addr && addr.startsWith("0x") && !wallets.includes(addr)) {
      const updated = [...wallets, addr];
      setWallets(updated);
      saveWatchlist(updated);
      setAddInput("");
    }
  }

  function removeWallet(addr: string, e: React.MouseEvent) {
    e.stopPropagation();
    const updated = wallets.filter((w) => w !== addr);
    setWallets(updated);
    saveWatchlist(updated);
  }

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

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h1 style={{ color: "var(--accent-green)" }}>^ Watchlist</h1>
        <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
          {entries.length} wallets tracked live
        </span>
      </div>

      {/* Add wallet */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        <input
          type="text"
          placeholder="0x... add wallet to watchlist"
          value={addInput}
          onChange={(e) => setAddInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addWallet()}
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
          onClick={addWallet}
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
          Add
        </button>
        <button
          onClick={fetchData}
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: "var(--bg-card)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {loading && entries.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Fetching wallet data...</p>
      ) : entries.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>Add wallet addresses above to start tracking</p>
      ) : (
        <>
          {/* Podium — top 3 by account value */}
          {podium.length >= 3 && (
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
                    <div
                      onClick={(e) => copyAddress(entry.address, e)}
                      style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "8px", cursor: "pointer" }}
                      title="Click to copy"
                    >
                      {copiedAddr === entry.address ? "Copied!" : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </div>
                    <div style={{ fontSize: "16px", fontWeight: 600, color: "var(--accent-green)", marginBottom: "4px" }}>
                      ${entry.accountValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                    <div style={{ fontSize: "12px", color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                      uPnL: ${entry.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ranked table */}
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["#", "Address", "Account Value", "Unrealized PnL", "ROE", ""].map((h) => (
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
              {(podium.length >= 3 ? rest : entries).map((entry) => (
                <tr
                  key={entry.address}
                  onClick={() => trackWallet(entry.address)}
                  style={{ borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <td style={{ padding: "8px", color: "var(--text-muted)" }}>{entry.rank}</td>
                  <td style={{ padding: "8px" }}>
                    <span
                      onClick={(e) => copyAddress(entry.address, e)}
                      style={{ fontSize: "12px", cursor: "pointer" }}
                      title="Click to copy"
                    >
                      {copiedAddr === entry.address ? "Copied!" : `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`}
                    </span>
                  </td>
                  <td style={{ padding: "8px", fontWeight: 600 }}>
                    ${entry.accountValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "8px", color: entry.pnl >= 0 ? "var(--accent-green)" : "var(--accent-red)" }}>
                    ${entry.pnl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: "8px", color: entry.roi >= 0 ? "var(--accent-green)" : "var(--accent-red)", fontSize: "12px" }}>
                    {entry.roi.toFixed(2)}%
                  </td>
                  <td style={{ padding: "8px" }}>
                    <button
                      onClick={(e) => removeWallet(entry.address, e)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--accent-red)",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "11px",
                      }}
                    >
                      x
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
