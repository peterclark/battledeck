// Synthesized tap sounds via the Web Audio API — no audio assets needed.
// The AudioContext is created lazily on first play so it starts inside a
// user gesture (required by mobile browsers).
let ctx;
let muted =
  typeof localStorage !== "undefined" &&
  localStorage.getItem("battledeck-muted") === "1";

const context = () => {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
};

export const isMuted = () => muted;

export const setMuted = (value) => {
  muted = value;
  try {
    localStorage.setItem("battledeck-muted", value ? "1" : "0");
  } catch {
    // storage unavailable (private mode) — mute state just won't persist
  }
};

const tone = (c, { type = "sine", from, to, dur, gain = 0.2, at = 0 }) => {
  const osc = c.createOscillator();
  const g = c.createGain();
  const t = c.currentTime + at;
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
};

const noise = (c, { dur, gain = 0.15, freq = 800, q = 1, at = 0 }) => {
  const length = Math.ceil(c.sampleRate * dur);
  const buffer = c.createBuffer(1, length, c.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = c.createBufferSource();
  src.buffer = buffer;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = c.createGain();
  const t = c.currentTime + at;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(c.destination);
  src.start(t);
  src.stop(t + dur);
};

const play = (fn) => {
  if (muted) return;
  try {
    const c = context();
    if (c) fn(c);
  } catch {
    // audio unavailable — taps just stay silent
  }
};

// Page rustle — dice taps, resets
export const playPage = () =>
  play((c) => {
    noise(c, { dur: 0.16, gain: 0.14, freq: 1400, q: 0.6 });
    noise(c, { dur: 0.12, gain: 0.1, freq: 2400, q: 0.8, at: 0.06 });
  });

// Soft wax-seal thump — turning on a bonus
export const playSeal = () =>
  play((c) => {
    tone(c, { from: 220, to: 150, dur: 0.18, gain: 0.28 });
    tone(c, { type: "triangle", from: 660, dur: 0.12, gain: 0.05, at: 0.01 });
  });

// Rough quill scratch — turning on a penalty
export const playScratch = () =>
  play((c) => {
    noise(c, { dur: 0.12, gain: 0.2, freq: 900, q: 1.2 });
    tone(c, { type: "square", from: 120, to: 80, dur: 0.1, gain: 0.06 });
  });

// Tiny quill tick — rank taps, toggling something off
export const playQuill = () =>
  play((c) => {
    noise(c, { dur: 0.035, gain: 0.12, freq: 2800, q: 2.5 });
  });

export const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // haptics unavailable
  }
};
