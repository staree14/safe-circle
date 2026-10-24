import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app import models, schemas
from app.services import crypto_vault, telegram_bot, ai_triage, report_gen
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/api/incidents", tags=["Incidents & SOS Workflows"])


@router.post("/physical", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED, summary="Trigger Flow A Physical SOS")
async def trigger_physical_sos(
    payload: schemas.PhysicalSOSCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Flow A: Triggers a high-priority Physical Emergency SOS.
    - Creates ACTIVE PHYSICAL_SOS incident
    - Generates unique capability-based access_token for Guardian live streaming
    - Logs SOS_TRIGGERED event in Timeline
    - Asynchronously dispatches emergency Telegram notification with Google Maps and Guardian streaming links
    - Logs TELEGRAM_ALERT_SENT in Timeline
    """
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    access_token = uuid.uuid4().hex
    incident = models.Incident(
        id=str(uuid.uuid4()),
        user_id=payload.user_id,
        incident_type=models.IncidentType.PHYSICAL_SOS.value,
        status=models.IncidentStatus.ACTIVE.value,
        access_token=access_token,
        initial_lat=payload.lat,
        initial_lng=payload.lng,
        current_lat=payload.lat,
        current_lng=payload.lng,
        battery_level=payload.battery_level,
        trigger_mode=payload.trigger_mode or "STEALTH_BLACK_SCREEN",
        description=f"Physical SOS initiated via {payload.trigger_mode or 'STEALTH_BLACK_SCREEN'}"
    )
    db.add(incident)
    db.flush()

    # Timeline event: SOS_TRIGGERED
    sos_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.SOS_TRIGGERED.value,
        title="Physical Emergency SOS Activated",
        description=f"Emergency SOS triggered in mode '{payload.trigger_mode}'. GPS: {payload.lat:.5f}, {payload.lng:.5f}. Battery: {payload.battery_level or 'N/A'}%.",
        metadata_json={
            "lat": payload.lat,
            "lng": payload.lng,
            "battery": payload.battery_level,
            "trigger_mode": payload.trigger_mode
        }
    )
    db.add(sos_event)

    # Timeline event: STEALTH_RECORDING_STARTED
    stealth_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.STEALTH_RECORDING_STARTED.value,
        title="Stealth Evidence Pipeline Initialized",
        description="Mobile stealth background recorder activated. Awaiting incoming 4-second video/audio chunks.",
        metadata_json={"streaming_ready": True}
    )
    db.add(stealth_event)

    # Prepare URLs
    maps_url = f"https://www.google.com/maps?q={payload.lat},{payload.lng}"
    guardian_url = f"{settings.FRONTEND_URL}/guardian/{access_token}"

    # Asynchronous Telegram dispatch
    contacts_list = [
        {"name": c.name, "phone": c.phone, "telegram_chat_id": c.telegram_chat_id}
        for c in user.contacts
    ]
    background_tasks.add_task(
        telegram_bot.send_telegram_sos_alert,
        incident_id=incident.id,
        user_name=user.name,
        user_phone=user.phone,
        lat=payload.lat,
        lng=payload.lng,
        battery_level=payload.battery_level,
        trigger_mode=incident.trigger_mode,
        access_token=access_token,
        maps_url=maps_url,
        guardian_url=guardian_url,
        contacts=contacts_list
    )

    # Timeline event: TELEGRAM_ALERT_SENT
    telegram_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.TELEGRAM_ALERT_SENT.value,
        title="Emergency Dispatch Broadcasted",
        description=f"Automated high-priority SOS alert transmitted to trusted contacts via Telegram with live Guardian streaming link.",
        metadata_json={"maps_url": maps_url, "guardian_url": guardian_url}
    )
    db.add(telegram_event)

    # Broadcast live SOS alert to all connected Guardians via WebSocket
    background_tasks.add_task(
        ws_manager.broadcast,
        "SOS_TRIGGERED",
        {
            "incident_id": incident.id,
            "access_token": access_token,
            "lat": payload.lat,
            "lng": payload.lng,
            "battery_level": payload.battery_level,
            "trigger_mode": incident.trigger_mode,
            "status": incident.status,
            "user_name": user.name,
            "timestamp": incident.created_at.isoformat()
        },
        incident.id
    )

    db.commit()
    db.refresh(incident)
    return incident


@router.patch("/{incident_id}/telemetry", response_model=schemas.IncidentResponse, summary="Update live GPS & battery telemetry")
def update_telemetry(
    incident_id: str,
    payload: schemas.TelemetryUpdate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Updates victim's live coordinates and device battery level during active SOS.
    Logs LOCATION_UPDATED timeline event for forensic route tracking.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.current_lat = payload.current_lat
    incident.current_lng = payload.current_lng
    if payload.battery_level is not None:
        incident.battery_level = payload.battery_level

    # Log telemetry event
    te = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.LOCATION_UPDATED.value,
        title="Live Coordinates Updated",
        description=f"Victim position refreshed: {payload.current_lat:.5f}, {payload.current_lng:.5f}. Battery: {payload.battery_level}%.",
        metadata_json={
            "lat": payload.current_lat,
            "lng": payload.current_lng,
            "battery": payload.battery_level
        }
    )
    db.add(te)

    # Real-time WebSocket broadcast to Guardian radar maps
    background_tasks.add_task(
        ws_manager.broadcast,
        "TELEMETRY_UPDATED",
        {
            "incident_id": incident.id,
            "current_lat": incident.current_lat,
            "current_lng": incident.current_lng,
            "battery_level": incident.battery_level,
            "timestamp": datetime.now(timezone.utc).isoformat()
        },
        incident.id
    )

    db.commit()
    db.refresh(incident)
    return incident


@router.post("/relay", response_model=schemas.IncidentResponse, summary="Acoustic/Ultrasonic Offline Mesh Store-and-Forward Relay")
async def process_relay_packet(
    payload: schemas.RelayPayload,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Receives compressed emergency packets forwarded via ultrasonic audio chirps or
    offline BLE mesh from a bystander's device when victim has no cellular internet.
    """
    user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Find active incident or spawn relay incident
    incident = db.query(models.Incident).filter(
        models.Incident.user_id == payload.user_id,
        models.Incident.status == models.IncidentStatus.ACTIVE.value
    ).first()

    if not incident:
        access_token = uuid.uuid4().hex
        incident = models.Incident(
            id=str(uuid.uuid4()),
            user_id=payload.user_id,
            incident_type=models.IncidentType.PHYSICAL_SOS.value,
            status=models.IncidentStatus.ACTIVE.value,
            access_token=access_token,
            initial_lat=payload.lat,
            initial_lng=payload.lng,
            current_lat=payload.lat,
            current_lng=payload.lng,
            battery_level=payload.battery_level,
            trigger_mode="ULTRASONIC_RELAY",
            description=f"Emergency relay payload received via mesh hop device: {payload.relayed_by_device_id}"
        )
        db.add(incident)
        db.flush()
    else:
        incident.current_lat = payload.lat
        incident.current_lng = payload.lng
        if payload.battery_level:
            incident.battery_level = payload.battery_level

    # Add Relay timeline event
    relay_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.SOS_TRIGGERED.value,
        title="Offline Ultrasonic Mesh Packet Received",
        description=f"Store-and-forward packet relayed by bystander node '{payload.relayed_by_device_id}'. Coords: {payload.lat:.5f}, {payload.lng:.5f}.",
        metadata_json={
            "relayed_by": payload.relayed_by_device_id,
            "status_code": payload.status_code,
            "battery": payload.battery_level
        }
    )
    db.add(relay_event)

    # Trigger Telegram notification
    maps_url = f"https://www.google.com/maps?q={payload.lat},{payload.lng}"
    guardian_url = f"{settings.FRONTEND_URL}/guardian/{incident.access_token}"
    contacts_list = [
        {"name": c.name, "phone": c.phone, "telegram_chat_id": c.telegram_chat_id}
        for c in user.contacts
    ]
    background_tasks.add_task(
        telegram_bot.send_telegram_sos_alert,
        incident_id=incident.id,
        user_name=user.name,
        user_phone=user.phone,
        lat=payload.lat,
        lng=payload.lng,
        battery_level=payload.battery_level,
        trigger_mode=incident.trigger_mode,
        access_token=incident.access_token,
        maps_url=maps_url,
        guardian_url=guardian_url,
        contacts=contacts_list
    )

    db.commit()
    db.refresh(incident)
    return incident


