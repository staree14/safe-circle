import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import { Avatar, Button, Card, Chip, Confirm, DemoTag, EmptyState, EvidenceItem, Field, Icon, Notice, Segmented, Sheet, Timeline, Toggle, TopBar } from "../components/ui";
import { DEMO_CENTER, geocode, type LatLng } from "../lib/geo";
import { fmtDateTime, fmtShort } from "../lib/media";
import { maskPhone, useStore, type Contact, type Place } from "../store";

const RELATIONS = ["Mother", "Father", "Sister", "Brother", "Friend", "Partner", "Colleague", "Other"];

export function Contacts() {
  const { contacts, incidents, addContact, updateContact, removeContact, toast } = useStore();
  const active = incidents.find((i) => i.status === "active");
  const [edit, setEdit] = useState<Partial<Contact> | null>(null);
  const [del, setDel] = useState<Contact | null>(null);
  const [err, setErr] = useState("");
  const open = (c?: Contact) => { setErr(""); setEdit(c ? { ...c } : { name: "", relation: "Friend", phone: "+91 ", journeyAlerts: true, sosAlerts: true, missedCheckIn: true }); };
  const save = () => {
    if (!edit?.name?.trim()) return setErr("Please enter a name.");
    if ((edit.phone ?? "").replace(/\D/g, "").length < 8) return setErr("Enter a valid phone number.");
    if (edit.id) updateContact(edit.id, edit); else addContact(edit as Omit<Contact, "id">);
    toast(edit.id ? "Contact updated" : "Contact added"); setEdit(null);
  };
  return (
    <div className="page">
      <TopBar title="Trusted contacts" back="/profile" right={<button type="button" className="icon-btn round" aria-label="Add contact" onClick={() => open()}><Icon name="plus" /></button>} />
      <p className="lead">The people who'd be alerted during journeys and emergencies. <DemoTag>Fictional sample contacts. Edit freely.</DemoTag></p>
      {active && <Notice tone="warn" icon="bell">Active incident <Link className="link" to={`/incident/${active.id}`}>{active.id}</Link>. Acknowledgements below are simulated.</Notice>}
      <div className="stack">
        {contacts.map((c) => (
          <Card key={c.id} className="contact-card">
            <div className="cc-top"><Avatar name={c.name} size={52} /><div className="grow"><b>{c.name}</b><small>{c.relation}</small><small className="mono">{maskPhone(c.phone)}</small></div>
              {active?.acks[c.id] && <Chip tone={active.acks[c.id] === "acknowledged" ? "sage" : "amber"} icon={active.acks[c.id] === "acknowledged" ? "check" : "clock"}>{active.acks[c.id] === "acknowledged" ? "Acknowledged" : "Pending"}</Chip>}</div>
            <div className="cc-toggles">
              <label><span>Journey alerts</span><Toggle label={`Journey alerts for ${c.name}`} checked={c.journeyAlerts} onChange={(v) => updateContact(c.id, { journeyAlerts: v })} /></label>
              <label><span>SOS alerts</span><Toggle label={`SOS alerts for ${c.name}`} checked={c.sosAlerts} onChange={(v) => updateContact(c.id, { sosAlerts: v })} /></label>
              <label><span>Missed check-ins</span><Toggle label={`Missed check-in alerts for ${c.name}`} checked={c.missedCheckIn} onChange={(v) => updateContact(c.id, { missedCheckIn: v })} /></label>
            </div>
            <div className="two"><Button small variant="secondary" icon="edit" onClick={() => open(c)}>Edit</Button><Button small variant="ghost" icon="trash" onClick={() => setDel(c)}>Remove</Button></div>
          </Card>
        ))}
        {contacts.length === 0 && <EmptyState icon="users" title="No trusted contacts" text="Add at least one person who can be alerted in an emergency." action={<Button icon="plus" onClick={() => open()}>Add contact</Button>} />}
      </div>
      <Button full variant="secondary" icon="plus" onClick={() => open()}>Add contact</Button>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit contact" : "Add contact"} footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save</Button></>}>
        <Field label="Name" htmlFor="cn"><input id="cn" className="input" value={edit?.name ?? ""} onChange={(e) => setEdit({ ...edit, name: e.target.value })} autoComplete="off" /></Field>
        <Field label="Relationship" htmlFor="cr"><select id="cr" className="input" value={edit?.relation} onChange={(e) => setEdit({ ...edit, relation: e.target.value })}>{RELATIONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
        <Field label="Phone number" hint="(shown masked)" htmlFor="cp"><input id="cp" className="input" inputMode="tel" value={edit?.phone ?? ""} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></Field>
        {err && <Notice tone="error">{err}</Notice>}
      </Sheet>
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Remove ${del?.name}?`} text="They'll no longer be offered for journeys or alerts." confirmLabel="Remove" danger onConfirm={() => { if (del) removeContact(del.id); toast("Contact removed"); }} />
    </div>
  );
}

export function Places() {
  const { places, addPlace, updatePlace, removePlace, toast } = useStore();
  const [edit, setEdit] = useState<Partial<Place> | null>(null);
  const [del, setDel] = useState<Place | null>(null);
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const open = (p?: Place) => { setErr(""); setEdit(p ? { ...p } : { label: "", address: "", hideAddress: true }); };
  const find = async () => {
    if (!edit?.address?.trim()) return; setBusy(true); setErr("");
    try { const r = await geocode(edit.address.trim()); if (r[0]) setEdit({ ...edit, pos: r[0].pos }); else setErr("No match found. Try a fuller address or drop a pin on the map."); }
    catch { setErr("Address search unavailable. Drop a pin on the map instead."); }
    setBusy(false);
  };
  const save = () => {
    if (!edit?.label?.trim()) return setErr("Give this place a name, e.g. Home or Gym.");
    if (edit.id) updatePlace(edit.id, edit); else addPlace(edit as Omit<Place, "id">);
    toast("Place saved"); setEdit(null);
  };
  return (
    <div className="page">
      <TopBar title="Saved places" back="/profile" right={<button type="button" className="icon-btn round" aria-label="Add place" onClick={() => open()}><Icon name="plus" /></button>} />
      <p className="lead">Quick destinations for safe journeys. Addresses are never guessed. You enter them yourself. <DemoTag>Sample places. Edit freely.</DemoTag></p>
      <div className="stack">
        {places.map((p) => (
          <Card key={p.id} className="row-card">
            <span className="ico-sm physical"><Icon name={p.label.toLowerCase() === "home" ? "home" : "pin"} size={20} /></span>
            <div className="grow"><b>{p.label}</b><small>{p.hideAddress ? "Address hidden in previews" : p.address || "No address entered"}</small>{!p.pos && <small className="warn-text">No map pin yet</small>}</div>
            <button type="button" className="icon-btn" aria-label={`Edit ${p.label}`} onClick={() => open(p)}><Icon name="edit" size={19} /></button>
            <button type="button" className="icon-btn" aria-label={`Delete ${p.label}`} onClick={() => setDel(p)}><Icon name="trash" size={19} /></button>
          </Card>
        ))}
        {places.length === 0 && <EmptyState icon="pin" title="No saved places" text="Add Home, work or college to start journeys faster." action={<Button icon="plus" onClick={() => open()}>Add place</Button>} />}
      </div>
      <Button full variant="secondary" icon="plus" onClick={() => open()}>Add place</Button>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? "Edit place" : "Add place"} footer={<><Button variant="secondary" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={save}>Save place</Button></>}>
        <div className="chip-scroll">{["Home", "Work / College", "Gym", "Other"].map((l) => <button type="button" className="place-chip" key={l} onClick={() => setEdit({ ...edit, label: l === "Other" ? "" : l })}>{l}</button>)}</div>
        <Field label="Name" htmlFor="pl"><input id="pl" className="input" value={edit?.label ?? ""} onChange={(e) => setEdit({ ...edit, label: e.target.value })} /></Field>
        <Field label="Address" hint="(type it yourself)" htmlFor="pa"><div className="inline"><input id="pa" className="input" value={edit?.address ?? ""} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /><Button small variant="secondary" disabled={busy} onClick={find}>{busy ? "…" : "Find"}</Button></div></Field>
        <div className="field"><label>Map pin <small>{edit?.pos ? `${edit.pos[0].toFixed(4)}, ${edit.pos[1].toFixed(4)}` : "(tap the map to place it)"}</small></label>
          <MapView height={190} center={edit?.pos ?? DEMO_CENTER} zoom={edit?.pos ? 16 : 12} markers={edit?.pos ? [{ pos: edit.pos, kind: "place" }] : []} onPick={(p: LatLng) => setEdit({ ...edit, pos: p })} /></div>
        <label className="check-row"><span>Hide full address in previews<small>Shows only the name</small></span><Toggle label="Hide full address" checked={edit?.hideAddress ?? true} onChange={(v) => setEdit({ ...edit, hideAddress: v })} /></label>
        {err && <Notice tone="error">{err}</Notice>}
      </Sheet>
      <Confirm open={!!del} onClose={() => setDel(null)} title={`Delete ${del?.label}?`} text="This only removes the saved shortcut." confirmLabel="Delete" danger onConfirm={() => { if (del) removePlace(del.id); toast("Place deleted"); }} />
    </div>
  );
}

export function Incidents() {
  const { incidents, evidence } = useStore();
  const [q, setQ] = useState(""); const [f, setF] = useState<"all" | "active" | "open" | "resolved">("all");
  const list = incidents.filter((i) => (f === "all" || i.status === f) && (!q || `${i.id} ${i.title} ${i.category}`.toLowerCase().includes(q.toLowerCase()))).sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="page">
      <TopBar title="My incidents" back="/" right={<Link to="/report" className="icon-btn round" aria-label="New report"><Icon name="plus" /></Link>} />
      <div className="searchbar"><Icon name="search" size={18} /><input type="search" aria-label="Search incidents" placeholder="Search incidents" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      <Segmented label="Filter by status" value={f} onChange={setF} options={[{ id: "all", label: "All" }, { id: "active", label: "Active" }, { id: "open", label: "Open" }, { id: "resolved", label: "Resolved" }]} />
      <div className="stack">
        {list.map((i) => (
          <Card key={i.id} to={`/incident/${i.id}`} className="inc-card">
            <span className={`ico-sm ${i.type}`}><Icon name={i.type === "physical" ? "shield" : "flag"} size={20} /></span>
            <div className="grow"><b>{i.title}</b><small>{i.type === "physical" ? "Physical safety" : "Digital harassment"} · {fmtShort(i.at)}</small><small className="mono">{i.id} · {evidence.filter((e) => e.incidentId === i.id).length} evidence</small></div>
            <Chip tone={i.status === "active" ? "red" : i.status === "open" ? "amber" : "sage"}>{i.status === "active" ? "Active" : i.status === "open" ? "Open" : "Resolved"}</Chip>
          </Card>
        ))}
        {list.length === 0 && <EmptyState icon="file" title="No incidents found" text={incidents.length ? "Try a different search or filter." : "When you record an incident it will appear here."} action={<Button to="/report" icon="flag">Report an incident</Button>} />}
      </div>
    </div>
  );
}

export function IncidentDetail() {
  const { id } = useParams();
  const { incidents, evidence, contacts, updateIncident, addTimeline, toast } = useStore();
  const inc = incidents.find((i) => i.id === id);
  const [note, setNote] = useState(""); const [upd, setUpd] = useState(false); const [res, setRes] = useState(false);
  if (!inc) return <div className="page"><TopBar title="Incident" back="/incidents" /><EmptyState icon="file" title="Incident not found" text="It may have been deleted." action={<Button to="/incidents">My incidents</Button>} /></div>;
  const evs = evidence.filter((e) => e.incidentId === inc.id);
  const ackIds = Object.keys(inc.acks);
  return (
    <div className="page">
      <TopBar title={inc.status === "active" ? "Active incident" : "Incident"} back="/incidents" sub={inc.id} right={<Chip tone={inc.status === "active" ? "red" : inc.status === "open" ? "amber" : "sage"}>{inc.status === "active" ? "Active" : inc.status === "open" ? "Open" : "Resolved"}</Chip>} />
      <h2 className="inc-title">{inc.title} {inc.demo && <DemoTag />}</h2>
      <p className="muted tiny">{inc.category} · {fmtDateTime(inc.at)}{inc.locationText ? ` · ${inc.locationText}` : ""}</p>
      {inc.description && <Card tone="blush" className="desc"><p>{inc.description}</p></Card>}
      {inc.pos ? <MapView height={170} center={inc.pos} zoom={15} markers={[{ pos: inc.pos, kind: "incident", label: inc.title }]} note={inc.demo ? "Sample location (demo)" : "Location from this device"} /> : <Notice tone="info" icon="pin">No location attached to this incident.</Notice>}
      {inc.status === "active" && <Notice tone="warn" icon="bell"><b>Demo mode.</b> Contacts were not actually messaged. Statuses below are simulated.</Notice>}

      <h2 className="mt">Timeline</h2><Card><Timeline events={inc.timeline} /></Card>

      {ackIds.length > 0 && (<><h2 className="mt">Contact status</h2><div className="stack-sm">
        {ackIds.map((cid) => { const c = contacts.find((x) => x.id === cid); if (!c) return null; const ok = inc.acks[cid] === "acknowledged"; return (
          <Card key={cid} className="row-card"><Avatar name={c.name} size={42} /><div className="grow"><b>{c.name}</b><small>{c.relation} · {maskPhone(c.phone)}</small></div>
            {ok ? <Chip tone="sage" icon="check">Acknowledged</Chip> : <Button small variant="secondary" onClick={() => { updateIncident(inc.id, { acks: { ...inc.acks, [cid]: "acknowledged" } }); addTimeline(inc.id, { kind: "ack", text: `${c.name.split(" ")[0]} acknowledged (simulated)`, demo: true }); toast("Simulated acknowledgement"); }}>Simulate ack</Button>}</Card>); })}</div></>)}

      <div className="section-head"><h2>Evidence ({evs.length})</h2><Link to={`/capture?incident=${inc.id}`} className="link">Add</Link></div>
      <div className="stack">{evs.map((e) => <EvidenceItem key={e.id} e={e} />)}{evs.length === 0 && <Card className="muted">No evidence linked yet.</Card>}</div>

      <div className="actions-col">
        <Button full variant="secondary" icon="edit" onClick={() => setUpd(true)}>Update incident</Button>
        {inc.status === "resolved" ? <Button full icon="refresh" onClick={() => { updateIncident(inc.id, { status: "open" }); addTimeline(inc.id, { kind: "note", text: "Incident reopened" }); }}>Reopen incident</Button> : <Button full icon="shield" onClick={() => setRes(true)}>I'm safe: resolve incident</Button>}
      </div>
      <Sheet open={upd} onClose={() => setUpd(false)} title="Update incident" footer={<><Button variant="secondary" onClick={() => setUpd(false)}>Cancel</Button><Button onClick={() => { if (!note.trim()) return; addTimeline(inc.id, { kind: "note", text: note.trim() }); setNote(""); setUpd(false); toast("Update added"); }}>Add update</Button></>}>
        <Field label="What's changed?" htmlFor="nt"><textarea id="nt" className="input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note to the timeline" /></Field>
      </Sheet>
      <Sheet open={res} onClose={() => setRes(false)} title="Resolve this incident?" footer={<><Button variant="secondary" onClick={() => setRes(false)}>Cancel</Button><Button onClick={() => { updateIncident(inc.id, { status: "resolved" }); addTimeline(inc.id, { kind: "resolved", text: "You marked yourself safe. Incident resolved" }); setRes(false); toast("Incident resolved. Evidence stays in your vault"); }}>Confirm</Button></>}>
        <p className="muted">The incident is marked resolved. In the full product your contacts would be told you're safe. Evidence remains in your vault.</p>
      </Sheet>
    </div>
  );
}
