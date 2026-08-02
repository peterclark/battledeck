// Wuxing unit cards, transcribed from the physical cards (2014 printing).
//
// TRANSCRIPTION IN PROGRESS — the army-ability and special-unit-rules cards
// are in; the unit cards are still to come, so this faction is not yet
// listed in FACTIONS (an empty faction would render an empty row in the
// picker and army builder).
//
// Two rules on these cards need per-copy roster state the app doesn't
// track yet, so they are prose-only for now and noted where they sit:
// the Construct Breakdown mark and the Manipulate Qi boxes.

// Special Unit Rules card — attached to the Rocket Arrow Battery unit
// when its card is transcribed. Prose only: the shooting restriction is a
// targeting rule, and Friendly Fire resolves its own separate attacks
// (a d6-2 count of (*) 5/5 attacks) rather than modifying this one.
export const ROCKET_ARROW_BATTERY = [
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

// Special Unit Rules card — attached to the Shanzhi Monks unit when its
// card is transcribed. The stance/upgrade choice is per-turn roster state
// the app doesn't model, so the upgrades stay prose.
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
  units: [],
};
