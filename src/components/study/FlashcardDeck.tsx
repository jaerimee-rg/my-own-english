"use client";

import { useState } from "react";
import type { Phrase } from "@/lib/phrases/types";
import SpeakButton from "@/components/SpeakButton";

/** Flashcard study mode. Flips between English and Korean; backend-independent. */
export default function FlashcardDeck({ phrases }: { phrases: Phrase[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (phrases.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        학습할 문장이 없어요. 먼저 문장집에 문장을 추가해 주세요.
      </p>
    );
  }

  const current = phrases[index];
  const atEnd = index >= phrases.length - 1;

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => Math.min(Math.max(i + delta, 0), phrases.length - 1));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <p className="text-sm text-neutral-400" data-testid="progress">
        {index + 1} / {phrases.length}
      </p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label="카드 뒤집기"
        className="flex min-h-48 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-black/5 bg-white p-8 text-center shadow-sm active:scale-[0.99] dark:border-white/10 dark:bg-neutral-900"
      >
        <span className="text-xs uppercase tracking-wide text-neutral-400">
          {flipped ? "한국어" : "English"}
        </span>
        <span className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          {flipped ? current.korean : current.english}
        </span>
      </button>

      <div className="flex items-center gap-3">
        <SpeakButton text={current.english} />
        <span className="text-xs text-neutral-400">탭하면 뜻이 보여요</span>
      </div>

      <div className="flex w-full gap-2">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="flex-1 rounded-xl border border-neutral-300 py-2.5 disabled:opacity-40 dark:border-neutral-700"
        >
          이전
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={atEnd}
          className="flex-1 rounded-xl bg-pink-600 py-2.5 font-semibold text-white disabled:opacity-40"
        >
          다음
        </button>
      </div>
    </div>
  );
}
