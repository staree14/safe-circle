import re
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("safecircle.ai_triage")


# Deterministic Legal Reference Matrix for Indian Law & Forensic Reporting
LEGAL_REFERENCES_MAP = {
    "Non-Consensual Imagery Threat": [
        {
            "section": "IT Act Section 66E",
            "title": "Violation of Privacy",
            "description": "Punishment for intentionally capturing, publishing, or transmitting images of private areas of any person without consent (up to 3 years imprisonment)."
        },
        {
            "section": "IT Act Section 67 & 67A",
            "title": "Publishing Sexually Explicit Material",
            "description": "Punishment for publishing or transmitting obscene or sexually explicit acts in electronic form (up to 5 years imprisonment)."
        },
        {
            "section": "BNS Section 77 / IPC Section 354C",
            "title": "Voyeurism",
            "description": "Capturing or disseminating the image of a woman engaging in private acts."
        }
    ],
    "Extortion / Blackmail": [
        {
            "section": "BNS Section 308 / IPC Section 384",
            "title": "Punishment for Extortion",
            "description": "Intentionally putting any person in fear of injury or reputational harm to induce delivery of property or compliance (up to 3 years imprisonment)."
        },
        {
            "section": "IT Act Section 66",
            "title": "Computer Related Offences",
            "description": "Dishonest and fraudulent extortion carried out utilizing digital communications or computer systems."
        }
    ],
    "Cyberstalking": [
        {
            "section": "BNS Section 78 / IPC Section 354D",
            "title": "Stalking",
            "description": "Monitors the use by a woman of the internet, email or other form of electronic communication, or attempts to contact repeatedly despite disinterest."
        },
        {
            "section": "IT Act Section 66E",
            "title": "Invasion of Personal Privacy",
            "description": "Unauthorized electronic monitoring and tracking of victim location."
        }
    ],
    "Doxxing / Identity Misuse": [
        {
            "section": "IT Act Section 66C",
            "title": "Identity Theft",
            "description": "Punishment for fraudulently or dishonestly making use of electronic signature, password or unique identification feature of any other person."
        },
        {
            "section": "IT Act Section 66D",
            "title": "Cheating by Personation",
            "description": "Punishment for cheating by personation by using computer resource (up to 3 years imprisonment)."
        },
        {
            "section": "BNS Section 79 / IPC Section 509",
            "title": "Insulting Modesty of a Woman",
            "description": "Public posting of private phone numbers or slanderous profiles intended to intrude upon the privacy of a woman."
        }
    ],
    "Targeted Harassment": [
        {
            "section": "BNS Section 351 / IPC Section 503 & 506",
            "title": "Criminal Intimidation",
            "description": "Threatening injury to person, reputation or property with intent to cause alarm or force unlawful acts."
        },
        {
            "section": "BNS Section 79 / IPC Section 509",
            "title": "Word or Gesture Insulting Modesty",
            "description": "Abusive, derogatory or sexually explicit messages sent via electronic mediums."
        }
    ]
}


