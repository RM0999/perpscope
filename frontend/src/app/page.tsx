"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [quickAddress, setQuickAddress] = useState("");
  const router = useRouter();

  function handleQuickTrack() {
    if (quickAddress.trim()) {
      router.push(`/tracker?address=${encodeURIComponent(quickAddress.trim())}`);
    }
  }

  return (
    <div>
      {/* Terminal welcome */}
      <div
        style={{
          padding: "20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          marginBottom: "24px",
        }}
      >
        <div style={{ color: "var(--accent-green)", fontSize: "14px", marginBottom: "4px" }}>
          &gt; welcome to perpscope v0.1.0
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          perpetual futures intelligence platform // hyperliquid
        </div>
      </div>

      {/* Live stats */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        {[
          { label: "Status", value: "ONLINE", color: "var(--accent-green)" },
          { label: "Network", value: "Hyperliquid L1", color: "var(--accent-blue)" },
          { label: "Data Feed", value: "Real-time", color: "var(--accent-purple)" },
          { label: "Latency", value: "<50ms", color: "var(--accent-yellow)" },
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

      <h1 style={{ color: "var(--accent-green)", marginBottom: "8px" }}>
        &gt; PerpScope
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "24px" }}>
        Perpetual futures intelligence platform
      </p>

      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
        {[
          { title: "$ Tracker", desc: "Live positions & news feed", href: "/tracker" },
          { title: "> Copy Trade", desc: "Follow top traders in real-time", href: "/copytrade" },
          { title: "# News", desc: "Filtered crypto news feed", href: "/news" },
          { title: "^ Leaderboard", desc: "Top performers & vaults ranked", href: "/leaderboard" },
          { title: "% Portfolio", desc: "PnL curves & performance stats", href: "/portfolio" },
        ].map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: "block",
              padding: "20px",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              textDecoration: "none",
              transition: "border-color 0.2s",
            }}
          >
            <h2 style={{ color: "var(--accent-green)", fontSize: "16px", marginBottom: "4px" }}>
              {item.title}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "12px", margin: 0 }}>
              {item.desc}
            </p>
          </a>
        ))}
      </div>

      {/* Quick Track */}
      <div
        style={{
          padding: "20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
          marginBottom: "24px",
        }}
      >
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Quick Track
        </h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            placeholder="Paste wallet address to track..."
            value={quickAddress}
            onChange={(e) => setQuickAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleQuickTrack()}
            style={{
              flex: 1,
              padding: "10px 12px",
              background: "var(--bg-primary)",
              border: "1px solid var(--border)",
              borderRadius: "4px",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              fontSize: "13px",
              outline: "none",
            }}
          />
          <button
            onClick={handleQuickTrack}
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
            Track
          </button>
        </div>
      </div>

      {/* Recent Activity placeholder */}
      <div
        style={{
          padding: "20px",
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
          borderRadius: "4px",
        }}
      >
        <h2 style={{ color: "var(--text-secondary)", fontSize: "12px", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
          Recent Activity
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {[
            { text: "System initialized", time: "now", color: "var(--accent-green)" },
            { text: "Connected to Hyperliquid API", time: "now", color: "var(--accent-blue)" },
            { text: "WebSocket feed ready", time: "now", color: "var(--accent-purple)" },
          ].map((entry, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                background: "var(--bg-primary)",
                borderRadius: "2px",
                borderLeft: `2px solid ${entry.color}`,
              }}
            >
              <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{entry.text}</span>
              <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{entry.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
