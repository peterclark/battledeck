import { map, range } from "lodash";
import classNames from "classnames";
import { GiHealthIncrease, GiRuneStone, GiWhip } from "react-icons/gi";
import { damageStatus, reanimateCost, unitBox, unitTurnBuff } from "./data";

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

// One fielded copy's damage track, shared by the army builder and the
// battle screen: tapping box i marks damage up to it, tapping the last
// marked box heals it back off. Undead copies also get a Reanimate button
// showing its Command Action cost, copies whose faction has an
// army-ability box (Bravery, Fury, Rune of Uruz, Precision, Spoils) get a
// button that cycles that box's marks, and copies whose faction has a
// turn-scoped empowerment (the Orc Lash) get a toggle for it.
const DamageRow = ({
  unit,
  copy,
  copies,
  marked,
  reanimated,
  boxed,
  lashed,
  onMark,
  onReanimate,
  onBox,
  onLash,
}) => {
  const status = damageStatus(unit, marked);
  const label = `${unit.name}${copies > 1 ? ` #${copy + 1}` : ""}`;
  const cost = reanimateCost(unit);
  const box = unitBox(unit);
  const buff = unitTurnBuff(unit);
  const buffLabel = buff
    ? lashed
      ? `Undo ${buff.name} on ${label}`
      : `${buff.name} ${label} for ${buff.cost} Command Action${
          buff.cost > 1 ? "s" : ""
        }`
    : null;
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
      {buff && (
        <button
          className={classNames(
            "TurnBuff plate flex h-6 shrink-0 items-center gap-1 px-1.5 font-mono text-[9px]",
            lashed && "plate-on-ember"
          )}
          aria-label={buffLabel}
          aria-pressed={lashed === true}
          onClick={onLash}
        >
          <GiWhip
            className={classNames(
              "text-[11px]",
              lashed ? "text-ember-300" : "text-bone-500"
            )}
            aria-hidden
          />
          {buff.cost}
        </button>
      )}
    </div>
  );
};

export default DamageRow;
