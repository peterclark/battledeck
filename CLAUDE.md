# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (ESLint runs via `vite-plugin-eslint`, so lint errors surface on save/HMR)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint over the repo
- `npm test` — run the Vitest suite once (`npm run test:watch` to watch)

## Architecture

BattleDeck is a single-page React helper for the Battleground tabletop wargame (see `docs/battleground-manual.pdf` and `docs/battleground-quick-start-rules.pdf`). It is a tap-friendly tally sheet — no routing, no backend; mid-game state persists to localStorage via `src/persistence.js` (dynamic modifier bits are re-hydrated onto the current `MODIFIERS` defaults so schema changes can't break the grid). The tally UI lives in `src/App.jsx` and `src/constants.js`; unit stat cards live in `src/data/`; the in-app rules help lives in `src/Help.jsx` and `src/helpContent.js`.

The app computes three derived values from user taps:

- **Dice to roll** = `baseDice + commandCardDice + Σ situationalModifiers[0]` (clamped `[0, MAX_DICE=20]`)
- **Roll to hit** = `offensiveSkill − defensiveSkill + commandCardOS + Σ situationalModifiers[1]` (clamped `[1, 5]`; 1 always hits, 6 always misses per game rules)
- **Roll to wound** = `offensivePower − defensivePower + commandCardOP + Σ situationalModifiers[2]` (clamped `[1, 5]`)

When an unclamped hit/wound total exceeds 5, the breakdown shows an `OK:` line for the game's Overkill rule (each point over 5 turns one rolled 6 into a 5); the big number stays clamped at 5.

Skill/Power counters wrap modulo `MAX_ROLL=10` — tapping them only increments; there is no dedicated decrement UI for those ranks.

### Modifier model (`src/constants.js`)

`MODIFIERS` and `COMMAND_CARD_MODIFIERS` drive nearly all UI. The Command Card buttons represent the effects of Command Cards played during an attack. Plays are kept as a log (`playedCards`, an ordered array of card ids), not a net total: each play renders a removable chip under the buttons and its own `±N CC` breakdown line, so opposing cards stay visible even when their effects cancel. Frightened and the Command Card Reset clear the log. Each situational modifier is a `[dice, offensiveSkill, offensivePower]` triple plus:

- `position` — render order in the 5-column grid (`chunk(values(modifiers), 5)`)
- `on` — toggle state
- `count` / `maxCount` — optional; a modifier with `maxCount` stacks instead of toggling: taps cycle `count` `0 → 1 → … → maxCount → 0`, its triple is multiplied by `count`, and `on` is true while `count > 0`. Only `pinching` uses this (the rulebook gives +1/+1 per engaged side beyond the first).
- `disabled: [otherIds]` — when any listed modifier is `on`, this one is disabled. `App.jsx` computes `disabledModifiers` by `some(pick(status, mod.disabled))`. Mutual exclusions must be declared on both sides (e.g. `inTheYellow` ↔ `inTheRed`). Engaged-only modifiers (flanking, pinching, charging, `targetHighGround`, …) and ranged-only modifiers (range bands, `softCover`/`hardCover`, …) suppress each other since an attack is either melee or ranged.
- `code` — short label shown in the derived-value breakdown
- `reset` — special id; toggling it re-hydrates `MODIFIERS` to defaults
- `frightened` — special: when on, disables the Command Card buttons and clears command card state (per the rules, a Frightened unit can't have Command Cards played on it that turn)

When adding a new modifier: give it a unique `position`, add it to any relevant `disabled` arrays on peers, and if it should suppress or be suppressed by others make sure both sides list each other.

### Unit data (`src/data/`)

Faction unit cards transcribed from the physical game cards, one file per faction under `src/data/factions/` (front of card: stat bar + green/yellow/red damage track; back: points, deck class, abilities). `src/data/index.js` flattens them into `UNITS`/`UNITS_BY_UID` — unit ids are unique per faction and the derived `uid` (`factionId/unitId`) is what selection state and persistence store. Add a faction by adding a file and listing it in `FACTIONS`; `src/data/data.test.js` validates every unit's schema (stat ranges, damage boxes, ability shape) so transcription typos fail the suite.

A unit's `melee`/`ranged` attack profiles are `{ dice, offensiveSkill, offensivePower }` (ranged adds `range` in inches and `ammo`); the stat bar reads sword group = (dice) OS/OP, shield group = DS/Toughness. `defensiveSkill`/`defensivePower` apply whenever the unit is the target. Shared rules live in `src/data/keywords.js` (the game's Unit Keywords cards — Spears, Cavalry, …); units reference them via `keywords: [ids]`, while a card back's own extras stay in the unit's `abilities`. Army-wide rules (e.g. Hawkshold Bravery) are the faction object's `abilities` — informational, rendered under the faction header in the picker. Effects (unit abilities and keyword `effects`) may carry a structured `bonus` (`[dice, OS, OP]` triple) gated by any combination of: `when` (modifier ids — live while any is on), `stance` (`"melee"`/`"ranged"` — e.g. the archers' Engaged penalty), and `whenTarget` (keyword ids — live while the selected defender has one, e.g. Spears' +1 OS vs Cavalry). Live effects feed the derived values with their own breakdown lines; prose-only rules (no `bonus`) are informational. Don't transcribe card flavor text — stats and rule effects only.

The battle screen's Units row (`UnitSlot` in `App.jsx` + `src/UnitPicker.jsx` overlay) selects an attacker and defender. Selection *prefills* dice/OS/OP (attacker, per current stance, switching stance if the unit can't attack in it) or DS/DP (defender) — every value stays hand-adjustable, and clearing a slot keeps the numbers. Switching melee/ranged re-applies the attacker's matching profile when it has one. Once an army is built, the picker narrows to roster units (with per-unit ×N counts) and offers a "Show all units" toggle — needed when the defender is an enemy unit; with no army it shows everything.

