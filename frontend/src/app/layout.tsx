import type { Metadata } from "next";
import "./globals.css";
import TopBar from "@/components/TopBar";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "PerpScope — Perpetual Futures Intelligence",
  description:
    "Track perpetual futures positions, copy trades, and analyze performance.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <TopBar />
        <NavBar />
        <main className="flex-1 px-6 py-5 overflow-auto">{children}</main>
      </body>
    </html>
  );
}
