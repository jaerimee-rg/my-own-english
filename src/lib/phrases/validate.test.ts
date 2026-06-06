import { describe, it, expect } from "vitest";
import { validatePhraseInput, normalizePhraseInput } from "./validate";

describe("validatePhraseInput", () => {
  it("requires english and korean", () => {
    const r = validatePhraseInput({ english: "", korean: "" });
    expect(r.valid).toBe(false);
    expect(r.errors.english).toBeTruthy();
    expect(r.errors.korean).toBeTruthy();
  });

  it("passes with both fields", () => {
    const r = validatePhraseInput({ english: "Hi", korean: "안녕" });
    expect(r.valid).toBe(true);
    expect(r.errors).toEqual({});
  });

  it("treats whitespace-only as missing", () => {
    const r = validatePhraseInput({ english: "   ", korean: "안녕" });
    expect(r.valid).toBe(false);
    expect(r.errors.english).toBeTruthy();
  });
});

describe("normalizePhraseInput", () => {
  it("trims and converts empty optionals to null", () => {
    const out = normalizePhraseInput({
      english: "  Hello  ",
      korean: "  안녕  ",
      note: "   ",
    });
    expect(out.english).toBe("Hello");
    expect(out.korean).toBe("안녕");
    expect(out.note).toBeNull();
    expect(out.is_favorite).toBe(false);
  });
});