@router.post("/triage-preview", response_model=schemas.TriagePreviewResponse, summary="Flow B Step 3: AI Threat Triage & Statutory Analysis Preview")
async def preview_ai_threat_triage(payload: schemas.TriagePreviewRequest):
    """
    Step 3 of Flow B: Previews AI harassment classification, threat severity level,
    extracted handle identifiers, and applicable Indian IT Act/BNS legal references
    before the victim submits the final evidence vault.
    """
    result = await ai_triage.triage_threat(
        raw_text=payload.raw_text,
        source_url=payload.source_url,
        description=payload.description
    )
    return result


@router.post("/digital", response_model=schemas.IncidentResponse, status_code=status.HTTP_201_CREATED, summary="Flow B: Digital Harassment Evidence Preservation")
async def create_digital_threat_incident(
    background_tasks: BackgroundTasks,
    user_id: str = Form(...),
    description: Optional[str] = Form(None),
    raw_text: Optional[str] = Form(None),
    source_url: Optional[str] = Form(None),
    ai_category: Optional[str] = Form(None),
    ai_severity: Optional[str] = Form(None),
    shared_with_contact_name: Optional[str] = Form(None),
    expiry_hours: int = Form(24),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Flow B: Digital Threat Evidence Preservation.
    - Preserves screenshots, chat logs, or textual abuse.
    - Computes SHA-256 cryptographic hashes for chain of custody.
    - Triages legal categories (Cyberstalking, Doxxing, Non-Consensual Imagery, Extortion).
    - Sets capability access token with expiry for selective sharing.
    - Dispatches selective Telegram share alert if shared_with_contact_name is supplied.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # If AI category or severity was not provided in form, compute it on the fly
    if not ai_category or not ai_severity:
        triage_info = await ai_triage.triage_threat(raw_text=raw_text, source_url=source_url, description=description)
        ai_category = ai_category or triage_info["suggested_category"]
        ai_severity = ai_severity or triage_info["suggested_severity"]
        ai_summary = triage_info["summary"]
    else:
        ai_summary = f"Preserved evidence categorized as {ai_category} under severity {ai_severity}."

    access_token = uuid.uuid4().hex
    token_expires_at = datetime.now(timezone.utc) + timedelta(hours=max(1, expiry_hours))

    incident = models.Incident(
        id=str(uuid.uuid4()),
        user_id=user_id,
        incident_type=models.IncidentType.DIGITAL_THREAT.value,
        status=models.IncidentStatus.ACTIVE.value,
        access_token=access_token,
        token_expires_at=token_expires_at,
        shared_with_contact_name=shared_with_contact_name,
        trigger_mode="DIGITAL_SUBMISSION",
        description=description,
        source_url=source_url,
        ai_category=ai_category,
        ai_severity=ai_severity,
        ai_summary=ai_summary
    )
    db.add(incident)
    db.flush()

    # Timeline event: AI_TRIAGE_COMPLETED
    triage_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.AI_TRIAGE_COMPLETED.value,
        title="AI Harassment Triage Completed",
        description=f"Classified as '{ai_category}' with assessed severity '{ai_severity}'.",
        metadata_json={
            "ai_category": ai_category,
            "ai_severity": ai_severity,
            "source_url": source_url
        }
    )
    db.add(triage_event)

    # Preserve uploaded file (screenshot, audio recording, or document)
    if file:
        file_bytes = await file.read()
        file_url, sha256_hash, file_size = crypto_vault.save_evidence_file(
            file_bytes=file_bytes,
            original_filename=file.filename or "screenshot.png",
            incident_id=incident.id,
            chunk_index=0
        )

        evidence_rec = models.Evidence(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            evidence_type=models.EvidenceType.SCREENSHOT.value,
            file_url=file_url,
            raw_text=None,
            sha256_hash=sha256_hash,
            file_size_bytes=file_size,
            chunk_index=0
        )
        db.add(evidence_rec)

        # Timeline: EVIDENCE_HASHED
        hash_event = models.TimelineEvent(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            event_type=models.TimelineEventType.EVIDENCE_HASHED.value,
            title="Digital Artifact Cryptographically Hashed",
            description=f"Preserved file '{file.filename}' ({file_size} bytes) — SHA-256: {sha256_hash[:16]}... (Sealed in Vault)",
            metadata_json={"sha256": sha256_hash, "size": file_size, "url": file_url}
        )
        db.add(hash_event)

    # Preserve raw text / message content
    if raw_text and raw_text.strip():
        text_hash = crypto_vault.compute_sha256_text(raw_text)
        text_rec = models.Evidence(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            evidence_type=models.EvidenceType.TEXT_LOG.value,
            file_url=None,
            raw_text=raw_text,
            sha256_hash=text_hash,
            file_size_bytes=len(raw_text.encode("utf-8")),
            chunk_index=1
        )
        db.add(text_rec)

        text_event = models.TimelineEvent(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            event_type=models.TimelineEventType.EVIDENCE_HASHED.value,
            title="Harassment Message Logs Fingerprinted",
            description=f"Threat message text preserved — SHA-256: {text_hash[:16]}...",
            metadata_json={"sha256": text_hash, "text_len": len(raw_text)}
        )
        db.add(text_event)

    # Handle selective sharing if contact name specified
    if shared_with_contact_name:
        report_url = f"{settings.FRONTEND_URL}/guardian/{access_token}"
        background_tasks.add_task(
            telegram_bot.send_telegram_report_share,
            incident_id=incident.id,
            user_name=user.name,
            contact_name=shared_with_contact_name,
            report_url=report_url,
            expiry_hours=expiry_hours,
            ai_category=ai_category,
            ai_severity=ai_severity
        )

        share_event = models.TimelineEvent(
            id=str(uuid.uuid4()),
            incident_id=incident.id,
            event_type=models.TimelineEventType.REPORT_SHARED.value,
            title="Selective Evidence Report Dispatched",
            description=f"Time-limited access token shared with '{shared_with_contact_name}'. Link valid for {expiry_hours} hours.",
            metadata_json={"recipient": shared_with_contact_name, "expires_at": token_expires_at.isoformat()}
        )
        db.add(share_event)

    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=List[schemas.IncidentResponse], summary="List all incidents across both physical and digital flows")
