const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface Position {
  coin: string;
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  marginMode: string;
  unrealizedPnl: number;
  liquidationPrice: number | null;
}

export interface Fill {
  coin: string;
  side: string;
  size: number;
  price: number;
  time: string;
  fee: number;
  closedPnl: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  pnl: number;
  roi: number;
  volume: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  category: string;
  url: string;
  timestamp: string;
}

export interface Vault {
  name: string;
  leaderAddress: string;
  tvl: number;
  pnl: number;
  apr: number;
}

export interface Order {
  coin: string;
  side: string;
  size: number;
  price: number;
  triggerPrice: number | null;
  orderType: string;
}

export async function getPositions(address: string): Promise<Position[]> {
  return fetchApi(`/positions/${address}`);
}

export async function getFills(address: string): Promise<Fill[]> {
  return fetchApi(`/fills/${address}`);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  return fetchApi("/leaderboard");
}

export async function getOpenOrders(address: string): Promise<Order[]> {
  return fetchApi(`/orders/${address}`);
}

export async function getNews(category?: string): Promise<NewsItem[]> {
  const query = category && category !== "all" ? `?category=${category}` : "";
  return fetchApi(`/news${query}`);
}

export async function getVaults(): Promise<Vault[]> {
  return fetchApi("/vaults");
}
