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

const play = (fn) => {
  if (muted) return;
  try {
    const c = context();
    if (c) fn(c);
  } catch {
    // audio unavailable — taps just stay silent
  }
};

// Crisp UI click — dice taps, resets
export const playClick = () =>
  play((c) => {
    tone(c, { type: "square", from: 1800, to: 1200, dur: 0.035, gain: 0.08 });
    tone(c, { from: 320, to: 240, dur: 0.06, gain: 0.1 });
  });

// Rising two-note chime — turning on a bonus
export const playChime = () =>
  play((c) => {
    tone(c, { type: "triangle", from: 660, dur: 0.12, gain: 0.12 });
    tone(c, { type: "triangle", from: 990, dur: 0.18, gain: 0.1, at: 0.07 });
  });

// Low descending blip — turning on a penalty
export const playBlip = () =>
  play((c) => {
    tone(c, { type: "triangle", from: 240, to: 150, dur: 0.14, gain: 0.16 });
  });

// Tiny tick — rank taps, toggling something off
export const playTick = () =>
  play((c) => {
    tone(c, { type: "square", from: 1400, dur: 0.025, gain: 0.06 });
  });

export const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // haptics unavailable
  }
};
