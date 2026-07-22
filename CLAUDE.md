# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Vite dev server (ESLint runs via `vite-plugin-eslint`, so lint errors surface on save/HMR)
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint over the repo

There is no test runner configured.

## Architecture

BattleDeck is a single-page React helper for the Battleground tabletop wargame (see `docs/battleground-manual.pdf` and `docs/battleground-quick-start-rules.pdf`). It is a tap-friendly tally sheet — no persistence, no routing, no backend. Everything lives in `src/App.jsx` and `src/constants.js`.

The app computes three derived values from user taps:

- **Dice to roll** = `baseDice + commandActionDice + Σ situationalModifiers[0]` (clamped `[0, MAX_DICE=20]`)
- **Roll to hit** = `offensiveSkill − defensiveSkill + commandActionOS + Σ situationalModifiers[1]` (clamped `[1, 5]`; 1 always hits, 6 always misses per game rules)
- **Roll to wound** = `offensivePower − defensivePower + commandActionOP + Σ situationalModifiers[2]` (clamped `[1, 5]`)

Skill/Power counters wrap modulo `MAX_ROLL=10` — tapping them only increments; there is no dedicated decrement UI for those ranks.

### Modifier model (`src/constants.js`)

`MODIFIERS` and `COMMAND_ACTION_MODIFIERS` drive nearly all UI. Each situational modifier is a `[dice, offensiveSkill, offensivePower]` triple plus:

- `position` — render order in the 5-column grid (`chunk(values(modifiers), 5)`)
- `on` — toggle state
- `disabled: [otherIds]` — when any listed modifier is `on`, this one is disabled. `App.jsx` computes `disabledModifiers` by `some(pick(status, mod.disabled))`. Mutual exclusions must be declared on both sides (e.g. `inTheYellow` ↔ `inTheRed`).
- `code` — short label shown in the derived-value breakdown
- `reset` — special id; toggling it re-hydrates `MODIFIERS` to defaults
- `frightened` — special: when on, disables the Command Action buttons and clears CA state

When adding a new modifier: give it a unique `position`, add it to any relevant `disabled` arrays on peers, and if it should suppress or be suppressed by others make sure both sides list each other.

### Styling

Tailwind (`tailwind.config.js` scans `./src/**/*.{js,jsx}`) with `classnames` for conditional classes. Colors follow a convention: `bg-green-400` for beneficial modifiers, `bg-red-400` for penalties, `bg-yellow-400` for reset/clear controls. Layout is a vertical flex stack sized to the viewport.

### ESLint

Flat config in `eslint.config.js` (React + hooks + refresh). `.eslintrc` (`extends: react-app`) also exists but the flat config is what `npm run lint` and the Vite plugin use.
