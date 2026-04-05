"use client";

import { useState } from "react";
import Card from "@/components/Card";

type NewsCategory = "all" | "direct" | "coin" | "macro";

interface NewsItem {
  id: string;
  title: string;
  category: NewsCategory;
  source: string;
  timestamp: string;
  summary: string;
}

export default function NewsPage() {
  const [filter, setFilter] = useState<NewsCategory>("all");
  const [news] = useState<NewsItem[]>([]);

  const categories: NewsCategory[] = ["all", "direct", "coin", "macro"];

  return (
    <div className="news-layout">
      <div className="page-header">
        <h1><span className="green">$</span> News</h1>
        <p className="muted">Filtered market intelligence feed</p>
      </div>

      <div className="filter-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="news-list">
        {news.length === 0 ? (
          <Card title="Feed">
            <div className="muted">
              <p>// No news items yet</p>
              <p>// Connect backend to enable news feed</p>
            </div>
          </Card>
        ) : (
          news
            .filter((n) => filter === "all" || n.category === filter)
            .map((item) => (
              <Card key={item.id} title={item.source}>
                <div className="news-item">
                  <div className="news-meta">
                    <span className={`category-tag ${item.category}`}>{item.category}</span>
                    <span className="muted">{item.timestamp}</span>
                  </div>
                  <h3>{item.title}</h3>
                  <p className="muted">{item.summary}</p>
                </div>
              </Card>
            ))
        )}
      </div>

      <style jsx>{`
        .news-layout {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .page-header h1 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .filter-bar {
          display: flex;
          gap: 8px;
        }
        .filter-btn {
          background: var(--bg-card);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          padding: 6px 16px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .filter-btn:hover {
          border-color: var(--text-muted);
        }
        .filter-btn.active {
          background: var(--accent-green);
          color: var(--bg-primary);
          border-color: var(--accent-green);
          font-weight: 600;
        }
        .news-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .news-item h3 {
          font-size: 14px;
          margin: 8px 0 4px;
        }
        .news-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
        }
        .category-tag {
          padding: 2px 8px;
          border-radius: 2px;
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
        }
        .category-tag.direct { background: var(--accent-green); color: var(--bg-primary); }
        .category-tag.coin { background: var(--accent-yellow); color: var(--bg-primary); }
        .category-tag.macro { background: var(--accent-blue); color: var(--bg-primary); }
      `}</style>
    </div>
  );
}
