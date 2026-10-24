import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Avatar, Button, Card, Chip, DemoTag, Icon, Notice } from "../components/ui";
import { maskPhone, useStore } from "../store";
import { fmtShort } from "../lib/media";
import { getLocationIfGranted } from "../lib/geo";
import { HelplinesModal } from "../components/HelplinesModal";
import { FakeCallModal } from "../components/FakeCallModal";
import { SirenModal } from "../components/SirenModal";
import { OfflineSmsModal } from "../components/OfflineSmsModal";

const HOLD_MS = 2000;

function SosButton() {
  const nav = useNavigate();
  const [p, setP] = useState(0);
  const raf = useRef(0); const start = useRef(0);
  const stop = () => { cancelAnimationFrame(raf.current); start.current = 0; setP(0); };
  const begin = () => {
    start.current = performance.now();
    const tick = (n: number) => {
      const f = Math.min(1, (n - start.current) / HOLD_MS); setP(f);
      if (f >= 1) { start.current = 0; nav("/sos"); return; }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const C = 2 * Math.PI * 92;
  return (
    <div className="sos-wrap">
      <button type="button" className={`sos ${p > 0 ? "holding" : ""}`} aria-label="SOS. Press and hold for 2 seconds to start an emergency alert"
        onPointerDown={begin} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop}
        onKeyDown={(e) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); begin(); } }}
        onKeyUp={(e) => { if (e.key === " " || e.key === "Enter") stop(); }} onContextMenu={(e) => e.preventDefault()}>
        <svg className="sos-ring" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="92" /><circle className="prog" cx="100" cy="100" r="92" strokeDasharray={C} strokeDashoffset={C * (1 - p)} /></svg>
        <Icon name="shield" size={40} /><b>SOS</b>
      </button>
      <p><strong>Press and hold for 2 seconds</strong><span>to start an emergency alert. Releasing early cancels.</span></p>
    </div>
  );
}

