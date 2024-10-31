import { useMemo } from "react";
import { useState } from "react";
import {
  chunk,
  filter,
  keyBy,
  map,
  max,
  min,
  pick,
  pickBy,
  reduce,
  some,
  sortBy,
  transform,
  values,
} from "lodash";
import { GiPerspectiveDiceOne, GiPerspectiveDiceSix } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MODIFIERS, COMMAND_ACTION_MODIFIERS } from "./constants";
import className from "classnames";

const MAX_DICE = 20;
const MAX_ROLL = 10;

const App = () => {
  const [baseDice, setBaseDice] = useState(4);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);
  const [commandActionModifiers, setCommandActionModifiers] = useState([
    0, 0, 0,
  ]);
  const [modifiers, setModifiers] = useState(MODIFIERS);

  const { frightened } = modifiers || {};

  const handleIncDice = (mod) => {
    setBaseDice(min([max([baseDice + mod, 0]), MAX_DICE]));
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
    const filtered = filter(modifiers, (m) => mod.id !== m.id);
    const updated = {
      ...keyBy(filtered, "id"),
      [mod.id]: { ...mod, on: !mod.on },
    };
    const sorted = sortBy(updated, "position");
    const keyed = keyBy(sorted, "id");
    setModifiers(keyed);
  };

  const [diceModifier, offensiveSkillModifier, offensivePowerModifier] =
    useMemo(() => {
      const modsOn = values(pickBy(modifiers, (mod) => mod.on));
      const arrays = map(modsOn, "modifier");
      const mods = reduce(
        arrays,
        (sums, val) => [sums[0] + val[0], sums[1] + val[1], sums[2] + val[2]],
        [0, 0, 0]
      );
      return mods;
    }, [modifiers]);

  const [caDice, caOffensiveSkill, caOffensivePower] = commandActionModifiers;

  const diceToRoll = useMemo(() => {
    return max([baseDice + caDice + diceModifier, 0]);
  }, [baseDice, caDice, diceModifier]);

  // 6 is always a miss, 1 is always a hit
  const rollToHit = useMemo(() => {
    const hitTotal =
      offensiveSkill -
      defensiveSkill +
      caOffensiveSkill +
      offensiveSkillModifier;
    return max([min([hitTotal, 5]), 1]);
  }, [
    offensiveSkill,
    defensiveSkill,
    caOffensiveSkill,
    offensiveSkillModifier,
  ]);

  const rollToWound = useMemo(() => {
    const woundTotal =
      offensivePower -
      defensivePower +
      caOffensivePower +
      offensivePowerModifier;
    return max([min([woundTotal, 5]), 1]);
  }, [
    offensivePower,
    defensivePower,
    caOffensivePower,
    offensivePowerModifier,
  ]);

  useMemo(() => {
    if (frightened.on) setCommandActionModifiers([0, 0, 0]);
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
              {caDice !== 0 && <span>{caDice} CA</span>}
              {map(onModifiersForDice, ({ id, modifier, code }) => (
                <span key={id}>
                  {modifier[0]} {code}
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
              {caOffensiveSkill !== 0 && <span>{caOffensiveSkill} CA</span>}
              {map(onModifiersForSkill, ({ id, modifier, code }) => (
                <span key={id}>
                  {modifier[1]} {code}
                </span>
              ))}
              {frightened.on && <span>{frightened.code}</span>}
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
              {caOffensivePower !== 0 && <span>{caOffensivePower} CA</span>}
              {map(onModifiersForPower, ({ id, modifier, code }) => (
                <span key={id}>
                  {modifier[2]} {code}
                </span>
              ))}
              {frightened.on && <span>{frightened.code}</span>}
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
        Command Action Modifiers
      </div>
      <div className="CommandActionModifiers flex h-20 gap-1 mx-4 min-h-20">
        {map(COMMAND_ACTION_MODIFIERS, ({ id, name, color, mod }) => (
          <button
            key={id}
            className={className("flex-1 rounded", id, color)}
            disabled={frightened.on}
            onClick={() =>
              setCommandActionModifiers(([d, os, op]) => [
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
        className="ClearCommandActionModifiers bg-yellow-400 mx-4 rounded h-10"
        onClick={() => setCommandActionModifiers([0, 0, 0])}
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
                <span className="whitespace-pre-line">{modifier.name}</span>
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
