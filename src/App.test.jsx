import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, within } from "@testing-library/react";
import App from "./App";

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

  it("command cards adjust totals and Frightened clears and disables them", () => {
    const { container, dice, modifier } = setup();
    fireEvent.click(container.querySelector(".PlusOneDice"));
    expect(within(dice()).getByText("5")).toBeInTheDocument();
    expect(within(dice()).getByText("1 CC")).toBeInTheDocument();
    fireEvent.click(modifier("frightened"));
    expect(within(dice()).queryByText("1 CC")).not.toBeInTheDocument();
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
