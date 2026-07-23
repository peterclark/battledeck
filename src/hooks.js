import { useRef } from "react";

// Pointer-based press gesture: quick press fires onTap on release; holding
// past holdDelay fires onHold instead (repeating every `repeat` ms if set).
// Moving off the button or a pointer cancel abandons the gesture.
export function usePressable({ onTap, onHold, holdDelay = 400, repeat = 0 }) {
  const timer = useRef(null);
  const interval = useRef(null);
  const held = useRef(false);

  const clear = () => {
    clearTimeout(timer.current);
    clearInterval(interval.current);
  };

  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    held.current = false;
    if (!onHold) return;
    timer.current = setTimeout(() => {
      held.current = true;
      onHold();
      if (repeat) interval.current = setInterval(onHold, repeat);
    }, holdDelay);
  };

  const up = () => {
    clear();
    if (!held.current) onTap?.();
    held.current = false;
  };

  const cancel = () => {
    clear();
    held.current = false;
  };

  return {
    onPointerDown: down,
    onPointerUp: up,
    onPointerLeave: cancel,
    onPointerCancel: cancel,
    onContextMenu: (e) => e.preventDefault(),
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onTap?.();
      }
    },
  };
}
