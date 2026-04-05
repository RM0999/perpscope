import asyncio
import json
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import websockets

router = APIRouter()
logger = logging.getLogger(__name__)

HYPERLIQUID_WS = "wss://api.hyperliquid.xyz/ws"


@router.websocket("/api/ws/fills/{address}")
async def ws_fills(websocket: WebSocket, address: str):
    """Stream real-time fill events for a given wallet address."""
    await websocket.accept()

    upstream = None
    try:
        upstream = await websockets.connect(HYPERLIQUID_WS)

        # Subscribe to user fills on the Hyperliquid WebSocket
        subscribe_msg = json.dumps({
            "method": "subscribe",
            "subscription": {
                "type": "userFills",
                "user": address,
            },
        })
        await upstream.send(subscribe_msg)
        logger.info("Subscribed to fills for %s", address)

        # Forward messages from Hyperliquid to the client
        while True:
            try:
                raw = await asyncio.wait_for(upstream.recv(), timeout=30.0)
            except asyncio.TimeoutError:
                # Send a ping to keep the client connection alive
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    break
                continue

            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                continue

            # Forward the fill event to the connected client
            await websocket.send_json(data)

    except WebSocketDisconnect:
        logger.info("Client disconnected for %s", address)
    except websockets.exceptions.ConnectionClosed:
        logger.warning("Hyperliquid WS closed for %s", address)
        try:
            await websocket.send_json({
                "type": "error",
                "message": "Upstream connection closed",
            })
        except Exception:
            pass
    except Exception as exc:
        logger.error("WS error for %s: %s", address, exc)
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(exc),
            })
        except Exception:
            pass
    finally:
        if upstream is not None:
            try:
                await upstream.close()
            except Exception:
                pass
        try:
            await websocket.close()
        except Exception:
            pass
