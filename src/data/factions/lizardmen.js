// Lizardmen unit cards, transcribed from the physical cards (2007
// printing).
//
// NOTE: this faction is not listed in FACTIONS yet — it joins the picker
// and army builder as soon as its first unit card is transcribed. The
// army ability below is recorded ahead of the units.

export default {
  id: "lizardmen",
  name: "Lizardmen",
  // Lizardmen Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Fury",
      text:
        "You may spend one Command Action to empower one of your units " +
        "with Fury (mark the Fury box on the unit's stat bar). That unit " +
        "gets Courage +1 while it has the mark. If the unit does two or " +
        "more damage during an attack while Engaged, you may erase the " +
        "mark to do one additional damage; erasing the mark counts as " +
        "playing a Command Card.",
    },
  ],
  units: [],
};
