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

  it("loadArmy drops unknown units and clamps stored counts", () => {
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
      })
    );
    expect(loadArmy()).toEqual({
      budget: 2000, // out-of-range budget falls back
      counts: {
        "menOfHawkshold/lancers": 3,
        "menOfHawkshold/sirSteaphensFreeCompany": 1,
      },
    });
  });
});
