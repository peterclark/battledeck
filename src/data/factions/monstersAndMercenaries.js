// Monsters & Mercenaries unit cards, transcribed from the physical cards
// (2017 printing). This faction carries the size keywords (large/colossal)
// plus terrifying and flying. Dragons are double-height cards; their
// breath weapons are the ranged profile, with the card's breath icons as
// `ammo`, and a `fly` field holds the Flying movement value.

export default {
  id: "monstersAndMercenaries",
  name: "Monsters & Mercenaries",
  units: [
    {
      id: "ancientRedDragon",
      name: "Ancient Red Dragon",
      points: 900,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 8 },
      // Fire breath: twice per battle, its attack at 7" Line of Sight
      ranged: { dice: 6, offensiveSkill: 6, offensivePower: 8, range: 7, ammo: 2 },
      defensiveSkill: 2,
      defensivePower: 4,
      courage: 14,
      move: 5,
      fly: 10.5,
      damage: { green: 7, yellow: 2, red: 5 },
      keywords: ["colossal", "terrifying", "flying"],
      abilities: [
        {
          name: "Fire Breath",
          text:
            "May breathe fire twice during a battle: mark off a fire icon " +
            "to give Ancient Red Dragon a 7″ (Line of Sight) ranged attack " +
            "this turn.",
        },
        {
          name: "Notes",
          text:
            "To play a Command Card on Ancient Red Dragon you must first " +
            "discard two other Command Cards.",
        },
      ],
    },
    {
      id: "hydra",
      name: "Hydra",
      points: 600,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 7 },
      ranged: null,
      // no courage stat — the card passes all Courage Checks
      defensiveSkill: 1,
      defensivePower: 3,
      move: 5,
      damage: { green: 6, yellow: 4, red: 6 },
      keywords: ["colossal", "terrifying"],
      abilities: [
        {
          name: "Fearless",
          text: "Passes all Courage Checks.",
        },
        {
          name: "Regeneration",
          text:
            "At the start of your Movement and Command Phase, Hydra heals " +
            "one damage. Each time it heals this way it gains (+1) +0/+0 " +
            "permanently.",
        },
        {
          name: "Notes",
          text:
            "Always has the Close Standing Order and may not be given a " +
            "Standing Order Modifier or be Directly Controlled. To play a " +
            "Command Card on Hydra you must first discard two other " +
            "Command Cards.",
        },
      ],
    },
    {
      id: "ancientBlueDragon",
      name: "Ancient Blue Dragon",
      points: 868,
      class: "elite",
      melee: { dice: 6, offensiveSkill: 7, offensivePower: 7 },
      // Lightning breath: three uses per battle, dice count locked at 3
      ranged: { dice: 3, offensiveSkill: 7, offensivePower: 7, range: 10.5, ammo: 3 },
      defensiveSkill: 3,
      defensivePower: 3,
      courage: 14,
      move: 6,
      fly: 10.5,
      damage: { green: 7, yellow: 3, red: 6 },
      keywords: ["colossal", "terrifying", "flying"],
      abilities: [
        {
          name: "Lightning Breath",
          text:
            "May breathe lightning three times during a battle: mark off a " +
            "lightning icon to make a (3) 7/7 10.5″ ranged attack this " +
            "turn. The attack is unaffected by Command Cards from either " +
            "player, and nothing can affect its number of attack dice (3).",
        },
        {
          name: "Notes",
          text:
            "To play a Command Card on Ancient Blue Dragon you must first " +
            "discard two other Command Cards.",
        },
      ],
    },
    {
      id: "earthElemental",
      name: "Earth Elemental",
      points: 345,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 8 },
      ranged: null,
      // no courage stat — the card passes all Courage Checks
      defensiveSkill: 1,
      defensivePower: 4,
      move: 5,
      damage: { green: 5, yellow: 4, red: 4 },
      keywords: ["large", "fearsome"],
      abilities: [
        {
          name: "Fearless",
          text: "Passes all Courage Checks.",
        },
        {
          name: "Notes",
          text:
            "Always has the Close Standing Order and may not be given a " +
            "Standing Order Modifier or be Directly Controlled. To play a " +
            "Command Card on Earth Elemental you must first discard two " +
            "other Command Cards.",
        },
      ],
    },
    {
      id: "elementalist",
      name: "Elementalist",
      points: 360,
      class: "elite",
      melee: { dice: 3, offensiveSkill: 6, offensivePower: 5 },
      // Lightning Strike is the prefilled spell; Fireball is (4) 6/6 at
      // 10.5" — hand-adjust the calculator when casting it instead
      ranged: { dice: 2, offensiveSkill: 7, offensivePower: 7, range: 17.5 },
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 11,
      move: 3.5,
      damage: { green: 3, yellow: 2, red: 1 },
      abilities: [
        {
          name: "Spells",
          text:
            "During your turn, while Unengaged, may cast one spell: " +
            "Lightning Strike (Attack) (2) 7/7, range 17.5″, unaffected " +
            "by Command Cards from either player; or Fireball (Attack) " +
            "(4) 6/6, range 10.5″.",
        },
      ],
    },
    {
      id: "hillGiant",
      name: "Hill Giant",
      points: 500,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 8 },
      // Rock throw: costs two Command Actions, so no ammo cap
      ranged: { dice: 5, offensiveSkill: 5, offensivePower: 8, range: 21 },
      defensiveSkill: 1,
      defensivePower: 4,
      courage: 13,
      move: 6,
      damage: { green: 8, yellow: 2, red: 5 },
      keywords: ["large", "fearsome", "stupid"],
      abilities: [
        {
          name: "Rock Throw",
          text:
            "You may spend two Command Actions to have Hill Giant gain a " +
            "21″ ranged attack this turn.",
        },
        {
          name: "Notes",
          text:
            "To play a Command Card on Hill Giant you must first discard " +
            "two other Command Cards.",
        },
      ],
    },
    {
      id: "ogres",
      name: "Ogres",
      points: 295,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 6 },
      ranged: null,
      defensiveSkill: 2,
      defensivePower: 3,
      courage: 12,
      move: 5,
      damage: { green: 4, yellow: 4, red: 4 },
      keywords: ["large", "fearsome", "stupid"],
    },
    {
      id: "wildmenHorseArchers",
      name: "Wildmen Horse Archers",
      points: 214,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 10.5 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 11,
      move: 6,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        {
          name: "Cavalry",
          text: "+1 DS while Charging (in addition to the normal Charging Bonus).",
        },
        {
          // exactly cancels the Move & Shoot modifier's -1 OS
          name: "Move & Shoot",
          code: "M&S+",
          text: "No penalty for Move and Shoot.",
          bonus: [0, 1, 0],
          when: ["moveAndShoot"],
          stance: "ranged",
        },
      ],
    },
    {
      id: "redDragon",
      name: "Red Dragon",
      points: 691,
      class: "elite",
      melee: { dice: 5, offensiveSkill: 6, offensivePower: 7 },
      // Fire breath: twice per battle, its attack at 7" Line of Sight
      ranged: { dice: 5, offensiveSkill: 6, offensivePower: 7, range: 7, ammo: 2 },
      defensiveSkill: 2,
      defensivePower: 4,
      courage: 13,
      move: 5,
      fly: 10.5,
      damage: { green: 5, yellow: 2, red: 4 },
      keywords: ["large", "fearsome", "flying"],
      abilities: [
        {
          name: "Fire Breath",
          text:
            "May breathe fire twice during a battle: mark off a fire icon " +
            "to give Red Dragon a 7″ (Line of Sight) ranged attack this " +
            "turn.",
        },
        {
          name: "Notes",
          text:
            "To play a Command Card on Red Dragon you must first discard " +
            "two other Command Cards.",
        },
      ],
    },
  ],
};
