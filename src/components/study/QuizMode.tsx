"use client";

import { useMemo, useState } from "react";
import type { Phrase } from "@/lib/phrases/types";
import { buildMultipleChoice, checkChoice } from "@/lib/study/quiz";

/** Multiple-choice quiz: show the Korean meaning, pick the English. */
export default function QuizMode({ phrases }: { phrases: Phrase[] }) {
  const questions = useMemo(
    () => buildMultipleChoice(phrases, 4),
    [phrases],
  );
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (phrases.length < 2) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        퀴즈는 문장이 2개 이상일 때 풀 수 있어요.
      </p>
    );
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <p className="text-4xl">🎉</p>
        <p className="text-xl font-bold">
          {questions.length}문제 중 {score}개 정답!
        </p>
        <button
          type="button"
          onClick={() => {
            setIndex(0);
            setScore(0);
            setPicked(null);
            setDone(false);
          }}
          className="rounded-xl bg-pink-600 px-5 py-2.5 font-semibold text-white"
        >
          다시 풀기
        </button>
      </div>
    );
  }

  const q = questions[index];
  const answered = picked !== null;

  function pick(option: string) {
    if (answered) return;
    setPicked(option);
    if (checkChoice(q, option)) setScore((s) => s + 1);
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
      <p className="text-sm text-neutral-400" data-testid="quiz-progress">
        {index + 1} / {questions.length} · 점수 {score}
      </p>

      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <p className="text-xs text-neutral-400">이 뜻의 영어 문장은?</p>
        <p data-testid="quiz-prompt" className="mt-2 text-xl font-bold">
          {q.prompt}
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {q.options.map((opt) => {
          const isAnswer = opt === q.answer;
          const isPicked = opt === picked;
          const state = !answered
            ? "idle"
            : isAnswer
              ? "correct"
              : isPicked
                ? "wrong"
                : "idle";
          return (
            <li key={opt}>
              <button
                type="button"
                onClick={() => pick(opt)}
                disabled={answered}
                data-state={state}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  state === "correct"
                    ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                    : state === "wrong"
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
          {index >= questions.length - 1 ? "결과 보기" : "다음 문제"}
        </button>
      )}
    </div>
  );
}
