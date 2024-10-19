// import { GiInvertedDice3 } from "react-icons";

import { useMemo } from "react";
import { useState } from "react"
import { max, min } from "lodash";

const App = () => {
  const [offensiveSkill, setOffensiveSkill] = useState(5);
  const [offensivePower, setOffensivePower] = useState(5);
  const [defensiveSkill, setDefensiveSkill] = useState(2);
  const [defensivePower, setDefensivePower] = useState(2);
  
  // 6 is always a miss, 1 is always a hit
  const rollToHit = useMemo(() => {
    return max([min([offensiveSkill - defensiveSkill, 5]), 1]);
  }, [offensiveSkill, defensiveSkill]);
  
  const rollToWound = useMemo(() => {
    return max([min([offensivePower - defensivePower, 5]), 1]);
  }, [offensivePower, defensivePower]);

  const inc = (value) => (value + 1) % 10;

  const handleIncOffensiveSkill = () => {
    setOffensiveSkill(inc(offensiveSkill));
  };

  const handleIncOffensivePower = () => {
    setOffensivePower(inc(offensivePower));
  };

  const handleIncDefensiveSkill = () => {
    setDefensiveSkill(inc(defensiveSkill));
  };

  const handleIncDefensivePower = () => {
    setDefensivePower(inc(defensivePower));
  };


  return (
    <div className="BattleDeck flex flex-col h-screen">
      <div className="Roll flex flex-1 text-9xl">
        <div className="RollToHit flex-1 flex items-center justify-center">
          {rollToHit}
        </div>
        <div className="RollToWound flex-1 flex items-center justify-center">
          {rollToWound}
        </div>
      </div>
      <div className="Offense flex flex-1 text-9xl border-2">
        <div className="OffensiveSkill flex flex-1">
          <button className="OffensiveSkillRank flex-1 bg-rose-900 text-white" onClick={handleIncOffensiveSkill}>{offensiveSkill}</button>
        </div>
        <div className="OffensivePower flex flex-1">
          <button className="OffensivePowerRank flex-1 bg-rose-700 text-white" onClick={handleIncOffensivePower}>{offensivePower}</button>
        </div>
      </div>
      <div className="Defense flex flex-1 text-9xl">
        <div className="DefensiveSkill flex flex-1">
          <button className="DefensiveSkillRank flex-1 bg-blue-500 text-blue-50" onClick={handleIncDefensiveSkill}>{defensiveSkill}</button>
        </div>
        <div className="DefensivePower flex flex-1">
          <button className="DefensivePowerRank flex-1 bg-blue-300 text-blue-50" onClick={handleIncDefensivePower}>{defensivePower}</button>
        </div>
      </div>
      <div className="SituationalModifiers flex flex-1 flex-wrap">
        <button className="Disrupted w-1/5">Disrupted</button>
        <button className="Frightened w-1/5">Frightened</button>
        <button className="InTheYellow w-1/5">In Yellow</button>
        <button className="InTheRed w-1/5">In Red</button>
        <button className="AttackingToFlank w-1/5">Attack Flank</button>
        <button className="AttackingToRear w-1/5">Attack Rear</button>
        <button className="Charging4 w-1/5">Charge +4</button>
        <button className="Charging3 w-1/5">Charge 3-</button>
        <button className="Flanking w-1/5">Flank</button>
        <button className="Pinching w-1/5">Pinch</button>
        <button className="RearAttacking w-1/5">Rear Attack</button>
        <button className="CalvaryTarget w-1/5">Calvary</button>
        <button className="ColossalTarget w-1/5">Colossal</button>
        <button className="FastMovingTarget w-1/5">Fast Target</button>
        <button className="LargeTarget w-1/5">Large Target</button>
        <button className="ExtremeRange w-1/5">Ext Range</button>
        <button className="LongRange w-1/5">Long Range</button>
        <button className="MoveAndShoot w-1/5">Move & Shoot</button>
        <button className="NotClosestTarget w-1/5">Not Closest</button>
      </div>
      <div className="CommandActionModifiers flex h-20">
        <button className="Plus1 w-1/3">-1</button>
        <button className="Plus1 w-1/3">Clear All</button>
        <button className="Plus1 w-1/3">+1</button>
      </div>
    </div>
  )
}

export default App
