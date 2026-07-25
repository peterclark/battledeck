// Undead Army unit cards, transcribed from the physical cards (2005
// printing). Undead units are typically immune to Courage Checks, so most
// print no courage stat — the schema leaves `courage` optional and the UI
// renders "Cg —". Unit classifications (Lesser Undead, …) are keywords.

// Printed on the cards that ignore morale entirely
const FEARLESS = {
  name: "Fearless",
  text: "Passes all Courage Checks.",
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
