import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LatLng, RouteInfo, TravelMode } from "./lib/geo";

export type EvidenceKind = "image" | "video" | "audio";
export interface Evidence {
  id: string; kind: EvidenceKind; name: string; url: string; at: string; incidentId?: string;
  size: number; format: string; duration?: number;
  /** demo = bundled sample · local = saved in this browser session only · pending = queued, no backend connected · synced = confirmed by a backend */
  sync: "demo" | "local" | "pending" | "synced";
  access: string[]; hash?: { value: string; at: string };
  note?: string;
}
export interface Contact { id: string; name: string; relation: string; phone: string; journeyAlerts: boolean; sosAlerts: boolean; missedCheckIn: boolean }
export interface Place { id: string; label: string; address: string; pos?: LatLng; hideAddress: boolean }
export type TimelineKind = "sos" | "alert" | "ack" | "note" | "evidence" | "created" | "resolved";
export interface TimelineEvent { id: string; at: string; kind: TimelineKind; text: string; demo?: boolean }
export interface Incident {
  id: string; title: string; type: "physical" | "digital"; category: string; status: "active" | "open" | "resolved";
  at: string; locationText?: string; pos?: LatLng; description: string; timeline: TimelineEvent[];
  acks: Record<string, "pending" | "acknowledged">; demo?: boolean;
}
export interface Journey {
  active: boolean; startLabel: string; start: LatLng; destLabel: string; dest: LatLng; mode: TravelMode;
  route: RouteInfo; startedAt: string; interval: number; shareWith: string[];
  status: "on-track" | "checkin-due" | "overdue" | "arrived"; lastCheckIn?: string;
}
export interface Settings { locationSharing: "journeys" | "off"; retentionDays: number; requireConfirmShare: boolean; notifications: boolean }
export interface Profile { name: string; email: string }

const t = (d: string) => new Date(d).toISOString();
const A = "/assets";
const seedEvidence = (): Evidence[] => [
  { id: "e1", kind: "image", name: "chat_unknown_user_88.jpg", url: `${A}/screenshots/demo_threatening_chat.jpg`, at: t("2026-10-20T21:41:00+05:30"), incidentId: "SC-2026-0138", size: 500508, format: "JPEG", sync: "demo", access: [], note: "Fictional demo screenshot" },
  { id: "e2", kind: "image", name: "fake_account_profile.jpg", url: `${A}/screenshots/demo_suspicious_account.jpg`, at: t("2026-10-20T22:09:00+05:30"), incidentId: "SC-2026-0138", size: 333896, format: "JPEG", sync: "demo", access: [], note: "Fictional demo screenshot" },
  { id: "e3", kind: "image", name: "impersonation_message.jpg", url: `${A}/screenshots/demo_impersonation_message.jpg`, at: t("2026-10-21T10:03:00+05:30"), incidentId: "SC-2026-0138", size: 351086, format: "JPEG", sync: "demo", access: [], note: "Fictional demo screenshot" },
  { id: "e4", kind: "video", name: "demo_clip_street_walk.mp4", url: `${A}/videos/demo_sample_clip.mp4`, at: t("2026-10-22T20:44:00+05:30"), incidentId: "SC-2026-0142", size: 788493, format: "MP4", sync: "demo", access: [], note: "Neutral sample footage (no real people)" },
  { id: "e5", kind: "video", name: "demo_clip_roadside.mp4", url: `${A}/videos/demo_flower_clip.mp4`, at: t("2026-10-22T20:51:00+05:30"), incidentId: "SC-2026-0142", size: 1128375, format: "MP4", sync: "demo", access: [], note: "Neutral sample footage (CC0)" },
  { id: "e6", kind: "audio", name: "demo_audio_short.wav", url: `${A}/audio/demo_audio_sample_short.wav`, at: t("2026-10-22T20:46:00+05:30"), incidentId: "SC-2026-0142", size: 384044, format: "WAV", sync: "demo", access: [], note: "Synthetic tone sample, not a real recording" },
  { id: "e7", kind: "audio", name: "demo_audio_long.wav", url: `${A}/audio/demo_audio_sample_long.wav`, at: t("2026-10-22T20:53:00+05:30"), incidentId: "SC-2026-0142", size: 864044, format: "WAV", sync: "demo", access: [], note: "Synthetic tone sample, not a real recording" },
];

