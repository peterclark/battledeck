// Undead Army unit cards, transcribed from the physical cards (2005
// printing). Undead units are typically immune to Courage Checks, so most
// print no courage stat — the schema leaves `courage` optional and the UI
// renders "Cg —". Unit classifications (Lesser Undead, …) are keywords.

// Printed on the cards that ignore morale entirely
const FEARLESS = {
  name: "Fearless",
  text: "Passes all Courage Checks.",
};

// Same card-back Cavalry extra as the Hawkshold Knights and the Dwarven
// Antonian Horsemen: "(+0) +0/+1 and +1/+0 while Charging"
const CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text: "+1 OP and +1 DS while Charging (in addition to the normal Charging Bonus).",
  bonus: [0, 0, 1],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
};

export default {
  id: "undeadArmy",
  name: "Undead Army",
  units: [
    {
      id: "abomination",
      name: "Abomination",
      points: 153,
      melee: { dice: 6, offensiveSkill: 4, offensivePower: 4 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      move: 2.5,
      damage: { green: 4, yellow: 4, red: 3 },
      keywords: ["lesserUndead", "large", "fearsome"],
      abilities: [FEARLESS],
    },
    {
      id: "giantCatapult",
      name: "Giant Catapult",
      points: 510,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 7 },
      // one printed stat line, thrown as well as swung
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 7, range: 17.5 },
      defensiveSkill: 1,
      defensivePower: 4,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 3 },
      keywords: ["greaterUndead", "large", "fearsome"],
      abilities: [FEARLESS],
    },
    {
      id: "skeletonBowmen",
      name: "Skeleton Bowmen",
      points: 150,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 0,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 1 },
      keywords: ["lesserUndead"],
      abilities: [
        FEARLESS,
        {
          name: "Engaged",
          code: "ENG",
          text: "(-0) -2/-2 while Engaged.",
          bonus: [0, -2, -2],
          stance: "melee",
        },
      ],
    },
    {
      id: "skeletonCavalry",
      name: "Skeleton Cavalry",
      points: 219,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      move: 6,
      damage: { green: 2, yellow: 2, red: 1 },
      keywords: ["lesserUndead", "cavalry"],
      abilities: [FEARLESS, CAVALRY_CHARGE],
    },
    {
      id: "zombies",
      name: "Zombies",
      points: 90,
      melee: { dice: 4, offensiveSkill: 4, offensivePower: 4 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      move: 2.5,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["lesserUndead"],
      abilities: [FEARLESS],
    },
  ],
};
