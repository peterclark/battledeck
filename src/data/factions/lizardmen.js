// Lizardmen unit cards, transcribed from the physical cards (2007
// printing).
//
// Blood Frenzy is the faction's recurring rule: a bonus that turns on
// while the unit is Engaged with an enemy that is already damaged ("not
// in the green"). The calculator has no state for the defender's damage —
// its In the Yellow / In the Red toggles describe the attacker — so
// Blood Frenzy is kept as prose for now.
//
// On these cards the ovals in the damage track are the dividers between
// the green/yellow/red bands (a card with no yellow boxes shows just one),
// and the clawed box at the foot of the stat bar is the Fury box the army
// ability marks.

// Every Lizardmen card carries the same Blood Frenzy line
const BLOOD_FRENZY = {
  name: "Blood Frenzy",
  text:
    "(+1) +0/+0 and Courage +2 while Engaged with a unit not in the green.",
};

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
      // no yellow band — its track shows a single band divider, where the
      // cards below show two. Exact box counts still worth a check.
      damage: { green: 6, yellow: 0, red: 7 },
      keywords: ["large", "fearsome"],
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "raptorPack",
      name: "Raptor Pack",
      points: 290,
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 11,
      move: 6,
      damage: { green: 4, yellow: 4, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "swarmlingWarriors",
      name: "Swarmling Warriors",
      points: 141,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 4 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 11,
      move: 5,
      damage: { green: 4, yellow: 4, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "tyrantWarriors",
      name: "Tyrant Warriors",
      points: 338,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "trogWarriors",
      name: "Trog Warriors",
      points: 218,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "trogBowmen",
      name: "Trog Bowmen",
      points: 176,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [
        BLOOD_FRENZY,
        {
          name: "Engaged",
          code: "ENG",
          text: "(-0) -2/-2 while Engaged.",
          bonus: [0, -2, -2],
          stance: "melee",
        },
      ],
    },
  ],
};