const seedContacts = (): Contact[] => [
  { id: "c1", name: "Priya Sharma", relation: "Mother", phone: "+91 98765 43210", journeyAlerts: true, sosAlerts: true, missedCheckIn: true },
  { id: "c2", name: "Riya Menon", relation: "Friend", phone: "+91 91234 56780", journeyAlerts: true, sosAlerts: true, missedCheckIn: false },
  { id: "c3", name: "Karan Sharma", relation: "Brother", phone: "+91 99887 76650", journeyAlerts: false, sosAlerts: true, missedCheckIn: true },
];
const seedPlaces = (): Place[] => [
  { id: "p1", label: "Home", address: "Sample address, tap Edit to set your own", pos: [12.9352, 77.6245], hideAddress: true },
  { id: "p2", label: "College", address: "Sample College Campus (fictional)", pos: [12.9698, 77.7499], hideAddress: false },
  { id: "p3", label: "Riya's flat", address: "Indiranagar (sample)", pos: [12.9784, 77.6408], hideAddress: false },
];
const ev = (id: string, at: string, kind: TimelineKind, text: string, demo = false): TimelineEvent => ({ id, at: t(at), kind, text, demo });
const seedIncidents = (): Incident[] => [
  { id: "SC-2026-0142", title: "Followed after evening class", type: "physical", category: "Being followed", status: "open", at: t("2026-10-22T20:40:00+05:30"), locationText: "Near MG Road (sample)", pos: [12.9756, 77.6068], description: "Fictional demo scenario: a person walked behind me for several blocks after class. I recorded short clips and audio notes.", demo: true,
    acks: { c1: "acknowledged", c2: "acknowledged", c3: "pending" },
    timeline: [ev("t1", "2026-10-22T20:40:00+05:30", "created", "Incident record created (demo data)", true), ev("t2", "2026-10-22T20:44:00+05:30", "evidence", "Video added: demo_clip_street_walk.mp4", true), ev("t3", "2026-10-22T20:46:00+05:30", "evidence", "Audio added: demo_audio_short.wav", true), ev("t4", "2026-10-22T20:58:00+05:30", "ack", "Priya acknowledged (sample data)", true)] },
  { id: "SC-2026-0138", title: "Threats and fake account", type: "digital", category: "Threats & impersonation", status: "open", at: t("2026-10-20T21:41:00+05:30"), description: "Fictional demo scenario: threatening messages from an unknown account plus a fake profile and an OTP-scam impersonation message.", demo: true,
    acks: {},
    timeline: [ev("t5", "2026-10-20T21:41:00+05:30", "created", "Incident record created (demo data)", true), ev("t6", "2026-10-20T22:09:00+05:30", "evidence", "Screenshot added: fake_account_profile.jpg", true), ev("t7", "2026-10-21T10:03:00+05:30", "evidence", "Screenshot added: impersonation_message.jpg", true)] },
];

interface Persisted { contacts: Contact[]; places: Place[]; incidents: Incident[]; settings: Settings; profile: Profile; journey: Journey | null; counter: number }
const KEY = "safecircle:v1";
const defaults = (): Persisted => ({ contacts: seedContacts(), places: seedPlaces(), incidents: seedIncidents(), settings: { locationSharing: "journeys", retentionDays: 180, requireConfirmShare: true, notifications: false }, profile: { name: "Shreya Sharma", email: "shreya@example.com" }, journey: null, counter: 143 });
function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = { ...defaults(), ...JSON.parse(raw) };
      if (parsed.profile?.name === "Aarav Sharma") {
        parsed.profile.name = "Shreya Sharma";
        parsed.profile.email = "shreya@example.com";
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return defaults();
}

