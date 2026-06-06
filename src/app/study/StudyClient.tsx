"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { listPhrases } from "@/lib/phrases/repo";
import type { Phrase } from "@/lib/phrases/types";
import FlashcardDeck from "@/components/study/FlashcardDeck";

type Mode = "menu" | "flashcard";

const MODES = [
  { key: "flashcard", icon: "🃏", label: "플래시카드", ready: true },
  { key: "quiz", icon: "❓", label: "퀴즈", ready: false },
  { key: "image", icon: "🖼️", label: "이미지 연결", ready: false },
  { key: "game", icon: "🎮", label: "게임", ready: false },
] as const;

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
    if (mode === "flashcard") void load();
  }, [mode, load]);

  if (mode === "flashcard") {
    return (
      <div>
        <button
          type="button"
          onClick={() => setMode("menu")}
          className="mb-4 text-sm text-neutral-500"
        >
          ← 모드 선택
        </button>
        <h1 className="mb-6 text-xl font-bold">플래시카드</h1>
        {loading ? (
          <p className="py-12 text-center text-sm text-neutral-400">
            불러오는 중…
          </p>
        ) : (
          <FlashcardDeck phrases={phrases} />
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
              onClick={() => m.ready && setMode("flashcard")}
              className="flex w-full flex-col items-start gap-2 rounded-2xl border border-black/5 bg-white p-5 text-left shadow-sm transition active:scale-[0.98] disabled:opacity-50 dark:border-white/10 dark:bg-neutral-900"
            >
              <span aria-hidden className="text-3xl">
                {m.icon}
              </span>
              <span className="font-semibold">{m.label}</span>
              {!m.ready && (
                <span className="text-xs text-neutral-400">곧</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
