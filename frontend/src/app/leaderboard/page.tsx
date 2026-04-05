"use client";

import { useState, useEffect } from "react";
import Card from "@/components/Card";

interface Leader {
  rank: number;
  address: string;
  pnl: number;
  roi: number;
  trades: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setLeaders(data.leaders || []);
        }
      } catch {
        console.error("Failed to fetch leaderboard");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  const podium = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="lb-layout">
      <div className="page-header">
        <h1><span className="green">$</span> Leaderboard</h1>
        <p className="muted">Top perpetual futures traders on Hyperliquid</p>
      </div>

      {podium.length > 0 && (
        <div className="podium">
          {podium.map((l, i) => (
            <div key={i} className={`podium-card rank-${i + 1}`}>
              <div className="podium-rank">#{i + 1}</div>
              <div className="podium-addr">{l.address.slice(0, 6)}...{l.address.slice(-4)}</div>
              <div className="podium-pnl green">${l.pnl.toLocaleString()}</div>
              <div className="muted">{l.roi.toFixed(1)}% ROI</div>
            </div>
          ))}
        </div>
      )}

      <Card title="Rankings">
        {loading ? (
          <div className="muted">Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div className="muted">// Connect backend to load leaderboard</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Address</th>
                <th>PnL</th>
                <th>ROI</th>
                <th>Trades</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((l) => (
                <tr key={l.rank}>
                  <td className="muted">{l.rank}</td>
                  <td className="yellow">{l.address.slice(0, 6)}...{l.address.slice(-4)}</td>
                  <td className={l.pnl >= 0 ? "green" : "red"}>${l.pnl.toLocaleString()}</td>
                  <td className={l.roi >= 0 ? "green" : "red"}>{l.roi.toFixed(1)}%</td>
                  <td>{l.trades}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <style jsx>{`
        .lb-layout {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .podium {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .podium-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 20px;
          text-align: center;
        }
        .podium-card.rank-1 {
          border-color: var(--accent-yellow);
        }
        .podium-rank {
          font-size: 28px;
          font-weight: 700;
          color: var(--accent-yellow);
          margin-bottom: 8px;
        }
        .rank-2 .podium-rank { color: var(--text-secondary); }
        .rank-3 .podium-rank { color: #cd7f32; }
        .podium-addr {
          font-size: 13px;
          margin-bottom: 8px;
        }
        .podium-pnl {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
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
      `}</style>
    </div>
  );
}
