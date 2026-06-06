import type { GenerateDeps } from "@/lib/conversation/chat";
import type { PhraseInput } from "./types";
import { parseBulkPhrases } from "./bulk";

export type BulkParseResult = {
  phrases: PhraseInput[];
  source: "ai" | "local";
};

const DEFAULT_MODEL = "gpt-4.1-nano";

function hasRealKey(apiKey?: string): boolean {
  return !!apiKey && apiKey.startsWith("sk-");
}

const SYSTEM =
  "You split pasted text containing Korean and English rhythmic-gymnastics teaching phrases into pairs. " +
  "Each item must have an English sentence and its Korean meaning. Preserve the original wording; do not invent phrases. " +
  'Respond ONLY with JSON: {"phrases":[{"english":"...","korean":"..."}]}.';

/**
 * Parse pasted bulk text into phrase pairs. Uses OpenAI for flexible/messy
 * input when a key is configured; otherwise (or on failure) uses the
 * deterministic local parser. DI for testability.
 */
export async function bulkParse(
  text: string,
  deps: GenerateDeps = {},
): Promise<BulkParseResult> {
  const local = parseBulkPhrases(text);

  if (!text.trim() || !hasRealKey(deps.apiKey)) {
    return { phrases: local, source: "local" };
  }

  try {
    const doFetch = deps.fetchImpl ?? fetch;
    const res = await doFetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${deps.apiKey!}`,
      },
      body: JSON.stringify({
        model: deps.model ?? DEFAULT_MODEL,
        max_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: text },
        ],
      }),
    });
    if (!res.ok) throw new Error(`OpenAI API error: ${res.status}`);
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const parsed = extractPhrases(data.choices?.[0]?.message?.content ?? "");
    // Fall back to local if the model returned nothing usable.
    return parsed.length > 0
      ? { phrases: parsed, source: "ai" }
      : { phrases: local, source: "local" };
  } catch {
    return { phrases: local, source: "local" };
  }
}

/** Extract the phrases array from the model's JSON reply, tolerantly. */
export function extractPhrases(textOrJson: string): PhraseInput[] {
  const match = textOrJson.match(/\{[\s\S]*\}/);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[0]) as { phrases?: PhraseInput[] };
    return (parsed.phrases ?? [])
      .map((p) => ({
        english: String(p.english ?? "").trim(),
        korean: String(p.korean ?? "").trim(),
      }))
      .filter((p) => p.english && p.korean);
  } catch {
    return [];
  }
}
