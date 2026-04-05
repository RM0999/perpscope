const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function getPositions(wallet: string) {
  return fetchAPI(`/api/positions/${wallet}`);
}

export async function getOpenOrders(wallet: string) {
  return fetchAPI(`/api/orders/${wallet}`);
}

export async function getTrades(wallet: string) {
  return fetchAPI(`/api/trades/${wallet}`);
}

export async function getLeaderboard() {
  return fetchAPI("/api/leaderboard");
}
