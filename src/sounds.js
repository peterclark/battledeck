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

// iOS silences Web Audio whenever the ringer switch is set to silent,
// which mutes the whole app at a game table. Declaring a playback audio
// session (Safari 16.4+) opts out of that. The trade-off is that a
// playback session interrupts other apps' audio, so the session is only
// claimed while we are actually making noise and is handed back on mute.
const setSession = (type) => {
  try {
    if (navigator.audioSession) navigator.audioSession.type = type;
  } catch {
    // audio session unsupported — the ringer switch stays in charge
  }
};

// iOS leaves a fresh AudioContext suspended until it is resumed inside a
// user gesture, and can swallow the first sound while it unlocks. Priming
// it on the first pointer down means that tap's own sound is audible.
export const unlockAudio = () => {
  if (muted) return;
  try {
    const c = context();
    if (!c) return;
    setSession("playback");
    const primer = c.createBufferSource();
    primer.buffer = c.createBuffer(1, 1, c.sampleRate);
    primer.connect(c.destination);
    primer.start(0);
  } catch {
    // audio unavailable — taps just stay silent
  }
};

export const isMuted = () => muted;

export const setMuted = (value) => {
  muted = value;
  // Muting hands the playback session back so other apps' audio resumes
  if (value) setSession("auto");
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
    if (!c) return;
    setSession("playback");
    fn(c);
  } catch {
    // audio unavailable — taps just stay silent
  }
};

// Low war-drum thud — dice taps, resets
export const playDrum = () =>
  play((c) => {
    tone(c, { from: 120, to: 42, dur: 0.22, gain: 0.5 });
    noise(c, { dur: 0.08, gain: 0.12, freq: 250, q: 0.8 });
  });

// Sword-ring shimmer — turning on a bonus
export const playBonus = () =>
  play((c) => {
    [880, 1320, 1760].forEach((freq, i) =>
      tone(c, {
        type: "triangle",
        from: freq * (1 + i * 0.002),
        dur: 0.35 - i * 0.06,
        gain: 0.07,
        at: 0.012 * i,
      })
    );
  });

// Dull iron clank — turning on a penalty
export const playPenalty = () =>
  play((c) => {
    tone(c, { type: "square", from: 140, to: 70, dur: 0.16, gain: 0.12 });
    noise(c, { dur: 0.1, gain: 0.18, freq: 320, q: 2 });
  });

// Small dry click — rank taps, toggling something off
export const playTick = () =>
  play((c) => {
    noise(c, { dur: 0.03, gain: 0.12, freq: 2200, q: 3 });
  });

// Haptics are Android-only in practice: iOS Safari does not implement the
// Vibration API at all, so this is a no-op on iPhone and iPad.
export const buzz = (ms = 8) => {
  try {
    navigator.vibrate?.(ms);
  } catch {
    // haptics unavailable
  }
};
