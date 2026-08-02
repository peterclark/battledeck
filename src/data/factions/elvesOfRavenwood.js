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

// The wolves' shared bonus, on both the Wolf Pack and Wolfkin cards.
// Free Attacks after a Rout are their own attack step outside the
// calculator's engagement, so this stays prose.
const FREE_ATTACK_BONUS = {
  name: "Free Attacks",
  text:
    "(+2) +0/+0 and +3/+0 (DS/Toughness) during post-Rout Free Attacks.",
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
      // the Wolf Pack's card prints no Spirit Guidance box and its back
      // says it may not be given the ability
      box: { cost: 1, except: ["wolfPack"] },
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
      id: "brownies",
      name: "Brownies",
      points: 79,
      melee: { dice: 5, offensiveSkill: 4, offensivePower: 4 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 13,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 2 },
      // the card back prints equipment and flavor only
    },
    {
      id: "centaurs",
      name: "Centaurs",
      points: 380,
      melee: { dice: 6, offensiveSkill: 6, offensivePower: 5 },
      // short javelins
      ranged: { dice: 6, offensiveSkill: 6, offensivePower: 5, range: 3.5 },
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 13,
      move: 6,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        CAVALRY_CHARGE,
        {
          name: "Move & Shoot",
          code: "M&S+",
          text: "No range penalty for Move and Shoot.",
          bonus: [0, 1, 0],
          when: ["moveAndShoot"],
          stance: "ranged",
        },
        {
          name: "Long Range",
          code: "LR+",
          text: "No range penalty for Long Range.",
          bonus: [0, 1, 0],
          when: ["longRange"],
          stance: "ranged",
        },
        {
          name: "Javelins",
          text:
            "If Centaurs are not Engaged at the start of the turn and " +
            "become Engaged on their front side, they make a Range Attack " +
            "at the start of the Combat Phase, before normal attacks are " +
            "rolled.",
        },
      ],
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
      id: "ravenwoodSpearmen",
      name: "Ravenwood Spearmen",
      points: 230,
      class: "core",
      melee: { dice: 6, offensiveSkill: 5, offensivePower: 5 },
      defensiveSkill: 3,
      defensivePower: 1,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 2 },
      // the card spells the Spears rules out in full, as the 2006 cards do
      keywords: ["spears", "nets"],
    },
    {
      id: "ravenwoodSwordsmen",
      name: "Ravenwood Swordsmen",
      points: 207,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      defensiveSkill: 3,
      defensivePower: 1,
      courage: 12,
      move: 3.5,
      damage: { green: 4, yellow: 3, red: 2 },
      keywords: ["nets"],
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
    {
      id: "wolfPack",
      name: "Wolf Pack",
      points: 146,
      // no Command Cards may be played while it attacks or defends, and
      // the card prints no Spirit Guidance box (see the faction's
      // box.except)
      melee: {
        dice: 5,
        offensiveSkill: 5,
        offensivePower: 5,
        noCommandCards: true,
      },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 11,
      move: 7,
      damage: { green: 1, yellow: 5, red: 1 },
      abilities: [
        FREE_ATTACK_BONUS,
        {
          name: "Untamed",
          text:
            "Is unaffected by your Command Cards and may not be given " +
            "Spirit Guidance. You may not play Command Cards while Wolf " +
            "Pack is attacking or defending.",
        },
        {
          name: "Pack Bond",
          text:
            "Unless your army currently contains a Wolfkin unit, Wolf Pack " +
            "can only be given the Close Standing Order (with no " +
            "Objective).",
        },
      ],
    },
    {
      id: "wolfkin",
      name: "Wolfkin",
      points: 179,
      class: "core",
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 5 },
      defensiveSkill: 2,
      defensivePower: 1,
      courage: 12,
      move: 5,
      damage: { green: 3, yellow: 3, red: 2 },
      abilities: [
        FREE_ATTACK_BONUS,
        {
          name: "Rally",
          text: "If Wolfkin Routs, it automatically Rallies at end of turn.",
        },
      ],
    },
  ],
};
