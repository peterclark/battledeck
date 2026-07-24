import { describe, expect, it } from "vitest";
import { each, isInteger, keys, map, uniq } from "lodash";
import {
  FACTIONS,
  UNITS,
  UNITS_BY_UID,
  activeAbilities,
  attackProfile,
} from "./index";
import { MODIFIERS } from "../constants";
import { MAX_DICE, MAX_ROLL } from "../derive";

const isRank = (value) => isInteger(value) && value >= 0 && value < MAX_ROLL;

const expectProfile = (unit, profile) => {
  expect(isInteger(profile.dice), `${unit.id} dice`).toBe(true);
  expect(profile.dice).toBeGreaterThan(0);
  expect(profile.dice).toBeLessThanOrEqual(MAX_DICE);
  expect(isRank(profile.offensiveSkill), `${unit.id} OS`).toBe(true);
  expect(isRank(profile.offensivePower), `${unit.id} OP`).toBe(true);
};

describe("faction data", () => {
  it("factions have ids, names, and at least one unit", () => {
    expect(FACTIONS.length).toBeGreaterThan(0);
    each(FACTIONS, (faction) => {
      expect(faction.id).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      expect(faction.name).toBeTruthy();
      expect(faction.units.length).toBeGreaterThan(0);
    });
  });

  it("unit uids are globally unique", () => {
    const uids = map(UNITS, "uid");
    expect(uniq(uids)).toHaveLength(uids.length);
    expect(keys(UNITS_BY_UID)).toHaveLength(UNITS.length);
  });

  it("every unit has a complete, in-range stat card", () => {
    each(UNITS, (unit) => {
      expect(unit.id).toMatch(/^[a-z][a-zA-Z0-9]*$/);
      expect(unit.name).toBeTruthy();
      expect(isInteger(unit.points), `${unit.id} points`).toBe(true);
      expect(unit.points).toBeGreaterThan(0);
      expect(["core", "standard", "elite", "unique"]).toContain(unit.class);

      // at least one way to attack, each profile fully specified
      expect(unit.melee || unit.ranged, `${unit.id} profile`).toBeTruthy();
      if (unit.melee) expectProfile(unit, unit.melee);
      if (unit.ranged) {
        expectProfile(unit, unit.ranged);
        expect(unit.ranged.range, `${unit.id} range`).toBeGreaterThan(0);
        if (unit.ranged.ammo !== undefined) {
          expect(isInteger(unit.ranged.ammo), `${unit.id} ammo`).toBe(true);
          expect(unit.ranged.ammo).toBeGreaterThan(0);
        }
      }

      expect(isRank(unit.defensiveSkill), `${unit.id} DS`).toBe(true);
      expect(isRank(unit.defensivePower), `${unit.id} T`).toBe(true);
      expect(unit.courage).toBeGreaterThan(0);
      expect(unit.move).toBeGreaterThan(0);

      each(["green", "yellow", "red"], (band) => {
        const boxes = unit.damage[band];
        expect(isInteger(boxes), `${unit.id} ${band} boxes`).toBe(true);
        expect(boxes).toBeGreaterThanOrEqual(0);
      });
      expect(
        unit.damage.green + unit.damage.yellow + unit.damage.red
      ).toBeGreaterThan(0);
    });
  });

  it("abilities are well-formed and reference real modifiers", () => {
    each(UNITS, (unit) =>
      each(unit.abilities, (ability) => {
        expect(ability.name, `${unit.id} ability name`).toBeTruthy();
        expect(ability.text, `${ability.name} text`).toBeTruthy();
        if (ability.bonus) {
          expect(ability.bonus).toHaveLength(3);
          each(ability.bonus, (value) => expect(isInteger(value)).toBe(true));
        }
        if (ability.when) {
          // a trigger without an effect (or vice versa via `when`) is a typo
          expect(ability.bonus, `${ability.name} when without bonus`).toBeTruthy();
          expect(ability.when.length).toBeGreaterThan(0);
          each(ability.when, (id) =>
            expect(MODIFIERS[id], `${ability.name} references ${id}`).toBeTruthy()
          );
        }
        if (ability.stance) {
          expect(["melee", "ranged"]).toContain(ability.stance);
          expect(ability.bonus, `${ability.name} stance without bonus`).toBeTruthy();
        }
      })
    );
  });

  it("attackProfile picks the stance's profile and falls back to null", () => {
    const pikemen = UNITS_BY_UID["menOfHawkshold/communalPikemen"];
    const bowmen = UNITS_BY_UID["menOfHawkshold/bowmen"];
    expect(attackProfile(pikemen, "melee")).toBe(pikemen.melee);
    expect(attackProfile(pikemen, "ranged")).toBeNull();
    expect(attackProfile(bowmen, "ranged")).toBe(bowmen.ranged);
  });

  it("activeAbilities gates a `when` ability on its modifiers", () => {
    const knights = UNITS_BY_UID["menOfHawkshold/knights"];
    const off = { chargingFourOrMoreDice: { on: false } };
    const on = { chargingThreeOrLessDice: { on: true } };
    expect(activeAbilities(knights, off, "melee")).toHaveLength(0);
    expect(map(activeAbilities(knights, on, "melee"), "name")).toEqual([
      "Cavalry",
    ]);
    expect(activeAbilities(null, on, "melee")).toEqual([]);
  });

  it("activeAbilities gates a `stance` ability on the attack mode", () => {
    const bowmen = UNITS_BY_UID["menOfHawkshold/bowmen"];
    expect(map(activeAbilities(bowmen, {}, "melee"), "name")).toEqual([
      "Engaged",
    ]);
    expect(activeAbilities(bowmen, {}, "ranged")).toHaveLength(0);
  });

  it("prose-only abilities (no bonus) never apply to the calculator", () => {
    const pikemen = UNITS_BY_UID["menOfHawkshold/communalPikemen"];
    const charging = { chargingFourOrMoreDice: { on: true } };
    // Spears is a DS bonus on the card — informational until the app models
    // defender-side state
    expect(activeAbilities(pikemen, charging, "melee")).toHaveLength(0);
  });
});
