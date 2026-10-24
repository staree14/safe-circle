# 🛡️ SafeCircle Backend API

> **Zero-Friction, Production-Ready Python FastAPI Backend**  
> Supporting **Physical Emergency SOS** (with live stealth evidence streaming) & **Digital Harassment Evidence Preservation** (with cryptographic SHA-256 chain of custody and AI threat triage).

---

## 🚀 Quickstart

### 1. Requirements & Setup
```bash
cd safecircle-backend

# Virtual environment setup
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Environment configuration
cp .env.example .env
```

### 2. Start the Server
```bash
# From within safecircle-backend/
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive Swagger Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc:** [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)

---

## 📦 System Architecture & Features

```
safecircle-backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app, CORS (*), static mount, startup seed data
│   ├── config.py            # Pydantic v2 settings (DB, Telegram, Gemini, Frontend URLs)
│   ├── database.py          # SQLAlchemy 2.0 ORM engine, SessionLocal, get_db dependency
│   ├── models.py            # User, TrustedContact, Incident, Evidence, TimelineEvent
│   ├── schemas.py           # Pydantic v2 schemas
│   ├── services/
│   │   ├── crypto_vault.py  # SHA-256 hashing & local evidence storage (/uploads)
│   │   ├── telegram_bot.py  # Async Telegram alert dispatcher with graceful fallback logging
│   │   ├── ai_triage.py     # Gemini AI triage with deterministic heuristic fallback & Indian IT/BNS laws
│   │   └── report_gen.py    # Forensic Chain-of-Custody Report (JSON + Print-ready HTML/PDF)
│   └── routers/
│       ├── users.py         # User & Trusted Contacts CRUD (/api/users/demo)
│       ├── incidents.py     # Flow A (Physical SOS) & Flow B (Digital Threat) lifecycle
│       └── evidence.py      # Live stealth video/audio chunk upload & retrieval
├── uploads/                 # Cryptographically preserved evidence files
├── requirements.txt
└── .env.example
```

---

## 🔑 Pre-Seeded Zero-Friction Demo Data

On startup, SafeCircle automatically seeds the primary demo user (`Sreeya`) and 3 trusted contacts:
- `GET /api/users/demo`: Returns Sreeya and her contacts:
  1. **Aditi Sharma** (Sister, Primary SOS contact)
  2. **Dr. Rajiv Chand** (Father)
  3. **Campus Security Desk** (Authority / Guardian)

---

## 📡 API Endpoints Guide

### 1. Users & Contacts (`/api/users`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/demo` | Get demo user ("Sreeya") & 3 contacts for instant frontend boot |
| `GET` | `/api/users/{user_id}` | Fetch user by UUID |
| `POST` | `/api/users` | Register custom user |
| `GET` | `/api/users/{user_id}/contacts` | List trusted circle contacts |
| `POST` | `/api/users/{user_id}/contacts` | Add a new trusted contact |

---

### 2. Flow A — Physical Emergency SOS (`/api/incidents`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/incidents/physical` | Triggers active SOS, generates capability `access_token`, sends instant Telegram emergency dispatch with Google Maps & Guardian link |
| `PATCH` | `/api/incidents/{incident_id}/telemetry` | Real-time GPS coordinates and battery update |
| `POST` | `/api/incidents/relay` | Ultrasonic / acoustic store-and-forward mesh packet handler |

#### Sample Physical SOS Payload (`POST /api/incidents/physical`):
```json
{
  "user_id": "<USER_ID>",
  "lat": 12.9716,
  "lng": 77.5946,
  "battery_level": 82,
  "trigger_mode": "STEALTH_BLACK_SCREEN"
}
```

---

### 3. Flow B — Digital Harassment Vault (`/api/incidents`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/incidents/triage-preview` | **Step 3 Preview**: Analyzes raw text/URL, returns category, severity, extracted `@handles`, and statutory references (IT Act & BNS) |
| `POST` | `/api/incidents/digital` | **Multipart Submission**: Preserves screenshot/file + text, computes SHA-256 fingerprint, sets time-limited access token, sends selective Telegram share |

#### Categories Triaged:
- `Non-Consensual Imagery Threat` (IT Act Sec 66E / 67A, BNS 77)
- `Extortion / Blackmail` (BNS 308 / IPC 384, IT Act 66)
- `Cyberstalking` (BNS 78 / IPC 354D)
- `Doxxing / Identity Misuse` (IT Act 66C / 66D, BNS 79)
- `Targeted Harassment` (BNS 351 / IPC 503 & 506)

---

### 4. Live Stealth Evidence Streaming (`/api/incidents/{incident_id}/evidence`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/incidents/{id}/evidence` | Uploads 4-second stealth video/audio chunks or screenshots. Computes SHA-256 on raw bytes and returns accessible `file_url` for live streaming |
| `GET` | `/api/incidents/{id}/evidence` | List all evidence items ordered chronologically |

---

### 5. Guardian Dashboard & Authority Response (`/api/incidents`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incidents` | Lists all incidents across Physical SOS and Digital Threat |
| `GET` | `/api/incidents/token/{access_token}` | Secure capability URL view for `/guardian/:token` with validity and live evidence manifest |
| `POST` | `/api/incidents/token/{access_token}/acknowledge` | Acknowledges incident (responder name recorded, circle notified) |
| `POST` | `/api/incidents/{incident_id}/resolve` | Resolves incident (marks victim safe, seals custody log) |
| `GET` | `/api/incidents/token/{access_token}/report` | Generates official forensic report (`?format=json` or `?format=html`) |

---

## ⚖️ Forensic Chain-of-Custody Report
- **JSON Format (`?format=json`)**: Full machine-readable audit trail compliant with ISO/IEC 27037:2012 and IT Act Section 65B with Master Merkle Root Custody Seal.
- **HTML Format (`?format=html`)**: Print-ready, styled legal certificate with tamper seals and `window.print()` button.
