import { useEffect, useMemo, type ReactNode } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEMO_CENTER, locMessage, useOnline, type LatLng, type LocStatus } from "../lib/geo";
import { Icon } from "./ui";

export interface MapMarker {
  pos: LatLng;
  kind: "me" | "start" | "dest" | "incident" | "place" | "demo" | "safe_police" | "safe_mall" | "safe_bus" | "safe_pharmacy" | "safe_metro" | "safe_hospital";
  label?: string;
  safeSpotId?: string;
}

const icons: Record<MapMarker["kind"], L.DivIcon> = {
  me: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-me"><i></i></span>', iconSize: [26, 26], iconAnchor: [13, 13] }),
  demo: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-demo"><i></i></span>', iconSize: [26, 26], iconAnchor: [13, 13] }),
  start: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-start"></span>', iconSize: [20, 20], iconAnchor: [10, 10] }),
  dest: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-pin"><b></b></span>', iconSize: [34, 42], iconAnchor: [17, 40] }),
  incident: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-pin mk-red"><b></b></span>', iconSize: [34, 42], iconAnchor: [17, 40] }),
  place: L.divIcon({ className: "mk-wrap", html: '<span class="mk mk-pin mk-sage"><b></b></span>', iconSize: [34, 42], iconAnchor: [17, 40] }),
  safe_police: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-police"><div class="mk-safe-bubble">👮</div><span class="mk-safe-label">Police Post</span></div>',
    iconSize: [80, 52],
    iconAnchor: [40, 24],
  }),
  safe_mall: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-mall"><div class="mk-safe-bubble">🛍️</div><span class="mk-safe-label">Mall (Crowd)</span></div>',
    iconSize: [88, 52],
    iconAnchor: [44, 24],
  }),
  safe_bus: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-bus"><div class="mk-safe-bubble">🚏</div><span class="mk-safe-label">Bus Stop</span></div>',
    iconSize: [80, 52],
    iconAnchor: [40, 24],
  }),
  safe_metro: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-metro"><div class="mk-safe-bubble">🚇</div><span class="mk-safe-label">Metro Station</span></div>',
    iconSize: [84, 52],
    iconAnchor: [42, 24],
  }),
  safe_pharmacy: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-pharma"><div class="mk-safe-bubble">💊</div><span class="mk-safe-label">24/7 Store</span></div>',
    iconSize: [80, 52],
    iconAnchor: [40, 24],
  }),
  safe_hospital: L.divIcon({
    className: "mk-wrap-safe",
    html: '<div class="mk-safe-pin mk-safe-hospital"><div class="mk-safe-bubble">🏥</div><span class="mk-safe-label">Hospital ER</span></div>',
    iconSize: [80, 52],
    iconAnchor: [40, 24],
  }),
};

function Controller({ center, fit, zoom }: { center: LatLng; fit?: LatLng[]; zoom: number }) {
  const map = useMap();
  const key = useMemo(() => JSON.stringify([center, fit?.length ? [fit[0], fit[fit.length - 1], fit.length] : null]), [center, fit]);
  useEffect(() => {
    if (fit && fit.length > 1) map.fitBounds(L.latLngBounds(fit), { padding: [48, 48], maxZoom: 17 });
    else map.setView(center, zoom);
    setTimeout(() => map.invalidateSize(), 120);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return null;
}
function Picker({ onPick }: { onPick: (p: LatLng) => void }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lat, e.latlng.lng]) });
  return null;
}

interface Props {
  center?: LatLng; zoom?: number; markers?: MapMarker[]; route?: LatLng[]; routeEstimated?: boolean;
  onPick?: (p: LatLng) => void; onLocate?: () => void; locStatus?: LocStatus; height?: number | string;
  onMarkerClick?: (marker: MapMarker) => void;
  note?: string; children?: ReactNode; className?: string;
}
export default function MapView({ center = DEMO_CENTER, zoom = 14, markers = [], route, routeEstimated, onPick, onLocate, onMarkerClick, locStatus = "idle", height = 260, note, children, className = "" }: Props) {
  const online = useOnline();
  const fit = route && route.length > 1 ? route : markers.length > 1 ? markers.map((m) => m.pos) : undefined;
  const msg = locMessage(locStatus);
  return (
    <div className={`mapview ${className}`} style={{ height }}>
      <MapContainer center={center} zoom={zoom} zoomControl={false} scrollWheelZoom attributionControl>
        <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" maxZoom={19} />
        <Controller center={center} fit={fit} zoom={zoom} />
        {onPick && <Picker onPick={onPick} />}
        {route && route.length > 1 && <>
          <Polyline positions={route} pathOptions={{ color: "#fff", weight: 9, opacity: 0.9 }} />
          <Polyline positions={route} pathOptions={{ color: "#713F52", weight: 5, dashArray: routeEstimated ? "2 10" : undefined, lineCap: "round" }} />
        </>}
        {markers.map((m, i) => (
          <Marker
            key={i}
            position={m.pos}
            icon={icons[m.kind] || icons.place}
            title={m.label}
            keyboard={false}
            eventHandlers={{
              click: () => onMarkerClick?.(m),
            }}
          />
        ))}
      </MapContainer>
      {onLocate && <button type="button" className="map-fab" onClick={onLocate} aria-label="Recenter map on my location"><Icon name="locate" size={21} /></button>}
      {onPick && <span className="map-hint">Tap the map to drop a pin</span>}
      {note && <span className="map-note">{note}</span>}
      {!online && <div className="map-overlay" role="status"><Icon name="wifioff" size={22} /><b>You're offline</b><span>Map tiles can't load right now. Recently viewed areas may still appear.</span></div>}
      {msg && online && <div className={`map-toast ${locStatus === "loading" ? "" : "bad"}`} role="status">{locStatus === "loading" && <span className="spinner" />}{msg}</div>}
      {children}
    </div>
  );
}
