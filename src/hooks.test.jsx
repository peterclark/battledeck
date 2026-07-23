import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { usePressable } from "./hooks";

const Probe = (opts) => <button {...usePressable(opts)}>probe</button>;

describe("usePressable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("fires onTap once on a quick press", () => {
    const onTap = vi.fn();
    const onHold = vi.fn();
    render(<Probe onTap={onTap} onHold={onHold} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn);
    vi.advanceTimersByTime(100);
    fireEvent.pointerUp(btn);
    expect(onTap).toHaveBeenCalledTimes(1);
    expect(onHold).not.toHaveBeenCalled();
  });

  it("fires onHold past holdDelay and suppresses the tap", () => {
    const onTap = vi.fn();
    const onHold = vi.fn();
    render(<Probe onTap={onTap} onHold={onHold} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn);
    vi.advanceTimersByTime(450);
    fireEvent.pointerUp(btn);
    expect(onHold).toHaveBeenCalledTimes(1);
    expect(onTap).not.toHaveBeenCalled();
  });

  it("repeats onHold on the given interval while held", () => {
    const onHold = vi.fn();
    render(<Probe onHold={onHold} repeat={100} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn);
    vi.advanceTimersByTime(400); // initial hold
    vi.advanceTimersByTime(300); // three repeats
    fireEvent.pointerUp(btn);
    expect(onHold).toHaveBeenCalledTimes(4);
    vi.advanceTimersByTime(500); // released — no further repeats
    expect(onHold).toHaveBeenCalledTimes(4);
  });

  it("abandons the gesture on pointer cancel", () => {
    const onTap = vi.fn();
    const onHold = vi.fn();
    render(<Probe onTap={onTap} onHold={onHold} />);
    const btn = screen.getByRole("button");
    fireEvent.pointerDown(btn);
    fireEvent.pointerCancel(btn);
    vi.advanceTimersByTime(1000);
    expect(onHold).not.toHaveBeenCalled();
    expect(onTap).not.toHaveBeenCalled();
  });

  it("captures the pointer so a drifting thumb doesn't lose the tap", () => {
    render(<Probe onTap={vi.fn()} />);
    const btn = screen.getByRole("button");
    btn.setPointerCapture = vi.fn();
    fireEvent.pointerDown(btn, { pointerId: 7 });
    expect(btn.setPointerCapture).toHaveBeenCalledWith(7);
  });

  it("keyboard: Enter taps, arrows fire onArrowUp/onArrowDown", () => {
    const onTap = vi.fn();
    const onArrowUp = vi.fn();
    const onArrowDown = vi.fn();
    render(
      <Probe onTap={onTap} onArrowUp={onArrowUp} onArrowDown={onArrowDown} />
    );
    const btn = screen.getByRole("button");
    fireEvent.keyDown(btn, { key: "Enter" });
    expect(onTap).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(btn, { key: "ArrowUp" });
    expect(onArrowUp).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(btn, { key: "ArrowDown" });
    expect(onArrowDown).toHaveBeenCalledTimes(1);
  });
});
