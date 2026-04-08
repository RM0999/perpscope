const HL_API = "https://api.hyperliquid.xyz/info";

async function hlPost<T>(payload: object): Promise<T> {
  const res = await fetch(HL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Hyperliquid API error: ${res.status}`);
  return res.json();
}

// ── Types ──

export interface Position {
  coin: string;
  direction: "LONG" | "SHORT";
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  marginMode: string;
  unrealizedPnl: number;
  liquidationPrice: number | null;
  returnOnEquity: number;
  positionValue: number;
  marginUsed: number;
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
  rawTime: number;
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

export interface Order {
  coin: string;
  side: string;
  size: number;
  limitPrice: number;
  triggerPrice: number | null;
  orderType: string;
  reduceOnly: boolean;
}

// ── API functions (all direct to Hyperliquid) ──

export async function getPositions(address: string): Promise<PositionsResponse> {
  const [state, orders] = await Promise.all([
    hlPost<Record<string, unknown>>({ type: "clearinghouseState", user: address }),
    hlPost<Record<string, unknown>[]>({ type: "frontendOpenOrders", user: address }),
  ]);

  // Build TP/SL map from orders
  const tpSl: Record<string, { tp: number | null; sl: number | null }> = {};
  const orderList = Array.isArray(orders) ? orders : [];
  for (const o of orderList) {
    const coin = String(o.coin || "");
    if (!tpSl[coin]) tpSl[coin] = { tp: null, sl: null };
    const otype = String(o.orderType || "");
    const trigger = o.triggerPx ? Number(o.triggerPx) : null;
    if (otype.includes("Take Profit") && trigger) tpSl[coin].tp = trigger;
    else if (otype.includes("Stop") && o.reduceOnly && trigger) tpSl[coin].sl = trigger;
  }

  // Parse margin summary
  const margin = (state.marginSummary || {}) as Record<string, string>;
  const accountSummary: AccountSummary = {
    accountValue: parseFloat(margin.accountValue || "0"),
    totalMarginUsed: parseFloat(margin.totalMarginUsed || "0"),
    totalNtlPos: parseFloat(margin.totalNtlPos || "0"),
    withdrawable: parseFloat(margin.withdrawable || "0"),
  };

  // Parse positions
  const assetPositions = (state.assetPositions || []) as Record<string, unknown>[];
  const positions: Position[] = [];
  for (const ap of assetPositions) {
    const pos = (ap.position || ap) as Record<string, unknown>;
    const size = parseFloat(String(pos.szi || "0"));
    if (size === 0) continue;
    const coin = String(pos.coin || "");
    const lev = (pos.leverage || {}) as Record<string, string>;
    const coinTpSl = tpSl[coin] || { tp: null, sl: null };

    positions.push({
      coin,
      direction: size > 0 ? "LONG" : "SHORT",
      size: Math.abs(size),
      entryPrice: parseFloat(String(pos.entryPx || "0")),
      markPrice: parseFloat(String(pos.markPx || "0")),
      leverage: parseFloat(String(lev.value || "1")),
      marginMode: lev.type === "cross" ? "Cross" : "Isolated",
      unrealizedPnl: parseFloat(String(pos.unrealizedPnl || "0")),
      liquidationPrice: pos.liquidationPx ? parseFloat(String(pos.liquidationPx)) : null,
      returnOnEquity: parseFloat(String(pos.returnOnEquity || "0")),
      positionValue: parseFloat(String(pos.positionValue || "0")),
      marginUsed: parseFloat(String(pos.marginUsed || "0")),
      takeProfitPrice: coinTpSl.tp,
      stopLossPrice: coinTpSl.sl,
    });
  }

  return { positions, accountSummary };
}

export async function getOpenOrders(address: string): Promise<Order[]> {
  const data = await hlPost<Record<string, unknown>[]>({ type: "frontendOpenOrders", user: address });
  const orderList = Array.isArray(data) ? data : [];
  return orderList.map((o) => ({
    coin: String(o.coin || ""),
    side: String(o.side || ""),
    size: parseFloat(String(o.sz || "0")),
    limitPrice: parseFloat(String(o.limitPx || "0")),
    triggerPrice: o.triggerPx ? parseFloat(String(o.triggerPx)) : null,
    orderType: String(o.orderType || ""),
    reduceOnly: Boolean(o.reduceOnly),
  }));
}

export async function getFills(address: string, limit?: number): Promise<Fill[]> {
  const data = await hlPost<Record<string, unknown>[]>({ type: "userFills", user: address });
  const fills = Array.isArray(data) ? data : [];
  const sliced = limit ? fills.slice(0, limit) : fills;
  return sliced.map((f) => {
    const ts = f.time ? Number(f.time) : 0;
    const dateStr = ts > 0
      ? new Date(ts).toLocaleString("en-US", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
      : "";
    return {
      coin: String(f.coin || ""),
      side: String(f.side || ""),
      dir: f.dir ? String(f.dir) : null,
      size: parseFloat(String(f.sz || "0")),
      price: parseFloat(String(f.px || "0")),
      time: dateStr,
      rawTime: ts,
      fee: parseFloat(String(f.fee || "0")),
      closedPnl: parseFloat(String(f.closedPnl || "0")),
    };
  });
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const data = await hlPost<Record<string, unknown>>({ type: "leaderboard" });
  const rows = (data.leaderboardRows || data) as Record<string, unknown>[];
  if (!Array.isArray(rows)) return [];

  return rows.map((row, i) => {
    const perfs = (row.windowPerformances || []) as [string, Record<string, string>][];
    const wp: WindowPerformance = { day: null, week: null, month: null, allTime: null };
    for (const [window, vals] of perfs) {
      const pnl = vals?.pnl != null ? parseFloat(String(vals.pnl)) : null;
      if (window === "day") wp.day = pnl;
      else if (window === "week") wp.week = pnl;
      else if (window === "month") wp.month = pnl;
      else if (window === "allTime") wp.allTime = pnl;
    }

    return {
      rank: i + 1,
      address: String(row.ethAddress || ""),
      displayName: row.displayName ? String(row.displayName) : null,
      accountValue: parseFloat(String(row.accountValue || "0")),
      pnl: parseFloat(String(row.accountValue || "0")),
      roi: parseFloat(String(row.roi || "0")) * 100,
      volume: parseFloat(String(row.volume || "0")),
      windowPerformances: wp,
    };
  });
}

export async function getVaults(): Promise<{ name: string; leaderAddress: string; tvl: number; pnl: number; apr: number }[]> {
  const data = await hlPost<Record<string, unknown>[]>({ type: "vaultSummaries" });
  if (!Array.isArray(data)) return [];
  return data
    .map((v) => {
      const s = (v.summary || v) as Record<string, string>;
      return {
        name: String(s.name || "Unknown"),
        leaderAddress: String(s.leader || s.leaderAddress || ""),
        tvl: parseFloat(String(s.tvl || "0")),
        pnl: parseFloat(String(s.allTimePnl || s.totalPnl || "0")),
        apr: s.apr != null ? parseFloat(String(s.apr)) : 0,
      };
    })
    .sort((a, b) => b.tvl - a.tvl);
}