def extract_identifiers(text: str) -> List[str]:
    """Extracts social media handles, phone numbers, emails, and URLs from threat text."""
    identifiers = set()

    # Handles (@username)
    handles = re.findall(r"@([A-Za-z0-9_.]{2,30})", text)
    for h in handles:
        identifiers.add(f"@{h}")

    # Phone numbers (Indian/International pattern)
    phones = re.findall(r"(?:(?:\+|00)?[1-9]{1,4}[\s-]?)?(?:\(?\d{2,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{4,5}", text)
    for p in phones:
        cleaned = re.sub(r"[^\d+]", "", p)
        if len(cleaned) >= 10:
            identifiers.add(p.strip())

    # Email addresses
    emails = re.findall(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", text)
    for e in emails:
        identifiers.add(e)

    # URLs
    urls = re.findall(r"https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+[^\s]*", text)
    for u in urls:
        identifiers.add(u)

    return sorted(list(identifiers))


def deterministic_threat_triage(
    raw_text: Optional[str],
    source_url: Optional[str],
    description: Optional[str]
) -> Dict[str, Any]:
    """
    High-speed, 100% offline deterministic keyword & heuristic threat triage analyzer.
    Always functions reliably without external API dependencies.
    """
    corpus = f"{raw_text or ''} {source_url or ''} {description or ''}".lower()
    extracted_ids = extract_identifiers(f"{raw_text or ''} {source_url or ''} {description or ''}")

    # Pattern categories
    imagery_keywords = ["nude", "nudes", "private photo", "private picture", "leak", "deepfake", "morph", "intimate", "video tape", "expose you", "explicit"]
    extortion_keywords = ["money", "pay me", "ransom", "blackmail", "₹", "rupees", "transfer", "or else", "pay up", "cash", "crypto", "bitcoin"]
    stalking_keywords = ["following", "tracked", "tracking", "outside your", "bus stop", "metro", "know where you live", "gps", "watching you", "saw you at", "every day", "home address"]
    doxxing_keywords = ["leaked your number", "posting your address", "fake profile", "fake account", "impersonat", "personal details", "doxx", "putting your phone"]
    violence_keywords = ["kill", "die", "murder", "rape", "acid", "slit", "beat", "assault", "harm you", "cut", "ruin your life"]

    # Match counts
    imagery_score = sum(1 for kw in imagery_keywords if kw in corpus)
    extortion_score = sum(1 for kw in extortion_keywords if kw in corpus)
    stalking_score = sum(1 for kw in stalking_keywords if kw in corpus)
    doxxing_score = sum(1 for kw in doxxing_keywords if kw in corpus)
    violence_score = sum(1 for kw in violence_keywords if kw in corpus)

    # Determine primary category
    scores = {
        "Non-Consensual Imagery Threat": imagery_score * 2.5,
        "Extortion / Blackmail": extortion_score * 2.0,
        "Cyberstalking": stalking_score * 2.0,
        "Doxxing / Identity Misuse": doxxing_score * 1.8,
        "Targeted Harassment": violence_score * 2.2 + (1.0 if corpus.strip() else 0.0)
    }

    best_category = max(scores, key=scores.get)
    max_score = scores[best_category]

    # If everything is zero but there is text
    if max_score == 0:
        best_category = "Targeted Harassment"

    # Severity Assessment
    if imagery_score > 0 and (extortion_score > 0 or violence_score > 0):
        severity = "CRITICAL"
    elif violence_score > 0 or (imagery_score > 0):
        severity = "CRITICAL" if any(k in corpus for k in ["kill", "rape", "acid", "murder"]) else "HIGH"
    elif stalking_score > 0 or extortion_score > 0:
        severity = "HIGH"
    elif doxxing_score > 0:
        severity = "HIGH"
    elif len(corpus.strip()) > 50:
        severity = "MEDIUM"
    else:
        severity = "LOW"

    # Generate professional summary
    summary_parts = []
    summary_parts.append(f"AI Forensics triaged content under '{best_category}' with assessed threat tier {severity}.")
    if extracted_ids:
        summary_parts.append(f"Extracted {len(extracted_ids)} digital artifact(s)/handle(s): {', '.join(extracted_ids[:3])}.")
    if imagery_score > 0:
        summary_parts.append("Threat contains indicators of non-consensual imagery dissemination or digital extortion.")
    elif stalking_score > 0:
        summary_parts.append("Identified surveillance patterns and physical geotracking references requiring immediate protective measures.")
    elif extortion_score > 0:
        summary_parts.append("Coercive demands detected with financial or reputational leverage.")
    else:
        summary_parts.append("Abusive electronic communication documented with cryptographic SHA-256 chain of custody.")

    legal_refs = LEGAL_REFERENCES_MAP.get(best_category, LEGAL_REFERENCES_MAP["Targeted Harassment"])

    return {
        "suggested_category": best_category,
        "suggested_severity": severity,
        "summary": " ".join(summary_parts),
        "extracted_identifiers": extracted_ids,
        "legal_references": legal_refs
    }


async def triage_threat(
    raw_text: Optional[str] = None,
    source_url: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    Main triage coordinator: Attempts Google Gemini API triage if key is present,
    otherwise instantly executes deterministic heuristic analyzer.
    """
    # 1. Fallback / Baseline first
    baseline = deterministic_threat_triage(raw_text, source_url, description)

    api_key = settings.GEMINI_API_KEY
    if not api_key:
        return baseline

    # 2. If Gemini API key is configured, call Gemini Flash API
    gemini_endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = (
        "You are an expert digital forensics investigator specializing in women's online safety and digital harassment laws. "
        "Analyze the following evidence submission:\n\n"
        f"Raw Text/Message: {raw_text or 'N/A'}\n"
        f"Source URL/Platform: {source_url or 'N/A'}\n"
        f"Victim Context: {description or 'N/A'}\n\n"
        "Return ONLY a valid JSON object with the following schema:\n"
        "{\n"
        '  "suggested_category": "Non-Consensual Imagery Threat" | "Cyberstalking" | "Doxxing / Identity Misuse" | "Extortion / Blackmail" | "Targeted Harassment",\n'
        '  "suggested_severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",\n'
        '  "summary": "Concise forensic summary for court/guardian review",\n'
        '  "extracted_identifiers": ["@handle1", "phone_number", "url"]\n'
        "}"
    )

    request_payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}
    }

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.post(gemini_endpoint, json=request_payload)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                cat = parsed.get("suggested_category", baseline["suggested_category"])
                return {
                    "suggested_category": cat,
                    "suggested_severity": parsed.get("suggested_severity", baseline["suggested_severity"]),
                    "summary": parsed.get("summary", baseline["summary"]),
                    "extracted_identifiers": parsed.get("extracted_identifiers", baseline["extracted_identifiers"]),
                    "legal_references": LEGAL_REFERENCES_MAP.get(cat, baseline["legal_references"])
                }
    except Exception as exc:
        logger.warning(f"Gemini API triage call encountered error, using deterministic analyzer: {exc}")

    return baseline
