import { filter, find, flatMap, includes, keyBy, map, some } from "lodash";
import dwarvesOfRunegard from "./factions/dwarvesOfRunegard";
import elvesOfRavenwood from "./factions/elvesOfRavenwood";
import highElves from "./factions/highElves";
import lizardmen from "./factions/lizardmen";
import menOfHawkshold from "./factions/menOfHawkshold";
import monstersAndMercenaries from "./factions/monstersAndMercenaries";
import orcArmy from "./factions/orcArmy";
import undeadArmy from "./factions/undeadArmy";
import wuxing from "./factions/wuxing";
import { KEYWORDS } from "./keywords";

export { KEYWORDS };

// All playable factions, in display order. Adding a faction = adding a file
// under ./factions and listing it here.
export const FACTIONS = [
  dwarvesOfRunegard,
  elvesOfRavenwood,
  highElves,
  lizardmen,
  menOfHawkshold,
  monstersAndMercenaries,
  orcArmy,
  undeadArmy,
  wuxing,
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
//   box.effect     optional attack effect that is live while the copy has
//                  a mark standing (Uruz's (+1) +0/+0 while Engaged); the
//                  other box abilities work outside the dice math and
//                  carry none
//
// Returns null for units with no box at all.
export const unitBox = (unit) => {
  const ability = find(FACTIONS_BY_ID[unit?.factionId]?.abilities, "box");
  if (!ability || includes(ability.box.except, unit.id)) return null;
  const { box } = ability;
  const max = box.countField ? unit[box.countField] ?? 0 : box.count ?? 1;
  return max > 0
    ? { name: ability.name, cost: box.cost, max, effect: box.effect ?? null }
    : null;
};

// A turn-scoped empowerment the faction can buy per copy — the Orc Lash.
// Unlike a box it marks nothing on the card: it lasts the turn and clears
// with it, Reanimate-shaped. The owning ability carries the descriptor:
//
//   turn.cost    Command Actions per use
//   turn.except  unit ids that can't receive it (Crazed Goblins may not
//                be Lashed)
//   turn.effect  attack effect live while the copy is empowered
export const unitTurnBuff = (unit) => {
  const ability = find(FACTIONS_BY_ID[unit?.factionId]?.abilities, "turn");
  if (!ability || includes(ability.turn.except, unit.id)) return null;
  return {
    name: ability.name,
    cost: ability.turn.cost,
    effect: ability.turn.effect ?? null,
  };
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

// Faction-ability effects gated on the attacking copy's roster state: the
// Uruz box while a mark is standing, Lash while the copy is empowered
// this turn. A unit picked outside both armies has no copy state, so
// neither fires.
const copyStateEffects = (unit, { boxed = 0, lashed = false } = {}) => {
  const box = unitBox(unit);
  const buff = unitTurnBuff(unit);
  return [
    ...(box?.effect && boxed > 0 ? [{ name: box.name, ...box.effect }] : []),
    ...(buff?.effect && lashed ? [{ name: buff.name, ...buff.effect }] : []),
  ];
};

// Effects that adjust the current attack: only ones with a structured
// `bonus` triple participate. An effect with a `when` list is live while
// any of those modifiers is on; `whenNot` is the inverse — live only
// while every listed modifier is off, which is how "at Short Range"
// rules are expressed (the range bands are exhaustive, so short range is
// neither Long nor Extreme). `stance` limits an effect to an attack mode
// (the archers' Engaged penalty in melee); `whenTarget` requires the
// selected defender to carry one of the listed keywords (Spears vs
// Cavalry). `copyState` carries the selected copy's roster state for the
// faction-ability effects above. All gates must pass. Prose-only rules
// are informational and never returned.
export const activeAbilities = (unit, modifiers, attackMode, target, copyState) =>
  filter(
    [...unitEffects(unit), ...copyStateEffects(unit, copyState)],
    (effect) =>
      effect.bonus &&
      (!effect.stance || effect.stance === attackMode) &&
      (!effect.when || some(effect.when, (id) => modifiers[id]?.on)) &&
      (!effect.whenNot || !some(effect.whenNot, (id) => modifiers[id]?.on)) &&
      (!effect.whenTarget ||
        some(effect.whenTarget, (id) => includes(target?.keywords, id)))
  );
