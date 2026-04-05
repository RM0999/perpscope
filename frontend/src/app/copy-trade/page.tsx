"use client";

import { useState } from "react";
import Card from "@/components/Card";
import WalletInput from "@/components/WalletInput";

interface TradeLog {
  time: string;
  coin: string;
  side: string;
  size: number;
  price: number;
}

export default function CopyTradePage() {
  const [targetWallet, setTargetWallet] = useState("");
  const [logs, setLogs] = useState<TradeLog[]>([]);
  const [filters, setFilters] = useState({
    minSize: 0,
    coins: "",
    maxLeverage: 50,
  });

  return (
    <div className="copy-layout">
      <div className="page-header">
        <h1><span className="green">$</span> Copy Trade</h1>
        <p className="muted">Mirror trades from top wallets</p>
      </div>

      <WalletInput
        onSubmit={(addr) => setTargetWallet(addr)}
        placeholder="Enter wallet to copy (0x...)"
      />

      {targetWallet && (
        <p className="wallet-badge">
          <span className="muted">copying:</span>{" "}
          <span className="yellow">{targetWallet.slice(0, 6)}...{targetWallet.slice(-4)}</span>
        </p>
      )}

      <div className="copy-grid">
        <Card title="Filters">
          <div className="filter-group">
            <label className="muted">Min Size (USD)</label>
            <input
              type="number"
              value={filters.minSize}
              onChange={(e) => setFilters({ ...filters, minSize: Number(e.target.value) })}
            />
          </div>
          <div className="filter-group">
            <label className="muted">Coins (comma-sep)</label>
            <input
              type="text"
              value={filters.coins}
              onChange={(e) => setFilters({ ...filters, coins: e.target.value })}
              placeholder="BTC,ETH,SOL"
            />
          </div>
          <div className="filter-group">
            <label className="muted">Max Leverage</label>
            <input
              type="number"
              value={filters.maxLeverage}
              onChange={(e) => setFilters({ ...filters, maxLeverage: Number(e.target.value) })}
            />
          </div>
        </Card>

        <Card title="Trade Log">
          {logs.length === 0 ? (
            <div className="muted">// Waiting for trades...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Coin</th>
                  <th>Side</th>
                  <th>Size</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={i}>
                    <td className="muted">{log.time}</td>
                    <td className="yellow">{log.coin}</td>
                    <td className={log.side === "buy" ? "green" : "red"}>{log.side.toUpperCase()}</td>
                    <td>{log.size.toFixed(4)}</td>
                    <td>${log.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <style jsx>{`
        .copy-layout {
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
        .copy-grid {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 16px;
          align-items: start;
        }
        .filter-group {
          margin-bottom: 12px;
        }
        .filter-group label {
          display: block;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .filter-group input {
          width: 100%;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 13px;
          padding: 6px 10px;
          border-radius: 3px;
          outline: none;
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
        @media (max-width: 768px) {
          .copy-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
