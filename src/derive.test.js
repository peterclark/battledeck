import { describe, expect, it } from "vitest";
import {
  MAX_DICE,
  deriveDice,
  deriveRoll,
  sumModifiers,
} from "./derive";

describe("sumModifiers", () => {
  it("returns zeros for no modifiers", () => {
    expect(sumModifiers({})).toEqual([0, 0, 0]);
  });

  it("ignores modifiers that are off", () => {
    expect(
      sumModifiers({
        a: { on: false, modifier: [5, 5, 5] },
        b: { on: true, modifier: [1, -1, 0] },
      })
    ).toEqual([1, -1, 0]);
  });

  it("sums multiple on modifiers", () => {
    expect(
      sumModifiers({
        a: { on: true, modifier: [2, 0, 0] },
        b: { on: true, modifier: [-1, -1, -1] },
        c: { on: true, modifier: [0, 1, 1] },
      })
    ).toEqual([1, 0, 0]);
  });

  it("multiplies stacking modifiers by their count", () => {
    expect(
      sumModifiers({ pinch: { on: true, count: 3, modifier: [0, 1, 1] } })
    ).toEqual([0, 3, 3]);
  });
});

describe("deriveDice", () => {
  it("adds base, command card, and situational dice", () => {
    expect(deriveDice(4, 1, 2)).toBe(7);
  });

  it("clamps at 0", () => {
    expect(deriveDice(1, -2, -3)).toBe(0);
  });

  it("clamps at MAX_DICE", () => {
    expect(deriveDice(18, 2, 3)).toBe(MAX_DICE);
  });
});

describe("deriveRoll", () => {
  it("passes mid-range totals through with no overkill", () => {
    expect(deriveRoll(3)).toEqual({ value: 3, overkill: 0 });
  });

  it("clamps low totals to 1 (1 always hits)", () => {
    expect(deriveRoll(0)).toEqual({ value: 1, overkill: 0 });
    expect(deriveRoll(-4)).toEqual({ value: 1, overkill: 0 });
  });

  it("clamps at 5 and converts the excess to overkill", () => {
    expect(deriveRoll(5)).toEqual({ value: 5, overkill: 0 });
    expect(deriveRoll(6)).toEqual({ value: 5, overkill: 1 });
    expect(deriveRoll(8)).toEqual({ value: 5, overkill: 3 });
  });
});
