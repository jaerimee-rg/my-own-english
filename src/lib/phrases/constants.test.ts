import { describe, it, expect } from "vitest";
import { APPARATUS, SITUATIONS, LEVELS, labelFor } from "./constants";

describe("phrase constants", () => {
  it("maps a stored value to its Korean label", () => {
    expect(labelFor(APPARATUS, "ribbon")).toBe("리본");
    expect(labelFor(SITUATIONS, "praise")).toBe("칭찬");
    expect(labelFor(LEVELS, "beginner")).toBe("초급");
  });

  it("falls back to the raw value for unknown entries", () => {
    expect(labelFor(APPARATUS, "unknown")).toBe("unknown");
  });

  it("returns empty string for null/undefined", () => {
    expect(labelFor(LEVELS, null)).toBe("");
    expect(labelFor(LEVELS, undefined)).toBe("");
  });
});
