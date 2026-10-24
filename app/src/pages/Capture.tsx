import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button, Card, Chip, Field, Icon, Notice, TopBar } from "../components/ui";
import { fmtBytes, fmtDuration } from "../lib/media";
import { useStore } from "../store";
import { fileToEvidence, kindOf } from "./Report";

type Step = "choose" | "permission" | "ready" | "recording" | "preview" | "saved";
type Mode = "audio" | "video";
interface Clip { blob: Blob; url: string; name: string; duration?: number }

const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined" && window.isSecureContext;

export default function Capture() {
  const [sp] = useSearchParams();
  const { incidents, addEvidence, addTimeline, toast } = useStore();
  const [step, setStep] = useState<Step>("choose");
  const [mode, setMode] = useState<Mode>("audio");
  const [err, setErr] = useState("");
  const [secs, setSecs] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0.1));
  const [clip, setClip] = useState<Clip | null>(null);
  const [name, setName] = useState("");
  const [incident, setIncident] = useState(sp.get("incident") ?? "");
  const [savedId, setSavedId] = useState("");
  const stream = useRef<MediaStream | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const liveVideo = useRef<HTMLVideoElement>(null);
  const timer = useRef(0); const raf = useRef(0); const actx = useRef<AudioContext | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const release = useCallback(() => {
    window.clearInterval(timer.current); cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null;
    void actx.current?.close(); actx.current = null;
  }, []);
  useEffect(() => release, [release]);
  useEffect(() => { if (liveVideo.current && stream.current && (step === "ready" || step === "recording")) liveVideo.current.srcObject = stream.current; });

  const reset = () => { release(); setClip(null); setSecs(0); setErr(""); setStep("choose"); };

  const allow = async () => {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia(mode === "video" ? { audio: true, video: { facingMode: "user" } } : { audio: true });
      stream.current = s;
      const Ctx = window.AudioContext; actx.current = new Ctx();
      const an = actx.current.createAnalyser(); an.fftSize = 64; actx.current.createMediaStreamSource(s).connect(an);
      const buf = new Uint8Array(an.frequencyBinCount);
      const loop = () => { an.getByteFrequencyData(buf); setLevels(Array.from({ length: 24 }, (_, i) => Math.max(0.08, buf[i % buf.length] / 255))); raf.current = requestAnimationFrame(loop); };
      loop(); setStep("ready");
    } catch (e) {
      const n = (e as DOMException).name;
      setErr(n === "NotAllowedError" ? `${mode === "video" ? "Camera or microphone" : "Microphone"} permission was denied. You can allow it in your browser's site settings, or upload a file instead.` : n === "NotFoundError" ? "No microphone or camera was found on this device." : "Couldn't start the recorder on this device.");
      setStep("choose");
    }
  };

  const start = () => {
    if (!stream.current) return;
    chunks.current = []; setSecs(0);
    const types = mode === "video" ? ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"] : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"];
    const mime = types.find((t) => MediaRecorder.isTypeSupported(t));
    const r = new MediaRecorder(stream.current, mime ? { mimeType: mime } : undefined); rec.current = r;
    r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
    r.onstop = () => {
      const blob = new Blob(chunks.current, { type: r.mimeType || (mode === "video" ? "video/webm" : "audio/webm") });
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      setClip({ blob, url: URL.createObjectURL(blob), name: `${mode}_${stamp}.${ext}`, duration: undefined });
      setName(`${mode}_${stamp}.${ext}`); release(); setStep("preview");
    };
    r.start(1000); setStep("recording");
    timer.current = window.setInterval(() => setSecs((s) => s + 1), 1000);
  };
  const stop = () => { window.clearInterval(timer.current); rec.current?.state !== "inactive" && rec.current?.stop(); };

  const pickFile = (f?: File) => { if (!f) return; release(); setClip({ blob: f, url: URL.createObjectURL(f), name: f.name }); setName(f.name); setStep("preview"); };

  const save = async () => {
    if (!clip) return;
    const nm = name.trim() || clip.name;
    const e = await fileToEvidence(clip.blob, nm, { duration: secs || undefined, sync: "pending", incidentId: undefined });
    const id = addEvidence({ ...e, incidentId: incident || undefined });
    if (incident) addTimeline(incident, { kind: "evidence", text: `${kindOf(clip.blob) === "video" ? "Video" : kindOf(clip.blob) === "audio" ? "Audio" : "Image"} added: ${nm}` });
    setSavedId(id); toast("Saved on this device"); setStep("saved");
  };

  return (
    <div className={`page ${step === "recording" ? "rec-page" : ""}`}>
      <TopBar title="Capture evidence" back={step === "recording" ? undefined : "/vault"} />
      <input ref={fileInput} type="file" hidden accept="audio/*,video/*,image/*" onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ""; }} />

      {step === "choose" && (<>
        <p className="lead">Recording starts only when <b>you</b> press Start. A clear indicator stays on screen the whole time. SafeCircle never records in the background.</p>
        {!supported && <Notice tone="warn" icon="info">{!window.isSecureContext ? "Recording needs a secure connection (HTTPS or localhost)." : "This browser can't record audio or video."} You can still upload a file below.</Notice>}
        {err && <Notice tone="error">{err}</Notice>}
        <div className="capture-grid">
          <button type="button" disabled={!supported} onClick={() => { setMode("audio"); setStep("permission"); }}><span><Icon name="mic" size={30} /></span><b>Audio</b><small>Record with microphone</small></button>
          <button type="button" disabled={!supported} onClick={() => { setMode("video"); setStep("permission"); }}><span><Icon name="video" size={30} /></span><b>Video</b><small>Camera + microphone</small></button>
        </div>
        <Button full variant="secondary" icon="upload" onClick={() => fileInput.current?.click()}>Upload a file instead</Button>
        <Notice tone="info" icon="lock">Recordings are saved on this device first. This prototype has no backend, so nothing is uploaded.</Notice>
      </>)}

      {step === "permission" && (
        <Card className="perm"><span className="success-icon sm"><Icon name={mode === "video" ? "video" : "mic"} size={28} /></span><h2>Allow {mode === "video" ? "camera & microphone" : "microphone"}?</h2>
          <p className="muted">Your browser will ask for permission next. After you allow it, you'll see a preview and still have to press <b>Start recording</b>. You can stop any time.</p>
          <Button full icon="check" onClick={allow}>Continue to permission prompt</Button><Button full variant="ghost" onClick={reset}>Not now</Button></Card>
      )}

      {(step === "ready" || step === "recording") && (<div className={`rec ${step}`}>
        <div className="rec-ind" role="status" aria-live="polite"><i className={step === "recording" ? "live" : ""} />{step === "recording" ? `Recording ${mode}` : `${mode === "video" ? "Camera & mic" : "Mic"} on · not recording`}</div>
        {mode === "video" ? <video ref={liveVideo} className="live-video" autoPlay muted playsInline /> : <div className="live-wave" aria-hidden="true">{levels.map((l, i) => <i key={i} style={{ height: `${l * 100}%` }} />)}</div>}
        <div className="rec-timer mono" aria-live="off">{fmtDuration(secs)}</div>
        {step === "ready" ? <><Button full icon="play" variant="danger" onClick={start}>Start recording</Button><Button full variant="ghost" onClick={reset}>Cancel and turn off {mode === "video" ? "camera" : "mic"}</Button></> : <Button full variant="danger" icon="stop" onClick={stop}>Stop &amp; review</Button>}
      </div>)}

      {step === "preview" && clip && (<>
        <Chip tone="amber" icon="clock">Not saved yet. Review first</Chip>
        <Card className="media-card">{kindOf(clip.blob) === "video" ? <video className="video" src={clip.url} controls playsInline /> : kindOf(clip.blob) === "audio" ? <audio className="audio-native" src={clip.url} controls /> : <img className="preview-img" src={clip.url} alt="Preview of selected file" />}</Card>
        <small className="muted">{fmtBytes(clip.blob.size)} · {clip.blob.type || "unknown type"}{secs ? ` · ${fmtDuration(secs)}` : ""}</small>
        <Field label="File name" htmlFor="nm"><input id="nm" className="input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Link to incident" hint="(optional)" htmlFor="li"><select id="li" className="input" value={incident} onChange={(e) => setIncident(e.target.value)}><option value="">Not linked yet</option>{incidents.map((i) => <option key={i.id} value={i.id}>{i.id} · {i.title}</option>)}</select></Field>
        <div className="two"><Button variant="secondary" icon="trash" onClick={reset}>Discard</Button><Button icon="check" onClick={save}>Save to vault</Button></div>
      </>)}

      {step === "saved" && (
        <div className="center-page tight"><span className="success-icon"><Icon name="check" size={38} /></span><h1>Saved on this device</h1>
          <div className="chip-row center"><Chip tone="sage" icon="lock">Saved</Chip><Chip tone="amber" icon="clock">Sync pending</Chip></div>
          <p className="muted">Sync is pending because this prototype isn't connected to a backend yet. The file hasn't been uploaded or shared.</p>
          <div className="stack-sm full"><Button full to={`/vault/${savedId}`} icon="file">View in vault</Button><Button full variant="secondary" icon="plus" onClick={reset}>Record another</Button><Link to="/" className="link center">Back to home</Link></div></div>
      )}
    </div>
  );
}
