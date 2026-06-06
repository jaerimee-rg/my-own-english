import { getScenario } from "./scenarios";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type GenerateDeps = {
  apiKey?: string;
  fetchImpl?: typeof fetch;
  model?: string;
};

export type GenerateResult = { reply: string; configured: boolean };

const DEFAULT_MODEL = "gpt-4.1-nano";

function hasRealKey(apiKey?: string): boolean {
  return !!apiKey && apiKey.startsWith("sk-");
}

/**
 * Generate an assistant reply for a conversation scenario via the OpenAI API.
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
        "AI 대화는 OPENAI_API_KEY를 설정하면 켜져요. 지금은 미리보기 모드예요. (설정 후 실제 영어 대화가 가능합니다.)",
    };
  }

  const doFetch = deps.fetchImpl ?? fetch;
  const res = await doFetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${deps.apiKey!}`,
    },
    body: JSON.stringify({
      model: deps.model ?? DEFAULT_MODEL,
      max_tokens: 300,
      messages: [{ role: "system", content: scenario.systemPrompt }, ...messages],
    }),
  });

  if (!res.ok) {
    throw new Error(`OpenAI API error: ${res.status}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content?.trim() ?? "";

  return { configured: true, reply };
}
