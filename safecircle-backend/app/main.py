import os
import uuid
import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, SessionLocal, Base
from app import models
from app.routers import users, incidents, evidence

logger = logging.getLogger("safecircle")
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")


def seed_demo_data():
    """
    Auto-seeds the demo user ('Shreya'), trusted contacts, and the exact
    synced incidents SC-2026-0142 (Physical SOS) and SC-2026-0138 (Digital Report).
    """
    db = SessionLocal()
    try:
        shreya = db.query(models.User).filter(models.User.phone == "+91 98765 43210").first()
        if not shreya:
            shreya = models.User(
                id=str(uuid.uuid4()),
                name="Shreya",
                phone="+91 98765 43210",
                email="shreya@safecircle.internal"
            )
            db.add(shreya)
            db.flush()

            # Trusted Contacts
            c1 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=shreya.id,
                name="Aditi Sharma",
                relationship_role="Sister / Primary Contact",
                phone="+91 98765 43211",
                telegram_chat_id="123456789",
                is_primary_sos=True
            )
            c2 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=shreya.id,
                name="Pooja Sharma (PS)",
                relationship_role="Circle Member",
                phone="+91 98765 43212",
                telegram_chat_id="987654321",
                is_primary_sos=False
            )
            c3 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=shreya.id,
                name="Rohan Mehta (RM)",
                relationship_role="Circle Member",
                phone="+91 98765 43213",
                telegram_chat_id="555555555",
                is_primary_sos=False
            )
            c4 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=shreya.id,
                name="Kavita S (KS)",
                relationship_role="Circle Member",
                phone="+91 98765 43214",
                telegram_chat_id="444444444",
                is_primary_sos=False
            )
            db.add_all([c1, c2, c3, c4])
            db.flush()

        # Seed Incident 1: SC-2026-0142 (Physical SOS)
        inc1 = db.query(models.Incident).filter(models.Incident.id == "SC-2026-0142").first()
        if not inc1:
            inc1 = models.Incident(
                id="SC-2026-0142",
                user_id=shreya.id,
                incident_type=models.IncidentType.PHYSICAL_SOS.value,
                status=models.IncidentStatus.ACTIVE.value,
                access_token="sc_live_tok_0142_physical",
                initial_lat=12.9756,
                initial_lng=77.6066,
                current_lat=12.9850,
                current_lng=77.5850,
                battery_level=76,
                trigger_mode="Calculator Camouflage 112=",
                description="Physical Emergency SOS triggered via Calculator Camouflage 112= along MG Road to Malleswaram transit route."
            )
            db.add(inc1)
            db.flush()

            # Evidence for SC-2026-0142
            ev1 = models.Evidence(
                id=str(uuid.uuid4()),
                incident_id=inc1.id,
                evidence_type=models.EvidenceType.STEALTH_AUDIO_CHUNK.value,
                file_url="ambient_cab_audio_01.webm",
                raw_text=None,
                sha256_hash="8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
                file_size_bytes=196608,
                chunk_index=0,
                captured_lat=12.9850,
                captured_lng=77.5850
            )
            db.add(ev1)

            # Timeline events for SC-2026-0142
            t1 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc1.id,
                event_type=models.TimelineEventType.SOS_TRIGGERED.value,
                title="Physical Emergency SOS Activated",
                description="Triggered via Calculator Camouflage (PIN: 112=) from MG Road, Bengaluru.",
                metadata_json={"trigger_mode": "Calculator Camouflage 112=", "battery": 76, "time_ist": "5:09 PM IST"}
            )
            t2 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc1.id,
                event_type=models.TimelineEventType.TELEGRAM_ALERT_SENT.value,
                title="Telegram Dispatch Sent",
                description="Emergency alert and live Guardian stream link dispatched to Aditi Sharma and Circle (PS, RM, KS).",
                metadata_json={"recipient": "Aditi Sharma (+91 98765 43211)", "circle": ["PS", "RM", "KS"]}
            )
            t3 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc1.id,
                event_type=models.TimelineEventType.EVIDENCE_HASHED.value,
                title="Audio Evidence Sealed",
                description="Captured ambient audio buffer (0:14) cryptographically hashed with SHA-256 seal (8f434346648f...).",
                metadata_json={"filename": "ambient_cab_audio_01.webm", "duration": "0:14", "sha256": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"}
            )
            db.add_all([t1, t2, t3])

        # Seed Incident 2: SC-2026-0138 (Digital Threat Report from Mobile Vault)
        inc2 = db.query(models.Incident).filter(models.Incident.id == "SC-2026-0138").first()
        if not inc2:
            inc2 = models.Incident(
                id="SC-2026-0138",
                user_id=shreya.id,
                incident_type=models.IncidentType.DIGITAL_THREAT.value,
                status=models.IncidentStatus.ACKNOWLEDGED.value,
                access_token="sc_vault_tok_0138_digital",
                trigger_mode="DIGITAL_SUBMISSION",
                description="User-Generated Digital Harassment Report — Preserved from Mobile Evidence Vault.",
                ai_category="Cyberstalking, Impersonation & Imminent Physical Threat",
                ai_severity="CRITICAL",
                ai_summary="Suspect Unknown_User_88 sent coercive threats with explicit intent of physical confrontation ('I'm coming for you tomorrow'). Stolen photographs used in impersonation profile @shreya_official_xx.",
                shared_with_contact_name="Aditi Sharma"
            )
            db.add(inc2)
            db.flush()

            # 3 Vault Items
            ev_d1 = models.Evidence(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                evidence_type=models.EvidenceType.SCREENSHOT.value,
                file_url="chat_unknown_user_88.jpg",
                raw_text="Unknown_User_88: I know where you study. Stop ignoring me. You're making a big mistake. I'm coming for you tomorrow. Reply now or I'll just show up.",
                sha256_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                file_size_bytes=421888,
                chunk_index=0
            )
            ev_d2 = models.Evidence(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                evidence_type=models.EvidenceType.SCREENSHOT.value,
                file_url="fake_account_profile.jpg",
                raw_text="Impersonation profile @shreya_official_xx using stolen photos.",
                sha256_hash="4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
                file_size_bytes=333824,
                chunk_index=1
            )
            ev_d3 = models.Evidence(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                evidence_type=models.EvidenceType.SCREENSHOT.value,
                file_url="impersonation_message.jpg",
                raw_text="Phishing/OTP request message sent to contacts impersonating victim.",
                sha256_hash="ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d",
                file_size_bytes=351232,
                chunk_index=2
            )
            db.add_all([ev_d1, ev_d2, ev_d3])

            td1 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                event_type=models.TimelineEventType.EVIDENCE_HASHED.value,
                title="Mobile Vault Dossier Created",
                description="Victim preserved 3 screenshot exhibits with SHA-256 fingerprinting.",
                metadata_json={"item_count": 3}
            )
            td2 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                event_type=models.TimelineEventType.AI_TRIAGE_COMPLETED.value,
                title="AI Threat Classification: CRITICAL",
                description="Assessed as Cyberstalking, Impersonation & Imminent Physical Threat. Escalation trigger: 'I'm coming for you tomorrow'.",
                metadata_json={"severity": "CRITICAL", "category": "Cyberstalking, Impersonation & Imminent Physical Threat"}
            )
            td3 = models.TimelineEvent(
                id=str(uuid.uuid4()),
                incident_id=inc2.id,
                event_type=models.TimelineEventType.REPORT_SHARED.value,
                title="Vault Shared with Guardian",
                description="Dossier securely linked to Aditi Sharma with Section 65B audit custody.",
                metadata_json={"recipient": "Aditi Sharma"}
            )
            db.add_all([td1, td2, td3])

        db.commit()
        logger.info("Successfully seeded/synced Shreya demo incidents (SC-2026-0142 & SC-2026-0138).")
    except Exception as exc:
        logger.error(f"Error during demo data seeding: {exc}")
        db.rollback()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown routines."""
    # Ensure storage directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Create tables
    Base.metadata.create_all(bind=engine)

    # Seed demo user and contacts
    seed_demo_data()

    logger.info("SafeCircle backend initialized and ready for requests.")
    yield
    logger.info("SafeCircle backend shutting down.")


app = FastAPI(
    title="SafeCircle — Unified Women's Safety & Digital Harassment Vault API",
    description=(
        "Production-ready backend powering both Physical Emergency SOS (stealth black-screen "
        "streaming with live audio/video chunks) and Digital Harassment Evidence Preservation "
        "(SHA-256 chain-of-custody, AI threat triage, and statutory forensic reporting)."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Enable full wildcard CORS so Frontend devs never hit CORS blocks
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files to serve uploaded video/audio chunks & screenshots directly
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include Routers
app.include_router(users.router)
app.include_router(incidents.router)
app.include_router(evidence.router)

from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ws_manager

@app.websocket("/ws/incidents")
async def websocket_incidents_feed(websocket: WebSocket):
    """
    Real-time WebSocket feed for Guardian dashboards.
    Receives instantaneous SOS triggers, GPS telemetry updates, evidence uploads,
    and guardian response status changes without polling.
    """
    await ws_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive; clients can also send heartbeat or client messages
            msg = await websocket.receive_text()
            logger.debug(f"Received WS message: {msg}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as exc:
        logger.warning(f"WebSocket error: {exc}")
        ws_manager.disconnect(websocket)

@app.websocket("/ws/incidents/{incident_id}")
async def websocket_single_incident(websocket: WebSocket, incident_id: str):
    await ws_manager.connect(websocket, incident_id=incident_id)
    try:
        while True:
            msg = await websocket.receive_text()
            logger.debug(f"Received WS message for {incident_id}: {msg}")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, incident_id=incident_id)
    except Exception as exc:
        logger.warning(f"WebSocket error: {exc}")
        ws_manager.disconnect(websocket, incident_id=incident_id)


@app.get("/", tags=["System"])
def root():
    return {
        "service": "SafeCircle Backend API",
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "timestamp_utc": datetime.now(timezone.utc).isoformat()
    }


@app.get("/health", tags=["System"])
def health_check():
    """System health check endpoint verifying database connectivity."""
    db_ok = True
    try:
        db = SessionLocal()
        db.execute(models.User.__table__.select().limit(1))
        db.close()
    except Exception:
        db_ok = False

    return {
        "status": "healthy" if db_ok else "degraded",
        "database": "connected" if db_ok else "disconnected",
        "uploads_directory": settings.UPLOAD_DIR,
        "environment": settings.APP_ENV,
        "timestamp_utc": datetime.now(timezone.utc).isoformat()
    }
