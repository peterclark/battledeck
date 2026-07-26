// High Elf unit cards, transcribed from the physical cards (2007
// printing).
//
// NOTE: this faction is not listed in FACTIONS yet — it joins the picker
// and army builder as soon as its first unit card is transcribed. The
// army abilities below are recorded ahead of the units.

export default {
  id: "highElves",
  name: "High Elves",
  // High Elf Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Precision",
      text:
        "You may spend one Command Action to empower one of your units " +
        "with Precision (mark the box on the unit's stat bar). You may " +
        "erase the mark during an attack, before that unit rolls to hit. " +
        "If you do, that unit does one extra hit. Erasing the mark counts " +
        "as playing a Command Card.",
    },
    {
      name: "Sprint",
      text:
        "You may spend a Command Action to Sprint one of your units. That " +
        'unit\'s base MC becomes 5" for the turn.',
    },
    {
      name: "Maneuver Mastery",
      text:
        "High Elf units under Direct Control receive no movement penalties " +
        "for maneuvering.",
    },
  ],
  units: [],
};
