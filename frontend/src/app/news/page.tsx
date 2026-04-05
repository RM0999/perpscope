"use client";

export default function NewsPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-105px)]">
      <div className="text-accent-green text-2xl font-bold mb-2">NEWS</div>
      <p className="text-text-muted text-xs">
        Filtered feed: direct, coin &amp; macro — coming soon
      </p>
      <div className="mt-6 border border-dashed border-border rounded px-8 py-4 text-text-secondary text-xs">
        Aggregated crypto news with smart filters
      </div>
    </div>
  );
}
