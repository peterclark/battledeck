import { mapValues } from "lodash";
import { COMMAND_CARD_MODIFIERS, MODIFIERS } from "./constants";
import { FACTIONS_BY_ID, UNITS_BY_UID, damageBoxes, unitBox } from "./data";
import { MAX_DICE, MAX_ROLL } from "./derive";

const CARD_IDS = new Set(COMMAND_CARD_MODIFIERS.map((card) => card.id));
const MAX_PLAYED_CARDS = 30;

// Persist the whole calculator to localStorage so mid-game state survives a
// reload or a mobile browser evicting the tab. Only the dynamic bits of each
// modifier (on/count) are stored; on load they're re-hydrated onto the
// current MODIFIERS defaults, so schema changes and stale ids can't break
// the grid.
const KEY = "battledeck-state-v1";

const clampInt = (value, min, max, fallback) =>
  Number.isInteger(value) && value >= min && value <= max ? value : fallback;

// Unit selections survive reloads only while the unit still exists in the
// data files — a renamed or removed unit falls back to no selection
const validUid = (uid) => (UNITS_BY_UID[uid] ? uid : null);

const validFaction = (id) => (FACTIONS_BY_ID[id] ? id : null);

export const DEFAULT_STATE = {
  attackMode: "melee",
  baseDice: 4,
  offensiveSkill: 0,
  offensivePower: 0,
  defensiveSkill: 0,
  defensivePower: 0,
  attackerUid: null,
  defenderUid: null,
  attackerCopy: null,
  defenderCopy: null,
  // which roster ("mine" | "enemy") each slot's copy came from; only
  // meaningful while the matching copy is set
  attackerArmy: null,
  defenderArmy: null,
  ammoSpent: {},
  playedCards: [],
  // Which faction the unit picker was last browsing, per slot, so
  // reopening it lands where the player left off; null means its faction
  // list. Kept per slot because the defender is often an enemy from a
  // different faction than the attacker.
  pickerFaction: { attacker: null, defender: null },
  modifiers: MODIFIERS,
};

// Ammo tallies are keyed by `${uid}#${copy}`, with an `enemy:` prefix for
// enemy copies — keep only entries whose unit still exists and whose count
// is a sane positive integer
const validAmmoSpent = (stored) =>
  Object.fromEntries(
    Object.entries(stored ?? {}).filter(([key, n]) => {
      const uid = key.replace(/^enemy:/, "").split("#")[0];
      return UNITS_BY_UID[uid] && Number.isInteger(n) && n > 0 && n <= 20;
    })
  );

// A slot's army copy index is only meaningful while that unit is still in
// its roster with at least copy+1 fielded
const validCopy = (uid, copy, side) => {
  if (uid === null || !Number.isInteger(copy) || copy < 0) return null;
  const counts = loadArmy(side).counts;
  return copy < (counts[uid] ?? 0) ? copy : null;
};

// Which roster a slot's copy belongs to. Older stored state predates the
// enemy roster, so anything unrecognised reads as the player's own army.
const validSide = (side) => (side === "enemy" ? "enemy" : "mine");

// A slot's copy and its roster stand or fall together
const validSlot = (uid, copy, side) => {
  const resolved = validSide(side);
  const valid = validCopy(validUid(uid), copy, resolved);
  return { copy: valid, side: valid === null ? null : resolved };
};

export const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const stored = JSON.parse(raw);
    const attackerSlot = validSlot(
      stored.attackerUid,
      stored.attackerCopy,
      stored.attackerArmy
    );
    const defenderSlot = validSlot(
      stored.defenderUid,
      stored.defenderCopy,
      stored.defenderArmy
    );
    return {
      attackMode: stored.attackMode === "ranged" ? "ranged" : "melee",
      baseDice: clampInt(stored.baseDice, 0, MAX_DICE, 4),
      offensiveSkill: clampInt(stored.offensiveSkill, 0, MAX_ROLL - 1, 0),
      offensivePower: clampInt(stored.offensivePower, 0, MAX_ROLL - 1, 0),
      defensiveSkill: clampInt(stored.defensiveSkill, 0, MAX_ROLL - 1, 0),
      defensivePower: clampInt(stored.defensivePower, 0, MAX_ROLL - 1, 0),
      attackerUid: validUid(stored.attackerUid),
      defenderUid: validUid(stored.defenderUid),
      attackerCopy: attackerSlot.copy,
      defenderCopy: defenderSlot.copy,
      attackerArmy: attackerSlot.side,
      defenderArmy: defenderSlot.side,
      ammoSpent: validAmmoSpent(stored.ammoSpent),
      // a faction that has since been renamed or removed falls back to
      // the picker's faction list, as does the pre-per-slot shape
      pickerFaction: {
        attacker: validFaction(stored.pickerFaction?.attacker),
        defender: validFaction(stored.pickerFaction?.defender),
      },
      playedCards: (Array.isArray(stored.playedCards) ? stored.playedCards : [])
        .filter((id) => CARD_IDS.has(id))
        .slice(0, MAX_PLAYED_CARDS),
      modifiers: mapValues(MODIFIERS, (mod, id) => {
        const saved = stored.modifiers?.[id];
        if (!saved || id === "reset") return mod;
        if (mod.maxCount) {
          const count = clampInt(saved.count, 0, mod.maxCount, 0);
          return { ...mod, count, on: count > 0 };
        }
        return { ...mod, on: saved.on === true };
      }),
    };
  } catch {
    // corrupt or unavailable storage — start fresh
    return DEFAULT_STATE;
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        attackMode: state.attackMode,
        baseDice: state.baseDice,
        offensiveSkill: state.offensiveSkill,
        offensivePower: state.offensivePower,
        defensiveSkill: state.defensiveSkill,
        defensivePower: state.defensivePower,
        attackerUid: state.attackerUid,
        defenderUid: state.defenderUid,
        attackerCopy: state.attackerCopy,
        defenderCopy: state.defenderCopy,
        attackerArmy: state.attackerArmy,
        defenderArmy: state.defenderArmy,
        ammoSpent: state.ammoSpent,
        playedCards: state.playedCards,
        pickerFaction: state.pickerFaction,
        modifiers: mapValues(state.modifiers, ({ on, count }) =>
          count === undefined ? { on } : { on, count }
        ),
      })
    );
  } catch {
    // storage unavailable (private mode, quota) — state just won't persist
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // storage unavailable — nothing to clear
  }
};

