import json
import logging
from typing import List, Dict, Any, Optional
from fastapi import WebSocket

logger = logging.getLogger("safecircle.websocket")


class IncidentWebSocketManager:
    """
    Manages real-time WebSocket connections for Guardian command dashboards.
    Enables instantaneous broadcasting when:
    - Flow A Physical SOS is triggered
    - Live GPS or battery telemetry is refreshed
    - A new 4-second stealth audio/video chunk is cryptographically sealed
    - A guardian acknowledges, resolves, or updates their response status
    """

    def __init__(self):
        # List of all active WebSocket client connections
        self.active_connections: List[WebSocket] = []
        # Mapping of incident_id -> list of subscribed WebSockets
        self.incident_subscriptions: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, incident_id: Optional[str] = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        if incident_id:
            if incident_id not in self.incident_subscriptions:
                self.incident_subscriptions[incident_id] = []
            self.incident_subscriptions[incident_id].append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket, incident_id: Optional[str] = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if incident_id and incident_id in self.incident_subscriptions:
            if websocket in self.incident_subscriptions[incident_id]:
                self.incident_subscriptions[incident_id].remove(websocket)
        logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, event_type: str, data: Dict[str, Any], incident_id: Optional[str] = None):
        """
        Broadcast an event to all connected guardians or subscribers.
        """
        message = {
            "type": event_type,
            "incident_id": incident_id,
            "data": data
        }
        dead_connections = []
        # Broadcast to all active connections
        for conn in self.active_connections:
            try:
                await conn.send_json(message)
            except Exception as e:
                logger.warning(f"Error sending message to websocket client: {e}")
                dead_connections.append(conn)

        for dead in dead_connections:
            if dead in self.active_connections:
                self.active_connections.remove(dead)


# Global singleton instance
ws_manager = IncidentWebSocketManager()