### Army builder (`src/ArmyBuilder.jsx`)

The header banner button opens a full-screen roster: a point budget (250-point steps, clamped `[BUDGET_MIN, BUDGET_MAX]`), per-unit −/count/+ rows, the running total/remaining, and the Command Actions per turn (`⌊budget / 500⌋`, per the rules). The Unique keyword caps a unit at one copy (`MAX_COPIES` otherwise). The roster persists under its own localStorage key (`loadArmy`/`saveArmy` in `persistence.js`, validated on load) so battle-screen resets never touch it. The full-screen overlays (help, unit picker, army builder) share modal behavior via `useModalOverlay` in `src/hooks.js`.

Each fielded copy renders a tappable damage track (tap box N = mark through N; tap the last marked box to heal it) with its status per the rules (`damageStatus` in `src/data/index.js`: all green marked = In the Yellow, green+yellow = In the Red, all = destroyed). Marks live in the army record (`marks[uid][copyIndex]`). The unit picker lists one row per fielded copy (`#1`/`#2`, damage shown); selection stores `attackerCopy`/`defenderCopy` alongside the uids, and selecting an attacker copy — or closing the army builder with one selected — *prefills* the `inTheYellow`/`inTheRed` modifiers from that copy's marks (same prefill-not-lock philosophy as stats). Slots show the copy's `marked/total` and status.

### Rules help (`src/Help.jsx` + `src/helpContent.js`)

The header `?` button opens a full-screen help overlay covering the turn sequence. Since there is no router, `Help.jsx` navigates a page-id stack (link cards push, back links pop; backing out of the root closes the overlay). `helpContent.js` holds the page tree — condensed from `docs/battleground-rules-summary.md` / `docs/battleground-quick-start-summary.md` — rooted at `HELP_ROOT`; a page's `links` reference deeper pages by id and render cards using the target page's `title`/`icon`, so keep those fields on every page. Content edits should stay consistent with the rules summaries in `docs/`.

A section item is either a plain string or `{ text, actions: [modifierIds] }`. Items with `actions` render live toggle chips beside the rule, wired to the real modifier state (`App.jsx` passes `modifiers`/`disabledModifiers`/`activateModifier` into `Help`). Toggling a stance-specific modifier from help switches the melee/ranged mode first so the toggle stays visible on the battle screen. Never reference `reset` from `actions`.

### Styling — grimdark theme

Tailwind (`tailwind.config.js` scans `./src/**/*.{js,jsx}`) with `classnames` for conditional classes. Mobile-first: `max-w-md` column, sticky derived-value header, `min-h-dvh` + safe-area padding, installable via `public/manifest.webmanifest` (no service worker). Cinzel display font loads from Google Fonts in `index.html`.

Custom palette lives in `tailwind.config.js` (`iron`, `ember`, `blood`, `steel`, `moss`, `bone`) plus keyframes (`number-in`, `ember-pulse`, `blood-pulse`, `flicker`). Metal-plate button styles are the `.plate*` classes in `src/index.css`. The `color` values in `constants.js` (`bg-green-400` = bonus, `bg-red-400` = penalty, `bg-yellow-400` = reset) are **semantic tokens only** — the `PLATE_ON` map in `constants.js` converts them to plate styles (used by both the modifier grid and the help action chips); they are not rendered as Tailwind classes.

### Interaction: sounds, haptics, gestures

- `src/sounds.js` — Web Audio-synthesized taps (no assets): `playDrum` (dice/reset), `playBonus` (sword-ring), `playPenalty` (clank), `playTick` (off/rank taps); mute persists to localStorage; `buzz()` wraps `navigator.vibrate`.
- `src/hooks.js` — `usePressable({ onTap, onHold, repeat })` pointer-gesture hook. Rank buttons: tap = +1, hold = −1 (rank handlers use `(x + mod + MAX_ROLL) % MAX_ROLL` so decrement wraps correctly). Dice ±: hold to auto-repeat.
- `src/Artwork.jsx` — original hand-drawn SVG banner art. `scripts/generate-art.mjs` generates painted replacements via the OpenAI Images API (`OPENAI_API_KEY`); prompts intentionally avoid Battleground/Your Move Games trade dress.

### ESLint

Flat config in `eslint.config.js` (React + hooks + refresh) — used by both `npm run lint` and the Vite plugin.
