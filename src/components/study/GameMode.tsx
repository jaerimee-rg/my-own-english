"use client";

import { useMemo, useState } from "react";
import type { Phrase } from "@/lib/phrases/types";
import { buildMultipleChoice, checkChoice } from "@/lib/study/quiz";
import { badgesForStreak, pointsForAnswer } from "@/lib/study/game";

/** Fast streak game: keep answering correctly to build streak and earn badges. */
export default function GameMode({ phrases }: { phrases: Phrase[] }) {
  const questions = useMemo(() => buildMultipleChoice(phrases, 4), [phrases]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (phrases.length < 2) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        게임은 문장이 2개 이상일 때 즐길 수 있어요.
      </p>
    );
  }

  if (done) {
    const badges = badgesForStreak(best);
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-4xl">🏆</p>
        <p className="text-2xl font-bold">{score}점</p>
        <p className="text-sm text-neutral-500">최고 연속 {best}회</p>
        <ul className="flex flex-wrap justify-center gap-2" data-testid="badges">
          {badges.length === 0 ? (
            <li className="text-sm text-neutral-400">
              3연속부터 뱃지를 받아요!
            </li>
          ) : (
            badges.map((b) => (
              <li
                key={b.label}
                className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              >
                {b.emoji} {b.label}
              </li>
            ))
          )}
        </ul>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setScore(0);
            setStreak(0);
            setBest(0);
            setPicked(null);
            setDone(false);
          }}
          className="rounded-xl bg-pink-600 px-5 py-2.5 font-semibold text-white"
        >
          다시 도전
        </button>
      </div>
    );
  }

  const q = questions[index];
  const answered = picked !== null;

  function pick(option: string) {
    if (answered) return;
    setPicked(option);
    if (checkChoice(q, option)) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setBest((b) => Math.max(b, newStreak));
      setScore((s) => s + pointsForAnswer(newStreak));
    } else {
      setStreak(0);
    }
  }

  function next() {
    if (index >= questions.length - 1) setDone(true);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-neutral-400">
          {index + 1} / {questions.length}
        </span>
        <span className="font-semibold" data-testid="game-score">
          {score}점
        </span>
        <span className="text-pink-600" data-testid="game-streak">
          🔥 {streak}
        </span>
      </div>

      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <p className="text-xs text-neutral-400">이 뜻의 영어는?</p>
        <p className="mt-2 text-xl font-bold" data-testid="game-prompt">
          {q.prompt}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {q.options.map((opt) => {
          const isAnswer = opt === q.answer;
          const isPicked = opt === picked;
          return (
            <li key={opt}>
              <button
                type="button"
                onClick={() => pick(opt)}
                disabled={answered}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  answered && isAnswer
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : answered && isPicked
                      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                      : "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-900"
                }`}
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <button
          type="button"
          onClick={next}
          className="rounded-xl bg-pink-600 py-2.5 font-semibold text-white"
        >
          {index >= questions.length - 1 ? "결과 보기" : "다음"}
        </button>
      )}
    </div>
  );
}
