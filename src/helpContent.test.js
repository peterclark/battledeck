import { describe, expect, it } from "vitest";
import { HELP_PAGES, HELP_ROOT } from "./helpContent";

// Link cards render the *target* page's title and icon, so every page needs
// both, and every link must resolve — a typo'd id would crash the overlay.
describe("help content integrity", () => {
  const pageIds = Object.keys(HELP_PAGES);

  it("has a root page", () => {
    expect(HELP_PAGES[HELP_ROOT]).toBeDefined();
  });

  it("every page has a title and an icon", () => {
    for (const [id, page] of Object.entries(HELP_PAGES)) {
      expect(page.title, `${id} needs a title`).toBeTruthy();
      expect(typeof page.icon, `${id} needs an icon`).toBe("function");
    }
  });

  it("every link resolves to a real page and carries a note", () => {
    for (const [id, page] of Object.entries(HELP_PAGES)) {
      for (const link of page.links ?? []) {
        expect(pageIds, `${id} links to unknown "${link.to}"`).toContain(
          link.to
        );
        expect(link.note, `${id} -> ${link.to} needs a note`).toBeTruthy();
      }
    }
  });

  it("every page is reachable from the root", () => {
    const seen = new Set([HELP_ROOT]);
    const queue = [HELP_ROOT];
    while (queue.length) {
      const page = HELP_PAGES[queue.shift()];
      for (const { to } of page.links ?? []) {
        if (!seen.has(to)) {
          seen.add(to);
          queue.push(to);
        }
      }
    }
    expect([...seen].sort()).toEqual(pageIds.sort());
  });
});
