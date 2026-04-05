import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "PerpScope — Perpetual Futures Intelligence",
  description: "Track wallets, copy trades, and monitor perpetual futures on Hyperliquid",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="nav-brand">
            <span className="green">$</span> PerpScope
          </div>
          <div className="nav-links">
            <a href="/">Tracker</a>
            <a href="/copy-trade">Copy Trade</a>
            <a href="/news">News</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/portfolio">Portfolio</a>
          </div>
        </nav>
        <main className="main-content">{children}</main>

        <style jsx global>{`
          .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 24px;
            background: var(--bg-secondary);
            border-bottom: 1px solid var(--border);
            position: sticky;
            top: 0;
            z-index: 100;
          }
          .nav-brand {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .nav-links {
            display: flex;
            gap: 24px;
          }
          .nav-links a {
            color: var(--text-secondary);
            font-size: 13px;
            transition: color 0.15s;
          }
          .nav-links a:hover {
            color: var(--accent-green);
            text-decoration: none;
          }
          .main-content {
            padding: 24px;
            max-width: 1400px;
            margin: 0 auto;
          }
        `}</style>
      </body>
    </html>
  );
}
