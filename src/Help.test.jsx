import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

const openHelp = () => {
  const utils = render(<App />);
  const trigger = screen.getByLabelText("How your turn works");
  trigger.focus(); // jsdom clicks don't focus, unlike real browsers
  fireEvent.click(trigger);
  return { ...utils, trigger, dialog: () => screen.getByRole("dialog") };
};

describe("Help overlay", () => {
  it("opens with focus moved into the dialog", () => {
    const { dialog } = openHelp();
    expect(dialog()).toHaveFocus();
    expect(dialog()).toHaveAccessibleName(/Your Turn/);
  });

  it("navigates: link cards push, Escape pops, closing returns focus", () => {
    const { dialog, trigger } = openHelp();
    fireEvent.click(screen.getByText("Movement & Command"));
    expect(dialog()).toHaveAccessibleName(/Movement & Command/);
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(dialog()).toHaveAccessibleName(/Your Turn/);
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("close button closes from any depth", () => {
    openHelp();
    fireEvent.click(screen.getByText("Movement & Command"));
    fireEvent.click(screen.getByLabelText("Close help"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("traps Tab inside the overlay", () => {
    const { dialog } = openHelp();
    const buttons = dialog().querySelectorAll("button");
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    last.focus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
  });

  it("locks background scroll while open", () => {
    const { dialog } = openHelp();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(dialog(), { key: "Escape" });
    expect(document.body.style.overflow).toBe("");
  });
});
