# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (ESLint runs via `vite-plugin-eslint`, so lint errors surface on save/HMR)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint over the repo

There is no test runner configured.

## Architecture

BattleDeck is a single-page React helper for the Battleground tabletop wargame (see `docs/battleground-manual.pdf` and `docs/battleground-quick-start-rules.pdf`). It is a tap-friendly tally sheet — no persistence, no routing, no backend. The tally UI lives in `src/App.jsx` and `src/constants.js`; the in-app rules help lives in `src/Help.jsx` and `src/helpContent.js`.

The app computes three derived values from user taps:

- **Dice to roll** = `baseDice + commandCardDice + Σ situationalModifiers[0]` (clamped `[0, MAX_DICE=20]`)
- **Roll to hit** = `offensiveSkill − defensiveSkill + commandCardOS + Σ situationalModifiers[1]` (clamped `[1, 5]`; 1 always hits, 6 always misses per game rules)
- **Roll to wound** = `offensivePower − defensivePower + commandCardOP + Σ situationalModifiers[2]` (clamped `[1, 5]`)

When an unclamped hit/wound total exceeds 5, the breakdown shows an `OK:` line for the game's Overkill rule (each point over 5 turns one rolled 6 into a 5); the big number stays clamped at 5.

Skill/Power counters wrap modulo `MAX_ROLL=10` — tapping them only increments; there is no dedicated decrement UI for those ranks.

### Modifier model (`src/constants.js`)

`MODIFIERS` and `COMMAND_CARD_MODIFIERS` drive nearly all UI. The Command Card buttons represent the effects of Command Cards played during an attack. Each situational modifier is a `[dice, offensiveSkill, offensivePower]` triple plus:

- `position` — render order in the 5-column grid (`chunk(values(modifiers), 5)`)
- `on` — toggle state
- `count` / `maxCount` — optional; a modifier with `maxCount` stacks instead of toggling: taps cycle `count` `0 → 1 → … → maxCount → 0`, its triple is multiplied by `count`, and `on` is true while `count > 0`. Only `pinching` uses this (the rulebook gives +1/+1 per engaged side beyond the first).
- `disabled: [otherIds]` — when any listed modifier is `on`, this one is disabled. `App.jsx` computes `disabledModifiers` by `some(pick(status, mod.disabled))`. Mutual exclusions must be declared on both sides (e.g. `inTheYellow` ↔ `inTheRed`). Engaged-only modifiers (flanking, pinching, charging, `targetHighGround`, …) and ranged-only modifiers (range bands, `softCover`/`hardCover`, …) suppress each other since an attack is either melee or ranged.
- `code` — short label shown in the derived-value breakdown
- `reset` — special id; toggling it re-hydrates `MODIFIERS` to defaults
- `frightened` — special: when on, disables the Command Card buttons and clears command card state (per the rules, a Frightened unit can't have Command Cards played on it that turn)

When adding a new modifier: give it a unique `position`, add it to any relevant `disabled` arrays on peers, and if it should suppress or be suppressed by others make sure both sides list each other.

### Rules help (`src/Help.jsx` + `src/helpContent.js`)

The header `?` button opens a full-screen help overlay covering the turn sequence. Since there is no router, `Help.jsx` navigates a page-id stack (link cards push, back links pop; backing out of the root closes the overlay). `helpContent.js` holds the page tree — condensed from `docs/battleground-rules-summary.md` / `docs/battleground-quick-start-summary.md` — rooted at `HELP_ROOT`; a page's `links` reference deeper pages by id and render cards using the target page's `title`/`icon`, so keep those fields on every page. Content edits should stay consistent with the rules summaries in `docs/`.

### Styling — grimdark theme

Tailwind (`tailwind.config.js` scans `./src/**/*.{js,jsx}`) with `classnames` for conditional classes. Mobile-first: `max-w-md` column, sticky derived-value header, `min-h-dvh` + safe-area padding, installable via `public/manifest.webmanifest` (no service worker). Cinzel display font loads from Google Fonts in `index.html`.

Custom palette lives in `tailwind.config.js` (`iron`, `ember`, `blood`, `steel`, `moss`, `bone`) plus keyframes (`number-in`, `ember-pulse`, `blood-pulse`, `flicker`). Metal-plate button styles are the `.plate*` classes in `src/index.css`. The `color` values in `constants.js` (`bg-green-400` = bonus, `bg-red-400` = penalty, `bg-yellow-400` = reset) are **semantic tokens only** — `App.jsx` maps them to plate styles via `PLATE_ON`; they are not rendered as Tailwind classes.

### Interaction: sounds, haptics, gestures

- `src/sounds.js` — Web Audio-synthesized taps (no assets): `playDrum` (dice/reset), `playBonus` (sword-ring), `playPenalty` (clank), `playTick` (off/rank taps); mute persists to localStorage; `buzz()` wraps `navigator.vibrate`.
- `src/hooks.js` — `usePressable({ onTap, onHold, repeat })` pointer-gesture hook. Rank buttons: tap = +1, hold = −1 (rank handlers use `(x + mod + MAX_ROLL) % MAX_ROLL` so decrement wraps correctly). Dice ±: hold to auto-repeat.
- `src/Artwork.jsx` — original hand-drawn SVG banner art. `scripts/generate-art.mjs` generates painted replacements via the OpenAI Images API (`OPENAI_API_KEY`); prompts intentionally avoid Battleground/Your Move Games trade dress.

### ESLint

Flat config in `eslint.config.js` (React + hooks + refresh) — used by both `npm run lint` and the Vite plugin.
