// High Elf unit cards, transcribed from the physical cards (2007
// printing).
//
// The Precision box the army ability marks is printed on the front of
// every unit card, at the left end of the stat bar.

// Card-back Cavalry extras. The elves print two different values: the
// Knights get +2 OP — stronger than the Hawkshold and Dwarven Cavalry's
// +1 — while the Chariots get the usual +1. Both are flagged by the
// asterisks on the stat bar's OP and DS. The +1 DS half applies when the
// unit is the target, so it stays prose in both.
const KNIGHTS_CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text:
    "(+0) +0/+2 and +1 DS while Charging (in addition to the normal " +
    "Charging Bonus).",
  bonus: [0, 0, 2],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
};

const CHARIOT_CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text:
    "(+0) +0/+1 and +1 DS while Charging (in addition to the normal " +
    "Charging Bonus).",
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
  id: "highElves",
  name: "High Elves",
  // High Elf Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Precision",
      text:
        "You may spend one Command Action to empower one of your units " +
        "with Precision (mark the Precision box on the unit's stat bar). " +
        "You may erase the mark during an attack, before that unit rolls " +
        "to hit. If you do, that unit does one extra hit. Erasing the mark " +
        "counts as playing a Command Card.",
    },
    {
      name: "Sprint",
      text:
        "You may spend a Command Action to Sprint one of your units. That " +
        "unit's base Movement becomes 5″ for the turn.",
    },
    {
      name: "Maneuver Mastery",
      text:
        "High Elf units under Direct Control receive no movement penalties " +
        "for maneuvering.",
    },
  ],
  units: [
    {
      id: "celestialGuard",
      name: "Celestial Guard",
      points: 506,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 7, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 4,
      defensivePower: 2,
      courage: 14,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 3 },
    },
    {
      id: "cygnets",
      name: "Cygnets",
      points: 177,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 2, red: 3 },
    },
    {
      id: "elderBladeBattleSquad",
      name: "Elder-Blade Battle Squad",
      points: 220,
      class: "core",
      melee: { dice: 3, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
    },
    {
      id: "elderBladeSwordsmen",
      name: "Elder-Blade Swordsmen",
      points: 352,
      class: "core",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 3 },
    },
    {
      id: "highElfArchers",
      name: "High Elf Archers",
      points: 225,
      class: "core",
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 6, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 3, yellow: 2, red: 2 },
      abilities: [ENGAGED_MINUS_2],
    },
    {
      id: "highElfBattleSquad",
      name: "High Elf Battle Squad",
      points: 187,
      class: "core",
      melee: { dice: 3, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
    },
    {
      id: "highElfBattlemages",
      name: "High Elf Battlemages",
      points: 239,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 5, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 13,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 2 },
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(-2) -2/-2 when Engaged.",
          bonus: [-2, -2, -2],
          stance: "melee",
        },
        {
          name: "Command Card",
          text:
            "During your turn, if this unit is Unengaged, you may draw a " +
            "Command Card at the start of the Combat Phase. If you do, " +
            "this unit does not make a range attack this turn.",
        },
      ],
    },
    {
      id: "highElfBowriders",
      name: "High Elf Bowriders",
      points: 292,
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 6, offensivePower: 5, range: 14 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 13,
      move: 6,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        // Unlike every other archer in the game, these horse archers gain
        // a die in melee rather than taking the usual Engaged penalty
        {
          name: "Engaged",
          code: "ENG",
          text: "(+1) +0/+0 when Engaged.",
          bonus: [1, 0, 0],
          stance: "melee",
        },
        {
          name: "Cavalry",
          text:
            "+1 DS while Charging (in addition to the normal Charging " +
            "Bonus).",
        },
      ],
    },
    {
      id: "highElfChariots",
      name: "High Elf Chariots",
      points: 252,
      class: "core",
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 13,
      move: 5,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["cavalry", "wheeled"],
      abilities: [
        CHARIOT_CAVALRY_CHARGE,
        {
          name: "Flank Charge",
          text:
            "If Unengaged Chariots become Engaged on the flank while on " +
            "Close, they are considered Charging.",
        },
        {
          name: "Impact Hits",
          text:
            "+1 Impact Hit (two total) when Charging with the front. " +
            "Impact Hits are automatic hits, added outside the dice math.",
        },
      ],
    },
    {
      id: "highElfKnights",
      name: "High Elf Knights",
      points: 378,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 5,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [KNIGHTS_CAVALRY_CHARGE],
    },
    {
      id: "highElfRangers",
      name: "High Elf Rangers",
      points: 261,
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 1,
      courage: 13,
      move: 5,
      damage: { green: 4, yellow: 2, red: 2 },
      abilities: [
        {
          name: "Hard to Hit",
          text: "+1 DS / +0 Toughness against ranged attacks.",
        },
      ],
    },
    {
      id: "highElfScorpions",
      name: "High Elf Scorpions",
      points: 260,
      class: "elite",
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 6 },
      ranged: { dice: 4, offensiveSkill: 6, offensivePower: 6, range: 17.5 },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 13,
      move: 2.5,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["wheeled"],
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(-1) -2/-3 while Engaged.",
          bonus: [-1, -2, -3],
          stance: "melee",
        },
        {
          name: "Notes",
          text:
            "May not Sprint. Cannot move and Shoot. Cannot Shoot at " +
            "Engaged units. Cannot Shoot over terrain features that block " +
            "Line of Sight.",
        },
      ],
    },
    {
      id: "highElfSpearmen",
      name: "High Elf Spearmen",
      points: 334,
      class: "core",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 3 },
      keywords: ["spears"],
    },
    {
      id: "highElfSwordsmen",
      name: "High Elf Swordsmen",
      points: 299,
      class: "core",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 3,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 3 },
    },
  ],
};
