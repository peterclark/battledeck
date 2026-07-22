# BattleDeck

A tap-friendly attack calculator for the **Battleground: Fantasy Warfare** tabletop
wargame (Your Move Games). Tap in your unit's attack dice, Skill/Power ranks, command
card effects, and situational modifiers — BattleDeck derives the number of dice to
roll, the roll-to-hit target, and the roll-to-wound target, with a breakdown of every
contributing modifier.

Single-page React + Vite + Tailwind. No persistence, no backend — designed to sit on
a phone or tablet next to the table.

The UI uses an "arcane tactics HUD" theme: a modern card-game interface with
deep navy surfaces, glowing teal/rose key states, springy pop animations,
synthesized click/chime tap sounds (mutable, top-right toggle), haptic feedback,
and long-press gestures — tap a Skill/Power rank to raise it, hold to lower it;
hold the dice buttons to auto-repeat. Add it to your phone's home screen for a
full-screen table companion.

## Commands

- `npm run dev` — start the Vite dev server
- `npm run build` — production build to `dist/`
- `npm run preview` — serve the built bundle locally
- `npm run lint` — run ESLint
- `OPENAI_API_KEY=... node scripts/generate-art.mjs` — generate original painted artwork to replace the built-in SVG art

## Reference

- [CLAUDE.md](CLAUDE.md) — architecture notes and the modifier model
- [docs/battleground-rules-summary.md](docs/battleground-rules-summary.md) — condensed main-rulebook reference
- [docs/battleground-quick-start-summary.md](docs/battleground-quick-start-summary.md) — quick-start rules summary
- [docs/code-review.md](docs/code-review.md) — code review notes
- `docs/*.pdf` — the official rulebooks
