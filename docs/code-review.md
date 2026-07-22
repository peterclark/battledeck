# BattleDeck Code Review

Review of the codebase (July 2026), cross-checked against `CLAUDE.md` and the
Battleground rulebooks in `docs/`. Companion references:
`battleground-rules-summary.md` and `battleground-quick-start-summary.md`.

## What the app is

A single-page React tally sheet for resolving Battleground attacks. The player taps in
base attack dice, offensive/defensive Skill and Power ranks, command-action bonuses,
and situational modifiers; the app derives **Dice to roll**, **Roll to hit**, and
**Roll to wound** with a breakdown of contributing modifiers. No persistence, routing,
or backend — everything lives in `src/App.jsx` and `src/constants.js`.

## Rules accuracy (vs the modifier table, manual p101)

Every situational modifier's `[dice, os, op]` triple in `src/constants.js` matches the
rulebook values, including Charging split by base attacks (+2 for 4+, +1 for 1–3),
Pinching/Rear Attacking (+1 OS/+1 OP), Extreme Range (−2 OS), and Colossal Target
(+2 OS). The mutual-exclusion (`disabled`) arrays correctly partition engaged vs
ranged modifiers — an attack is one or the other — and pair off natural exclusives
(In the Yellow ↔ In the Red, Large ↔ Colossal, the two Charging tiers).

Divergences and gaps worth knowing about:

1. **Frightened conflates Command Cards with Command Actions.** Per the manual, a unit
   that fails a Fear Check can't have *Command Cards* played on it; Command Actions
   (rally, direct control, etc.) are a separate resource. The app's Frightened toggle
   disables the Command Action buttons. In practice the app's ±1 Dice/OS/OP buttons
   mostly stand in for card effects, so the behavior is reasonable — but the naming
   is misleading.
2. **No Overkill support.** Roll-to-hit/wound are clamped to 5, which hides the
   Overkill rule: when the true target number exceeds 5, each point above 5 converts
   one rolled 6 into a 5. Displaying the unclamped total (or an "overkill +N" note)
   would let players apply it.
3. **Pinching doesn't stack.** The rulebook makes each additional pinching side
   cumulative (+1/+1 per extra side); a toggle can only represent one instance.
4. **Not modeled:** High Ground, Soft/Hard Cover (defender-side bonuses), Impact Hits
   for charging cavalry, and Disrupted's "no ranged attacks" restriction. Cover can be
   worked around by tapping up Defensive Skill.
5. **Clamp asymmetry vs CLAUDE.md.** CLAUDE.md says dice-to-roll is clamped to
   `[0, MAX_DICE=20]`, but only `baseDice` is clamped to 20
   ([App.jsx:40](src/App.jsx:40)); the derived `diceToRoll`
   ([App.jsx:88](src/App.jsx:88)) is only floored at 0, so command actions can push the
   displayed total above 20. Harmless in practice, but code and docs disagree.

## Code issues

1. **Side effects inside `useMemo`** ([App.jsx:121](src/App.jsx:121)): the
   Frightened→clear-command-actions logic calls `setCommandActionModifiers` inside a
   `useMemo`, i.e. a state update during render. It happens to work but is an
   anti-pattern; this should be a `useEffect` (or handled in the toggle handler).
2. **Stale-closure updates** ([App.jsx:39](src/App.jsx:39)): `handleIncDice` computes
   from the captured `baseDice` rather than a functional update, unlike the other
   handlers. Fine for single taps, but inconsistent.
3. **Skill/Power counters only increment** and wrap at `MAX_ROLL = 10`
   ([App.jsx:44](src/App.jsx:44)). Documented behavior, but overshooting a rank by one
   tap costs nine more taps. A long-press or right-half/left-half decrement would help.
4. **Typos baked into ids/labels**: `calvaryTarget` → cavalry, `collosalTarget` →
   colossal ([constants.js:175](src/constants.js:175),
   [constants.js:184](src/constants.js:184)). Renaming ids means touching every
   `disabled` array that references them.
5. **Duplicate entries in `disabled` arrays**: `attackingToMyFlank` and
   `attackingToMyRear` list `notClosestTarget` twice; `rearAttacking` repeats
   `fastMovingTarget`, `extremeRange`, and `longRange`
   ([constants.js:48](src/constants.js:48),
   [constants.js:161](src/constants.js:161)). Harmless (`some`/`pick` tolerate dupes)
   but noise.
6. **`toggleModifier` churn** ([App.jsx:59](src/App.jsx:59)): filter → keyBy → sortBy →
   keyBy on every tap to preserve ordering that `position` + the render-time
   `sortBy`/`chunk` could handle alone. A simple
   `{ ...modifiers, [id]: { ...mod, on: !mod.on } }` would do.
7. **A disabled modifier can be left stuck on.** Disabling only blocks the button; it
   doesn't clear `on`. The mutual `disabled` declarations prevent the common cases,
   but any future one-sided declaration would let an active modifier keep contributing
   while un-tappable. Worth a guard (auto-clear `on` when a modifier becomes disabled).
8. **Bare README** — one heading. Could point at CLAUDE.md/docs and the npm scripts.
9. **Dual ESLint configs**: legacy `.eslintrc` (`react-app`) is dead weight next to the
   flat `eslint.config.js` that Vite and `npm run lint` actually use (already noted in
   CLAUDE.md). Deleting it would remove the ambiguity.

## CLAUDE.md accuracy

Accurate overall: commands, architecture description, modifier model, and the
both-sides rule for `disabled` arrays all check out against the code. The two nits are
the dice-clamp claim (item 5 above) and that it describes `frightened` as disabling
Command Actions — true of the code, but see rules note 1 for the card/action mixup.

## Suggested priorities

1. Convert the frightened `useMemo` to `useEffect` (correctness).
2. Add the missing upper clamp to `diceToRoll` or fix CLAUDE.md (consistency).
3. De-duplicate `disabled` arrays; fix the cavalry/colossal typos while there.
4. Consider an Overkill indicator and a decrement affordance for Skill/Power ranks
   (usability wins for actual play).
