import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { initials, type Evidence, type TimelineEvent } from "../store";
import { fmtBytes, fmtDuration, fmtShort, useAudioMeta, useVideoDuration } from "../lib/media";

const P: Record<string, ReactNode> = {
  shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8.2 7 10 4.2-1.8 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10M9 20v-6h6v6" /></>,
  route: <><circle cx="6" cy="19" r="2.5" /><circle cx="18" cy="5" r="2.5" /><path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" /></>,
  vault: <><rect x="4" y="10" width="16" height="11" rx="3" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14.5v2.5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.5a6 6 0 0 1 3.5 5.5" /></>,
  bell: <><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" /><path d="M10 20a2 2 0 0 0 4 0" /></>,
  plus: <path d="M12 5v14M5 12h14" />, x: <path d="M6 6l12 12M18 6 6 18" />, check: <path d="m5 12 4 4L19 6" />,
  pin: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  flag: <path d="M5 22V4M5 5c5-3 9 3 14 0v9c-5 3-9-3-14 0" />,
  mic: <><rect x="9" y="2.5" width="6" height="12" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5M8.5 21.5h7" /></>,
  video: <><rect x="3" y="6" width="13" height="12" rx="3" /><path d="m16 10.5 5-3v9l-5-3" /></>,
  image: <><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="m21 16-5-5-9 9" /></>,
  file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h6" /></>,
  back: <path d="m15 18-6-6 6-6" />, chev: <path d="m9 18 6-6-6-6" />, down: <path d="m6 9 6 6 6-6" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z" />,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  edit: <><path d="M4 20h4L19 9l-4-4L4 16v4Z" /><path d="m13.5 6.5 4 4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  share: <><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="18" cy="18" r="2.5" /><path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" /></>,
  download: <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />, upload: <path d="M12 16V4m0 0L8 8m4-4 4 4M5 21h14" />,
  locate: <><circle cx="12" cy="12" r="3.5" /><circle cx="12" cy="12" r="8" /><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3" /></>,
  play: <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />, pause: <path d="M8 5v14M16 5v14" strokeWidth="3" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="3" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  eyeoff: <><path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c5.5 0 9 6 9 6a15 15 0 0 1-3 3.6M6.5 7.5C4 9.3 3 12 3 12s3.5 6 9 6c1.4 0 2.7-.4 3.8-.9" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  alert: <><path d="M12 9v4M12 17h.01" /><path d="M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z" /></>,
  wifioff: <><path d="M3 3l18 18M5 12.5a10 10 0 0 1 4-2.2M12 17.5h.01M8.5 15a5 5 0 0 1 3-1.4M2 8.8a15 15 0 0 1 4-2.6M16 11a10 10 0 0 1 3 1.5M16.2 8.1A15 15 0 0 1 22 8.8" /></>,
  map: <><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14M15 6v14" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="15.5" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  link: <><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></>,
  heart: <path d="M12 20s-7.5-4.6-9-9.5A5 5 0 0 1 12 7a5 5 0 0 1 9 3.5C19.500 15.400 12 20 12 20Z" />,
  refresh: <><path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.5l2-2.500M20 20v-5h-5" /></>,
};
export function Icon({ name, size = 22, className = "" }: { name: string; size?: number; className?: string }) {
  return <svg className={`icon ${className}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{P[name]}</svg>;
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" | "sage"; icon?: string; full?: boolean; to?: string; small?: boolean };
export function Button({ variant = "primary", icon, full, to, small, children, className = "", ...rest }: BtnProps) {
  const cls = `btn btn-${variant} ${full ? "btn-full" : ""} ${small ? "btn-sm" : ""} ${className}`;
  const inner = <>{icon && <Icon name={icon} size={small ? 17 : 20} />}<span>{children}</span></>;
  if (to) return <Link to={to} className={cls}>{inner}</Link>;
  return <button type="button" className={cls} {...rest}>{inner}</button>;
}

export function Card({ children, className = "", tone, onClick, to }: { children: ReactNode; className?: string; tone?: "blush" | "sage" | "berry" | "plain"; onClick?: () => void; to?: string }) {
  const cls = `card ${tone ? `card-${tone}` : ""} ${onClick || to ? "card-tap" : ""} ${className}`;
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (onClick) return <button type="button" className={cls} onClick={onClick}>{children}</button>;
  return <div className={cls}>{children}</div>;
}

const AV = ["#F1DFE1", "#DDE7DF", "#EFE3DA", "#E6DCEA", "#F4E8E8"];
export function Avatar({ name, size = 44, ring }: { name: string; size?: number; ring?: string }) {
  const i = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AV.length;
  return <span className="avatar" style={{ width: size, height: size, background: AV[i], fontSize: size * 0.34, boxShadow: ring ? `0 0 0 2px #fff, 0 0 0 4px ${ring}` : undefined }} aria-hidden="true">{initials(name)}</span>;
}

export function Chip({ children, tone = "berry", icon }: { children: ReactNode; tone?: "berry" | "sage" | "red" | "amber" | "grey"; icon?: string }) {
  return <span className={`chip chip-${tone}`}>{icon && <Icon name={icon} size={13} />}{children}</span>;
}
export const DemoTag = ({ children = "Demo data" }: { children?: ReactNode }) => <span className="demo-tag">{children}</span>;

export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { id: T; label: string }[]; label: string }) {
  return <div className="segmented" role="tablist" aria-label={label}>{options.map((o) => <button key={o.id} role="tab" aria-selected={value === o.id} className={value === o.id ? "on" : ""} onClick={() => onChange(o.id)} type="button">{o.label}</button>)}</div>;
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`toggle ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}><i /></button>;
}

export function TopBar({ title, back, right, sub }: { title: string; back?: string | boolean; right?: ReactNode; sub?: string }) {
  const nav = useNavigate();
  return (
    <header className="topbar">
      {back ? <button type="button" className="icon-btn" aria-label="Back" onClick={() => (typeof back === "string" ? nav(back) : nav(-1))}><Icon name="back" /></button> : <span className="icon-btn ghost" />}
      <div className="topbar-title"><h1>{title}</h1>{sub && <span>{sub}</span>}</div>
      <div className="topbar-right">{right ?? <span className="icon-btn ghost" />}</div>
    </header>
  );
}

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return <div className="field"><label htmlFor={htmlFor}>{label}{hint && <small> {hint}</small>}</label>{children}</div>;
}

export function Sheet({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h); ref.current?.focus();
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-wrap" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} ref={ref}>
        <div className="sheet-grab" />
        <div className="sheet-head"><h2>{title}</h2><button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="x" /></button></div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Confirm({ open, onClose, title, text, confirmLabel, danger, onConfirm }: { open: boolean; onClose: () => void; title: string; text: string; confirmLabel: string; danger?: boolean; onConfirm: () => void }) {
  return <Sheet open={open} onClose={onClose} title={title} footer={<><Button variant="secondary" onClick={onClose}>Cancel</Button><Button variant={danger ? "danger" : "primary"} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button></>}><p className="muted">{text}</p></Sheet>;
}

export function EmptyState({ icon, title, text, action }: { icon: string; title: string; text: string; action?: ReactNode }) {
  return <div className="empty"><span className="empty-icon"><Icon name={icon} size={28} /></span><h3>{title}</h3><p>{text}</p>{action}</div>;
}

export function Notice({ tone = "info", icon, children }: { tone?: "info" | "warn" | "error" | "ok"; icon?: string; children: ReactNode }) {
  return <div className={`notice notice-${tone}`} role={tone === "error" ? "alert" : "note"}><Icon name={icon ?? (tone === "error" ? "alert" : "info")} size={19} /><div>{children}</div></div>;
}

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  return (
    <ol className="timeline">
      {sorted.map((e, i) => (
        <li key={e.id} className={`tl-${e.kind} ${i === sorted.length - 1 ? "last" : ""}`}>
          <i><Icon name={e.kind === "ack" ? "check" : e.kind === "evidence" ? "file" : e.kind === "sos" ? "alert" : e.kind === "resolved" ? "shield" : e.kind === "alert" ? "bell" : "clock"} size={13} /></i>
          <div><p>{e.text}{e.demo && <DemoTag>demo</DemoTag>}</p><small>{fmtShort(e.at)}</small></div>
        </li>
      ))}
    </ol>
  );
}

export function BottomNav() {
  const tabs = [["/", "Home", "home"], ["/journey", "Journey", "route"], ["/vault", "Vault", "vault"], ["/profile", "Profile", "user"]] as const;
  return (
    <nav className="bottom-nav" aria-label="Primary">
      {tabs.map(([to, label, icon]) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => (isActive ? "active" : "")}><Icon name={icon} size={23} /><span>{label}</span></NavLink>
      ))}
    </nav>
  );
}

/* ---------- Evidence ---------- */
export function Waveform({ peaks, progress = 0, onSeek, height = 52 }: { peaks: number[]; progress?: number; onSeek?: (f: number) => void; height?: number }) {
  return (
    <div className="wave" style={{ height }} onClick={(e) => { if (!onSeek) return; const r = e.currentTarget.getBoundingClientRect(); onSeek((e.clientX - r.left) / r.width); }} role={onSeek ? "slider" : undefined} aria-label={onSeek ? "Seek" : undefined} aria-valuenow={onSeek ? Math.round(progress * 100) : undefined}>
      {peaks.map((p, i) => <i key={i} className={i / peaks.length < progress ? "done" : ""} style={{ height: `${Math.max(8, p * 100)}%` }} />)}
    </div>
  );
}

export function EvidenceThumb({ e, size = 64 }: { e: Evidence; size?: number }) {
  const dur = useVideoDuration(e.kind === "video" ? e.url : "", e.duration);
  const audio = useAudioMeta(e.kind === "audio" ? e.url : "", 18);
  const dim = { width: size, height: size };
  if (e.kind === "image") return <span className="thumb" style={dim}><img src={e.url} alt="" loading="lazy" /></span>;
  if (e.kind === "video") return <span className="thumb" style={dim}><video src={`${e.url}#t=0.6`} preload="metadata" muted playsInline /><span className="thumb-play"><Icon name="play" size={16} /></span><span className="thumb-dur">{fmtDuration(dur)}</span></span>;
  return <span className="thumb thumb-audio" style={dim}>{audio.meta ? <Waveform peaks={audio.meta.peaks} height={size * 0.5} /> : <Icon name="mic" />}<span className="thumb-dur">{fmtDuration(audio.meta?.duration ?? e.duration)}</span></span>;
}

