import { describe, it, expect } from "vitest";
import { parseBulkPhrases } from "./bulk";

describe("parseBulkPhrases", () => {
  it("parses tab-separated lines", () => {
    const out = parseBulkPhrases(
      "Point your toes.\t발끝을 펴세요.\nHold the ribbon.\t리본을 잡으세요.",
    );
    expect(out).toEqual([
      { english: "Point your toes.", korean: "발끝을 펴세요." },
      { english: "Hold the ribbon.", korean: "리본을 잡으세요." },
    ]);
  });

  it("parses dash / slash / pipe separators", () => {
    const out = parseBulkPhrases(
      "Spin the hoop. - 후프를 돌려요.\nGreat job! / 잘했어요!\nStand tall. | 바르게 서요.",
    );
    expect(out.map((p) => p.english)).toEqual([
      "Spin the hoop.",
      "Great job!",
      "Stand tall.",
    ]);
    expect(out[0].korean).toBe("후프를 돌려요.");
  });

  it("handles korean-first delimited lines", () => {
    const out = parseBulkPhrases("발끝을 펴세요. - Point your toes.");
    expect(out[0]).toEqual({
      english: "Point your toes.",
      korean: "발끝을 펴세요.",
    });
  });

  it("splits a single line mixing both scripts (EN then KO)", () => {
    const out = parseBulkPhrases("Point your toes. 발끝을 펴세요.");
    expect(out[0]).toEqual({
      english: "Point your toes.",
      korean: "발끝을 펴세요.",
    });
  });

  it("pairs alternating English / Korean lines", () => {
    const out = parseBulkPhrases(
      "Point your toes.\n발끝을 펴세요.\nGreat job!\n잘했어요!",
    );
    expect(out).toEqual([
      { english: "Point your toes.", korean: "발끝을 펴세요." },
      { english: "Great job!", korean: "잘했어요!" },
    ]);
  });

  it("ignores blank lines and entries without a korean side", () => {
    const out = parseBulkPhrases(
      "\n\nPoint your toes.\t발끝을 펴세요.\n\nJust english no pair\n",
    );
    expect(out).toHaveLength(1);
    expect(out[0].korean).toBe("발끝을 펴세요.");
  });

  it("returns empty for empty input", () => {
    expect(parseBulkPhrases("")).toEqual([]);
    expect(parseBulkPhrases("   \n  ")).toEqual([]);
  });
});
