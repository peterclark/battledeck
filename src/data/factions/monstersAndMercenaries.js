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
  ],
};