export const syncChip = (e: Evidence) =>
  e.sync === "demo" ? <Chip tone="grey" icon="info">Demo sample</Chip>
  : e.sync === "local" ? <Chip tone="sage" icon="lock">Saved on this device</Chip>
  : e.sync === "pending" ? <Chip tone="amber" icon="clock">Sync pending</Chip>
  : <Chip tone="sage" icon="check">Synced</Chip>;

export function EvidenceItem({ e }: { e: Evidence }) {
  const kindLabel = e.kind === "image" ? "Screenshot" : e.kind === "video" ? "Video" : "Audio";
  return (
    <Link to={`/vault/${e.id}`} className="ev-item card-tap">
      <EvidenceThumb e={e} />
      <div className="ev-body">
        <b>{e.name}</b>
        <small>{kindLabel} · {e.format} · {fmtBytes(e.size)}</small>
        <small>{fmtShort(e.at)}{e.incidentId && <> · <span className="mono">{e.incidentId}</span></>}</small>
        <div className="ev-chips">{syncChip(e)}<Chip tone={e.access.length ? "amber" : "grey"} icon={e.access.length ? "share" : "lock"}>{e.access.length ? `Shared with ${e.access.length}` : "Private"}</Chip></div>
      </div>
      <Icon name="chev" size={18} className="chev" />
    </Link>
  );
}

