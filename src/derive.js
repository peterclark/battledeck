import { pickBy, reduce, values } from "lodash";

export const MAX_DICE = 20;
export const MAX_ROLL = 10;

// Sum the [dice, offensiveSkill, offensivePower] triples of every modifier
// that is on. Stacking modifiers (maxCount) multiply their triple by count.
export const sumModifiers = (modifiers) => {
  const modsOn = values(pickBy(modifiers, (mod) => mod.on));
  return reduce(
    modsOn,
    (sums, { modifier, count }) => {
      const stack = count ?? 1;
      return [
        sums[0] + modifier[0] * stack,
        sums[1] + modifier[1] * stack,
        sums[2] + modifier[2] * stack,
      ];
    },
    [0, 0, 0]
  );
};

// Sum an array of [dice, offensiveSkill, offensivePower] triples — used for
// the Command Cards played this attack
export const sumTriples = (triples) =>
  reduce(
    triples,
    (sums, t) => [sums[0] + t[0], sums[1] + t[1], sums[2] + t[2]],
    [0, 0, 0]
  );

// Dice to roll, clamped to [0, MAX_DICE]
export const deriveDice = (baseDice, commandCardDice, diceModifier) =>
  Math.min(Math.max(baseDice + commandCardDice + diceModifier, 0), MAX_DICE);

// Roll to hit / roll to wound: clamped to [1, 5] (1 always hits, 6 always
// misses). Points above 5 trigger Overkill — each one turns a rolled 6
// into a 5.
export const deriveRoll = (total) => ({
  value: Math.max(Math.min(total, 5), 1),
  overkill: Math.max(total - 5, 0),
});
