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

  const [suggestions, setSuggestions] = useState<
    { english: string; note?: string }[]
  >([]);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestNote, setSuggestNote] = useState<string | null>(null);

  function set<K extends keyof PhraseInput>(key: K, value: PhraseInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function suggest() {
    if (!form.korean.trim() || suggesting) return;
    setSuggesting(true);
    setSuggestNote(null);
    try {
      const res = await fetch("/api/suggest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ korean: form.korean }),
      });
      const data = (await res.json()) as {
        suggestions?: { english: string; note?: string }[];
        configured?: boolean;
      };
      setSuggestions(data.suggestions ?? []);
      if (!data.configured) {
        setSuggestNote("AI 제안은 ANTHROPIC_API_KEY 설정 후 사용할 수 있어요.");
      } else if ((data.suggestions ?? []).length === 0) {
        setSuggestNote("제안을 받지 못했어요. 다시 시도해 주세요.");
      }
    } catch {
      setSuggestNote("제안 요청에 실패했어요.");
    } finally {
      setSuggesting(false);
    }
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
        <button
          type="button"
          onClick={suggest}
          disabled={suggesting || !form.korean.trim()}
          className="text-sm font-medium text-pink-600 disabled:opacity-40 dark:text-pink-400"
        >
          {suggesting ? "AI가 생각 중…" : "✨ 한국어로 AI 영어 제안"}
        </button>
        {suggestNote && (
          <p className="mt-1 text-xs text-neutral-400">{suggestNote}</p>
        )}
        {suggestions.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {suggestions.map((s, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    set("english", s.english);
                    setSuggestions([]);
                  }}
                  className="w-full rounded-lg border border-pink-200 bg-pink-50/50 px-3 py-2 text-left text-sm dark:border-pink-900 dark:bg-pink-950/20"
                >
                  <span className="font-medium">{s.english}</span>
                  {s.note && (
                    <span className="block text-xs text-neutral-400">
                      {s.note}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
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
