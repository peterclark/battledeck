import { mapValues } from "lodash";
import { COMMAND_CARD_MODIFIERS, MODIFIERS } from "./constants";
import { UNITS_BY_UID } from "./data";
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

export const DEFAULT_STATE = {
  attackMode: "melee",
  baseDice: 4,
  offensiveSkill: 0,
  offensivePower: 0,
  defensiveSkill: 0,
  defensivePower: 0,
  attackerUid: null,
  defenderUid: null,
  playedCards: [],
  modifiers: MODIFIERS,
};

export const loadState = () => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const stored = JSON.parse(raw);
    return {
      attackMode: stored.attackMode === "ranged" ? "ranged" : "melee",
      baseDice: clampInt(stored.baseDice, 0, MAX_DICE, 4),
      offensiveSkill: clampInt(stored.offensiveSkill, 0, MAX_ROLL - 1, 0),
      offensivePower: clampInt(stored.offensivePower, 0, MAX_ROLL - 1, 0),
      defensiveSkill: clampInt(stored.defensiveSkill, 0, MAX_ROLL - 1, 0),
      defensivePower: clampInt(stored.defensivePower, 0, MAX_ROLL - 1, 0),
      attackerUid: validUid(stored.attackerUid),
      defenderUid: validUid(stored.defenderUid),
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
        playedCards: state.playedCards,
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

// ---- Army roster ----
// The army lives under its own key: it outlives battles, so the calculator
// reset must never touch it.
const ARMY_KEY = "battledeck-army-v1";

// Copies of one unit an army can field (UI sanity cap; Unique units are
// further capped at 1 per the Unique keyword)
export const MAX_COPIES = 9;
export const BUDGET_MIN = 500;
export const BUDGET_MAX = 5000;

export const DEFAULT_ARMY = { budget: 2000, counts: {} };

const maxCopies = (unit) =>
  unit.keywords?.includes("unique") ? 1 : MAX_COPIES;

export const loadArmy = () => {
  try {
    const raw = localStorage.getItem(ARMY_KEY);
    if (!raw) return DEFAULT_ARMY;
    const stored = JSON.parse(raw);
    // keep only counts for units that still exist, clamped to their cap
    const counts = {};
    for (const [uid, n] of Object.entries(stored.counts ?? {})) {
      const unit = UNITS_BY_UID[uid];
      if (!unit || !Number.isInteger(n) || n < 1) continue;
      counts[uid] = Math.min(n, maxCopies(unit));
    }
    return {
      budget: clampInt(stored.budget, BUDGET_MIN, BUDGET_MAX, 2000),
      counts,
    };
  } catch {
    return DEFAULT_ARMY;
  }
};

export const saveArmy = (army) => {
  try {
    localStorage.setItem(ARMY_KEY, JSON.stringify(army));
  } catch {
    // storage unavailable — the roster just won't persist
  }
};
