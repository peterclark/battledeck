// Lizardmen unit cards, transcribed from the physical cards (2007
// printing).
//
// Blood Frenzy is the faction's recurring rule: a bonus that turns on
// while the unit is Engaged with an enemy that is already damaged ("not
// in the green"). The battle screen's Foe Damaged toggle carries that
// state, so the extra die applies automatically; the Courage half stays
// prose, since the app doesn't compute courage.
//
// On these cards the ovals in the damage track are the dividers between
// the green/yellow/red bands (a card with no yellow boxes shows just one),
// and the clawed box at the foot of the stat bar is the Fury box the army
// ability marks.

// Every Lizardmen card except the two wild beasts carries this line
const BLOOD_FRENZY = {
  name: "Blood Frenzy",
  code: "BF",
  text:
    "(+1) +0/+0 and Courage +2 while Engaged with a unit not in the green.",
  bonus: [1, 0, 0],
  when: ["targetDamaged"],
  stance: "melee",
};

export default {
  id: "lizardmen",
  name: "Lizardmen",
  // Lizardmen Army Ability card — army-wide rules, informational
  abilities: [
    {
      name: "Fury",
      box: { cost: 1 },
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
      // no yellow band — its track shows a single band divider, where
      // the cards below show two (checked against the card)
      damage: { green: 6, yellow: 0, red: 6 },
      keywords: ["large", "fearsome"],
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "hatchlings",
      name: "Hatchlings",
      points: 91,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 3 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 11,
      move: 5,
      damage: { green: 3, yellow: 3, red: 3 },
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
      damage: { green: 4, yellow: 3, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "tyrannosaurusRex",
      name: "Tyrannosaurus Rex",
      points: 507,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 8 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 4,
      courage: 12,
      move: 5,
      damage: { green: 8, yellow: 2, red: 5 },
      keywords: ["colossal", "terrifying"],
      abilities: [
        {
          name: "Notes",
          text:
            "Always has the Close Standing Order and may not be given a " +
            "Standing Order Modifier or Fury. To play Command Cards on " +
            "Tyrannosaurus Rex you must first discard two other Command " +
            "Cards. Requires two Command Actions to Rally.",
        },
      ],
    },
    {
      id: "tyrantSpearmen",
      name: "Tyrant Spearmen",
      points: 375,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 3.5,
      damage: { green: 5, yellow: 4, red: 3 },
      // the card back prints the full Spears keyword rules
      keywords: ["spears"],
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
      damage: { green: 5, yellow: 4, red: 3 },
      abilities: [BLOOD_FRENZY],
    },
    {
      id: "swarmlingBowmen",
      name: "Swarmling Bowmen",
      points: 112,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 4 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 4, range: 10.5 },
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 11,
      move: 5,
      damage: { green: 3, yellow: 2, red: 2 },
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
    {
      id: "trogSpearmen",
      name: "Trog Spearmen",
      points: 243,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 3 },
      // the card back prints the full Spears keyword rules
      keywords: ["spears"],
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
      id: "triceratopsHerd",
      name: "Triceratops Herd",
      points: 322,
      class: "elite",
      // Command Cards are allowed but taxed a discard, not forbidden, so
      // no noCommandCards lock here — the cost stays prose
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 1,
      defensivePower: 4,
      courage: 12,
      move: 3.5,
      damage: { green: 5, yellow: 4, red: 4 },
      keywords: ["large", "fearsome"],
      abilities: [
        {
          name: "Impact Hits",
          text: "Three Impact Hits.",
        },
        {
          name: "Notes",
          text:
            "May not be directly controlled. May not be given a Standing " +
            "Order Modifier or Fury. To play Command Cards on Triceratops " +
            "Herd you must first discard one other Command Card. Moves 5″ " +
            "when Routing or Final Rushing.",
        },
      ],
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
