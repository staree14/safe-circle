import { useEffect, useRef, useState } from "react";
import { Icon } from "./ui";

interface Props {
  open: boolean;
  onClose: () => void;
  callerName?: string;
  userName?: string;
}

// Tone generator for realistic phone ringtone via Web Audio API
class RingtonePlayer {
  private ctx: AudioContext | null = null;
  private timer: number = 0;

  start() {
    try {
      const AudioCtx = window.AudioContext;
      this.ctx = new AudioCtx();
      this.playPulse();
    } catch {
      // AudioContext unavailable
    }
  }

  private playPulse() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // US / UK style double ring: 440Hz + 480Hz
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.value = 440;
    osc2.frequency.value = 480;

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain.gain.linearRampToValueAtTime(0, now + 0.8);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.0);
    gain.gain.linearRampToValueAtTime(0, now + 1.8);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.85);
    osc2.stop(now + 1.85);

    this.timer = window.setTimeout(() => this.playPulse(), 3500);
  }

  stop() {
    window.clearTimeout(this.timer);
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
  }
}

export function FakeCallModal({ open, onClose, callerName = "Mom", userName = "Shreya" }: Props) {
  const [stage, setStage] = useState<"idle" | "countdown" | "ringing" | "connected">("idle");
  const [countdown, setCountdown] = useState(5);
  const [callSecs, setCallSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const ringRef = useRef<RingtonePlayer | null>(null);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (!open) {
      ringRef.current?.stop();
      window.clearInterval(timerRef.current);
      setStage("idle");
      setCallSecs(0);
    }
  }, [open]);

  const scheduleCall = (delaySecs: number) => {
    setCountdown(delaySecs);
    setStage("countdown");

    const start = Date.now();
    const end = start + delaySecs * 1000;

    const interval = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        startRinging();
      }
    }, 250);
  };

  const startRinging = () => {
    setStage("ringing");
    const r = new RingtonePlayer();
    ringRef.current = r;
    r.start();

    // Trigger phone vibration if supported
    if ("vibrate" in navigator) {
      navigator.vibrate([800, 400, 800, 1600]);
    }
  };

  const answerCall = () => {
    ringRef.current?.stop();
    setStage("connected");
    setCallSecs(0);

    // Call timer
    timerRef.current = window.setInterval(() => {
      setCallSecs((s) => s + 1);
    }, 1000);

    // Play synthesized voice message
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `Hey ${userName}, I'm waiting downstairs near the gate. Are you almost here? Let me know right now, I'm right outside.`
      );
      msg.rate = 1.0;
      msg.pitch = 1.05;
      window.speechSynthesis.speak(msg);
    }
  };

  const hangUp = () => {
    ringRef.current?.stop();
    window.clearInterval(timerRef.current);
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setStage("idle");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fake-call-container">
      {/* 1. Setup screen */}
      {stage === "idle" && (
        <div className="fake-call-setup">
          <div className="setup-head">
            <span className="setup-badge">DE-ESCALATION TOOL</span>
            <h2>Trigger Fake Incoming Call</h2>
            <p className="tiny muted">
              Simulates a realistic phone call to help you safely step away from
              an uncomfortable cab ride, street stranger, or awkward situation.
            </p>
          </div>

          <div className="caller-preview">
            <span className="caller-avatar">{callerName[0]}</span>
            <div>
              <b>{callerName}</b>
              <small>Mobile · +91 98765 43210</small>
            </div>
          </div>

          <div className="setup-actions">
            <button
              type="button"
              className="btn btn-primary btn-full"
              onClick={() => scheduleCall(5)}
            >
              <Icon name="phone" size={19} />
              Call in 5 seconds
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-full"
              onClick={() => scheduleCall(15)}
            >
              <Icon name="clock" size={19} />
              Call in 15 seconds
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* 2. Countdown screen */}
      {stage === "countdown" && (
        <div className="fake-call-countdown">
          <div className="cd-ring">
            <span>{countdown}</span>
            <small>sec</small>
          </div>
          <p>Incoming call starting soon…</p>
          <small className="muted">Put your phone where you can easily reach it</small>
          <button type="button" className="btn btn-ghost" onClick={hangUp}>
            Cancel
          </button>
        </div>
      )}

      {/* 3. Ringing screen (Authentic iOS Call UI) */}
      {stage === "ringing" && (
        <div className="ios-incoming-call">
          <div className="call-top">
            <span className="call-avatar-lg">{callerName[0]}</span>
            <h1>{callerName}</h1>
            <span className="call-type">Mobile</span>
          </div>

          <div className="call-controls-bottom">
            <div className="ring-actions">
              <button
                type="button"
                className="action-circle decline"
                onClick={hangUp}
                aria-label="Decline call"
              >
                <Icon name="phone" size={32} />
              </button>
              <button
                type="button"
                className="action-circle accept"
                onClick={answerCall}
                aria-label="Accept call"
              >
                <Icon name="phone" size={32} />
              </button>
            </div>
            <div className="action-labels">
              <span>Decline</span>
              <span>Accept</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Active connected call screen */}
      {stage === "connected" && (
        <div className="ios-active-call">
          <div className="call-top">
            <h1>{callerName}</h1>
            <span className="call-timer">
              {String(Math.floor(callSecs / 60)).padStart(2, "0")}:
              {String(callSecs % 60).padStart(2, "0")}
            </span>
          </div>

          <div className="active-call-grid">
            <button
              type="button"
              className={`call-grid-btn ${muted ? "active" : ""}`}
              onClick={() => setMuted(!muted)}
            >
              <Icon name="mic" size={26} />
              <span>{muted ? "Muted" : "Mute"}</span>
            </button>
            <button type="button" className="call-grid-btn">
              <Icon name="users" size={26} />
              <span>Keypad</span>
            </button>
            <button type="button" className="call-grid-btn active">
              <Icon name="bell" size={26} />
              <span>Speaker</span>
            </button>
          </div>

          <p className="tiny active-call-note">
            Simulated speech playing. You can talk naturally.
          </p>

          <button
            type="button"
            className="action-circle decline end-call-btn"
            onClick={hangUp}
            aria-label="End call"
          >
            <Icon name="phone" size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
