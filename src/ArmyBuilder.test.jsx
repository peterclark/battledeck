import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, within } from "@testing-library/react";
import ArmyBuilder from "./ArmyBuilder";
import { loadArmy } from "./persistence";

const setup = () => {
  const utils = render(<ArmyBuilder onClose={vi.fn()} />);
  const summary = () => utils.container.querySelector(".ArmySummary");
  const add = (name) => fireEvent.click(utils.getByLabelText(`Add one ${name}`));
  const remove = (name) =>
    fireEvent.click(utils.getByLabelText(`Remove one ${name}`));
  return { ...utils, summary, add, remove };
};

describe("ArmyBuilder", () => {
  it("starts empty with a 2000 point budget and 4 Command Actions", () => {
    const { summary } = setup();
    expect(within(summary()).getByText("0")).toBeInTheDocument();
    expect(within(summary()).getByText("2000")).toBeInTheDocument();
    expect(within(summary()).getByText("2000 pts left")).toBeInTheDocument();
    expect(
      within(summary()).getByLabelText("4 Command Actions per turn")
    ).toHaveTextContent("4");
  });

  it("adding and removing units updates the totals", () => {
    const { summary, add, remove } = setup();
    add("Swordsmen"); // 197
    add("Swordsmen");
    add("Militia"); // 115
    expect(within(summary()).getByText("509")).toBeInTheDocument();
    expect(within(summary()).getByText("1491 pts left")).toBeInTheDocument();
    remove("Militia");
    expect(within(summary()).getByText("394")).toBeInTheDocument();
    expect(
      within(summary()).queryByText(/over by/)
    ).not.toBeInTheDocument();
  });

  it("shows how far over budget the roster is", () => {
    const { summary, add, getByLabelText } = setup();
    const lower = getByLabelText("Lower budget by 250");
    for (let i = 0; i < 6; i += 1) fireEvent.click(lower); // 2000 -> 500
    expect(within(summary()).getByText("500")).toBeInTheDocument();
    expect(
      within(summary()).getByLabelText("1 Command Actions per turn")
    ).toBeInTheDocument();
    add("Knights"); // 413
    add("Militia"); // 115 -> 528, over by 28
    expect(within(summary()).getByText("over by 28")).toBeInTheDocument();
  });

  it("clamps the budget to its floor", () => {
    const { getByLabelText } = setup();
    const lower = getByLabelText("Lower budget by 250");
    for (let i = 0; i < 12; i += 1) fireEvent.click(lower);
    expect(lower).toBeDisabled(); // stuck at 500, not below
  });

  it("caps Unique units at one copy", () => {
    const { add, getByLabelText } = setup();
    add("Sir Steaphen's Free Company");
    expect(
      getByLabelText("Add one Sir Steaphen's Free Company")
    ).toBeDisabled();
    expect(
      getByLabelText("Add one Swordsmen")
    ).toBeEnabled();
  });

  it("clear requires a second tap and empties the roster", () => {
    const { summary, add, getByText } = setup();
    add("Peasant Mob");
    fireEvent.click(getByText("Clear army"));
    expect(within(summary()).getByText("70")).toBeInTheDocument(); // armed, not cleared
    fireEvent.click(getByText("Tap again to clear"));
    expect(within(summary()).getByText("0")).toBeInTheDocument();
  });

  it("persists the roster and budget across remounts", () => {
    const first = setup();
    first.add("Lancers");
    first.add("Lancers");
    fireEvent.click(first.getByLabelText("Raise budget by 250"));
    first.unmount();
    const second = setup();
    expect(
      within(second.summary()).getByText("480")
    ).toBeInTheDocument(); // 2 x 240
    expect(within(second.summary()).getByText("2250")).toBeInTheDocument();
    expect(
      second.getByLabelText("2 Lancers in army")
    ).toBeInTheDocument();
  });

  it("loadArmy drops unknown units and clamps stored counts and marks", () => {
    localStorage.setItem(
      "battledeck-army-v1",
      JSON.stringify({
        budget: 99999,
        counts: {
          "menOfHawkshold/lancers": 3,
          "menOfHawkshold/sirSteaphensFreeCompany": 5, // unique: clamp to 1
          "menOfHawkshold/retiredUnit": 2, // gone from the data: drop
          "menOfHawkshold/militia": "many", // not a number: drop
        },
        marks: {
          // lancers have 6 boxes: 99 clamps down, -2 clamps up, missing
          // copies fill with 0
          "menOfHawkshold/lancers": [99, -2],
          "menOfHawkshold/retiredUnit": [1],
        },
      })
    );
    expect(loadArmy()).toEqual({
      budget: 2000, // out-of-range budget falls back
      counts: {
        "menOfHawkshold/lancers": 3,
        "menOfHawkshold/sirSteaphensFreeCompany": 1,
      },
      marks: {
        "menOfHawkshold/lancers": [6, 0, 0],
        "menOfHawkshold/sirSteaphensFreeCompany": [0],
      },
      // no stored per-turn state, so every fielded copy starts unraised
      reanimated: {
        "menOfHawkshold/lancers": [false, false, false],
        "menOfHawkshold/sirSteaphensFreeCompany": [false],
      },
    });
  });

  it("marking damage walks the copy through yellow, red, and destroyed", () => {
    const { add, getByLabelText, queryByText, getByText } = setup();
    add("Swordsmen"); // 5/2/3 damage track
    expect(queryByText("In the Yellow")).not.toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 5"));
    expect(getByText("In the Yellow")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 7"));
    expect(getByText("In the Red")).toBeInTheDocument();
    fireEvent.click(getByLabelText("Swordsmen damage box 10"));
    expect(getByText("Destroyed")).toBeInTheDocument();
    // tapping the last marked box heals it back off
    fireEvent.click(getByLabelText("Swordsmen damage box 10"));
    expect(getByText("In the Red")).toBeInTheDocument();
  });

  it("each fielded copy tracks damage separately and persists", () => {
    const first = setup();
    first.add("Lancers");
    first.add("Lancers");
    fireEvent.click(first.getByLabelText("Lancers #2 damage box 3"));
    expect(first.getByText("In the Yellow")).toBeInTheDocument(); // 3/2/1 track
    first.unmount();
    const second = setup();
    // copy #1 untouched, copy #2 still in the yellow
    expect(second.getByLabelText("Lancers #1 damage box 3")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(second.getByLabelText("Lancers #2 damage box 3")).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("reanimating heals one damage and locks the unit until the next turn", () => {
    const utils = setup();
    utils.add("Zombies"); // Lesser Undead: 1 CA, 2/2/2 track
    const reanimate = () => utils.getByLabelText(/Reanimate Zombies/);
    // nothing to heal yet
    expect(utils.getByLabelText(/already Reanimated|Reanimate Zombies/))
      .toBeDisabled();
    fireEvent.click(utils.getByLabelText("Zombies damage box 4"));
    expect(utils.getByText("In the Red")).toBeInTheDocument();

    fireEvent.click(reanimate());
    // one box healed: 3 marked leaves it In the Yellow
    expect(utils.getByText("In the Yellow")).toBeInTheDocument();
    // and the copy is locked for the rest of the turn
    expect(
      utils.getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
    expect(
      within(utils.container.querySelector(".ReanimateTally")).getByText("1 CA")
    ).toBeInTheDocument();

    fireEvent.click(utils.getByText("New turn"));
    expect(utils.container.querySelector(".ReanimateTally")).not.toBeInTheDocument();
    expect(reanimate()).toBeEnabled();
  });

  it("costs follow the classification and destroyed units can't be raised", () => {
    const utils = setup();
    utils.add("Death Knights"); // Greater Undead: 3 CA, 3/2/2 track
    fireEvent.click(utils.getByLabelText("Death Knights damage box 3"));
    expect(
      utils.getByLabelText("Reanimate Death Knights for 3 Command Actions")
    ).toBeEnabled();
    // destroyed: every box marked, so it is beyond Reanimating
    fireEvent.click(utils.getByLabelText("Death Knights damage box 7"));
    expect(utils.getByText("Destroyed")).toBeInTheDocument();
    expect(
      utils.getByLabelText(/Reanimate Death Knights/)
    ).toBeDisabled();
  });

  it("units without an Undead classification get no Reanimate button", () => {
    const utils = setup();
    utils.add("Swarm of Rats"); // Undead army, but no classification
    utils.add("Swordsmen");
    fireEvent.click(utils.getByLabelText("Swarm of Rats damage box 2"));
    expect(utils.container.querySelectorAll(".Reanimate")).toHaveLength(0);
  });

  it("the once-per-turn lock survives a remount", () => {
    const first = setup();
    first.add("Zombies");
    fireEvent.click(first.getByLabelText("Zombies damage box 2"));
    fireEvent.click(first.getByLabelText(/Reanimate Zombies/));
    first.unmount();
    const second = setup();
    expect(
      second.getByLabelText("Zombies already Reanimated this turn")
    ).toBeDisabled();
  });

  it("removing a copy drops its damage track", () => {
    const { add, remove, getByLabelText, queryByLabelText } = setup();
    add("Lancers");
    add("Lancers");
    fireEvent.click(getByLabelText("Lancers #2 damage box 1"));
    remove("Lancers");
    expect(queryByLabelText(/Lancers #2/)).not.toBeInTheDocument();
    // the remaining copy is the unmarked first one
    expect(getByLabelText("Lancers damage box 1")).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  });
});
