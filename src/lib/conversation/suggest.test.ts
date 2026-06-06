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
    const out = await generateSuggestions("발끝을 펴세요", { apiKey: "" });
    expect(out.configured).toBe(false);
    expect(out.suggestions).toEqual([]);
  });

  it("calls OpenAI and parses suggestions with a key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: '{"suggestions":[{"english":"Point your toes"}]}',
            },
          },
        ],
      }),
    });
    const out = await generateSuggestions("발끝을 펴세요", {
      apiKey: "sk-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(out.configured).toBe(true);
    expect(out.suggestions[0].english).toBe("Point your toes");

    const [url] = fetchImpl.mock.calls[0];
    expect(url).toContain("api.openai.com");
  });

  it("returns empty for blank input", async () => {
    const out = await generateSuggestions("   ", { apiKey: "sk-test" });
    expect(out.suggestions).toEqual([]);
  });
});
