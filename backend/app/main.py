from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import positions, fills, leaderboard, orders

app = FastAPI(title="PerpScope API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(positions.router, prefix="/api")
app.include_router(fills.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(orders.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "perpscope"}
