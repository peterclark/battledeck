// Lizardmen unit cards, transcribed from the physical cards (2007
// printing).
//
// Blood Frenzy is the faction's recurring rule: a bonus that turns on
// while the unit is Engaged with an enemy that is already damaged ("not
// in the green"). The calculator has no state for the defender's damage —
// its In the Yellow / In the Red toggles describe the attacker — so
// Blood Frenzy is kept as prose for now.

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
  units: [
    {
      id: "ancients",
      name: "Ancients",
      points: 409,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 7 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 4,
      courage: 12,
      move: 5,
      // UNCONFIRMED: read as six green and seven red with no yellow band
      damage: { green: 6, yellow: 0, red: 7 },
      keywords: ["large", "fearsome"],
      abilities: [
        {
          name: "Blood Frenzy",
          text:
            "(+1) +0/+0 and Courage +2 while Engaged with a unit not in " +
            "the green.",
        },
      ],
    },
  ],
};
