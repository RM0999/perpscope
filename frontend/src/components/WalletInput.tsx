"use client";

import React, { useState } from "react";

interface Props {
  onSubmit: (address: string) => void;
  placeholder?: string;
}

export default function WalletInput({ onSubmit, placeholder = "Enter wallet address (0x...)" }: Props) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="wallet-input">
      <span className="prompt green">{">"}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      <button type="submit">TRACK</button>

      <style jsx>{`
        .wallet-input {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 4px;
          padding: 8px 12px;
        }
        .prompt {
          font-weight: 700;
          font-size: 16px;
        }
        input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-family: 'JetBrains Mono', monospace;
          font-size: 14px;
          outline: none;
        }
        input::placeholder {
          color: var(--text-muted);
        }
        button {
          background: var(--accent-green);
          color: var(--bg-primary);
          border: none;
          padding: 6px 16px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          border-radius: 3px;
          cursor: pointer;
          transition: opacity 0.15s;
        }
        button:hover {
          opacity: 0.85;
        }
      `}</style>
    </form>
  );
}
