import { useEffect, useMemo, useRef, useState } from "react";
import {
  chunk,
  filter,
  keyBy,
  map,
  mapValues,
  max,
  min,
  pick,
  range,
  some,
  transform,
  values,
} from "lodash";
import {
  GiBowArrow,
  GiBroadsword,
  GiPerspectiveDiceOne,
  GiPerspectiveDiceSix,
  GiCrossedSwords,
  GiRallyTheTroops,
  GiScrollUnfurled,
  GiShield,
} from "react-icons/gi";
import {
  FaMinus,
  FaPlus,
  FaQuestion,
  FaTimes,
  FaVolumeUp,
  FaVolumeMute,
} from "react-icons/fa";
import className from "classnames";
import { MODIFIERS, COMMAND_CARD_MODIFIERS, PLATE_ON } from "./constants";
import {
  MAX_DICE,
  MAX_ROLL,
  deriveDice,
  deriveRoll,
  sumModifiers,
  sumTriples,
} from "./derive";
import { loadArmies, loadState, saveArmy, saveState } from "./persistence";
import {
  UNITS_BY_UID,
  activeAbilities,
  attackProfile,
  damageBoxes,
  damageStatus,
} from "./data";
import { withBoxCycle, withDamage, withReanimate } from "./army";
import { BannerArt } from "./Artwork";
import ArmyBuilder from "./ArmyBuilder";
import DamageRow from "./DamageRow";
import Help from "./Help";
import UnitPicker from "./UnitPicker";
import { usePressable } from "./hooks";
import {
  buzz,
  isMuted,
  playBonus,
  playDrum,
  playPenalty,
  playTick,
  setMuted,
  unlockAudio,
} from "./sounds";

const CARDS_BY_ID = keyBy(COMMAND_CARD_MODIFIERS, "id");

// "+1\nOS" -> "+1 OS"
const flatCardName = (name) => name.replace(/\n/g, " ");

const AnimatedNumber = ({ value, className: cls }) => (
  <span key={value} className={className("inline-block animate-number-in", cls)}>
    {value}
  </span>
);

