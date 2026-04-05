# PerpScope

Perpetual futures intelligence platform. Dark terminal aesthetic, powered by Hyperliquid.

## Quick Start

### Backend (FastAPI)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- **Tracker** — monitor wallet positions in real-time
- **Copy Trade** — mirror trades from top wallets
- **News** — filtered market intelligence feed
- **Leaderboard** — top traders ranked by PnL
- **Portfolio** — performance analytics and trade history
