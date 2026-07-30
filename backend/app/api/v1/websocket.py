"""
WebSocket 端点 - 实时数据推送
"""
import json
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(tags=["WebSocket"])


class ConnectionManager:
    """WebSocket 连接管理器"""

    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass


manager = ConnectionManager()


@router.websocket("/ws/realtime")
async def websocket_realtime(websocket: WebSocket):
    """实时数据推送 WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # 接收客户端消息（如订阅请求）
            data = await websocket.receive_text()
            msg = json.loads(data)

            # 处理订阅请求
            if msg.get("type") == "subscribe":
                await websocket.send_json({
                    "type": "subscribed",
                    "channel": msg.get("channel", "general"),
                })
    except WebSocketDisconnect:
        manager.disconnect(websocket)


@router.websocket("/ws/warnings")
async def websocket_warnings(websocket: WebSocket):
    """预警事件实时推送 WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # 保持连接
            await websocket.send_json({"type": "heartbeat"})
    except WebSocketDisconnect:
        manager.disconnect(websocket)