def list_incidents(
    incident_type: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db)
):
    """
    Returns all incidents ordered chronologically (newest first).
    Serves both the Mobile History view and Guardian/Authority monitoring views.
    """
    query = db.query(models.Incident)
    if incident_type:
        query = query.filter(models.Incident.incident_type == incident_type)
    if status_filter:
        query = query.filter(models.Incident.status == status_filter)

    return query.order_by(models.Incident.created_at.desc()).all()


@router.get("/token/{access_token}", response_model=schemas.GuardianIncidentResponse, summary="Guardian Capability URL Access")
def get_incident_by_token(access_token: str, db: Session = Depends(get_db)):
    """
    Used by the Guardian Web Dashboard (/guardian/:token).
    Validates token expiration and returns full incident details, live telemetry,
    ordered timeline, and streaming evidence items.
    """
    incident = db.query(models.Incident).filter(models.Incident.access_token == access_token).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Secure link is invalid or does not exist")

    is_expired = False
    if incident.token_expires_at:
        # Check UTC expiration
        now = datetime.now(timezone.utc)
        token_exp = incident.token_expires_at
        if token_exp.tzinfo is None:
            token_exp = token_exp.replace(tzinfo=timezone.utc)
        if now > token_exp:
            is_expired = True

    response_data = schemas.GuardianIncidentResponse.model_validate(incident)
    response_data.is_token_expired = is_expired
    response_data.guardian_access_url = f"{settings.FRONTEND_URL}/guardian/{access_token}"
    return response_data