export function AudioPlayer({ url, fallbackDuration }: { url: string; fallbackDuration?: number }) {
  const ref = useRef<HTMLAudioElement>(null);
  const { meta, error } = useAudioMeta(url, 64);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [rate, setRate] = useState(1);
  const dur = meta?.duration ?? fallbackDuration ?? 0;
  const toggle = () => { const a = ref.current; if (!a) return; if (a.paused) void a.play(); else a.pause(); };
  return (
    <div className="audio-player">
      <audio ref={ref} src={url} preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)} />
      {error ? <Notice tone="warn">Waveform unavailable for this file, but playback still works.</Notice> : <Waveform peaks={meta?.peaks ?? Array(64).fill(0.15)} progress={dur ? time / dur : 0} height={96} onSeek={(f) => { if (ref.current && dur) ref.current.currentTime = f * dur; }} />}
      <div className="ap-controls">
        <span className="mono">{fmtDuration(time)} / {fmtDuration(dur)}</span>
        <button type="button" className="play-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}><Icon name={playing ? "pause" : "play"} size={26} /></button>
        <button type="button" className="rate-btn" onClick={() => { const n = rate === 1 ? 1.5 : rate === 1.5 ? 2 : 1; setRate(n); if (ref.current) ref.current.playbackRate = n; }} aria-label={`Playback speed ${rate}x`}>{rate}×</button>
      </div>
    </div>
  );
}
