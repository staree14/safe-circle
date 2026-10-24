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
    Auto-seeds the demo user ('Sreeya') and 3 trusted contacts on first boot.
    Ensures both Mobile PWA (Person 1) and Guardian Dashboard (Person 3)
    can operate immediately with zero configuration friction.
    """
    db = SessionLocal()
    try:
        user_count = db.query(models.User).count()
        if user_count == 0:
            logger.info("Database is empty. Seeding demo user 'Sreeya' and 3 trusted contacts...")

            # 1. Primary demo user: Sreeya
            sreeya = models.User(
                id=str(uuid.uuid4()),
                name="Sreeya",
                phone="+91 98765 43210",
                email="sreeya@safecircle.internal"
            )
            db.add(sreeya)
            db.flush()

            # 2. Trusted Contacts
            c1 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=sreeya.id,
                name="Aditi Sharma",
                relationship_role="Sister",
                phone="+91 98765 43211",
                telegram_chat_id="123456789",
                is_primary_sos=True
            )
            c2 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=sreeya.id,
                name="Dr. Rajiv Chand",
                relationship_role="Father",
                phone="+91 98765 43212",
                telegram_chat_id="987654321",
                is_primary_sos=False
            )
            c3 = models.TrustedContact(
                id=str(uuid.uuid4()),
                user_id=sreeya.id,
                name="Campus Security Desk",
                relationship_role="Authority / Security",
                phone="+91 98765 00100",
                telegram_chat_id="555555555",
                is_primary_sos=False
            )

            db.add_all([c1, c2, c3])
            db.commit()
            logger.info(f"Successfully seeded demo user '{sreeya.name}' (ID: {sreeya.id}) and 3 trusted contacts.")
        else:
            logger.info(f"Existing database detected with {user_count} user(s). Skipping seed.")
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
