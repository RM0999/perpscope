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

export interface PortfolioPerformance {
  accountValue: number;
  allTimePnl: number;
  allTimeRoi: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pnlByDay: { day: string; pnl: number; accountValue: number }[];
}

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

export async function getAllMids(): Promise<Record<string, string>> {
  return hlPost<Record<string, string>>({ type: "allMids" });
}

export async function getPositions(address: string): Promise<PositionsResponse> {
  const [state, orders, mids] = await Promise.all([
    hlPost<Record<string, unknown>>({ type: "clearinghouseState", user: address }),
    hlPost<Record<string, unknown>[]>({ type: "frontendOpenOrders", user: address }),
    getAllMids(),
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

    const entryPx = parseFloat(String(pos.entryPx || "0"));
    const markPx = parseFloat(String(pos.markPx || mids[coin] || "0"));
    const absSize = Math.abs(size);
    const rawUpnl = parseFloat(String(pos.unrealizedPnl || "0"));
    const computedUpnl = rawUpnl !== 0 ? rawUpnl : (markPx - entryPx) * size;
    const rawLiqPx = pos.liquidationPx ? parseFloat(String(pos.liquidationPx)) : null;
    const liqPx = (rawLiqPx !== null && isFinite(rawLiqPx) && rawLiqPx > 0 && rawLiqPx < 1_000_000) ? rawLiqPx : null;

    positions.push({
      coin,
      direction: size > 0 ? "LONG" : "SHORT",
      size: absSize,
      entryPrice: entryPx,
      markPrice: markPx,
      leverage: parseFloat(String(lev.value || "1")),
      marginMode: lev.type === "cross" ? "Cross" : "Isolated",
      unrealizedPnl: computedUpnl,
      liquidationPrice: liqPx,
      returnOnEquity: parseFloat(String(pos.returnOnEquity || "0")),
      positionValue: absSize * markPx,
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

// Fetch live account data for a list of wallet addresses
export async function fetchWalletSummaries(addresses: string[]): Promise<LeaderboardEntry[]> {
  const results = await Promise.allSettled(
    addresses.map(async (address, i) => {
      const state = await hlPost<Record<string, unknown>>({ type: "clearinghouseState", user: address });
      const margin = (state.marginSummary || {}) as Record<string, string>;
      const accountValue = parseFloat(margin.accountValue || "0");
      const positions = ((state.assetPositions || []) as Record<string, unknown>[])
        .filter((ap) => {
          const pos = (ap.position || ap) as Record<string, string>;
          return parseFloat(pos.szi || "0") !== 0;
        });
      const totalUpnl = positions.reduce((sum, ap) => {
        const pos = (ap.position || ap) as Record<string, string>;
        return sum + parseFloat(pos.unrealizedPnl || "0");
      }, 0);
      return {
        rank: i + 1,
        address,
        displayName: null,
        accountValue,
        pnl: totalUpnl,
        roi: accountValue > 0 ? (totalUpnl / accountValue) * 100 : 0,
        volume: 0,
        windowPerformances: null,
        openPositions: positions.length,
      } as LeaderboardEntry & { openPositions: number };
    })
  );

  return results
    .filter((r): r is PromiseFulfilledResult<LeaderboardEntry & { openPositions: number }> => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => b.accountValue - a.accountValue)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export async function getPortfolio(address: string): Promise<PortfolioPerformance> {
  // Fetch portfolio performance + current account state in parallel
  const [portfolio, state] = await Promise.all([
    hlPost<unknown>({ type: "portfolio", user: address }),
    hlPost<Record<string, unknown>>({ type: "clearinghouseState", user: address }),
  ]);

  const margin = (state.marginSummary || {}) as Record<string, string>;
  const accountValue = parseFloat(margin.accountValue || "0");
  const withdrawable = parseFloat(margin.withdrawable || "0");

  // Parse portfolio response — structure varies, handle gracefully
  let allTimePnl = 0;
  let allTimeRoi = 0;
  let totalDeposits = 0;
  let totalWithdrawals = 0;
  const pnlByDay: { day: string; pnl: number; accountValue: number }[] = [];

  if (portfolio && typeof portfolio === "object") {
    const p = portfolio as Record<string, unknown>;

    // Try to extract cumulative PnL data
    if (Array.isArray(p.clearinghousePortfolioTimeline)) {
      for (const entry of p.clearinghousePortfolioTimeline) {
        const e = entry as Record<string, unknown>;
        const ts = e.timestamp ? String(e.timestamp) : "";
        const av = parseFloat(String(e.accountValue || "0"));
        const cpnl = parseFloat(String(e.cumulativePnl || "0"));
        if (ts) {
          pnlByDay.push({
            day: ts.slice(0, 10),
            pnl: cpnl,
            accountValue: av,
          });
        }
      }
    }

    // Extract totals
    if (p.allTimePnl != null) allTimePnl = parseFloat(String(p.allTimePnl));
    if (p.allTimeRoi != null) allTimeRoi = parseFloat(String(p.allTimeRoi));
    if (p.totalDeposits != null) totalDeposits = parseFloat(String(p.totalDeposits));
    if (p.totalWithdrawals != null) totalWithdrawals = parseFloat(String(p.totalWithdrawals));

    // If allTimePnl wasn't at the top level, compute from timeline
    if (allTimePnl === 0 && pnlByDay.length > 0) {
      allTimePnl = pnlByDay[pnlByDay.length - 1].pnl;
    }
  }

  // Compute ROI from account value and deposits if not provided
  if (allTimeRoi === 0 && totalDeposits > 0) {
    allTimeRoi = allTimePnl / totalDeposits;
  }

  // If we still don't have deposits, estimate from accountValue - PnL - withdrawable
  if (totalDeposits === 0 && accountValue > 0) {
    totalDeposits = accountValue - allTimePnl + totalWithdrawals;
  }

  return {
    accountValue,
    allTimePnl,
    allTimeRoi,
    totalDeposits: Math.max(0, totalDeposits),
    totalWithdrawals,
    pnlByDay,
  };
}
