import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Card, Chip, Confirm, Field, Icon, Notice, Sheet, Toggle, TopBar } from "../components/ui";
import { fmtShort } from "../lib/media";
import { useStore } from "../store";

type Perm = "granted" | "denied" | "prompt" | "unknown";
function usePerm(name: string): Perm {
  const [s, set] = useState<Perm>("unknown");
  useEffect(() => {
    let p: PermissionStatus | undefined;
    navigator.permissions?.query({ name: name as PermissionName }).then((r) => { p = r; set(r.state as Perm); r.onchange = () => set(r.state as Perm); }).catch(() => set("unknown"));
    return () => { if (p) p.onchange = null; };
  }, [name]);
  return s;
}
const permChip = (p: Perm) => p === "granted" ? <Chip tone="sage" icon="check">Allowed</Chip> : p === "denied" ? <Chip tone="red" icon="x">Blocked</Chip> : p === "prompt" ? <Chip tone="amber">Ask each time</Chip> : <Chip tone="grey">Unknown</Chip>;

export default function Profile() {
  const { profile, setProfile, settings, setSettings, contacts, places, incidents, evidence, resetAll, toast, updateEvidence, setDecoyActive } = useStore();
  const [edit, setEdit] = useState(false); const [draft, setDraft] = useState(profile);
  const [wipe, setWipe] = useState(false); const [access, setAccess] = useState(false);
  const geo = usePerm("geolocation"), cam = usePerm("camera"), mic = usePerm("microphone"), notif = usePerm("notifications");
  const shared = evidence.filter((e) => e.access.length);

  const exportData = () => {
    const data = { exportedAt: new Date().toISOString(), profile, contacts, places, incidents, evidence: evidence.map(({ url: _u, ...e }) => e) };
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })); a.download = "safecircle-export.json"; a.click(); toast("Exported your data as JSON");
  };

  return (
    <div className="page">
      <TopBar title="Profile & privacy" />
      <Card className="profile-card"><Avatar name={profile.name} size={64} /><div className="grow"><h2>{profile.name}</h2><small>{profile.email}</small></div><Button small variant="secondary" icon="edit" onClick={() => { setDraft(profile); setEdit(true); }}>Edit</Button></Card>

      <h2 className="mt">Security &amp; Privacy</h2>
      <Card className="decoy-highlight-card">
        <div className="decoy-highlight-inner">
          <div className="flex-between">
            <span className="decoy-badge-pill"><Icon name="lock" size={13} /> Discreet Camouflage</span>
            <Chip tone="sage">Active</Chip>
          </div>
          <b>Calculator Disguise Mode</b>
          <p className="tiny muted">
            Hides SafeCircle completely behind a fully functional calculator. Unlock anytime by entering <strong>112=</strong> or <strong>1234=</strong>.
          </p>
          <Button
            variant="primary"
            icon="lock"
            onClick={() => setDecoyActive(true)}
          >
            Lock into Calculator Decoy
          </Button>
        </div>
      </Card>

      <h2 className="mt">Your circle</h2>
      <div className="stack-sm">
        <Card to="/contacts" className="row-card"><span className="ico-sm physical"><Icon name="users" size={20} /></span><div className="grow"><b>Trusted contacts</b><small>{contacts.length} contacts</small></div><Icon name="chev" size={18} /></Card>
        <Card to="/places" className="row-card"><span className="ico-sm physical"><Icon name="pin" size={20} /></span><div className="grow"><b>Saved places</b><small>{places.length} places</small></div><Icon name="chev" size={18} /></Card>
        <Card to="/incidents" className="row-card"><span className="ico-sm physical"><Icon name="file" size={20} /></span><div className="grow"><b>My incidents</b><small>{incidents.length} records</small></div><Icon name="chev" size={18} /></Card>
      </div>

      <h2 className="mt">Permissions</h2>
      <Card className="perm-list">
        {([["Location", "pin", geo], ["Camera", "video", cam], ["Microphone", "mic", mic], ["Notifications", "bell", notif]] as const).map(([l, ic, p]) => <div key={l}><Icon name={ic} size={20} /><span>{l}</span>{permChip(p)}</div>)}
        <small className="muted">Managed by your browser. Each is requested only when you use a related feature.</small>
      </Card>

      <h2 className="mt">Privacy controls</h2>
      <Card className="settings">
        <label><span>Location sharing<small>{settings.locationSharing === "journeys" ? "Only during journeys you start" : "Off. Journeys won't share location"}</small></span><Toggle label="Share location during journeys" checked={settings.locationSharing === "journeys"} onChange={(v) => setSettings({ locationSharing: v ? "journeys" : "off" })} /></label>
        <label><span>Confirm before sharing evidence<small>Always ask first</small></span><Toggle label="Confirm before sharing" checked={settings.requireConfirmShare} onChange={(v) => setSettings({ requireConfirmShare: v })} /></label>
        <Field label="Evidence retention" htmlFor="ret"><select id="ret" className="input" value={settings.retentionDays} onChange={(e) => setSettings({ retentionDays: +e.target.value })}>{[[30, "30 days"], [90, "90 days"], [180, "6 months"], [365, "1 year"], [0, "Keep until I delete"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
        <button type="button" className="row-btn" onClick={() => setDecoyActive(true)}><Icon name="lock" size={20} /><span>Discreet Calculator Camouflage<small>Disguise SafeCircle as a working Calculator. Unlock with 112=</small></span><Icon name="chev" size={18} /></button>
        <button type="button" className="row-btn" onClick={() => setAccess(true)}><Icon name="share" size={20} /><span>Access control<small>{shared.length ? `${shared.length} file(s) shared` : "Nothing shared"}</small></span><Icon name="chev" size={18} /></button>
      </Card>

      <h2 className="mt">Your data</h2>
      <div className="stack-sm"><Button full variant="secondary" icon="download" onClick={exportData}>Export my data (JSON)</Button><Button full variant="ghost" icon="trash" onClick={() => setWipe(true)}>Delete data &amp; reset demo</Button></div>
      <Notice tone="info" icon="lock">SafeCircle stores data in this browser only. There is no account server or sync in this prototype.</Notice>
      <p className="tiny center muted">SafeCircle prototype · <Link to="/notifications" className="link">Notifications</Link></p>

      <Sheet open={edit} onClose={() => setEdit(false)} title="Edit account" footer={<><Button variant="secondary" onClick={() => setEdit(false)}>Cancel</Button><Button onClick={() => { if (draft.name.trim()) { setProfile(draft); setEdit(false); toast("Profile updated"); } }}>Save</Button></>}>
        <Field label="Name" htmlFor="pn"><input id="pn" className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
        <Field label="Email" htmlFor="pe"><input id="pe" type="email" className="input" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
      </Sheet>
      <Sheet open={access} onClose={() => setAccess(false)} title="Access control">
        {shared.length === 0 ? <p className="muted">No evidence is currently shared with anyone.</p> : <div className="stack-sm">{shared.map((e) => <Card key={e.id} className="row-card"><div className="grow"><b>{e.name}</b><small>{e.access.map((id) => contacts.find((c) => c.id === id)?.name.split(" ")[0] ?? "Removed contact").join(", ")} · {fmtShort(e.at)}</small></div><Button small variant="secondary" onClick={() => { updateEvidence(e.id, { access: [] }); toast("Access revoked"); }}>Revoke</Button></Card>)}</div>}
      </Sheet>
      <Confirm open={wipe} onClose={() => setWipe(false)} title="Delete all data?" text="Clears contacts, places, incidents and settings from this browser and restores the fictional demo data." confirmLabel="Delete & reset" danger onConfirm={() => { resetAll(); toast("Data cleared. Demo data restored"); }} />
    </div>
  );
}
