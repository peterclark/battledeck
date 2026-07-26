// Dwarves of Runegard unit cards, transcribed from the physical cards
// (2006 printing — these predate the Unit Keywords cards, so shared rules
// like Spears and Cavalry are spelled out on the card backs; they're
// tagged with the matching keyword ids here). Several backs list no deck
// class — those units simply omit `class`.
//
// Army-wide notes: many cards reference the Rune of Uruz (see the faction
// abilities below) — its per-card mentions are kept in the unit prose.
// Every card moves 3.5″ when Routing or Final Rushing despite the 2.5″
// movement stat, so that note is shared below.

const ROUTING_35 = {
  name: "Routing",
  text: "3.5″ when Routing or Final Rushing.",
};

// Same card-back Cavalry extra as the Hawkshold Knights/Lancers
const CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text: "+1 OP and +1 DS while Charging (in addition to the normal Charging Bonus).",
  bonus: [0, 0, 1],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
};

// Archer melee penalty, as printed: "(-0) -2/-2 while Engaged"
const ENGAGED_MINUS_2 = {
  name: "Engaged",
  code: "ENG",
  text: "(-0) -2/-2 while Engaged.",
  bonus: [0, -2, -2],
  stance: "melee",
};

export default {
  id: "dwarvesOfRunegard",
  name: "Dwarves of Runegard",
  // Dwarves of Runegard Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Rune of Uruz",
      // the Antonian Horsemen's card back rules them out
      box: { cost: 1, except: ["antonianHorsemen"] },
      text:
        "You may spend a Command Action to empower one of your units with " +
        "Uruz, Rune of Endurance (mark the Uruz box on the unit card). " +
        "That unit gets a permanent (+1) +0/+0 while Engaged. The mark is " +
        "erased and the bonus lost if the unit routs. Rune of Uruz gives " +
        "no bonus to ranged attacks.",
    },
    {
      name: "Sprint",
      text:
        "You may spend a Command Action to Sprint one of your units. That " +
        "unit's base Movement becomes 3.5″ for the turn.",
    },
    {
      name: "Hills",
      text: "Dwarves get no movement penalty for moving up hill terrain.",
    },
  ],
  units: [
    {
      id: "antonianHorsemen",
      name: "Antonian Horsemen",
      points: 280,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 1,
      courage: 12,
      move: 7,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        CAVALRY_CHARGE,
        {
          name: "Notes",
          text: "May not Sprint. May not be empowered with Rune of Uruz.",
        },
      ],
    },
    {
      id: "dwarvenAxemen",
      name: "Dwarven Axemen",
      points: 240,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [ROUTING_35],
    },
    {
      id: "dwarvenBallista",
      name: "Dwarven Ballista",
      points: 294,
      class: "elite",
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 7 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 7, range: 21 },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 12,
      move: 2.5,
      damage: { green: 3, yellow: 2, red: 2 },
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(-1) -1/-2 while Engaged.",
          bonus: [-1, -1, -2],
          stance: "melee",
        },
        {
          name: "Notes",
          text:
            "May not Sprint. Cannot move and Shoot. Cannot Shoot at " +
            "Engaged units. Cannot Shoot over terrain features that block " +
            "Line of Sight. (Dwarven Ballista is an indirect fire weapon; " +
            "Rune of Uruz gives no bonus to ranged attacks.)",
        },
      ],
    },
    {
      id: "dwarvenBattleaxemen",
      name: "Dwarven Battleaxemen",
      points: 248,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 13,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [ROUTING_35],
    },
    {
      id: "dwarvenBowmen",
      name: "Dwarven Bowmen",
      points: 158,
      class: "core",
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 0,
      defensivePower: 2,
      courage: 12,
      move: 2.5,
      damage: { green: 3, yellow: 3, red: 3 },
      abilities: [
        ENGAGED_MINUS_2,
        ROUTING_35,
        {
          name: "Notes",
          text: "Rune of Uruz gives no bonus to ranged attacks.",
        },
      ],
    },
    {
      id: "dwarvenCrossbowmen",
      name: "Dwarven Crossbowmen",
      points: 255,
      melee: { dice: 3, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 3, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 12,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [
        {
          // Unusually, crossbowmen fight BETTER hand-to-hand than their
          // printed dice: braced pavises and heavy bolts up close
          name: "Engaged",
          code: "ENG",
          text: "(+2) +0/+0 and +1 DS while Engaged.",
          bonus: [2, 0, 0],
          stance: "melee",
        },
        ROUTING_35,
        {
          name: "Notes",
          text:
            "Ranged attack is Line of Sight. (Rune of Uruz gives no bonus " +
            "to ranged attacks.)",
        },
      ],
    },
    {
      id: "dwarvenHammermen",
      name: "Dwarven Hammermen",
      points: 258,
      melee: { dice: 7, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 13,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [ROUTING_35],
    },
    {
      id: "dwarvenMilitia",
      name: "Dwarven Militia",
      points: 157,
      class: "core",
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [ROUTING_35],
    },
    {
      id: "dwarvenMiners",
      name: "Dwarven Miners",
      points: 144,
      melee: { dice: 4, offensiveSkill: 4, offensivePower: 7 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 12,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [ROUTING_35],
    },
    {
      id: "dwarvenSpearmen",
      name: "Dwarven Spearmen",
      points: 269,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      keywords: ["spears"],
      abilities: [ROUTING_35],
    },
    {
      id: "longbeards",
      name: "Longbeards",
      points: 394,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 4,
      courage: 14,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 4 },
      abilities: [
        {
          name: "Fearless",
          text:
            "Passes all Fear Checks. (This ability does not apply to Rout " +
            "Checks.)",
        },
        ROUTING_35,
      ],
    },
    {
      id: "shortbeards",
      name: "Shortbeards",
      points: 107,
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 11,
      move: 2.5,
      damage: { green: 3, yellow: 4, red: 3 },
      abilities: [ROUTING_35],
    },
  ],
};
