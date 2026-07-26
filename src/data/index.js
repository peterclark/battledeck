import { filter, find, flatMap, includes, keyBy, map, some } from "lodash";
import dwarvesOfRunegard from "./factions/dwarvesOfRunegard";
import highElves from "./factions/highElves";
import lizardmen from "./factions/lizardmen";
import menOfHawkshold from "./factions/menOfHawkshold";
import monstersAndMercenaries from "./factions/monstersAndMercenaries";
import orcArmy from "./factions/orcArmy";
import undeadArmy from "./factions/undeadArmy";
import { KEYWORDS } from "./keywords";

export { KEYWORDS };

// All playable factions, in display order. Adding a faction = adding a file
// under ./factions and listing it here.
export const FACTIONS = [
  dwarvesOfRunegard,
  highElves,
  lizardmen,
  menOfHawkshold,
  monstersAndMercenaries,
  orcArmy,
  undeadArmy,
];

// Units flattened across factions. Unit ids only need to be unique within
// their faction; the derived uid is globally unique and is what selection
// state and persistence store.
export const UNITS = flatMap(FACTIONS, (faction) =>
  map(faction.units, (unit) => ({
    ...unit,
    factionId: faction.id,
    factionName: faction.name,
    uid: `${faction.id}/${unit.id}`,
  }))
);

export const UNITS_BY_UID = keyBy(UNITS, "uid");

export const FACTIONS_BY_ID = keyBy(FACTIONS, "id");

// The army-ability box a unit card prints: Hawkshold Bravery, Dwarven Rune
// of Uruz, Lizardmen Fury, High Elf Precision, Mercenary Spoils. All five
// work the same way — spend Command Actions to mark a box, erase the mark
// later for the ability's effect — so the roster tracks them with one
// mechanism. The faction ability that owns the box carries the descriptor:
//
//   box.cost       Command Actions to mark one box
//   box.count      boxes printed on every unit's card (default 1)
//   box.countField a unit field holding that unit's box count instead
//                  (Spoils: each Mercenary card prints its own)
//   box.except     unit ids the ability can't empower (the Antonian
//                  Horsemen's card back rules out Rune of Uruz)
//
// Returns null for units with no box at all.
export const unitBox = (unit) => {
  const ability = find(FACTIONS_BY_ID[unit?.factionId]?.abilities, "box");
  if (!ability || includes(ability.box.except, unit.id)) return null;
  const { box } = ability;
  const max = box.countField ? unit[box.countField] ?? 0 : box.count ?? 1;
  return max > 0 ? { name: ability.name, cost: box.cost, max } : null;
};

// The stat profile a unit attacks with in the given stance, or null if it
// has no attack of that kind
export const attackProfile = (unit, mode) =>
  (mode === "ranged" ? unit.ranged : unit.melee) ?? null;

export const damageBoxes = (unit) =>
  unit.damage.green + unit.damage.yellow + unit.damage.red;

// What it costs in Command Actions to Reanimate a unit (heal one damage),
// set by its Undead classification. Units without one — every non-Undead
// unit, plus the Swarm of Rats — can't be Reanimated at all, so they get
// null rather than a cost.
const REANIMATE_COST = {
  lesserUndead: 1,
  majorUndead: 2,
  greaterUndead: 3,
};

export const reanimateCost = (unit) => {
  const classification = find(unit?.keywords, (id) => REANIMATE_COST[id]);
  return classification ? REANIMATE_COST[classification] : null;
};

// Damage state per the rules: all Green boxes marked = In the Yellow, all
// Green and Yellow marked = In the Red, all boxes marked = destroyed
export const damageStatus = (unit, marked) => {
  const { green, yellow } = unit.damage;
  if (marked >= damageBoxes(unit)) return "destroyed";
  if (marked >= green + yellow) return "red";
  if (marked >= green) return "yellow";
  return "fresh";
};

// A unit's full effect list: its own card-back abilities plus the
// structured effects of its keywords, labeled with the keyword's name
const unitEffects = (unit) => [
  ...(unit?.abilities ?? []),
  ...flatMap(unit?.keywords, (id) =>
    map(KEYWORDS[id]?.effects, (effect) => ({
      name: KEYWORDS[id].name,
      ...effect,
    }))
  ),
];

// Effects that adjust the current attack: only ones with a structured
// `bonus` triple participate. An effect with a `when` list is live while
// any of those modifiers is on; `stance` limits it to an attack mode (the
// archers' Engaged penalty in melee); `whenTarget` requires the selected
// defender to carry one of the listed keywords (Spears vs Cavalry). All
// gates must pass. Prose-only rules are informational and never returned.
export const activeAbilities = (unit, modifiers, attackMode, target) =>
  filter(
    unitEffects(unit),
    (effect) =>
      effect.bonus &&
      (!effect.stance || effect.stance === attackMode) &&
      (!effect.when || some(effect.when, (id) => modifiers[id]?.on)) &&
      (!effect.whenTarget ||
        some(effect.whenTarget, (id) => includes(target?.keywords, id)))
  );
