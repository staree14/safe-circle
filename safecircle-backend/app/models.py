import uuid
from datetime import datetime, timezone
import enum
from sqlalchemy import (
    Column,
    String,
    Float,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    JSON,
    Enum as SQLEnum
)
from sqlalchemy.orm import relationship
from app.database import Base


class IncidentType(str, enum.Enum):
    PHYSICAL_SOS = "PHYSICAL_SOS"
    DIGITAL_THREAT = "DIGITAL_THREAT"


class IncidentStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    RESOLVED = "RESOLVED"


class EvidenceType(str, enum.Enum):
    STEALTH_VIDEO_CHUNK = "STEALTH_VIDEO_CHUNK"
    STEALTH_AUDIO_CHUNK = "STEALTH_AUDIO_CHUNK"
    SCREENSHOT = "SCREENSHOT"
    TEXT_LOG = "TEXT_LOG"
    URL_CAPTURE = "URL_CAPTURE"


class TimelineEventType(str, enum.Enum):
    SOS_TRIGGERED = "SOS_TRIGGERED"
    STEALTH_RECORDING_STARTED = "STEALTH_RECORDING_STARTED"
    EVIDENCE_HASHED = "EVIDENCE_HASHED"
    TELEGRAM_ALERT_SENT = "TELEGRAM_ALERT_SENT"
    LOCATION_UPDATED = "LOCATION_UPDATED"
    AI_TRIAGE_COMPLETED = "AI_TRIAGE_COMPLETED"
    GUARDIAN_ACKNOWLEDGED = "GUARDIAN_ACKNOWLEDGED"
    REPORT_SHARED = "REPORT_SHARED"
    INCIDENT_RESOLVED = "INCIDENT_RESOLVED"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=False)
    email = Column(String(120), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    contacts = relationship("TrustedContact", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="user", cascade="all, delete-orphan")


class TrustedContact(Base):
    __tablename__ = "trusted_contacts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    relationship_role = Column(String(50), nullable=False)
    phone = Column(String(30), nullable=False)
    telegram_chat_id = Column(String(50), nullable=True)
    is_primary_sos = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="contacts")


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    incident_type = Column(String(30), nullable=False, default=IncidentType.PHYSICAL_SOS.value)
    status = Column(String(30), nullable=False, default=IncidentStatus.ACTIVE.value)
    access_token = Column(String(64), unique=True, index=True, default=lambda: uuid.uuid4().hex)
    token_expires_at = Column(DateTime(timezone=True), nullable=True)
    shared_with_contact_name = Column(String(100), nullable=True)

    # Telemetry & Location
    initial_lat = Column(Float, nullable=True)
    initial_lng = Column(Float, nullable=True)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    battery_level = Column(Integer, nullable=True)
    trigger_mode = Column(String(50), default="STEALTH_BLACK_SCREEN", nullable=False)

    # Digital threat & details
    description = Column(Text, nullable=True)
    source_url = Column(String(500), nullable=True)
    ai_category = Column(String(100), nullable=True)
    ai_severity = Column(String(20), nullable=True)
    ai_summary = Column(Text, nullable=True)

    # Authority / Guardian Acknowledgment
    acknowledged_by = Column(String(100), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="incidents")
    evidence = relationship("Evidence", back_populates="incident", cascade="all, delete-orphan", order_by="Evidence.chunk_index.asc(), Evidence.created_at.asc()")
    timeline_events = relationship("TimelineEvent", back_populates="incident", cascade="all, delete-orphan", order_by="TimelineEvent.timestamp.asc()")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(String(50), nullable=False)
    file_url = Column(String(500), nullable=True)
    raw_text = Column(Text, nullable=True)
    sha256_hash = Column(String(64), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    chunk_index = Column(Integer, default=0, nullable=False)
    captured_lat = Column(Float, nullable=True)
    captured_lng = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="evidence")


class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False)
    event_type = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    incident = relationship("Incident", back_populates="timeline_events")
