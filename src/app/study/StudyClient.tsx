"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listPhrases } from "@/lib/phrases/repo";
import type { Phrase } from "@/lib/phrases/types";
import FlashcardDeck from "@/components/study/FlashcardDeck";
import QuizMode from "@/components/study/QuizMode";
import BlankQuizMode from "@/components/study/BlankQuizMode";
import GameMode from "@/components/study/GameMode";

type Mode =
  | "menu"
  | "flashcard"
  | "quizMenu"
  | "quizChoice"
  | "quizBlank"
  | "game";

const MODES = [
  { key: "flashcard", icon: "🃏", label: "플래시카드", ready: true },
  { key: "quizMenu", icon: "❓", label: "퀴즈", ready: true },
  { key: "game", icon: "🎮", label: "게임", ready: true },
  { key: "image", icon: "🖼️", label: "이미지 연결", ready: false },
] as const;

const TITLE: Record<Exclude<Mode, "menu" | "quizMenu">, string> = {
  flashcard: "플래시카드",
  quizChoice: "객관식 퀴즈",
  quizBlank: "빈칸 채우기",
  game: "게임",
};

const NEEDS_PHRASES: Mode[] = [
  "flashcard",
  "quizChoice",
  "quizBlank",
  "game",
];

export default function StudyClient() {
  const supabase = useMemo(() => createClient(), []);
  const [mode, setMode] = useState<Mode>("menu");
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPhrases(await listPhrases(supabase));
    } catch {
      setPhrases([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (NEEDS_PHRASES.includes(mode)) void load();
  }, [mode, load]);

  // Quiz type chooser
  if (mode === "quizMenu") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMode("menu")}
          className="mb-4 text-sm text-neutral-500"
        >
          ← 모드 선택
        </button>
        <h1 className="mb-6 text-xl font-bold">퀴즈 유형</h1>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setMode("quizChoice")}
            className="rounded-2xl border border-black/5 bg-white p-5 text-left font-semibold shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            ❓ 객관식 — 뜻 보고 영어 고르기
          </button>
          <button
            type="button"
            onClick={() => setMode("quizBlank")}
            className="rounded-2xl border border-black/5 bg-white p-5 text-left font-semibold shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            ✏️ 빈칸 채우기 — 단어 직접 입력
          </button>
        </div>
      </div>
    );
  }

  if (mode !== "menu") {
    return (
      <div>
        <button
          type="button"
          onClick={() =>
            setMode(
              mode === "quizChoice" || mode === "quizBlank" ? "quizMenu" : "menu",
            )
          }
          className="mb-4 text-sm text-neutral-500"
        >
          ← 뒤로
        </button>
        <h1 className="mb-6 text-xl font-bold">
          {TITLE[mode as keyof typeof TITLE]}
        </h1>
        {loading ? (
          <p className="py-12 text-center text-sm text-neutral-400">
            불러오는 중…
          </p>
        ) : mode === "flashcard" ? (
          <FlashcardDeck phrases={phrases} />
        ) : mode === "quizChoice" ? (
          <QuizMode phrases={phrases} />
        ) : mode === "quizBlank" ? (
          <BlankQuizMode phrases={phrases} />
        ) : (
          <GameMode phrases={phrases} />
        )}
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">학습</h1>
        <p className="text-sm text-neutral-500">
          플래시카드 · 퀴즈 · 이미지 연결 · 게임
        </p>
      </header>
      <ul className="grid grid-cols-2 gap-3">
        {MODES.map((m) => (
          <li key={m.key}>
            <button
              type="button"
              disabled={!m.ready}
              onClick={() => m.ready && setMode(m.key as Mode)}
              className="flex w-full flex-col items-start gap-2 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900"
            >
              <span aria-hidden className="text-3xl">
                {m.icon}
              </span>
              <span className="font-semibold">{m.label}</span>
              {!m.ready && <span className="text-xs text-neutral-400">곧</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
