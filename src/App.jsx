// import { GiInvertedDice3 } from "react-icons";

const App = () => {

  return (
    <div className="BattleDeck flex flex-col h-screen">
      <div className="Roll flex flex-1 text-9xl">
        <div className="RollToHit flex-1 flex items-center justify-center">
          3
        </div>
        <div className="RollToWound flex-1 flex items-center justify-center">
          2
        </div>
      </div>
      <div className="Offense flex flex-1 text-9xl border-2">
        <div className="OffensiveSkill flex flex-1">
          <button className="OffensiveSkillRank flex-1 bg-rose-900 text-white">3</button>
        </div>
        <div className="OffensivePower flex flex-1">
          <button className="OffensivePowerRank flex-1 bg-rose-700 text-white">3</button>
        </div>
      </div>
      <div className="Defense flex flex-1 text-9xl">
        <div className="DefensiveSkill flex flex-1">
          <button className="DefensiveSkillRank flex-1 bg-blue-500 text-blue-50">4</button>
        </div>
        <div className="DefensivePower flex flex-1">
          <button className="DefensivePowerRank flex-1 bg-blue-300 text-blue-50">1</button>
        </div>
      </div>
      <div className="SituationalModifiers flex flex-1 flex-wrap">
        <button className="Disrupted w-1/5">Disrupted</button>
        <button className="Frightened w-1/5">Frightened</button>
        <button className="InTheYellow w-1/5">In the Yellow</button>
        <button className="InTheRed w-1/5">In the Red</button>
        <button className="AttackingToFlank w-1/5">Attacking to Flank</button>
        <button className="AttackingToRear w-1/5">Attacking to Rear</button>
        <button className="Charging4 w-1/5">Charging +4</button>
        <button className="Charging3 w-1/5">Charging 3-</button>
        <button className="Flanking w-1/5">Flanking</button>
        <button className="Pinching w-1/5">Pinching</button>
        <button className="RearAttacking w-1/5">Rear Attacking</button>
        <button className="CalvaryTarget w-1/5">Calvary Target</button>
        <button className="ColossalTarget w-1/5">Colossal Target</button>
        <button className="ExtremeRange w-1/5">Extreme Range</button>
        <button className="FastMovingTarget w-1/5">Fast Moving Target</button>
        <button className="LargeTarget w-1/5">Large Target</button>
        <button className="LongRange w-1/5">Long Range</button>
        <button className="MoveAndShoot w-1/5">Move & Shoot</button>
        <button className="NotClosestTarget w-1/5">Not Closest Target</button>
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
