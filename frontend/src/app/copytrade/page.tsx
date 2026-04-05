"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getPositions, getFills, type Position, type Fill } from "@/lib/api";

interface TradeLogEntry {
  time: string;
  wallet: string;
  coin: string;
  side: string;
  size: number;
  price: number;
}

interface FilterConfig {
  minSize: number;
  maxLeverage: number;
  coinFilter: string;
  direction: "both" | "long" | "short";
}

export default function CopyTradePage() {
  const [wallets, setWallets] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [tradeLog, setTradeLog] = useState<TradeLogEntry[]>([]);
  const [totalPositions, setTotalPositions] = useState(0);
  const [filters, setFilters] = useState<FilterConfig>({
    minSize: 0,
    maxLeverage: 100,
    coinFilter: "",
    direction: "both",
  });
  const wsRefs = useRef<Map<string, WebSocket>>(new Map());
  const pollIntervals = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const lastFillTimes = useRef<Map<string, string>>(new Map());

  function addWallet() {
    if (input && !wallets.includes(input)) {
      setWallets([...wallets, input]);
      setInput("");
    }
  }

  function removeWallet(w: string) {
    setWallets(wallets.filter((x) => x !== w));
    // Clean up WebSocket
    const ws = wsRefs.current.get(w);
    if (ws) {
      ws.close();
      wsRefs.current.delete(w);
    }
    // Clean up polling
    const interval = pollIntervals.current.get(w);
    if (interval) {
      clearInterval(interval);
      pollIntervals.current.delete(w);
    }
    lastFillTimes.current.delete(w);
  }

  const addTradeEntry = useCallback((entry: TradeLogEntry) => {
    setTradeLog((prev) => [entry, ...prev].slice(0, 200));
  }, []);

  const startPolling = useCallback(
    (wallet: string) => {
      const poll = async () => {
        try {
          const fills = await getFills(wallet);
          if (fills.length > 0) {
            const lastTime = lastFillTimes.current.get(wallet);
            const newFills = lastTime
              ? fills.filter((f) => f.time > lastTime)
              : fills.slice(0, 5);
            if (newFills.length > 0) {
              lastFillTimes.current.set(wallet, newFills[0].time);
              newFills.forEach((f) => {
                addTradeEntry({
                  time: f.time,
                  wallet,
                  coin: f.coin,
                  side: f.side,
                  size: f.size,
                  price: f.price,
                });
              });
            }
          }
        } catch {
          // Silently handle polling errors
        }
      };
      poll();
      const interval = setInterval(poll, 10000);
      pollIntervals.current.set(wallet, interval);
    },
    [addTradeEntry]
  );

  const connectWallet = useCallback(
    (wallet: string) => {
      try {
        const wsUrl = `ws://localhost:8000/api/ws/fills/${wallet}`;
        const ws = new WebSocket(wsUrl);
        wsRefs.current.set(wallet, ws);

        ws.onmessage = (event) => {
          try {
            const fill = JSON.parse(event.data);
            addTradeEntry({
              time: fill.time || new Date().toISOString(),
              wallet,
              coin: fill.coin,
              side: fill.side,
              size: fill.size,
              price: fill.price,
            });
          } catch {
            // Invalid message
          }
        };

        ws.onerror = () => {
          ws.close();
        };

        ws.onclose = () => {
          wsRefs.current.delete(wallet);
          // Fall back to polling
          if (!pollIntervals.current.has(wallet)) {
            startPolling(wallet);
          }
        };
      } catch {
        // WebSocket not available, fall back to polling
        startPolling(wallet);
      }
    },
    [addTradeEntry, startPolling]
  );

  // Connect/disconnect WebSockets when wallets change
  useEffect(() => {
    const currentWallets = new Set(wallets);

    // Connect new wallets
    wallets.forEach((w) => {
      if (!wsRefs.current.has(w) && !pollIntervals.current.has(w)) {
        connectWallet(w);
      }
    });

    // Disconnect removed wallets
    wsRefs.current.forEach((ws, w) => {
      if (!currentWallets.has(w)) {
        ws.close();
        wsRefs.current.delete(w);
      }
    });
    pollIntervals.current.forEach((interval, w) => {
      if (!currentWallets.has(w)) {
        clearInterval(interval);
        pollIntervals.current.delete(w);
      }
    });
  }, [wallets, connectWallet]);

  // Fetch total positions across all wallets
  useEffect(() => {
    if (wallets.length === 0) {
      setTotalPositions(0);
      return;
    }
    let cancelled = false;
    async function fetchAllPositions() {
      try {
        const results = await Promise.all(wallets.map((w) => getPositions(w).catch(() => ({ positions: [], accountSummary: { accountValue: 0, totalMarginUsed: 0, totalNtlPos: 0, withdrawable: 0 } }))));
        if (!cancelled) {
          setTotalPositions(results.reduce((sum, r) => sum + r.positions.length, 0));
        }
      } catch {
        // ignore
      }
    }
    fetchAllPositions();
    const interval = setInterval(fetchAllPositions, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [wallets]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRefs.current.forEach((ws) => ws.close());
      pollIntervals.current.forEach((interval) => clearInterval(interval));
    };
  }, []);

  // Apply filters to trade log
  const filteredLog = tradeLog.filter((entry) => {
    if (filters.minSize > 0 && entry.size * entry.price < filters.minSize) return false;
    if (filters.coinFilter) {
      const coins = filters.coinFilter.split(",").map((c) => c.trim().toUpperCase());
      if (coins.length > 0 && coins[0] !== "" && !coins.includes(entry.coin.toUpperCase())) return false;
    }
    if (filters.direction === "long" && (entry.side === "S" || entry.side === "sell")) return false;
    if (filters.direction === "short" && (entry.side === "B" || entry.side === "buy")) return false;
    return true;
  });

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        &gt; Copy Trade
      </h1>

      {/* Summary cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <div
          style={{
            padding: "16px 24px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Tracked Wallets
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "var(--accent-green)" }}>
            {wallets.length}
          </div>
        </div>
        <div
          style={{
            padding: "16px 24px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Total Positions
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "var(--accent-blue)" }}>
            {totalPositions}
          </div>
        </div>
        <div
          style={{
            padding: "16px 24px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            flex: 1,
          }}
        >
          <div style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>
            Trades Logged
          </div>
          <div style={{ fontSize: "24px", fontWeight: 600, color: "var(--accent-yellow)" }}>
            {tradeLog.length}
          </div>
        </div>
      </div>

      {/* Wallet selector */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Tracked Wallets
        </h2>
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
          <input
            type="text"
            placeholder="0x... add wallet to watch"
            value={input}
            onChange={(e) => setInput(e.target.value)}
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
        </div>

        {wallets.length > 0 && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {wallets.map((w) => (
              <span
                key={w}
                style={{
                  padding: "4px 10px",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "var(--text-secondary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                {w.slice(0, 6)}...{w.slice(-4)}
                <button
                  onClick={() => removeWallet(w)}
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
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Filter config */}
      <div style={{ padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "24px" }}>
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Filter Config
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          {/* Min Position Size */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
              Min Position Size (USD)
            </label>
            <input
              type="number"
              value={filters.minSize}
              onChange={(e) => setFilters({ ...filters, minSize: Number(e.target.value) })}
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="0"
              min={0}
            />
          </div>

          {/* Max Leverage */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
              Max Leverage: {filters.maxLeverage}x
            </label>
            <input
              type="range"
              min={1}
              max={100}
              value={filters.maxLeverage}
              onChange={(e) => setFilters({ ...filters, maxLeverage: Number(e.target.value) })}
              style={{
                width: "100%",
                accentColor: "var(--accent-green)",
              }}
            />
          </div>

          {/* Coin Filter */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
              Coin Whitelist (comma-separated)
            </label>
            <input
              type="text"
              value={filters.coinFilter}
              onChange={(e) => setFilters({ ...filters, coinFilter: e.target.value })}
              placeholder="BTC, ETH, SOL"
              style={{
                width: "100%",
                padding: "8px 10px",
                background: "var(--bg-primary)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
                color: "var(--text-primary)",
                fontFamily: "inherit",
                fontSize: "12px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Direction */}
          <div>
            <label style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginBottom: "6px" }}>
              Direction
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {(["both", "long", "short"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => setFilters({ ...filters, direction: dir })}
                  style={{
                    padding: "6px 14px",
                    background: filters.direction === dir ? "var(--accent-green)" : "var(--bg-primary)",
                    color: filters.direction === dir ? "var(--bg-primary)" : "var(--text-secondary)",
                    border: `1px solid ${filters.direction === dir ? "var(--accent-green)" : "var(--border)"}`,
                    borderRadius: "4px",
                    fontFamily: "inherit",
                    fontSize: "11px",
                    cursor: "pointer",
                    fontWeight: filters.direction === dir ? 600 : 400,
                    textTransform: "uppercase",
                  }}
                >
                  {dir}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Trade log */}
      <div>
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Trade Log
        </h2>
        {wallets.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            Add wallets above to start tracking trades in real-time
          </p>
        ) : filteredLog.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            Waiting for trades...
          </p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Time", "Wallet", "Coin", "Side", "Size", "Price"].map((h) => (
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
              {filteredLog.map((entry, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-muted)" }}>
                    {new Date(entry.time).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: "8px", fontSize: "11px", color: "var(--text-secondary)" }}>
                    {entry.wallet.slice(0, 6)}...{entry.wallet.slice(-4)}
                  </td>
                  <td style={{ padding: "8px", fontWeight: 600 }}>{entry.coin}</td>
                  <td
                    style={{
                      padding: "8px",
                      color: entry.side === "B" || entry.side === "buy" ? "var(--accent-green)" : "var(--accent-red)",
                      fontWeight: 600,
                    }}
                  >
                    {entry.side === "B" || entry.side === "buy" ? "BUY" : "SELL"}
                  </td>
                  <td style={{ padding: "8px" }}>{entry.size}</td>
                  <td style={{ padding: "8px" }}>${entry.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