export default function Home() {
  const { contacts, incidents, journey, profile, setDecoyActive, toast } = useStore();
  const hr = new Date().getHours();
  const greet = hr < 12 ? "Good morning" : hr < 18 ? "Good afternoon" : "Good evening";
  const activeInc = incidents.find((i) => i.status === "active");
  const recent = [...incidents].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);
  const unread = incidents.some((i) => i.status === "active");

  const [openHelplines, setOpenHelplines] = useState(false);
  const [openFakeCall, setOpenFakeCall] = useState(false);
  const [openSiren, setOpenSiren] = useState(false);
  const [openOfflineSms, setOpenOfflineSms] = useState(false);

  return (
    <div className="page">
      <header className="home-head">
        <Link to="/" className="logo" aria-label="SafeCircle home"><span className="logo-mark"><Icon name="shield" size={20} /></span><span>SafeCircle</span></Link>
        <div className="home-actions">
          <button
            type="button"
            className="icon-btn round"
            aria-label="Discreet Camouflage Mode"
            title="Disguise as Calculator"
            onClick={() => setDecoyActive(true)}
          >
            <Icon name="lock" size={18} />
          </button>
          <Link to="/notifications" className="icon-btn round" aria-label="Notifications">{unread && <i className="dot" />}<Icon name="bell" /></Link>
          <Link to="/profile" className="icon-btn" aria-label="Profile"><Avatar name={profile.name} size={40} /></Link>
        </div>
      </header>

      <section className="greet">
        <h1>{greet}, {profile.name.split(" ")[0]}</h1>
        {activeInc ? <Link to={`/incident/${activeInc.id}`} className="status-pill red"><i />Active incident · tap to view</Link>
          : journey?.active ? <Link to="/journey/active" className="status-pill sage"><i />Safe journey in progress</Link>
          : <span className="status-pill"><i />No active journey or incident</span>}
      </section>

      {/* Quick Safety Tools Strip */}
      <div className="quick-safety-strip" aria-label="Instant safety tools">
        <button
          type="button"
          className="safety-tool-btn"
          onClick={() => setOpenHelplines(true)}
          title="Emergency Helplines: 112, 1091, 181"
        >
          <span className="tool-icon helpline-icon">
            <Icon name="phone" size={18} />
          </span>
          <b>Helplines</b>
          <small>112 · 1091</small>
        </button>

        <button
          type="button"
          className="safety-tool-btn"
          onClick={() => setOpenFakeCall(true)}
          title="Fake Incoming Call Simulator"
        >
          <span className="tool-icon fakecall-icon">
            <Icon name="bell" size={18} />
          </span>
          <b>Fake Call</b>
          <small>Escape</small>
        </button>

        <button
          type="button"
          className="safety-tool-btn"
          onClick={() => setOpenSiren(true)}
          title="Deterrent Siren & Strobe Light"
        >
          <span className="tool-icon siren-icon">
            <Icon name="alert" size={18} />
          </span>
          <b>Siren</b>
          <small>Alarm &amp; strobe</small>
        </button>

        <button
          type="button"
          className="safety-tool-btn"
          onClick={() => setOpenOfflineSms(true)}
          title="Offline Emergency SMS with GPS"
        >
          <span className="tool-icon sms-icon">
            <Icon name="file" size={18} />
          </span>
          <b>Offline SMS</b>
          <small>1-tap GPS</small>
        </button>
      </div>

      <SosButton />
      <p className="center tiny"><DemoTag>Prototype</DemoTag> Alerts are simulated. No messages are sent.</p>

      <div className="action-grid">
        <Card to="/journey" tone="sage" className="action-card"><span className="ico"><Icon name="route" size={26} /></span><b>Start a Safe Journey</b><small>Share route &amp; safe corridors</small></Card>
        <Card to="/report" tone="blush" className="action-card"><span className="ico"><Icon name="flag" size={26} /></span><b>Report an Incident</b><small>Physical or digital harassment</small></Card>
      </div>

      <div className="section-head"><div><h2>Trusted contacts</h2><small>{contacts.length} people in your circle</small></div><Link to="/contacts" className="link">Manage</Link></div>
      <Card className="contact-preview">
        {contacts.length === 0 ? <p className="muted">No contacts yet. <Link to="/contacts" className="link">Add one</Link></p> :
          contacts.slice(0, 3).map((c) => <Link key={c.id} to="/contacts" className="cp"><Avatar name={c.name} size={48} /><b>{c.name.split(" ")[0]}</b><small>{c.relation}</small><small className="mono">{maskPhone(c.phone).slice(-9)}</small></Link>)}
      </Card>

      {/* Safety Modals */}
      <HelplinesModal
        open={openHelplines}
        onClose={() => setOpenHelplines(false)}
      />

      <FakeCallModal
        open={openFakeCall}
        onClose={() => setOpenFakeCall(false)}
        callerName={contacts[0]?.name ? contacts[0].name.split(" ")[0] : "Mom"}
        userName={profile.name.split(" ")[0]}
      />

      <SirenModal
        open={openSiren}
        onClose={() => setOpenSiren(false)}
      />

      <OfflineSmsModal
        open={openOfflineSms}
        onClose={() => setOpenOfflineSms(false)}
        contacts={contacts}
        userName={profile.name}
        toast={toast}
      />

      <div className="section-head"><h2>Recent activity</h2><Link to="/incidents" className="link">View all</Link></div>
      <div className="stack">
        {recent.map((i) => (
          <Card key={i.id} to={`/incident/${i.id}`} className="row-card">
            <span className={`ico-sm ${i.type}`}><Icon name={i.type === "physical" ? "shield" : "flag"} size={20} /></span>
            <div className="grow"><b>{i.title}</b><small>{i.id} · {fmtShort(i.at)}</small></div>
            <Chip tone={i.status === "active" ? "red" : i.status === "open" ? "amber" : "sage"}>{i.status === "active" ? "Active" : i.status === "open" ? "Open" : "Resolved"}</Chip>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Sos() {
  const nav = useNavigate();
  const { triggerSOS, contacts } = useStore();
  const [n, setN] = useState(5);
  const fired = useRef(false);
  const go = async () => {
    if (fired.current) return; fired.current = true;
    const pos = await getLocationIfGranted();
    nav(`/incident/${triggerSOS(pos)}`, { replace: true });
  };
  useEffect(() => {
    if (n <= 0) { void go(); return; }
    const t = setTimeout(() => setN(n - 1), 1000); return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);
  return (
    <div className="page dark-page">
      <div className="dark-top"><button type="button" className="icon-btn light" aria-label="Cancel SOS" onClick={() => nav("/")}><Icon name="back" /></button><span>EMERGENCY · DEMO</span><span className="icon-btn" /></div>
      <h1>Sending SOS in…</h1>
      <div className="count-ring" aria-live="assertive"><span>{Math.max(n, 0)}</span><small>seconds</small></div>
      <p className="light-muted">This prototype creates an incident record and prepares alerts for {contacts.filter((c) => c.sosAlerts).length} contacts. <b>No SMS or call is actually sent.</b></p>
      <ul className="checklist">
        {["Create incident record on this device", "Prepare alert for trusted contacts (simulated)", "Attach location only if you already allowed it"].map((x) => <li key={x}><span><Icon name="check" size={16} /></span>{x}</li>)}
      </ul>
      <div className="bottom-actions"><Button variant="secondary" onClick={() => nav("/")}>Cancel — I'm okay</Button><Button variant="danger" onClick={() => { setN(0); }}>Send now (demo)</Button></div>
    </div>
  );
}

export function Notifications() {
  const { incidents, settings, setSettings, toast } = useStore();
  const items = incidents.flatMap((i) => i.timeline.map((t) => ({ ...t, inc: i }))).sort((a, b) => b.at.localeCompare(a.at)).slice(0, 12);
  const enable = async () => {
    if (!("Notification" in window)) { toast("This browser doesn't support notifications"); return; }
    const r = await Notification.requestPermission();
    setSettings({ notifications: r === "granted" }); toast(r === "granted" ? "Browser notifications allowed" : "Notifications not allowed");
  };
  return (
    <div className="page">
      <Link to="/" className="back-link"><Icon name="back" size={18} />Home</Link>
      <h1 className="page-title">Notifications</h1>
      {!settings.notifications && <Card tone="blush" className="stack-sm"><b>Browser notifications are off</b><p className="muted">Only turned on if you choose. Nothing is delivered in the background by this prototype.</p><Button small icon="bell" onClick={enable}>Allow notifications</Button></Card>}
      <h2 className="mt">Activity from your incidents</h2>
      <div className="stack">{items.map((t) => <Card key={t.id} to={`/incident/${t.inc.id}`} className="row-card"><span className="ico-sm physical"><Icon name="clock" size={18} /></span><div className="grow"><b>{t.text}</b><small>{t.inc.id} · {fmtShort(t.at)}</small></div><Icon name="chev" size={18} /></Card>)}</div>
      <Notice tone="info">This list is built from your local incident timelines. Real push delivery needs a backend.</Notice>
    </div>
  );
}
