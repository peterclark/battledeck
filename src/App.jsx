import { useEffect, useMemo } from "react";
import { useState } from "react"
import { filter, first, keys, map, max, min, pick, pickBy, reduce, values } from "lodash";
import { useUpdateEffect } from "react-use";
import { GiPerspectiveDiceOne, GiPerspectiveDiceSix } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
import className from "classnames";

const MAX_DICE = 20;
const MAX_ROLL = 10;
const MODIFIER_CLASSES = "flex-1 rounded";

const App = () => {
  const [baseDice, setBaseDice] = useState(4);
  const [diceModifier, setDiceModifier] = useState(0);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);

  const [commandActionModifiers, setCommandActionModifiers] = useState([0,0,0]);
  const [offensiveSkillModifier, setOffensiveSkillModifier] = useState(0);
  const [offensivePowerModifier, setOffensivePowerModifier] = useState(0);
  const [modifiers, setModifiers] = useState(MODIFIERS);

  const {
    disrupted,
    frightened,
    inTheYellow,
    inTheRed,
    attackingToMyFlank,
    attackingToMyRear,
    chargingFourOrMoreDice,
    chargingThreeOrLessDice,
    flanking,
    pinching,
    rearAttacking,
    calvaryTarget,
    collosalTarget,
    largeTarget,
    extremeRange,
    fastMovingTarget,
    longRange,
    moveAndShoot,
    notClosestTarget,
  } = modifiers || {};

  const handleIncDice = (mod) => {
    setBaseDice(min([max([baseDice + mod, 0]), MAX_DICE]));
  };

  const handleIncDiceModifier = (mod) => {
    setDiceModifier(diceModifier + mod);
  }

  const handleIncOffensiveSkill = (mod) => {
    setOffensiveSkill((os) => (os + mod) % MAX_ROLL);
  };

  const handleIncOffensiveSkillModifier = (mod) => {
    setOffensiveSkillModifier((osm) => osm + mod);
  };

  const handleIncOffensivePowerModifier = (mod) => {
    setOffensivePowerModifier((opm) => opm + mod);
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

  const handleAddModifiers = (mod) => {
    const [d, os, op] = mod || [];
    handleIncDiceModifier(d);
    handleIncOffensiveSkillModifier(os);
    handleIncOffensivePowerModifier(op);
  };

  const toggleModifier = (val) => setModifiers((m) => ({ ...m, [val]: !m[val] }));

  useUpdateEffect(() => {
    const on = keys(pickBy(modifiers));
    const arrays = values(pick(SITUATIONAL_MODIFIERS, on));
    const mods = reduce(arrays, (sums, val) => ([
      sums[0] + val[0],
      sums[1] + val[1],
      sums[2] + val[2],
    ]), [0,0,0]);
    handleAddModifiers(mods);
  }, [modifiers]);

  const handleClearAll = () => {
    setModifiers(MODIFIERS);
  };

  const [caDice, caOffensiveSkill, caOffensivePower] = commandActionModifiers;

  const diceToRoll = useMemo(() => {
    return max([(baseDice + caDice + diceModifier), 0]);
  }, [baseDice, caDice, diceModifier]);
  
  // 6 is always a miss, 1 is always a hit
  const rollToHit = useMemo(() => {
    const hitTotal = (offensiveSkill - defensiveSkill) + caOffensiveSkill + offensiveSkillModifier;
    return max([min([hitTotal, 5]), 1]);
  }, [offensiveSkill, defensiveSkill, caOffensiveSkill, offensiveSkillModifier]);
  
  const rollToWound = useMemo(() => {
    const woundTotal = (offensivePower - defensivePower) + caOffensivePower + offensivePowerModifier;
    return max([min([woundTotal, 5]), 1]);
  }, [offensivePower, defensivePower, caOffensivePower, offensivePowerModifier]);

  return (
    <div className="BattleDeck flex flex-col h-screen bg-black gap-2">
      <div className="Roll flex flex-1 text-9xl mx-4 mt-4 my-2 mb-0 gap-1">
        <div className="Dice flex-1 flex flex-col items-center justify-between bg-white rounded">
          <span className="text-green-900 flex gap-1">
            {diceToRoll}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Dice</span>
              <span>{baseDice} base</span>
              {caDice !== 0 && <span>{caDice} CA</span>}
              {disrupted && <span>-1 DI</span>}
              {inTheYellow && <span>-1 IY</span>}
              {inTheRed && <span>-2 IR</span>}
              {attackingToMyFlank && <span>-1 AMF</span>}
              {chargingFourOrMoreDice && <span>+2 CH</span>}
              {chargingThreeOrLessDice && <span>+1 CH</span>}
              {frightened && <span>No CA</span>}
            </div>
          </span>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button className="flex-1 ml-2 border-white rounded bg-red-400 text-red-900 flex items-center justify-center" onClick={() => handleIncDice(-1)}><FaMinus /></button>
            <button className="flex-1 mr-2 border-white rounded bg-green-400 text-green-900 flex items-center justify-center" onClick={() => handleIncDice(1)}><FaPlus /></button>
          </div>
        </div>
        <div className="RollToHit flex-1 flex flex-col items-center justify-between bg-white rounded">
          <span className="text-red-900 flex gap-1">
            {rollToHit}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Hit</span>
              <span>{offensiveSkill - defensiveSkill} base</span>
              {caOffensiveSkill !== 0 && <span>{caOffensiveSkill} CA</span>}
              {disrupted ? <span>-1 DI</span> : null}
              {attackingToMyRear && <span>-1 AMR</span>}
              {flanking && <span>+1 FL</span>}
              {pinching && <span>+1 PI</span>}
              {rearAttacking && <span>+1 RA</span>}
              {calvaryTarget && <span>-1 CV</span>}
              {collosalTarget && <span>+2 CO</span>}
              {extremeRange && <span>-2 ER</span>}
              {fastMovingTarget && <span>-1 FAST</span>}
              {largeTarget && <span>+1 LG</span>}
              {longRange && <span>-1 LR</span>}
              {moveAndShoot && <span>-1 M&S</span>}
              {notClosestTarget && <span>-1 NC</span>}
              {frightened && <span>No CA</span>}
            </div>
          </span>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button className="OffensiveSkillRank ml-2 flex-1 border-white rounded bg-rose-900 text-rose-100"  onClick={() => handleIncOffensiveSkill(1)}>{offensiveSkill}</button>
            <button className="DefensiveSkillRank mr-2 flex-1 border-white rounded bg-blue-900 text-blue-100" onClick={() => handleIncDefensiveSkill(1)}>{defensiveSkill}</button>
          </div>
        </div>
        <div className="RollToWound flex-1 flex flex-col items-center justify-between bg-white rounded">
          <div className="text-blue-900 flex gap-1">
            {rollToWound}
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Wound</span>
              <span>{offensivePower - defensivePower} base</span>
              {caOffensivePower !== 0 && <span>{caOffensivePower} CA</span>}
              {disrupted ? <span>-1 DI</span> : null}
              {attackingToMyRear && <span>-1 AMR</span>}
              {pinching && <span>+1 PI</span>}
              {rearAttacking && <span>+1 RA</span>}
              {frightened && <span>No CA</span>}
            </div>
          </div>
          <div className="text-5xl flex w-full h-1/2 max-h-20 gap-1 pb-2">
            <button className="OffensivePowerRank ml-2 flex-1 border-white rounded bg-rose-900 text-rose-100"  onClick={() => handleIncOffensivePower(1)}>{offensivePower}</button>
            <button className="DefensivePowerRank mr-2 flex-1 border-white rounded bg-blue-900 text-blue-100" onClick={() => handleIncDefensivePower(1)}>{defensivePower}</button>
          </div>
        </div>
      </div>

      <div className="text-white font-bold flex justify-center">Command Action Modifiers</div>
      <div className="CommandActionModifiers flex h-20 gap-1 mx-4 min-h-20">
        <button className={className("Plus1 flex-1 bg-red-400 rounded")} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d - 1, ...rest]))} disabled={frightened}>-1<br />Dice</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded")} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d + 1, ...rest]))} disabled={frightened}>+1<br />Dice</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded")} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os - 1, ...rest]))} disabled={frightened}>-1<br />OS</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded")} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os + 1, ...rest]))} disabled={frightened}>+1<br />OS</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded")} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op - 1, ...rest]))} disabled={frightened}>-1<br />OP</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded")} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op + 1, ...rest]))} disabled={frightened}>+1<br />OP</button>
      </div>
      <button className="ClearCommandActionModifiers bg-yellow-400 mx-4 rounded h-10" onClick={() => setCommandActionModifiers([0,0,0])} disabled={frightened}>Reset</button>

      <div className="text-white font-bold flex justify-center">Situational Modifiers</div>
      <div className="SituationalModifiers mx-4 flex flex-col flex-1 gap-1 text-sm">
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("Disrupted w-1/5", MODIFIER_CLASSES, disrupted ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('disrupted')}>Disrupt<br />-ed</button>
          <button className={className("Frightened w-1/5", MODIFIER_CLASSES, frightened ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('frightened')}>Frighten<br />-ed</button>
          <button className={className("InTheYellow w-1/5", MODIFIER_CLASSES, inTheYellow ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('inTheYellow')} disabled={inTheRed}>In the<br />Yellow</button>
          <button className={className("InTheRed w-1/5", MODIFIER_CLASSES, inTheRed ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('inTheRed')} disabled={inTheYellow}>In the<br />Red</button>
          <button className={className("AttackingToFlank w-1/5", MODIFIER_CLASSES, attackingToMyFlank ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('attackingToMyFlank')} disabled={attackingToMyRear || flanking || pinching || rearAttacking || extremeRange || longRange || notClosestTarget || fastMovingTarget || moveAndShoot || notClosestTarget}>Attack<br />my Flank</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("AttackingToRear", MODIFIER_CLASSES, attackingToMyRear ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('attackingToMyRear')} disabled={attackingToMyFlank || flanking || pinching || rearAttacking || extremeRange || longRange || notClosestTarget || fastMovingTarget || moveAndShoot || notClosestTarget}>Attack<br />my Rear</button>
          <button className={className("ChargingFourOrMoreDice", MODIFIER_CLASSES, chargingFourOrMoreDice ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('chargingFourOrMoreDice')} disabled={chargingThreeOrLessDice || extremeRange || longRange || fastMovingTarget || moveAndShoot || notClosestTarget}>Charge<br />4+ dice</button>
          <button className={className("ChargingThreeOrLessDice", MODIFIER_CLASSES, chargingThreeOrLessDice ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('chargingThreeOrLessDice')} disabled={chargingFourOrMoreDice || extremeRange || longRange || fastMovingTarget || moveAndShoot || notClosestTarget}>Charge<br />3- dice</button>
          <button className={className("Flanking", MODIFIER_CLASSES, flanking ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('flanking')} disabled={attackingToMyFlank || attackingToMyRear || rearAttacking || extremeRange || longRange || fastMovingTarget || moveAndShoot || notClosestTarget}>Flanking<br />Enemy</button>
          <button className={className("Pinching", MODIFIER_CLASSES, pinching ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('pinching')} disabled={attackingToMyFlank || attackingToMyRear || extremeRange || longRange || fastMovingTarget || moveAndShoot || notClosestTarget}>Pinching<br />Enemy</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("RearAttacking", MODIFIER_CLASSES, rearAttacking ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('rearAttacking')} disabled={attackingToMyFlank || attackingToMyRear || flanking || extremeRange || longRange || fastMovingTarget || fastMovingTarget || extremeRange || longRange || moveAndShoot || notClosestTarget}>Rear<br />Attack</button>
          <button className={className("CalvaryTarget", MODIFIER_CLASSES, calvaryTarget ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('calvaryTarget')}>Calvary<br />Target</button>
          <button className={className("ColossalTarget", MODIFIER_CLASSES, collosalTarget ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('collosalTarget')} disabled={largeTarget}>Collosal<br />Target</button>
          <button className={className("LargeTarget", MODIFIER_CLASSES, largeTarget ? "bg-green-400" : "bg-white")} onClick={() => toggleModifier('largeTarget')} disabled={collosalTarget}>Large<br />Target</button>
          <button className={className("FastMovingTarget", MODIFIER_CLASSES, fastMovingTarget ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('fastMovingTarget')} disabled={attackingToMyFlank || attackingToMyRear || chargingFourOrMoreDice || chargingThreeOrLessDice || flanking || pinching || rearAttacking}>Fast<br />Target</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("ExtremeRange", MODIFIER_CLASSES, extremeRange ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('extremeRange')} disabled={attackingToMyFlank || attackingToMyRear || chargingFourOrMoreDice || chargingThreeOrLessDice || flanking || pinching || rearAttacking || longRange}>Extreme<br />Range<br />15+</button>
          <button className={className("LongRange", MODIFIER_CLASSES, longRange ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('longRange')} disabled={attackingToMyFlank || attackingToMyRear || chargingFourOrMoreDice || chargingThreeOrLessDice || flanking || pinching || rearAttacking || extremeRange}>Long<br />Range<br />7-14</button>
          <button className={className("MoveAndShoot", MODIFIER_CLASSES, moveAndShoot ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('moveAndShoot')} disabled={attackingToMyFlank || attackingToMyRear || chargingFourOrMoreDice || chargingThreeOrLessDice || flanking || pinching || rearAttacking}>Move &<br />Shoot</button>
          <button className={className("NotClosestTarget", MODIFIER_CLASSES, notClosestTarget ? "bg-red-400" : "bg-white")} onClick={() => toggleModifier('notClosestTarget')} disabled={attackingToMyFlank || attackingToMyRear || chargingFourOrMoreDice || chargingThreeOrLessDice || flanking || pinching || rearAttacking}>Not<br />Closest</button>
          <button className={className("ClearAll bg-yellow-400", MODIFIER_CLASSES)} onClick={handleClearAll}>Reset</button>
        </div>
      </div>
      <div className="text-lg flex text-white items-center justify-center mx-4 mt-2 min-h-20">
        <div className="mx-4 text-3xl flex items-center gap-4">
          <GiPerspectiveDiceOne className="text-4xl" />
          BattleDeck
          <GiPerspectiveDiceSix className="text-4xl" />
        </div>
      </div>
    </div>
  )
}

export default App;

const SITUATIONAL_MODIFIERS = {
  disrupted: [-1,-1,-1],
  frightened: [0,0,0],
  inTheYellow: [-1,0,0],
  inTheRed: [-2,0,0],
  attackingToMyFlank: [-1,0,0,],
  attackingToMyRear: [0,-1,-1],
  chargingFourOrMoreDice: [2,0,0],
  chargingThreeOrLessDice: [1,0,0],
  flanking: [0,1,0],
  pinching: [0,1,1],
  rearAttacking: [0,1,1],
  calvaryTarget: [0,-1,0],
  collosalTarget: [0,2,0],
  largeTarget: [0,-2,0],
  extremeRange: [0,-1,0],
  fastMovingTarget: [0,1,0],
  longRange: [0,-1,0],
  moveAndShoot: [0,-1,0],
  notClosestTarget: [0,-1,0],
};

const MODIFIERS = {
  disrupted: false,
  frightened: false,
  inTheYellow: false,
  inTheRed: false,
  attackingToMyFlank: false,
  attackingToMyRear: false,
  chargingFourOrMoreDice: false,
  chargingThreeOrLessDice: false,
  flanking: false,
  pinching: false,
  rearAttacking: false,
  calvaryTarget:  false,
  collosalTarget: false,
  largeTarget:  false,
  extremeRange:  false,
  fastMovingTarget: false,
  longRange:  false,
  moveAndShoot:  false,
  notClosestTarget:  false,
};
