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
