"use client";

import { useState } from "react";

export default function CopyTradePage() {
  const [wallets, setWallets] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function addWallet() {
    if (input && !wallets.includes(input)) {
      setWallets([...wallets, input]);
      setInput("");
    }
  }

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        &gt; Copy Trade
      </h1>

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
                  onClick={() => setWallets(wallets.filter((x) => x !== w))}
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

      {/* Filter config placeholder */}
      <div style={{ padding: "20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px", marginBottom: "24px" }}>
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Filter Config
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          Min size, leverage range, coin filter — coming soon
        </p>
      </div>

      {/* Trade log placeholder */}
      <div>
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Trade Log
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          Real-time trade log will appear here when wallets are tracked
        </p>
      </div>
    </div>
  );
}
