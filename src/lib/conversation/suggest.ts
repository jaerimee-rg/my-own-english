import type { GenerateDeps } from "./chat";

export type Suggestion = { english: string; note?: string };
export type SuggestResult = { suggestions: Suggestion[]; configured: boolean };

const DEFAULT_MODEL = "claude-sonnet-4-6";
const PLACEHOLDER = "placeholder-anthropic-key";

function hasRealKey(apiKey?: string): boolean {
  return !!apiKey && apiKey !== PLACEHOLDER && apiKey.startsWith("sk-ant");
}

const SYSTEM =
  "You help a Korean rhythmic-gymnastics teacher phrase classroom English. " +
  "Given a Korean sentence, return 3 natural English ways to say it to young students. " +
  'Respond ONLY with JSON: {"suggestions":[{"english":"...","note":"<short Korean nuance>"}]}.';

/** Suggest English phrasings for a Korean sentence (DI for testability). */
export async function generateSuggestions(
  korean: string,
  deps: GenerateDeps = {},
): Promise<SuggestResult> {
  if (!korean.trim()) return { suggestions: [], configured: hasRealKey(deps.apiKey) };

  if (!hasRealKey(deps.apiKey)) {
    return { suggestions: [], configured: false };
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
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: korean }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };
  const text =
    data.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("") ?? "";

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
