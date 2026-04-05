"use client";

const PRICES = [
  { symbol: "BTC", price: "68,421.30", change: "+2.14%" },
  { symbol: "ETH", price: "3,847.62", change: "+1.87%" },
  { symbol: "SOL", price: "178.45", change: "-0.63%" },
];

export default function TopBar() {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-bg-card">
      <div className="flex items-center gap-2">
        <span className="text-accent-green font-bold text-lg tracking-tight">
          PERPSCOPE
        </span>
        <span className="text-text-muted text-xs">.io</span>
      </div>

      <div className="flex items-center gap-6">
        {PRICES.map((p) => (
          <div key={p.symbol} className="flex items-center gap-2 text-xs">
            <span className="text-text-secondary font-semibold">
              {p.symbol}
            </span>
            <span className="text-text-primary">${p.price}</span>
            <span
              className={
                p.change.startsWith("+")
                  ? "text-accent-green"
                  : "text-accent-red"
              }
            >
              {p.change}
            </span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
          <span className="text-text-muted text-[10px]">LIVE</span>
        </div>
      </div>
    </div>
  );
}
