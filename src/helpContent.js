import {
  GiBootPrints,
  GiCardPlay,
  GiCrossedSwords,
  GiFlyingFlag,
  GiHeartShield,
  GiHourglass,
  GiRollingDices,
  GiRun,
  GiScrollUnfurled,
  GiShatteredHeart,
  GiSwordBrandish,
  GiTrumpetFlag,
} from "react-icons/gi";

// In-app rules help, condensed from docs/battleground-rules-summary.md and
// docs/battleground-quick-start-summary.md. Pages form a tree rooted at
// HELP_ROOT: `links` entries point at deeper pages by id (the card's title
// and icon come from the target page), `sections` hold the page's own text.
// An item is either a plain string or `{ text, actions: [modifierIds] }` —
// actions render live battle-screen toggle chips beside the rule.
export const HELP_ROOT = "turnOverview";

export const HELP_PAGES = {
  turnOverview: {
    title: "Your Turn",
    icon: GiScrollUnfurled,
    blurb:
      "Each turn runs through five phases in order. Tap a phase for the details.",
    numbered: true,
    links: [
      { to: "movementCommand", note: "Spend Command Actions and move" },
      { to: "preCombatCourage", note: "Nerve is tested before blades fall" },
      { to: "combat", note: "Both armies attack — effects are simultaneous" },
      { to: "postCombatCourage", note: "Battered units check their nerve" },
      { to: "endOfTurn", note: "Wrap up and pass the turn" },
    ],
  },

  movementCommand: {
    title: "Movement & Command",
    icon: GiBootPrints,
    blurb: "Issue commands, then let your standing orders march the army.",
    sections: [
      {
        heading: "In order",
        items: [
          "Gain Command Actions — 1 per 500 points of army budget (the quick-start scenarios grant 2).",
          "Spend Command Actions: change orders, direct control, draw Command Cards, rally, and more.",
          "Final Rush — units on a Close order charge into contact with enemies in reach.",
          "Normal movement — every other unit moves as its standing order directs.",
          "Cast non-attack spells.",
        ],
      },
    ],
    links: [
      { to: "commandActions", note: "What a Command Action buys" },
      { to: "standingOrders", note: "Close, Range, and Hold" },
      { to: "finalRush", note: "Charging into contact" },
    ],
  },

  preCombatCourage: {
    title: "Pre-Combat Courage",
    icon: GiHeartShield,
    blurb: "Before any dice are rolled, shaken units decide whether to stand.",
    sections: [
      {
        heading: "In this phase",
        items: [
          "Pinched units — engaged on 2+ sides where a pincher Final Rushed this turn — take a rout check.",
          {
            text: "Fear checks against frightening enemies. A failed check makes the unit Frightened: no Command Cards may be played on it this turn (BattleDeck's Frightened button models this).",
            actions: ["frightened"],
          },
          "Units engaged with a routing enemy make free attacks against it.",
          "Routing units make their rout move.",
        ],
      },
    ],
    links: [{ to: "courageRouting", note: "Checks, triggers, and routing" }],
  },

  combat: {
    title: "Combat",
    icon: GiCrossedSwords,
    blurb:
      "The phase BattleDeck is built for — its Dice, Hit, and Wound numbers drive every attack here.",
    sections: [
      {
        heading: "In this phase",
        items: [
          "Both players choose targets for their engaged and shooting units.",
          "The active player's units attack first, then the inactive player's.",
          "All attacks are simultaneous in effect — damage counts only after every attack resolves, so a dying unit still swings back.",
          "Each ranged attack marks an Ammo Box; a unit with all boxes marked can't shoot until it Reloads.",
        ],
      },
    ],
    links: [
      { to: "attackSequence", note: "To-hit, to-wound, and Overkill" },
      { to: "commandCards", note: "One card per player, per attack" },
    ],
  },

  postCombatCourage: {
    title: "Post-Combat Courage",
    icon: GiShatteredHeart,
    blurb: "Units mauled in combat check whether they hold the line.",
    sections: [
      {
        heading: "In this phase",
        items: [
          "Units that marked their last Green box, last Yellow box, or any Red box take a rout check (multiple triggers in one phase still mean just one check).",
          {
            text: "Units engaged with a newly routing enemy make free attacks — usually with the Rear Attack bonus.",
            actions: ["rearAttacking"],
          },
          "Routing units make their rout move toward their own table edge.",
        ],
      },
    ],
    links: [{ to: "courageRouting", note: "Checks, triggers, and routing" }],
  },

  endOfTurn: {
    title: "End of Turn",
    icon: GiHourglass,
    blurb: "The quiet phase — tidy up and hand over.",
    sections: [
      {
        heading: "In this phase",
        items: [
          "Resolve any card or spell effects that trigger at end of turn.",
          "Unused Command Actions are lost — they don't carry over.",
          "Play passes to your opponent, who becomes the active player.",
        ],
      },
    ],
  },

  commandActions: {
    title: "Command Actions",
    icon: GiTrumpetFlag,
    blurb:
      "Your general's attention each turn. Spend them in the Movement & Command Phase or lose them.",
    sections: [
      {
        heading: "Spend on",
        items: [
          "Change Standing Order (1 CA) — rewrite a unit's order; not while engaged.",
          "Direct Control (1 CA, +1 if Disrupted) — move one unit freely this turn and choose its targets.",
          "Draw a Command Card (1 CA) — hand limit 15.",
          "Rally (1 CA) — stop a routing unit; it reforms on Hold and can't act this turn.",
          "Reload (1 CA) — erase one marked Ammo Box.",
          {
            text: "Reorganize (2 CA) — Disrupted becomes Ready; not while engaged.",
            actions: ["disrupted"],
          },
          "Sound the Charge (all CAs) — mass order change to Close/Ranged, rally all routers, reorganize all unengaged Disrupted units.",
          "Faction abilities (cost varies).",
        ],
      },
    ],
  },

  standingOrders: {
    title: "Standing Orders",
    icon: GiFlyingFlag,
    blurb:
      "Written on each unit card in dry-erase marker — the unit follows its order until you spend a Command Action to change it.",
    sections: [
      {
        heading: "The orders",
        items: [
          "C — Close: advance on the nearest visible enemy and engage in melee. Becoming engaged counts as charging that turn.",
          "R — Range: shoot the nearest visible enemy; move toward it if out of range.",
          "H — Hold: stay put, but still shoot and fight if able. Some units gain bonuses while Holding (e.g. spearmen vs charging cavalry).",
        ],
      },
    ],
  },

  finalRush: {
    title: "Final Rush",
    icon: GiSwordBrandish,
    blurb: "How a unit on Close crashes into contact.",
    sections: [
      {
        heading: "The rush",
        items: [
          "Only units with a Close order Final Rush.",
          "If a visible enemy's facing side is within the unit's Movement stat, pick the unit up and place it in contact with as much of that side as possible.",
          "If the facing side was blocked at the start of the turn, the unit may rush the nearest open side instead.",
          "With two enemies in reach, rush the nearest — you pick on ties.",
          {
            text: "Rushing into contact counts as charging: tap Charging in BattleDeck for the bonus dice.",
            actions: ["chargingFourOrMoreDice", "chargingThreeOrLessDice"],
          },
        ],
      },
    ],
  },

  attackSequence: {
    title: "The Attack Sequence",
    icon: GiRollingDices,
    blurb:
      "Every attack is the same four steps — BattleDeck's three big numbers do this math for you.",
    sections: [
      {
        heading: "The steps",
        items: [
          "To-Hit — roll your Attack Dice; each die at or under (your OS − their DS ± modifiers) is a hit.",
          "To-Wound — roll one die per hit; each die at or under (your Power − their Toughness ± modifiers) is a wound.",
          "Damage Modification — special rules apply first, then Command Cards adjust the total.",
          "Resolution — the defender marks one damage box per wound; ranged attackers mark an Ammo Box.",
        ],
      },
      {
        heading: "Always true",
        items: [
          "A roll of 1 always succeeds, even if the target number is 0 or less.",
          "A roll of 6 always fails — but past a target number of 5, Overkill turns one rolled 6 into a 5 per point over (the OK: line in BattleDeck's breakdown).",
          "Modifiers change target numbers, not dice — unless a card says otherwise.",
        ],
      },
    ],
    links: [{ to: "commandCards", note: "Played during the attack" }],
  },

  commandCards: {
    title: "Command Cards",
    icon: GiCardPlay,
    blurb: "A general's tricks, played mid-attack to swing the odds.",
    sections: [
      {
        heading: "Playing cards",
        items: [
          "Each player may play one Command Card per attack sequence — the attacker offers red cards, the defender blue.",
          "Drawing a card costs 1 Command Action; your hand limit is 15.",
          "A Frightened unit can't have Command Cards played on it this turn — BattleDeck disables the Command Card buttons while Frightened is lit.",
          "Track a card's dice, OS, and OP effects with BattleDeck's Command Card buttons.",
        ],
      },
    ],
  },

  courageRouting: {
    title: "Courage & Routing",
    icon: GiRun,
    blurb: "When the dying starts, courage decides who stays.",
    sections: [
      {
        heading: "The check",
        items: [
          "Roll 3d6 — pass if the total is at or under the unit's Courage stat.",
          {
            text: "In the Yellow −1 Courage, In the Red −2, charged by a Terrifying unit −1.",
            actions: ["inTheYellow", "inTheRed"],
          },
        ],
      },
      {
        heading: "Rout checks trigger on",
        items: [
          "Being pinched (or Final Rushed while pinched).",
          "Marking the last Green box, the last Yellow box, or any Red box.",
        ],
      },
      {
        heading: "Failing one",
        items: [
          "Engaged unit — routs: about-faces, still engaged, and every engaged enemy gets a free attack.",
          {
            text: "Unengaged and Ready — becomes Disrupted.",
            actions: ["disrupted"],
          },
          "Unengaged and Disrupted — routs.",
          "Already routing — destroyed.",
          "Rallying a router costs 1 Command Action; it reforms on Hold and can't act that turn.",
        ],
      },
    ],
  },
};
