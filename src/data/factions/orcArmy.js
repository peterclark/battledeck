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
