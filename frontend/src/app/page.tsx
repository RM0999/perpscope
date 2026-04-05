export default function Home() {
  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "8px" }}>
        &gt; PerpScope
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
        Perpetual futures intelligence platform
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {[
          { title: "Tracker", desc: "Live positions & news feed", href: "/tracker" },
          { title: "Copy Trade", desc: "Follow top traders", href: "/copytrade" },
          { title: "News", desc: "Filtered crypto news", href: "/news" },
          { title: "Leaderboard", desc: "Top performers ranked", href: "/leaderboard" },
          { title: "Portfolio", desc: "PnL & performance stats", href: "/portfolio" },
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
            <p style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
              {item.desc}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
