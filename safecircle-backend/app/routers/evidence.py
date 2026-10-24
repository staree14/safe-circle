import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
from app.services import crypto_vault

router = APIRouter(prefix="/api/incidents", tags=["Live Evidence Streaming"])


@router.post("/{incident_id}/evidence", response_model=schemas.EvidenceResponse, status_code=status.HTTP_201_CREATED, summary="Upload Live Stealth Audio/Video Chunk or Screenshot")
async def upload_evidence_chunk(
    incident_id: str,
    file: UploadFile = File(..., description="Binary media payload (e.g., 4-second webm chunk or screenshot)"),
    evidence_type: str = Form("STEALTH_VIDEO_CHUNK", description="Type: STEALTH_VIDEO_CHUNK, STEALTH_AUDIO_CHUNK, SCREENSHOT, TEXT_LOG, URL_CAPTURE"),
    chunk_index: int = Form(0, description="Sequential index of the incoming chunk"),
    lat: Optional[float] = Form(None, description="GPS Latitude where chunk was captured"),
    lng: Optional[float] = Form(None, description="GPS Longitude where chunk was captured"),
    db: Session = Depends(get_db)
):
    """
    Core Live Evidence Streaming Endpoint:
    Accepts 4-second stealth media chunks recorded while the victim's phone displays a blank black screen.
    - Saves the file to disk.
    - Calculates the SHA-256 cryptographic digest.
    - Persists an Evidence record with file_url.
    - Adds an EVIDENCE_HASHED event to the chronological Timeline.
    - Enables instantaneous playback on the Guardian/Authority Dashboard.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file payload is empty")

    original_name = file.filename or f"chunk_{chunk_index}.webm"
    file_url, sha256_hash, file_size = crypto_vault.save_evidence_file(
        file_bytes=file_bytes,
        original_filename=original_name,
        incident_id=incident_id,
        chunk_index=chunk_index
    )

    # Save evidence row
    evidence_rec = models.Evidence(
        id=str(uuid.uuid4()),
        incident_id=incident_id,
        evidence_type=evidence_type,
        file_url=file_url,
        raw_text=None,
        sha256_hash=sha256_hash,
        file_size_bytes=file_size,
        chunk_index=chunk_index,
        captured_lat=lat if lat is not None else incident.current_lat,
        captured_lng=lng if lng is not None else incident.current_lng
    )
    db.add(evidence_rec)

    # Append timeline audit entry
    timeline_entry = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident_id,
        event_type=models.TimelineEventType.EVIDENCE_HASHED.value,
        title=f"Chunk #{chunk_index} Cryptographically Preserved",
        description=f"Evidence segment ({evidence_type}, {file_size} bytes) saved to secure vault. SHA-256: {sha256_hash[:16]}...",
        metadata_json={
            "chunk_index": chunk_index,
            "evidence_type": evidence_type,
            "sha256_hash": sha256_hash,
            "file_size": file_size,
            "file_url": file_url,
            "lat": evidence_rec.captured_lat,
            "lng": evidence_rec.captured_lng
        }
    )
    db.add(timeline_entry)

    db.commit()
    db.refresh(evidence_rec)
    return evidence_rec


@router.get("/{incident_id}/evidence", response_model=List[schemas.EvidenceResponse], summary="List all evidence items for an incident")
def list_incident_evidence(incident_id: str, db: Session = Depends(get_db)):
    """
    Returns all preserved media chunks and digital artifacts for an incident,
    ordered sequentially by chunk_index.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    evidence_items = db.query(models.Evidence).filter(
        models.Evidence.incident_id == incident_id
    ).order_by(models.Evidence.chunk_index.asc(), models.Evidence.created_at.asc()).all()

    return evidence_items
