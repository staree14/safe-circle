import logging
from typing import List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("safecircle.telegram")
logging.basicConfig(level=logging.INFO)


async def _dispatch_telegram_message(text: str, specific_chat_id: Optional[str] = None) -> bool:
    """
    Internal helper to send a Markdown-formatted message via Telegram Bot API.
    Gracefully falls back to logging if token or chat ID is not configured.
    """
    bot_token = settings.TELEGRAM_BOT_TOKEN
    chat_id = specific_chat_id or settings.TELEGRAM_CHAT_ID

    if not bot_token or not chat_id:
        logger.info(
            f"[Telegram Bot Mock Dispatch] (Token/ChatID not set)\n"
            f"Target Chat: {chat_id or 'DEFAULT_FALLBACK'}\n"
            f"Message Content:\n{text}\n"
        )
        return False

    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                logger.info(f"Telegram alert successfully dispatched to {chat_id}")
                return True
            else:
                logger.warning(
                    f"Telegram API responded with status {resp.status_code}: {resp.text}"
                )
                return False
    except Exception as exc:
        logger.error(f"Failed to transmit Telegram notification: {exc}")
        return False


async def send_telegram_sos_alert(
    incident_id: str,
    user_name: str,
    user_phone: str,
    lat: float,
    lng: float,
    battery_level: Optional[int],
    trigger_mode: str,
    access_token: str,
    maps_url: str,
    guardian_url: str,
    contacts: Optional[List[dict]] = None
) -> bool:
    """
    Dispatches a high-priority Physical Emergency SOS alert to trusted contacts via Telegram.
    """
    battery_str = f"{battery_level}%" if battery_level is not None else "Unknown"

    message = (
        f"🚨 <b>EMERGENCY SOS ALERT — SAFECIRCLE</b> 🚨\n\n"
        f"<b>Victim:</b> {user_name} ({user_phone})\n"
        f"<b>Trigger Mode:</b> <code>{trigger_mode}</code>\n"
        f"<b>Battery Level:</b> {battery_str}\n"
        f"<b>GPS Coordinates:</b> <code>{lat:.5f}, {lng:.5f}</code>\n\n"
        f"📍 <b>Google Maps Live Pin:</b>\n{maps_url}\n\n"
        f"🛡️ <b>Live Stealth Evidence & Tracking Stream:</b>\n{guardian_url}\n\n"
        f"<i>The victim's phone is currently recording stealth audio/video chunks with cryptographic SHA-256 chain of custody. Click the guardian link above to view live stream.</i>"
    )

    # Send to main chat ID
    success = await _dispatch_telegram_message(message)

    # Also dispatch to any individual trusted contacts who have telegram_chat_id configured
    if contacts:
        for contact in contacts:
            c_chat = contact.get("telegram_chat_id")
            if c_chat and c_chat != settings.TELEGRAM_CHAT_ID:
                await _dispatch_telegram_message(message, specific_chat_id=c_chat)

    return success


async def send_telegram_report_share(
    incident_id: str,
    user_name: str,
    contact_name: str,
    report_url: str,
    expiry_hours: int,
    ai_category: Optional[str] = None,
    ai_severity: Optional[str] = None
) -> bool:
    """
    Dispatches a selective time-limited forensic evidence share alert for Flow B (Digital Harassment).
    """
    category_str = ai_category or "Digital Harassment / Evidence Vault"
    severity_str = ai_severity or "HIGH"

    message = (
        f"🔒 <b>SAFECIRCLE: SECURE EVIDENCE DOSSIER SHARED</b>\n\n"
        f"Hello <b>{contact_name}</b>,\n"
        f"<b>{user_name}</b> has selectively shared a cryptographically preserved harassment evidence dossier with you.\n\n"
        f"<b>Classification:</b> {category_str}\n"
        f"<b>Assessed Threat Level:</b> <code>{severity_str}</code>\n"
        f"<b>Access Link Valid For:</b> {expiry_hours} Hours\n\n"
        f"📋 <b>Review Incident & Evidence Vault:</b>\n{report_url}\n\n"
        f"<i>All screenshots and logs in this report carry SHA-256 digital custody digests compliant with forensic standards.</i>"
    )

    return await _dispatch_telegram_message(message)


async def send_telegram_acknowledgment_update(
    incident_id: str,
    user_name: str,
    acknowledged_by: str,
    guardian_url: str
) -> bool:
    """
    Notifies the circle that an emergency has been acknowledged by a contact or security desk.
    """
    message = (
        f"✅ <b>SAFECIRCLE: SOS ACKNOWLEDGED</b>\n\n"
        f"The emergency SOS for <b>{user_name}</b> has been acknowledged by:\n"
        f"👮 <b>{acknowledged_by}</b>\n\n"
        f"The responder is coordinating assistance. Live evidence stream remains active at:\n"
        f"{guardian_url}"
    )

    return await _dispatch_telegram_message(message)
