import { useCallback, useEffect, useRef, useState } from "react";

export type LatLng = [number, number];

/** Default map centre used ONLY for the demo until the user taps "locate". Not the user's location. */
export const DEMO_CENTER: LatLng = [12.9756, 77.6068];
export const DEMO_CENTER_LABEL = "MG Road, Bengaluru (demo map centre)";

export interface GeoResult { label: string; pos: LatLng }

/** Address search via OpenStreetMap Nominatim (no API key; please keep usage light). */
export async function geocode(query: string, signal?: AbortSignal): Promise<GeoResult[]> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = (await res.json()) as { display_name: string; lat: string; lon: string }[];
  return data.map((d) => ({ label: d.display_name, pos: [parseFloat(d.lat), parseFloat(d.lon)] as LatLng }));
}

export type TravelMode = "walking" | "cycling" | "driving";
export const MODES: { id: TravelMode; label: string; kmh: number }[] = [
  { id: "walking", label: "Walking", kmh: 5 },
  { id: "cycling", label: "Cycling", kmh: 15 },
  { id: "driving", label: "Car / cab", kmh: 25 },
];

export interface RouteInfo { path: LatLng[]; distanceKm: number; etaMin: number; estimated: boolean }

export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371, rad = Math.PI / 180;
  const dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

/** Real routing via the public OSM-based FOSSGIS routing servers; falls back to a labelled straight line. */
export async function getRoute(a: LatLng, b: LatLng, mode: TravelMode, signal?: AbortSignal): Promise<RouteInfo> {
  const profile = mode === "walking" ? "routed-foot" : mode === "cycling" ? "routed-bike" : "routed-car";
  const url = `https://routing.openstreetmap.de/${profile}/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) throw new Error("routing unavailable");
    const json = await res.json();
    const r = json.routes?.[0];
    if (!r) throw new Error("no route");
    const path = (r.geometry.coordinates as [number, number][]).map(([lng, lat]) => [lat, lng] as LatLng);
    return { path, distanceKm: r.distance / 1000, etaMin: Math.max(1, Math.round(r.duration / 60)), estimated: false };
  } catch (e) {
    if ((e as Error).name === "AbortError") throw e;
    const km = haversineKm(a, b);
    const kmh = MODES.find((m) => m.id === mode)!.kmh;
    return { path: [a, b], distanceKm: km, etaMin: Math.max(1, Math.round((km / kmh) * 60)), estimated: true };
  }
}

export type LocStatus = "idle" | "loading" | "ok" | "denied" | "unavailable" | "unsupported";

/** Location is requested ONLY when request() is called from a user action. */
export function useLocation() {
  const [state, set] = useState<{ status: LocStatus; pos?: LatLng; accuracy?: number }>({ status: "idle" });
  const request = useCallback(() => {
    if (!("geolocation" in navigator)) { set({ status: "unsupported" }); return; }
    set((s) => ({ ...s, status: "loading" }));
    navigator.geolocation.getCurrentPosition(
      (p) => set({ status: "ok", pos: [p.coords.latitude, p.coords.longitude], accuracy: p.coords.accuracy }),
      (e) => set({ status: e.code === 1 ? "denied" : "unavailable" }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  }, []);
  return { ...state, request };
}

export function locMessage(s: LocStatus) {
  switch (s) {
    case "loading": return "Finding your location…";
    case "denied": return "Location permission was denied. You can allow it in your browser's site settings, or pick a point on the map.";
    case "unavailable": return "Location unavailable. GPS needs HTTPS (or localhost) and a signal. You can still pick a point on the map.";
    case "unsupported": return "This browser doesn't support location. You can still pick a point on the map.";
    default: return "";
  }
}

export function useOnline() {
  const [on, setOn] = useState(typeof navigator === "undefined" ? true : navigator.onLine);
  useEffect(() => {
    const a = () => setOn(true), b = () => setOn(false);
    window.addEventListener("online", a); window.addEventListener("offline", b);
    return () => { window.removeEventListener("online", a); window.removeEventListener("offline", b); };
  }, []);
  return on;
}

/** Returns position only if the user already granted permission earlier (never triggers a prompt). */
export async function getLocationIfGranted(): Promise<LatLng | undefined> {
  try {
    const p = await navigator.permissions?.query({ name: "geolocation" as PermissionName });
    if (p?.state !== "granted") return undefined;
    return await new Promise<LatLng | undefined>((resolve) =>
      navigator.geolocation.getCurrentPosition((x) => resolve([x.coords.latitude, x.coords.longitude]), () => resolve(undefined), { timeout: 6000 }),
    );
  } catch { return undefined; }
}

/** Interpolate a point along a path at fraction t (0..1). */
export function pointAlong(path: LatLng[], t: number): LatLng {
  if (path.length === 0) return DEMO_CENTER;
  if (path.length === 1 || t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];
  const segs: number[] = []; let total = 0;
  for (let i = 1; i < path.length; i++) { const d = haversineKm(path[i - 1], path[i]); segs.push(d); total += d; }
  let target = total * t;
  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i]) { const f = segs[i] ? target / segs[i] : 0; return [path[i][0] + (path[i + 1][0] - path[i][0]) * f, path[i][1] + (path[i + 1][1] - path[i][1]) * f]; }
    target -= segs[i];
  }
  return path[path.length - 1];
}

export function useInterval(fn: () => void, ms: number | null) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => { if (ms == null) return; const id = setInterval(() => ref.current(), ms); return () => clearInterval(id); }, [ms]);
}
