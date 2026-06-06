import { describe, it, expect, vi } from "vitest";
import { generateReply } from "./chat";
import { SCENARIOS, getScenario } from "./scenarios";

describe("scenarios", () => {
  it("includes free chat and falls back to it", () => {
    expect(getScenario("free")?.role).toBe("tutor");
    expect(getScenario("nope")).toBeUndefined();
    expect(SCENARIOS.length).toBeGreaterThanOrEqual(5);
  });
});

describe("generateReply", () => {
  const messages = [{ role: "user" as const, content: "Hello!" }];

  it("returns a preview notice when no real key is set", async () => {
    const out = await generateReply(messages, "greeting", {
      apiKey: "",
    });
    expect(out.configured).toBe(false);
    expect(out.reply).toMatch(/OPENAI_API_KEY/);
  });

  it("calls OpenAI and extracts text when a key is set", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hi teacher!" } }],
      }),
    });
    const out = await generateReply(messages, "greeting", {
      apiKey: "sk-test",
      fetchImpl: fetchImpl as unknown as typeof fetch,
    });
    expect(out.configured).toBe(true);
    expect(out.reply).toBe("Hi teacher!");

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain("api.openai.com");
    const sentBody = JSON.parse((init as RequestInit).body as string);
    // System prompt is prepended as the first message.
    expect(sentBody.messages[0]).toEqual({
      role: "system",
      content: getScenario("greeting")!.systemPrompt,
    });
    expect(sentBody.messages.slice(1)).toEqual(messages);
    expect(sentBody.model).toBe("gpt-4.1-nano");
  });

  it("throws on API error", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    await expect(
      generateReply(messages, "free", {
        apiKey: "sk-test",
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/500/);
  });
});
