# BattleDeck

A tap-friendly attack calculator for the **Battleground: Fantasy Warfare** tabletop
wargame (Your Move Games). Tap in your unit's attack dice, Skill/Power ranks, command
card effects, and situational modifiers — BattleDeck derives the number of dice to
roll, the roll-to-hit target, and the roll-to-wound target, with a breakdown of every
contributing modifier.

Single-page React + Vite + Tailwind. No persistence, no backend — designed to sit on
a phone or tablet next to the table.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint

## Reference

- [CLAUDE.md](CLAUDE.md) — architecture notes and the modifier model
- [docs/battleground-rules-summary.md](docs/battleground-rules-summary.md) — condensed main-rulebook reference
- [docs/battleground-quick-start-summary.md](docs/battleground-quick-start-summary.md) — quick-start rules summary
- [docs/code-review.md](docs/code-review.md) — code review notes
- `docs/*.pdf` — the official rulebooks
