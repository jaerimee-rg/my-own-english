"use client";

import type { Phrase } from "@/lib/phrases/types";
import { APPARATUS, SITUATIONS, LEVELS, labelFor } from "@/lib/phrases/constants";
import SpeakButton from "@/components/SpeakButton";

export default function PhraseCard({
  phrase,
  onToggleFavorite,
  onEdit,
  onDelete,
}: {
  phrase: Phrase;
  onToggleFavorite?: (phrase: Phrase) => void;
  onEdit?: (phrase: Phrase) => void;
  onDelete?: (phrase: Phrase) => void;
}) {
  const chips = [
    labelFor(APPARATUS, phrase.apparatus),
    labelFor(SITUATIONS, phrase.situation),
    labelFor(LEVELS, phrase.level),
  ].filter(Boolean);

  return (
    <article className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">
          {phrase.english}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          <SpeakButton text={phrase.english} />
          <button
            type="button"
            aria-label={phrase.is_favorite ? "즐겨찾기 해제" : "즐겨찾기"}
            aria-pressed={phrase.is_favorite}
            onClick={() => onToggleFavorite?.(phrase)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-lg transition active:scale-95"
          >
            <span aria-hidden>{phrase.is_favorite ? "⭐" : "☆"}</span>
          </button>
        </div>
      </div>

      <p className="mt-1 text-neutral-600 dark:text-neutral-300">{phrase.korean}</p>
      {phrase.note && (
        <p className="mt-1 text-sm text-neutral-400">{phrase.note}</p>
      )}

      {chips.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <li
              key={c}
              className="rounded-full bg-pink-50 px-2.5 py-0.5 text-xs font-medium text-pink-700 dark:bg-pink-950/40 dark:text-pink-300"
            >
              {c}
            </li>
          ))}
        </ul>
      )}

      {(onEdit || onDelete) && (
        <div className="mt-3 flex gap-3 text-sm">
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(phrase)}
              className="text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(phrase)}
              className="text-red-500 hover:text-red-700"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </article>
  );
}
