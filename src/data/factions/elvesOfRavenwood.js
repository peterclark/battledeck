// Elves of Ravenwood unit cards, transcribed from the physical cards
// (2006 printing — like the Dwarves of Runegard these predate the Unit
// Keywords cards, so shared rules are spelled out on the card backs).
//
// TRANSCRIPTION IN PROGRESS — the faction rules cards are in, along with
// the unit cards photographed so far; the rest follow.

// Same card-back Cavalry extra as the Hawkshold Knights and the Dwarven
// Antonian Horsemen: the OP half feeds the attack, while the DS half
// applies when this unit is the one Charging, which the calculator can't
// gate on (it reads DS from the card when the unit is the target)
const CAVALRY_CHARGE = {
  name: "Cavalry",
  code: "CAV",
  text:
    "(+0) +0/+1 and +1/+0 (DS/Toughness) while Charging, in addition to " +
    "the normal Charging bonus.",
  bonus: [0, 0, 1],
  when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
};

// Archer melee penalty, as printed: "(-0) -2/-2 while Engaged"
const ENGAGED = {
  name: "Engaged",
  code: "ENG",
  text: "(-0) -2/-2 while Engaged.",
  bonus: [0, -2, -2],
  stance: "melee",
};

export default {
  id: "elvesOfRavenwood",
  name: "Elves of Ravenwood",
  abilities: [
    {
      name: "Spirit Guidance",
      // The same shape as Hawkshold Bravery: a Command Action marks the
      // box on the card, and erasing it later spends the ability. What it
      // buys — setting an Attack Die to a "2" — happens on the table
      // rather than in the derived numbers, so it carries no effect.
      box: { cost: 1 },
      text:
        "You may spend a Command Action to give one of your units Spirit " +
        "Guidance (mark the Spirit Guidance box on the unit card). You may " +
        "erase the mark to change the result of one of that unit's Attack " +
        "Dice to a 2. This counts as playing a Command Card.",
    },
    {
      name: "Nets",
      text:
        "When a unit with Nets attacks: make the initial to-hit roll; " +
        "before either player may modify it, count the 1s rolled; as a " +
        "continuation of that roll, roll one extra Attack Die per 1 (new " +
        "1s from these dice generate nothing further). The to-hit roll is " +
        "then complete and Command Cards may be played as normal — " +
        "changing a die to a 1 at that point generates no extra net " +
        "attacks. If the entire attack roll is rerolled, start over.",
      // Extra dice generated mid-roll, so the pool can't be known before
      // the roll — prose only.
    },
    {
      name: "Forests",
      text:
        "Elves of Ravenwood units do not receive the Forest Terrain MC " +
        "penalty.",
    },
  ],
  units: [
    {
      id: "bearkin",
      name: "Bearkin",
      points: 244,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 6 },
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 13,
      move: 3.5,
      damage: { green: 4, yellow: 4, red: 2 },
      // the card back prints equipment and flavor only
    },
    {
      id: "ravenwoodArchers",
      name: "Ravenwood Archers",
      points: 234,
      class: "core",
      melee: { dice: 4, offensiveSkill: 6, offensivePower: 5 },
      ranged: { dice: 4, offensiveSkill: 6, offensivePower: 5, range: 14 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 12,
      move: 3.5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [ENGAGED],
    },
    {
      id: "stagCavalry",
      name: "Stag Cavalry",
      points: 271,
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      defensiveSkill: 3,
      defensivePower: 1,
      courage: 12,
      move: 6,
      damage: { green: 3, yellow: 2, red: 1 },
      keywords: ["cavalry", "nets"],
      abilities: [CAVALRY_CHARGE],
    },
  ],
};
