import { beforeEach, describe, expect, it, vi } from "vitest";

// jsdom has no Web Audio or audio session, so both are stubbed. The module
// keeps its context and mute state at module scope, so each test re-imports
// it fresh via vi.resetModules().
const stubAudio = () => {
  const source = { buffer: null, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
  const ctx = {
    state: "suspended",
    sampleRate: 44100,
    currentTime: 0,
    destination: {},
    resume: vi.fn(function resume() {
      this.state = "running";
    }),
    createBuffer: vi.fn(() => ({ getChannelData: () => new Float32Array(1) })),
    createBufferSource: vi.fn(() => source),
    createOscillator: vi.fn(() => ({
      type: "",
      frequency: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(() => ({ connect: vi.fn() })),
      start: vi.fn(),
      stop: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn(() => ({ connect: vi.fn() })),
    })),
    createBiquadFilter: vi.fn(() => ({
      type: "",
      frequency: {},
      Q: {},
      connect: vi.fn(() => ({ connect: vi.fn() })),
    })),
  };
  // a plain function, not an arrow: the module calls `new AudioContext()`
  window.AudioContext = vi.fn(function AudioContextStub() {
    return ctx;
  });
  navigator.audioSession = { type: "auto" };
  return { ctx, source };
};

describe("sounds", () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it("primes the context and claims a playback session on unlock", async () => {
    const { ctx, source } = stubAudio();
    const { unlockAudio } = await import("./sounds");

    unlockAudio();

    // resumed inside the gesture, with a silent buffer pushed through so
    // iOS doesn't swallow the first real sound
    expect(ctx.resume).toHaveBeenCalled();
    expect(source.start).toHaveBeenCalled();
    // a playback session is what survives the iOS ringer switch
    expect(navigator.audioSession.type).toBe("playback");
  });

  it("stays silent and leaves the session alone while muted", async () => {
    const { ctx } = stubAudio();
    localStorage.setItem("battledeck-muted", "1");
    const { unlockAudio, playDrum } = await import("./sounds");

    unlockAudio();
    playDrum();

    expect(window.AudioContext).not.toHaveBeenCalled();
    expect(ctx.createOscillator).not.toHaveBeenCalled();
    expect(navigator.audioSession.type).toBe("auto");
  });

  it("hands the playback session back when muted mid-session", async () => {
    stubAudio();
    const { playDrum, setMuted } = await import("./sounds");

    playDrum();
    expect(navigator.audioSession.type).toBe("playback");

    setMuted(true);
    expect(navigator.audioSession.type).toBe("auto");

    setMuted(false);
    playDrum();
    expect(navigator.audioSession.type).toBe("playback");
  });

  it("survives browsers with no Web Audio or audio session at all", async () => {
    delete window.AudioContext;
    delete window.webkitAudioContext;
    delete navigator.audioSession;
    const { unlockAudio, playDrum, buzz } = await import("./sounds");

    expect(() => {
      unlockAudio();
      playDrum();
      buzz();
    }).not.toThrow();
  });
});
