import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  MapPin,
  ExternalLink,
  RotateCcw,
  Navigation,
  Sparkles,
  Compass,
  AlertCircle
} from 'lucide-react';
import type { LocationCoordinates } from '../../types';

interface LocationMapProps {
  location: LocationCoordinates;
  victimName: string;
  isSimulated?: boolean;
  lastUpdated: string;
}

export const LocationMap: React.FC<LocationMapProps> = ({
  location,
  victimName,
  isSimulated = true,
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
        // Initialize Leaflet map
        const map = L.map(mapContainerRef.current, {
          center: [location.lat, location.lng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        // Add CartoDB Dark Matter tiles or OSM standard tiles with dark filter
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Add zoom control in top right
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Custom pulsing command-center incident marker
        const customIcon = L.divIcon({
          className: 'custom-radar-marker',
          html: `
            <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(240, 82, 95, 0.35); animation: radar-pulse 2s infinite ease-in-out;"></div>
              <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; background: rgba(240, 82, 95, 0.6);"></div>
              <div style="position: relative; width: 14px; height: 14px; border-radius: 50%; background: #F0525F; border: 2px solid #FFFFFF; box-shadow: 0 0 10px rgba(240,82,95,0.8);"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([location.lat, location.lng], { icon: customIcon }).addTo(map);

        marker.bindPopup(`
          <div style="padding: 4px; font-family: Inter, sans-serif;">
            <div style="color: #F0525F; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 2px;">
              🚨 Simulated Emergency SOS
            </div>
            <div style="color: #F3F6FC; font-weight: 600; font-size: 13px;">
              ${victimName}
            </div>
            <div style="color: #A0AEC4; font-size: 11px; margin-top: 2px;">
              ${location.label}
            </div>
            <div style="color: #71809A; font-size: 10px; margin-top: 4px; font-family: monospace;">
              ${location.lat.toFixed(5)}° N, ${location.lng.toFixed(5)}° E
            </div>
          </div>
        `);

        mapInstanceRef.current = map;
        markerRef.current = marker;
      } else {
        // Update marker position on coordinate drift
        mapInstanceRef.current.panTo([location.lat, location.lng], { animate: true });
        if (markerRef.current) {
          markerRef.current.setLatLng([location.lat, location.lng]);
        }
      }
    } catch (err) {
      console.error('Failed to load Leaflet map instance:', err);
      setMapError(true);
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location.lat, location.lng, victimName, location.label]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([location.lat, location.lng], 16, { animate: true });
      if (markerRef.current) {
        markerRef.current.openPopup();
      }
    }
  };

  return (
    <div className="bg-[#151F35] border border-[#29364F] rounded-2xl overflow-hidden shadow-xl flex flex-col">
      {/* Map Header Bar */}
      <div className="px-5 py-3.5 border-b border-[#29364F] flex flex-wrap items-center justify-between gap-3 bg-[#111A2E]">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#351C2A] text-[#F0525F] border border-[#F0525F]/30">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F3F6FC] leading-none">
                Live Incident Location
              </h3>
              <span className="px-2 py-0.5 rounded bg-[#1B2740] border border-[#29364F] text-[#E8B65C] text-[10px] font-bold tracking-wider uppercase flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {isSimulated ? 'Simulated Location' : 'Live GPS'}
              </span>
            </div>
            <p className="text-[11px] text-[#71809A] mt-0.5">
              Precision estimate: ±{location.accuracyMeters || 4.2}m • Cellular & GPS Triangulation
            </p>
          </div>
        </div>

        {/* Map Control Shortcuts */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRecenter}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs text-[#F3F6FC] transition-colors"
            title="Re-center map on victim coordinates"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#6EA8FE]" />
            <span className="hidden sm:inline">Re-center</span>
          </button>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1B2740] hover:bg-[#253655] border border-[#29364F] text-xs text-[#6EA8FE] transition-colors"
            title="Open in Google Maps (external)"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open in Maps</span>
            <ExternalLink className="w-3 h-3 text-[#71809A]" />
          </a>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="relative h-80 sm:h-96 w-full bg-[#0E1426]">
        {mapError ? (
          /* Graceful Fallback if WebGL/Leaflet fails */
          <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-[#0E1426]">
            <MapPin className="w-12 h-12 text-[#F0525F] mb-3" />
            <h4 className="text-sm font-bold text-[#F3F6FC]">
              Interactive Map Fallback Mode
            </h4>
            <p className="text-xs text-[#A0AEC4] max-w-sm mt-1">
              {location.label} ({location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E)
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 rounded-xl bg-[#6EA8FE] text-[#0B1020] text-xs font-semibold"
            >
              Open Coordinates in Google Maps
            </a>
          </div>
        ) : (
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        )}

        {/* Live Coordinate Pill Overlay */}
        <div className="absolute bottom-3 left-3 z-20 bg-[#151F35]/90 backdrop-blur-md border border-[#29364F] px-3 py-1.5 rounded-xl shadow-lg text-xs font-mono text-[#F3F6FC] flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#F0525F] animate-pulse" />
          <span>
            {location.lat.toFixed(5)}° N, {location.lng.toFixed(5)}° E
          </span>
        </div>
      </div>

      {/* Disclaimer Caption & Freshness Bar */}
      <div className="px-5 py-3 border-t border-[#29364F] bg-[#111A2E] text-xs flex flex-wrap items-center justify-between gap-3 text-[#71809A]">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-[#E8B65C] shrink-0" />
          <span className="text-[#A0AEC4]">
            Illustrative demo coordinate for training and interface review. Not a real victim location.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] tabular-nums">
          <span>Source: <strong className="text-[#F3F6FC]">DEMO GPS</strong></span>
          <span>Last Ping: <strong className="text-[#38C6A3]">{new Date(lastUpdated).toLocaleTimeString()}</strong></span>
        </div>
      </div>
    </div>
  );
};
