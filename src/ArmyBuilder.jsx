import { useEffect, useRef, useState } from "react";
import { capitalize, map, range, sum } from "lodash";
import classNames from "classnames";
import { FaArrowLeft, FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import { GiRallyTheTroops, GiScrollUnfurled } from "react-icons/gi";
import { FACTIONS, UNITS_BY_UID, damageStatus } from "./data";
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
// tapping the last marked box heals it back off
const DamageRow = ({ unit, copy, copies, marked, onMark }) => {
  const status = damageStatus(unit, marked);
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
            aria-label={`${unit.name}${copies > 1 ? ` #${copy + 1}` : ""} damage box ${box + 1}`}
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
    </div>
  );
};

const UnitRow = ({ unit, count, marks, onAdd, onRemove, onMark }) => {
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
              onMark={(value) => onMark(copy, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Full-screen army roster: pick a point budget, tap units in and out, and
// watch the total, remaining points, and Command Actions. The Unique
// keyword's one-copy rule is enforced by the add button's cap.
const ArmyBuilder = ({ onClose }) => {
  const [initial] = useState(loadArmy);
  const [budget, setBudget] = useState(initial.budget);
  const [counts, setCounts] = useState(initial.counts);
  const [marks, setMarks] = useState(initial.marks);
  const [clearArmed, setClearArmed] = useState(false);
  const clearTimer = useRef(null);
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const close = () => {
    onClose();
    playTick();
    buzz();
  };

  const { overlayProps } = useModalOverlay(close);

  // The roster outlives the battle screen — persist on every change
  useEffect(() => {
    saveArmy({ budget, counts, marks });
  }, [budget, counts, marks]);

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
    // a fresh copy joins with an unmarked damage track
    setMarks((m) => ({ ...m, [unit.uid]: [...(m[unit.uid] ?? []), 0] }));
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
    // the last-listed copy leaves, taking its damage with it
    setMarks((m) => {
      const next = { ...m, [unit.uid]: (m[unit.uid] ?? []).slice(0, -1) };
      if (!next[unit.uid].length) delete next[unit.uid];
      return next;
    });
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

  const clearArmy = () => {
    clearTimeout(clearTimer.current);
    if (clearArmed) {
      setCounts({});
      setMarks({});
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
              onClick={close}
              aria-label="Back to BattleDeck"
            >
              <FaArrowLeft />
            </button>
            <h2 className="flex min-w-0 flex-1 items-center justify-center gap-2 font-display text-base font-bold uppercase tracking-[0.15em] text-ember-400">
              <GiRallyTheTroops
                className="shrink-0 text-xl text-ember-600"
                aria-hidden
              />
              Army
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
        </div>

        <div className="flex flex-col gap-3 px-3 pb-6 pt-3">
          {map(FACTIONS, (faction) => (
            <div key={faction.id} className="flex flex-col gap-1.5">
              <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
                {faction.name}
              </div>
              {map(faction.units, (unit) => {
                const uid = `${faction.id}/${unit.id}`;
                return (
                  <UnitRow
                    key={uid}
                    unit={UNITS_BY_UID[uid]}
                    count={counts[uid] ?? 0}
                    marks={marks[uid]}
                    onAdd={() => addUnit(UNITS_BY_UID[uid])}
                    onRemove={() => removeUnit(UNITS_BY_UID[uid])}
                    onMark={(copy, value) =>
                      markDamage(UNITS_BY_UID[uid], copy, value)
                    }
                  />
                );
              })}
            </div>
          ))}

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
        </div>
      </div>
    </div>
  );
};

export default ArmyBuilder;
