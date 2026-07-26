// High Elf unit cards, transcribed from the physical cards (2007
// printing).
//
// The Precision box the army ability marks is printed on the front of
// every unit card, at the left end of the stat bar.

// The Knights' card-back Cavalry extra. Stronger than the Hawkshold and
// Dwarven version (+1 OP): the elves get +2 OP, marked by the asterisks
// on the stat bar's OP and DS. The DS half applies when this unit is the
// target, so it stays prose.
const CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text:
    "(+0) +0/+2 and +1 DS while Charging (in addition to the normal " +
    "Charging Bonus).",
  bonus: [0, 0, 2],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
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
      abilities: [CAVALRY_CHARGE],
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
