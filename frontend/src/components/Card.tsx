"use client";

import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export default function Card({ title, children, className = "" }: CardProps) {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <span className="muted">//</span> {title}
      </div>
      <div className="card-body">{children}</div>

      <style jsx>{`
        .card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 4px;
          overflow: hidden;
        }
        .card-header {
          padding: 10px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
          color: var(--text-secondary);
        }
        .card-body {
          padding: 16px;
        }
      `}</style>
    </div>
  );
}
