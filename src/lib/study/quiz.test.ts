import { describe, it, expect } from "vitest";
import {
  shuffle,
  buildMultipleChoice,
  checkChoice,
  buildBlank,
  checkBlank,
} from "./quiz";
import type { Phrase } from "@/lib/phrases/types";

function mk(id: string, english: string, korean: string): Phrase {
  return {
    id,
    user_id: "u",
    english,
    korean,
    note: null,
    apparatus: null,
    situation: null,
    level: null,
    is_favorite: false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };
}

// Deterministic RNG (always 0) → shuffle/distractor selection is predictable.
const zero = () => 0;

const phrases = [
  mk("1", "Point your toes", "발끝을 펴세요"),
  mk("2", "Spin the hoop", "후프를 돌려요"),
  mk("3", "Great job", "잘했어요"),
  mk("4", "Hold the ball", "공을 잡으세요"),
];

describe("shuffle", () => {
  it("keeps the same elements", () => {
    expect(shuffle([1, 2, 3], zero).sort()).toEqual([1, 2, 3]);
  });
});

describe("buildMultipleChoice", () => {
  it("creates one question per phrase with the answer included", () => {
    const qs = buildMultipleChoice(phrases, 4, zero);
    expect(qs).toHaveLength(4);
    for (const q of qs) {
      expect(q.options).toContain(q.answer);
      expect(q.options.length).toBeLessThanOrEqual(4);
      expect(new Set(q.options).size).toBe(q.options.length); // no duplicates
    }
  });

  it("checkChoice validates correctly", () => {
    const [q] = buildMultipleChoice(phrases, 4, zero);
    expect(checkChoice(q, q.answer)).toBe(true);
    expect(checkChoice(q, "wrong")).toBe(false);
  });
});

describe("buildBlank", () => {
  it("blanks the longest word", () => {
    const q = buildBlank(mk("1", "Point your toes", "발끝"));
    expect(q.masked).toBe("____ your toes");
    expect(q.answer).toBe("Point");
  });

  it("checkBlank is case- and punctuation-insensitive", () => {
    const q = buildBlank(mk("3", "Great job!", "잘했어요"));
    expect(checkBlank(q, "  GREAT ")).toBe(true);
    expect(checkBlank(q, "good")).toBe(false);
  });
});
