import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, within } from "@testing-library/react";
import App from "./App";
import { saveArmy } from "./persistence";

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
    expect(container.querySelector(".ClearCommandCardModifiers")).toBeDisabled();
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
    const overlay = utils.container.querySelector(".UnitPicker");
    fireEvent.click(within(overlay).getByText(unitName));
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
    // OS 6 - DS 2 = 4 to hit; OP 5 - T 2 = 3 to wound
    expect(within(hit()).getByText("4 base")).toBeInTheDocument();
    expect(hit().querySelector(".text-6xl")).toHaveTextContent("4");
    expect(within(wound()).getByText("3 base")).toBeInTheDocument();
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
    // multiple copies list one row each, with their own damage state
    expect(within(overlay).getByText("Swordsmen #1")).toBeInTheDocument();
    expect(within(overlay).getByText("Swordsmen #2")).toBeInTheDocument();
    expect(within(overlay).getByText("Lancers")).toBeInTheDocument();
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();
    // the toggle covers enemy defenders outside the player's roster
    fireEvent.click(within(overlay).getByText("Show all units"));
    expect(within(overlay).getByText("Militia")).toBeInTheDocument();
    fireEvent.click(within(overlay).getByText("Show only my army"));
    expect(within(overlay).queryByText("Militia")).not.toBeInTheDocument();
  });

  it("with no army built the picker shows every unit and no toggle", () => {
    const utils = setup();
    fireEvent.click(utils.getByLabelText("Pick attacker unit"));
    const overlay = utils.container.querySelector(".UnitPicker");
    expect(within(overlay).getByText("Militia")).toBeInTheDocument();
    expect(
      within(overlay).queryByText("Show all units")
    ).not.toBeInTheDocument();
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
    fireEvent.click(utils.getByLabelText("Swordsmen damage box 5"));
    fireEvent.click(utils.getByLabelText("Close army builder"));
    expect(utils.modifier("inTheYellow")).toHaveClass("plate-on-blood");
    expect(
      utils.getByLabelText(/attacker: Swordsmen/)
    ).toHaveTextContent("5/10 dmg · In the Yellow");
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
