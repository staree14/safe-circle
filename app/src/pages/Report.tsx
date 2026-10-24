import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Chip, Field, Icon, Notice, TopBar } from "../components/ui";
import { fmtBytes, fmtDateTime, sha256Hex, toLocalInput } from "../lib/media";
import { useStore, type Evidence } from "../store";

const CATS = {
  physical: ["Being followed", "Unwanted contact or touching", "Verbal threat in person", "Unsafe location or situation", "Other"],
  digital: ["Threats", "Stalking", "Impersonation", "Extortion", "Image-based abuse", "Other"],
};

export function kindOf(f: Blob): Evidence["kind"] { return f.type.startsWith("video") ? "video" : f.type.startsWith("audio") ? "audio" : "image"; }
export async function fileToEvidence(f: File | Blob, name: string, extra: Partial<Evidence> = {}): Promise<Omit<Evidence, "id" | "incidentId">> {
  let hash: Evidence["hash"];
  try { hash = { value: await sha256Hex(f), at: new Date().toISOString() }; } catch { /* insecure context */ }
  const ext = (name.split(".").pop() || f.type.split("/")[1] || "file").toUpperCase();
  return { kind: kindOf(f), name, url: URL.createObjectURL(f), at: new Date().toISOString(), size: f.size, format: ext, sync: "local", access: [], hash, ...extra };
}

export function ReportChoose() {
  const opts = [
    { to: "/report/new?type=physical", icon: "shield", title: "Physical Safety", text: "Being followed, threatened or made to feel unsafe in person.", tone: "sage" },
    { to: "/report/new?type=digital", icon: "flag", title: "Digital Harassment", text: "Threats, fake accounts, impersonation or stalking online.", tone: "blush" },
    { to: "/report/new?type=existing", icon: "file", title: "Add Evidence to an Existing Incident", text: "Attach new files to something you've already recorded.", tone: "plain" },
  ] as const;
  return (
    <div className="page">
      <TopBar title="Report an incident" back="/" />
      <p className="lead">What would you like to record? Everything stays private on this device until you choose to share it.</p>
      <div className="stack">{opts.map((o) => <Card key={o.to} to={o.to} tone={o.tone} className="choice"><span className="ico"><Icon name={o.icon} size={26} /></span><div className="grow"><b>{o.title}</b><small>{o.text}</small></div><Icon name="chev" size={20} /></Card>)}</div>
      <Notice tone="info" icon="heart">This app saves your own record. It does <b>not</b> file an official police report. If you're in danger, call 112.</Notice>
      <div className="two"><Button variant="secondary" to="/incidents" icon="file">My incidents</Button><Button variant="secondary" to="/capture" icon="mic">Record evidence</Button></div>
    </div>
  );
}

