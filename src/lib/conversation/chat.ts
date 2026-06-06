import { getScenario } from "./scenarios";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type GenerateDeps = {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  model?: string;
};

export type GenerateResult = { reply: string; configured: boolean };

const DEFAULT_MODEL = "claude-sonnet-4-6";
const PLACEHOLDER = "placeholder-anthropic-key";

function hasRealKey(apiKey?: string): boolean {
  return !!apiKey && apiKey !== PLACEHOLDER && apiKey.startsWith("sk-ant");
}

/**
 * Generate an assistant reply for a conversation scenario.
 * Dependency-injected so it can be unit-tested without network access.
 * When no real API key is configured, returns a friendly notice instead.
 */
export async function generateReply(
  messages: ChatMessage[],
  scenarioId: string,
  deps: GenerateDeps = {},
): Promise<GenerateResult> {
  const scenario = getScenario(scenarioId) ?? getScenario("free")!;

  if (!hasRealKey(deps.apiKey)) {
    return {
      configured: false,
      reply:
        "AI 대화는 ANTHROPIC_API_KEY를 설정하면 켜져요. 지금은 미리보기 모드예요. (설정 후 실제 영어 대화가 가능합니다.)",
    };
  }

  const doFetch = deps.fetchImpl ?? fetch;
  const res = await doFetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": deps.apiKey!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: deps.model ?? DEFAULT_MODEL,
      max_tokens: 300,
      system: scenario.systemPrompt,
      messages,
    }),
  });

  if (!res.ok) {
    throw new Error(`Anthropic API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const reply =
    data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim() ?? "";

  return { configured: true, reply };
}
