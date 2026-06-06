import { describe, it, expect, vi } from "vitest";
import { generateSuggestions, parseSuggestions } from "./suggest";

describe("parseSuggestions", () => {
  it("extracts suggestions from JSON, ignoring surrounding text", () => {
    const text =
      'Sure! {"suggestions":[{"english":"Point your toes","note":"발끝"},{"english":"Toes pointed!"}]}';
    const out = parseSuggestions(text);
    expect(out).toHaveLength(2);
    expect(out[0].english).toBe("Point your toes");
  });

  it("drops entries without english and returns [] on bad JSON", () => {
    expect(parseSuggestions("no json here")).toEqual([]);
    expect(
      parseSuggestions('{"suggestions":[{"english":""},{"english":"Hi"}]}'),
    ).toHaveLength(1);
  });
});

describe("generateSuggestions", () => {
  it("returns not-configured without a real key", async () => {
    const out = await generateSuggestions("발끝을 펴세요", {
      apiKey: "placeholder-anthropic-key",
    });
    expect(out.configured).toBe(false);
    expect(out.suggestions).toEqual([]);
  });

  it("calls Anthropic and parses suggestions with a key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          { type: "text", text: '{"suggestions":[{"english":"Point your toes"}]}' },
        ],
      }),
    });
    const out = await generateSuggestions("발끝을 펴세요", {
      apiKey: "sk-ant-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(out.configured).toBe(true);
    expect(out.suggestions[0].english).toBe("Point your toes");
  });

  it("returns empty for blank input", async () => {
    const out = await generateSuggestions("   ", { apiKey: "sk-ant-test" });
    expect(out.suggestions).toEqual([]);
  });
});
