// import { GiInvertedDice3 } from "react-icons";

import { useEffect, useMemo } from "react";
import { useState } from "react"
import { max, min } from "lodash";
import { useToggle, useUpdateEffect } from "react-use";
import className from "classnames";

const MAX_ROLL = 10;
const MODIFIER_CLASSES = "flex-1 rounded";

const App = () => {
  const [baseDice, setBaseDice] = useState(6);
  const [diceModifier, setDiceModifier] = useState(0);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);

  const [commandActionModifiers, setCommandActionModifiers] = useState([0,0,0]);
  const [offensiveSkillModifier, setOffensiveSkillModifier] = useState(0);
  const [offensivePowerModifier, setOffensivePowerModifier] = useState(0);

  const [disrupted, toggleDisrupted] = useToggle(false);
  const [frightened, toggleFrightened] = useToggle(false);
  const [inTheYellow, toggleInTheYellow] = useToggle(false); 
  const [inTheRed, toggleInTheRed] = useToggle(false); 
  const [attackingToFlank, toggleAttackingToFlank] = useToggle(false); 
  const [attackingToRear, toggleAttackingToRear] = useToggle(false); 
  const [chargingFourOrMoreDice, toggleChargingFourOrMoreDice] = useToggle(false); 
  const [chargingThreeOrLessDice, toggleChargingThreeOrLessDice] = useToggle(false); 
  const [flanking, toggleFlanking] = useToggle(false); 
  const [pinching, togglePinching] = useToggle(false); 
  const [rearAttacking, toggleRearAttacking] = useToggle(false);
  const [calvaryTarget, toggleCalvaryTarget] = useToggle(false);
  const [collosalTarget, toggleColossalTarget] = useToggle(false);
  const [largeTarget, toggleLargeTarget] = useToggle(false);
  const [extremeRange, toggleExtremeRange] = useToggle(false);
  const [fastMovingTarget, toggleFastMovingTarget] = useToggle(false);
  const [longRange, toggleLongRange] = useToggle(false);
  const [moveAndShoot, toggleMoveAndShoot] = useToggle(false);
  const [notClosestTarget, toggleNotClosestTarget] = useToggle(false);

  const handleIncDice = (mod) => {
    setBaseDice(max([baseDice + mod, 0]));
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

  useUpdateEffect(() => handleAddModifiers(disrupted ? [-1, -1, -1] : [1,1,1]) , [disrupted]);
  useUpdateEffect(() => {
    setCommandActionModifiers([0,0,0]);
  }, [frightened]);
  useUpdateEffect(() => handleAddModifiers(inTheYellow ? [-1, 0, 0] : [1,0,0]) , [inTheYellow]);
  useUpdateEffect(() => handleAddModifiers(inTheRed ? [-2,0,0] : [2,0,0]) , [inTheRed]);
  useUpdateEffect(() => handleAddModifiers(attackingToFlank ? [1,0,0,] : [-1,0,0]) , [attackingToFlank]);
  useUpdateEffect(() => handleAddModifiers(attackingToRear ? [0,-1,-1] : [0,1,1]) , [attackingToRear]);
  useUpdateEffect(() => handleAddModifiers(chargingFourOrMoreDice ? [+2,0,0] : [-2,0,0]) , [chargingFourOrMoreDice]);
  useUpdateEffect(() => handleAddModifiers(chargingThreeOrLessDice ? [1,0,0] : [-1,0,0]) , [chargingThreeOrLessDice]);
  useUpdateEffect(() => handleAddModifiers(flanking ? [0,1,0] : [0,-1,0]) , [flanking]);
  useUpdateEffect(() => handleAddModifiers(pinching ? [0,1,1] : [0,-1,-1]) , [pinching]);
  useUpdateEffect(() => handleAddModifiers(rearAttacking ? [0,1,1] : [0,-1,-1]) , [rearAttacking]);
  useUpdateEffect(() => handleAddModifiers(calvaryTarget ? [0,-1,0] : [0,1,0]) , [calvaryTarget]);
  useUpdateEffect(() => handleAddModifiers(collosalTarget ? [0,2,0] : [0,-2,0]) , [collosalTarget]);
  useUpdateEffect(() => handleAddModifiers(extremeRange ? [0,-2,0] : [0,2,0]) , [extremeRange]);
  useUpdateEffect(() => handleAddModifiers(fastMovingTarget ? [0,-1,0] : [0,1,0]) , [fastMovingTarget]);
  useUpdateEffect(() => handleAddModifiers(largeTarget ? [0,1,0] : [0,-1,0]) , [largeTarget]);
  useUpdateEffect(() => handleAddModifiers(longRange ? [0,-1,0] : [0,1,0]) , [longRange]);
  useUpdateEffect(() => handleAddModifiers(moveAndShoot ? [0,-1,0] : [0,1,0]) , [moveAndShoot]);
  useUpdateEffect(() => handleAddModifiers(notClosestTarget ? [0,-1,0] : [0,1,0]) , [notClosestTarget]);

  const handleClearAll = () => {
    setBaseDice(6);
    setOffensiveSkill(0);
    setOffensivePower(0);
    setDefensiveSkill(0);
    setDefensivePower(0);
    setCommandActionModifiers([0,0,0])
    setOffensiveSkillModifier(0);
    toggleDisrupted(false);
    toggleFrightened(false);
    toggleInTheYellow(false);
    toggleInTheRed(false);
    toggleAttackingToFlank(false);
    toggleAttackingToRear(false);
    toggleChargingFourOrMoreDice(false);
    toggleChargingThreeOrLessDice(false);
    toggleFlanking(false);
    togglePinching(false);
    toggleRearAttacking(false);
    toggleCalvaryTarget(false);
    toggleColossalTarget(false);
    toggleLargeTarget(false);
    toggleExtremeRange(false);
    toggleFastMovingTarget(false);
    toggleLongRange(false);
    toggleMoveAndShoot(false);
    toggleNotClosestTarget(false);
  };

  useEffect(() => handleClearAll(), []);

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
            <div className="flex flex-col text-xs justify-center">
              <span>{baseDice} base</span>
              <span>{caDice > 0 ? "+" : ""}{caDice} CA</span>
              {disrupted ? <span>-1 Disrupted</span> : null}
            </div>
          </span>
          <div className="text-7xl flex w-full max-h-20 gap-1 pb-2">
            <button className="flex-1 ml-2 border-white rounded bg-red-400 text-red-900" onClick={() => handleIncDice(-1)}>-</button>
            <button className="flex-1 mr-2 border-white rounded bg-green-400 text-green-900" onClick={() => handleIncDice(1)}>+</button>
          </div>
        </div>
        <div className="RollToHit flex-1 flex flex-col items-center justify-between bg-white rounded">
          <span className="text-red-900 flex gap-1">
            {rollToHit}
            <div className="flex flex-col text-xs justify-center">
              <span>{rollToHit} base ({offensiveSkill} - {defensiveSkill})</span>
              <span>{caOffensiveSkill > 0 ? "+" : ""}{caOffensiveSkill} CA</span>
              {disrupted ? <span>-1 Disrupted</span> : null}
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
            <div className="flex flex-col text-xs justify-center">
              <span>{rollToWound} base ({offensivePower} - {defensivePower})</span>
              <span>{caOffensivePower > 0 ? "+" : ""}{caOffensivePower} CA</span>
              {disrupted ? <span>-1 Disrupted</span> : null}
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
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d - 1, ...rest]))} disabled={frightened}>-1 Dice</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d + 1, ...rest]))} disabled={frightened}>+1 Dice</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os - 1, ...rest]))} disabled={frightened}>-1 OS</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os + 1, ...rest]))} disabled={frightened}>+1 OS</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op - 1, ...rest]))} disabled={frightened}>-1 OP</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op + 1, ...rest]))} disabled={frightened}>+1 OP</button>
      </div>
      <div className="text-white font-bold flex justify-center">Situational Modifiers</div>
      <div className="SituationalModifiers mx-4 flex flex-col flex-1 gap-1">
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("Disrupted w-1/5", MODIFIER_CLASSES, disrupted ? "bg-red-400" : "bg-white")} onClick={toggleDisrupted}>Disrupted</button>
          <button className={className("Frightened w-1/5", MODIFIER_CLASSES, frightened ? "bg-red-400" : "bg-white")} onClick={toggleFrightened}>Frightened</button>
          <button className={className("InTheYellow w-1/5", MODIFIER_CLASSES, inTheYellow ? "bg-red-400" : "bg-white")} onClick={toggleInTheYellow}>In Yellow</button>
          <button className={className("InTheRed w-1/5", MODIFIER_CLASSES, inTheRed ? "bg-red-400" : "bg-white")} onClick={toggleInTheRed}>In Red</button>
          <button className={className("AttackingToFlank w-1/5", MODIFIER_CLASSES, attackingToFlank ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToFlank}>Attack Flank</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("AttackingToRear", MODIFIER_CLASSES, attackingToRear ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToRear}>Attack Rear</button>
          <button className={className("ChargingFourOrMoreDice", MODIFIER_CLASSES, chargingFourOrMoreDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingFourOrMoreDice}>Charge +4</button>
          <button className={className("ChargingThreeOrLessDice", MODIFIER_CLASSES, chargingThreeOrLessDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingThreeOrLessDice}>Charge 3-</button>
          <button className={className("Flanking", MODIFIER_CLASSES, flanking ? "bg-green-400" : "bg-white")} onClick={toggleFlanking}>Flanking</button>
          <button className={className("Pinching", MODIFIER_CLASSES, pinching ? "bg-green-400" : "bg-white")} onClick={togglePinching}>Pinching</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("RearAttacking", MODIFIER_CLASSES, rearAttacking ? "bg-green-400" : "bg-white")} onClick={toggleRearAttacking}>Rear Attack</button>
          <button className={className("CalvaryTarget", MODIFIER_CLASSES, calvaryTarget ? "bg-red-400" : "bg-white")} onClick={toggleCalvaryTarget}>Calvary Target</button>
          <button className={className("ColossalTarget", MODIFIER_CLASSES, collosalTarget ? "bg-green-400" : "bg-white")} onClick={toggleColossalTarget}>Collosal Target</button>
          <button className={className("LargeTarget", MODIFIER_CLASSES, largeTarget ? "bg-green-400" : "bg-white")} onClick={toggleLargeTarget}>Large Target</button>
          <button className={className("ExtremeRange", MODIFIER_CLASSES, extremeRange ? "bg-red-400" : "bg-white")} onClick={toggleExtremeRange}>Extreme Range 15+</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("FastMovingTarget", MODIFIER_CLASSES, fastMovingTarget ? "bg-red-400" : "bg-white")} onClick={toggleFastMovingTarget}>Fast Target</button>
          <button className={className("LongRange", MODIFIER_CLASSES, longRange ? "bg-green-400" : "bg-white")} onClick={toggleLongRange}>Long Range 7-14</button>
          <button className={className("MoveAndShoot", MODIFIER_CLASSES, moveAndShoot ? "bg-red-400" : "bg-white")} onClick={toggleMoveAndShoot}>Move & Shoot</button>
          <button className={className("NotClosestTarget", MODIFIER_CLASSES, notClosestTarget ? "bg-red-400" : "bg-white")} onClick={toggleNotClosestTarget}>Not Closest</button>
          <button className={className("ClearAll bg-yellow-400", MODIFIER_CLASSES)} onClick={handleClearAll}>Clear All</button>
        </div>
      </div>
      <div className="text-lg flex text-white items-center justify-center mx-4 mt-2 min-h-20">
        <div className="mx-4 text-3xl">BattleDeck</div>
      </div>
    </div>
  )
}

export default App
