import { describe, it, expect, vi } from "vitest";
import { bulkParse, extractPhrases } from "./aiBulk";

describe("extractPhrases", () => {
  it("pulls phrases out of JSON, trimming and dropping incomplete", () => {
    const out = extractPhrases(
      'ok {"phrases":[{"english":" Hi ","korean":"안녕"},{"english":"x"}]}',
    );
    expect(out).toEqual([{ english: "Hi", korean: "안녕" }]);
  });

  it("returns [] on non-JSON", () => {
    expect(extractPhrases("nope")).toEqual([]);
  });
});

describe("bulkParse", () => {
  const text = "Point your toes.\t발끝을 펴세요.";

  it("uses the local parser when no key is set", async () => {
    const out = await bulkParse(text, { apiKey: "" });
    expect(out.source).toBe("local");
    expect(out.phrases).toEqual([
      { english: "Point your toes.", korean: "발끝을 펴세요." },
    ]);
  });

  it("uses OpenAI when a key is set", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                '{"phrases":[{"english":"Point your toes.","korean":"발끝"},{"english":"Great job","korean":"잘했어요"}]}',
            },
          },
        ],
      }),
    });
    const out = await bulkParse(text, {
      apiKey: "sk-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(out.source).toBe("ai");
    expect(out.phrases).toHaveLength(2);
    expect(fetchImpl.mock.calls[0][0]).toContain("api.openai.com");
  });

  it("falls back to local when the API errors", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const out = await bulkParse(text, {
      apiKey: "sk-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(out.source).toBe("local");
    expect(out.phrases).toHaveLength(1);
  });
});
