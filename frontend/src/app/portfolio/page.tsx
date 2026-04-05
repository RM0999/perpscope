"use client";

import { useState } from "react";
import Card from "@/components/Card";
import WalletInput from "@/components/WalletInput";

interface Trade {
  time: string;
  coin: string;
  side: string;
  size: number;
  price: number;
  pnl: number;
}

interface Stats {
  totalPnl: number;
  winRate: number;
  totalTrades: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
}

export default function PortfolioPage() {
  const [wallet, setWallet] = useState("");
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadPortfolio = async (address: string) => {
    setWallet(address);
    setLoading(true);
    try {
      const res = await fetch(`/api/portfolio/${address}`);
      if (res.ok) {
        const data = await res.json();
        setTrades(data.trades || []);
        setStats(data.stats || null);
      }
    } catch {
      console.error("Failed to fetch portfolio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-layout">
      <div className="page-header">
        <h1><span className="green">$</span> Portfolio</h1>
        <p className="muted">Performance analytics and trade history</p>
      </div>

      <WalletInput onSubmit={loadPortfolio} />

      {wallet && (
        <p className="wallet-badge">
          <span className="muted">analyzing:</span>{" "}
          <span className="yellow">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
        </p>
      )}

      {loading ? (
        <div className="muted">Loading portfolio data...</div>
      ) : (
        <>
          <div className="stats-grid">
            <Card title="PnL Curve">
              <div className="chart-placeholder muted">
                <p>// PnL chart placeholder</p>
                <p>// Integrate charting library</p>
                {stats && (
                  <div className="pnl-big">
                    <span className={stats.totalPnl >= 0 ? "green" : "red"}>
                      ${stats.totalPnl.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Card title="Performance Stats">
              {stats ? (
                <div className="stat-rows">
                  <div className="stat-row">
                    <span className="muted">Total PnL</span>
                    <span className={stats.totalPnl >= 0 ? "green" : "red"}>
                      ${stats.totalPnl.toLocaleString()}
                    </span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Win Rate</span>
                    <span>{stats.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Total Trades</span>
                    <span>{stats.totalTrades}</span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Avg Win</span>
                    <span className="green">${stats.avgWin.toFixed(2)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Avg Loss</span>
                    <span className="red">${stats.avgLoss.toFixed(2)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Best Trade</span>
                    <span className="green">${stats.bestTrade.toFixed(2)}</span>
                  </div>
                  <div className="stat-row">
                    <span className="muted">Worst Trade</span>
                    <span className="red">${stats.worstTrade.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <div className="muted">// Enter a wallet to view stats</div>
              )}
            </Card>
          </div>

          <Card title="Trade History">
            {trades.length === 0 ? (
              <div className="muted">// No trades to display</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Coin</th>
                    <th>Side</th>
                    <th>Size</th>
                    <th>Price</th>
                    <th>PnL</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={i}>
                      <td className="muted">{t.time}</td>
                      <td className="yellow">{t.coin}</td>
                      <td className={t.side === "buy" ? "green" : "red"}>{t.side.toUpperCase()}</td>
                      <td>{t.size.toFixed(4)}</td>
                      <td>${t.price.toFixed(2)}</td>
                      <td className={t.pnl >= 0 ? "green" : "red"}>${t.pnl.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      <style jsx>{`
        .portfolio-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .wallet-badge {
          font-size: 13px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 16px;
        }
        .chart-placeholder {
          min-height: 200px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 8px;
          font-size: 12px;
        }
        .pnl-big {
          font-size: 32px;
          font-weight: 700;
          margin-top: 16px;
        }
        .stat-rows {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .stat-row {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          font-size: 13px;
          border-bottom: 1px solid var(--border);
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        th {
          text-align: left;
          padding: 8px 12px;
          color: var(--text-muted);
          font-size: 11px;
          text-transform: uppercase;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
        }
        tr:hover td {
          background: var(--bg-hover);
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
