# SafeCircle — Women's Safety & Digital Evidence Vault

SafeCircle is a unified platform supporting:
1. **Physical Emergency SOS:** Stealth black-screen streaming of live 4-second video/audio chunks with real-time GPS telemetry, acoustic/ultrasonic mesh relay, and instant Telegram dispatches.
2. **Digital Harassment Evidence Preservation:** Tamper-evident evidence vault featuring cryptographic SHA-256 chain-of-custody sealing, automated AI threat triage (Indian IT Act & BNS statutory alignment), time-limited capability links, and print-ready court forensic certificates.

---

## Backend Quickstart

```bash
cd safecircle-backend
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- **Interactive API Docs (Swagger UI):** [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check:** [http://localhost:8000/health](http://localhost:8000/health)
- **Demo User Endpoint:** [http://localhost:8000/api/users/demo](http://localhost:8000/api/users/demo)
