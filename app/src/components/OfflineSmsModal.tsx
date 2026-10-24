import { useEffect, useState } from "react";
import { Button, Card, Icon, Sheet } from "./ui";
import { type Contact } from "../store";
import { type LatLng } from "../lib/geo";

interface Props {
  open: boolean;
  onClose: () => void;
  contacts: Contact[];
  pos?: LatLng;
  userName?: string;
  toast: (m: string) => void;
}

export function OfflineSmsModal({ open, onClose, contacts, pos, userName = "Shreya", toast }: Props) {
  const [battery, setBattery] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check battery level if Battery Status API is available
    if ("getBattery" in navigator) {
      (navigator as unknown as { getBattery: () => Promise<{ level: number }> })
        .getBattery()
        .then((b) => setBattery(Math.round(b.level * 100)))
        .catch(() => undefined);
    }
  }, []);

  const coordsText = pos
    ? `https://maps.google.com/?q=${pos[0].toFixed(5)},${pos[1].toFixed(5)} (${pos[0].toFixed(4)}, ${pos[1].toFixed(4)})`
    : "Location not available (GPS offline)";

  const message = `EMERGENCY ALERT from ${userName}: I need immediate help. My location: ${coordsText}.${
    battery !== null ? ` Phone battery: ${battery}%.` : ""
  } Sent via SafeCircle Offline SOS.`;

  const copyText = () => {
    navigator.clipboard?.writeText(message);
    setCopied(true);
    toast("Emergency SMS copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  };

  const recipientPhones = contacts
    .filter((c) => c.sosAlerts)
    .map((c) => c.phone.replace(/\s+/g, ""))
    .join(",");

  const smsToContactsUrl = `sms:${recipientPhones}?body=${encodeURIComponent(message)}`;
  const smsTo112Url = `sms:112?body=${encodeURIComponent(message)}`;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Offline SMS Dispatch"
      footer={
        <Button variant="secondary" full onClick={onClose}>
          Close
        </Button>
      }
    >
      <p className="tiny muted">
        When internet, Wi-Fi or 4G drops, SMS messages still go through standard
        cellular towers. Tapping below opens your messaging app with pre-filled
        GPS coordinates.
      </p>

      <Card className="sms-preview-card">
        <small className="muted">PREPARED SOS MESSAGE</small>
        <p className="mono tiny">{message}</p>
        <button type="button" className="copy-sms-btn" onClick={copyText}>
          <Icon name={copied ? "check" : "file"} size={16} />
          <span>{copied ? "Copied" : "Copy text"}</span>
        </button>
      </Card>

      <div className="stack-sm">
        <a
          href={smsTo112Url}
          className="btn btn-danger btn-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="shield" size={19} />
          Send SMS to Police (112)
        </a>

        <a
          href={smsToContactsUrl}
          className="btn btn-primary btn-full"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Icon name="users" size={19} />
          Send SMS to {contacts.filter((c) => c.sosAlerts).length} Trusted Contacts
        </a>
      </div>
    </Sheet>
  );
}
