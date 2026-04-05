"use client";

import React from "react";

interface Position {
  coin: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  side: "long" | "short";
}

interface Props {
  positions: Position[];
}

export default function PositionTable({ positions }: Props) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Coin</th>
            <th>Side</th>
            <th>Size</th>
            <th>Entry</th>
            <th>Mark</th>
            <th>Lev</th>
            <th>uPnL</th>
          </tr>
        </thead>
        <tbody>
          {positions.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty">No open positions</td>
            </tr>
          ) : (
            positions.map((p, i) => (
              <tr key={i}>
                <td className="yellow">{p.coin}</td>
                <td className={p.side === "long" ? "green" : "red"}>
                  {p.side.toUpperCase()}
                </td>
                <td>{p.size.toFixed(4)}</td>
                <td>${p.entryPrice.toFixed(2)}</td>
                <td>${p.markPrice.toFixed(2)}</td>
                <td>{p.leverage}x</td>
                <td className={p.unrealizedPnl >= 0 ? "green" : "red"}>
                  ${p.unrealizedPnl.toFixed(2)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <style jsx>{`
        .table-wrapper {
          overflow-x: auto;
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
          font-weight: 500;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }
        td {
          padding: 8px 12px;
          border-bottom: 1px solid var(--border);
        }
        tr:hover td {
          background: var(--bg-hover);
        }
        .empty {
          text-align: center;
          color: var(--text-muted);
          padding: 24px;
        }
      `}</style>
    </div>
  );
}
