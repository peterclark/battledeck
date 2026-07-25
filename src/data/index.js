import { filter, flatMap, includes, keyBy, map, some } from "lodash";
import menOfHawkshold from "./factions/menOfHawkshold";
import { KEYWORDS } from "./keywords";

export { KEYWORDS };

// All playable factions, in display order. Adding a faction = adding a file
// under ./factions and listing it here.
export const FACTIONS = [menOfHawkshold];

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

// The stat profile a unit attacks with in the given stance, or null if it
// has no attack of that kind
export const attackProfile = (unit, mode) =>
  (mode === "ranged" ? unit.ranged : unit.melee) ?? null;

export const damageBoxes = (unit) =>
  unit.damage.green + unit.damage.yellow + unit.damage.red;

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
