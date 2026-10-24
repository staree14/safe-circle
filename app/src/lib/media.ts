import { useEffect, useState } from "react";

export async function sha256Hex(blob: Blob): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new Error("SHA-256 needs a secure context (HTTPS or localhost).");
  const buf = await blob.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256OfUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not read file");
  return sha256Hex(await res.blob());
}

export function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function fmtDuration(sec?: number) {
  if (sec == null || !isFinite(sec)) return "--:--";
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}
export function fmtShort(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}
export function toLocalInput(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

interface AudioMeta { duration: number; peaks: number[] }
const cache = new Map<string, Promise<AudioMeta>>();

/** Decode audio and compute a real waveform from the actual samples. */
export function loadAudioMeta(url: string, bars = 56): Promise<AudioMeta> {
  const key = `${url}|${bars}`;
  if (!cache.has(key)) {
    cache.set(key, (async () => {
      const res = await fetch(url);
      const arr = await res.arrayBuffer();
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      try {
        const buf = await ctx.decodeAudioData(arr);
        const data = buf.getChannelData(0);
        const size = Math.floor(data.length / bars) || 1;
        const peaks: number[] = [];
        for (let i = 0; i < bars; i++) {
          let max = 0;
          for (let j = 0; j < size; j += 16) max = Math.max(max, Math.abs(data[i * size + j] || 0));
          peaks.push(max);
        }
        const top = Math.max(...peaks, 0.001);
        return { duration: buf.duration, peaks: peaks.map((p) => p / top) };
      } finally { void ctx.close(); }
    })());
  }
  return cache.get(key)!;
}

export function useAudioMeta(url: string, bars = 56) {
  const [meta, setMeta] = useState<AudioMeta | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true;
    setMeta(null); setError(false);
    loadAudioMeta(url, bars).then((m) => live && setMeta(m)).catch(() => live && setError(true));
    return () => { live = false; };
  }, [url, bars]);
  return { meta, error };
}

const vcache = new Map<string, number>();
export function useVideoDuration(url: string, known?: number) {
  const [d, setD] = useState<number | undefined>(known ?? vcache.get(url));
  useEffect(() => {
    if (d != null) return;
    const v = document.createElement("video");
    v.preload = "metadata"; v.src = url;
    v.onloadedmetadata = () => { vcache.set(url, v.duration); setD(v.duration); };
    return () => { v.src = ""; };
  }, [url, d]);
  return d;
}
