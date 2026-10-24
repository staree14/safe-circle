from datetime import datetime
from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- USER SCHEMAS ---

class UserBase(BaseModel):
    name: str = Field(..., example="Sreeya")
    phone: str = Field(..., example="+91 98765 43210")
    email: Optional[str] = Field(None, example="sreeya@safecircle.internal")


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- TRUSTED CONTACT SCHEMAS ---

class TrustedContactBase(BaseModel):
    name: str = Field(..., example="Aditi Sharma")
    relationship_role: str = Field(..., example="Sister")
    phone: str = Field(..., example="+91 98765 43211")
    telegram_chat_id: Optional[str] = Field(None, example="123456789")
    is_primary_sos: bool = Field(False, example=True)


class TrustedContactCreate(TrustedContactBase):
    pass


class TrustedContactResponse(TrustedContactBase):
    id: str
    user_id: str

    model_config = ConfigDict(from_attributes=True)


# --- EVIDENCE SCHEMAS ---

class EvidenceResponse(BaseModel):
    id: str
    incident_id: str
    evidence_type: str
    file_url: Optional[str] = None
    raw_text: Optional[str] = None
    sha256_hash: str
    file_size_bytes: int
    chunk_index: int
    captured_lat: Optional[float] = None
    captured_lng: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- TIMELINE EVENT SCHEMAS ---

class TimelineEventResponse(BaseModel):
    id: str
    incident_id: str
    event_type: str
    title: str
    description: str
    metadata_json: Optional[Any] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


# --- INCIDENT REQUEST SCHEMAS ---

class PhysicalSOSCreate(BaseModel):
    user_id: str = Field(..., description="ID of the user triggering SOS")
    lat: float = Field(..., example=12.9716)
    lng: float = Field(..., example=77.5946)
    battery_level: Optional[int] = Field(None, ge=0, le=100, example=42)
    trigger_mode: str = Field("STEALTH_BLACK_SCREEN", example="STEALTH_BLACK_SCREEN")


class TelemetryUpdate(BaseModel):
    current_lat: float = Field(..., example=12.9720)
    current_lng: float = Field(..., example=77.5950)
    battery_level: Optional[int] = Field(None, ge=0, le=100, example=40)


class RelayPayload(BaseModel):
    user_id: str = Field(..., description="Victim User ID")
    lat: float = Field(..., example=12.9718)
    lng: float = Field(..., example=77.5948)
    status_code: str = Field("SOS_CRITICAL", example="SOS_CRITICAL")
    relayed_by_device_id: str = Field(..., example="NODE-RELAY-7F2A")
    battery_level: Optional[int] = Field(None, ge=0, le=100, example=38)


class TriagePreviewRequest(BaseModel):
    raw_text: Optional[str] = Field(None, example="I know where you live and which bus you take. Send ₹20,000 or I will leak your pictures.")
    source_url: Optional[str] = Field(None, example="https://instagram.com/direct/t/12345")
    description: Optional[str] = Field(None, example="Anonymous account harassing me across multiple platforms")


class LegalReference(BaseModel):
    section: str
    title: str
    description: str


class TriagePreviewResponse(BaseModel):
    suggested_category: str
    suggested_severity: str
    summary: str
    extracted_identifiers: List[str] = []
    legal_references: List[LegalReference] = []


class AcknowledgeRequest(BaseModel):
    acknowledged_by: str = Field(..., example="Aditi (Trusted Contact)")


# --- INCIDENT RESPONSE SCHEMAS ---

class IncidentResponse(BaseModel):
    id: str
    user_id: str
    incident_type: str
    status: str
    access_token: str
    token_expires_at: Optional[datetime] = None
    shared_with_contact_name: Optional[str] = None
    initial_lat: Optional[float] = None
    initial_lng: Optional[float] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    battery_level: Optional[int] = None
    trigger_mode: str
    description: Optional[str] = None
    source_url: Optional[str] = None
    ai_category: Optional[str] = None
    ai_severity: Optional[str] = None
    ai_summary: Optional[str] = None
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserResponse] = None
    evidence: List[EvidenceResponse] = []
    timeline_events: List[TimelineEventResponse] = []

    model_config = ConfigDict(from_attributes=True)


class GuardianIncidentResponse(IncidentResponse):
    is_token_expired: bool = False
    guardian_access_url: Optional[str] = None
