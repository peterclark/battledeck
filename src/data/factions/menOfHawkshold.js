// Men of Hawkshold unit cards, transcribed from the physical cards.
// Front of card: stat bar ((dice) OS/DS OP/T, ranged profile, courage,
// movement) and the green/yellow/red damage track. Back of card: point
// cost, deck class, and ability rules text.
//
// Unit shape:
//   melee / ranged — attack profiles as { dice, offensiveSkill,
//     offensivePower } (+ range in inches on ranged); null when the unit
//     has no attack of that kind
//   defensiveSkill / defensivePower — DS and Toughness, applied whenever
//     the unit is the target
//   damage — count of green/yellow/red boxes on the card's damage track
//   abilities — [{ name, code, text, bonus, when }]; `bonus` is the same
//     [dice, OS, OP] triple used by MODIFIERS and `when` lists modifier
//     ids that make it live (any one on). Prose-only abilities omit
//     bonus/when and are informational.
export default {
  id: "menOfHawkshold",
  name: "Men of Hawkshold",
  units: [
    {
      id: "communalPikemen",
      name: "Communal Pikemen",
      points: 328,
      class: "standard",
      melee: { dice: 7, offensiveSkill: 6, offensivePower: 2 },
      ranged: null,
      defensiveSkill: 5,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 5, yellow: 2, red: 3 },
      abilities: [
        {
          name: "Spears",
          code: "SP",
          text: "+1/+0 while Charging (in addition to the normal Charging Bonus).",
          bonus: [0, 1, 0],
          when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
        },
      ],
    },
  ],
};
