import { describe, expect, it } from "vitest";
import { MODIFIERS } from "./constants";
import { DEFAULT_STATE, clearState, loadState, saveState } from "./persistence";

const KEY = "battledeck-state-v1";

describe("persistence", () => {
  it("returns defaults when nothing is stored", () => {
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("round-trips calculator state", () => {
    saveState({
      ...DEFAULT_STATE,
      baseDice: 7,
      offensiveSkill: 3,
      defensivePower: 9,
      commandCardModifiers: [1, -1, 2],
      modifiers: {
        ...MODIFIERS,
        disrupted: { ...MODIFIERS.disrupted, on: true },
        pinching: { ...MODIFIERS.pinching, on: true, count: 2 },
      },
    });
    const loaded = loadState();
    expect(loaded.baseDice).toBe(7);
    expect(loaded.offensiveSkill).toBe(3);
    expect(loaded.defensivePower).toBe(9);
    expect(loaded.commandCardModifiers).toEqual([1, -1, 2]);
    expect(loaded.modifiers.disrupted.on).toBe(true);
    expect(loaded.modifiers.pinching.count).toBe(2);
    expect(loaded.modifiers.pinching.on).toBe(true);
    expect(loaded.modifiers.flanking.on).toBe(false);
  });

  it("re-hydrates onto current defaults: static fields come from constants", () => {
    saveState({
      ...DEFAULT_STATE,
      modifiers: { ...MODIFIERS, disrupted: { ...MODIFIERS.disrupted, on: true } },
    });
    const loaded = loadState();
    // full modifier definition is intact, not just the stored {on}
    expect(loaded.modifiers.disrupted.modifier).toEqual([-1, -1, -1]);
    expect(loaded.modifiers.disrupted.code).toBe("DI");
  });

  it("ignores unknown modifier ids from older versions", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ modifiers: { removedModifier: { on: true } } })
    );
    const loaded = loadState();
    expect(loaded.modifiers.removedModifier).toBeUndefined();
    expect(Object.keys(loaded.modifiers)).toEqual(Object.keys(MODIFIERS));
  });

  it("clamps out-of-range and non-integer values to defaults", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        baseDice: 999,
        offensiveSkill: -2,
        defensiveSkill: "9",
        commandCardModifiers: ["x", 2],
        modifiers: { pinching: { on: true, count: 99 } },
      })
    );
    const loaded = loadState();
    expect(loaded.baseDice).toBe(4);
    expect(loaded.offensiveSkill).toBe(0);
    expect(loaded.defensiveSkill).toBe(0);
    expect(loaded.commandCardModifiers).toEqual([0, 2, 0]);
    expect(loaded.modifiers.pinching.count).toBe(0);
    expect(loaded.modifiers.pinching.on).toBe(false);
  });

  it("survives corrupt JSON", () => {
    localStorage.setItem(KEY, "{not json");
    expect(loadState()).toEqual(DEFAULT_STATE);
  });

  it("never persists the reset pseudo-modifier's state", () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ modifiers: { reset: { on: false } } })
    );
    expect(loadState().modifiers.reset.on).toBe(true);
  });

  it("clearState removes the stored entry", () => {
    saveState({ ...DEFAULT_STATE, baseDice: 9 });
    clearState();
    expect(loadState().baseDice).toBe(4);
  });
});
