"use client";

export default function PortfolioPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-105px)]">
      <div className="text-accent-green text-2xl font-bold mb-2">
        PORTFOLIO
      </div>
      <p className="text-text-muted text-xs">
        PnL curve, performance stats &amp; trade history — coming soon
      </p>
      <div className="mt-6 border border-dashed border-border rounded px-8 py-4 text-text-secondary text-xs">
        Track your trading performance over time
      </div>
    </div>
  );
}
