import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  Compass
} from 'lucide-react';
import type { LocationCoordinates } from '../../types';

interface LocationMapProps {
  location: LocationCoordinates;
  victimName: string;
  lastUpdated?: string;
}

// Bengaluru Route Coordinates: MG Road -> Malleswaram
const ROUTE_COORDINATES: [number, number][] = [
  [12.9756, 77.6066], // MG Road Metro
  [12.9790, 77.5980], // Cubbon Park edge
  [12.9818, 77.5925], // Apollo Pharmacy
  [12.9850, 77.5850], // Current Live Position (Palace Road)
  [12.9912, 77.5765], // Seshadripuram Police Outpost
  [12.9980, 77.5700], // Malleswaram entrance
  [13.0031, 77.5643], // Malleswaram 8th Cross
];

const SAFE_SPOTS = [
  {
    name: 'MG Road Metro Station',
    category: 'CCTV & Security Desk',
    lat: 12.9756,
    lng: 77.6066,
  },
  {
    name: 'Apollo 24/7 Pharmacy & Clinic',
    category: '24/7 Safe Haven',
    lat: 12.9818,
    lng: 77.5925,
  },
  {
    name: 'Seshadripuram Police Outpost',
    category: 'Emergency Police Kiosk',
    lat: 12.9912,
    lng: 77.5765,
  },
  {
    name: 'Malleswaram 8th Cross Public Helpdesk',
    category: 'Verified Safe Spot',
    lat: 13.0031,
    lng: 77.5643,
  },
];

export const LocationMap: React.FC<LocationMapProps> = ({
  location,
  victimName,
  lastUpdated,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [mapError, setMapError] = useState(false);

  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        // Initialize Leaflet map centered on Bengaluru Route
        const map = L.map(mapContainerRef.current, {
          center: [12.9850, 77.5850],
          zoom: 14,
          zoomControl: false,
          attributionControl: false,
        });

        // 100% Free, Zero-API-key tile provider (OpenStreetMap - NO "API KEY REQUIRED" watermark)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          subdomains: ['a', 'b', 'c'],
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Add zoom control top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Draw Route Polyline (MG Road -> Malleswaram)
        L.polyline(ROUTE_COORDINATES, {
          color: '#C84B53',
          weight: 4,
          opacity: 0.9,
          dashArray: '8, 8',
          lineCap: 'round',
        }).addTo(map);

        // Add Green "Safe Spots" Markers along route (matching Mobile App Safe Journey)
        SAFE_SPOTS.forEach((spot) => {
          const safeIcon = L.divIcon({
            className: 'custom-safe-spot',
            html: `
              <div style="width: 28px; height: 28px; background: #2D6A4F; border: 2.5px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 10px rgba(45,106,79,0.4); display: flex; align-items: center; justify-content: center; color: white;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const spotMarker = L.marker([spot.lat, spot.lng], { icon: safeIcon }).addTo(map);
          spotMarker.bindPopup(`
            <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
              <div style="color: #2D6A4F; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                🛡️ Verified Safe Spot
              </div>
              <div style="color: #1F1A1C; font-weight: 700; font-size: 13px; margin-top: 2px;">
                ${spot.name}
              </div>
              <div style="color: #6E6265; font-size: 11px; margin-top: 1px;">
                ${spot.category}
              </div>
            </div>
          `);
        });

        // Pulsing Live Location Pin for Shreya
        const pulsingLiveIcon = L.divIcon({
          className: 'custom-live-marker',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(200, 75, 83, 0.35); animation: radar-pulse 2s infinite ease-in-out;"></div>
              <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(200, 75, 83, 0.6);"></div>
              <div style="position: relative; width: 16px; height: 16px; border-radius: 50%; background: #C84B53; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 12px rgba(200,75,83,0.7);"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const liveMarker = L.marker([location.lat, location.lng], { icon: pulsingLiveIcon }).addTo(map);

        liveMarker.bindPopup(`
          <div style="padding: 4px; font-family: 'Plus Jakarta Sans', sans-serif;">
            <div style="color: #C84B53; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              🚨 Live Position
            </div>
            <div style="color: #1F1A1C; font-weight: 700; font-size: 13px; margin-top: 2px;">
              ${victimName}
            </div>
            <div style="color: #6E6265; font-size: 11px; margin-top: 2px;">
              ${location.label}
            </div>
            <div style="color: #6E6265; font-size: 10px; margin-top: 4px; font-family: monospace;">
              ${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E
            </div>
          </div>
        `).openPopup();

        mapInstanceRef.current = map;
        markerRef.current = liveMarker;
      } else {
        // Update marker position on coordinate refresh
        mapInstanceRef.current.panTo([location.lat, location.lng], { animate: true });
        if (markerRef.current) {
          markerRef.current.setLatLng([location.lat, location.lng]);
        }
      }
    } catch (err) {
      console.error('Failed to load Leaflet map instance:', err);
      setMapError(true);
    }
  }, [location.lat, location.lng, victimName]);

  const handleCenterMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 15, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="bg-[#FFFFFF] border border-[#E8DFDA] rounded-2xl overflow-hidden shadow-xs flex flex-col">
      {/* Map Card Header */}
      <div className="px-4 py-3 border-b border-[#E8DFDA] flex flex-wrap items-center justify-between gap-2.5 bg-[#FFFFFF]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#FDECEE] text-[#C84B53] border border-[#F7D0D4]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#1F1A1C] leading-none">
                Live Route & Safe Spots Map
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-[#E8F5E9] border border-[#C8E6C9] text-[#2D6A4F] text-[10px] font-bold uppercase tracking-wider">
                MG Road ➔ Malleswaram
              </span>
            </div>
            <p className="text-[11px] text-[#6E6265] mt-0.5">
              4 Verified Safe Havens en route
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterMap}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-xs font-semibold text-[#1F1A1C] transition-colors cursor-pointer"
            title="Recenter on victim"
          >
            <RotateCcw className="w-3 h-3 text-[#6E6265]" />
            <span>Center Pin</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF6F3] hover:bg-[#F3ECE8] border border-[#E8DFDA] text-xs font-semibold text-[#C84B53] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Open Maps</span>
          </a>
        </div>
      </div>

      {/* Map Viewport — height h-[420px] with zero API key tiles */}
      <div className="relative h-[420px] w-full bg-[#FAF6F3]">
        {mapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-2">
            <Compass className="w-8 h-8 text-[#C84B53]" />
            <h4 className="text-xs font-bold text-[#1F1A1C]">Map Ready</h4>
            <p className="text-xs text-[#6E6265]">
              {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
            </p>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        )}

        {/* Floating Telemetry Badge Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#E8DFDA] rounded-xl px-3 py-1.5 shadow-sm flex items-center gap-2.5 text-xs text-[#1F1A1C]">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C84B53] animate-ping" />
            <span>Live GPS:</span>
          </div>
          <span className="font-mono text-[#6E6265] text-xs tabular-nums">
            {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
          </span>
          <span className="text-[10px] text-[#2D6A4F] bg-[#E8F5E9] px-1.5 py-0.5 rounded font-bold uppercase">
            Within 4.5m
          </span>
        </div>
      </div>
    </div>
  );
};
