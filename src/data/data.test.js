import { describe, expect, it } from "vitest";
import { each, isInteger, keys, map, uniq, values } from "lodash";
import {
  FACTIONS,
  KEYWORDS,
  UNITS,
  UNITS_BY_UID,
  activeAbilities,
  attackProfile,
  damageStatus,
  reanimateCost,
  unitBox,
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
      each(faction.abilities, (ability) => {
        expect(ability.name, `${faction.id} army ability`).toBeTruthy();
        expect(ability.text, `${ability.name} text`).toBeTruthy();
      });
    });
  });

  it("an Engaged effect can be a bonus, not just the archer's penalty", () => {
    // Orc Crossbowmen drop the crossbow for a greatsword in melee, and
    // High Elf Bowriders shoot from the saddle — both gain rather than lose
    const crossbows = UNITS_BY_UID["orcArmy/orcCrossbowmen"];
    expect(map(activeAbilities(crossbows, {}, "melee"), "bonus")).toEqual([
      [2, 0, 1],
    ]);
    expect(activeAbilities(crossbows, {}, "ranged")).toHaveLength(0);
    expect(
      map(activeAbilities(UNITS_BY_UID["highElves/highElfBowriders"], {}, "melee"), "bonus")
    ).toEqual([[1, 0, 0]]);
    // while the plain archers still take theirs
    expect(
      map(activeAbilities(UNITS_BY_UID["highElves/highElfArchers"], {}, "melee"), "bonus")
    ).toEqual([[0, -2, -2]]);
  });

  it("a track with no yellow band goes straight from fresh to the red", () => {
    // the Trolls card prints seven green boxes running into seven red,
    // with no yellow between them
    const trolls = UNITS_BY_UID["orcArmy/trolls"];
    expect(trolls.damage.yellow).toBe(0);
    expect(damageStatus(trolls, 0)).toBe("fresh");
    expect(damageStatus(trolls, 6)).toBe("fresh");
    expect(damageStatus(trolls, 7)).toBe("red"); // never "yellow"
    expect(damageStatus(trolls, 13)).toBe("red");
    expect(damageStatus(trolls, 14)).toBe("destroyed");
  });

  it("army-ability box descriptors are well-formed", () => {
    each(FACTIONS, (faction) =>
      each(faction.abilities, (ability) => {
        if (!ability.box) return;
        const { cost, count, countField, except } = ability.box;
        expect(isInteger(cost), `${ability.name} box cost`).toBe(true);
        expect(cost).toBeGreaterThan(0);
        if (count !== undefined) expect(count).toBeGreaterThan(0);
        // a fixed count and a per-unit field would contradict each other
        expect(count === undefined || countField === undefined).toBe(true);
        // an `except` id that no longer names a unit would silently stop
        // excluding anything
        each(except, (id) =>
          expect(
            map(faction.units, "id"),
            `${ability.name} excludes ${id}`
          ).toContain(id)
        );
      })
    );
  });

  it("unitBox reads the faction's box ability, or null when there is none", () => {
    // one box on every card, the common shape
    expect(unitBox(UNITS_BY_UID["menOfHawkshold/swordsmen"])).toEqual({
      name: "Bravery",
      cost: 1,
      max: 1,
    });
    expect(unitBox(UNITS_BY_UID["highElves/celestialGuard"]).name).toBe(
      "Precision"
    );
    expect(unitBox(UNITS_BY_UID["lizardmen/trogWarriors"]).name).toBe("Fury");
    // Spoils counts the boxes printed on the individual card
    expect(unitBox(UNITS_BY_UID["monstersAndMercenaries/elementalist"])).toEqual(
      { name: "Spoils", cost: 1, max: 2 }
    );
    expect(unitBox(UNITS_BY_UID["monstersAndMercenaries/ogres"]).max).toBe(1);
    // a Mercenary card with no Spoils boxes has nothing to mark
    expect(unitBox(UNITS_BY_UID["monstersAndMercenaries/ancientRedDragon"]))
      .toBeNull();
    // the Antonian Horsemen's card back rules out Rune of Uruz
    expect(unitBox(UNITS_BY_UID["dwarvesOfRunegard/antonianHorsemen"])).toBeNull();
    expect(unitBox(UNITS_BY_UID["dwarvesOfRunegard/dwarvenAxemen"]).name).toBe(
      "Rune of Uruz"
    );
    // the Undead army ability is Reanimate, which marks no box
    expect(unitBox(UNITS_BY_UID["undeadArmy/zombies"])).toBeNull();
    expect(unitBox(null)).toBeNull();
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
      // some early-print cards carry no deck class
      if (unit.class !== undefined) {
        expect(["core", "standard", "elite", "unique"]).toContain(unit.class);
      }

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
      // courage is optional — some monsters auto-pass all Courage Checks
      if (unit.courage !== undefined) expect(unit.courage).toBeGreaterThan(0);
      expect(unit.move).toBeGreaterThan(0);
      if (unit.fly !== undefined) expect(unit.fly).toBeGreaterThan(0);
      if (unit.spoils !== undefined) {
        expect(isInteger(unit.spoils), `${unit.id} spoils`).toBe(true);
        expect(unit.spoils).toBeGreaterThan(0);
      }

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

  it("keyword references and keyword effects are well-formed", () => {
    each(UNITS, (unit) =>
      each(unit.keywords, (id) =>
        expect(KEYWORDS[id], `${unit.id} references keyword ${id}`).toBeTruthy()
      )
    );
    each(values(KEYWORDS), (keyword) => {
      expect(keyword.name).toBeTruthy();
      expect(keyword.text).toBeTruthy();
      each(keyword.effects, (effect) => {
        expect(effect.bonus, `${keyword.id} effect bonus`).toHaveLength(3);
        each(effect.bonus, (value) => expect(isInteger(value)).toBe(true));
        if (effect.when) {
          each(effect.when, (id) =>
            expect(MODIFIERS[id], `${keyword.id} references ${id}`).toBeTruthy()
          );
        }
        if (effect.whenTarget) {
          each(effect.whenTarget, (id) =>
            expect(KEYWORDS[id], `${keyword.id} targets ${id}`).toBeTruthy()
          );
        }
        if (effect.stance) {
          expect(["melee", "ranged"]).toContain(effect.stance);
        }
      });
    });
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

  it("reanimateCost follows the Undead classification tiers", () => {
    const cost = (uid) => reanimateCost(UNITS_BY_UID[uid]);
    expect(cost("undeadArmy/zombies")).toBe(1); // Lesser
    expect(cost("undeadArmy/zombieTrolls")).toBe(2); // Major
    expect(cost("undeadArmy/deathKnights")).toBe(3); // Greater
    // no classification line on its card, so it can never be Reanimated
    expect(cost("undeadArmy/swarmOfRats")).toBeNull();
    // and neither can anything outside the Undead
    expect(cost("menOfHawkshold/swordsmen")).toBeNull();
    expect(reanimateCost(null)).toBeNull();
  });

  it("Blood Frenzy needs a damaged foe and a melee stance", () => {
    const trogs = UNITS_BY_UID["lizardmen/trogWarriors"];
    const on = { targetDamaged: { on: true } };
    expect(map(activeAbilities(trogs, on, "melee"), "bonus")).toEqual([
      [1, 0, 0],
    ]);
    // foe still in the green, or the attack is at range: no frenzy
    expect(activeAbilities(trogs, { targetDamaged: { on: false } }, "melee"))
      .toHaveLength(0);
    expect(activeAbilities(trogs, on, "ranged")).toHaveLength(0);
    // the wild beasts never had it
    expect(
      activeAbilities(UNITS_BY_UID["lizardmen/tyrannosaurusRex"], on, "melee")
    ).toHaveLength(0);
  });

  it("keywords work across factions (Spears vs Dwarven allied cavalry)", () => {
    const pikemen = UNITS_BY_UID["menOfHawkshold/communalPikemen"];
    const horsemen = UNITS_BY_UID["dwarvesOfRunegard/antonianHorsemen"];
    expect(
      map(activeAbilities(pikemen, {}, "melee", horsemen), "bonus")
    ).toEqual([[0, 1, 0]]);
  });

  it("Spears: -1 die while Charging, +1 OS against Cavalry targets", () => {
    const pikemen = UNITS_BY_UID["menOfHawkshold/communalPikemen"];
    const lancers = UNITS_BY_UID["menOfHawkshold/lancers"];
    const charging = { chargingFourOrMoreDice: { on: true } };
    expect(map(activeAbilities(pikemen, charging, "melee"), "bonus")).toEqual([
      [-1, 0, 0],
    ]);
    expect(
      map(activeAbilities(pikemen, {}, "melee", lancers), "bonus")
    ).toEqual([[0, 1, 0]]);
    // no defender selected (or a non-cavalry one) -> no target bonus, and
    // the card-back DS note stays prose-only
    expect(activeAbilities(pikemen, {}, "melee")).toHaveLength(0);
    expect(activeAbilities(pikemen, {}, "melee", pikemen)).toHaveLength(0);
  });
});