// ---- Army rosters ----
// The armies live under their own keys: they outlive battles, so the
// calculator reset must never touch them. The player's own roster and the
// enemy's are the same record shape — the enemy's exists so the defender
// picker and battle screen can work the opposing list without hunting
// through every unit in the game.
const ARMY_KEYS = {
  mine: "battledeck-army-v1",
  enemy: "battledeck-enemy-v1",
};

export const ARMY_SIDES = ["mine", "enemy"];

// Copies of one unit an army can field (UI sanity cap; Unique units are
// further capped at 1 per the Unique keyword)
export const MAX_COPIES = 9;
export const BUDGET_MIN = 500;
export const BUDGET_MAX = 5000;

export const DEFAULT_ARMY = {
  budget: 2000,
  counts: {},
  marks: {},
  // which fielded copies have already been Reanimated this turn (a unit
  // may only be Reanimated once per turn); cleared by the New turn button
  reanimated: {},
  // army-ability boxes marked per fielded copy (Bravery, Fury, Rune of
  // Uruz, Precision, Spoils). These outlive the turn — a mark sits on the
  // card until it's erased for its effect.
  boxes: {},
  // how many of those marks were made *this* turn, so the Command Action
  // tally can price them and erasing a fresh mistake hands the Command
  // Actions back; cleared by the New turn button
  boxesThisTurn: {},
  // which fielded copies are Lashed this turn (Orc army ability: +1
  // Movement and +1 die for the turn, once per unit per turn); cleared by
  // the New turn button
  lashed: {},
  // which faction the builder was last browsing, so reopening it lands
  // where the player left off; null means its faction list
  faction: null,
};

const maxCopies = (unit) =>
  unit.keywords?.includes("unique") ? 1 : MAX_COPIES;

export const loadArmy = (side = "mine") => {
  try {
    const raw = localStorage.getItem(ARMY_KEYS[side]);
    if (!raw) return DEFAULT_ARMY;
    const stored = JSON.parse(raw);
    // keep only counts for units that still exist, clamped to their cap
    const counts = {};
    const marks = {};
    const reanimated = {};
    const boxes = {};
    const boxesThisTurn = {};
    const lashed = {};
    for (const [uid, n] of Object.entries(stored.counts ?? {})) {
      const unit = UNITS_BY_UID[uid];
      if (!unit || !Number.isInteger(n) || n < 1) continue;
      counts[uid] = Math.min(n, maxCopies(unit));
      // one damage tally per fielded copy, clamped to the card's boxes
      const saved = Array.isArray(stored.marks?.[uid]) ? stored.marks[uid] : [];
      marks[uid] = Array.from({ length: counts[uid] }, (_, copy) =>
        Number.isInteger(saved[copy])
          ? Math.min(Math.max(saved[copy], 0), damageBoxes(unit))
          : 0
      );
      const savedTurn = Array.isArray(stored.reanimated?.[uid])
        ? stored.reanimated[uid]
        : [];
      reanimated[uid] = Array.from(
        { length: counts[uid] },
        (_, copy) => savedTurn[copy] === true
      );
      const savedLash = Array.isArray(stored.lashed?.[uid])
        ? stored.lashed[uid]
        : [];
      lashed[uid] = Array.from(
        { length: counts[uid] },
        (_, copy) => savedLash[copy] === true
      );
      // box marks, clamped to the boxes this unit's card actually prints —
      // a unit whose faction has no box ability keeps none
      const max = unitBox(unit)?.max ?? 0;
      const savedBoxes = Array.isArray(stored.boxes?.[uid])
        ? stored.boxes[uid]
        : [];
      boxes[uid] = Array.from({ length: counts[uid] }, (_, copy) =>
        Number.isInteger(savedBoxes[copy])
          ? Math.min(Math.max(savedBoxes[copy], 0), max)
          : 0
      );
      // marks made this turn can never exceed the marks actually standing
      const savedFresh = Array.isArray(stored.boxesThisTurn?.[uid])
        ? stored.boxesThisTurn[uid]
        : [];
      boxesThisTurn[uid] = Array.from({ length: counts[uid] }, (_, copy) =>
        Number.isInteger(savedFresh[copy])
          ? Math.min(Math.max(savedFresh[copy], 0), boxes[uid][copy])
          : 0
      );
    }
    return {
      budget: clampInt(stored.budget, BUDGET_MIN, BUDGET_MAX, 2000),
      counts,
      marks,
      reanimated,
      boxes,
      boxesThisTurn,
      lashed,
      faction: validFaction(stored.faction),
    };
  } catch {
    return DEFAULT_ARMY;
  }
};

export const saveArmy = (army, side = "mine") => {
  try {
    localStorage.setItem(ARMY_KEYS[side], JSON.stringify(army));
  } catch {
    // storage unavailable — the roster just won't persist
  }
};

export const loadArmies = () => ({
  mine: loadArmy("mine"),
  enemy: loadArmy("enemy"),
});
