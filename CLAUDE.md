# CLAUDE.md — PerpScope

## Project
PerpScope is a perpetual futures intelligence platform. Terminal/monospace dark aesthetic.

## Stack
- Frontend: Next.js + React, dark theme, JetBrains Mono font
- Backend: Python FastAPI
- Database: PostgreSQL (or SQLite for MVP)
- Data source: Hyperliquid API (https://api.hyperliquid.xyz/info)

## Key Hyperliquid Endpoints
- clearinghouseState → wallet positions (size, leverage, margin mode, PnL)
- frontendOpenOrders → TP/SL levels
- userFills → trade history
- leaderboard → top traders
- vaultSummaries → vault leader addresses
- WebSocket wss://api.hyperliquid.xyz/ws → real-time fill alerts

## Pages
1. Tracker — positions left, news feed right
2. Copy Trade — wallet selector, filter config, trade log
3. News — filtered feed (direct/coin/macro)
4. Leaderboard — podium + ranked table
5. Portfolio — PnL curve, performance stats, trade history

## Deploy
Vultr Frankfurt (140.82.37.229), scp + screen pattern

## Development
- Frontend: `cd frontend && npm run dev` (port 3000)
- Backend: `cd backend && uvicorn app.main:app --reload` (port 8000)
- Install frontend deps: `cd frontend && npm install`
- Install backend deps: `cd backend && pip install -r requirements.txt`
