import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "PerpScope — Perpetual Futures Intelligence",
  description: "Track perpetual futures positions, copy trades, and analyze performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />
          <main style={{ flex: 1, padding: "24px", overflow: "auto" }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