interface Store extends Persisted {
  evidence: Evidence[]; toast: (m: string) => void; toastMsg: string;
  decoyActive: boolean; setDecoyActive: (v: boolean) => void;
  addContact: (c: Omit<Contact, "id">) => void; updateContact: (id: string, p: Partial<Contact>) => void; removeContact: (id: string) => void;
  addPlace: (p: Omit<Place, "id">) => void; updatePlace: (id: string, p: Partial<Place>) => void; removePlace: (id: string) => void;
  addIncident: (i: Omit<Incident, "id" | "acks"> & { acks?: Incident["acks"] }, evidence?: Omit<Evidence, "id" | "incidentId">[]) => string;
  updateIncident: (id: string, p: Partial<Incident>) => void; addTimeline: (id: string, e: Omit<TimelineEvent, "id" | "at"> & { at?: string }) => void;
  addEvidence: (e: Omit<Evidence, "id">) => string; updateEvidence: (id: string, p: Partial<Evidence>) => void; removeEvidence: (id: string) => void;
  setJourney: (j: Journey | null) => void; patchJourney: (p: Partial<Journey>) => void;
  setSettings: (p: Partial<Settings>) => void; setProfile: (p: Partial<Profile>) => void;
  triggerSOS: (pos?: LatLng) => string; resetAll: () => void;
}
const Ctx = createContext<Store | null>(null);
export const useStore = () => { const s = useContext(Ctx); if (!s) throw new Error("store"); return s; };
const uid = () => Math.random().toString(36).slice(2, 9);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(load);
  const [evidence, setEvidence] = useState<Evidence[]>(seedEvidence);
  const [decoyActive, setDecoyActive] = useState(true);
  const [toastMsg, setToastMsg] = useState("");
  const timer = useRef<number>(0);
  const pRef = useRef(p); pRef.current = p;
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(p)); } catch { /* quota */ } }, [p]);
  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout(timer.current); timer.current = window.setTimeout(() => setToastMsg(""), 3400); }, []);
  const upd = (patch: Partial<Persisted> | ((s: Persisted) => Partial<Persisted>)) => setP((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

  const api = useMemo<Store>(() => ({
    ...p, evidence, toast, toastMsg, decoyActive, setDecoyActive,
    addContact: (c) => upd((s) => ({ contacts: [...s.contacts, { ...c, id: uid() }] })),
    updateContact: (id, x) => upd((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...x } : c)) })),
    removeContact: (id) => upd((s) => ({ contacts: s.contacts.filter((c) => c.id !== id) })),
    addPlace: (x) => upd((s) => ({ places: [...s.places, { ...x, id: uid() }] })),
    updatePlace: (id, x) => upd((s) => ({ places: s.places.map((c) => (c.id === id ? { ...c, ...x } : c)) })),
    removePlace: (id) => upd((s) => ({ places: s.places.filter((c) => c.id !== id) })),
    addIncident: (i, evs = []) => {
      const id = `SC-2026-${String(pRef.current.counter).padStart(4, "0")}`;
      upd((s) => ({ counter: s.counter + 1, incidents: [{ ...i, id, acks: i.acks ?? {} }, ...s.incidents] }));
      if (evs.length) setEvidence((e) => [...evs.map((x) => ({ ...x, id: uid(), incidentId: id })), ...e]);
      return id;
    },
    updateIncident: (id, x) => upd((s) => ({ incidents: s.incidents.map((c) => (c.id === id ? { ...c, ...x } : c)) })),
    addTimeline: (id, e) => upd((s) => ({ incidents: s.incidents.map((c) => (c.id === id ? { ...c, timeline: [...c.timeline, { ...e, id: uid(), at: e.at ?? new Date().toISOString() }] } : c)) })),
    addEvidence: (e) => { const id = uid(); setEvidence((l) => [{ ...e, id }, ...l]); return id; },
    updateEvidence: (id, x) => setEvidence((l) => l.map((e) => (e.id === id ? { ...e, ...x } : e))),
    removeEvidence: (id) => setEvidence((l) => l.filter((e) => e.id !== id)),
    setJourney: (j) => upd({ journey: j }),
    patchJourney: (x) => upd((s) => ({ journey: s.journey ? { ...s.journey, ...x } : s.journey })),
    setSettings: (x) => upd((s) => ({ settings: { ...s.settings, ...x } })),
    setProfile: (x) => upd((s) => ({ profile: { ...s.profile, ...x } })),
    triggerSOS: (pos) => {
      const s = pRef.current; const id = `SC-2026-${String(s.counter).padStart(4, "0")}`; const now = new Date().toISOString();
      const acks: Incident["acks"] = {}; s.contacts.filter((c) => c.sosAlerts).forEach((c) => (acks[c.id] = "pending"));
      const inc: Incident = { id, title: "SOS alert (demo)", type: "physical", category: "SOS", status: "active", at: now, pos, locationText: pos ? "Location shared from device" : "Location not captured", description: "SOS triggered from the Home screen in the prototype.", demo: true, acks,
        timeline: [{ id: uid(), at: now, kind: "sos", text: "SOS triggered by you" }, { id: uid(), at: now, kind: "alert", text: `Alert prepared for ${Object.keys(acks).length} contacts. DEMO: no message was actually sent.`, demo: true }] };
      upd((st) => ({ counter: st.counter + 1, incidents: [inc, ...st.incidents] }));

      // 1. Instant cross-tab sync to Guardian Website via BroadcastChannel
      try {
        const ch = new BroadcastChannel("safecircle_emergency_bus");
        ch.postMessage({
          type: "SOS_TRIGGERED",
          data: {
            incident_id: id,
            user_name: s.profile?.name || "Shreya",
            lat: pos ? pos[0] : 12.9850,
            lng: pos ? pos[1] : 77.5850,
            battery_level: 34,
            trigger_mode: "STEALTH_BLACK_SCREEN",
            status: "ACTIVE",
            timestamp: now,
          },
        });
      } catch { /* ignore */ }

      // 2. Transmit to FastAPI Backend
      try {
        fetch("http://localhost:8000/api/incidents/physical", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: "demo",
            lat: pos ? pos[0] : 12.9850,
            lng: pos ? pos[1] : 77.5850,
            battery_level: 34,
            trigger_mode: "STEALTH_BLACK_SCREEN",
          }),
        }).catch(() => {});
      } catch { /* ignore */ }

      return id;
    },
    resetAll: () => { localStorage.removeItem(KEY); setP(defaults()); setEvidence(seedEvidence()); },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [p, evidence, toast, toastMsg, decoyActive]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const maskPhone = (ph: string) => { const d = ph.replace(/\D/g, ""); const cc = ph.startsWith("+") ? ph.split(" ")[0] : ""; return `${cc} ••••• ••${d.slice(-3)}`.trim(); };
export const initials = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");
