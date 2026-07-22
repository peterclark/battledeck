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
import {
  GiPerspectiveDiceOne,
  GiPerspectiveDiceSix,
  GiCrossedSwords,
  GiScrollUnfurled,
} from "react-icons/gi";
import { FaMinus, FaPlus, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import className from "classnames";
import { MODIFIERS, COMMAND_CARD_MODIFIERS } from "./constants";
import { BannerArt } from "./Artwork";
import { usePressable } from "./hooks";
import {
  buzz,
  isMuted,
  playPage,
  playQuill,
  playScratch,
  playSeal,
  setMuted,
} from "./sounds";

const MAX_DICE = 20;
const MAX_ROLL = 10;

// Map the semantic colors in constants.js onto ink-stamp styles
const STAMP_ON = {
  "bg-green-400": "stamp-on-green animate-ink-stamp",
  "bg-red-400": "stamp-on-red animate-ink-stamp",
  "bg-yellow-400": "stamp-on-gold",
};

const AnimatedNumber = ({ value, className: cls }) => (
  <span key={value} className={className("inline-block animate-number-in", cls)}>
    {value}
  </span>
);

// Tap increments the rank; holding decrements (repeating while held)
const RankButton = ({ label, value, onInc, tone }) => {
  const press = usePressable({
    onTap: () => {
      onInc(1);
      playQuill();
      buzz();
    },
    onHold: () => {
      onInc(-1);
      playQuill();
      buzz();
    },
    repeat: 280,
  });
  return (
    <button
      className={className(
        "stamp flex-1 flex flex-col items-center justify-center py-1",
        tone
      )}
      aria-label={`${label} rank ${value}. Tap to raise, hold to lower.`}
      {...press}
    >
      <span className="font-display text-3xl leading-none">{value}</span>
      <span className="text-[10px] tracking-widest opacity-70">{label}</span>
    </button>
  );
};

const StatCard = ({ title, value, tone, lines }) => (
  <div className="flex items-start justify-center gap-1.5 pt-1">
    <AnimatedNumber
      value={value}
      className={className("font-display text-6xl leading-none", tone)}
    />
    <div className="flex flex-col justify-center pt-1 font-mono text-[10px] leading-tight text-ink-300">
      <span className="text-[11px] font-bold tracking-wider text-ink-700">
        {title}
      </span>
      {lines}
    </div>
  </div>
);

const App = () => {
  const [baseDice, setBaseDice] = useState(4);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);
  const [commandCardModifiers, setCommandCardModifiers] = useState([0, 0, 0]);
  const [modifiers, setModifiers] = useState(MODIFIERS);
  const [muted, setMutedState] = useState(isMuted());

  const { frightened } = modifiers || {};

  const handleIncDice = (mod) => {
    setBaseDice((dice) => min([max([dice + mod, 0]), MAX_DICE]));
  };

  const handleIncOffensiveSkill = (mod) => {
    setOffensiveSkill((os) => (os + mod + MAX_ROLL) % MAX_ROLL);
  };

  const handleIncOffensivePower = (mod) => {
    setOffensivePower((op) => (op + mod + MAX_ROLL) % MAX_ROLL);
  };

  const handleIncDefensiveSkill = (mod) => {
    setDefensiveSkill((ds) => (ds + mod + MAX_ROLL) % MAX_ROLL);
  };

  const handleIncDefensivePower = (mod) => {
    setDefensivePower((dp) => (dp + mod + MAX_ROLL) % MAX_ROLL);
  };

  const toggleModifier = (mod) => {
    if (mod.id === "reset") {
      setModifiers(MODIFIERS);
      playPage();
      buzz(16);
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
    if (!next.on) playQuill();
    else if (mod.color === "bg-green-400") playSeal();
    else playScratch();
    buzz();
    setModifiers((mods) => ({ ...mods, [mod.id]: next }));
  };

  const handleCommandCard = ({ mod, color }) => {
    setCommandCardModifiers(([d, os, op]) => [
      d + mod[0],
      os + mod[1],
      op + mod[2],
    ]);
    if (color === "bg-green-400") playSeal();
    else playScratch();
    buzz();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playQuill();
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

  const diceDown = usePressable({
    onTap: () => {
      handleIncDice(-1);
      playPage();
      buzz();
    },
    onHold: () => {
      handleIncDice(-1);
      playPage();
      buzz();
    },
    repeat: 140,
  });

  const diceUp = usePressable({
    onTap: () => {
      handleIncDice(1);
      playPage();
      buzz();
    },
    onHold: () => {
      handleIncDice(1);
      playPage();
      buzz();
    },
    repeat: 140,
  });

  return (
    <div
      className="BattleDeck mx-auto flex min-h-dvh max-w-md flex-col bg-parchment-100 text-ink-700 shadow-[0_0_24px_rgba(90,70,40,0.25)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <header className="relative">
        <BannerArt />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-3xl tracking-[0.18em] text-ink-700">
            BattleDeck
          </h1>
        </div>
        <button
          className="stamp absolute right-3 top-3 flex h-9 w-9 items-center justify-center text-ink-500"
          onClick={toggleMute}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
      </header>

      <div className="sticky top-0 z-20 border-b border-parchment-500 bg-parchment-100/95 px-3 pb-2 pt-1 backdrop-blur-sm">
        <div className="Roll grid grid-cols-3 gap-1.5">
          <div className="Dice flex flex-col gap-1">
            <StatCard
              title="Dice"
              value={diceToRoll}
              tone="text-forest-700"
              lines={
                <>
                  <span>{baseDice} base</span>
                  {ccDice !== 0 && <span>{ccDice} CC</span>}
                  {map(onModifiersForDice, ({ id, modifier, count, code }) => (
                    <span key={id}>
                      {modifier[0] * (count ?? 1)} {code}
                    </span>
                  ))}
                  {frightened.on && <span>{frightened.code}</span>}
                </>
              }
            />
            <div className="flex gap-1">
              <button
                className="stamp stamp-danger flex h-12 flex-1 items-center justify-center text-xl"
                aria-label="Remove one die. Hold to repeat."
                {...diceDown}
              >
                <FaMinus />
              </button>
              <button
                className="stamp stamp-boon flex h-12 flex-1 items-center justify-center text-xl"
                aria-label="Add one die. Hold to repeat."
                {...diceUp}
              >
                <FaPlus />
              </button>
            </div>
          </div>

          <div className="RollToHit flex flex-col gap-1">
            <StatCard
              title="Hit"
              value={rollToHit}
              tone="text-wax-500"
              lines={
                <>
                  <span>{offensiveSkill - defensiveSkill} base</span>
                  {ccOffensiveSkill !== 0 && <span>{ccOffensiveSkill} CC</span>}
                  {map(onModifiersForSkill, ({ id, modifier, count, code }) => (
                    <span key={id}>
                      {modifier[1] * (count ?? 1)} {code}
                    </span>
                  ))}
                  {frightened.on && <span>{frightened.code}</span>}
                  {hitOverkill > 0 && (
                    <span className="text-gilt-600">
                      OK: {hitOverkill}&times;6&rarr;5
                    </span>
                  )}
                </>
              }
            />
            <div className="flex h-12 gap-1">
              <RankButton
                label="OS"
                value={offensiveSkill}
                onInc={handleIncOffensiveSkill}
                tone="OffensiveSkillRank text-wax-500"
              />
              <RankButton
                label="DS"
                value={defensiveSkill}
                onInc={handleIncDefensiveSkill}
                tone="DefensiveSkillRank text-azure-600"
              />
            </div>
          </div>

          <div className="RollToWound flex flex-col gap-1">
            <StatCard
              title="Wound"
              value={rollToWound}
              tone="text-azure-600"
              lines={
                <>
                  <span>{offensivePower - defensivePower} base</span>
                  {ccOffensivePower !== 0 && <span>{ccOffensivePower} CC</span>}
                  {map(onModifiersForPower, ({ id, modifier, count, code }) => (
                    <span key={id}>
                      {modifier[2] * (count ?? 1)} {code}
                    </span>
                  ))}
                  {frightened.on && <span>{frightened.code}</span>}
                  {woundOverkill > 0 && (
                    <span className="text-gilt-600">
                      OK: {woundOverkill}&times;6&rarr;5
                    </span>
                  )}
                </>
              }
            />
            <div className="flex h-12 gap-1">
              <RankButton
                label="OP"
                value={offensivePower}
                onInc={handleIncOffensivePower}
                tone="OffensivePowerRank text-wax-500"
              />
              <RankButton
                label="DP"
                value={defensivePower}
                onInc={handleIncDefensivePower}
                tone="DefensivePowerRank text-azure-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div
        className={className(
          "flex flex-col gap-2 px-3 pt-3 transition-opacity duration-300",
          frightened.on && "opacity-40 sepia"
        )}
      >
        <div className="flex items-center justify-center gap-2 font-display text-sm tracking-[0.2em] text-ink-500">
          <GiScrollUnfurled className="text-lg text-gilt-500" aria-hidden />
          Command cards
        </div>
        <div className="CommandCardModifiers flex h-16 gap-1">
          {map(COMMAND_CARD_MODIFIERS, ({ id, name, color, mod }) => (
            <button
              key={id}
              className={className(
                "stamp flex-1 text-sm",
                id,
                color === "bg-green-400" ? "stamp-boon" : "stamp-danger"
              )}
              disabled={frightened.on}
              onClick={() => handleCommandCard({ mod, color })}
            >
              <span className="whitespace-pre-line">{name}</span>
            </button>
          ))}
        </div>
        <button
          className="ClearCommandCardModifiers stamp stamp-on-gold h-10 font-display text-sm tracking-[0.2em]"
          onClick={() => {
            setCommandCardModifiers([0, 0, 0]);
            playPage();
            buzz(16);
          }}
          disabled={frightened.on}
        >
          Reset
        </button>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-4 pt-3">
        <div className="flex items-center justify-center gap-2 font-display text-sm tracking-[0.2em] text-ink-500">
          <GiCrossedSwords className="text-lg text-gilt-500" aria-hidden />
          Situational modifiers
        </div>
        <div className="SituationalModifiers flex flex-1 flex-col gap-1 text-[11px] leading-tight">
          {map(chunk(values(modifiers), 5), (group, index) => (
            <div className="flex min-h-16 flex-1 gap-1" key={`group-${index}`}>
              {map(group, (modifier) => (
                <button
                  key={`modifier-${modifier.id}`}
                  className={className(
                    modifier.id,
                    "stamp w-1/5 flex-1",
                    modifier.on && STAMP_ON[modifier.color]
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
      </div>

      <div className="mt-auto flex items-center justify-center pb-4 pt-1 text-ink-500">
        <div className="flex items-center gap-3 font-display text-xl tracking-widest">
          <GiPerspectiveDiceOne className="text-2xl text-gilt-500" />
          BattleDeck
          <GiPerspectiveDiceSix className="text-2xl text-gilt-500" />
        </div>
      </div>
    </div>
  );
};

export default App;