@router.post("/token/{access_token}/acknowledge", response_model=schemas.IncidentResponse, summary="Acknowledge incident by Guardian / Authority")
async def acknowledge_incident(
    access_token: str,
    payload: schemas.AcknowledgeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Allows a guardian, trusted contact, or campus authority to formally acknowledge an SOS.
    Updates status to ACKNOWLEDGED and notifies circle members.
    """
    incident = db.query(models.Incident).filter(models.Incident.access_token == access_token).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = models.IncidentStatus.ACKNOWLEDGED.value
    incident.acknowledged_by = payload.acknowledged_by
    incident.acknowledged_at = datetime.now(timezone.utc)

    ack_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.GUARDIAN_ACKNOWLEDGED.value,
        title="SOS Acknowledged by Responder",
        description=f"Incident formally acknowledged by '{payload.acknowledged_by}'. Responder is actively coordinating assistance.",
        metadata_json={"acknowledged_by": payload.acknowledged_by}
    )
    db.add(ack_event)

    guardian_url = f"{settings.FRONTEND_URL}/guardian/{access_token}"
    user_name = incident.user.name if incident.user else "Citizen"
    background_tasks.add_task(
        telegram_bot.send_telegram_acknowledgment_update,
        incident_id=incident.id,
        user_name=user_name,
        acknowledged_by=payload.acknowledged_by,
        guardian_url=guardian_url
    )

    # Real-time WebSocket broadcast to all Guardians
    background_tasks.add_task(
        ws_manager.broadcast,
        "GUARDIAN_ACKNOWLEDGED",
        {
            "incident_id": incident.id,
            "status": incident.status,
            "acknowledged_by": payload.acknowledged_by,
            "acknowledged_at": incident.acknowledged_at.isoformat()
        },
        incident.id
    )

    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/resolve", response_model=schemas.IncidentResponse, summary="Mark incident as resolved")
def resolve_incident(
    incident_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Resolves the incident, marking the victim safe and sealing evidence streaming.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = models.IncidentStatus.RESOLVED.value
    incident.resolved_at = datetime.now(timezone.utc)

    res_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type=models.TimelineEventType.INCIDENT_RESOLVED.value,
        title="Incident Resolved — Victim Safe",
        description="Emergency status cleared. Forensic custody log permanently finalized and archived.",
        metadata_json={"resolved_at": incident.resolved_at.isoformat()}
    )
    db.add(res_event)

    # Real-time WebSocket broadcast of resolution
    background_tasks.add_task(
        ws_manager.broadcast,
        "INCIDENT_RESOLVED",
        {
            "incident_id": incident.id,
            "status": incident.status,
            "resolved_at": incident.resolved_at.isoformat()
        },
        incident.id
    )

    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/coordination", summary="Broadcast Multi-Guardian Response Coordination Update")
async def update_guardian_coordination(
    incident_id: str,
    payload: schemas.GuardianCoordinationRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Allows circle guardians (Sister, Mom, Friend, etc.) to publish their live response status:
    - NAVIGATING_TO_VICTIM (e.g. 'Sister Priya is navigating to location')
    - CALLED_112 (e.g. 'Pooja called 112 Police Control Room')
    - AT_SCENE (e.g. 'At scene with victim')
    - CONFIRMED_SAFE
    Logs to timeline and broadcasts to all guardians via WebSocket.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    coordination_event = models.TimelineEvent(
        id=str(uuid.uuid4()),
        incident_id=incident.id,
        event_type="GUARDIAN_COORDINATION",
        title=f"Guardian Action: {payload.guardian_name}",
        description=f"{payload.guardian_name} updated status: {payload.status_label}. {payload.note or ''}".strip(),
        metadata_json={
            "guardian_name": payload.guardian_name,
            "status_action": payload.status_action,
            "status_label": payload.status_label,
            "note": payload.note
        }
    )
    db.add(coordination_event)
    db.commit()

    now_iso = datetime.now(timezone.utc).isoformat()
    # Broadcast to all connected Guardian consoles
    background_tasks.add_task(
        ws_manager.broadcast,
        "GUARDIAN_COORDINATION_UPDATE",
        {
            "incident_id": incident_id,
            "guardian_name": payload.guardian_name,
            "status_action": payload.status_action,
            "status_label": payload.status_label,
            "note": payload.note,
            "timestamp": now_iso
        },
        incident_id
    )

    return {
        "status": "success",
        "incident_id": incident_id,
        "guardian_name": payload.guardian_name,
        "status_label": payload.status_label,
        "timestamp": now_iso
    }


@router.get("/token/{access_token}/report", summary="Generate Forensic Chain-of-Custody Incident Report")
def get_incident_report(
    access_token: str,
    format: str = Query("html", description="Report format: 'html' for print-ready court certificate, 'json' for raw structured audit manifest"),
    db: Session = Depends(get_db)
):
    """
    Generates an official Forensic Chain-of-Custody Incident Report.
    - format=json: Structured JSON audit trail, SHA-256 evidence digests, and Merkle root custody seal.
    - format=html: Clean, styled, print-ready court/authority certificate with window.print() button.
    """
    incident = db.query(models.Incident).filter(models.Incident.access_token == access_token).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if format.lower() == "json":
        return report_gen.generate_forensic_report_data(incident)
    else:
        html_content = report_gen.generate_forensic_html_report(incident)
        return HTMLResponse(content=html_content, status_code=200)


@router.get("/{incident_id}", response_model=schemas.IncidentResponse, summary="Get incident details by ID")
def get_incident_by_id(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident
