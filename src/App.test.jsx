import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, within } from "@testing-library/react";
import { find } from "lodash";
import App from "./App";
import { UNITS } from "./data";
import { loadArmy, saveArmy } from "./persistence";

// Buttons built on usePressable (ranks, dice, reset) tap on pointer up;
// plain buttons (modifiers, command cards) use click.
const tap = (el) => fireEvent.pointerUp(el);

const setup = () => {
  const utils = render(<App />);
  const { container } = utils;
  const dice = () => container.querySelector(".Dice");
  const hit = () => container.querySelector(".RollToHit");
  const wound = () => container.querySelector(".RollToWound");
  const modifier = (id) => container.querySelector(`button.${id}`);
  return { ...utils, dice, hit, wound, modifier };
};

describe("App", () => {
  it("starts at 4 dice, hit 1, wound 1", () => {
    const { dice, hit, wound } = setup();
    expect(within(dice()).getByText("4")).toBeInTheDocument();
    expect(within(dice()).getByText("4 base")).toBeInTheDocument();
    expect(within(hit()).getByText("1")).toBeInTheDocument();
    expect(within(wound()).getByText("1")).toBeInTheDocument();
  });

  it("dice +/- buttons adjust the pool and clamp at 0", () => {
    const { getByLabelText, dice } = setup();
    tap(getByLabelText(/Add one die/));
    expect(within(dice()).getByText("5")).toBeInTheDocument();
    const minus = getByLabelText(/Remove one die/);
    for (let i = 0; i < 7; i += 1) tap(minus);
    expect(within(dice()).getByText("0")).toBeInTheDocument();
  });

  it("rank taps raise the rank and wrap 9 -> 0", () => {
    const { container, hit } = setup();
    const os = container.querySelector(".OffensiveSkillRank");
    for (let i = 0; i < 3; i += 1) tap(os);
    expect(within(os).getByText("3")).toBeInTheDocument();
    // the big stat number, as opposed to the rank buttons below it
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("3");
    for (let i = 0; i < 7; i += 1) tap(os);
    expect(within(os).getByText("0")).toBeInTheDocument();
  });

  it("arrow keys raise and lower ranks (with wrap)", () => {
    const { container } = setup();
    const os = container.querySelector(".OffensiveSkillRank");
    fireEvent.keyDown(os, { key: "ArrowDown" });
    expect(within(os).getByText("9")).toBeInTheDocument();
    fireEvent.keyDown(os, { key: "ArrowUp" });
    expect(within(os).getByText("0")).toBeInTheDocument();
  });

  it("toggling a modifier updates totals and the breakdown", () => {
    const { dice, modifier } = setup();
    fireEvent.click(modifier("disrupted"));
    expect(within(dice()).getByText("3")).toBeInTheDocument();
    expect(within(dice()).getByText("-1 DI")).toBeInTheDocument();
    fireEvent.click(modifier("disrupted"));
    expect(within(dice()).getByText("4")).toBeInTheDocument();
  });

  it("overkill shows when the unclamped total passes 5", () => {
    const { container, hit } = setup();
    const os = container.querySelector(".OffensiveSkillRank");
    for (let i = 0; i < 7; i += 1) tap(os); // OS 7, DS 0
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("5");
    expect(within(hit()).getByText(/OK: 2/)).toBeInTheDocument();
  });

  it("mutual exclusion disables both directions", () => {
    const { modifier } = setup();
    fireEvent.click(modifier("inTheYellow"));
    expect(modifier("inTheRed")).toBeDisabled();
    fireEvent.click(modifier("inTheYellow"));
    expect(modifier("inTheRed")).toBeEnabled();
    fireEvent.click(modifier("inTheRed"));
    expect(modifier("inTheYellow")).toBeDisabled();
  });

  it("pinching stacks 0 -> 1 -> 2 -> 3 -> 0", () => {
    const { hit, modifier } = setup();
    fireEvent.click(modifier("pinching"));
    expect(within(hit()).getByText("1 PI")).toBeInTheDocument();
    fireEvent.click(modifier("pinching"));
    expect(within(hit()).getByText("2 PI")).toBeInTheDocument();
    expect(modifier("pinching")).toHaveTextContent("×2");
    fireEvent.click(modifier("pinching"));
    fireEvent.click(modifier("pinching"));
    expect(within(hit()).queryByText(/PI/)).not.toBeInTheDocument();
  });

  it("opposing command cards stay visible even when they cancel out", () => {
    const { container, hit } = setup();
    fireEvent.click(container.querySelector(".PlusOneOS"));
    fireEvent.click(container.querySelector(".MinusOneOS"));
    // net effect is zero, but both plays are on record
    const chips = container.querySelectorAll(".PlayedCard");
    expect(chips).toHaveLength(2);
    expect(chips[0]).toHaveTextContent("+1 OS");
    expect(chips[1]).toHaveTextContent("-1 OS");
    expect(within(hit()).getByText("1 CC")).toBeInTheDocument();
    expect(within(hit()).getByText("-1 CC")).toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("1");
  });

  it("card-play buttons sit inside the column of the number they change", () => {
    const { dice, hit, wound } = setup();
    expect(dice().querySelector(".PlusOneDice")).toBeInTheDocument();
    expect(dice().querySelector(".MinusOneDice")).toBeInTheDocument();
    expect(hit().querySelector(".PlusOneOS")).toBeInTheDocument();
    expect(wound().querySelector(".MinusOneOP")).toBeInTheDocument();
  });

  it("tapping a played-card chip removes that single play", () => {
    const { container, dice } = setup();
    fireEvent.click(container.querySelector(".PlusOneDice"));
    fireEvent.click(container.querySelector(".PlusOneDice"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("6");
    fireEvent.click(container.querySelector(".PlayedCard"));
    expect(container.querySelectorAll(".PlayedCard")).toHaveLength(1);
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("5");
  });

  it("command card reset clears the played-card log", () => {
    const { container } = setup();
    fireEvent.click(container.querySelector(".PlusOneOP"));
    const reset = container.querySelector(".ClearCommandCardModifiers");
    tap(reset);
    tap(reset);
    expect(container.querySelectorAll(".PlayedCard")).toHaveLength(0);
  });

  it("played cards persist across remounts", () => {
    const first = setup();
    fireEvent.click(first.container.querySelector(".PlusOneOS"));
    fireEvent.click(first.container.querySelector(".MinusOneOS"));
    first.unmount();
    const second = setup();
    expect(second.container.querySelectorAll(".PlayedCard")).toHaveLength(2);
  });

  it("command cards adjust totals and Frightened clears and disables them", () => {
    const { container, dice, modifier } = setup();
    fireEvent.click(container.querySelector(".PlusOneDice"));
    expect(within(dice()).getByText("5")).toBeInTheDocument();
    expect(within(dice()).getByText("1 CC")).toBeInTheDocument();
    fireEvent.click(modifier("frightened"));
    expect(within(dice()).queryByText("1 CC")).not.toBeInTheDocument();
    expect(container.querySelectorAll(".PlayedCard")).toHaveLength(0);
    expect(container.querySelector(".PlusOneDice")).toBeDisabled();
    // the chips row (and its Reset) only renders while plays are logged
    expect(container.querySelector(".ClearCommandCardModifiers")).toBeNull();
  });

  it("reset arms on the first tap and resets on the second", () => {
    const { dice, modifier } = setup();
    fireEvent.click(modifier("disrupted"));
    fireEvent.click(modifier("pinching"));
    const reset = modifier("reset");
    tap(reset);
    expect(reset).toHaveTextContent(/Tap\s*again/);
    tap(reset);
    expect(within(dice()).getByText("4")).toBeInTheDocument();
    expect(within(dice()).queryByText("-1 DI")).not.toBeInTheDocument();
    expect(modifier("disrupted")).not.toHaveClass("plate-on-blood");
    expect(modifier("pinching")).not.toHaveTextContent("×");
  });

  it("reset also fires on hold, and restores pinch count", () => {
    vi.useFakeTimers();
    try {
      const { hit, modifier } = setup();
      fireEvent.click(modifier("pinching"));
      fireEvent.click(modifier("pinching"));
      expect(within(hit()).getByText("2 PI")).toBeInTheDocument();
      const reset = modifier("reset");
      fireEvent.pointerDown(reset);
      act(() => {
        vi.advanceTimersByTime(450);
      });
      fireEvent.pointerUp(reset);
      expect(within(hit()).queryByText(/PI/)).not.toBeInTheDocument();
      // a fresh pinch tap starts back at ×1
      fireEvent.click(modifier("pinching"));
      expect(within(hit()).getByText("1 PI")).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it("shows melee + general modifiers by default, ranged set after switching", () => {
    const { getByText, modifier } = setup();
    expect(modifier("flanking")).toBeInTheDocument();
    expect(modifier("disrupted")).toBeInTheDocument();
    expect(modifier("longRange")).not.toBeInTheDocument();
    fireEvent.click(getByText("Ranged"));
    expect(modifier("longRange")).toBeInTheDocument();
    expect(modifier("softCover")).toBeInTheDocument();
    expect(modifier("flanking")).not.toBeInTheDocument();
    expect(modifier("disrupted")).toBeInTheDocument(); // general stays
    expect(modifier("reset")).toBeInTheDocument();
  });

  it("switching stance turns the other stance's modifiers off", () => {
    const { getByText, hit, modifier } = setup();
    fireEvent.click(modifier("flanking"));
    expect(within(hit()).getByText("1 FL")).toBeInTheDocument();
    fireEvent.click(getByText("Ranged"));
    expect(within(hit()).queryByText("1 FL")).not.toBeInTheDocument();
    fireEvent.click(getByText("Melee"));
    expect(modifier("flanking")).not.toHaveClass("plate-on-ember");
    // pinch count is cleared too, not just the on flag
    fireEvent.click(modifier("pinching"));
    fireEvent.click(modifier("pinching"));
    fireEvent.click(getByText("Ranged"));
    fireEvent.click(getByText("Melee"));
    expect(modifier("pinching")).not.toHaveTextContent("×");
  });

  it("persists the attack mode across remounts", () => {
    const first = setup();
    fireEvent.click(first.getByText("Ranged"));
    first.unmount();
    const second = setup();
    expect(second.modifier("longRange")).toBeInTheDocument();
    expect(second.getByText("Ranged").closest("button")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("restores mid-game state after an unmount and remount (reload)", () => {
    const first = setup();
    tap(first.getByLabelText(/Add one die/));
    fireEvent.click(first.modifier("disrupted"));
    fireEvent.click(first.modifier("pinching"));
    fireEvent.click(first.modifier("pinching"));
    first.unmount();

    const second = setup();
    expect(second.dice().querySelector(".text-6xl")).toHaveTextContent("4"); // 5 base -1 DI
    expect(within(second.dice()).getByText("5 base")).toBeInTheDocument();
    expect(within(second.dice()).getByText("-1 DI")).toBeInTheDocument();
    expect(second.modifier("pinching")).toHaveTextContent("×2");
  });

  it("a single stray tap on reset does not reset", () => {
    const { dice, modifier } = setup();
    fireEvent.click(modifier("disrupted"));
    tap(modifier("reset"));
    expect(within(dice()).getByText("-1 DI")).toBeInTheDocument();
  });
});

describe("Units", () => {
  // The battle screen can already show the unit's name in a slot, so scope
  // the row tap to the picker overlay
  const pickUnit = (utils, role, unitName = "Communal Pikemen") => {
    // the slot's label changes once a unit is selected, so target the slot
    fireEvent.click(
      utils.container.querySelector(`.UnitSlot.${role} button`)
    );
    const overlay = () => utils.container.querySelector(".UnitPicker");
    // the picker opens on its faction list, and remembers the last faction
    // it was left in — so step back to the list, then into this unit's own
    const unit = find(UNITS, { name: unitName.replace(/ #\d+$/, "") });
    if (!overlay().querySelector(".FactionRow")) {
      fireEvent.click(within(overlay()).getByLabelText("Back to factions"));
    }
    fireEvent.click(within(overlay()).getByText(unit.factionName));
    fireEvent.click(within(overlay()).getByText(unitName));
  };

  const pickAttacker = (utils) => pickUnit(utils, "attacker");
  const pickDefender = (utils) => pickUnit(utils, "defender");

  it("picking an attacker prefills dice, OS, and OP from its card", () => {
    const utils = setup();
    pickAttacker(utils);
    const { container, dice, hit, wound } = utils;
    expect(within(dice()).getByText("7 base")).toBeInTheDocument();
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("7");
    expect(
      within(container.querySelector(".OffensiveSkillRank")).getByText("6")
    ).toBeInTheDocument();
    // OS 6 vs DS 0 is an unclamped 6: shows 5 with one point of Overkill
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("5");
    expect(within(hit()).getByText(/OK: 1/)).toBeInTheDocument();
    expect(wound().querySelector(".text-6xl")).toHaveTextContent("5"); // OP 5
  });

  it("picking a defender prefills DS and Toughness", () => {
    const utils = setup();
    pickAttacker(utils);
    pickDefender(utils);
    const { container, hit, wound } = utils;
    expect(
      within(container.querySelector(".DefensiveSkillRank")).getByText("2")
    ).toBeInTheDocument();
    // OS 6 - DS 2 = 4 to hit; OP 5 - T 2 = 3 to wound — the rank buttons
    // under each number are the visible equation behind it
    expect(
      within(container.querySelector(".OffensiveSkillRank")).getByText("6")
    ).toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("4");
    expect(
      within(container.querySelector(".DefensivePowerRank")).getByText("2")
    ).toBeInTheDocument();
    expect(wound().querySelector(".text-6xl")).toHaveTextContent("3");
  });

  it("applies the Knights' Cavalry bonus while Charging, with a breakdown line", () => {
    const utils = setup();
    pickUnit(utils, "attacker", "Knights");
    pickDefender(utils);
    const { dice, wound, modifier } = utils;
    fireEvent.click(modifier("chargingFourOrMoreDice"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("8"); // 6 +2 CH
    expect(within(wound()).getByText("1 CAV")).toBeInTheDocument();
    expect(wound().querySelector(".text-6xl")).toHaveTextContent("5"); // 6-2 +1 CAV
    fireEvent.click(modifier("chargingFourOrMoreDice"));
    expect(within(wound()).queryByText("1 CAV")).not.toBeInTheDocument();
  });

  it("applies Spears automatically: +1 OS vs a Cavalry defender, -1 die charging", () => {
    const utils = setup();
    pickAttacker(utils); // Communal Pikemen
    pickUnit(utils, "defender", "Lancers");
    const { dice, hit, modifier } = utils;
    // OS 6 - DS 2 + 1 SP (Lancers are Cavalry) = 5
    expect(within(hit()).getByText("1 SP")).toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("5");
    // charging: 7 base +2 CH -1 SP = 8 dice
    fireEvent.click(modifier("chargingFourOrMoreDice"));
    expect(within(dice()).getByText("-1 SP")).toBeInTheDocument();
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("8");
  });

  it("Foe Damaged drives Blood Frenzy without adding dice on its own", () => {
    const utils = setup();
    const { dice, modifier, getByText } = utils;
    // on its own the toggle is inert — it is a state flag, not a modifier
    fireEvent.click(modifier("targetDamaged"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("4");
    // a Lizardmen attacker turns it into a die, with its own breakdown line
    pickUnit(utils, "attacker", "Trog Warriors");
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("6"); // 5 +1 BF
    expect(within(dice()).getByText("1 BF")).toBeInTheDocument();
    fireEvent.click(modifier("targetDamaged"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("5");
    // and it is melee-only: switching stance drops it
    fireEvent.click(modifier("targetDamaged"));
    fireEvent.click(getByText("Ranged"));
    expect(within(dice()).queryByText("1 BF")).not.toBeInTheDocument();
    fireEvent.click(getByText("Melee"));
    expect(modifier("targetDamaged")).not.toHaveClass("plate-on-ember");
  });

  it("applies the archers' Engaged penalty in melee but not at range", () => {
    const utils = setup();
    pickUnit(utils, "attacker", "Bowmen");
    const { hit, wound, getByText } = utils;
    // melee: OS 5 - 2 ENG = 3, OP 5 - 2 ENG = 3
    expect(within(hit()).getByText("-2 ENG")).toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("3");
    expect(wound().querySelector(".text-6xl")).toHaveTextContent("3");
    fireEvent.click(getByText("Ranged"));
    expect(within(hit()).queryByText("-2 ENG")).not.toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("5"); // OS 5 vs DS 0
  });

  it("selecting a melee-only attacker while ranged switches back to melee", () => {
    const utils = setup();
    fireEvent.click(utils.getByText("Ranged"));
    pickAttacker(utils);
    expect(utils.getByText("Melee").closest("button")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(utils.modifier("flanking")).toBeInTheDocument();
  });

  it("clearing a slot keeps the prefilled numbers", () => {
    const utils = setup();
    pickAttacker(utils);
    fireEvent.click(utils.getByLabelText("Clear attacker unit"));
    expect(utils.getByLabelText("Pick attacker unit")).toBeInTheDocument();
    expect(within(utils.dice()).getByText("7 base")).toBeInTheDocument();
  });

  it("the picker narrows to army units, with a toggle for the rest", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 2, "menOfHawkshold/lancers": 1 },
    });
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    // the faction list counts only what the filter leaves visible
    expect(within(overlay).getByText("3 yours")).toBeInTheDocument();
    fireEvent.click(within(overlay).getByText("Men of Hawkshold"));
    // multiple copies list one row each, with their own damage state
    expect(within(overlay).getByText("Swordsmen #1")).toBeInTheDocument();
    expect(within(overlay).getByText("Swordsmen #2")).toBeInTheDocument();
    expect(within(overlay).getByText("Lancers")).toBeInTheDocument();
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();
    // the toggle covers units outside both rosters
    fireEvent.click(within(overlay).getByText("Show all units"));
    expect(within(overlay).getByText("Militia")).toBeInTheDocument();
    fireEvent.click(within(overlay).getByText("Show only the armies"));
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();
  });

  it("with no army built the picker shows every unit and no toggle", () => {
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    fireEvent.click(within(overlay).getByText("Men of Hawkshold"));
    expect(within(overlay).getByText("Militia")).toBeInTheDocument();
    expect(
      within(overlay).queryByText("Show all units")
    ).not.toBeInTheDocument();
  });

  it("the picker drills from factions into one faction and back", () => {
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    // the list shows factions, not units
    expect(within(overlay).getByText("Orc Army")).toBeInTheDocument();
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();

    fireEvent.click(within(overlay).getByText("Men of Hawkshold"));
    expect(within(overlay).getByText("Militia")).toBeInTheDocument();
    // and only that faction's units
    expect(within(overlay).queryByText("Orc Axemen")).not.toBeInTheDocument();

    fireEvent.click(within(overlay).getByLabelText("Back to factions"));
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();
    expect(within(overlay).getByText("Orc Army")).toBeInTheDocument();
    // from the list, back leaves the picker altogether
    fireEvent.click(within(overlay).getByLabelText("Back to BattleDeck"));
    expect(utils.container.querySelector(".UnitPicker")).toBeNull();
  });

  it("each slot remembers its own faction, and both survive a reload", () => {
    const first = setup();
    const overlay = () => first.container.querySelector(".UnitPicker");
    const open = (role) =>
      fireEvent.click(first.getByLabelText(`Pick ${role} unit`));
    const shut = () =>
      fireEvent.click(within(overlay()).getByLabelText("Close unit picker"));

    open("attacker");
    fireEvent.click(within(overlay()).getByText("Lizardmen"));
    shut();

    // the defender keeps its own place: still on the faction list, since
    // the enemy is usually from a different faction than your own army
    open("defender");
    expect(within(overlay()).queryByText("Trog Warriors")).not.toBeInTheDocument();
    expect(within(overlay()).getByText("Orc Army")).toBeInTheDocument();
    fireEvent.click(within(overlay()).getByText("Orc Army"));
    expect(within(overlay()).getByText("Orc Axemen")).toBeInTheDocument();
    shut();

    // and the attacker is still where it was left
    open("attacker");
    expect(within(overlay()).getByText("Trog Warriors")).toBeInTheDocument();
    shut();
    first.unmount();

    const second = setup();
    const reopened = () => second.container.querySelector(".UnitPicker");
    fireEvent.click(second.getByLabelText("Pick attacker unit"));
    expect(within(reopened()).getByText("Trog Warriors")).toBeInTheDocument();
    fireEvent.click(within(reopened()).getByLabelText("Close unit picker"));
    fireEvent.click(second.getByLabelText("Pick defender unit"));
    expect(within(reopened()).getByText("Orc Axemen")).toBeInTheDocument();
  });

  it("an army copy's damage prefills In the Yellow / In the Red", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 2 },
      marks: { "menOfHawkshold/swordsmen": [5, 7] }, // 5/2/3 track
    });
    const utils = setup();
    pickUnit(utils, "attacker", "Swordsmen #1"); // 5 marked: yellow
    expect(utils.modifier("inTheYellow")).toHaveClass("plate-on-blood");
    expect(within(utils.dice()).getByText("-1 IY")).toBeInTheDocument();
    pickUnit(utils, "attacker", "Swordsmen #2"); // 7 marked: red
    expect(utils.modifier("inTheYellow")).not.toHaveClass("plate-on-blood");
    expect(utils.modifier("inTheRed")).toHaveClass("plate-on-blood");
    expect(within(utils.dice()).getByText("-2 IR")).toBeInTheDocument();
    // the slot shows the copy and its damage state
    expect(
      utils.getByLabelText(/attacker: Swordsmen/)
    ).toHaveTextContent("7/10 dmg · In the Red");
  });

  it("marking damage in the army builder updates the selected attacker", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 1 },
      marks: { "menOfHawkshold/swordsmen": [0] },
    });
    const utils = setup();
    pickUnit(utils, "attacker", "Swordsmen");
    expect(utils.modifier("inTheYellow")).not.toHaveClass("plate-on-blood");
    fireEvent.click(utils.getByLabelText("Build your army"));
    // the builder opens on its faction list too; scope inside it, since
    // the battle screen now shows the same copy's damage row behind it
    const builder = () => utils.container.querySelector(".ArmyBuilder");
    fireEvent.click(within(builder()).getByText("Men of Hawkshold"));
    fireEvent.click(within(builder()).getByLabelText("Swordsmen damage box 5"));
    fireEvent.click(utils.getByLabelText("Close army builder"));
    expect(utils.modifier("inTheYellow")).toHaveClass("plate-on-blood");
    expect(
      utils.getByLabelText(/attacker: Swordsmen/)
    ).toHaveTextContent("5/10 dmg · In the Yellow");
  });

  it("damage marked on the battle screen persists and prefills modifiers", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 1 },
      marks: { "menOfHawkshold/swordsmen": [0] },
    });
    const utils = setup();
    pickUnit(utils, "attacker", "Swordsmen");
    const units = () => utils.container.querySelector(".Units");
    // the selected copy's track sits under its slot
    fireEvent.click(within(units()).getByLabelText("Swordsmen damage box 5"));
    expect(utils.modifier("inTheYellow")).toHaveClass("plate-on-blood");
    expect(utils.getByLabelText(/attacker: Swordsmen/)).toHaveTextContent(
      "5/10 dmg · In the Yellow"
    );
    // healing back off the boundary releases the prefill
    fireEvent.click(within(units()).getByLabelText("Swordsmen damage box 5"));
    expect(utils.modifier("inTheYellow")).not.toHaveClass("plate-on-blood");
    // and the roster saw every tap
    expect(loadArmy().marks["menOfHawkshold/swordsmen"]).toEqual([4]);
  });

  it("Reanimating from the battle screen heals and shares the turn lock", () => {
    saveArmy({
      budget: 2000,
      counts: { "undeadArmy/zombies": 1 },
      marks: { "undeadArmy/zombies": [2] },
    });
    const utils = setup();
    pickUnit(utils, "defender", "Zombies");
    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText(/Reanimate Zombies/));
    expect(loadArmy().marks["undeadArmy/zombies"]).toEqual([1]);
    expect(
      within(units()).getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
    // the builder sees the same lock — one Reanimate per unit per turn
    fireEvent.click(utils.getByLabelText("Build your army"));
    const builder = () => utils.container.querySelector(".ArmyBuilder");
    fireEvent.click(within(builder()).getByText("Undead Army"));
    expect(
      within(builder()).getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
  });

  it("the battle screen's box button cycles the army-ability mark", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 1 },
    });
    const utils = setup();
    pickUnit(utils, "attacker", "Swordsmen");
    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText(/Mark Bravery on Swordsmen/));
    expect(
      within(units()).getByLabelText("Erase Bravery on Swordsmen")
    ).toHaveTextContent("1/1");
    expect(loadArmy().boxes["menOfHawkshold/swordsmen"]).toEqual([1]);
  });

  it("units picked outside the army get no battle-screen damage row", () => {
    const utils = setup();
    pickAttacker(utils); // no army built, so no copy selected
    expect(
      utils.container.querySelector(".Units .DamageRow")
    ).toBeNull();
  });

  it("enemy roster units are pickable without Show all and edit their own record", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 1 },
    });
    saveArmy(
      {
        budget: 2000,
        counts: { "orcArmy/trolls": 1 },
        marks: { "orcArmy/trolls": [0] },
      },
      "enemy"
    );
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick defender unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    // the enemy's faction is on the filtered list, no Show all needed
    expect(within(overlay).getByText("1 enemy")).toBeInTheDocument();
    fireEvent.click(within(overlay).getByText("Orc Army"));
    fireEvent.click(within(overlay).getByText("Trolls"));

    // the slot marks the copy as the enemy's, and its track is editable
    expect(
      utils.getByLabelText("defender: Trolls (enemy). Tap to change.")
    ).toBeInTheDocument();
    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText("Trolls damage box 3"));
    expect(loadArmy("enemy").marks["orcArmy/trolls"]).toEqual([3]);
    // the player's own roster never heard about it
    expect(loadArmy().marks["orcArmy/trolls"]).toBeUndefined();
  });

  it("a mirror match keeps the two rosters' copies apart", () => {
    saveArmy({
      budget: 2000,
      counts: { "orcArmy/orcAxemen": 1 },
      marks: { "orcArmy/orcAxemen": [0] },
    });
    saveArmy(
      {
        budget: 2000,
        counts: { "orcArmy/orcAxemen": 1 },
        marks: { "orcArmy/orcAxemen": [0] },
      },
      "enemy"
    );
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick defender unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    fireEvent.click(within(overlay).getByText("Orc Army"));
    // both copies list — the enemy's row is the tagged one
    const rows = within(overlay).getAllByRole("button", {
      name: /Orc Axemen/,
    });
    expect(rows).toHaveLength(2);
    fireEvent.click(within(overlay).getByLabelText("enemy copy").closest("button"));

    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText("Orc Axemen damage box 2"));
    expect(loadArmy("enemy").marks["orcArmy/orcAxemen"]).toEqual([2]);
    expect(loadArmy().marks["orcArmy/orcAxemen"]).toEqual([0]);
  });

  it("an enemy attacker's damage still prefills In the Yellow", () => {
    saveArmy(
      {
        budget: 2000,
        counts: { "menOfHawkshold/swordsmen": 1 },
        marks: { "menOfHawkshold/swordsmen": [5] }, // 5/2/3: In the Yellow
      },
      "enemy"
    );
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    fireEvent.click(within(overlay).getByText("Men of Hawkshold"));
    fireEvent.click(within(overlay).getByText("Swordsmen"));
    expect(utils.modifier("inTheYellow")).toHaveClass("plate-on-blood");
  });

  it("a damaged defender copy prefills Foe Damaged, live with its track", () => {
    saveArmy({
      budget: 2000,
      counts: { "menOfHawkshold/swordsmen": 2 },
      marks: { "menOfHawkshold/swordsmen": [3, 0] },
    });
    const utils = setup();
    pickUnit(utils, "defender", "Swordsmen #1"); // wounded: FD lights
    expect(utils.modifier("targetDamaged")).toHaveClass("plate-on-ember");
    pickUnit(utils, "defender", "Swordsmen #2"); // untouched: FD clears
    expect(utils.modifier("targetDamaged")).not.toHaveClass("plate-on-ember");
    // wounding the copy from its battle-screen row flips it on the spot...
    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText("Swordsmen #2 damage box 1"));
    expect(utils.modifier("targetDamaged")).toHaveClass("plate-on-ember");
    // ...and healing back to untouched releases it
    fireEvent.click(within(units()).getByLabelText("Swordsmen #2 damage box 1"));
    expect(utils.modifier("targetDamaged")).not.toHaveClass("plate-on-ember");
  });

  it("a defender picked without a copy leaves Foe Damaged alone", () => {
    const utils = setup();
    fireEvent.click(utils.modifier("targetDamaged"));
    pickDefender(utils); // no armies, so no copy — nothing is known
    expect(utils.modifier("targetDamaged")).toHaveClass("plate-on-ember");
  });

  it("wounding the defender in the builder feeds Blood Frenzy on close", () => {
    saveArmy({
      budget: 2000,
      counts: { "lizardmen/trogWarriors": 1 },
      marks: { "lizardmen/trogWarriors": [0] },
    });
    saveArmy(
      {
        budget: 2000,
        counts: { "orcArmy/trolls": 1 },
        marks: { "orcArmy/trolls": [0] },
      },
      "enemy"
    );
    const utils = setup();
    pickUnit(utils, "attacker", "Trog Warriors");
    pickUnit(utils, "defender", "Trolls");
    expect(utils.modifier("targetDamaged")).not.toHaveClass("plate-on-ember");
    // wound the Trolls on the enemy roster; closing hands the news over
    fireEvent.click(utils.getByLabelText("Build your army"));
    const builder = () => utils.container.querySelector(".ArmyBuilder");
    fireEvent.click(within(builder()).getByText("Enemy army"));
    fireEvent.click(within(builder()).getByText("Orc Army"));
    fireEvent.click(within(builder()).getByLabelText("Trolls damage box 2"));
    fireEvent.click(utils.getByLabelText("Close army builder"));
    expect(utils.modifier("targetDamaged")).toHaveClass("plate-on-ember");
    // and the Trogs' Blood Frenzy turns the wound into a die
    expect(within(utils.dice()).getByText("1 BF")).toBeInTheDocument();
  });

  it("a marked Uruz box feeds the dice pool in melee only", () => {
    saveArmy({
      budget: 2000,
      counts: { "dwarvesOfRunegard/dwarvenAxemen": 1 },
      boxes: { "dwarvesOfRunegard/dwarvenAxemen": [1] },
    });
    const utils = setup();
    pickUnit(utils, "attacker", "Dwarven Axemen"); // (5) 5/5 melee
    // 5 base + 1 URUZ
    expect(utils.dice().querySelector(".text-6xl")).toHaveTextContent("6");
    expect(within(utils.dice()).getByText("1 URUZ")).toBeInTheDocument();

    // erasing the mark from the battle-screen row drops it live
    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText(/Erase Rune of Uruz/));
    expect(utils.dice().querySelector(".text-6xl")).toHaveTextContent("5");
    expect(within(utils.dice()).queryByText("1 URUZ")).not.toBeInTheDocument();
  });

  it("Lashing from the battle screen adds its die until the turn ends", () => {
    saveArmy(
      {
        budget: 2000,
        counts: { "orcArmy/orcMarauders": 1 },
      },
      "enemy"
    );
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    fireEvent.click(within(overlay).getByText("Orc Army"));
    fireEvent.click(within(overlay).getByText("Orc Marauders"));
    // (7) 6/5 melee prefill
    expect(utils.dice().querySelector(".text-6xl")).toHaveTextContent("7");

    const units = () => utils.container.querySelector(".Units");
    fireEvent.click(within(units()).getByLabelText(/Lash Orc Marauders/));
    expect(utils.dice().querySelector(".text-6xl")).toHaveTextContent("8");
    expect(within(utils.dice()).getByText("1 LASH")).toBeInTheDocument();
    // and it landed on the enemy record, where this copy lives
    expect(loadArmy("enemy").lashed["orcArmy/orcMarauders"]).toEqual([true]);

    // New turn (in the builder) releases it
    fireEvent.click(utils.getByLabelText("Build your army"));
    const builder = () => utils.container.querySelector(".ArmyBuilder");
    fireEvent.click(within(builder()).getByText("Enemy army"));
    fireEvent.click(within(builder()).getByText("New turn"));
    fireEvent.click(utils.getByLabelText("Close army builder"));
    expect(utils.dice().querySelector(".text-6xl")).toHaveTextContent("7");
    expect(within(utils.dice()).queryByText("1 LASH")).not.toBeInTheDocument();
  });

  it("the header army button opens the army builder", () => {
    const { getByLabelText, container } = setup();
    fireEvent.click(getByLabelText("Build your army"));
    expect(container.querySelector(".ArmyBuilder")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Close army builder"));
    expect(container.querySelector(".ArmyBuilder")).not.toBeInTheDocument();
  });

  it("a locked-dice special attack pins the pool and blocks Command Cards", () => {
    const utils = setup();
    pickUnit(utils, "attacker", "Ancient Blue Dragon");
    pickUnit(utils, "defender", "Communal Pikemen");
    const { container, dice, hit, getByText, getByLabelText, modifier } = utils;
    // melee first: cards playable, dice adjustable
    fireEvent.click(container.querySelector(".PlusOneDice"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("7"); // 6 +1 CC
    // lightning breath: (3) 7/7, dice locked, Command Cards void
    fireEvent.click(getByText("Ranged"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("3");
    expect(within(dice()).getByText("locked")).toBeInTheDocument();
    expect(container.querySelectorAll(".PlayedCard")).toHaveLength(0); // cleared
    expect(container.querySelector(".PlusOneDice")).toBeDisabled();
    expect(getByLabelText(/Add one die/)).toBeDisabled();
    // modifiers still hit OS but never the pool
    fireEvent.click(modifier("disrupted"));
    expect(dice().querySelector(".text-6xl")).toHaveTextContent("3");
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("4"); // 7-2 -1 DI
    // back in melee everything unlocks
    fireEvent.click(getByText("Melee"));
    expect(container.querySelector(".PlusOneDice")).toBeEnabled();
    expect(getByLabelText(/Add one die/)).toBeEnabled();
  });

  it("tracks special-attack ammo with tap-down pips", () => {
    const first = setup();
    pickUnit(first, "attacker", "Ancient Blue Dragon");
    expect(first.container.querySelector(".AmmoRow")).not.toBeInTheDocument();
    fireEvent.click(first.getByText("Ranged"));
    expect(first.getByText("3 left")).toBeInTheDocument();
    fireEvent.click(first.getByLabelText("Ancient Blue Dragon shot 2"));
    expect(first.getByText("1 left")).toBeInTheDocument();
    // tapping the last spent pip recovers it
    fireEvent.click(first.getByLabelText("Ancient Blue Dragon shot 2"));
    expect(first.getByText("2 left")).toBeInTheDocument();
    first.unmount();
    const second = setup();
    expect(second.getByText("2 left")).toBeInTheDocument();
  });

  it("unit selections persist across remounts", () => {
    const first = setup();
    pickAttacker(first);
    pickDefender(first);
    first.unmount();
    const second = setup();
    expect(
      second.getByLabelText(/attacker: Communal Pikemen/)
    ).toBeInTheDocument();
    expect(
      second.getByLabelText(/defender: Communal Pikemen/)
    ).toBeInTheDocument();
  });
});
