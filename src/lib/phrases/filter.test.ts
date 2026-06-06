import { describe, it, expect } from "vitest";
import { filterPhrases } from "./filter";
import type { Phrase } from "./types";

function phrase(p: Partial<Phrase>): Phrase {
  return {
    id: p.id ?? "1",
    user_id: "u",
    english: p.english ?? "Point your toes",
    korean: p.korean ?? "발끝을 펴세요",
    note: p.note ?? null,
    apparatus: p.apparatus ?? null,
    situation: p.situation ?? null,
    level: p.level ?? null,
    is_favorite: p.is_favorite ?? false,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  };
}

const data: Phrase[] = [
  phrase({ id: "1", english: "Hold the ribbon", apparatus: "ribbon", level: "beginner" }),
  phrase({ id: "2", english: "Spin the hoop", korean: "후프를 돌려요", apparatus: "hoop", is_favorite: true }),
  phrase({ id: "3", english: "Great job!", situation: "praise", level: "beginner" }),
];

describe("filterPhrases", () => {
  it("returns all when no filter", () => {
    expect(filterPhrases(data, {})).toHaveLength(3);
  });

  it("matches free-text query across english/korean", () => {
    expect(filterPhrases(data, { query: "ribbon" }).map((p) => p.id)).toEqual(["1"]);
    expect(filterPhrases(data, { query: "후프" }).map((p) => p.id)).toEqual(["2"]);
  });

  it("filters by apparatus and level", () => {
    expect(filterPhrases(data, { apparatus: "hoop" }).map((p) => p.id)).toEqual(["2"]);
    expect(filterPhrases(data, { level: "beginner" }).map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("filters favorites only", () => {
    expect(filterPhrases(data, { favoritesOnly: true }).map((p) => p.id)).toEqual(["2"]);
  });

  it("combines filters (AND)", () => {
    expect(
      filterPhrases(data, { level: "beginner", apparatus: "ribbon" }).map((p) => p.id),
    ).toEqual(["1"]);
  });
});
