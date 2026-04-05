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
  takeProfitPrice: number | null;
  stopLossPrice: number | null;
}

export interface AccountSummary {
  accountValue: number;
  totalMarginUsed: number;
  totalNtlPos: number;
  withdrawable: number;
}

export interface PositionsResponse {
  positions: Position[];
  accountSummary: AccountSummary;
}

export interface Fill {
  coin: string;
  side: string;
  dir: string | null;
  size: number;
  price: number;
  time: string;
  fee: number;
  closedPnl: number;
}

export interface WindowPerformance {
  day: number | null;
  week: number | null;
  month: number | null;
  allTime: number | null;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string | null;
  accountValue: number;
  pnl: number;
  roi: number;
  volume: number;
  windowPerformances: WindowPerformance | null;
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
  limitPrice: number;
  triggerPrice: number | null;
  orderType: string;
  reduceOnly: boolean;
}

export async function getPositions(address: string): Promise<PositionsResponse> {
  return fetchApi(`/positions/${address}`);
}

export async function getFills(address: string, limit?: number): Promise<Fill[]> {
  const query = limit ? `?limit=${limit}` : "";
  return fetchApi(`/fills/${address}${query}`);
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

export async function getTopTraders(count?: number): Promise<unknown[]> {
  const query = count ? `?count=${count}` : "";
  return fetchApi(`/export/top-traders${query}`);
}

export function downloadTopTraders(count: number = 20) {
  window.open(`${API_BASE}/export/top-traders?count=${count}&download=true`, "_blank");
}
