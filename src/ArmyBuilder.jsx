import { useEffect, useRef, useState } from "react";
import { capitalize, filter, map, range, sum, sumBy } from "lodash";
import classNames from "classnames";
import {
  FaArrowLeft,
  FaChevronRight,
  FaMinus,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import {
  GiHealthIncrease,
  GiRallyTheTroops,
  GiRuneStone,
  GiScrollUnfurled,
} from "react-icons/gi";
import {
  FACTIONS,
  FACTIONS_BY_ID,
  UNITS_BY_UID,
  damageStatus,
  reanimateCost,
  unitBox,
} from "./data";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  MAX_COPIES,
  loadArmy,
  saveArmy,
} from "./persistence";
import { useModalOverlay } from "./hooks";
import { buzz, playBonus, playDrum, playPenalty, playTick } from "./sounds";

const BUDGET_STEP = 250;

// Command Actions are gained per turn from the army's point budget
const commandActions = (budget) => Math.floor(budget / 500);

const isUnique = (unit) => unit.keywords?.includes("unique");

const STATUS_LABEL = {
  fresh: "",
  yellow: "In the Yellow",
  red: "In the Red",
  destroyed: "Destroyed",
};

const STATUS_TONE = {
  yellow: "text-ember-400",
  red: "text-blood-400",
  destroyed: "text-blood-500",
};

// One fielded copy's damage track: tapping box i marks damage up to it,
// tapping the last marked box heals it back off. Undead copies also get a
// Reanimate button showing its Command Action cost, and copies whose
// faction has an army-ability box (Bravery, Fury, Rune of Uruz, Precision,
// Spoils) get a button that cycles that box's marks.
const DamageRow = ({
  unit,
  copy,
  copies,
  marked,
  reanimated,
  boxed,
  onMark,
  onReanimate,
  onBox,
}) => {
  const status = damageStatus(unit, marked);
  const label = `${unit.name}${copies > 1 ? ` #${copy + 1}` : ""}`;
  const cost = reanimateCost(unit);
  const box = unitBox(unit);
  const boxLabel = box
    ? boxed >= box.max
      ? `Erase ${box.name} on ${label}`
      : `Mark ${box.name} on ${label} for ${box.cost} Command Action${
          box.cost > 1 ? "s" : ""
        }`
    : null;
  // per the army ability: heals one damage, never on a destroyed unit,
  // and only once per unit per turn
  const canReanimate =
    cost !== null && marked > 0 && status !== "destroyed" && !reanimated;
  const bands = [
    ...map(range(unit.damage.green), () => "bg-moss-500"),
    ...map(range(unit.damage.yellow), () => "bg-ember-500"),
    ...map(range(unit.damage.red), () => "bg-blood-500"),
  ];
  return (
    <div className="DamageRow flex items-center gap-2">
      {copies > 1 && (
        <span className="w-5 shrink-0 font-mono text-[9px] text-bone-500">
          #{copy + 1}
        </span>
      )}
      <span className="flex flex-1 flex-wrap gap-0.5">
        {map(bands, (tone, box) => (
          <button
            key={box}
            className={classNames(
              "h-5 w-5 rounded-[3px] border border-iron-900/60",
              tone,
              box < marked && "opacity-25"
            )}
            aria-label={`${label} damage box ${box + 1}`}
            aria-pressed={box < marked}
            onClick={() => onMark(box + 1 === marked ? box : box + 1)}
          />
        ))}
      </span>
      <span
        className={classNames(
          "shrink-0 font-mono text-[9px]",
          STATUS_TONE[status] ?? "text-bone-500"
        )}
      >
        {STATUS_LABEL[status]}
      </span>
      {cost !== null && (
        <button
          className="Reanimate plate flex h-6 shrink-0 items-center gap-1 px-1.5 font-mono text-[9px]"
          aria-label={
            reanimated
              ? `${label} already Reanimated this turn`
              : `Reanimate ${label} for ${cost} Command Action${cost > 1 ? "s" : ""}`
          }
          disabled={!canReanimate}
          onClick={onReanimate}
        >
          <GiHealthIncrease className="text-[11px] text-moss-500" aria-hidden />
          {cost}
        </button>
      )}
      {box && (
        <button
          className={classNames(
            "BoxMark plate flex h-6 shrink-0 items-center gap-1 px-1.5 font-mono text-[9px]",
            boxed > 0 && "plate-on-ember"
          )}
          aria-label={boxLabel}
          onClick={onBox}
        >
          <GiRuneStone
            className={classNames(
              "text-[11px]",
              boxed > 0 ? "text-ember-300" : "text-bone-500"
            )}
            aria-hidden
          />
          {boxed}/{box.max}
        </button>
      )}
    </div>
  );
};

