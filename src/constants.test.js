import { describe, expect, it } from "vitest";
import { MODIFIERS, COMMAND_CARD_MODIFIERS } from "./constants";

// Structural invariants of the modifier table. These guard the mistakes the
// data file invites: dangling `disabled` references, one-sided exclusions,
// duplicated positions, and unknown color tokens.
describe("MODIFIERS invariants", () => {
  const entries = Object.entries(MODIFIERS);
  const ids = Object.keys(MODIFIERS);

  it("every key matches its entry's id", () => {
    for (const [key, mod] of entries) {
      expect(mod.id).toBe(key);
    }
  });

  it("positions are unique and contiguous from 1", () => {
    const positions = entries.map(([, mod]) => mod.position).sort((a, b) => a - b);
    expect(positions).toEqual(entries.map((_, i) => i + 1));
  });

  it("every disabled reference names a real modifier, with no self refs or dupes", () => {
    for (const [key, mod] of entries) {
      const disabled = mod.disabled ?? [];
      expect(new Set(disabled).size).toBe(disabled.length);
      expect(disabled).not.toContain(key);
      for (const ref of disabled) {
        expect(ids, `${key} disables unknown "${ref}"`).toContain(ref);
      }
    }
  });

  it("exclusions are symmetric: if A disables B, B disables A", () => {
    for (const [key, mod] of entries) {
      for (const ref of mod.disabled ?? []) {
        expect(
          MODIFIERS[ref].disabled ?? [],
          `${ref} should list ${key} back`
        ).toContain(key);
      }
    }
  });

  it("colors are one of the three semantic tokens", () => {
    const tokens = ["bg-green-400", "bg-red-400", "bg-yellow-400"];
    for (const [, mod] of entries) {
      expect(tokens).toContain(mod.color);
    }
  });

  it("modifier triples are three numbers", () => {
    for (const [, mod] of entries) {
      expect(mod.modifier).toHaveLength(3);
      for (const n of mod.modifier) expect(typeof n).toBe("number");
    }
  });

  it("only pinching stacks, starting at count 0", () => {
    for (const [key, mod] of entries) {
      if (key === "pinching") {
        expect(mod.maxCount).toBeGreaterThan(0);
        expect(mod.count).toBe(0);
      } else {
        expect(mod.maxCount).toBeUndefined();
      }
    }
  });

  it("only reset starts on, and every other modifier has a breakdown code and name", () => {
    for (const [key, mod] of entries) {
      if (key === "reset") {
        expect(mod.on).toBe(true);
      } else {
        expect(mod.on).toBe(false);
        expect(mod.code).toBeTruthy();
        expect(mod.name).toBeTruthy();
      }
    }
  });
});

describe("COMMAND_CARD_MODIFIERS invariants", () => {
  it("ids are unique and every mod is a three-number triple", () => {
    const ids = COMMAND_CARD_MODIFIERS.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const card of COMMAND_CARD_MODIFIERS) {
      expect(card.mod).toHaveLength(3);
      expect(["bg-green-400", "bg-red-400"]).toContain(card.color);
    }
  });
});
