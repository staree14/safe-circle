import { Icon } from "./ui";
import type { LatLng } from "../lib/geo";

export interface SafeSpotItem {
  id: string;
  name: string;
  category: "mall" | "police" | "bus" | "metro" | "pharmacy" | "hospital";
  categoryLabel: string;
  icon: string;
  kind: "safe_mall" | "safe_police" | "safe_bus" | "safe_metro" | "safe_pharmacy" | "safe_hospital";
  pos: LatLng;
  distance: string;
  walkMin: number;
  address: string;
  crowdLevel: string;
  safetyHighlights: string[];
  phone: string;
  desc: string;
}

interface Props {
  spot: SafeSpotItem | null;
  onClose: () => void;
  onNavigate: (spot: SafeSpotItem) => void;
}

export function SafeSpotModal({ spot, onClose, onNavigate }: Props) {
  if (!spot) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-sheet safe-spot-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-pill-bar" />

        <div className="safe-spot-header">
          <div className={`spot-badge-avatar spot-cat-${spot.category}`}>
            <span>{spot.icon}</span>
          </div>
          <div className="grow">
            <div className="spot-meta-row">
              <span className={`spot-cat-pill cat-${spot.category}`}>
                {spot.categoryLabel}
              </span>
              <span className="spot-crowd-pill">
                👥 {spot.crowdLevel}
              </span>
            </div>
            <h2 className="spot-title">{spot.name}</h2>
            <p className="spot-address">
              <Icon name="pin" size={14} />
              <span>{spot.address}</span>
            </p>
          </div>
          <button
            type="button"
            className="icon-btn round"
            onClick={onClose}
            aria-label="Close"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Distance & Time Highlight Banner */}
        <div className="spot-eta-banner">
          <div className="eta-block">
            <small>WALKING DISTANCE</small>
            <b>{spot.distance}</b>
          </div>
          <div className="eta-divider" />
          <div className="eta-block">
            <small>ESTIMATED WALK</small>
            <b>~{spot.walkMin} min</b>
          </div>
          <div className="eta-divider" />
          <div className="eta-block">
            <small>STATUS</small>
            <b className="status-open">● Open 24/7</b>
          </div>
        </div>

        <p className="spot-desc">{spot.desc}</p>

        {/* Safety Highlights */}
        <div className="spot-safety-features">
          <h3>Verified Safety Features</h3>
          <ul className="features-grid">
            {spot.safetyHighlights.map((feat, i) => (
              <li key={i}>
                <span className="feature-check">✓</span>
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="spot-action-footer">
          <button
            type="button"
            className="btn btn-primary spot-nav-btn"
            onClick={() => onNavigate(spot)}
          >
            <Icon name="route" size={19} />
            <span>Walk to Safe Spot (Route on Map)</span>
          </button>
          
          <div className="spot-secondary-actions">
            {spot.phone && (
              <a
                href={`tel:${spot.phone}`}
                className="btn btn-secondary spot-sec-btn"
                title={`Call ${spot.name}`}
              >
                <Icon name="phone" size={16} />
                <span>Call {spot.phone}</span>
              </a>
            )}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${spot.pos[0]},${spot.pos[1]}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost spot-sec-btn"
            >
              <Icon name="map" size={16} />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
