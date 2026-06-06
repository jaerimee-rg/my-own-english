"use client";

import { useState } from "react";
import type { PhraseInput } from "@/lib/phrases/types";
import {
  APPARATUS,
  SITUATIONS,
  LEVELS,
  type ApparatusValue,
  type SituationValue,
  type LevelValue,
} from "@/lib/phrases/constants";
import { validatePhraseInput } from "@/lib/phrases/validate";

const EMPTY: PhraseInput = {
  english: "",
  korean: "",
  note: "",
  apparatus: null,
  situation: null,
  level: null,
  is_favorite: false,
};

export default function PhraseForm({
  initial,
  onSubmit,
  onCancel,
  submitting = false,
}: {
  initial?: Partial<PhraseInput>;
  onSubmit: (input: PhraseInput) => void;
  onCancel?: () => void;
  submitting?: boolean;
}) {
  const [form, setForm] = useState<PhraseInput>({ ...EMPTY, ...initial });
  const [errors, setErrors] =
    useState<ReturnType<typeof validatePhraseInput>["errors"]>({});

  function set<K extends keyof PhraseInput>(key: K, value: PhraseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = validatePhraseInput(form);
    if (!result.valid) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    onSubmit(form);
  }

  const field =
    "w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-50";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="english" className="mb-1 block text-sm font-medium">
          영어 문장
        </label>
        <input
          id="english"
          className={field}
          value={form.english}
          onChange={(e) => set("english", e.target.value)}
          placeholder="Point your toes"
        />
        {errors.english && (
          <p role="alert" className="mt-1 text-sm text-red-500">
            {errors.english}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="korean" className="mb-1 block text-sm font-medium">
          한국어 뜻
        </label>
        <input
          id="korean"
          className={field}
          value={form.korean}
          onChange={(e) => set("korean", e.target.value)}
          placeholder="발끝을 펴세요"
        />
        {errors.korean && (
          <p role="alert" className="mt-1 text-sm text-red-500">
            {errors.korean}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-sm font-medium">
          메모 (선택)
        </label>
        <input
          id="note"
          className={field}
          value={form.note ?? ""}
          onChange={(e) => set("note", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label htmlFor="apparatus" className="mb-1 block text-sm font-medium">
            소도구
          </label>
          <select
            id="apparatus"
            className={field}
            value={form.apparatus ?? ""}
            onChange={(e) =>
              set("apparatus", (e.target.value || null) as ApparatusValue | null)
            }
          >
            <option value="">-</option>
            {APPARATUS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="situation" className="mb-1 block text-sm font-medium">
            상황
          </label>
          <select
            id="situation"
            className={field}
            value={form.situation ?? ""}
            onChange={(e) =>
              set("situation", (e.target.value || null) as SituationValue | null)
            }
          >
            <option value="">-</option>
            {SITUATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="level" className="mb-1 block text-sm font-medium">
            난이도
          </label>
          <select
            id="level"
            className={field}
            value={form.level ?? ""}
            onChange={(e) =>
              set("level", (e.target.value || null) as LevelValue | null)
            }
          >
            <option value="">-</option>
            {LEVELS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.is_favorite ?? false}
          onChange={(e) => set("is_favorite", e.target.checked)}
        />
        즐겨찾기
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 rounded-xl bg-pink-600 py-2.5 font-semibold text-white transition active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? "저장 중…" : "저장"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-neutral-300 px-4 py-2.5 dark:border-neutral-700"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}
