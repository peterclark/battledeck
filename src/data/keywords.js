// Unit Keywords — shared rules transcribed from the Unit Keywords cards.
// A unit lists these by id in its `keywords` array; the keyword's rules
// text is shown in the picker and its structured `effects` feed the
// calculator. This mirrors the physical cards: the keyword card holds the
// shared rule, a unit card's back holds that unit's extras (stored as the
// unit's own `abilities`).
//
// Effect shape matches unit abilities — { code, text, bonus, when, stance }
// — plus `whenTarget`: a list of keyword ids that makes the effect live
// while the selected DEFENDER has any of them (e.g. Spears vs Cavalry).
// Rules the calculator can't model (Impact Hits, Holding, courage buffs,
// dice rerolls) stay in the prose only.
export const KEYWORDS = {
  spears: {
    id: "spears",
    name: "Spears",
    text:
      "Engaged attacks: (-1) -0/-0 when Charging; (+0) +1/+0 when " +
      "attacking Cavalry, Large, or Colossal units; (+0) +0/+2 when " +
      "Holding and attacking Charging Cavalry, Large, or Colossal units.",
    effects: [
      {
        code: "SP",
        bonus: [-1, 0, 0],
        when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
        stance: "melee",
      },
      {
        code: "SP",
        bonus: [0, 1, 0],
        whenTarget: ["cavalry", "large", "colossal"],
        stance: "melee",
      },
      // "+0/+2 when Holding vs charging Cavalry/Large/Colossal" needs a
      // Holding state the app doesn't track — prose only for now
    ],
  },
  cavalry: {
    id: "cavalry",
    name: "Cavalry",
    text:
      "When Charging, this unit gets 1 Impact Hit. It may get additional " +
      "modifiers when Charging (see the back of the unit card). Ranged " +
      "attacks against this unit get (-0) -1/-0 — the Cavalry Target " +
      "modifier.",
    // The ranged -1 OS against cavalry is the existing Cavalry Target
    // situational modifier, left as a manual toggle to avoid counting it
    // twice; Impact Hits are automatic hits outside the dice math.
  },
  fellingBlow: {
    id: "fellingBlow",
    name: "Felling Blow",
    text:
      "After rolling to wound, you can erase the Bravery box to roll an " +
      "extra die for each die that shows a 1 (further 1s do nothing). " +
      "This counts as playing a Command Card.",
  },
  unique: {
    id: "unique",
    name: "Unique",
    text:
      "You may only have one of each type of Unique unit in your army " +
      "(multiple different Unique units are fine). In all other ways " +
      "Unique units are treated as Elite units.",
  },
  terrifying: {
    id: "terrifying",
    name: "Terrifying",
    text:
      "A unit charged by a Terrifying unit takes -1 Courage on its checks " +
      "(see the rulebook's fear rules).",
  },
  fearsome: {
    id: "fearsome",
    name: "Fearsome",
    text: "Causes Fear Checks — see the rulebook's fear rules.",
  },
  // The Undead classifications set what it costs to Reanimate the unit —
  // see the Undead army ability
  lesserUndead: {
    id: "lesserUndead",
    name: "Lesser Undead",
    text: "Costs 1 Command Action to Reanimate.",
  },
  majorUndead: {
    id: "majorUndead",
    name: "Major Undead",
    text: "Costs 2 Command Actions to Reanimate.",
  },
  greaterUndead: {
    id: "greaterUndead",
    name: "Greater Undead",
    text: "Costs 3 Command Actions to Reanimate.",
  },
  stupid: {
    id: "stupid",
    name: "Stupid",
    text:
      "Changing Standing Orders, taking Direct Control, or Rallying this " +
      "unit costs two Command Actions rather than one.",
  },
  flying: {
    id: "flying",
    name: "Flying",
    text:
      "Moves by flight using its Flying movement value (see the rulebook's " +
      "flying rules).",
  },
  wheeled: {
    id: "wheeled",
    name: "Wheeled",
    text:
      "A vehicle that relies on flat, unobstructed ground. Wheeled units " +
      "take different movement modifiers from other units in most terrain " +
      "— worse in rough going, better on roads.",
    // Terrain and movement only, so nothing here feeds the attack math.
  },
  // Size keywords referenced by Spears' whenTarget — carried by the
  // Monsters & Mercenaries units
  large: {
    id: "large",
    name: "Large",
    text: "Attacks against this unit get the Large Target modifier (+1 OS).",
  },
  colossal: {
    id: "colossal",
    name: "Colossal",
    text:
      "Attacks against this unit get the Colossal Target modifier (+2 OS).",
  },
};
