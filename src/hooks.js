import { useEffect, useRef } from "react";

// Modal conventions shared by the full-screen overlays (rules help, unit
// picker, army builder): focus moves into the overlay on open, the page
// behind is scroll-locked, focus returns to the opener on close, Tab is
// trapped inside, and Escape calls onEscape (which may pop a level or
// close). Spread `overlayProps` onto the overlay root; `overlayRef` is
// exposed for callers that need to scroll it.
export function useModalOverlay(onEscape) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const previous = document.activeElement;
    overlayRef.current?.focus();
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = bodyOverflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      onEscape();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = overlayRef.current?.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (
      e.shiftKey &&
      (document.activeElement === first ||
        document.activeElement === overlayRef.current)
    ) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return {
    overlayRef,
    overlayProps: { ref: overlayRef, tabIndex: -1, onKeyDown },
  };
}

// Pointer-based press gesture: quick press fires onTap on release; holding
// past holdDelay fires onHold instead (repeating every `repeat` ms if set).
// The pointer is captured on press so a slightly rolling thumb doesn't
// silently swallow the tap; a pointer cancel abandons the gesture.
// Keyboard: Enter/Space fire onTap; ArrowUp/ArrowDown fire the optional
// onArrowUp/onArrowDown (so hold-only actions stay reachable by keyboard).
export function usePressable({
  onTap,
  onHold,
  holdDelay = 400,
  repeat = 0,
  onArrowUp,
  onArrowDown,
}) {
  const timer = useRef(null);
  const interval = useRef(null);
  const held = useRef(false);

  const clear = () => {
    clearTimeout(timer.current);
    clearInterval(interval.current);
  };

  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // Keep receiving pointer events even if the finger drifts off the button
    e.currentTarget.setPointerCapture?.(e.pointerId);
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
      } else if (e.key === "ArrowUp" && onArrowUp) {
        e.preventDefault();
        onArrowUp();
      } else if (e.key === "ArrowDown" && onArrowDown) {
        e.preventDefault();
        onArrowDown();
      }
    },
  };
}