const UnitRow = ({
  unit,
  count,
  marks,
  reanimated,
  boxes,
  onAdd,
  onRemove,
  onMark,
  onReanimate,
  onBox,
}) => {
  const cap = isUnique(unit) ? 1 : MAX_COPIES;
  return (
    <div
      className={classNames(
        "ArmyUnit plate flex w-full flex-col gap-1.5 px-2.5 py-1.5",
        count > 0 && "plate-on-ember"
      )}
    >
      <div className="flex w-full items-center gap-2">
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate font-display text-xs tracking-wider text-bone-100">
            {unit.name}
          </span>
          <span className="font-mono text-[9px] text-bone-500">
            {unit.points} pts
            {unit.class ? ` · ${capitalize(unit.class)}` : ""}
            {isUnique(unit) ? " · max 1" : ""}
          </span>
        </span>
        <button
          className="plate flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label={`Remove one ${unit.name}`}
          disabled={count === 0}
          onClick={onRemove}
        >
          <FaMinus className="text-[10px]" aria-hidden />
        </button>
        <span
          className="w-5 text-center font-display text-lg"
          aria-label={`${count} ${unit.name} in army`}
        >
          {count}
        </span>
        <button
          className="plate flex h-9 w-9 shrink-0 items-center justify-center"
          aria-label={`Add one ${unit.name}`}
          disabled={count >= cap}
          onClick={onAdd}
        >
          <FaPlus className="text-[10px]" aria-hidden />
        </button>
      </div>
      {count > 0 && (
        <div className="flex w-full flex-col gap-1">
          {map(range(count), (copy) => (
            <DamageRow
              key={copy}
              unit={unit}
              copy={copy}
              copies={count}
              marked={marks?.[copy] ?? 0}
              reanimated={reanimated?.[copy] === true}
              boxed={boxes?.[copy] ?? 0}
              onMark={(value) => onMark(copy, value)}
              onReanimate={() => onReanimate(copy)}
              onBox={() => onBox(copy)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// One faction's card on the builder's front page. The right-hand summary
// is what you've drawn from it so far — copies fielded and points spent —
// falling back to how many cards it has when you've taken none.
const FactionRow = ({ faction, fielded, points, onOpen }) => (
  <button
    className="FactionRow plate flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left"
    onClick={onOpen}
  >
    <span className="font-display text-sm tracking-wider text-bone-100">
      {faction.name}
    </span>
    <span
      className={classNames(
        "flex shrink-0 items-center gap-2 font-mono text-[10px]",
        fielded ? "text-ember-400" : "text-bone-500"
      )}
    >
      {fielded
        ? `${fielded} fielded · ${points} pts`
        : `${faction.units.length} units`}
      <FaChevronRight className="text-[9px] text-ember-600" aria-hidden />
    </span>
  </button>
);

// Full-screen army roster: pick a point budget, tap units in and out, and
// watch the total, remaining points, and Command Actions. The Unique
// keyword's one-copy rule is enforced by the add button's cap. Two levels
// deep like the unit picker: a faction list, then one faction's units.
const ArmyBuilder = ({ onClose }) => {
  const [initial] = useState(loadArmy);
  const [budget, setBudget] = useState(initial.budget);
  const [counts, setCounts] = useState(initial.counts);
  const [marks, setMarks] = useState(initial.marks);
  const [reanimated, setReanimated] = useState(initial.reanimated);
  const [boxes, setBoxes] = useState(initial.boxes);
  const [boxesThisTurn, setBoxesThisTurn] = useState(initial.boxesThisTurn);
  const [factionId, setFactionId] = useState(initial.faction);
  const [clearArmed, setClearArmed] = useState(false);
  const clearTimer = useRef(null);
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const faction = FACTIONS_BY_ID[factionId] ?? null;

  const openFaction = (id) => {
    setFactionId(id);
    playTick();
    buzz();
  };

  const close = () => {
    onClose();
    playTick();
    buzz();
  };

  // Back steps up to the faction list; from the list it leaves the builder
  const back = () => (faction ? openFaction(null) : close());

  const { overlayProps } = useModalOverlay(close);

  // The roster outlives the battle screen — persist on every change
  useEffect(() => {
    saveArmy({
      budget,
      counts,
      marks,
      reanimated,
      boxes,
      boxesThisTurn,
      faction: factionId,
    });
  }, [budget, counts, marks, reanimated, boxes, boxesThisTurn, factionId]);

  // What a faction card advertises: copies fielded from it and their cost
  const factionTally = (f) => {
    const units = filter(f.units, (unit) => counts[`${f.id}/${unit.id}`] > 0);
    return {
      fielded: sumBy(units, (unit) => counts[`${f.id}/${unit.id}`]),
      points: sumBy(
        units,
        (unit) => UNITS_BY_UID[`${f.id}/${unit.id}`].points * counts[`${f.id}/${unit.id}`]
      ),
    };
  };

  const total = sum(
    map(counts, (count, uid) => UNITS_BY_UID[uid].points * count)
  );
  const remaining = budget - total;

  const adjustBudget = (step) => {
    setBudget((b) => Math.min(Math.max(b + step, BUDGET_MIN), BUDGET_MAX));
    playTick();
    buzz();
  };

  const addUnit = (unit) => {
    setCounts((c) => ({ ...c, [unit.uid]: (c[unit.uid] ?? 0) + 1 }));
    // a fresh copy joins with an unmarked damage track and no box marks
    setMarks((m) => ({ ...m, [unit.uid]: [...(m[unit.uid] ?? []), 0] }));
    setBoxes((b) => ({ ...b, [unit.uid]: [...(b[unit.uid] ?? []), 0] }));
    setBoxesThisTurn((b) => ({ ...b, [unit.uid]: [...(b[unit.uid] ?? []), 0] }));
    if (total + unit.points > budget) playPenalty();
    else playBonus();
    buzz();
  };

  const removeUnit = (unit) => {
    setCounts((c) => {
      const next = { ...c };
      if (next[unit.uid] > 1) next[unit.uid] -= 1;
      else delete next[unit.uid];
      return next;
    });
    // the last-listed copy leaves, taking its damage and box marks with it
    const dropLast = (state) => {
      const next = { ...state, [unit.uid]: (state[unit.uid] ?? []).slice(0, -1) };
      if (!next[unit.uid].length) delete next[unit.uid];
      return next;
    };
    setMarks(dropLast);
    setBoxes(dropLast);
    setBoxesThisTurn(dropLast);
    playTick();
    buzz();
  };

  const markDamage = (unit, copy, value) => {
    setMarks((m) => {
      const track = [...(m[unit.uid] ?? [])];
      track[copy] = value;
      return { ...m, [unit.uid]: track };
    });
    const healed = value < (marks[unit.uid]?.[copy] ?? 0);
    if (healed) playTick();
    else playPenalty();
    buzz();
  };

  // Reanimate: heal one damage and lock this copy until the next turn
  const reanimate = (unit, copy) => {
    setMarks((m) => {
      const track = [...(m[unit.uid] ?? [])];
      track[copy] = Math.max((track[copy] ?? 0) - 1, 0);
      return { ...m, [unit.uid]: track };
    });
    setReanimated((r) => {
      const track = [...(r[unit.uid] ?? [])];
      track[copy] = true;
      return { ...r, [unit.uid]: track };
    });
    playBonus();
    buzz();
  };

  // Army-ability boxes: tapping cycles a copy's marks 0 → 1 → … → max → 0.
  // Marking costs Command Actions, so it tallies against this turn's
  // allowance; erasing hands back only what was paid this turn, since a
  // mark carried over from an earlier turn was paid for then.
  const markBox = (unit, copy) => {
    const { max } = unitBox(unit);
    const current = boxes[unit.uid]?.[copy] ?? 0;
    const next = current >= max ? 0 : current + 1;
    setBoxes((b) => {
      const track = [...(b[unit.uid] ?? [])];
      track[copy] = next;
      return { ...b, [unit.uid]: track };
    });
    setBoxesThisTurn((b) => {
      const track = [...(b[unit.uid] ?? [])];
      const fresh = track[copy] ?? 0;
      track[copy] = next > current ? fresh + 1 : Math.min(fresh, next);
      return { ...b, [unit.uid]: track };
    });
    if (next > current) playBonus();
    else playTick();
    buzz();
  };

  // Command Actions spent so far this turn, to compare against the
  // budget's allowance above. Reanimating and marking boxes both draw on
  // the same per-turn pool, so they're tallied together.
  const reanimateSpend = sum(
    map(reanimated, (track, uid) =>
      sum(map(track, (done) => (done ? reanimateCost(UNITS_BY_UID[uid]) : 0)))
    )
  );

  const boxSpend = sum(
    map(boxesThisTurn, (track, uid) =>
      sum(map(track, (n) => (n ?? 0) * (unitBox(UNITS_BY_UID[uid])?.cost ?? 0)))
    )
  );

  const turnSpend = reanimateSpend + boxSpend;

  const newTurn = () => {
    setReanimated({});
    // the marks stay on the cards; only their price is a spent turn's
    setBoxesThisTurn({});
    playDrum();
    buzz(16);
  };

  const clearArmy = () => {
    clearTimeout(clearTimer.current);
    if (clearArmed) {
      setCounts({});
      setMarks({});
      setReanimated({});
      setBoxes({});
      setBoxesThisTurn({});
      setClearArmed(false);
      playDrum();
      buzz(16);
      return;
    }
    setClearArmed(true);
    playTick();
    buzz();
    clearTimer.current = setTimeout(() => setClearArmed(false), 1600);
  };

  return (
    <div
      className="ArmyBuilder fixed inset-0 z-30 overflow-y-auto overscroll-contain bg-iron-900"
      {...overlayProps}
      role="dialog"
      aria-modal="true"
      aria-label="Army builder"
    >
      <div
        className="mx-auto flex min-h-dvh max-w-md flex-col text-bone-100"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="sticky top-0 z-10 flex flex-col gap-2 border-b border-iron-500 bg-iron-900/95 px-3 py-2 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button
              className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
              onClick={back}
              aria-label={faction ? "Back to factions" : "Back to BattleDeck"}
            >
              <FaArrowLeft />
            </button>
            <h2 className="flex min-w-0 flex-1 flex-col items-center justify-center text-center font-display font-bold uppercase tracking-[0.15em] text-ember-400">
              <span className="flex items-center gap-2 text-base leading-none">
                <GiRallyTheTroops
                  className="shrink-0 text-xl text-ember-600"
                  aria-hidden
                />
                Army
              </span>
              {faction && (
                <span className="truncate text-[10px] leading-tight tracking-[0.25em] text-bone-500">
                  {faction.name}
                </span>
              )}
            </h2>
            <button
              className="plate flex h-9 w-9 shrink-0 items-center justify-center text-bone-300"
              onClick={close}
              aria-label="Close army builder"
            >
              <FaTimes />
            </button>
          </div>

          <div className="ArmySummary flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <span
                className={classNames(
                  "font-display text-3xl leading-none",
                  remaining < 0 ? "text-blood-400" : "text-ember-400"
                )}
              >
                {total}
              </span>
              <span className="font-mono text-[10px] text-bone-500">
                {remaining < 0
                  ? `over by ${-remaining}`
                  : `${remaining} pts left`}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                className="plate flex h-9 w-9 items-center justify-center"
                aria-label={`Lower budget by ${BUDGET_STEP}`}
                disabled={budget <= BUDGET_MIN}
                onClick={() => adjustBudget(-BUDGET_STEP)}
              >
                <FaMinus className="text-[10px]" aria-hidden />
              </button>
              <div className="flex w-16 flex-col items-center">
                <span className="font-display text-lg leading-none">
                  {budget}
                </span>
                <span className="font-mono text-[9px] text-bone-500">
                  budget
                </span>
              </div>
              <button
                className="plate flex h-9 w-9 items-center justify-center"
                aria-label={`Raise budget by ${BUDGET_STEP}`}
                disabled={budget >= BUDGET_MAX}
                onClick={() => adjustBudget(BUDGET_STEP)}
              >
                <FaPlus className="text-[10px]" aria-hidden />
              </button>
            </div>
            <div
              className="flex flex-col items-center"
              aria-label={`${commandActions(budget)} Command Actions per turn`}
            >
              <span className="flex items-center gap-1 font-display text-lg leading-none text-steel-300">
                <GiScrollUnfurled
                  className="text-base text-ember-600"
                  aria-hidden
                />
                {commandActions(budget)}
              </span>
              <span className="font-mono text-[9px] text-bone-500">
                CA / turn
              </span>
            </div>
          </div>

          {turnSpend > 0 && (
            <div className="TurnTally flex items-center justify-between gap-2 border-t border-iron-500 pt-1.5">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-bone-500">
                <GiScrollUnfurled
                  className="text-sm text-ember-600"
                  aria-hidden
                />
                Spent this turn:{" "}
                <span
                  className={classNames(
                    turnSpend > commandActions(budget)
                      ? "text-blood-400"
                      : "text-bone-300"
                  )}
                >
                  {turnSpend} CA
                </span>
              </span>
              <button
                className="NewTurn plate h-7 px-2.5 text-[10px] uppercase tracking-widest text-bone-300"
                onClick={newTurn}
              >
                New turn
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 px-3 pb-6 pt-3">
          {!faction &&
            map(FACTIONS, (f) => {
              const { fielded, points } = factionTally(f);
              return (
                <FactionRow
                  key={f.id}
                  faction={f}
                  fielded={fielded}
                  points={points}
                  onOpen={() => openFaction(f.id)}
                />
              );
            })}

          {faction && (
            <div className="flex flex-col gap-1.5">
              {/* the army abilities are what the box button on each copy
                  spends Command Actions on, so keep them in view here */}
              {map(faction.abilities, ({ name, text }) => (
                <div
                  key={name}
                  className="FactionAbility border-l-2 border-ember-600 pl-2.5 text-[10px] leading-snug text-bone-500"
                >
                  <span className="font-bold text-ember-500">{name}.</span>{" "}
                  {text}
                </div>
              ))}
              {map(faction.units, (unit) => {
                const uid = `${faction.id}/${unit.id}`;
                return (
                  <UnitRow
                    key={uid}
                    unit={UNITS_BY_UID[uid]}
                    count={counts[uid] ?? 0}
                    marks={marks[uid]}
                    reanimated={reanimated[uid]}
                    boxes={boxes[uid]}
                    onAdd={() => addUnit(UNITS_BY_UID[uid])}
                    onRemove={() => removeUnit(UNITS_BY_UID[uid])}
                    onMark={(copy, value) =>
                      markDamage(UNITS_BY_UID[uid], copy, value)
                    }
                    onReanimate={(copy) => reanimate(UNITS_BY_UID[uid], copy)}
                    onBox={(copy) => markBox(UNITS_BY_UID[uid], copy)}
                  />
                );
              })}
            </div>
          )}

          {/* clearing the whole roster belongs with the whole roster, not
              inside one faction */}
          {!faction && (
            <>
              <button
                className="ClearArmy plate plate-on-gold h-10 text-sm tracking-widest"
                onClick={clearArmy}
              >
                {clearArmed ? "Tap again to clear" : "Clear army"}
              </button>

              <button
                className="plate flex h-10 items-center justify-center gap-2 text-xs tracking-widest text-bone-300"
                onClick={close}
              >
                <FaArrowLeft aria-hidden />
                Back to BattleDeck
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ArmyBuilder;
