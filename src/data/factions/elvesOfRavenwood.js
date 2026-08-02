// Elves of Ravenwood unit cards, transcribed from the physical cards
// (2006 printing — like the Dwarves of Runegard these predate the Unit
// Keywords cards, so shared rules are spelled out on the card backs).
//
// TRANSCRIPTION IN PROGRESS — the two faction rules cards are in; the
// unit cards follow, so this faction is not yet listed in FACTIONS (an
// empty faction would render an empty row in the picker and army
// builder).

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
  units: [],
};
