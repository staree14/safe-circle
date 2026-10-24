import os
import hashlib
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Tuple
from app.config import settings


def compute_sha256_bytes(data: bytes) -> str:
    """Computes a 64-character lowercase hexadecimal SHA-256 digest of raw byte content."""
    hasher = hashlib.sha256()
    hasher.update(data)
    return hasher.hexdigest()


def compute_sha256_text(text: str) -> str:
    """Computes a SHA-256 digest for raw text or message content."""
    return compute_sha256_bytes(text.encode("utf-8"))


def compute_evidence_fingerprint(data: bytes, incident_id: str, timestamp_utc: str) -> str:
    """
    Computes a cryptographic custody fingerprint combining raw content with
    incident identity and canonical UTC timestamp to seal chain-of-custody.
    """
    hasher = hashlib.sha256()
    hasher.update(data)
    # Bind incident ID and server verification timestamp
    metadata_binding = f"::safecircle::{incident_id}::{timestamp_utc}".encode("utf-8")
    hasher.update(metadata_binding)
    return hasher.hexdigest()


def save_evidence_file(
    file_bytes: bytes,
    original_filename: str,
    incident_id: str,
    chunk_index: int = 0
) -> Tuple[str, str, int]:
    """
    Saves an evidence payload to the uploads directory.
    
    Returns:
        (file_url, sha256_hash, file_size_bytes)
    """
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Compute raw SHA-256 digest
    sha256_hash = compute_sha256_bytes(file_bytes)
    file_size_bytes = len(file_bytes)

    # Generate safe unique filename
    ext = Path(original_filename).suffix or ".bin"
    # Clean extension if strange
    if not ext.startswith("."):
        ext = f".{ext}"
    safe_name = f"ev_{incident_id[:8]}_chk{chunk_index}_{uuid.uuid4().hex[:8]}{ext}"
    dest_path = Path(settings.UPLOAD_DIR) / safe_name

    # Write securely
    with open(dest_path, "wb") as f:
        f.write(file_bytes)

    file_url = f"/uploads/{safe_name}"
    return file_url, sha256_hash, file_size_bytes


def verify_file_integrity(file_path: str, expected_hash: str) -> bool:
    """Verifies that the file at file_path has not been tampered with by checking SHA-256."""
    p = Path(file_path)
    if not p.is_file():
        return False
    with open(p, "rb") as f:
        actual_hash = compute_sha256_bytes(f.read())
    return actual_hash.lower() == expected_hash.lower()
