import { map, sum } from "lodash";
import { UNITS_BY_UID, reanimateCost, unitBox } from "./data";

// Pure operations on the army record ({ counts, marks, reanimated, boxes,
// boxesThisTurn, … }). The army builder edits the roster through these,
// and the battle screen uses the same ones for the selected copies'
// damage rows — so the marking, Reanimate, and box rules can't drift
// between the two screens. Each returns a new record.

const setTrack = (tracks, uid, copy, value) => {
  const track = [...(tracks[uid] ?? [])];
  track[copy] = value;
  return { ...tracks, [uid]: track };
};

const dropLast = (tracks, uid) => {
  const next = { ...tracks, [uid]: (tracks[uid] ?? []).slice(0, -1) };
  if (!next[uid].length) delete next[uid];
  return next;
};

// A fresh copy joins with an unmarked damage track, no box marks, and no
// Reanimate lock
export const withCopyAdded = (army, uid) => ({
  ...army,
  counts: { ...army.counts, [uid]: (army.counts[uid] ?? 0) + 1 },
  marks: { ...army.marks, [uid]: [...(army.marks[uid] ?? []), 0] },
  reanimated: {
    ...army.reanimated,
    [uid]: [...(army.reanimated[uid] ?? []), false],
  },
  boxes: { ...army.boxes, [uid]: [...(army.boxes[uid] ?? []), 0] },
  boxesThisTurn: {
    ...army.boxesThisTurn,
    [uid]: [...(army.boxesThisTurn[uid] ?? []), 0],
  },
});

// The last-listed copy leaves, taking its damage, box marks, and
// Reanimate lock with it
export const withCopyRemoved = (army, uid) => {
  const counts = { ...army.counts };
  if (counts[uid] > 1) counts[uid] -= 1;
  else delete counts[uid];
  return {
    ...army,
    counts,
    marks: dropLast(army.marks, uid),
    reanimated: dropLast(army.reanimated, uid),
    boxes: dropLast(army.boxes, uid),
    boxesThisTurn: dropLast(army.boxesThisTurn, uid),
  };
};

export const withDamage = (army, uid, copy, value) => ({
  ...army,
  marks: setTrack(army.marks, uid, copy, value),
});

// Reanimate: heal one damage and lock this copy until the next turn
export const withReanimate = (army, uid, copy) => ({
  ...army,
  marks: setTrack(
    army.marks,
    uid,
    copy,
    Math.max((army.marks[uid]?.[copy] ?? 0) - 1, 0)
  ),
  reanimated: setTrack(army.reanimated, uid, copy, true),
});

// Army-ability boxes: cycle a copy's marks 0 → 1 → … → max → 0. Marking
// costs Command Actions, so it tallies against this turn's allowance;
// erasing hands back only what was paid this turn, since a mark carried
// over from an earlier turn was paid for then.
export const withBoxCycle = (army, uid, copy) => {
  const { max } = unitBox(UNITS_BY_UID[uid]);
  const current = army.boxes[uid]?.[copy] ?? 0;
  const next = current >= max ? 0 : current + 1;
  const fresh = army.boxesThisTurn[uid]?.[copy] ?? 0;
  return {
    ...army,
    boxes: setTrack(army.boxes, uid, copy, next),
    boxesThisTurn: setTrack(
      army.boxesThisTurn,
      uid,
      copy,
      next > current ? fresh + 1 : Math.min(fresh, next)
    ),
  };
};

// A new turn releases the Reanimate locks and forgets what this turn
// paid; box marks stay on the cards until erased for their effect
export const withNewTurn = (army) => ({
  ...army,
  reanimated: {},
  boxesThisTurn: {},
});

export const withCleared = (army) => ({
  ...army,
  counts: {},
  marks: {},
  reanimated: {},
  boxes: {},
  boxesThisTurn: {},
});

// Command Actions spent so far this turn. Reanimating and marking boxes
// draw on the same per-turn pool, so they're tallied together.
export const turnSpend = (army) =>
  sum(
    map(army.reanimated, (track, uid) =>
      sum(map(track, (done) => (done ? reanimateCost(UNITS_BY_UID[uid]) : 0)))
    )
  ) +
  sum(
    map(army.boxesThisTurn, (track, uid) =>
      sum(map(track, (n) => (n ?? 0) * (unitBox(UNITS_BY_UID[uid])?.cost ?? 0)))
    )
  );
