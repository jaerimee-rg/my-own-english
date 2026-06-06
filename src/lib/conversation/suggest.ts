import type { GenerateDeps } from "./chat";

export type Suggestion = { english: string; note?: string };
export type SuggestResult = { suggestions: Suggestion[]; configured: boolean };

const DEFAULT_MODEL = "gpt-4.1-nano";

function hasRealKey(apiKey?: string): boolean {
  return !!apiKey && apiKey.startsWith("sk-");
}

const SYSTEM =
  "You help a Korean rhythmic-gymnastics teacher phrase classroom English. " +
  "Given a Korean sentence, return 3 natural English ways to say it to young students. " +
  'Respond ONLY with JSON: {"suggestions":[{"english":"...","note":"<short Korean nuance>"}]}.';

/** Suggest English phrasings for a Korean sentence via OpenAI (DI for testability). */
export async function generateSuggestions(
  korean: string,
  deps: GenerateDeps = {},
): Promise<SuggestResult> {
  if (!korean.trim()) return { suggestions: [], configured: hasRealKey(deps.apiKey) };

  if (!hasRealKey(deps.apiKey)) {
    return { suggestions: [], configured: false };
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
      max_tokens: 400,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: korean },
      ],
    }),
  });

  if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content ?? "";

  return { suggestions: parseSuggestions(text), configured: true };
}

/** Extract the suggestions array from the model's JSON reply, tolerantly. */
export function parseSuggestions(text: string): Suggestion[] {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { suggestions?: Suggestion[] };
    return (parsed.suggestions ?? []).filter(
      (s) => typeof s.english === "string" && s.english.trim().length > 0,
    );
  } catch {
    return [];
  }
}
