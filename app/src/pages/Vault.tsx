import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AudioPlayer, Button, Card, Chip, Confirm, EmptyState, EvidenceItem, Icon, Notice, Segmented, Sheet, Toggle, TopBar, syncChip } from "../components/ui";
import { fmtBytes, fmtDateTime, fmtDuration, sha256OfUrl, useVideoDuration } from "../lib/media";
import { useStore } from "../store";

type Filter = "all" | "image" | "video" | "audio";

export function Vault() {
  const { evidence } = useStore();
  const [q, setQ] = useState(""); const [f, setF] = useState<Filter>("all"); const [searching, setSearching] = useState(false);
  const list = evidence.filter((e) => (f === "all" || e.kind === f) && (!q || `${e.name} ${e.incidentId ?? ""}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => b.at.localeCompare(a.at));
  return (
    <div className="page">
      <div className="title-row"><div><span className="eyebrow"><Icon name="lock" size={12} /> PRIVATE · ON THIS DEVICE</span><h1>Evidence vault</h1></div>
        <button type="button" className="icon-btn round" aria-label="Search evidence" aria-expanded={searching} onClick={() => setSearching(!searching)}><Icon name="search" /></button></div>
      {searching && <input className="input" autoFocus type="search" placeholder="Search by file name or incident ID" aria-label="Search evidence" value={q} onChange={(e) => setQ(e.target.value)} />}
      <Segmented<Filter> label="Filter evidence" value={f} onChange={setF} options={[{ id: "all", label: "All" }, { id: "image", label: "Screenshots" }, { id: "video", label: "Videos" }, { id: "audio", label: "Audio" }]} />
      <div className="two vault-actions"><Button small variant="sage" icon="mic" to="/capture">Record</Button><Button small variant="secondary" icon="upload" to="/report/new?type=existing">Upload</Button></div>
      <div className="stack">
        {list.map((e) => <EvidenceItem key={e.id} e={e} />)}
        {list.length === 0 && <EmptyState icon="vault" title={q || f !== "all" ? "No matching evidence" : "Your vault is empty"} text={q || f !== "all" ? "Try a different search or filter." : "Record or upload evidence and it will appear here."} action={<Button to="/capture" icon="mic">Record evidence</Button>} />}
      </div>
      <Notice tone="info" icon="lock">Demo samples are bundled with the app. Files you add stay in this browser session and aren't synced, because no backend is connected.</Notice>
    </div>
  );
}

export function EvidenceDetail() {
  const { id } = useParams(); const nav = useNavigate();
  const { evidence, contacts, incidents, updateEvidence, removeEvidence, toast } = useStore();
  const e = evidence.find((x) => x.id === id);
  const [viewer, setViewer] = useState(false); const [share, setShare] = useState(false); const [revoke, setRevoke] = useState(false); const [del, setDel] = useState(false);
  const [hashing, setHashing] = useState(false); const [check, setCheck] = useState<"" | "match" | "diff">(""); const [herr, setHerr] = useState("");
  const [sel, setSel] = useState<string[]>([]);
  const vdur = useVideoDuration(e?.kind === "video" ? e.url : "", e?.duration);
  if (!e) return <div className="page"><TopBar title="Evidence" back="/vault" /><EmptyState icon="file" title="Evidence not found" text="It may have been removed, or it was only stored in a previous session." action={<Button to="/vault">Back to vault</Button>} /></div>;
  const inc = incidents.find((i) => i.id === e.incidentId);

  const compute = async () => {
    setHashing(true); setHerr(""); setCheck("");
    try {
      const v = await sha256OfUrl(e.url);
      if (e.hash) setCheck(v === e.hash.value ? "match" : "diff"); else updateEvidence(e.id, { hash: { value: v, at: new Date().toISOString() } });
    } catch (x) { setHerr((x as Error).message); }
    setHashing(false);
  };
  const exp = () => { const a = document.createElement("a"); a.href = e.url; a.download = e.name; document.body.appendChild(a); a.click(); a.remove(); toast("Exported a copy of the file"); };
  const nativeShare = async () => {
    try {
      const blob = await (await fetch(e.url)).blob(); const file = new File([blob], e.name, { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file], title: e.name }); toast("Shared via your device"); }
      else toast("File sharing isn't supported in this browser. Use Export instead.");
    } catch (x) { if ((x as Error).name !== "AbortError") toast("Couldn't open the share sheet"); }
  };
  const openShare = () => { setSel(e.access); setShare(true); };

  return (
    <div className="page">
      <TopBar title="Evidence details" back="/vault" />
      <Card className="media-card">
        {e.kind === "image" && <button type="button" className="img-open" onClick={() => setViewer(true)} aria-label="Open full-screen image"><img src={e.url} alt={`Evidence: ${e.name}`} /><span><Icon name="search" size={16} />Tap to enlarge</span></button>}
        {e.kind === "video" && <video className="video" src={e.url} controls playsInline preload="metadata" aria-label={e.name} />}
        {e.kind === "audio" && <AudioPlayer url={e.url} fallbackDuration={e.duration} />}
      </Card>
      <h2 className="file-title">{e.name}</h2>
      <div className="chip-row">{syncChip(e)}<Chip tone={e.access.length ? "amber" : "grey"} icon={e.access.length ? "share" : "lock"}>{e.access.length ? `Shared with ${e.access.length}` : "Private"}</Chip></div>
      {e.note && <p className="tiny muted">{e.note}</p>}
      <Card className="meta">
        <dl>
          <div><dt>Captured / added</dt><dd>{fmtDateTime(e.at)}</dd></div>
          <div><dt>Format</dt><dd>{e.format} · {e.kind}</dd></div>
          <div><dt>File size</dt><dd>{fmtBytes(e.size)}</dd></div>
          {e.kind !== "image" && <div><dt>Duration</dt><dd>{fmtDuration(e.kind === "video" ? vdur : e.duration)}</dd></div>}
          <div><dt>Linked incident</dt><dd>{inc ? <Link className="link" to={`/incident/${inc.id}`}>{inc.id} · {inc.title}</Link> : "Not linked"}</dd></div>
          <div><dt>Storage</dt><dd>{e.sync === "demo" ? "Bundled demo sample" : "This browser only (no backend connected)"}</dd></div>
        </dl>
      </Card>
      <h2 className="mt">Integrity fingerprint</h2>
      <Card className="hash">
        {e.hash ? (<>
          <small>SHA-256 · generated {fmtDateTime(e.hash.at)} in this browser</small>
          <code className="mono wrap">{e.hash.value}</code>
          {check === "match" && <Chip tone="sage" icon="check">File matches the recorded hash</Chip>}
          {check === "diff" && <Chip tone="red" icon="alert">File differs from the recorded hash</Chip>}
        </>) : <p className="muted">No fingerprint yet. Generate one to detect later changes to this file.</p>}
        {herr && <Notice tone="error">{herr}</Notice>}
        <Button small variant="secondary" icon="refresh" disabled={hashing} onClick={compute}>{hashing ? "Calculating…" : e.hash ? "Re-check file against hash" : "Generate SHA-256"}</Button>
        <p className="tiny muted">A hash only shows whether the file has changed since the hash was recorded on this device. It is <b>not</b> legal verification or proof of origin.</p>
      </Card>
      <div className="actions-col">
        <Button full icon="download" onClick={exp}>Export file</Button>
        <div className="two"><Button variant="secondary" icon="share" onClick={openShare}>Share</Button><Button variant="secondary" icon="eyeoff" disabled={!e.access.length} onClick={() => setRevoke(true)}>Revoke access</Button></div>
        {e.sync !== "demo" && <Button full variant="ghost" icon="trash" onClick={() => setDel(true)}>Delete from this device</Button>}
      </div>

      {viewer && <div className="viewer" role="dialog" aria-modal="true" aria-label="Image viewer"><div className="viewer-bar"><span>{fmtDateTime(e.at)}</span><button type="button" className="icon-btn light" aria-label="Close viewer" onClick={() => setViewer(false)}><Icon name="x" /></button></div><img src={e.url} alt={e.name} /><div className="viewer-foot">{inc?.id ?? "No incident"} · {e.hash ? "Hash recorded" : "No hash yet"}</div></div>}
      <Sheet open={share} onClose={() => setShare(false)} title="Share this evidence" footer={<><Button variant="secondary" onClick={() => setShare(false)}>Cancel</Button><Button onClick={() => { updateEvidence(e.id, { access: sel }); setShare(false); toast(sel.length ? "Access recorded in this app" : "Access cleared"); }}>Save access</Button></>}>
        <p className="muted">Choose who should have access. <b>Demo:</b> this records permission inside the app only. No link or message is sent.</p>
        <div className="stack-sm">{contacts.map((c) => <label key={c.id} className="check-row"><span>{c.name}<small>{c.relation}</small></span><Toggle label={`Allow ${c.name}`} checked={sel.includes(c.id)} onChange={(v) => setSel(v ? [...sel, c.id] : sel.filter((x) => x !== c.id))} /></label>)}</div>
        <Button full variant="secondary" icon="share" onClick={nativeShare}>Share file via device…</Button>
      </Sheet>
      <Confirm open={revoke} onClose={() => setRevoke(false)} title="Revoke all access?" text="Everyone you previously allowed will lose access recorded in this app. Copies they already downloaded can't be recalled." confirmLabel="Revoke access" danger onConfirm={() => { updateEvidence(e.id, { access: [] }); toast("Access revoked"); }} />
      <Confirm open={del} onClose={() => setDel(false)} title="Delete this file?" text="It will be removed from this device. This can't be undone." confirmLabel="Delete" danger onConfirm={() => { removeEvidence(e.id); toast("Deleted"); nav("/vault"); }} />
    </div>
  );
}
