"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "TRACKER" },
  { href: "/copytrade", label: "COPY TRADE" },
  { href: "/news", label: "NEWS" },
  { href: "/leaderboard", label: "LEADERBOARD" },
  { href: "/portfolio", label: "PORTFOLIO" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-0 px-6 border-b border-border bg-bg-primary">
      {TABS.map((tab) => {
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-5 py-3 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
              isActive
                ? "text-accent-green border-accent-green"
                : "text-text-secondary border-transparent hover:text-text-primary"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
