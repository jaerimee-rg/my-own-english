import type { Phrase } from "./types";

export type PhraseFilter = {
  query?: string;
  apparatus?: string | null;
  situation?: string | null;
  level?: string | null;
  favoritesOnly?: boolean;
};

/**
 * Filter phrases by free-text query (English/Korean/note) and category axes.
 * Pure function — easy to unit test and reuse on client or server.
 */
export function filterPhrases(
  phrases: Phrase[],
  filter: PhraseFilter,
): Phrase[] {
  const q = filter.query?.trim().toLowerCase();

  return phrases.filter((p) => {
    if (filter.favoritesOnly && !p.is_favorite) return false;
    if (filter.apparatus && p.apparatus !== filter.apparatus) return false;
    if (filter.situation && p.situation !== filter.situation) return false;
    if (filter.level && p.level !== filter.level) return false;

    if (q) {
      const haystack = `${p.english} ${p.korean} ${p.note ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}
