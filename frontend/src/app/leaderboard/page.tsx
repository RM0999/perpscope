"use client";

export default function LeaderboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-105px)]">
      <div className="text-accent-green text-2xl font-bold mb-2">
        LEADERBOARD
      </div>
      <p className="text-text-muted text-xs">
        Podium + ranked table — coming soon
      </p>
      <div className="mt-6 border border-dashed border-border rounded px-8 py-4 text-text-secondary text-xs">
        Top performers ranked by PnL &amp; ROI
      </div>
    </div>
  );
}
