import { useEffect, useMemo, useState } from "react";
import {
  chunk,
  filter,
  map,
  max,
  min,
  pick,
  pickBy,
  reduce,
  some,
  transform,
  values,
} from "lodash";
import { GiPerspectiveDiceOne, GiPerspectiveDiceSix } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MODIFIERS, COMMAND_CARD_MODIFIERS } from "./constants";
import className from "classnames";

const MAX_DICE = 20;
const MAX_ROLL = 10;

const App = () => {
  const [baseDice, setBaseDice] = useState(4);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);
  const [commandCardModifiers, setCommandCardModifiers] = useState([0, 0, 0]);
  const [modifiers, setModifiers] = useState(MODIFIERS);

  const { frightened } = modifiers || {};

  const handleIncDice = (mod) => {
    setBaseDice((dice) => min([max([dice + mod, 0]), MAX_DICE]));
  };

  const handleIncOffensiveSkill = (mod) => {
    setOffensiveSkill((os) => (os + mod) % MAX_ROLL);
  };

  const handleIncOffensivePower = (mod) => {
    setOffensivePower((op) => (op + mod) % MAX_ROLL);
  };

  const handleIncDefensiveSkill = (mod) => {
    setDefensiveSkill((ds) => (ds + mod) % MAX_ROLL);
  };

  const handleIncDefensivePower = (mod) => {
    setDefensivePower((dp) => (dp + mod) % MAX_ROLL);
  };

  const toggleModifier = (mod) => {
    if (mod.id === "reset") {
      setModifiers(MODIFIERS);
      return;
    }
    // Modifiers with a maxCount stack: taps cycle 0 -> 1 -> ... -> maxCount -> 0
    let next;
    if (mod.maxCount) {
      const count = ((mod.count ?? 0) + 1) % (mod.maxCount + 1);
      next = { ...mod, count, on: count > 0 };
    } else {
      next = { ...mod, on: !mod.on };
    }
    setModifiers((mods) => ({ ...mods, [mod.id]: next }));
  };

  const [diceModifier, offensiveSkillModifier, offensivePowerModifier] =
    useMemo(() => {
      const modsOn = values(pickBy(modifiers, (mod) => mod.on));
      const mods = reduce(
        modsOn,
        (sums, { modifier, count }) => {
          const stack = count ?? 1;
          return [
            sums[0] + modifier[0] * stack,
            sums[1] + modifier[1] * stack,
            sums[2] + modifier[2] * stack,
          ];
        },
        [0, 0, 0]
      );
      return mods;
    }, [modifiers]);

  const [ccDice, ccOffensiveSkill, ccOffensivePower] = commandCardModifiers;

  const diceToRoll = useMemo(() => {
    return min([max([baseDice + ccDice + diceModifier, 0]), MAX_DICE]);
  }, [baseDice, ccDice, diceModifier]);

  // 6 is always a miss, 1 is always a hit. Totals above 5 trigger the
  // Overkill rule: one rolled 6 becomes a 5 per point over 5.
  const { value: rollToHit, overkill: hitOverkill } = useMemo(() => {
    const hitTotal =
      offensiveSkill -
      defensiveSkill +
      ccOffensiveSkill +
      offensiveSkillModifier;
    return {
      value: max([min([hitTotal, 5]), 1]),
      overkill: max([hitTotal - 5, 0]),
    };
  }, [
    offensiveSkill,
    defensiveSkill,
    ccOffensiveSkill,
    offensiveSkillModifier,
  ]);

  const { value: rollToWound, overkill: woundOverkill } = useMemo(() => {
    const woundTotal =
      offensivePower -
      defensivePower +
      ccOffensivePower +
      offensivePowerModifier;
    return {
      value: max([min([woundTotal, 5]), 1]),
      overkill: max([woundTotal - 5, 0]),
    };
  }, [
    offensivePower,
    defensivePower,
    ccOffensivePower,
    offensivePowerModifier,
  ]);

  // A Frightened unit can't have Command Cards played on it
  useEffect(() => {
    if (frightened.on) setCommandCardModifiers([0, 0, 0]);
  }, [frightened.on]);

  // Return all modifiers set to ON
  const onModifiers = useMemo(() => filter(modifiers, "on"), [modifiers]);

  // Return all DICE modifiers set to ON
  const onModifiersForDice = useMemo(
    () => filter(onModifiers, ({ modifier }) => modifier[0] !== 0),
    [onModifiers]
  );

  // Return all SKILL modifiers set to ON
  const onModifiersForSkill = useMemo(
    () => filter(onModifiers, ({ modifier }) => modifier[1] !== 0),
    [onModifiers]
  );

  // Return all POWER modifiers set to ON
  const onModifiersForPower = useMemo(
    () => filter(onModifiers, ({ modifier }) => modifier[2] !== 0),
    [onModifiers]
  );

  // Return object of all modifiers ON/OFF status
  // => { inTheRed: true, inTheYellow: false, ... }
  const status = useMemo(() => {
    const modStatuses = transform(
      onModifiers,
      (acc, mod) => {
        acc[mod.id] = mod.on;
      },
      {}
    );
    return modStatuses;
  }, [onModifiers]);

  // Return object of all modifiers disabled status
  // => { inTheRed: false, inTheYellow: true, ... }
  const disabledModifiers = useMemo(() => {
    const disabled = transform(
      modifiers,
      (acc, mod, key) => {
        acc[key] = some(values(pick(status, mod.disabled)));
      },
      {}
    );
    return disabled;
  }, [modifiers, status]);

  return (
    <div className="BattleDeck flex flex-col bg-black gap-2">
      <div className="Roll flex flex-1 text-9xl mx-4 mt-4 my-2 mb-0 gap-1">
        <div className="Dice flex-1 flex flex-col items-center justify-between bg-white rounded">
          <span className="text-green-900 flex gap-1">
            {diceToRoll}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Dice</span>
              <span>{baseDice} base</span>
              {ccDice !== 0 && <span>{ccDice} CC</span>}
              {map(onModifiersForDice, ({ id, modifier, count, code }) => (
                <span key={id}>
                  {modifier[0] * (count ?? 1)} {code}
                </span>
              ))}
              {frightened.on && <span>{frightened.code}</span>}
            </div>
          </span>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button
              className="flex-1 ml-2 border-white rounded bg-red-400 text-red-900 flex items-center justify-center"
              onClick={() => handleIncDice(-1)}
            >
              <FaMinus />
            </button>
            <button
              className="flex-1 mr-2 border-white rounded bg-green-400 text-green-900 flex items-center justify-center"
              onClick={() => handleIncDice(1)}
            >
              <FaPlus />
            </button>
          </div>
        </div>
        <div className="RollToHit flex-1 flex flex-col items-center justify-between bg-white rounded">
          <span className="text-red-900 flex gap-1">
            {rollToHit}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Hit</span>
              <span>{offensiveSkill - defensiveSkill} base</span>
              {ccOffensiveSkill !== 0 && <span>{ccOffensiveSkill} CC</span>}
              {map(onModifiersForSkill, ({ id, modifier, count, code }) => (
                <span key={id}>
                  {modifier[1] * (count ?? 1)} {code}
                </span>
              ))}
              {frightened.on && <span>{frightened.code}</span>}
              {hitOverkill > 0 && <span>OK: {hitOverkill}&times;6&rarr;5</span>}
            </div>
          </span>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button
              className="OffensiveSkillRank ml-2 flex-1 border-white rounded bg-rose-900 text-rose-100"
              onClick={() => handleIncOffensiveSkill(1)}
            >
              {offensiveSkill}
            </button>
            <button
              className="DefensiveSkillRank mr-2 flex-1 border-white rounded bg-blue-900 text-blue-100"
              onClick={() => handleIncDefensiveSkill(1)}
            >
              {defensiveSkill}
            </button>
          </div>
        </div>
        <div className="RollToWound flex-1 flex flex-col items-center justify-between bg-white rounded">
          <div className="text-blue-900 flex gap-1">
            {rollToWound}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Wound</span>
              <span>{offensivePower - defensivePower} base</span>
              {ccOffensivePower !== 0 && <span>{ccOffensivePower} CC</span>}
              {map(onModifiersForPower, ({ id, modifier, count, code }) => (
                <span key={id}>
                  {modifier[2] * (count ?? 1)} {code}
                </span>
              ))}
              {frightened.on && <span>{frightened.code}</span>}
              {woundOverkill > 0 && (
                <span>OK: {woundOverkill}&times;6&rarr;5</span>
              )}
            </div>
          </div>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button
              className="OffensivePowerRank ml-2 flex-1 border-white rounded bg-rose-900 text-rose-100"
              onClick={() => handleIncOffensivePower(1)}
            >
              {offensivePower}
            </button>
            <button
              className="DefensivePowerRank mr-2 flex-1 border-white rounded bg-blue-900 text-blue-100"
              onClick={() => handleIncDefensivePower(1)}
            >
              {defensivePower}
            </button>
          </div>
        </div>
      </div>

      <div className="text-white font-bold flex justify-center">
        Command Card Modifiers
      </div>
      <div className="CommandCardModifiers flex h-20 gap-1 mx-4 min-h-20">
        {map(COMMAND_CARD_MODIFIERS, ({ id, name, color, mod }) => (
          <button
            key={id}
            className={className("flex-1 rounded", id, color)}
            disabled={frightened.on}
            onClick={() =>
              setCommandCardModifiers(([d, os, op]) => [
                d + mod[0],
                os + mod[1],
                op + mod[2],
              ])
            }
          >
            <span className="whitespace-pre-line">{name}</span>
          </button>
        ))}
      </div>
      <button
        className="ClearCommandCardModifiers bg-yellow-400 mx-4 rounded h-10"
        onClick={() => setCommandCardModifiers([0, 0, 0])}
        disabled={frightened.on}
      >
        Reset
      </button>

      <div className="text-white font-bold flex justify-center">
        Situational Modifiers
      </div>
      <div className="SituationalModifiers mx-4 flex flex-col flex-1 gap-1 text-sm">
        {map(chunk(values(modifiers), 5), (group, index) => (
          <div className="flex flex-1 gap-1 min-h-20" key={`group-${index}`}>
            {map(group, (modifier) => (
              <button
                key={`modifier-${modifier.id}`}
                className={className(
                  modifier.id,
                  "w-1/5 flex-1 rounded",
                  modifier.on ? modifier.color : "bg-white"
                )}
                disabled={disabledModifiers[modifier.id]}
                onClick={() => toggleModifier(modifier)}
              >
                <span className="whitespace-pre-line">
                  {modifier.name}
                  {modifier.count > 1 ? ` ×${modifier.count}` : ""}
                </span>
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="text-lg flex text-white items-center justify-center mx-4 mt-2 min-h-20">
        <div className="mx-4 text-3xl flex items-center gap-4">
          <GiPerspectiveDiceOne className="text-4xl" />
          BattleDeck
          <GiPerspectiveDiceSix className="text-4xl" />
        </div>
      </div>
    </div>
  );
};

export default App;
