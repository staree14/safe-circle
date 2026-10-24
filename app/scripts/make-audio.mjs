// Generates two SYNTHETIC demo audio files (not real recordings) with different durations.
import fs from "node:fs";
import path from "node:path";

const RATE = 16000;
function wav(seconds, voice) {
  const n = Math.floor(seconds * RATE);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8); buf.write("fmt ", 12);
  buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(RATE, 24); buf.writeUInt32LE(RATE * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    // syllable-like amplitude envelope so the waveform looks like speech cadence
    const env = Math.max(0, Math.sin(t * voice.rate * Math.PI)) ** 2 * (0.55 + 0.45 * Math.sin(t * 0.9 + voice.seed));
    const pitch = voice.base + 40 * Math.sin(t * 2.3 + voice.seed);
    const s = (Math.sin(2 * Math.PI * pitch * t) + 0.5 * Math.sin(4 * Math.PI * pitch * t) + 0.25 * Math.sin(6 * Math.PI * pitch * t)) / 1.75;
    const noise = (Math.random() * 2 - 1) * 0.04;
    buf.writeInt16LE(Math.round((s * env + noise) * 0.6 * 32767), 44 + i * 2);
  }
  return buf;
}
const out = path.resolve("public/assets/audio");
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, "demo_audio_sample_short.wav"), wav(12, { base: 190, rate: 2.6, seed: 1 }));
fs.writeFileSync(path.join(out, "demo_audio_sample_long.wav"), wav(27, { base: 140, rate: 3.1, seed: 4 }));
console.log("audio written");
