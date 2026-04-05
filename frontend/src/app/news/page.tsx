"use client";

import { useState } from "react";

type NewsCategory = "all" | "direct" | "coin" | "macro";

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("all");

  const categories: { key: NewsCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "direct", label: "Direct" },
    { key: "coin", label: "Coin" },
    { key: "macro", label: "Macro" },
  ];

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        # News
      </h1>

      {/* Category filter */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCategory(c.key)}
            style={{
              padding: "6px 14px",
              background: category === c.key ? "var(--accent-green)" : "var(--bg-card)",
              color: category === c.key ? "var(--bg-primary)" : "var(--text-secondary)",
              border: `1px solid ${category === c.key ? "var(--accent-green)" : "var(--border)"}`,
              borderRadius: "4px",
              fontFamily: "inherit",
              fontSize: "12px",
              cursor: "pointer",
              fontWeight: category === c.key ? 600 : 400,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* News items placeholder */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            Filtered news feed will be displayed here. Category: {category}
          </p>
        </div>
      </div>
    </div>
  );
}
