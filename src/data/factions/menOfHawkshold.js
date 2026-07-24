// Men of Hawkshold unit cards, transcribed from the physical cards.
// Front of card: stat bar and the green/yellow/red damage track. Back of
// card: point cost, deck class, and ability rules text.
//
// Stat bar reading order (confirmed by the Knights card back, whose
// Cavalry rule shows a sword-icon attack bonus and a shield-icon defense
// bonus): sword group = (attack dice) OS/OP, shield group = DS/Toughness,
// then bow range, courage, movement.
//
// Unit shape:
//   melee / ranged — attack profiles as { dice, offensiveSkill,
//     offensivePower } (ranged adds `range` in inches and `ammo` arrow
//     counters); null when the unit has no attack of that kind. Archer
//     cards print one stat line used by both stances — their melee malus
//     is the stance-gated Engaged ability below.
//   defensiveSkill / defensivePower — DS and Toughness, applied whenever
//     the unit is the target
//   damage — count of green/yellow/red boxes on the card's damage track
//   keywords — ids into src/data/keywords.js (the Unit Keywords cards);
//     shared rules text and structured effects live there
//   abilities — this card's OWN extras from the card back, as
//     [{ name, code, text, bonus, when, stance }]; `bonus` is the
//     [dice, OS, OP] triple used by MODIFIERS, `when` lists modifier ids
//     that make it live (any one on), `stance` limits it to an attack
//     mode. Abilities without `bonus` are informational only (e.g. DS
//     bonuses that apply when this unit is the target).
//
// The faction's army-wide rules (the Hawk Army Abilities card) are the
// faction-level `abilities` below.

// Card-back extra shared by the spear-armed cards: the shield-icon bonus
// the Spears keyword card points to ("see the back of the unit card")
const SPEARS_CHARGE_DS = {
  name: "Spears",
  text: "+1 DS while Charging (in addition to the normal Charging Bonus).",
};

// Scout Cavalry's card back grants the defensive half only
const CAVALRY_CHARGE_DS = {
  name: "Cavalry",
  text: "+1 DS while Charging (in addition to the normal Charging Bonus).",
};

const CAVALRY_FULL = {
  name: "Cavalry",
  code: "CAV",
  text: "+1 OP and +1 DS while Charging (in addition to the normal Charging Bonus).",
  bonus: [0, 0, 1],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
};

// Archers fight hand-to-hand at a penalty: card text "(-0) -2/-2 when
// Engaged" — applied automatically while the attack is melee
const ENGAGED = {
  name: "Engaged",
  code: "ENG",
  text: "(-0) -2/-2 when Engaged.",
  bonus: [0, -2, -2],
  stance: "melee",
};

export default {
  id: "menOfHawkshold",
  name: "Men of Hawkshold",
  // Hawk Army Abilities card — army-wide rules, informational
  abilities: [
    {
      name: "Bravery",
      text:
        "You may spend a Command Action to mark the Bravery box on one of " +
        "your units. While it is marked, the unit gets Courage +3. If a " +
        "unit with a marked box fails a Rout Check, or passes one it would " +
        "have failed without the +3, erase the mark.",
    },
  ],
  units: [
    {
      id: "bowmen",
      name: "Bowmen",
      points: 162,
      class: "core",
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 14, ammo: 6 },
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 12,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [ENGAGED],
    },
    {
      id: "communalPikemen",
      name: "Communal Pikemen",
      points: 328,
      class: "standard",
      melee: { dice: 7, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 5, yellow: 2, red: 3 },
      keywords: ["spears"],
      abilities: [SPEARS_CHARGE_DS],
    },
    {
      id: "dismountedKnights",
      name: "Dismounted Knights",
      points: 293,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 3,
      courage: 13,
      move: 3.5,
      damage: { green: 3, yellow: 2, red: 3 },
      keywords: ["spears"],
      abilities: [SPEARS_CHARGE_DS],
    },
    {
      id: "greatSwordsmen",
      name: "Great Swordsmen",
      points: 279,
      class: "standard",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 5, yellow: 2, red: 3 },
    },
    {
      id: "knights",
      name: "Knights",
      points: 413,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 13,
      move: 5,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [CAVALRY_FULL],
    },
    {
      id: "lancers",
      name: "Lancers",
      points: 240,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 6,
      damage: { green: 3, yellow: 2, red: 1 },
      keywords: ["cavalry"],
      abilities: [CAVALRY_FULL],
    },
    {
      id: "longbowmen",
      name: "Longbowmen",
      points: 347,
      class: "elite",
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 6 },
      ranged: { dice: 4, offensiveSkill: 6, offensivePower: 6, range: 21, ammo: 6 },
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 13,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [ENGAGED],
    },
    {
      id: "militia",
      name: "Militia",
      points: 115,
      class: "core",
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 11,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 4 },
    },
    {
      id: "peasantMob",
      name: "Peasant Mob",
      points: 70,
      class: "standard",
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 4 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 10,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 3 },
    },
    {
      id: "scoutCavalry",
      name: "Scout Cavalry",
      points: 136,
      class: "standard",
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 12,
      move: 7,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [CAVALRY_CHARGE_DS],
    },
    {
      id: "sirSteaphensFreeCompany",
      name: "Sir Steaphen's Free Company",
      points: 363,
      class: "unique",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 13,
      move: 3.5,
      damage: { green: 6, yellow: 2, red: 3 },
      keywords: ["fellingBlow", "unique"],
    },
    {
      id: "spearmen",
      name: "Spearmen",
      points: 220,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 5, yellow: 2, red: 3 },
      keywords: ["spears"],
      abilities: [SPEARS_CHARGE_DS],
    },
    {
      id: "swordsmen",
      name: "Swordsmen",
      points: 197,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 6, yellow: 2, red: 3 },
    },
  ],
};
