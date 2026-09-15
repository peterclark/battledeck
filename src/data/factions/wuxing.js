// Wuxing unit cards, transcribed from the physical cards (2014 printing).
//
// TRANSCRIPTION IN PROGRESS — the army-ability and special-unit-rules
// cards are in, along with the unit cards photographed so far; the rest
// follow.
//
// Two rules on the army-ability card need per-copy roster state the app
// doesn't track yet, so they are prose-only for now and noted where they
// sit: the Construct Breakdown mark and the Manipulate Qi boxes.

// Special Unit Rules card — the Rocket Arrow Battery's own rules. Prose
// only: the shooting restriction is a targeting rule, and Friendly Fire
// resolves its own separate attacks (a d6-2 count of (*) 5/5 attacks)
// rather than modifying this one.
const ROCKET_ARROW_BATTERY = [
  {
    name: "Rocket Arrow Battery",
    text:
      "You may make, or erase, a mark on the arrow box for free when " +
      "giving or changing the unit's standing orders; otherwise doing so " +
      "costs one Command Action. While the arrow is marked, the Rocket " +
      "Arrow Battery will shoot at an engaged opponent unit only if there " +
      "are no targetable unengaged opponent units, unless it is Direct " +
      "Controlled.",
  },
  {
    name: "Friendly Fire",
    text:
      "When making a ranged attack with the Rocket Arrow Battery, roll a " +
      "d6 − 2 (minimum 1) to determine the number of (*) 5/5 attacks on " +
      "each unit engaged with its target. Range modifiers do not apply. " +
      "You may play defensive Command Cards on the attacked unit(s).",
  },
];

// Special Unit Rules card — the Shanzhi Monks' own rules. The
// stance/upgrade choice is per-turn roster state the app doesn't model,
// so the upgrades stay prose. Attached when their card is transcribed.
export const SHANZHI_MONKS = [
  {
    name: "Shanzhi Monks",
    text:
      "When giving initial orders, and at the beginning of each of your " +
      "turns, erase all marked upgrades, then select one stance, marking " +
      "either of its upgrades for free. You may spend 1 Command Action to " +
      "mark the other upgrade in the same stance. Each turn the unit gets " +
      "the benefit(s) associated with the marked upgrade(s). Upgrades do " +
      "not count as playing Command Cards.",
  },
];

