"use client";

import { useMemo, useState } from "react";
import type { Phrase } from "@/lib/phrases/types";
import { buildBlank, checkBlank } from "@/lib/study/quiz";
import SpeakButton from "@/components/SpeakButton";

/** Fill-in-the-blank quiz: type the missing word of the English sentence. */
export default function BlankQuizMode({ phrases }: { phrases: Phrase[] }) {
  const questions = useMemo(() => phrases.map(buildBlank), [phrases]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState("");
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (phrases.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-neutral-400">
        학습할 문장이 없어요. 먼저 문장집에 문장을 추가해 주세요.
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
            setInput("");
            setChecked(false);
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
  const correct = checked && checkBlank(q, input);

  function submit() {
    if (checked) return;
    setChecked(true);
    if (checkBlank(q, input)) setScore((s) => s + 1);
  }

  function next() {
    if (index >= questions.length - 1) setDone(true);
    else {
      setIndex((i) => i + 1);
      setInput("");
      setChecked(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-neutral-400" data-testid="blank-progress">
        {index + 1} / {questions.length} · 점수 {score}
      </p>

      <div className="rounded-2xl border border-black/5 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-neutral-900">
        <p className="text-sm text-neutral-400">{q.korean}</p>
        <p className="mt-2 text-xl font-bold" data-testid="blank-masked">
          {q.masked}
        </p>
        <div className="mt-2 flex justify-center">
          <SpeakButton text={q.answer} />
        </div>
      </div>

      <input
        aria-label="빈칸 답"
        className="w-full rounded-xl border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-900"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        disabled={checked}
        placeholder="빈칸에 들어갈 단어"
      />

      {checked && (
        <p
          role="status"
          className={`text-center font-medium ${
            correct ? "text-green-600" : "text-red-600"
          }`}
        >
          {correct ? "정답! 🎉" : `정답: ${q.answer}`}
        </p>
      )}

      {checked ? (
        <button
          type="button"
          onClick={next}
          className="rounded-xl bg-pink-600 py-2.5 font-semibold text-white"
        >
          {index >= questions.length - 1 ? "결과 보기" : "다음 문제"}
        </button>
      ) : (
        <button
          type="button"
          onClick={submit}
          className="rounded-xl border border-neutral-300 py-2.5 font-semibold dark:border-neutral-700"
        >
          확인
        </button>
      )}
    </div>
  );
}
