import { filter, flatMap, keyBy, map, some } from "lodash";
import menOfHawkshold from "./factions/menOfHawkshold";

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

// Card abilities that adjust the current attack: only abilities with a
// structured `bonus` triple participate. An ability with a `when` list is
// live while any of those modifiers is on; one with a `stance` is live only
// in that attack mode (e.g. the archers' Engaged penalty in melee). No
// `when` and no `stance` means always live. Prose-only abilities are
// informational and never returned here.
export const activeAbilities = (unit, modifiers, attackMode) =>
  filter(
    unit?.abilities,
    (ability) =>
      ability.bonus &&
      (!ability.stance || ability.stance === attackMode) &&
      (!ability.when || some(ability.when, (id) => modifiers[id]?.on))
  );
