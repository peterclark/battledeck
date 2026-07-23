import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Auto-cleanup normally hooks into a global afterEach, which we don't expose
// (vitest globals are off) — so register it here.
afterEach(cleanup);

// jsdom doesn't implement element scrolling; Help calls scrollTo on page change
if (!Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}
