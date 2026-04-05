"use client";

import { useState, useEffect, useCallback } from "react";
import { getNews, type NewsItem } from "@/lib/api";

type NewsCategory = "all" | "direct" | "coin" | "macro";

const categoryColors: Record<string, string> = {
  direct: "var(--accent-green)",
  coin: "var(--accent-blue)",
  macro: "var(--accent-yellow)",
};

function timeAgo(timestamp: string): string {
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsPage() {
  const [category, setCategory] = useState<NewsCategory>("all");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const categories: { key: NewsCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "direct", label: "Direct" },
    { key: "coin", label: "Coin" },
    { key: "macro", label: "Macro" },
  ];

  const fetchNews = useCallback(async () => {
    setError("");
    try {
      const data = await getNews(category === "all" ? undefined : category);
      setNews(data);
    } catch {
      setError("Failed to load news");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    setLoading(true);
    fetchNews();
    const interval = setInterval(fetchNews, 60000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const filtered = news.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 style={{ color: "var(--accent-green)", marginBottom: "16px" }}>
        # News
      </h1>

      {/* Search input */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search news..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: "4px",
            color: "var(--text-primary)",
            fontFamily: "inherit",
            fontSize: "13px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

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
        {loading && (
          <span style={{ fontSize: "11px", color: "var(--text-muted)", alignSelf: "center", marginLeft: "8px" }}>
            Refreshing...
          </span>
        )}
      </div>

      {/* News items */}
      {error && news.length === 0 ? (
        <div style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>{error}</p>
        </div>
      ) : loading && news.length === 0 ? (
        <div style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>Loading news...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "4px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
            {search ? "No news matching your search" : "No news available"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              style={{
                padding: "16px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: "4px",
              }}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "2px",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "var(--bg-primary)",
                    background: categoryColors[item.category] || "var(--text-muted)",
                  }}
                >
                  {item.category.toUpperCase()}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "2px",
                    fontSize: "10px",
                    color: "var(--text-secondary)",
                    background: "var(--bg-hover)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {item.source}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)", marginLeft: "auto" }}>
                  {timeAgo(item.timestamp)}
                </span>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  lineHeight: "1.4",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {item.title}
              </a>
              <p style={{ color: "var(--text-secondary)", fontSize: "12px", lineHeight: "1.5", margin: 0 }}>
                {item.summary.length > 200 ? item.summary.slice(0, 200) + "..." : item.summary}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
