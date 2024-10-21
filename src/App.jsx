import { useEffect, useMemo } from "react";
import { useState } from "react"
import { max, min } from "lodash";
import { useToggle, useUpdateEffect } from "react-use";
import { GiPerspectiveDiceOne, GiPerspectiveDiceSix } from "react-icons/gi";
import { FaMinus, FaPlus } from "react-icons/fa";
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
  const [attackingToMyFlank, toggleAttackingToMyFlank] = useToggle(false); 
  const [attackingToMyRear, toggleAttackingToMyRear] = useToggle(false); 
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
  useUpdateEffect(() => handleAddModifiers(attackingToMyFlank ? [-1,0,0,] : [1,0,0]) , [attackingToMyFlank]);
  useUpdateEffect(() => handleAddModifiers(attackingToMyRear ? [0,-1,-1] : [0,1,1]) , [attackingToMyRear]);
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
    toggleAttackingToMyFlank(false);
    toggleAttackingToMyRear(false);
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
            <div className="flex flex-col text-xs justify-center font-mono">
              <span className="font-bold text-sm">Dice</span>
              <span>{baseDice} base</span>
              {caDice > 0 && <span>+{caDice} CA</span>}
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
              <span className="font-bold text-sm">To Hit</span>
              <span>{offensiveSkill - defensiveSkill} base</span>
              {caOffensiveSkill > 0 && <span>+{caOffensiveSkill} CA</span>}
              {disrupted ? <span>-1 DI</span> : null}
              {attackingToMyRear && <span>-1 AMR</span>}
              {flanking && <span>+1 FL</span>}
              {pinching && <span>+1 PI</span>}
              {rearAttacking && <span>+1 RA</span>}
              {calvaryTarget && <span>-1 CA</span>}
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
              <span>{offensivePower - defensivePower} base</span>
              {caOffensivePower > 0 && <span>+{caOffensivePower} CA</span>}
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
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d - 1, ...rest]))} disabled={frightened}>-1<br />Dice</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, ...rest]) => ([d + 1, ...rest]))} disabled={frightened}>+1<br />Dice</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os - 1, ...rest]))} disabled={frightened}>-1<br />OS</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, ...rest]) => ([d, os + 1, ...rest]))} disabled={frightened}>+1<br />OS</button>
        <button className={className("Plus1 flex-1 bg-red-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op - 1, ...rest]))} disabled={frightened}>-1<br />OP</button>
        <button className={className("Plus1 flex-1 bg-green-400 rounded", { "opacity-50": frightened })} onClick={() => setCommandActionModifiers(([d, os, op, ...rest]) => ([d, os, op + 1, ...rest]))} disabled={frightened}>+1<br />OP</button>
      </div>
      <div className="text-white font-bold flex justify-center">Situational Modifiers</div>
      <div className="SituationalModifiers mx-4 flex flex-col flex-1 gap-1 text-sm">
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("Disrupted w-1/5", MODIFIER_CLASSES, disrupted ? "bg-red-400" : "bg-white")} onClick={toggleDisrupted}>Disrupt<br />-ed</button>
          <button className={className("Frightened w-1/5", MODIFIER_CLASSES, frightened ? "bg-red-400" : "bg-white")} onClick={toggleFrightened}>Frighten<br />-ed</button>
          <button className={className("InTheYellow w-1/5", MODIFIER_CLASSES, inTheYellow ? "bg-red-400" : "bg-white")} onClick={toggleInTheYellow}>In the<br />Yellow</button>
          <button className={className("InTheRed w-1/5", MODIFIER_CLASSES, inTheRed ? "bg-red-400" : "bg-white")} onClick={toggleInTheRed}>In the<br />Red</button>
          <button className={className("AttackingToFlank w-1/5", MODIFIER_CLASSES, attackingToMyFlank ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToMyFlank}>Attack<br />my Flank</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("AttackingToRear", MODIFIER_CLASSES, attackingToMyRear ? "bg-red-400" : "bg-white")} onClick={toggleAttackingToMyRear}>Attack<br />my Rear</button>
          <button className={className("ChargingFourOrMoreDice", MODIFIER_CLASSES, chargingFourOrMoreDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingFourOrMoreDice}>Charge<br />4+ dice</button>
          <button className={className("ChargingThreeOrLessDice", MODIFIER_CLASSES, chargingThreeOrLessDice ? "bg-green-400" : "bg-white")} onClick={toggleChargingThreeOrLessDice}>Charge<br />3- dice</button>
          <button className={className("Flanking", MODIFIER_CLASSES, flanking ? "bg-green-400" : "bg-white")} onClick={toggleFlanking}>Flanking<br />Enemy</button>
          <button className={className("Pinching", MODIFIER_CLASSES, pinching ? "bg-green-400" : "bg-white")} onClick={togglePinching}>Pinching<br />Enemy</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("RearAttacking", MODIFIER_CLASSES, rearAttacking ? "bg-green-400" : "bg-white")} onClick={toggleRearAttacking}>Rear<br />Attack</button>
          <button className={className("CalvaryTarget", MODIFIER_CLASSES, calvaryTarget ? "bg-red-400" : "bg-white")} onClick={toggleCalvaryTarget}>Calvary<br />Target</button>
          <button className={className("ColossalTarget", MODIFIER_CLASSES, collosalTarget ? "bg-green-400" : "bg-white")} onClick={toggleColossalTarget}>Collosal<br />Target</button>
          <button className={className("LargeTarget", MODIFIER_CLASSES, largeTarget ? "bg-green-400" : "bg-white")} onClick={toggleLargeTarget}>Large<br />Target</button>
          <button className={className("ExtremeRange", MODIFIER_CLASSES, extremeRange ? "bg-red-400" : "bg-white")} onClick={toggleExtremeRange}>Extreme<br />Range<br />15+</button>
        </div>
        <div className="flex flex-1 gap-1 min-h-20">
          <button className={className("FastMovingTarget", MODIFIER_CLASSES, fastMovingTarget ? "bg-red-400" : "bg-white")} onClick={toggleFastMovingTarget}>Fast<br />Target</button>
          <button className={className("LongRange", MODIFIER_CLASSES, longRange ? "bg-green-400" : "bg-white")} onClick={toggleLongRange}>Long<br />Range<br />7-14</button>
          <button className={className("MoveAndShoot", MODIFIER_CLASSES, moveAndShoot ? "bg-red-400" : "bg-white")} onClick={toggleMoveAndShoot}>Move &<br />Shoot</button>
          <button className={className("NotClosestTarget", MODIFIER_CLASSES, notClosestTarget ? "bg-red-400" : "bg-white")} onClick={toggleNotClosestTarget}>Not<br />Closest</button>
          <button className={className("ClearAll bg-yellow-400", MODIFIER_CLASSES)} onClick={handleClearAll}>Clear<br />All</button>
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

export default App
