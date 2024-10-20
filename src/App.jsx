// import { GiInvertedDice3 } from "react-icons";

import { useMemo } from "react";
import { useState } from "react"
import { max, min } from "lodash";
import { useToggle } from "react-use";
import className from "classnames";

const MAX_DICE = 20;
const MAX_ROLL = 10;
const MODIFIER_CLASSES = "flex-1 rounded";

const App = () => {
  const [dice, setDice] = useState(6);
  const [offensiveSkill, setOffensiveSkill] = useState(0);
  const [offensivePower, setOffensivePower] = useState(0);
  const [defensiveSkill, setDefensiveSkill] = useState(0);
  const [defensivePower, setDefensivePower] = useState(0);
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

  const modifiers = {
    disrupted,
    frightened,
    inTheYellow,
    inTheRed,
    attackingToFlank,
    attackingToRear,
    chargingFourOrMoreDice,
    chargingThreeOrLessDice,
    flanking,
    pinching,
    rearAttacking,
  };
  
  // 6 is always a miss, 1 is always a hit
  const rollToHit = useMemo(() => {
    return max([min([offensiveSkill - defensiveSkill, 5]), 1]);
  }, [offensiveSkill, defensiveSkill]);
  
  const rollToWound = useMemo(() => {
    return max([min([offensivePower - defensivePower, 5]), 1]);
  }, [offensivePower, defensivePower]);

  const handleIncDice = (mod) => {
    setDice((dice + mod) % MAX_DICE);
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

  const handleIncAttack = (mod) => {
    const [d, os, op] = mod || [];
    handleIncDice(d);
    handleIncOffensiveSkill(os);
    handleIncOffensivePower(op);
  };

  useMemo(() => handleIncAttack(disrupted ? [-1, -1, -1] : [1,1,1]) , [disrupted]);
  // useMemo(() => handleIncAttack(frightened ? [-1, -1, -1] : [1,1,1]) , [frightened]);
  useMemo(() => handleIncAttack(inTheYellow ? [-1, 0, 0] : [1,0,0]) , [inTheYellow]);
  useMemo(() => handleIncAttack(inTheRed ? [-2,0,0] : [2,0,0]) , [inTheRed]);
  useMemo(() => handleIncAttack(attackingToFlank ? [1,0,0,] : [-1,0,0]) , [attackingToFlank]);
  useMemo(() => handleIncAttack(attackingToRear ? [0,-1,-1] : [0,1,1]) , [attackingToRear]);
  useMemo(() => handleIncAttack(chargingFourOrMoreDice ? [+2,0,0] : [-2,0,0]) , [chargingFourOrMoreDice]);
  useMemo(() => handleIncAttack(chargingThreeOrLessDice ? [1,0,0] : [-1,0,0]) , [chargingThreeOrLessDice]);
  useMemo(() => handleIncAttack(flanking ? [0,1,0] : [0,-1,0]) , [flanking]);
  useMemo(() => handleIncAttack(pinching ? [0,1,1] : [0,-1,-1]) , [pinching]);
  useMemo(() => handleIncAttack(rearAttacking ? [0,1,1] : [0,-1,-1]) , [rearAttacking]);
  useMemo(() => handleIncAttack(calvaryTarget ? [0,-1,0] : [0,1,0]) , [calvaryTarget]);
  useMemo(() => handleIncAttack(collosalTarget ? [0,2,0] : [0,-2,0]) , [collosalTarget]);
  useMemo(() => handleIncAttack(extremeRange ? [0,-2,0] : [0,2,0]) , [extremeRange]);
  useMemo(() => handleIncAttack(fastMovingTarget ? [0,-1,0] : [0,1,0]) , [fastMovingTarget]);
  useMemo(() => handleIncAttack(largeTarget ? [0,1,0] : [0,-1,0]) , [largeTarget]);
  useMemo(() => handleIncAttack(longRange ? [0,-1,0] : [0,1,0]) , [longRange]);
  useMemo(() => handleIncAttack(moveAndShoot ? [0,-1,0] : [0,1,0]) , [moveAndShoot]);
  useMemo(() => handleIncAttack(notClosestTarget ? [0,-1,0] : [0,1,0]) , [notClosestTarget]);

  const handleClearAll = () => {
    setDice(6);
    setOffensiveSkill(0);
    setOffensivePower(0);
    setDefensiveSkill(0);
    setDefensivePower(0);
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

  return (
    <div className="BattleDeck flex flex-col h-screen bg-black gap-4">
      <div className="Roll flex flex-1 text-9xl mx-4 mt-4 my-2 mb-0 gap-4">
        <button className="Dice flex-1 flex items-center justify-center bg-white rounded" onClick={() => handleIncDice(1)}>
          {dice}
        </button>
        <div className="RollToHit flex-1 flex items-center justify-center bg-white rounded">
          {rollToHit}
        </div>
        <div className="RollToWound flex-1 flex items-center justify-center bg-white rounded">
          {rollToWound}
        </div>
      </div>
      <div className="Offense flex flex-1 text-9xl gap-4 mx-4">
        <div className="OffensiveSkill flex flex-1">
          <button className="OffensiveSkillRank flex-1 bg-rose-900 text-rose-50 rounded" onClick={() => handleIncOffensiveSkill(1)}>{offensiveSkill}</button>
        </div>
        <div className="OffensivePower flex flex-1">
          <button className="OffensivePowerRank flex-1 bg-rose-700 text-rose-50 rounded" onClick={() => handleIncOffensivePower(1)}>{offensivePower}</button>
        </div>
      </div>
      <div className="Defense flex flex-1 text-9xl gap-4 mx-4">
        <div className="DefensiveSkill flex flex-1">
          <button className="DefensiveSkillRank flex-1 bg-blue-900 text-blue-50 rounded" onClick={() => handleIncDefensiveSkill(1)}>{defensiveSkill}</button>
        </div>
        <div className="DefensivePower flex flex-1">
          <button className="DefensivePowerRank flex-1 bg-blue-700 text-blue-50 rounded" onClick={() => handleIncDefensivePower(1)}>{defensivePower}</button>
        </div>
      </div>
      <div className="SituationalModifiers mx-4 flex flex-col flex-1 gap-4">
        <div className="flex flex-1 gap-4">
          <button className={className("Disrupted", MODIFIER_CLASSES, disrupted ? "bg-red-400" : "bg-white")} onClick={toggleDisrupted}>Disrupted</button>
          <button className={className("Frightened", MODIFIER_CLASSES, frightened ? "bg-red-400" : "bg-white")} onClick={toggleFrightened}>Frightened</button>
          <button className={className("InTheYellow", MODIFIER_CLASSES, inTheYellow ? "bg-red-400" : "bg-white")} onClick={toggleInTheYellow}>In Yellow</button>
          <button className={className("InTheRed", MODIFIER_CLASSES, inTheRed ? "bg-red-400" : "bg-white")} onClick={toggleInTheRed}>In Red</button>
          <button className={className("AttackingToFlank", MODIFIER_CLASSES, attackingToFlank ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToFlank}>Attack Flank</button>
          <button className={className("AttackingToRear", MODIFIER_CLASSES, attackingToRear ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToRear}>Attack Rear</button>
          <button className={className("ChargingFourOrMoreDice", MODIFIER_CLASSES, chargingFourOrMoreDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingFourOrMoreDice}>Charge +4</button>
          <button className={className("ChargingThreeOrLessDice", MODIFIER_CLASSES, chargingThreeOrLessDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingThreeOrLessDice}>Charge 3-</button>
          <button className={className("Flanking", MODIFIER_CLASSES, flanking ? "bg-green-400" : "bg-white")} onClick={toggleFlanking}>Flanking</button>
          <button className={className("Pinching", MODIFIER_CLASSES, pinching ? "bg-green-400" : "bg-white")} onClick={togglePinching}>Pinching</button>
        </div>
        <div className="flex flex-1 gap-4">
          <button className={className("RearAttacking", MODIFIER_CLASSES, rearAttacking ? "bg-green-400" : "bg-white")} onClick={toggleRearAttacking}>Rear Attack</button>
          <button className={className("CalvaryTarget", MODIFIER_CLASSES, calvaryTarget ? "bg-red-400" : "bg-white")} onClick={toggleCalvaryTarget}>Calvary Target</button>
          <button className={className("ColossalTarget", MODIFIER_CLASSES, collosalTarget ? "bg-green-400" : "bg-white")} onClick={toggleColossalTarget}>Collosal Target</button>
          <button className={className("LargeTarget", MODIFIER_CLASSES, largeTarget ? "bg-green-400" : "bg-white")} onClick={toggleLargeTarget}>Large Target</button>
          <button className={className("ExtremeRange", MODIFIER_CLASSES, extremeRange ? "bg-red-400" : "bg-white")} onClick={toggleExtremeRange}>Extreme Range 15+</button>
          <button className={className("FastMovingTarget", MODIFIER_CLASSES, fastMovingTarget ? "bg-red-400" : "bg-white")} onClick={toggleFastMovingTarget}>Fast Target</button>
          <button className={className("LongRange", MODIFIER_CLASSES, longRange ? "bg-green-400" : "bg-white")} onClick={toggleLongRange}>Long Range 7-14</button>
          <button className={className("MoveAndShoot", MODIFIER_CLASSES, moveAndShoot ? "bg-red-400" : "bg-white")} onClick={toggleMoveAndShoot}>Move & Shoot</button>
          <button className={className("NotClosestTarget", MODIFIER_CLASSES, notClosestTarget ? "bg-red-400" : "bg-white")} onClick={toggleNotClosestTarget}>Not Closest</button>
          <button className={className("ClearAll bg-yellow-400", MODIFIER_CLASSES)} onClick={handleClearAll}>Clear All</button>
        </div>
      </div>
      <div className="CommandActionModifiers flex h-20 gap-4 mx-4 mb-4">
        <button className="Plus1 flex-1 bg-red-400 rounded" onClick={() => handleIncOffensiveSkill(-1)}>-1 Offensive Skill</button>
        <button className="Plus1 flex-1 bg-green-400 rounded" onClick={() => handleIncOffensiveSkill(1)}>+1 Offensive Skill</button>
        <button className="Plus1 flex-1 bg-red-400 rounded" onClick={() => handleIncOffensivePower(-1)}>-1 Offensive Power</button>
        <button className="Plus1 flex-1 bg-green-400 rounded" onClick={() => handleIncOffensivePower(1)}>+1 Offensive Power</button>
      </div>
    </div>
  )
}

export default App
