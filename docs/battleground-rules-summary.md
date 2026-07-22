# Battleground: Fantasy Warfare — Rules Summary (Main Rulebook V4.0)

Condensed reference derived from `docs/battleground-manual.pdf` (Your Move Games).
Focused on the mechanics that BattleDeck models: attack dice, to-hit, to-wound, and
combat modifiers. See the PDF for full rules, movement, terrain, and keywords.

## Game overview

Battleground is a two-player tabletop wargame where units are represented by cards
instead of miniatures. Each player commands an army; units act on **standing orders**
written on their cards with dry-erase markers, and the player intervenes via
**Command Actions** and **Command Cards**. Victory is typically achieved by destroying
a points threshold of the opposing army.

## Unit stats (stat bar)

| Stat | Role |
|---|---|
| Attack Dice | Number of d6 rolled when attacking (shown in parentheses) |
| Offensive Skill (OS) | Attacker's skill for the to-hit roll |
| Power (OP) | Attacker's strength for the to-wound roll |
| Defensive Skill (DS) | Subtracted from attacker's OS |
| Toughness | Subtracted from attacker's Power |
| Range | Ranged attack distance (— if none) |
| Courage | Target number for courage checks (roll 3d6 ≤ courage to pass) |
| Movement | Movement Category in inches |

Damage boxes are Green → Yellow → Red. A unit with all Green boxes marked is
**In the Yellow**; with all Green and Yellow marked it is **In the Red**; with all
boxes marked it is destroyed.

## Turn sequence

1. **Movement & Command Phase** — active player gains and spends Command Actions,
   Final Rush movement, normal movement, non-attack spells.
2. **Pre-Combat Courage Phase** — rout checks, fear checks, free attacks, rout movement.
3. **Combat Phase** — choose targets; active player's units attack, then inactive
   player's units. All attacks are simultaneous in effect.
4. **Post-Combat Courage Phase** — rout checks from damage, free attacks, rout movement.
5. **End of Turn Phase**

## Unit status

- **Ready** — in good order; follows its standing order.
- **Disrupted** — will to fight is shaken; won't move on its own, fights at a penalty
  (see modifier table), cannot make ranged attacks. Reorganize costs 2 Command Actions.
- **Routing** — broken and fleeing; moves automatically, does not fight, destroyed if it
  fails another rout check.

## Command Actions

Gained each turn (1 per 500 points of army budget; scenarios may override). Spent on:

- **Change Standing Order** (1 CA) — rewrite a unit's order (not while engaged).
- **Direct Control** (1 CA; +1 more if Disrupted) — move/maneuver one unit freely this
  turn and choose its targets.
- **Draw Command Card** (1 CA) — hand limit 15.
- **Faction Abilities** (varies).
- **Rally** (1 CA) — stop a routing unit; it reforms with a Hold order and can't act
  this turn.
- **Reload** (1 CA) — erase one marked Ammo Box.
- **Reorganize** (2 CA) — Disrupted → Ready (not while engaged).
- **Sound the Charge** (all CAs) — mass order change to Close/Ranged, rally all routers,
  reorganize all unengaged Disrupted units.

Unused Command Actions are lost at end of phase.

## The attack sequence

1. **To-Hit roll** — target number = attacker OS − defender DS ± modifiers.
   Roll dice equal to the unit's Attack Dice stat ± modifiers.
   Each die ≤ target number is a hit.
2. **To-Wound roll** — target number = attacker Power − defender Toughness ± modifiers.
   Roll one die per hit. Each die ≤ target number is a wound.
3. **Damage Modification** — special rules, then Command Cards adjust the total.
4. **Attack Resolution** — defender marks one damage box per wound; ranged attackers
   mark an Ammo Box.

Universal special rules:

- **1s always succeed** — a die roll of 1 is always a success, even if the target
  number is 0 or less.
- **Overkill** — a 6 is always a failure, but if the target number exceeds 5, one die
  showing 6 becomes a 5 per point above 5.
- Modifiers affect the **target number** (the unit's stats), not the dice, unless a
  card explicitly says otherwise.

Each player may play one Command Card per attack sequence (attacker offers red cards,
defender blue).

## Combat modifiers

Notation: `(±dice) ±OS / ±OP` — the triple BattleDeck stores as `[dice, os, op]`.
All modifiers are cumulative.

### General (engaged and ranged)

| Modifier | Dice | OS | OP | Notes |
|---|---|---|---|---|
| Disrupted | −1 | −1 | −1 | |
| Frightened | — | — | — | Failed a fear check: no Command Cards on this unit this turn |
| In the Yellow | −1 | 0 | 0 | Also −1 Courage |
| In the Red | −2 | 0 | 0 | Also −2 Courage |
| High Ground | — | — | — | Defender gets +1 DS vs engaged attacks; shifts range bands ±3.5″ |
| Soft Cover | — | — | — | Defender +1 DS vs ranged |
| Hard Cover | — | — | — | Defender +2 DS vs ranged |

### Engaged (melee) only

| Modifier | Dice | OS | OP | Notes |
|---|---|---|---|---|
| Attacking to your Flank | −1 | 0 | 0 | Enemy engaged on your flank |
| Attacking to your Rear | 0 | −1 | −1 | Enemy engaged on your rear |
| Charging (4+ base attacks) | +2 | 0 | 0 | Close order + Final Rush this turn |
| Charging (1–3 base attacks) | +1 | 0 | 0 | |
| Charging Cavalry | — | — | — | One Impact Hit (add one automatic hit) |
| Flanking | 0 | +1 | 0 | You're on the enemy's flank |
| Pinching | 0 | +1 | +1 | Enemy engaged on 2+ sides; stacks per extra side |
| Rear Attacking | 0 | +1 | +1 | You're on the enemy's rear |

### Ranged only

| Modifier | Dice | OS | OP | Notes |
|---|---|---|---|---|
| Cavalry Target | 0 | −1 | 0 | Target has Cavalry keyword |
| Colossal Target | 0 | +2 | 0 | Target has Colossal keyword |
| Extreme Range | 0 | −2 | 0 | Target beyond 14″ |
| Fast Moving Target | 0 | −1 | 0 | Target's current Movement Category ≥ 7″ |
| Large Target | 0 | +1 | 0 | Target has Large keyword |
| Long Range | 0 | −1 | 0 | Target beyond 7″, within 14″ |
| Move and Shoot | 0 | −1 | 0 | Attacker moved (or its order would move it) |
| Not Nearest Enemy | 0 | −1 | 0 | Shooting past a closer enemy (order modifier) |

## Courage checks

Roll 3d6; pass if the total is **at or under** the unit's Courage stat.
Modifiers: In the Yellow −1, In the Red −2, charged by a Terrifying unit −1.

Rout checks are triggered by: being Pinched (or Final Rushed while pinched), marking the
last Green box, marking the last Yellow box, or marking any Red box. Failing one:

- Engaged unit → Routs (about-faces, still engaged).
- Unengaged + Ready → becomes Disrupted.
- Unengaged + Disrupted → Routs.
- Routing → destroyed.

Units engaged with a routing unit make **free attacks** against it (usually with the
Rear Attacking bonus).

## Ammo boxes

Each ranged attack marks one Ammo Box; when all are marked the unit can't shoot until
Reloaded. Box count depends on attack type and range (e.g. Indirect Fire/Low Arc: 6 at
range ≥14″, 4 at ≤10.5″; Line of Sight: 4/3; Javelin/Pila: 1).
