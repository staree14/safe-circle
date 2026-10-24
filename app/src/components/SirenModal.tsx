import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SirenModal({ open, onClose }: Props) {
  const [active, setActive] = useState(false);
  const [strobeColor, setStrobeColor] = useState<"red" | "white" | "amber">("red");
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timerRef = useRef<number>(0);
  const strobeRef = useRef<number>(0);

  useEffect(() => {
    if (open) {
      startSiren();
    } else {
      stopSiren();
    }
    return () => stopSiren();
  }, [open]);

  const startSiren = () => {
    try {
      const AudioCtx = window.AudioContext;
      const ctx = new AudioCtx();
      ctxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);

      // Oscillate frequency between 650Hz and 1300Hz (wailing siren)
      let up = true;
      let freq = 650;
      timerRef.current = window.setInterval(() => {
        if (!ctxRef.current || !oscRef.current) return;
        if (up) {
          freq += 60;
          if (freq >= 1350) up = false;
        } else {
          freq -= 60;
          if (freq <= 650) up = true;
        }
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
      }, 50);

      osc.start();
      oscRef.current = osc;
      gainRef.current = gain;
      setActive(true);

      // Strobe flashing interval
      const colors: ("red" | "white" | "amber")[] = ["red", "white", "amber", "white"];
      let idx = 0;
      strobeRef.current = window.setInterval(() => {
        idx = (idx + 1) % colors.length;
        setStrobeColor(colors[idx]);
      }, 120);
    } catch {
      setActive(true);
    }
  };

  const stopSiren = () => {
    window.clearInterval(timerRef.current);
    window.clearInterval(strobeRef.current);
    try {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    } catch {
      // ignore
    }
    oscRef.current = null;
    ctxRef.current = null;
    setActive(false);
  };

  const handleClose = () => {
    stopSiren();
    onClose();
  };

  if (!open) return null;

  return (
    <div className={`siren-fullscreen strobe-${strobeColor}`}>
      <div className="siren-content">
        <div className="siren-badge">
          <Icon name="alert" size={24} />
          <span>EMERGENCY DETERRENT SIREN</span>
        </div>

        <div className="siren-icon-pulse">
          <Icon name="bell" size={68} />
        </div>

        <h1>PULSING SIREN &amp; STROBE ACTIVE</h1>
        <p>Drawing public attention to your location.</p>

        <button
          type="button"
          className="siren-stop-btn"
          onClick={handleClose}
          aria-label="Stop siren and strobe"
        >
          <span />
          STOP SIREN
        </button>
      </div>
    </div>
  );
}
