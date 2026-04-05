"use client";

import { useState } from "react";
import Card from "@/components/Card";
import WalletInput from "@/components/WalletInput";
import PositionTable from "@/components/PositionTable";

interface Position {
  coin: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  unrealizedPnl: number;
  side: "long" | "short";
}

export default function TrackerPage() {
  const [wallet, setWallet] = useState("");
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);

  const trackWallet = async (address: string) => {
    setWallet(address);
    setLoading(true);
    try {
      const res = await fetch(`/api/positions/${address}`);
      if (res.ok) {
        const data = await res.json();
        setPositions(data.positions || []);
      }
    } catch {
      console.error("Failed to fetch positions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracker-layout">
      <div className="tracker-main">
        <div className="page-header">
          <h1><span className="green">$</span> Tracker</h1>
          <p className="muted">Monitor wallet positions in real-time</p>
        </div>

        <WalletInput onSubmit={trackWallet} />

        {wallet && (
          <div className="wallet-badge">
            <span className="muted">tracking:</span>{" "}
            <span className="yellow">{wallet.slice(0, 6)}...{wallet.slice(-4)}</span>
          </div>
        )}

        <Card title="Open Positions">
          {loading ? (
            <div className="muted">Loading positions...</div>
          ) : (
            <PositionTable positions={positions} />
          )}
        </Card>
      </div>

      <div className="tracker-sidebar">
        <Card title="News Feed">
          <div className="feed-placeholder muted">
            <p>// Live news feed</p>
            <p>// Connect backend to enable</p>
          </div>
        </Card>
      </div>

      <style jsx>{`
        .tracker-layout {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 24px;
          align-items: start;
        }
        .page-header {
          margin-bottom: 20px;
        }
        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .wallet-badge {
          margin: 12px 0;
          font-size: 13px;
        }
        .tracker-main {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .feed-placeholder {
          font-size: 12px;
          line-height: 2;
        }
        @media (max-width: 900px) {
          .tracker-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
