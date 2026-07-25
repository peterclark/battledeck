// Undead Army unit cards, transcribed from the physical cards (2005
// printing). Undead units are typically immune to Courage Checks, so most
// print no courage stat — the schema leaves `courage` optional and the UI
// renders "Cg —". The Lesser/Major/Greater Undead keywords set what it
// costs to Reanimate the unit (1/2/3 Command Actions, see the faction
// abilities); the Swarm of Rats has no classification and so cannot be
// Reanimated at all.

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
  // Undead Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Reanimate",
      text:
        "You may spend Command Actions to Reanimate one of your damaged " +
        "Undead units, healing one damage. Each unit may only be " +
        "Reanimated once per turn, and a destroyed unit may not be " +
        "Reanimated. The cost is set by the unit's classification: 1 " +
        "Command Action for Lesser Undead, 2 for Major Undead, 3 for " +
        "Greater Undead.",
    },
  ],
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
      id: "deathKnights",
      name: "Death Knights",
      points: 516,
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 4,
      // intelligent enough to break: the card prints a courage value and
      // omits the Fearless line
      courage: 13,
      move: 5,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["greaterUndead", "cavalry"],
      abilities: [CAVALRY_CHARGE],
    },
    {
      id: "ghoulPack",
      name: "Ghoul Pack",
      points: 130,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      // the only Undead unit so far that takes Courage Checks normally —
      // its card prints a value and omits the Fearless line
      courage: 9,
      move: 5,
      // a single green box, then a long yellow slog: the pack fights on
      // In the Yellow for most of its life (checked against the card)
      damage: { green: 1, yellow: 8, red: 1 },
      keywords: ["lesserUndead"],
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
      id: "skeletonTrolls",
      name: "Skeleton Trolls",
      points: 323,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 7 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 3,
      move: 5,
      // same no-yellow track as the Zombie Trolls (checked against the
      // card): straight from unhurt to In the Red
      damage: { green: 5, yellow: 0, red: 5 },
      keywords: ["majorUndead", "large", "fearsome"],
      abilities: [FEARLESS],
    },
    {
      id: "skeletonHorde",
      name: "Skeleton Horde",
      points: 149,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["lesserUndead"],
      abilities: [FEARLESS],
    },
    {
      id: "skeletonSpearmen",
      name: "Skeleton Spearmen",
      points: 167,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 1,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 2 },
      // the card back prints the full Spears keyword rules
      keywords: ["lesserUndead", "spears"],
      abilities: [FEARLESS],
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
      id: "zombieTrolls",
      name: "Zombie Trolls",
      points: 232,
      melee: { dice: 4, offensiveSkill: 4, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 4,
      move: 3.5,
      // no yellow band at all (checked against the card): the trolls go
      // straight from unhurt to In the Red once the green boxes fill
      damage: { green: 5, yellow: 0, red: 5 },
      keywords: ["majorUndead", "large", "fearsome"],
      abilities: [FEARLESS],
    },
    {
      id: "swarmOfRats",
      name: "Swarm of Rats",
      points: 109,
      // no Command Cards while it attacks: the battle screen disables and
      // clears the card log whenever the rats are the attacker
      melee: {
        dice: 8,
        offensiveSkill: 5,
        offensivePower: 3,
        noCommandCards: true,
      },
      ranged: null,
      defensiveSkill: 0,
      defensivePower: 0,
      move: 5,
      damage: { green: 3, yellow: 3, red: 3 },
      // the one Undead card with no classification line at all
      abilities: [
        FEARLESS,
        {
          name: "No Command Cards",
          text:
            "You may not play Command Cards while Swarm of Rats is " +
            "attacking or defending. (The battle screen enforces this " +
            "while the rats are the attacker.)",
        },
        {
          name: "Notes",
          text:
            "Always has the Close Standing Order and may not be given an " +
            "Objective. Is unaffected by your Command Cards and may not be " +
            "Reanimated.",
        },
      ],
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
