# 🛡️ SafeCircle Guardian Dashboard

> **Premium Emergency Response Command Center**  
> *Tagline: "Every second matters. Every update counts."*

SafeCircle Guardian is the web interface opened by trusted contacts and authorized responders upon receiving an emergency broadcast. It provides real-time situational awareness, interactive telemetry mapping, live stealth media chunk review, and automated Section 65B forensic chain-of-custody reporting.

---

## 🚀 Quickstart

### 1. Install Dependencies
```bash
cd safecircle-guardian
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```

- **Guardian Dashboard URL:** [http://localhost:5173/](http://localhost:5173/)
- **Vite Port:** `5173` (pre-configured to match backend `FRONTEND_URL`)

### 3. Build for Production
```bash
npm run build
```

---

## 🧭 Application Routes

| Path | Screen Name | Description |
|---|---|---|
| `/` | **Emergency Overview** | Command center centerpiece: active emergency header, primary actions (Acknowledge / Resolve), summary metrics, interactive Leaflet radar map, live evidence stream, and chronological timeline. |
| `/incidents` | **Incident History** | Archive table supporting Physical SOS and Digital Harassment records with search, multi-field filters, and status sorting. |
| `/incidents/:incidentId` | **Incident Detail** | In-depth incident analysis including victim profile, AI threat classifications, and statutory violation citations. |
| `/guardian/:token` | **Direct Capability Link** | Capability URL resolver allowing instant emergency stream review without authentication friction. |
| `/evidence` | **Evidence Vault** | Centralized index of all captured media chunks, audio waveforms, and threat screenshots with SHA-256 verification and Grid/List toggles. |
| `/reports` | **Forensic Reports** | Court-admissible Section 65B Electronic Evidence Certificate with Master Merkle Root Custody Seal, browser print PDF generator, and machine-readable JSON download. |
| `/settings` | **Settings** | Responder profile, acoustic alerts toggle, telemetry polling rate, and demo state reset controls. |

---

## 🎨 Visual Design System

- **Command Center Palette:**
  - App Background: `#0B1020`
  - Sidebar: `#0E1426`
  - Panels: `#111A2E`
  - Elevated Cards: `#151F35`
  - Emergency Red: `#F0525F` (Restrained for active alerts)
  - Acknowledged Amber: `#E8B65C`
  - Resolved Teal: `#38C6A3`
  - Informational Blue: `#6EA8FE`
- **Typography:** Inter sans-serif paired with JetBrains Mono for cryptographic digests and incident IDs.
- **Micro-Interactions:** Custom pulsing Leaflet radar markers, accessible confirmation dialogs, toast feedback, and waveform animations.

---

## 🧪 Interactive Demo Controls

The frontend is currently decoupled from the backend and operates with a typed local demo store:
- **Simulate Incoming Chunk:** Ingests a new 4.0-second stealth video/audio chunk with simulated SHA-256 fingerprinting and timeline logging.
- **Refresh Telemetry:** Simulates GPS drift and battery status updates.
- **Acknowledge Alert:** Formally acknowledges the active emergency with responder timestamping.
- **Resolve Incident:** Marks the victim safe and permanently seals the vault custody log.
- **Reset Demo State:** Reverts all incidents, chunks, and logs to factory demo state via the top banner or Settings page.

---

## 🔗 Future FastAPI Backend Integration

The frontend architecture mirrors the FastAPI models and endpoints in `safecircle-backend`:
- `GET /api/users/demo` ➔ User & contact loading
- `GET /api/incidents/token/{access_token}` ➔ Capability URL resolution
- `POST /api/incidents/token/{access_token}/acknowledge` ➔ Guardian acknowledgment
- `POST /api/incidents/{incident_id}/evidence` ➔ Live media chunk ingestion
- `GET /api/incidents/token/{access_token}/report` ➔ Section 65B forensic report data
