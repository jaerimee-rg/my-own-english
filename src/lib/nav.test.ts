import { describe, it, expect } from "vitest";
import { NAV_ITEMS } from "./nav";

describe("NAV_ITEMS", () => {
  it("exposes the five main destinations", () => {
    expect(NAV_ITEMS.map((i) => i.href)).toEqual([
      "/",
      "/phrases",
      "/study",
      "/conversation",
      "/settings",
    ]);
  });

  it("gives every item a non-empty label and icon", () => {
    for (const item of NAV_ITEMS) {
      expect(item.label.length).toBeGreaterThan(0);
      expect(item.icon.length).toBeGreaterThan(0);
    }
  });
});