// Tap increments the rank; holding decrements (repeating while held).
// Keyboard: Enter/Space raise, arrow keys raise/lower.
const RankButton = ({ label, value, onInc, tone }) => {
  const inc = (mod) => {
    onInc(mod);
    playTick();
    buzz();
  };
  const press = usePressable({
    onTap: () => inc(1),
    onHold: () => inc(-1),
    repeat: 280,
    onArrowUp: () => inc(1),
    onArrowDown: () => inc(-1),
  });
  return (
    <button
      className={className(
        "plate flex-1 flex flex-col items-center justify-center py-1",
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

// Reset wipes state and sits next to frequently-tapped controls, so it asks
// for confirmation: hold to reset, or tap twice within the arm window (the
// second path keeps reset reachable by keyboard and discoverable by touch).
const ConfirmResetButton = ({
  onReset,
  className: cls,
  disabled,
  armLabel,
  children,
}) => {
  const [armed, setArmed] = useState(false);
  const armTimer = useRef(null);
  useEffect(() => () => clearTimeout(armTimer.current), []);
  const fire = () => {
    clearTimeout(armTimer.current);
    setArmed(false);
    onReset();
  };
  const press = usePressable({
    onTap: () => {
      if (armed) return fire();
      setArmed(true);
      playTick();
      buzz();
      armTimer.current = setTimeout(() => setArmed(false), 1600);
    },
    onHold: fire,
  });
  return (
    <button
      className={cls}
      disabled={disabled}
      aria-label="Reset. Hold, or tap twice, to confirm."
      {...press}
    >
      <span className="whitespace-pre-line">{armed ? armLabel : children}</span>
    </button>
  );
};

const SLOT_DAMAGE_TONE = {
  fresh: "text-moss-500",
  yellow: "text-ember-400",
  red: "text-blood-400",
  destroyed: "text-blood-500",
};

// One side of the engagement: shows the selected unit card (or a prompt),
// opens the unit picker on tap, and clears via the small × button
const UnitSlot = ({
  role,
  icon: Icon,
  unit,
  copyLabel,
  enemy = false,
  damage,
  onOpen,
  onClear,
}) => (
  <div className={className("UnitSlot flex w-full items-stretch gap-1", role)}>
    <button
      className="plate flex flex-1 items-center gap-2 px-2.5 py-1.5 text-left"
      onClick={onOpen}
      aria-label={
        unit
          ? `${role}: ${unit.name}${enemy ? " (enemy)" : ""}. Tap to change.`
          : `Pick ${role} unit`
      }
    >
      <Icon className="shrink-0 text-lg text-ember-600" aria-hidden />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-baseline gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-bone-500">
          {role}
          {enemy && (
            <span className="rounded-sm border border-blood-500/40 px-1 font-mono text-blood-400">
              enemy
            </span>
          )}
        </span>
        {unit ? (
          <>
            <span className="truncate font-display text-xs tracking-wider text-bone-100">
              {unit.name}
              {copyLabel}
            </span>
            <span className="font-mono text-[9px] leading-tight text-bone-500">
              Cg {unit.courage ?? "—"} · Mv {unit.move}″ · {unit.points} pts
            </span>
            {damage && (
              <span
                className={className(
                  "font-mono text-[9px] leading-tight",
                  SLOT_DAMAGE_TONE[damage.status]
                )}
              >
                {damage.marked}/{damage.total} dmg
                {damage.status !== "fresh"
                  ? ` · ${
                      damage.status === "destroyed"
                        ? "Destroyed"
                        : damage.status === "red"
                          ? "In the Red"
                          : "In the Yellow"
                    }`
                  : ""}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs text-bone-500">Pick a unit&hellip;</span>
        )}
      </span>
    </button>
    {unit && (
      <button
        className="plate flex w-8 shrink-0 items-center justify-center text-bone-500"
        onClick={onClear}
        aria-label={`Clear ${role} unit`}
      >
        <FaTimes className="text-[10px]" aria-hidden />
      </button>
    )}
  </div>
);

const StatCard = ({ title, value, tone, lines }) => (
  <div className="flex items-start justify-center gap-1.5 pt-1">
    <AnimatedNumber
      value={value}
      className={className("font-display text-6xl leading-none", tone)}
    />
    <div className="flex flex-col justify-center pt-1 font-mono text-[10px] leading-tight text-bone-500">
      <span className="text-[11px] font-bold tracking-wider text-bone-300">
        {title}
      </span>
      {lines}
    </div>
  </div>
);

const App = () => {
  // Restore any persisted mid-game state once on mount
  const [initial] = useState(loadState);
  const [baseDice, setBaseDice] = useState(initial.baseDice);
  const [offensiveSkill, setOffensiveSkill] = useState(initial.offensiveSkill);
  const [offensivePower, setOffensivePower] = useState(initial.offensivePower);
  const [defensiveSkill, setDefensiveSkill] = useState(initial.defensiveSkill);
  const [defensivePower, setDefensivePower] = useState(initial.defensivePower);
  // Command Cards played this attack, in play order (array of card ids) —
  // kept as a log, not a net total, so opposing cards stay visible
  const [playedCards, setPlayedCards] = useState(initial.playedCards);
  const [modifiers, setModifiers] = useState(initial.modifiers);
  const [attackMode, setAttackMode] = useState(initial.attackMode);
  // Selected unit cards for each side of the engagement (uids into the
  // faction data files); selection prefills the calculator but never locks
  // it — every value stays hand-adjustable afterwards
  const [attackerUid, setAttackerUid] = useState(initial.attackerUid);
  const [defenderUid, setDefenderUid] = useState(initial.defenderUid);
  // Which fielded copy of the army unit each slot holds (null for units
  // picked outside the army) — copies carry their own damage tallies
  const [attackerCopy, setAttackerCopy] = useState(initial.attackerCopy);
  const [defenderCopy, setDefenderCopy] = useState(initial.defenderCopy);
  // which roster ("mine" | "enemy") each slot's copy came from — a mirror
  // match can field the same unit on both sides, so the uid+copy pair
  // alone is ambiguous
  const [attackerArmy, setAttackerArmy] = useState(initial.attackerArmy);
  const [defenderArmy, setDefenderArmy] = useState(initial.defenderArmy);
  // Shots spent per unit copy (breath weapons, arrows) — keyed uid#copy
  const [ammoSpent, setAmmoSpent] = useState(initial.ammoSpent);
  const [unitPicker, setUnitPicker] = useState(null); // "attacker" | "defender" | null
  // Which faction the picker is browsing, per slot (null = its faction
  // list). Kept per slot and persisted, so reopening lands where you left
  // off — the defender is usually an enemy from another faction.
  const [pickerFaction, setPickerFaction] = useState(initial.pickerFaction);
  const [muted, setMutedState] = useState(isMuted());
  const [showHelp, setShowHelp] = useState(false);
  const [showArmy, setShowArmy] = useState(false);
  // Snapshot of both saved rosters (marks feed the slots' damage
  // readouts); refreshed whenever the army builder closes
  const [armies, setArmies] = useState(loadArmies);

  const attacker = attackerUid ? UNITS_BY_UID[attackerUid] : null;
  const defender = defenderUid ? UNITS_BY_UID[defenderUid] : null;

  const { frightened } = modifiers || {};

  // The attacker's profile for the current stance drives the special-attack
  // locks: some cards forbid Command Cards or fix their dice count (e.g.
  // the Ancient Blue Dragon's lightning breath)
  const activeProfile = attacker ? attackProfile(attacker, attackMode) : null;
  const ccLocked = frightened.on || Boolean(activeProfile?.noCommandCards);
  const diceLocked = Boolean(activeProfile?.lockedDice);

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

  const resetModifiers = () => {
    setModifiers(MODIFIERS);
    playDrum();
    buzz(16);
  };

  // An attack is either melee or ranged: switching stance swaps which
  // situational modifiers are shown and turns the other stance's off.
  const setStance = (mode) => {
    setAttackMode(mode);
    setModifiers((mods) =>
      mapValues(mods, (mod) =>
        mod.category && mod.category !== mode && mod.on
          ? { ...mod, on: false, ...(mod.maxCount ? { count: 0 } : {}) }
          : mod
      )
    );
  };

  // Prefill dice/OS/OP from a unit card's attack profile. If the unit can't
  // attack in the requested stance, switch to the one it can.
  const applyAttackerProfile = (unit, mode) => {
    const usableMode = attackProfile(unit, mode)
      ? mode
      : unit.melee
        ? "melee"
        : "ranged";
    if (usableMode !== attackMode) setStance(usableMode);
    const profile = attackProfile(unit, usableMode);
    setBaseDice(min([profile.dice, MAX_DICE]));
    setOffensiveSkill(profile.offensiveSkill % MAX_ROLL);
    setOffensivePower(profile.offensivePower % MAX_ROLL);
  };

  const switchAttackMode = (mode) => {
    if (mode === attackMode) return;
    setStance(mode);
    // A selected attacker with a profile for the new stance re-applies it;
    // without one (e.g. pikemen switched to ranged) the numbers are left
    // for the player to set by hand
    if (attacker && attackProfile(attacker, mode)) {
      applyAttackerProfile(attacker, mode);
    }
    playTick();
    buzz();
  };

  // An army copy's damage state prefills In the Yellow / In the Red — same
  // philosophy as the stat prefill: set on selection, hand-adjustable after
  const applyDamageState = (unit, copy, armyState) => {
    if (copy === null || copy === undefined) return;
    const marked = armyState.marks[unit.uid]?.[copy] ?? 0;
    const status = damageStatus(unit, marked);
    setModifiers((mods) => ({
      ...mods,
      inTheYellow: { ...mods.inTheYellow, on: status === "yellow" },
      inTheRed: {
        ...mods.inTheRed,
        on: status === "red" || status === "destroyed",
      },
    }));
  };

  const selectUnit = (uid, copy = null, side = null) => {
    const unit = UNITS_BY_UID[uid];
    const armySide = copy === null ? null : side ?? "mine";
    if (unitPicker === "attacker") {
      setAttackerUid(uid);
      setAttackerCopy(copy);
      setAttackerArmy(armySide);
      applyAttackerProfile(unit, attackMode);
      applyDamageState(unit, copy, armies[armySide ?? "mine"]);
    } else {
      setDefenderUid(uid);
      setDefenderCopy(copy);
      setDefenderArmy(armySide);
      setDefensiveSkill(unit.defensiveSkill % MAX_ROLL);
      setDefensivePower(unit.defensivePower % MAX_ROLL);
    }
    setUnitPicker(null);
    playBonus();
    buzz();
  };

  // Clearing a slot keeps the numbers it filled in — they've become the
  // player's manual values
  const clearUnit = (role) => {
    if (role === "attacker") {
      setAttackerUid(null);
      setAttackerCopy(null);
      setAttackerArmy(null);
    } else {
      setDefenderUid(null);
      setDefenderCopy(null);
      setDefenderArmy(null);
    }
    playTick();
    buzz();
  };

  // Damage marked in the army builder flows back: refresh the snapshots
  // and re-prefill the attacker's Yellow/Red state from its copy's tally
  const closeArmy = () => {
    setShowArmy(false);
    const refreshed = loadArmies();
    setArmies(refreshed);
    if (attacker && attackerCopy !== null) {
      applyDamageState(attacker, attackerCopy, refreshed[attackerArmy ?? "mine"]);
    }
  };

  const slotDamage = (unit, copy, side) => {
    if (!unit || copy === null) return null;
    const marked = armies[side ?? "mine"].marks[unit.uid]?.[copy] ?? 0;
    return {
      marked,
      total: damageBoxes(unit),
      status: damageStatus(unit, marked),
    };
  };

  // The selected copies' damage rows live on the battle screen too, so
  // damage can be marked as the dice land without opening the army
  // builder. Edits go through the same ops as the builder's and straight
  // to that side's saved roster; the builder reads both fresh on its next
  // open.
  const editArmy = (side, unit, copy, next) => {
    saveArmy(next, side);
    setArmies((all) => ({ ...all, [side]: next }));
    // damage moving across a band boundary re-prefills In the Yellow / In
    // the Red, exactly as closing the builder does
    if (
      unit.uid === attackerUid &&
      copy === attackerCopy &&
      side === (attackerArmy ?? "mine")
    ) {
      applyDamageState(unit, copy, next);
    }
  };

  const markCopyDamage = (side, unit, copy, value) => {
    const roster = armies[side];
    const healed = value < (roster.marks[unit.uid]?.[copy] ?? 0);
    editArmy(side, unit, copy, withDamage(roster, unit.uid, copy, value));
    if (healed) playTick();
    else playPenalty();
    buzz();
  };

  const reanimateCopy = (side, unit, copy) => {
    editArmy(side, unit, copy, withReanimate(armies[side], unit.uid, copy));
    playBonus();
    buzz();
  };

  const cycleCopyBox = (side, unit, copy) => {
    const roster = armies[side];
    const next = withBoxCycle(roster, unit.uid, copy);
    const marked =
      (next.boxes[unit.uid]?.[copy] ?? 0) >
      (roster.boxes[unit.uid]?.[copy] ?? 0);
    editArmy(side, unit, copy, next);
    if (marked) playBonus();
    else playTick();
    buzz();
  };

  // Only a fielded copy has a persistent track to edit — a unit picked
  // outside both armies shows no row. Enemy copies read from and write to
  // the enemy roster.
  const copyRow = (unit, copy, side) => {
    const roster = armies[side ?? "mine"];
    if (!unit || copy === null || copy >= (roster.counts[unit.uid] ?? 0)) {
      return null;
    }
    return (
      <div className="CopyDamage plate flex flex-col px-2.5 py-1.5">
        <DamageRow
          unit={unit}
          copy={copy}
          copies={roster.counts[unit.uid]}
          marked={roster.marks[unit.uid]?.[copy] ?? 0}
          reanimated={roster.reanimated[unit.uid]?.[copy] === true}
          boxed={roster.boxes[unit.uid]?.[copy] ?? 0}
          onMark={(value) => markCopyDamage(side ?? "mine", unit, copy, value)}
          onReanimate={() => reanimateCopy(side ?? "mine", unit, copy)}
          onBox={() => cycleCopyBox(side ?? "mine", unit, copy)}
        />
      </div>
    );
  };

  const copyLabel = (unit, copy, side) =>
    unit && copy !== null && (armies[side ?? "mine"].counts[unit.uid] ?? 0) > 1
      ? ` #${copy + 1}`
      : "";

  const openUnitPicker = (role) => {
    setUnitPicker(role);
    playTick();
    buzz();
  };

  // Ammo pips for the attacker's current-stance profile (breath weapons,
  // arrows): tap pip N to spend shots through it, tap the last spent pip
  // to recover it. Tallies are per unit copy and survive reloads.
  // enemy copies get a side-qualified key, so a mirror match can't share
  // arrows with the player's same-numbered copy
  const ammoKey = attacker
    ? `${attackerArmy === "enemy" ? "enemy:" : ""}${attacker.uid}#${attackerCopy ?? "-"}`
    : null;
  const ammoTotal = activeProfile?.ammo ?? 0;
  const shotsSpent = min([ammoSpent[ammoKey] ?? 0, ammoTotal]);

  const spendAmmo = (value) => {
    setAmmoSpent((spent) => ({ ...spent, [ammoKey]: value }));
    if (value < shotsSpent) playTick();
    else playDrum();
    buzz();
  };

  // Toggles coming from the rules help can reference a modifier from the
  // other stance — switch stance first so the toggle is legal and visible
  // on the battle screen.
  const activateModifier = (mod) => {
    if (mod.category && mod.category !== attackMode && !mod.on) {
      setStance(mod.category);
    }
    toggleModifier(mod);
  };

  const toggleModifier = (mod) => {
    // Modifiers with a maxCount stack: taps cycle 0 -> 1 -> ... -> maxCount -> 0
    let next;
    if (mod.maxCount) {
      const count = ((mod.count ?? 0) + 1) % (mod.maxCount + 1);
      next = { ...mod, count, on: count > 0 };
    } else {
      next = { ...mod, on: !mod.on };
    }
    if (!next.on) playTick();
    else if (mod.color === "bg-green-400") playBonus();
    else playPenalty();
    buzz();
    setModifiers((mods) => ({ ...mods, [mod.id]: next }));
  };

  const handleCommandCard = ({ id, color }) => {
    setPlayedCards((cards) => [...cards, id]);
    if (color === "bg-green-400") playBonus();
    else playPenalty();
    buzz();
  };

  const removePlayedCard = (index) => {
    setPlayedCards((cards) => filter(cards, (_, i) => i !== index));
    playTick();
    buzz();
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) playTick();
  };

  const [diceModifier, offensiveSkillModifier, offensivePowerModifier] =
    useMemo(() => sumModifiers(modifiers), [modifiers]);

  const [ccDice, ccOffensiveSkill, ccOffensivePower] = useMemo(
    () => sumTriples(map(playedCards, (id) => CARDS_BY_ID[id].mod)),
    [playedCards]
  );

  // The selected attacker's card abilities that are live right now (e.g.
  // Spears while Charging) — applied automatically and shown as their own
  // breakdown lines
  const attackerAbilities = useMemo(
    () =>
      attacker ? activeAbilities(attacker, modifiers, attackMode, defender) : [],
    [attacker, modifiers, attackMode, defender]
  );

  const [abilityDice, abilityOS, abilityOP] = useMemo(
    () => sumTriples(map(attackerAbilities, "bonus")),
    [attackerAbilities]
  );

  // A locked-dice special attack pins the pool at its printed count —
  // nothing (cards, modifiers, abilities) can change it
  const diceToRoll = useMemo(
    () =>
      diceLocked
        ? baseDice
        : deriveDice(baseDice, ccDice, diceModifier + abilityDice),
    [diceLocked, baseDice, ccDice, diceModifier, abilityDice]
  );

  const { value: rollToHit, overkill: hitOverkill } = useMemo(
    () =>
      deriveRoll(
        offensiveSkill -
          defensiveSkill +
          ccOffensiveSkill +
          offensiveSkillModifier +
          abilityOS
      ),
    [
      offensiveSkill,
      defensiveSkill,
      ccOffensiveSkill,
      offensiveSkillModifier,
      abilityOS,
    ]
  );

  const { value: rollToWound, overkill: woundOverkill } = useMemo(
    () =>
      deriveRoll(
        offensivePower -
          defensivePower +
          ccOffensivePower +
          offensivePowerModifier +
          abilityOP
      ),
    [
      offensivePower,
      defensivePower,
      ccOffensivePower,
      offensivePowerModifier,
      abilityOP,
    ]
  );

  // Prime audio on the very first press so that press's own sound plays
  // (iOS keeps a fresh AudioContext suspended until a gesture resumes it)
  useEffect(() => {
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    return () => window.removeEventListener("pointerdown", unlockAudio);
  }, []);

  // A Frightened unit can't have Command Cards played on it, and some
  // special attacks are immune to Command Cards outright
  useEffect(() => {
    if (ccLocked) setPlayedCards([]);
  }, [ccLocked]);

  // Persist the calculator so a reload or tab eviction doesn't lose the game
  useEffect(() => {
    saveState({
      attackMode,
      baseDice,
      offensiveSkill,
      offensivePower,
      defensiveSkill,
      defensivePower,
      attackerUid,
      defenderUid,
      attackerCopy,
      defenderCopy,
      attackerArmy,
      defenderArmy,
      ammoSpent,
      playedCards,
      pickerFaction,
      modifiers,
    });
  }, [
    attackMode,
    baseDice,
    offensiveSkill,
    offensivePower,
    defensiveSkill,
    defensivePower,
    attackerUid,
    defenderUid,
    attackerCopy,
    defenderCopy,
    attackerArmy,
    defenderArmy,
    ammoSpent,
    playedCards,
    pickerFaction,
    modifiers,
  ]);

  // One breakdown line per played card touching this column (0=dice, 1=OS,
  // 2=OP) — opposing cards show as separate lines instead of a hidden net
  const ccLines = (column) =>
    map(playedCards, (id, index) => {
      const value = CARDS_BY_ID[id].mod[column];
      return (
        value !== 0 && <span key={`cc-${index}`}>{value} CC</span>
      );
    });

  // One breakdown line per live attacker ability touching this column
  // (index in the key: a keyword can contribute several same-named effects)
  const abilityLines = (column) =>
    map(attackerAbilities, ({ name, code, bonus }, index) => {
      const value = bonus[column];
      return (
        value !== 0 && (
          <span key={`ability-${name}-${index}`}>
            {value} {code ?? name}
          </span>
        )
      );
    });

  // General modifiers plus the active stance's, in position order
  const visibleModifiers = useMemo(
    () =>
      filter(
        values(modifiers),
        (mod) => !mod.category || mod.category === attackMode
      ),
    [modifiers, attackMode]
  );

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
      playDrum();
      buzz();
    },
    onHold: () => {
      handleIncDice(-1);
      playDrum();
      buzz();
    },
    repeat: 140,
  });

  const diceUp = usePressable({
    onTap: () => {
      handleIncDice(1);
      playDrum();
      buzz();
    },
    onHold: () => {
      handleIncDice(1);
      playDrum();
      buzz();
    },
    repeat: 140,
  });

  return (
    <div
      className="BattleDeck mx-auto flex min-h-dvh max-w-md flex-col bg-iron-900 text-bone-100"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <header className="relative">
        <BannerArt />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <h1 className="font-display text-2xl font-bold tracking-[0.35em] text-ember-400 [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]">
            BATTLEDECK
          </h1>
        </div>
        <button
          className="plate absolute right-2 top-2 flex h-9 w-9 items-center justify-center text-bone-300"
          onClick={toggleMute}
          aria-label={muted ? "Unmute sounds" : "Mute sounds"}
        >
          {muted ? <FaVolumeMute /> : <FaVolumeUp />}
        </button>
        <button
          className="HelpLink plate absolute left-2 top-2 flex h-9 w-9 items-center justify-center text-bone-300"
          onClick={() => {
            setShowHelp(true);
            playTick();
            buzz();
          }}
          aria-label="How your turn works"
        >
          <FaQuestion />
        </button>
        <button
          className="ArmyLink plate absolute left-12 top-2 flex h-9 w-9 items-center justify-center text-bone-300"
          onClick={() => {
            setShowArmy(true);
            playTick();
            buzz();
          }}
          aria-label="Build your army"
        >
          <GiRallyTheTroops className="text-lg" />
        </button>
      </header>

      {showHelp && (
        <Help
          onClose={() => setShowHelp(false)}
          modifiers={modifiers}
          disabledModifiers={disabledModifiers}
          onToggleModifier={activateModifier}
        />
      )}

      {showArmy && <ArmyBuilder onClose={closeArmy} />}

      {unitPicker && (
        <UnitPicker
          role={unitPicker}
          selectedUid={unitPicker === "attacker" ? attackerUid : defenderUid}
          selectedCopy={unitPicker === "attacker" ? attackerCopy : defenderCopy}
          selectedArmy={unitPicker === "attacker" ? attackerArmy : defenderArmy}
          factionId={pickerFaction[unitPicker]}
          onFactionChange={(id) =>
            setPickerFaction((last) => ({ ...last, [unitPicker]: id }))
          }
          onSelect={selectUnit}
          onClose={() => setUnitPicker(null)}
        />
      )}

      <div className="sticky top-0 z-20 border-b border-iron-500 bg-iron-900/95 px-3 pb-2 pt-1 backdrop-blur-sm">
        <div className="Roll grid grid-cols-3 gap-1.5">
          <div className="Dice flex flex-col gap-1">
            <StatCard
              title="Dice"
              value={diceToRoll}
              tone="text-ember-400"
              lines={
                <>
                  <span>{baseDice} base</span>
                  {diceLocked ? (
                    <span className="text-ember-500">locked</span>
                  ) : (
                    <>
                      {ccLines(0)}
                      {abilityLines(0)}
                      {map(
                        onModifiersForDice,
                        ({ id, modifier, count, code }) => (
                          <span key={id}>
                            {modifier[0] * (count ?? 1)} {code}
                          </span>
                        )
                      )}
                      {frightened.on && <span>{frightened.code}</span>}
                    </>
                  )}
                </>
              }
            />
            <div className="flex gap-1">
              <button
                className="plate plate-danger flex h-12 flex-1 items-center justify-center text-xl"
                aria-label="Remove one die. Hold to repeat."
                disabled={diceLocked}
                {...diceDown}
              >
                <FaMinus />
              </button>
              <button
                className="plate plate-boon flex h-12 flex-1 items-center justify-center text-xl"
                aria-label="Add one die. Hold to repeat."
                disabled={diceLocked}
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
              tone="text-blood-300"
              lines={
                <>
                  <span>{offensiveSkill - defensiveSkill} base</span>
                  {ccLines(1)}
                  {abilityLines(1)}
                  {map(onModifiersForSkill, ({ id, modifier, count, code }) => (
                    <span key={id}>
                      {modifier[1] * (count ?? 1)} {code}
                    </span>
                  ))}
                  {frightened.on && <span>{frightened.code}</span>}
                  {hitOverkill > 0 && (
                    <span className="text-ember-500">
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
                tone="OffensiveSkillRank text-blood-300"
              />
              <RankButton
                label="DS"
                value={defensiveSkill}
                onInc={handleIncDefensiveSkill}
                tone="DefensiveSkillRank text-steel-300"
              />
            </div>
          </div>

          <div className="RollToWound flex flex-col gap-1">
            <StatCard
              title="Wound"
              value={rollToWound}
              tone="text-steel-300"
              lines={
                <>
                  <span>{offensivePower - defensivePower} base</span>
                  {ccLines(2)}
                  {abilityLines(2)}
                  {map(onModifiersForPower, ({ id, modifier, count, code }) => (
                    <span key={id}>
                      {modifier[2] * (count ?? 1)} {code}
                    </span>
                  ))}
                  {frightened.on && <span>{frightened.code}</span>}
                  {woundOverkill > 0 && (
                    <span className="text-ember-500">
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
                tone="OffensivePowerRank text-blood-300"
              />
              <RankButton
                label="DP"
                value={defensivePower}
                onInc={handleIncDefensivePower}
                tone="DefensivePowerRank text-steel-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-3 pt-3">
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
          <GiRallyTheTroops className="text-lg text-ember-600" aria-hidden />
          Units
        </div>
        {/* stacked, not side by side: two long unit names plus their clear
            buttons overflow a phone-width column */}
        <div className="Units flex flex-col gap-1">
          <UnitSlot
            role="attacker"
            icon={GiBroadsword}
            unit={attacker}
            copyLabel={copyLabel(attacker, attackerCopy, attackerArmy)}
            enemy={attackerArmy === "enemy"}
            damage={slotDamage(attacker, attackerCopy, attackerArmy)}
            onOpen={() => openUnitPicker("attacker")}
            onClear={() => clearUnit("attacker")}
          />
          {copyRow(attacker, attackerCopy, attackerArmy)}
          <div className="Versus flex items-center gap-2 px-1" aria-hidden>
            <span className="h-px flex-1 bg-iron-500" />
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-bone-500">
              vs
            </span>
            <span className="h-px flex-1 bg-iron-500" />
          </div>
          <UnitSlot
            role="defender"
            icon={GiShield}
            unit={defender}
            copyLabel={copyLabel(defender, defenderCopy, defenderArmy)}
            enemy={defenderArmy === "enemy"}
            damage={slotDamage(defender, defenderCopy, defenderArmy)}
            onOpen={() => openUnitPicker("defender")}
            onClear={() => clearUnit("defender")}
          />
          {copyRow(defender, defenderCopy, defenderArmy)}
        </div>
        {ammoTotal > 0 && (
          <div className="AmmoRow flex items-center justify-center gap-1.5">
            <GiBowArrow className="text-sm text-ember-600" aria-hidden />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-bone-500">
              Ammo
            </span>
            {map(range(ammoTotal), (shot) => (
              <button
                key={shot}
                className={className(
                  "plate h-6 w-6 rounded-[3px]",
                  shot >= shotsSpent && "plate-on-ember"
                )}
                aria-label={`${attacker.name} shot ${shot + 1}`}
                aria-pressed={shot < shotsSpent}
                onClick={() =>
                  spendAmmo(shot + 1 === shotsSpent ? shot : shot + 1)
                }
              />
            ))}
            <span className="font-mono text-[9px] text-bone-500">
              {ammoTotal - shotsSpent} left
            </span>
          </div>
        )}
      </div>

      <div
        className={className(
          "flex flex-col gap-2 px-3 pt-3 transition-opacity duration-300",
          ccLocked && "opacity-40 saturate-50"
        )}
      >
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
          <GiScrollUnfurled className="text-lg text-ember-600" aria-hidden />
          Command cards
        </div>
        <div className="CommandCardModifiers flex h-16 gap-1">
          {map(COMMAND_CARD_MODIFIERS, ({ id, name, color }) => (
            <button
              key={id}
              className={className(
                "plate flex-1 text-sm",
                id,
                color === "bg-green-400" ? "plate-boon" : "plate-danger"
              )}
              disabled={ccLocked}
              onClick={() => handleCommandCard({ id, color })}
            >
              <span className="whitespace-pre-line">{name}</span>
            </button>
          ))}
        </div>
        {playedCards.length > 0 && (
          <div className="PlayedCards flex flex-wrap justify-center gap-1">
            {map(playedCards, (id, index) => {
              const card = CARDS_BY_ID[id];
              return (
                <button
                  key={`played-${id}-${index}`}
                  className={className(
                    "PlayedCard plate flex items-center gap-1.5 px-2.5 py-1.5 text-[11px]",
                    card.color === "bg-green-400" ? "plate-boon" : "plate-danger"
                  )}
                  aria-label={`Played ${flatCardName(card.name)}. Tap to remove.`}
                  disabled={ccLocked}
                  onClick={() => removePlayedCard(index)}
                >
                  {flatCardName(card.name)}
                  <FaTimes className="text-[9px] opacity-60" aria-hidden />
                </button>
              );
            })}
          </div>
        )}
        <ConfirmResetButton
          className="ClearCommandCardModifiers plate plate-on-gold h-10 text-sm tracking-widest"
          disabled={ccLocked}
          armLabel="Tap again to reset"
          onReset={() => {
            setPlayedCards([]);
            playDrum();
            buzz(16);
          }}
        >
          Reset
        </ConfirmResetButton>
      </div>

      <div className="flex flex-col gap-2 px-3 pb-4 pt-3">
        <div className="flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-bone-500">
          <GiCrossedSwords className="text-lg text-ember-600" aria-hidden />
          Situational modifiers
        </div>
        <div className="AttackModeSwitch flex gap-1" role="group" aria-label="Attack type">
          <button
            className={className(
              "MeleeMode plate flex h-10 flex-1 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em]",
              attackMode === "melee" && "plate-on-ember"
            )}
            aria-pressed={attackMode === "melee"}
            onClick={() => switchAttackMode("melee")}
          >
            <GiCrossedSwords className="text-lg" aria-hidden />
            Melee
          </button>
          <button
            className={className(
              "RangedMode plate flex h-10 flex-1 items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em]",
              attackMode === "ranged" && "plate-on-ember"
            )}
            aria-pressed={attackMode === "ranged"}
            onClick={() => switchAttackMode("ranged")}
          >
            <GiBowArrow className="text-lg" aria-hidden />
            Ranged
          </button>
        </div>
        <div className="SituationalModifiers flex flex-1 flex-col gap-1 text-[11px] leading-tight">
          {map(chunk(visibleModifiers, 5), (group, index) => (
            <div className="flex min-h-16 flex-1 gap-1" key={`group-${index}`}>
              {map(group, (modifier) =>
                modifier.id === "reset" ? (
                  <ConfirmResetButton
                    key="modifier-reset"
                    className={className(
                      modifier.id,
                      "plate w-1/5 flex-1",
                      PLATE_ON[modifier.color]
                    )}
                    armLabel={"Tap\nagain"}
                    onReset={resetModifiers}
                  >
                    {modifier.name}
                  </ConfirmResetButton>
                ) : (
                  <button
                    key={`modifier-${modifier.id}`}
                    className={className(
                      modifier.id,
                      "plate w-1/5 flex-1",
                      modifier.on && PLATE_ON[modifier.color]
                    )}
                    disabled={disabledModifiers[modifier.id]}
                    onClick={() => toggleModifier(modifier)}
                  >
                    <span className="whitespace-pre-line">
                      {modifier.name}
                      {modifier.count > 1 ? ` ×${modifier.count}` : ""}
                    </span>
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-auto flex items-center justify-center pb-4 pt-1 text-bone-500">
        <div className="flex items-center gap-3 font-display text-xl tracking-widest">
          <GiPerspectiveDiceOne className="text-2xl text-ember-600" />
          BattleDeck
          <GiPerspectiveDiceSix className="text-2xl text-ember-600" />
        </div>
      </div>
    </div>
  );
};

export default App;
