"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "~" },
  { href: "/tracker", label: "Tracker", icon: "$" },
  { href: "/copytrade", label: "Copy Trade", icon: ">" },
  { href: "/news", label: "News", icon: "#" },
  { href: "/leaderboard", label: "Leaderboard", icon: "^" },
  { href: "/portfolio", label: "Portfolio", icon: "%" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: "200px",
        borderRight: "1px solid var(--border)",
        padding: "24px 0",
        background: "var(--bg-secondary)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: "0 16px 24px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "16px",
        }}
      >
        <span style={{ color: "var(--accent-green)", fontWeight: 700, fontSize: "16px" }}>
          PerpScope
        </span>
        <span style={{ color: "var(--text-muted)", fontSize: "10px", display: "block" }}>
          v0.1.0
        </span>
      </div>

      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 16px",
              color: isActive ? "var(--accent-green)" : "var(--text-secondary)",
              background: isActive ? "var(--bg-hover)" : "transparent",
              borderLeft: isActive ? "2px solid var(--accent-green)" : "2px solid transparent",
              textDecoration: "none",
              fontSize: "13px",
              transition: "all 0.15s",
            }}
          >
            <span style={{ opacity: 0.5 }}>{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
