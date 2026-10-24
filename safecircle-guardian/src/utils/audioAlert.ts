/**
 * SafeCircle Guardian Emergency Alert System
 * - Synthesizes an attention-grabbing emergency two-tone warning chime using Web Audio API
 *   (Zero external audio files required, works 100% reliably in any modern browser).
 * - Triggers System Browser Push Notifications so guardians are alerted even if the tab is in the background.
 */

class EmergencyAlertService {
  private audioCtx: AudioContext | null = null;
  private isAlarmPlaying: boolean = false;
  private timer: number = 0;
  private soundEnabled: boolean = true;

  constructor() {
    // Check localStorage for user preference
    const saved = localStorage.getItem('safecircle_alarm_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    localStorage.setItem('safecircle_alarm_enabled', String(enabled));
    if (!enabled) {
      this.stopAlarm();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  /**
   * Request browser push notification permission
   */
  public async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      return false;
    }
    if (Notification.permission === 'granted') {
      return true;
    }
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Fire system browser notification
   */
  public fireNotification(title: string, body: string, iconUrl?: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notif = new Notification(title, {
        body,
        icon: iconUrl || '/vite.svg',
        tag: 'safecircle-emergency-alert',
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch {
      // Fallback if blocked
    }
  }

  /**
   * Start alternating emergency two-tone siren (880Hz & 660Hz)
   */
  public startEmergencySiren() {
    if (!this.soundEnabled || this.isAlarmPlaying) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      this.isAlarmPlaying = true;
      this.playToneCycle(0);
    } catch {
      // AudioContext unavailable
    }
  }

  private playToneCycle(step: number) {
    if (!this.isAlarmPlaying || !this.audioCtx) return;

    if (this.audioCtx.state === 'suspended') {
      void this.audioCtx.resume();
    }

    const now = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // High-low emergency tone: 920Hz (High) and 700Hz (Low)
    const freq = step % 2 === 0 ? 920 : 700;
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    // Smooth envelope to prevent audio clicking
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.48);

    // Loop every 500ms (repeat 6 times max or until silenced)
    if (step < 12) {
      this.timer = window.setTimeout(() => {
        this.playToneCycle(step + 1);
      }, 500);
    } else {
      this.stopAlarm();
    }
  }

  /**
   * Single pleasant radar ping chime (used for telemetry updates or new chunk received)
   */
  public playPingSound() {
    if (!this.soundEnabled) return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now); // C6 tone
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15); // E6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.15, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // AudioContext unavailable
    }
  }

  /**
   * Stop any active alarm
   */
  public stopAlarm() {
    this.isAlarmPlaying = false;
    window.clearTimeout(this.timer);
    if (this.audioCtx) {
      void this.audioCtx.close();
      this.audioCtx = null;
    }
  }

  public isPlaying(): boolean {
    return this.isAlarmPlaying;
  }
}

export const alertService = new EmergencyAlertService();