export function ReportForm() {
  const nav = useNavigate();
  const [sp] = useSearchParams();
  const type = (sp.get("type") as "physical" | "digital" | "existing") || "physical";
  const { incidents, addIncident, addEvidence, addTimeline, toast } = useStore();
  const [cat, setCat] = useState(type === "digital" ? CATS.digital[0] : CATS.physical[0]);
  const [when, setWhen] = useState(toLocalInput());
  const [where, setWhere] = useState("");
  const [desc, setDesc] = useState("");
  const [existing, setExisting] = useState(incidents[0]?.id ?? "");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const previews = useRef<Map<File, string>>(new Map());
  const prev = (f: File) => { if (!previews.current.has(f)) previews.current.set(f, URL.createObjectURL(f)); return previews.current.get(f)!; };
  useEffect(() => { const m = previews.current; return () => m.forEach((u) => URL.revokeObjectURL(u)); }, []);

  const save = async () => {
    setErr("");
    if (type === "existing") { if (!existing) return setErr("Choose an incident first."); if (!files.length) return setErr("Add at least one file."); }
    else if (!desc.trim() && !files.length) return setErr("Add a short description or at least one file so the record is useful.");
    setBusy(true);
    try {
      const evs = await Promise.all(files.map((f) => fileToEvidence(f, f.name)));
      let id = existing;
      if (type === "existing") {
        evs.forEach((e) => addEvidence({ ...e, incidentId: existing }));
        addTimeline(existing, { kind: "evidence", text: `${evs.length} file${evs.length > 1 ? "s" : ""} added from this device` });
      } else {
        const at = new Date(when).toISOString();
        id = addIncident({ title: desc.trim().split(/[.\n]/)[0].slice(0, 48) || cat, type, category: cat, status: "open", at, locationText: where.trim() || undefined, description: desc.trim(),
          timeline: [{ id: "n1", at: new Date().toISOString(), kind: "created", text: "Incident record saved on this device" }, ...(evs.length ? [{ id: "n2", at: new Date().toISOString(), kind: "evidence" as const, text: `${evs.length} evidence file${evs.length > 1 ? "s" : ""} attached` }] : [])] }, evs);
      }
      toast("Saved on this device"); nav(`/report/saved/${id}`);
    } catch { setErr("Something went wrong while saving. Please try again."); setBusy(false); }
  };

  const title = type === "existing" ? "Add evidence" : type === "digital" ? "Digital harassment" : "Physical safety";
  return (
    <div className="page form-page">
      <TopBar title={title} back="/report" sub={type === "existing" ? "Existing incident" : "New incident"} />
      <div className="form">
        {type === "existing" ? (
          <Field label="Incident" htmlFor="inc"><select id="inc" className="input" value={existing} onChange={(e) => setExisting(e.target.value)}>{incidents.map((i) => <option key={i.id} value={i.id}>{i.id} · {i.title}</option>)}</select></Field>
        ) : (<>
          <Field label="Type of incident" htmlFor="cat"><select id="cat" className="input" value={cat} onChange={(e) => setCat(e.target.value)}>{CATS[type].map((c) => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Date and time" htmlFor="when"><input id="when" type="datetime-local" className="input" value={when} max={toLocalInput()} onChange={(e) => setWhen(e.target.value)} /></Field>
          <Field label="Location" hint="(optional)" htmlFor="where"><input id="where" className="input" placeholder={type === "digital" ? "Platform or website, if relevant" : "Street, landmark or area"} value={where} onChange={(e) => setWhere(e.target.value)} /></Field>
          <Field label="What happened?" hint="(in your own words)" htmlFor="desc"><textarea id="desc" className="input" rows={4} placeholder="Write only what you're comfortable sharing. You can edit this later." value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
        </>)}
        <div className="field"><label>Evidence <small>(optional)</small></label>
          <input ref={input} type="file" accept="image/*,video/*,audio/*" multiple hidden onChange={(e) => { setFiles((f) => [...f, ...Array.from(e.target.files ?? [])]); e.target.value = ""; }} />
          <div className="attach-grid">
            <button type="button" className="attach" onClick={() => input.current?.click()}><Icon name="upload" /><b>Upload files</b><small>Screenshots, video, audio</small></button>
            <Link to="/capture" className="attach"><Icon name="mic" /><b>Record now</b><small>Opens capture screen</small></Link>
          </div>
          {files.length > 0 && <ul className="file-list">{files.map((f, i) => (
            <li key={i}>{f.type.startsWith("image") ? <img src={prev(f)} alt="" /> : <span className="fi"><Icon name={f.type.startsWith("video") ? "video" : "mic"} size={20} /></span>}<div className="grow"><b>{f.name}</b><small>{fmtBytes(f.size)}</small></div><button type="button" className="icon-btn" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><Icon name="x" size={18} /></button></li>))}</ul>}
        </div>
        <Notice tone="info" icon="lock">Saved only on this device. Nothing is uploaded or shared unless you choose to.</Notice>
        {err && <Notice tone="error">{err}</Notice>}
      </div>
      <div className="sticky-cta"><Button full icon="check" disabled={busy} onClick={save}>{busy ? "Saving…" : type === "existing" ? "Add to incident" : "Save Incident"}</Button></div>
    </div>
  );
}

export function ReportSaved() {
  const { id } = useParams();
  const { incidents, evidence } = useStore();
  const inc = incidents.find((i) => i.id === id);
  const evs = evidence.filter((e) => e.incidentId === id);
  if (!inc) return <div className="page"><TopBar title="Saved" back="/" /><Card>Record not found. <Link className="link" to="/incidents">My incidents</Link></Card></div>;
  return (
    <div className="page center-page">
      <span className="success-icon"><Icon name="check" size={38} /></span>
      <span className="eyebrow">SAVED ON THIS DEVICE</span>
      <h1>Record saved</h1>
      <p className="muted">Your incident <b className="mono">{inc.id}</b> and {evs.length} file{evs.length === 1 ? "" : "s"} are stored in this browser. They haven't been uploaded or reported to anyone.</p>
      <Card className="summary">
        <div><small>TYPE</small><b>{inc.category}</b></div>
        <div><small>WHEN</small><b>{fmtDateTime(inc.at)}</b></div>
        <div><small>STATUS</small><Chip tone="amber">Open</Chip> <Chip tone="amber" icon="clock">Sync pending</Chip></div>
      </Card>
      <div className="stack-sm full"><Button full to={`/incident/${inc.id}`} icon="file">View incident</Button><Button full variant="secondary" to="/report/new?type=existing" icon="plus">Add more evidence</Button><div className="two"><Button variant="ghost" to="/vault">Open vault</Button><Button variant="ghost" to="/">Home</Button></div></div>
    </div>
  );
}
