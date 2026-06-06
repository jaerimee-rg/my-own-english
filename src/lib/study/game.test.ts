import { describe, it, expect } from "vitest";
import { badgesForStreak, pointsForAnswer, BADGES } from "./game";

describe("game scoring", () => {
  it("awards badges by best streak", () => {
    expect(badgesForStreak(0)).toEqual([]);
    expect(badgesForStreak(3).map((b) => b.label)).toEqual(["3연속"]);
    expect(badgesForStreak(10).map((b) => b.label)).toEqual([
      "3연속",
      "5연속",
      "10연속",
    ]);
    expect(badgesForStreak(100)).toHaveLength(BADGES.length);
  });

  it("gives base points plus a capped streak bonus", () => {
    expect(pointsForAnswer(1)).toBe(10);
    expect(pointsForAnswer(2)).toBe(12);
    expect(pointsForAnswer(6)).toBe(20);
    expect(pointsForAnswer(50)).toBe(20); // capped
  });
});
