// High Elf unit cards, transcribed from the physical cards (2007
// printing).
//
// The Precision box the army ability marks is printed on the front of
// every unit card, at the left end of the stat bar.

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
  ],
};
