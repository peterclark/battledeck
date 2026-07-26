// Orc unit cards, transcribed from the physical cards. Printings are
// mixed here — the Orc Army Ability card is 2008, the Trolls card 2005 —
// so expect card layouts to vary across this faction.
//
// "Orc Army" is the faction name printed in the unit cards' corner.

export default {
  id: "orcArmy",
  name: "Orc Army",
  // Orc Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Lash",
      text:
        "You may spend a Command Action to Lash one of your units. A " +
        "Lashed unit gets +1 Movement and (+1) +0/+0 for the turn. You " +
        "may only Lash each unit once per turn.",
    },
  ],
  units: [
    {
      id: "crazedGoblins",
      name: "Crazed Goblins",
      points: 83,
      // no Courage value on the stat bar: they pass every Courage Check.
      // The disc at the end of the bar reads "C" rather than sitting
      // blank, for the Close Standing Order they are locked into.
      melee: {
        dice: 5,
        offensiveSkill: 4,
        offensivePower: 4,
        noCommandCards: true,
      },
      ranged: null,
      defensiveSkill: 0,
      defensivePower: 1,
      move: 5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [
        {
          name: "Notes",
          text:
            "Always has the Close Standing Order and may not be given an " +
            "Objective. Passes all Courage Checks. Is unaffected by your " +
            "Command Cards and may not be Lashed. You may not play " +
            "Command Cards while Crazed Goblins is attacking or defending.",
        },
      ],
    },
    {
      id: "goblinBombChucker",
      name: "Goblin Bomb-Chucker",
      points: 300,
      // The stat bar prints (*) for its Attack Dice: the machine rolls
      // them fresh for every shot (see Attack Dice below), so no fixed
      // number exists. The prefill is 7 — the average roll of two dice
      // once doubles, which misfire instead, are excluded — and is meant
      // to be adjusted to whatever the two dice actually show. Engaged,
      // the crew fight with the card back's own fixed profile, which is
      // why the stat bar asterisks its OS and OP too.
      melee: {
        dice: 3,
        offensiveSkill: 4,
        offensivePower: 4,
        noCommandCards: true,
      },
      ranged: {
        dice: 7,
        offensiveSkill: 5,
        offensivePower: 6,
        range: 21,
        noCommandCards: true,
      },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 11,
      move: 2.5,
      damage: { green: 3, yellow: 2, red: 2 },
      abilities: [
        {
          name: "Attack Dice",
          text:
            "As part of its roll to hit, first roll two dice (this roll " +
            "may not be changed). If you roll doubles, Goblin " +
            "Bomb-Chucker receives one damage and has no Attack Dice. " +
            "Otherwise, the result is its number of Attack Dice.",
        },
        {
          name: "Notes",
          text:
            "Cannot move and Shoot. You cannot play Command Cards while " +
            "Goblin Bomb-Chucker is attacking.",
        },
      ],
    },
    {
      id: "goblinSpearmen",
      name: "Goblin Spearmen",
      points: 160,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 11,
      move: 3.5,
      damage: { green: 4, yellow: 2, red: 3 },
      keywords: ["spears"],
    },
    {
      id: "orcAxemen",
      name: "Orc Axemen",
      points: 300,
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 13,
      move: 3.5,
      damage: { green: 5, yellow: 3, red: 2 },
    },
    {
      id: "orcCrossbowmen",
      name: "Orc Crossbowmen",
      points: 267,
      // One stat line for both stances, like the other bow-armed cards —
      // but where every other archer takes a penalty in melee, these drop
      // the crossbow for a greatsword and come out stronger.
      melee: { dice: 3, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 3, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 2 },
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(+2) +0/+1 while Engaged.",
          bonus: [2, 0, 1],
          stance: "melee",
        },
        {
          name: "Notes",
          text: "Range attack is Line of Sight.",
        },
      ],
    },
    {
      id: "orcMarauders",
      name: "Orc Marauders",
      points: 367,
      melee: { dice: 7, offensiveSkill: 6, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 13,
      move: 3.5,
      damage: { green: 5, yellow: 3, red: 2 },
    },
    {
      id: "orcSpearmen",
      name: "Orc Spearmen",
      points: 264,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 2 },
      keywords: ["spears"],
    },
    {
      id: "orcSwordsmen",
      name: "Orc Swordsmen",
      points: 237,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 2 },
    },
    {
      id: "trolls",
      name: "Trolls",
      points: 406,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 7 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      courage: 13,
      move: 5,
      // this card prints no yellow band at all: seven green boxes run
      // straight into seven red, so the Trolls go from fresh to In the
      // Red with nothing in between
      damage: { green: 7, yellow: 0, red: 7 },
      keywords: ["large", "fearsome"],
      abilities: [
        {
          name: "Notes",
          text:
            "At the start of your Movement and Command Phase, Trolls heal " +
            "one damage. Once Trolls are in the red, only red damage may " +
            "be healed.",
        },
      ],
    },
  ],
};