export default {
  id: "wuxing",
  name: "Wuxing",
  // Wuxing Army Ability cards — army-wide rules, informational
  abilities: [
    {
      name: "Reliable",
      text:
        "When rolling dice to damage from engaged attacks, all 6s are " +
        "immediately rerolled, before the Overkill rule and any Command " +
        "Card effects (any 6s produced by this reroll are kept). If all " +
        "dice are rerolled due to a Command Card or a special rule other " +
        "than Reliable, 6s are again rerolled. Units are not considered " +
        "Reliable while Breakdown is marked.",
      // A reroll rule, so it changes the odds rather than the numbers —
      // nothing for the calculator to add.
    },
    {
      name: "Construct",
      text:
        "Units with the Construct keyword pass all Courage Checks. At the " +
        "end of any turn's combat phase in which the Construct was knocked " +
        "into the Yellow or Red, or took any damage while in the Red, mark " +
        "the Breakdown symbol (if it is not already marked). While " +
        "Breakdown is marked the unit gets (-2) -0/-0 in addition to the " +
        "regular penalties; it may not be Direct Controlled or have its " +
        "Standing Order changed; and it is not considered Reliable.",
      // The (-2) -0/-0 is a real attack penalty, but it hangs on a
      // Breakdown mark — a second per-copy track alongside the army
      // builder's existing box marks. Prose until that state exists.
    },
    {
      name: "Manipulate Qi",
      text:
        "Spend a Command Action to mark a Manipulate Qi box on one of your " +
        "Construct units, or two Command Actions to mark both. During the " +
        "Movement and Command phase of each turn you may erase at most one " +
        "mark on each unit for the following effect: if Breakdown is " +
        "marked, erase that mark; if it is not marked, the unit gets " +
        "+1/+0 (DS/Toughness) that turn. Erasing a mark does not count as " +
        "playing a Command Card.",
      // Box-shaped (Command Actions buy marks on the card) but it only
      // empowers Constructs and its payoff comes from *erasing* a mark,
      // so it needs more than the existing `box` descriptor.
    },
  ],
  units: [
    {
      id: "junHorseArchers",
      name: "Jun Horse Archers",
      points: 207,
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      // composite bow, no ammo boxes printed
      ranged: { dice: 4, offensiveSkill: 5, offensivePower: 5, range: 14 },
      defensiveSkill: 1,
      defensivePower: 1,
      courage: 12,
      move: 7,
      damage: { green: 3, yellow: 1, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        {
          name: "Move & Shoot",
          code: "M&S+",
          text: "No Move-and-Shoot penalty.",
          bonus: [0, 1, 0],
          when: ["moveAndShoot"],
          stance: "ranged",
        },
        {
          // a defensive bonus while this unit is the one Charging, which
          // the calculator can't gate on (it reads DS from the card when
          // the unit is the target) — the DS asterisk on the card front
          name: "Charging",
          text: "+1/+0 (DS/Toughness) while Charging.",
        },
        {
          name: "Hired Riders",
          text:
            "At the beginning of any turn that this unit's controller has " +
            "only Jun Horse Archers in play, remove this unit from play.",
        },
      ],
    },
    {
      id: "rocketArrowBattery",
      name: "Rocket Arrow Battery",
      points: 228,
      class: "elite",
      melee: { dice: 4, offensiveSkill: 5, offensivePower: 5 },
      // no Command Cards may be played while it makes a ranged attack
      ranged: {
        dice: 4,
        offensiveSkill: 5,
        offensivePower: 5,
        range: 21,
        noCommandCards: true,
      },
      defensiveSkill: 1,
      defensivePower: 2,
      courage: 11,
      move: 3.5,
      damage: { green: 2, yellow: 2, red: 2 },
      keywords: ["wheeled"],
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(-1) -2/-2 while Engaged.",
          bonus: [-1, -2, -2],
          stance: "melee",
        },
        {
          name: "Short Range",
          code: "SR",
          text:
            "Ranged attacks at Short Range get (+2) +0/+0 and are Line of " +
            "Sight only.",
          bonus: [2, 0, 0],
          whenNot: ["longRange", "extremeRange"],
          stance: "ranged",
        },
        // "No penalties for attacking at Long and Extreme Range" — the
        // band's own penalty is cancelled rather than never applied, so
        // the toggle still reads true and these put the points back
        {
          name: "Long Range",
          code: "LR+",
          text: "No penalty for attacking at Long Range.",
          bonus: [0, 1, 0],
          when: ["longRange"],
          stance: "ranged",
        },
        {
          name: "Extreme Range",
          code: "ER+",
          text: "No penalty for attacking at Extreme Range.",
          bonus: [0, 2, 0],
          when: ["extremeRange"],
          stance: "ranged",
        },
        {
          name: "Move & Shoot",
          text: "Cannot Move-and-Shoot.",
        },
        ...ROCKET_ARROW_BATTERY,
      ],
    },
    {
      id: "terracottaGuardians",
      name: "Terracotta Guardians",
      points: 280,
      melee: { dice: 5, offensiveSkill: 5, offensivePower: 6 },
      defensiveSkill: 1,
      defensivePower: 3,
      // no Courage printed — Constructs pass every Courage Check
      move: 3.5,
      damage: { green: 4, yellow: 5, red: 2 },
      keywords: ["construct", "reliable"],
      // The card prints two Manipulate Qi boxes and a Breakdown box; the
      // OP asterisk points at the army card's rules rather than a line of
      // its own. Both marks are per-copy state the roster doesn't keep
      // yet, so the Construct and Reliable keyword prose carries them.
      abilities: [],
    },
    {
      id: "imperialCavalry",
      name: "Imperial Cavalry",
      points: 274,
      melee: { dice: 3, offensiveSkill: 5, offensivePower: 5 },
      // crossbow, no ammo boxes printed
      ranged: { dice: 3, offensiveSkill: 5, offensivePower: 5, range: 10.5 },
      defensiveSkill: 2,
      defensivePower: 2,
      courage: 12,
      move: 6,
      damage: { green: 3, yellow: 2, red: 2 },
      keywords: ["cavalry"],
      abilities: [
        {
          name: "Engaged",
          code: "ENG",
          text: "(+3) +0/+0 while Engaged.",
          bonus: [3, 0, 0],
          stance: "melee",
        },
        {
          name: "Charging",
          code: "CH+",
          text:
            "(+0) +0/+1 and +1/+0 (DS/Toughness) while Charging, in " +
            "addition to the normal Charging bonus.",
          // only the offensive half feeds the attack — the DS half applies
          // while this unit is the one Charging, which the calculator
          // can't gate on
          bonus: [0, 0, 1],
          when: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
        },
        {
          // conditional on how far it moved, which the app doesn't know —
          // left as prose so it can't fire on its own
          name: "Move & Shoot",
          text:
            "No Move-and-Shoot penalty if it moves at least 1MC below its " +
            "maximum.",
        },
      ],
    },
  ],
};
