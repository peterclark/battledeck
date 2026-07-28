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
import { GiRallyTheTroops, GiScrollUnfurled } from "react-icons/gi";
import { FACTIONS, FACTIONS_BY_ID, UNITS_BY_UID, unitBox } from "./data";
import {
  BUDGET_MAX,
  BUDGET_MIN,
  MAX_COPIES,
  loadArmies,
  saveArmy,
} from "./persistence";
import {
  turnSpend,
  withBoxCycle,
  withCleared,
  withCopyAdded,
  withCopyRemoved,
  withDamage,
  withLash,
  withNewTurn,
  withReanimate,
} from "./army";
import DamageRow from "./DamageRow";
import { useModalOverlay } from "./hooks";
import { buzz, playBonus, playDrum, playPenalty, playTick } from "./sounds";

const BUDGET_STEP = 250;

// Command Actions are gained per turn from the army's point budget
const commandActions = (budget) => Math.floor(budget / 500);

const isUnique = (unit) => unit.keywords?.includes("unique");

const UnitRow = ({
  unit,
  count,
  marks,
  reanimated,
  boxes,
  lashed,
  onAdd,
  onRemove,
  onMark,
  onReanimate,
  onBox,
  onLash,
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
              lashed={lashed?.[copy] === true}
              onMark={(value) => onMark(copy, value)}
              onReanimate={() => onReanimate(copy)}
              onBox={() => onBox(copy)}
              onLash={() => onLash(copy)}
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
  // Both rosters at once — the player's and the enemy's share one builder
  // behind a Yours/Enemy toggle, since they're the same record shape
  const [armies, setArmies] = useState(loadArmies);
  const [side, setSide] = useState("mine");
  const [clearArmed, setClearArmed] = useState(false);
  const clearTimer = useRef(null);
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const army = armies[side];
  const setArmy = (next) =>
    setArmies((all) => ({
      ...all,
      [side]: typeof next === "function" ? next(all[side]) : next,
    }));

  const { budget, counts, marks, reanimated, boxes, lashed } = army;

  const faction = FACTIONS_BY_ID[army.faction] ?? null;

  const switchSide = (next) => {
    if (next === side) return;
    setSide(next);
    setClearArmed(false);
    playTick();
    buzz();
  };

  const openFaction = (id) => {
    setArmy((a) => ({ ...a, faction: id }));
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

  // The rosters outlive the battle screen — persist on every change
  useEffect(() => {
    saveArmy(armies.mine, "mine");
    saveArmy(armies.enemy, "enemy");
  }, [armies]);

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
    setArmy((a) => ({
      ...a,
      budget: Math.min(Math.max(a.budget + step, BUDGET_MIN), BUDGET_MAX),
    }));
    playTick();
    buzz();
  };

  const addUnit = (unit) => {
    setArmy((a) => withCopyAdded(a, unit.uid));
    if (total + unit.points > budget) playPenalty();
    else playBonus();
    buzz();
  };

  const removeUnit = (unit) => {
    setArmy((a) => withCopyRemoved(a, unit.uid));
    playTick();
    buzz();
  };

  const markDamage = (unit, copy, value) => {
    setArmy((a) => withDamage(a, unit.uid, copy, value));
    const healed = value < (marks[unit.uid]?.[copy] ?? 0);
    if (healed) playTick();
    else playPenalty();
    buzz();
  };

  const reanimate = (unit, copy) => {
    setArmy((a) => withReanimate(a, unit.uid, copy));
    playBonus();
    buzz();
  };

  const markBox = (unit, copy) => {
    const marking = (boxes[unit.uid]?.[copy] ?? 0) < unitBox(unit).max;
    setArmy((a) => withBoxCycle(a, unit.uid, copy));
    if (marking) playBonus();
    else playTick();
    buzz();
  };

  const lash = (unit, copy) => {
    const lashing = !(lashed[unit.uid]?.[copy] ?? false);
    setArmy((a) => withLash(a, unit.uid, copy));
    if (lashing) playBonus();
    else playTick();
    buzz();
  };

  const spentThisTurn = turnSpend(army);

  const newTurn = () => {
    setArmy(withNewTurn);
    playDrum();
    buzz(16);
  };

  const clearArmy = () => {
    clearTimeout(clearTimer.current);
    if (clearArmed) {
      setArmy(withCleared);
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
            <h2
              className={classNames(
                "flex min-w-0 flex-1 flex-col items-center justify-center text-center font-display font-bold uppercase tracking-[0.15em]",
                side === "enemy" ? "text-blood-400" : "text-ember-400"
              )}
            >
              <span className="flex items-center gap-2 text-base leading-none">
                <GiRallyTheTroops
                  className={classNames(
                    "shrink-0 text-xl",
                    side === "enemy" ? "text-blood-500" : "text-ember-600"
                  )}
                  aria-hidden
                />
                {side === "enemy" ? "Enemy army" : "Army"}
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

          {/* one builder, two rosters: yours and the list across the table */}
          <div className="SideSwitch flex gap-1" role="group" aria-label="Roster">
            <button
              className={classNames(
                "MyArmy plate h-8 flex-1 text-[10px] font-bold uppercase tracking-[0.25em]",
                side === "mine" && "plate-on-ember"
              )}
              aria-pressed={side === "mine"}
              onClick={() => switchSide("mine")}
            >
              Your army
            </button>
            <button
              className={classNames(
                "EnemyArmy plate h-8 flex-1 text-[10px] font-bold uppercase tracking-[0.25em]",
                side === "enemy" && "plate-on-blood"
              )}
              aria-pressed={side === "enemy"}
              onClick={() => switchSide("enemy")}
            >
              Enemy army
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

          {spentThisTurn > 0 && (
            <div className="TurnTally flex items-center justify-between gap-2 border-t border-iron-500 pt-1.5">
              <span className="flex items-center gap-1.5 font-mono text-[10px] text-bone-500">
                <GiScrollUnfurled
                  className="text-sm text-ember-600"
                  aria-hidden
                />
                Spent this turn:{" "}
                <span
                  className={classNames(
                    spentThisTurn > commandActions(budget)
                      ? "text-blood-400"
                      : "text-bone-300"
                  )}
                >
                  {spentThisTurn} CA
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
                    lashed={lashed[uid]}
                    onAdd={() => addUnit(UNITS_BY_UID[uid])}
                    onRemove={() => removeUnit(UNITS_BY_UID[uid])}
                    onMark={(copy, value) =>
                      markDamage(UNITS_BY_UID[uid], copy, value)
                    }
                    onReanimate={(copy) => reanimate(UNITS_BY_UID[uid], copy)}
                    onBox={(copy) => markBox(UNITS_BY_UID[uid], copy)}
                    onLash={(copy) => lash(UNITS_BY_UID[uid], copy)}
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
                {clearArmed
                  ? "Tap again to clear"
                  : side === "enemy"
                    ? "Clear enemy army"
                    : "Clear army"}
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
